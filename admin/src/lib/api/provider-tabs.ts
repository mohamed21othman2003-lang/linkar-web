// تبويبات ملف المزوّد المؤجّلة (القسم 15) + أرقام تبويب «الفروع».
// القسم 1.5: الحجوزات والتحليلات والمستحقات والجودة = «الشكل فقط بلا بيانات» في المرحلة الأولى — الدوال هنا بترجع
// نفس شكل رد الخادم بقوائم فاضية وأرقام صفر، ولما الخادم يجهز يتغيّر جسم الدالة بس.
import { delay } from "./errors";
import { branchesOf } from "./profile";
import { providersApi } from "./providers";

// ───────────── الحجوزات (CON5-07a 3114:38407) ─────────────
export interface ProviderBookingRow {
  code: string;
  customer: string;
  branch: string;
  service: string;
  doneAt: string;
  sale: number;
  cost: number;
  margin: number;
  status: "pending-approval" | "approved";
}
export type BookingFilters = { branch?: string; status?: string; period?: string; service?: string };

/** قائمة «الشهر» (القسم 17) — الافتراضي الشهر الحالي */
export const MONTH_OPTIONS = ["أكتوبر 2026", "سبتمبر 2026", "أغسطس 2026", "يوليو 2026", "يونيو 2026", "مايو 2026", "أبريل 2026", "مارس 2026", "فبراير 2026", "يناير 2026"].map((m) => ({ value: m, label: m }));
export const CURRENT_MONTH = MONTH_OPTIONS[0].value;
export const BOOKING_STATUS_OPTIONS = [
  { value: "", label: "الكل" },
  { value: "pending-approval", label: "بانتظار الاعتماد" },
  { value: "approved", label: "معتمد" },
];

// ───────────── التحليلات (CON5-07a 3114:24787) ─────────────
export interface ProviderAnalytics {
  kpis: { month: number; done: number; sales: number; margin: number };
  byBranch: { id: string; name: string; count: number; pct: number }[];
  monthly: { month: string; value: number; current?: boolean }[];
}
export const ANALYTICS_PERIODS = ["هذا الشهر", "الشهر الماضي", "آخر 3 أشهر", "هذه السنة"].map((v) => ({ value: v, label: v }));

// ───────────── المستحقات (CON5-07a 3114:50726) ─────────────
export interface DuesRow {
  ref: string;
  period: string;
  bookings: number;
  amount: number;
  account: string;
  date: string;
  status: "review" | "transferred";
}
export interface ProviderDues {
  month: string;
  approved: { amount: number; bookings: number };
  claims: DuesRow[];
  transfers: DuesRow[];
}

// ───────────── الجودة والتقييم (CON5-07a 3114:51034 · 3302:138749) ─────────────
export interface ComplaintRow {
  code: string;
  customer: string;
  booking: string;
  branch: string;
  category: string;
  openedAt: string;
  status: "waiting-center" | "at-linkar";
  escalatedAt?: string;
}
export interface ProviderQuality {
  rating: number;
  reviews: number;
  /** 5 → 1 نجوم */
  stars: [number, number, number, number, number];
  complaints: ComplaintRow[];
  pendingReplies: unknown[];
}

// ───────────── الفروع (CON5-07a 3114:50649) — أرقام الأداء اللي مش في نموذج الفرع ─────────────
const BRANCH_STATS: Record<string, { monthMargin: number; yearBookings: number }> = {
  "lk-jn-zh-001": { monthMargin: 16050, yearBookings: 970 },
  "lk-jn-hm-002": { monthMargin: 11580, yearBookings: 677 },
  "lk-jn-mh-003": { monthMargin: 10860, yearBookings: 779 },
};

const MONTHS_BACK = ["يوليو", "أغسطس", "سبتمبر", "أكتوبر"];

export const providerTabsApi = {
  /** GET /providers/:id/bookings?branch=&status=&period=&service= → { items, total, counts } */
  bookings: async (providerId: string, f: BookingFilters = {}) => {
    void providerId;
    void f;
    return delay({ items: [] as ProviderBookingRow[], total: 0, counts: {} as Record<string, number> });
  },
  analytics: async (providerId: string, f: { period?: string; city?: string; type?: string; branch?: string } = {}): Promise<ProviderAnalytics> => {
    void f;
    const p = await providersApi.get(providerId);
    const approved = branchesOf(p).filter((b) => b.status === "approved");
    return delay({
      kpis: { month: 0, done: 0, sales: 0, margin: 0 },
      byBranch: approved.map((b) => ({ id: b.id, name: `فرع ${b.name}`, count: 0, pct: 0 })),
      monthly: MONTHS_BACK.map((m, i) => ({ month: m, value: 0, current: i === MONTHS_BACK.length - 1 })),
    });
  },
  dues: async (providerId: string, month = CURRENT_MONTH): Promise<ProviderDues> => {
    void providerId;
    return delay({ month, approved: { amount: 0, bookings: 0 }, claims: [], transfers: [] });
  },
  quality: async (providerId: string, q: { view?: string; filter?: string } = {}): Promise<ProviderQuality> => {
    void providerId;
    void q;
    return delay({ rating: 0, reviews: 0, stars: [0, 0, 0, 0, 0], complaints: [], pendingReplies: [] });
  },
  branchStats: async (branchIds: string[]) => delay(Object.fromEntries(branchIds.map((id) => [id, BRANCH_STATS[id] ?? null])), 150),
};
