// تبويبات ملف المزوّد المؤجّلة (القسم 15) + أرقام تبويب «الفروع».
// المرحلة 2: الحجوزات والجودة (وبعدها التحليلات والمستحقات) بقت بتقرا من مخازن الأقسام الجديدة
// (api.bookings · api.quality · api.analytics · api.dues) مفلترة بالمزوّد، فأي إجراء هناك يظهر هنا.
import { bookingsApi, type Booking } from "./bookings";
import { analyticsApi, type Block } from "./analytics";
import { ltr } from "../format";
import { duesApi } from "./dues";
import { ApiError, delay } from "./errors";
import { qualityApi, type ComplaintRow, type ReviewRow } from "./reviews";
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
  /** «الحجوزات الشهرية» + «حسب الفرع» — نفس بطاقات صفحة التحليلات بفلتر المركز (api.analytics.get("demand", { center })) */
  blocks: Block[];
}
// «58 · 42%» بيترسم LTR في Figma (58 على الشمال)
const ltrBars = (b: Block): Block => (b.kind === "bars" ? { ...b, bars: b.bars.map((x) => ({ ...x, value: ltr(x.value) })) } : b);
// أرقام التبويب اللي مش في رد التحليلات («منفّذة» · «مبيعات المنفّذ» · «هامش لينكار») — جونسون من Figma 3114:24787
const ANALYTICS_KPIS: Record<string, Omit<ProviderAnalytics["kpis"], "month">> = { "lk-jn-001": { done: 123, sales: 192430, margin: 38490 } };
export const ANALYTICS_PERIODS = ["هذا الشهر", "الشهر الماضي", "آخر 3 أشهر", "هذه السنة"].map((v) => ({ value: v, label: v }));

// ───────────── المستحقات (CON5-07a 3114:50726) ─────────────
export interface DuesRow {
  /** «CL-2026-0010» · «CL-2026-0009 · TRF-2026-10-0062» */
  ref: string;
  claim?: string;
  transfer?: string;
  period: string;
  bookings: number;
  amount: number;
  account: string;
  /** تاريخ التحويل (المتوقع للمطالبة المفتوحة) — نص عرض */
  date: string;
  status: "review" | "approved" | "returned" | "transferred";
}
const toNum = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;
/** مطالبات قديمة مش في قائمة المطالبات (Figma 3114:50726: «CL-2026-0008 · TRF-2026-09-0048») */
const CLAIM_OF_TRANSFER: Record<string, string> = { "TRF-2026-09-0048": "CL-2026-0008" };
export interface ProviderDues {
  month: string;
  approved: { amount: number; bookings: number };
  claims: DuesRow[];
  transfers: DuesRow[];
}

// ───────────── الجودة والتقييم (CON5-07a 3114:51034 · 3302:138749) ─────────────
// الشكاوى والتقييمات من نفس مخزن «التقييمات والشكاوى» (api.quality · reviews.ts) مفلترة باسم المركز.
export type { ComplaintRow, ReviewRow } from "./reviews";
/** رد المزوّد على تقييم/شكوى بانتظار اعتماد لينكار (3302:138749) */
export interface PendingReply {
  id: string;
  kind: "review" | "complaint";
  /** «رد على تقييم · BK-21459 · فرع المحمدية» */
  title: string;
  /** سطر العميل والتقييم */
  meta: string;
  quote: string;
  /** «رد جونسون · أُرسل 13 أكتوبر 2026» */
  from: string;
  text: string;
  /** الكود اللي في رسالة التأكيد (BK-21459 · CM-3349) */
  ref: string;
  /** التقييم المرتبط في قسم التقييمات (يتزامن عند الاعتماد/الرفض) */
  reviewId?: string;
}
export interface ProviderQuality {
  rating: number;
  reviews: number;
  /** 5 → 1 نجوم */
  stars: [number, number, number, number, number];
  complaints: ComplaintRow[];
  reviewsList: ReviewRow[];
  pendingReplies: PendingReply[];
}
export type QualityView = "services" | "complaints" | "branches";
export type QualityFilter = "waiting" | "open" | "low" | "replies";

// توزيع النجوم: جونسون من Figma (291 · 26 · 2 · 1 · 0)، والباقي تقريبي من المتوسط والعدد
const STARS_FIXED: Record<string, ProviderQuality["stars"]> = { "lk-jn-001": [291, 26, 2, 1, 0] };
function starsOf(id: string, rating: number | null, count: number | null): ProviderQuality["stars"] {
  if (STARS_FIXED[id]) return STARS_FIXED[id];
  const n = count ?? 0;
  if (!n || !rating) return [0, 0, 0, 0, 0];
  const f5 = Math.min(0.97, Math.max(0.05, (rating - 3.9) * 0.9));
  const r5 = Math.round(n * f5);
  const r4 = Math.round((n - r5) * 0.85);
  const r3 = Math.round((n - r5 - r4) * 0.6);
  const r2 = Math.round((n - r5 - r4 - r3) * 0.6);
  return [r5, r4, r3, r2, n - r5 - r4 - r3 - r2];
}

let replies: Record<string, PendingReply[]> = {
  "lk-jn-001": [
    {
      id: "rp-bk-21459",
      kind: "review",
      title: "رد على تقييم · BK-21459 · فرع المحمدية",
      meta: "سعود ب. · ★ 3 من 5 · تفصيل داخلي كامل · 13 أكتوبر 2026",
      quote: "«التنظيف الداخلي مقبول، لكن بقيت آثار طين على الدواسات والسقف ما تنظّف كويس.»",
      from: "رد جونسون · أُرسل 13 أكتوبر 2026",
      text: "نعتذر عن ذلك يا سعود، تواصلنا معك لإعادة تنظيف الدواسات والسقف مجاناً في فرع المحمدية.",
      ref: "BK-21459",
      reviewId: "RV-88402",
    },
    {
      id: "rp-cm-3349",
      kind: "complaint",
      title: "رد على شكوى · CM-3349 · BK-21426 · فرع المحمدية",
      meta: "أحمد ز. · ملاحظة على تغطية الطبقة لحواف الأبواب · 11 أكتوبر 2026",
      quote: "«اللمعان قوي والفريق شرح لي الضمان بالتفصيل، لكن حواف الأبواب تحتاج عناية أكثر.»",
      from: "رد جونسون · أُرسل 12 أكتوبر 2026",
      text: "نعتذر عن ذلك يا أحمد، حجزنا لك موعداً لإعادة تطبيق الطبقة على حواف الأبواب دون أي تكلفة.",
      ref: "CM-3349",
    },
  ],
};

async function takeReply(providerId: string, replyId: string) {
  const list = replies[providerId] ?? [];
  const r = list.find((x) => x.id === replyId);
  if (!r) throw new ApiError(404, "الرد غير موجود");
  replies = { ...replies, [providerId]: list.filter((x) => x.id !== replyId) };
  return r;
}

export const qualityRepliesApi = {
  /** «اعتماد ونشر» → CON5-07T «نُشر رد جونسون · BK-21459» */
  approve: async (providerId: string, replyId: string) => {
    const p = await providersApi.get(providerId);
    const r = await takeReply(providerId, replyId);
    if (r.reviewId) await qualityApi.approveReply(r.reviewId).catch(() => undefined);
    return delay({ toast: `نُشر رد ${p.short || p.name} · ${r.ref}` }, 350);
  },
  /** «رفض» → CON5-07T «رُفض الرد وأُبلغت جونسون · BK-21459» */
  reject: async (providerId: string, replyId: string) => {
    const p = await providersApi.get(providerId);
    const r = await takeReply(providerId, replyId);
    if (r.reviewId) await qualityApi.returnReply(r.reviewId, { reason: "رفض لينكار", note: "رُفض الرد من ملف المزوّد" }).catch(() => undefined);
    return delay({ toast: `رُفض الرد وأُبلغت ${p.short || p.name} · ${r.ref}` }, 350);
  },
  /** «تعديل وإرسال للمزوّد» → CON5-07T «أُرسل اقتراح التعديل لجونسون · BK-21459» */
  suggest: async (providerId: string, replyId: string, text: string) => {
    if (!text.trim()) throw new ApiError(422, "تحقق من الحقول", { text: "اكتب الرد المقترح" });
    const p = await providersApi.get(providerId);
    const r = await takeReply(providerId, replyId);
    return delay({ toast: `أُرسل اقتراح التعديل ل${p.short || p.name} · ${r.ref}` }, 350);
  },
};

// ───────────── الفروع (CON5-07a 3114:50649) — أرقام الأداء اللي مش في نموذج الفرع ─────────────
const BRANCH_STATS: Record<string, { monthMargin: number; yearBookings: number }> = {
  "lk-jn-zh-001": { monthMargin: 16050, yearBookings: 970 },
  "lk-jn-hm-002": { monthMargin: 11580, yearBookings: 677 },
  "lk-jn-mh-003": { monthMargin: 10860, yearBookings: 779 },
};


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
    const p = await providersApi.get(providerId);
    const branch = f.branch ? branchesOf(p).find((b) => b.id === f.branch) : undefined;
    const v = await analyticsApi.get("demand", { period: f.period, city: f.city, type: f.type, center: p.id, centerName: p.name, branch: f.branch || undefined, branchName: branch?.name });
    const month = Number((v.stats?.[0]?.value ?? "0").replace(/,/g, "")) || 0;
    return delay({ kpis: { month, ...(ANALYTICS_KPIS[p.id] ?? { done: 0, sales: 0, margin: 0 }) }, blocks: v.rows.flat().map(ltrBars) }, 60);
  },
  /** المستحقات من قسم «مستحقات المزوّدين» (api.dues): المطالبات المفتوحة + تحويلات المزوّد (CL ↔ TRF) */
  dues: async (providerId: string, month = CURRENT_MONTH): Promise<ProviderDues> => {
    const [rows, claims, transfers] = await Promise.all([duesApi.list(), duesApi.claims(), duesApi.transfers()]);
    const row = rows.items.find((r) => r.providerId === providerId);
    const account = row?.account.main ?? "—";
    const mine = claims.items.filter((c) => c.providerId === providerId);
    const open = mine.filter((c) => c.status === "review" || c.status === "approved" || c.status === "returned");
    const claimRows: DuesRow[] = open.map((c) => {
      const [d, mon, y] = c.date.split(" ");
      const next = AR_MONTHS.indexOf(mon) + 1; // التحويل أول الشهر التالي
      return {
        ref: c.id,
        claim: c.id,
        period: `${mon} (1 – ${Math.max(1, +d - 1)})`,
        bookings: toNum(c.bookings),
        amount: toNum(c.amount),
        account,
        date: `1 ${AR_MONTHS[next % 12]} ${+y + (next === 12 ? 1 : 0)}`,
        status: c.status as DuesRow["status"],
      };
    });
    const transferRows: DuesRow[] = transfers.items
      .filter((t) => t.providerId === providerId)
      .map((t) => {
        const claim = mine.find((c) => c.transfer === t.id)?.id ?? CLAIM_OF_TRANSFER[t.id];
        return { ref: claim ? `${claim} · ${t.id}` : t.id, claim, transfer: t.id, period: t.period, bookings: toNum(t.bookings), amount: toNum(t.amount), account: t.account, date: t.date, status: "transferred" };
      });
    // «خدمات معتمدة»: الشهر الحالي = المطالبة المفتوحة (أو مستحق الكشف) · شهر سابق = تحويله
    const done = transferRows.find((t) => t.period === month);
    const cur = claimRows.find((c) => month.startsWith(c.period.split(" ")[0]));
    const approved = done ?? cur ?? (month === CURRENT_MONTH && row ? { amount: toNum(row.cost), bookings: toNum(row.bookings) } : { amount: 0, bookings: 0 });
    return delay({ month, approved: { amount: approved.amount, bookings: approved.bookings }, claims: claimRows, transfers: transferRows }, 60);
  },
  /** GET /providers/:id/quality?view=&filter= — الشكاوى والتقييمات من api.quality بمركز = اسم المزوّد */
  quality: async (providerId: string, q: { view?: QualityView; filter?: QualityFilter } = {}): Promise<ProviderQuality> => {
    const p = await providersApi.get(providerId);
    const filter = q.filter ?? "open";
    const [c, r] = await Promise.all([qualityApi.complaints({ center: p.name }), qualityApi.reviews({ center: p.name })]);
    // كل الصفحات (المزوّد الواحد عنده شكاوى/تقييمات قليلة)
    const more = async <T,>(first: { items: T[]; pages: number }, get: (page: number) => Promise<{ items: T[] }>) =>
      [...first.items, ...(await Promise.all(Array.from({ length: first.pages - 1 }, (_, i) => get(i + 2)))).flatMap((x) => x.items)];
    const allC = await more(c, (page) => qualityApi.complaints({ center: p.name, page }));
    const allR = await more(r, (page) => qualityApi.reviews({ center: p.name, page }));
    const complaints = allC.filter((x) => (filter === "waiting" ? x.stage === "center" : filter === "open" ? x.stage !== "closed" : true));
    const reviewsList = allR.filter((x) => (filter === "low" ? x.stars <= 3 : filter === "waiting" ? !x.status.sub : true));
    return delay(
      {
        rating: p.rating ?? 0,
        reviews: p.ratingCount ?? 0,
        stars: starsOf(p.id, p.rating, p.ratingCount),
        complaints,
        reviewsList,
        pendingReplies: structuredClone(replies[providerId] ?? []),
      },
      120,
    );
  },
  /** ردود المزوّد بانتظار اعتماد لينكار */
  replies: qualityRepliesApi,
  branchStats: async (branchIds: string[]) => delay(Object.fromEntries(branchIds.map((id) => [id, BRANCH_STATS[id] ?? null])), 150),
};
