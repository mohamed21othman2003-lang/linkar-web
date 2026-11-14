// تبويبات ملف المزوّد المؤجّلة (القسم 15) + أرقام تبويب «الفروع».
// القسم 1.5: الحجوزات والتحليلات والمستحقات والجودة = «الشكل فقط بلا بيانات» في المرحلة الأولى — الدوال هنا بترجع
// نفس شكل رد الخادم بقوائم فاضية وأرقام صفر، ولما الخادم يجهز يتغيّر جسم الدالة بس.
import { bookingsApi, type Booking } from "./bookings";
import { delay } from "./errors";
import { branchesOf } from "./profile";
import { providersApi } from "./providers";

// ───────────── الحجوزات (CON5-07a 3114:38407) ─────────────
export interface ProviderBookingRow {
  code: string;
  customer: string;
  branch: string;
  branchCode: string;
  /** «الخدمة · الحجم» */
  service: string;
  serviceName: string;
  /** «14 أكتوبر 2026» */
  doneAt: string;
  /** «أكتوبر 2026» (قائمة الفترة) */
  month: string;
  /** يوم التنفيذ للترتيب (الأحدث أولاً) */
  day: number;
  sale: number;
  cost: number;
  margin: number;
  status: "pending-approval" | "approved";
}
/** صفوف كل صفحة في تبويب الحجوزات (Figma 3114:38407 بيرسم أول 8) */
export const PROVIDER_BOOKINGS_PAGE = 8;
const BOOKINGS_API_PAGE = 10;
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
function toProviderRow(b: Booking): ProviderBookingRow {
  // تاريخ التنفيذ = تاريخ مسح القسيمة («استُخدمت 14 أكتوبر 2026»)
  const m = b.voucher.match(/(\d+) (\S+) (\d{4})/);
  const [d, mon, y] = m ? [+m[1], m[2], +m[3]] : [0, "", 0];
  return {
    code: b.id,
    customer: b.customer.name,
    branch: b.branch,
    branchCode: b.branchCode,
    service: `${b.service} · ${b.size}`,
    serviceName: b.service,
    doneAt: m ? `${d} ${mon} ${y}` : "—",
    month: m ? `${mon} ${y}` : "",
    day: y * 10000 + (AR_MONTHS.indexOf(mon) + 1) * 100 + d,
    sale: b.sale,
    cost: b.cost,
    margin: b.sale - b.cost,
    status: b.status === "approved" ? "approved" : "pending-approval",
  };
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
  /** GET /providers/:id/bookings?branch=&status=&period=&service=&page= → { items, total, counts }
   *  الحجوزات المنفّذة (بانتظار الاعتماد + المعتمدة) من نفس مخزن قسم الحجوزات (api.bookings) — أي اعتماد هناك يظهر هنا. */
  bookings: async (providerId: string, f: BookingFilters & { page?: number } = {}) => {
    const first = await bookingsApi.list({ provider: providerId });
    const pages = Math.ceil(first.total / BOOKINGS_API_PAGE);
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => bookingsApi.list({ provider: providerId, page: i + 2 })));
    const done = [first, ...rest]
      .flatMap((r) => r.items)
      .filter((b) => b.status === "completed" || b.status === "approved")
      .map(toProviderRow);
    const rows = done
      .filter((r) => !f.branch || r.branchCode.toLowerCase() === f.branch.toLowerCase())
      .filter((r) => !f.status || r.status === f.status)
      .filter((r) => !f.period || r.month === f.period)
      .filter((r) => !f.service || r.serviceName === f.service)
      .sort((a, b) => b.day - a.day || b.code.localeCompare(a.code));
    const page = Math.max(1, f.page ?? 1);
    const counts = { "pending-approval": rows.filter((r) => r.status === "pending-approval").length, approved: rows.filter((r) => r.status === "approved").length };
    return delay({ items: rows.slice((page - 1) * PROVIDER_BOOKINGS_PAGE, page * PROVIDER_BOOKINGS_PAGE), total: rows.length, counts }, 120);
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
