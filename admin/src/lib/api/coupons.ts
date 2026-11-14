// الكوبونات (Figma v5 · 05 · العملاء → CON5-05 · العملاء · الكوبونات 3400:230073 · 05D كوبون · 05M إنشاء كوبون · 05T).
// بيانات تجريبية بنفس شكل الخادم: القائمة بتاخد البحث والنوع والحالة وبترجع { items, total, counts }.
import { _setCouponCount } from "./customers";
import { ApiError, delay } from "./errors";

export type CouponKind = "general" | "phones" | "customer";
export type CouponStatus = "active" | "scheduled" | "expired" | "stopped";
export const KIND_LABEL: Record<CouponKind, string> = { general: "عام", phones: "أرقام جوال", customer: "عميل مسجّل" };
export const STATUS_LABEL: Record<CouponStatus, string> = { active: "نشط", scheduled: "مجدول", expired: "منتهٍ", stopped: "موقوف" };

export type KV = { k: string; v: string };
export type UsageRow = { phone: string; sent: string; used: string; booking: string };

export interface Coupon {
  code: string;
  /** «JOIN100-••••» لما يكون كود لكل رقم */
  display: string;
  kind: CouponKind;
  /** سطر النوع التاني في الجدول (رسالة نصية · محمد سالم · واتساب) */
  kindSub?: string;
  /** سطر العنوان التاني في الدرج («أرقام جوال · رسالة نصية») */
  headSub: string;
  discount: string;
  discountSub?: string;
  scope: string;
  scopeSub: string;
  validity: string;
  sent: string;
  used: string;
  status: CouponStatus;
  hero: string;
  settings: KV[];
  usage?: { title: string; rows: UsageRow[]; footer: string };
}

const JOIN_USAGE: UsageRow[] = [
  { phone: "050 ••• 3318", sent: "1 أكتوبر 2026", used: "3 أكتوبر 2026", booking: "BK-21431" },
  { phone: "055 ••• 7092", sent: "1 أكتوبر 2026", used: "5 أكتوبر 2026", booking: "BK-21439" },
  { phone: "053 ••• 2240", sent: "1 أكتوبر 2026", used: "7 أكتوبر 2026", booking: "BK-21443" },
  { phone: "056 ••• 1187", sent: "1 أكتوبر 2026", used: "9 أكتوبر 2026", booking: "BK-21446" },
  { phone: "054 ••• 6625", sent: "1 أكتوبر 2026", used: "11 أكتوبر 2026", booking: "BK-21449" },
  { phone: "050 ••• 9014", sent: "1 أكتوبر 2026", used: "12 أكتوبر 2026", booking: "BK-21454" },
  { phone: "055 ••• 4471", sent: "1 أكتوبر 2026", used: "—", booking: "—" },
  { phone: "059 ••• 3306", sent: "1 أكتوبر 2026", used: "—", booking: "—" },
];

const SEED: Coupon[] = [
  {
    code: "JOIN100",
    display: "JOIN100-••••",
    kind: "phones",
    kindSub: "رسالة نصية",
    headSub: "أرقام جوال · رسالة نصية",
    discount: "100 ر.س",
    discountSub: "حد أدنى 800 ر.س",
    scope: "التظليل",
    scopeSub: "كل المراكز",
    validity: "1 – 20 أكتوبر 2026",
    sent: "40",
    used: "6",
    status: "active",
    hero: "100 ر.س · التظليل · كل المراكز",
    settings: [
      { k: "النوع", v: "أرقام جوال · 40 رقماً" },
      { k: "الخصم", v: "100 ر.س" },
      { k: "الحد الأدنى للحجز", v: "800 ر.س" },
      { k: "ينطبق على", v: "التظليل · كل المراكز · كل الفروع" },
      { k: "الصلاحية", v: "1 – 20 أكتوبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1 لكل رقم · 40 إجمالاً" },
      { k: "أُنشئ", v: "1 أكتوبر 2026 · نوف القحطاني" },
    ],
    usage: { title: "الاستخدام · أُرسل 40 · استُخدم 6", rows: JOIN_USAGE, footer: "عرض 8 من 40" },
  },
  {
    code: "MOHD150",
    display: "MOHD150",
    kind: "customer",
    kindSub: "محمد سالم",
    headSub: "عميل مسجّل · رسالة نصية",
    discount: "150 ر.س",
    discountSub: "حد أدنى 1,000 ر.س",
    scope: "نانو سيراميك",
    scopeSub: "جونسون · فرع الزهراء",
    validity: "1 – 31 أكتوبر 2026",
    sent: "1",
    used: "0",
    status: "active",
    hero: "150 ر.س · نانو سيراميك · جونسون · فرع الزهراء",
    settings: [
      { k: "العميل", v: "محمد سالم · 055 ••• 4567" },
      { k: "الخصم", v: "150 ر.س" },
      { k: "الحد الأدنى للحجز", v: "1,000 ر.س" },
      { k: "ينطبق على", v: "نانو سيراميك · جونسون · فرع الزهراء" },
      { k: "الصلاحية", v: "1 – 31 أكتوبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1" },
      { k: "أُرسل", v: "1 أكتوبر 2026" },
      { k: "استُخدم", v: "—" },
      { k: "أُنشئ", v: "1 أكتوبر 2026 · نوف القحطاني" },
    ],
  },
  {
    code: "WELCOME10",
    display: "WELCOME10",
    kind: "general",
    headSub: "عام",
    discount: "10% حتى 100 ر.س",
    discountSub: "حد أدنى 300 ر.س · أول حجز",
    scope: "كل الخدمات",
    scopeSub: "كل المراكز",
    validity: "حتى 31 ديسمبر 2026",
    sent: "—",
    used: "214",
    status: "active",
    hero: "10% حتى 100 ر.س · كل الخدمات · كل المراكز",
    settings: [
      { k: "الخصم", v: "10%" },
      { k: "الحد الأقصى للخصم", v: "100 ر.س" },
      { k: "الحد الأدنى للحجز", v: "300 ر.س · أول حجز" },
      { k: "ينطبق على", v: "كل الخدمات · كل المراكز · كل الفروع" },
      { k: "الصلاحية", v: "حتى 31 ديسمبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1 لكل عميل" },
      { k: "استُخدم", v: "214" },
    ],
  },
  {
    code: "NANO15",
    display: "NANO15",
    kind: "general",
    headSub: "عام",
    discount: "15% حتى 300 ر.س",
    scope: "نانو سيراميك",
    scopeSub: "كل المراكز",
    validity: "1 – 31 أكتوبر 2026",
    sent: "—",
    used: "57",
    status: "active",
    hero: "15% حتى 300 ر.س · نانو سيراميك · كل المراكز",
    settings: [
      { k: "الخصم", v: "15%" },
      { k: "الحد الأقصى للخصم", v: "300 ر.س" },
      { k: "الحد الأدنى للحجز", v: "—" },
      { k: "ينطبق على", v: "نانو سيراميك · كل المراكز · كل الفروع" },
      { k: "الصلاحية", v: "1 – 31 أكتوبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1 لكل عميل" },
      { k: "استُخدم", v: "57" },
    ],
  },
  {
    code: "PPF500",
    display: "PPF500",
    kind: "general",
    headSub: "عام",
    discount: "500 ر.س",
    discountSub: "حد أدنى 4,000 ر.س",
    scope: "حماية PPF",
    scopeSub: "كل المراكز",
    validity: "1 – 15 نوفمبر 2026",
    sent: "—",
    used: "—",
    status: "scheduled",
    hero: "500 ر.س · حماية PPF · كل المراكز",
    settings: [
      { k: "الخصم", v: "500 ر.س" },
      { k: "الحد الأقصى للخصم", v: "—" },
      { k: "الحد الأدنى للحجز", v: "4,000 ر.س" },
      { k: "ينطبق على", v: "حماية PPF · كل المراكز · كل الفروع" },
      { k: "الصلاحية", v: "1 – 15 نوفمبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1 لكل عميل" },
      { k: "استُخدم", v: "—" },
    ],
  },
  {
    code: "WATANI96",
    display: "WATANI96",
    kind: "general",
    headSub: "عام",
    discount: "96 ر.س",
    discountSub: "حد أدنى 960 ر.س",
    scope: "كل الخدمات",
    scopeSub: "كل المراكز",
    validity: "20 – 30 سبتمبر 2026",
    sent: "—",
    used: "386",
    status: "expired",
    hero: "96 ر.س · كل الخدمات · كل المراكز",
    settings: [
      { k: "الخصم", v: "96 ر.س" },
      { k: "الحد الأقصى للخصم", v: "—" },
      { k: "الحد الأدنى للحجز", v: "960 ر.س" },
      { k: "ينطبق على", v: "كل الخدمات · كل المراكز · كل الفروع" },
      { k: "الصلاحية", v: "20 – 30 سبتمبر 2026" },
      { k: "عدد مرات الاستخدام", v: "1 لكل عميل" },
      { k: "استُخدم", v: "386" },
    ],
  },
];

let store: Coupon[] = structuredClone(SEED);
const clone = <T,>(v: T): T => structuredClone(v);
// بطاقة «الكوبونات» في صفحة العملاء = عدد الكوبونات في القائمة
_setCouponCount(() => store.length);

export type CouponQuery = { q?: string; kind?: string; status?: string };

export const couponsApi = {
  list: async (f: CouponQuery = {}) => {
    const q = f.q?.trim().toLowerCase().replace(/\s/g, "");
    const items = store.filter(
      (c) =>
        (!q || c.code.toLowerCase().includes(q) || c.usage?.rows.some((r) => r.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "§")) || c.kindSub?.includes(f.q!.trim())) &&
        (!f.kind || c.kind === f.kind) &&
        (!f.status || c.status === f.status),
    );
    return delay({ items: clone(items), total: items.length, counts: { all: store.length } });
  },
  get: async (code: string) => {
    const c = store.find((x) => x.code === code);
    if (!c) throw new ApiError(404);
    return delay(clone(c), 200);
  },
};

// ───────────── الإجراءات (CON5-05M إنشاء كوبون · 05T) ─────────────
export interface CouponInput {
  kind: CouponKind;
  code: string;
  /** أرقام الجوال: كود لكل رقم (CODE-XXXX) أو كود واحد لكل الأرقام */
  perNumber?: boolean;
  phones?: string[];
  customer?: { name: string; phone: string };
  channel?: "واتساب" | "رسالة نصية";
  discountType: "percent" | "fixed";
  value: number;
  max?: number;
  min?: number;
  centers: string;
  branches: string;
  services: string;
  packages: string;
  perUser: number;
  total: number;
  from: string;
  to: string;
}

const sar = (n: number) => `${n.toLocaleString("en-US")} ر.س`;
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const ar = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return { d: d.getDate(), m: MONTHS[d.getMonth()], y: d.getFullYear() };
};
/** «14 أكتوبر – 14 نوفمبر 2026» · «1 – 30 نوفمبر 2026» */
export function rangeLabel(from: string, to: string) {
  const a = ar(from), b = ar(to);
  if (a.y !== b.y) return `${a.d} ${a.m} ${a.y} – ${b.d} ${b.m} ${b.y}`;
  if (a.m !== b.m) return `${a.d} ${a.m} – ${b.d} ${b.m} ${b.y}`;
  return `${a.d} – ${b.d} ${b.m} ${b.y}`;
}
export const dayLabel = (iso: string) => {
  const a = ar(iso);
  return `${a.d} ${a.m} ${a.y}`;
};
const TODAY = "2026-10-14";

export const couponsMutations = {
  create: async (v: CouponInput) => {
    const code = v.code.trim().toUpperCase();
    if (store.some((c) => c.code === code)) throw new ApiError(422, "", { code: "الكود مستخدم في كوبون آخر" });
    const discount = v.discountType === "percent" ? (v.max ? `${v.value}% حتى ${sar(v.max)}` : `${v.value}%`) : sar(v.value);
    const scopeMain = v.services === "كل الخدمات" && v.packages !== "كل الباقات" && v.packages !== "بدون باقات" ? v.packages : v.services;
    const centerLine = v.branches !== "كل الفروع" ? `${v.centers.replace(/ [A-Za-z].*$/, "")} · ${v.branches}` : v.centers;
    const scheduled = v.from > TODAY;
    const count = v.kind === "phones" ? (v.phones?.length ?? 0) : v.kind === "customer" ? 1 : 0;
    const created = `${dayLabel(TODAY)} · نوف القحطاني`;
    const validity = rangeLabel(v.from, v.to);
    const settings: KV[] = [];
    if (v.kind === "phones") settings.push({ k: "النوع", v: `أرقام جوال · ${count} رقماً` });
    if (v.kind === "customer" && v.customer) settings.push({ k: "العميل", v: `${v.customer.name} · ${v.customer.phone}` });
    settings.push({ k: "الخصم", v: v.discountType === "percent" ? `${v.value}%` : sar(v.value) });
    if (v.kind !== "customer") settings.push({ k: "الحد الأقصى للخصم", v: v.max ? sar(v.max) : "—" });
    settings.push({ k: "الحد الأدنى للحجز", v: v.min ? sar(v.min) : "—" });
    settings.push({ k: "ينطبق على", v: v.kind === "customer" ? `${scopeMain} · ${centerLine}` : `${scopeMain} · ${v.centers} · ${v.branches}`.replace(" · كل الفروع", v.kind === "phones" ? "" : " · كل الفروع") });
    settings.push({ k: "الصلاحية", v: validity });
    settings.push({ k: "عدد مرات الاستخدام", v: v.kind === "phones" ? `${v.perUser} لكل رقم · ${count} إجمالاً` : v.kind === "customer" ? `${v.perUser}` : `${v.perUser} لكل عميل · ${v.total.toLocaleString("en-US")} إجمالاً` });
    if (v.kind === "customer") settings.push({ k: "أُرسل", v: dayLabel(TODAY) }, { k: "استُخدم", v: "—" });
    if (v.kind === "general") settings.push({ k: "استُخدم", v: "—" });
    settings.push({ k: "أُنشئ", v: created });
    const perNumber = v.kind === "phones" && v.perNumber !== false;
    const c: Coupon = {
      code,
      display: perNumber ? `${code}-••••` : code,
      kind: v.kind,
      kindSub: v.kind === "phones" ? v.channel : v.kind === "customer" ? v.customer?.name : undefined,
      headSub: v.kind === "general" ? "عام" : `${KIND_LABEL[v.kind]} · ${v.channel}`,
      discount,
      discountSub: v.min ? `حد أدنى ${sar(v.min)}` : undefined,
      scope: scopeMain,
      scopeSub: v.kind === "customer" ? centerLine : v.centers,
      validity,
      sent: count ? String(count) : "—",
      used: count ? "0" : "—",
      status: scheduled ? "scheduled" : "active",
      hero: `${discount} · ${scopeMain}${v.kind === "phones" ? "" : ` · ${v.kind === "customer" ? centerLine : v.centers}`}`,
      settings,
      usage:
        v.kind === "phones"
          ? {
              title: `الاستخدام · أُرسل ${count} · استُخدم 0`,
              rows: (v.phones ?? []).slice(0, 6).map((p) => ({ phone: `${p.slice(0, 3)} ••• ${p.slice(-4)}`, sent: dayLabel(TODAY), used: "—", booking: "—" })),
              footer: `عرض ${Math.min(6, count)} من ${count}`,
            }
          : undefined,
    };
    store = [c, ...store];
    return delay({ ok: true, coupon: clone(c) });
  },
  stop: async (code: string) => {
    const c = store.find((x) => x.code === code);
    if (!c) throw new ApiError(404);
    c.status = "stopped";
    return delay({ ok: true });
  },
};

export const _couponsStore = { all: () => store, reset: () => (store = clone(SEED)) };
