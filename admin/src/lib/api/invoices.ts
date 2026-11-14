// الفواتير والقسائم (المرحلة 2 · Figma «v5 · 16 · الفواتير والقسائم» 3114:47647):
// فواتير العملاء (CON5-16) · الإشعارات الدائنة (3114:48085) · فواتير المزوّدين = فوترة ذاتية (3260:261595) · القسائم (3114:48129)
// + عرض المستند (CON5-16V: فاتورة ضريبية مبسّطة · إشعار دائن ضريبي · فاتورة فوترة ذاتية) ودرج القسيمة (CON5-16D).
// النصوص والأرقام حرفياً من الإطارات. فاتورة المزوّد SB-… = نفس رقم التحويل TRF-… ونفس إجمالي كشف المزوّد في «مستحقات المزوّدين».
import { ApiError, delay } from "./errors";

export type InvTab = "customer" | "provider" | "credit" | "vouchers";
export type DocTone = "success" | "warning" | "danger" | "neutral";

export const INV_TABS: { key: InvTab; label: string }[] = [
  { key: "customer", label: "فواتير العملاء" },
  { key: "provider", label: "فواتير المزوّدين" },
  { key: "credit", label: "الإشعارات الدائنة" },
  { key: "vouchers", label: "القسائم" },
];

/** صف فاتورة / إشعار دائن / فاتورة مزوّد */
export interface DocRow {
  id: string;
  kind: "invoice" | "credit" | "self-billing";
  /** «BK-21474 · عبدالعزيز ف.» أو «جونسون Johnson · سبتمبر 2026 · 334 حجزاً» */
  ref: string;
  booking?: string;
  total: string;
  vat: string;
  date: string;
  status: string;
  tone: DocTone;
  /** يظهر في جدول التبويب (المستندات المفتوحة من أماكن تانية بس = false) */
  listed: boolean;
}

/** المستند للعرض (CON5-16V): ورقة بيضا 680 · عنوان 22 Bold · سطر الجهة · سطور «مفتاح … قيمة» · سطر الإجمالي 15 · رمز QR · تذييل */
export interface DocView {
  id: string;
  kind: DocRow["kind"];
  /** شريط العارض: «فاتورة ضريبية INV-L-…» */
  bar: string;
  title: string;
  issuer: string;
  rows: [string, string][];
  total: [string, string];
  footer: string;
}

export interface VoucherRow {
  code: string;
  booking: string;
  /** «جونسون الحمراء» أو «قسيمة وكالة» */
  where: string;
  service: string;
  validity: string;
  status: string;
  tone: DocTone;
}
export interface VoucherDetail extends VoucherRow {
  subtitle: string;
  hero: { title: string; line: string; pill: string; tone: DocTone };
  rules: [string, string][];
  /** زر الذيل الرئيسي (كحلي) والثانوي */
  primary: { label: string; href: string };
  secondary: "resend" | "close";
}

const LINKAR = "لينكار لخدمات السيارات · الرقم الضريبي 310245889600003 · الرياض";
const THANKS = "شكراً لاختياركم لينكار.";

type Inv = [id: string, booking: string, customer: string, phone: string, service: string, provider: string, date: string, before: string, vat: string, total: string, listed: boolean];
const INVOICES: Inv[] = [
  ["INV-L-2026-10-08812", "BK-21474", "عبدالعزيز ف.", "050 743 7717", "باقة العناية الكاملة · SUV متوسط", "جونسون · فرع الحمراء", "14 أكتوبر 2026", "1,477.39", "221.61", "1,699", true],
  ["INV-L-2026-10-08807", "BK-21475", "ريم س.", "055 124 7830", "Johnson Ceramic Pro · سيدان", "جونسون · فرع الزهراء", "14 أكتوبر 2026", "1,651.30", "247.70", "1,899", true],
  ["INV-L-2026-10-08805", "BK-21473", "منيرة ح.", "053 348 6656", "PPF للواجهة + نانو سيراميك · سيدان", "جونسون · فرع المحمدية", "14 أكتوبر 2026", "2,868.70", "430.30", "3,299", true],
  ["INV-L-2026-10-08803", "BK-21472", "سارة م.", "050 664 2097", "تظليل كامل · سيدان", "لومار · فرع الروضة", "14 أكتوبر 2026", "1,390.43", "208.57", "1,599", false],
  ["INV-L-2026-10-08799", "BK-21470", "يوسف ع.", "053 772 0418", "PPF كامل للسيارة · SUV كبير", "XPEL · فرع العليا", "12 أكتوبر 2026", "7,825.22", "1,173.78", "8,999", false],
  ["INV-L-2026-10-08790", "BK-21468", "ريما د.", "055 209 6631", "نانو سيراميك ثلاث طبقات · سيدان", "نانو شيلد · فرع الروضة", "12 أكتوبر 2026", "1,564.35", "234.65", "1,799", false],
  ["INV-L-2026-10-08781", "BK-21459", "سعود ب.", "050 318 4471", "تفصيل داخلي كامل · SUV كبير", "جونسون · فرع المحمدية", "11 أكتوبر 2026", "564.35", "84.65", "649", false],
  ["INV-L-2026-10-08766", "BK-21452", "محمد س.", "055 123 4567", "Johnson Ceramic Pro + تفصيل داخلي · سيدان", "جونسون · فرع الزهراء", "11 أكتوبر 2026", "2,041.74", "306.26", "2,348", false],
  ["INV-L-2026-10-08742", "BK-21447", "لمى ع.", "055 905 1180", "باقة النانو والتلميع · SUV متوسط", "جونسون · فرع الزهراء", "9 أكتوبر 2026", "1,912.17", "286.83", "2,199", false],
];

type Cn = [id: string, booking: string, customer: string, service: string, provider: string, original: string, date: string, before: string, vat: string, total: string, rowTotal: string];
const CREDITS: Cn[] = [
  ["CN-L-2026-10-00412", "BK-21457", "حمد ش.", "PPF كامل للسيارة · SUV كبير", "XPEL · فرع العليا", "INV-L-2026-10-08420 · RF-2026-0190", "14 أكتوبر 2026", "7,825.22", "1,173.78", "8999", "8,999"],
  ["CN-L-2026-10-00409", "BK-21471", "ماجد ك.", "طبقة طاردة للماء + تلميع · سيدان", "جونسون · فرع الحمراء", "INV-L-2026-10-08744 · RF-2026-0189", "13 أكتوبر 2026", "1,129.57", "169.43", "1299", "1,299"],
];

type Sb = [id: string, month: string, bookings: number, date: string, transfer: string, before: string, vat: string, total: string];
const SELF_BILLING: Sb[] = [
  ["SB-2026-10-0062", "سبتمبر 2026", 334, "1 أكتوبر 2026", "TRF-2026-10-0062", "356,721.74", "53,508.26", "410,230"],
  ["SB-2026-09-0048", "أغسطس 2026", 296, "1 سبتمبر 2026", "TRF-2026-09-0048", "316,591.30", "47,488.70", "364,080"],
];

const ROWS: DocRow[] = [
  ...INVOICES.map(([id, booking, customer, , , , date, , vat, total, listed]): DocRow => ({ id, kind: "invoice", ref: `${booking} · ${customer}`, booking, total: `${total} ر.س`, vat: `${vat} ر.س`, date, status: "صدرت", tone: "success", listed })),
  ...CREDITS.map(([id, booking, customer, , , , date, , vat, , rowTotal]): DocRow => ({ id, kind: "credit", ref: `${booking} · ${customer}`, booking, total: `${rowTotal} ر.س`, vat: `${vat} ر.س`, date, status: "صدرت", tone: "success", listed: true })),
  ...SELF_BILLING.map(([id, month, n, date, , , vat, total]): DocRow => ({ id, kind: "self-billing", ref: `جونسون Johnson · ${month} · ${n} حجزاً`, total: `${total} ر.س`, vat: `${vat} ر.س`, date, status: "صدرت", tone: "success", listed: true })),
];

const VIEWS: Record<string, DocView> = {};
for (const [id, booking, customer, phone, service, provider, date, before, vat, total] of INVOICES)
  VIEWS[id] = {
    id,
    kind: "invoice",
    bar: `فاتورة ضريبية ${id}`,
    title: "فاتورة ضريبية مبسّطة",
    issuer: LINKAR,
    rows: [
      ["الرقم", id],
      ["التاريخ", date],
      ["العميل", `${customer} · ‎${phone}`],
      ["الخدمة", service],
      ["المزوّد المنفّذ", provider],
      ["الحجز", booking],
      ["المبلغ قبل الضريبة", `${before} ر.س`],
      ["ضريبة القيمة المضافة 15%", `${vat} ر.س`],
    ],
    total: ["الإجمالي شامل الضريبة", `${total} ر.س`],
    footer: THANKS,
  };
for (const [id, , customer, service, provider, original, date, before, vat, total] of CREDITS)
  VIEWS[id] = {
    id,
    kind: "credit",
    bar: `إشعار دائن ${id}`,
    title: "إشعار دائن ضريبي",
    issuer: LINKAR,
    rows: [
      ["الرقم", id],
      ["التاريخ", date],
      ["العميل", customer],
      ["الخدمة", service],
      ["المزوّد المنفّذ", provider],
      ["مرجع الفاتورة الأصلية", original],
      ["المبلغ قبل الضريبة", `${before} ر.س`],
      ["ضريبة القيمة المضافة 15%", `${vat} ر.س`],
    ],
    total: ["المبلغ المسترد شامل الضريبة", `${total} ر.س`],
    footer: THANKS,
  };
for (const [id, month, n, date, transfer, before, vat, total] of SELF_BILLING)
  VIEWS[id] = {
    id,
    kind: "self-billing",
    bar: `فاتورة ضريبية · فوترة ذاتية ${id}`,
    title: "فاتورة ضريبية · فوترة ذاتية",
    issuer: "البائع: شركة جونسون للعناية بالسيارات · الرقم الضريبي 311245678900003 · جدة",
    rows: [
      ["الرقم", id],
      ["التاريخ", date],
      ["المشتري", "لينكار لخدمات السيارات · الرقم الضريبي 310245889600003"],
      ["البيان", `خدمات منفّذة لعملاء لينكار · ${month} · ${n} حجزاً`],
      ["الفروع", "جونسون Johnson · 3 فروع"],
      ["التحويل", transfer],
      ["المبلغ قبل الضريبة", `${before} ر.س`],
      ["ضريبة القيمة المضافة 15%", `${vat} ر.س`],
    ],
    total: ["الإجمالي شامل الضريبة", `${total} ر.س`],
    footer: "فاتورة فوترة ذاتية بموجب اتفاقية الأسعار AGR-2025-0117.",
  };

const RULES: [string, string][] = [
  ["الاستخدام", "مرة واحدة · يمسحها الفرع عند التنفيذ"],
  ["الحجز", "بتاريخ فقط · خلال الصلاحية"],
];
const bk = (id: string) => `/bookings?booking=${id}`;
const VOUCHERS: VoucherDetail[] = [
  {
    code: "LK-9H4T-2PWC",
    booking: "BK-21474",
    where: "جونسون الحمراء",
    service: "باقة العناية الكاملة",
    validity: "حتى 28 أكتوبر 2026",
    status: "صالحة",
    tone: "success",
    subtitle: "BK-21474 · عبدالعزيز ف. · جونسون الحمراء",
    hero: { title: "باقة العناية الكاملة · SUV متوسط", line: "حتى 28 أكتوبر 2026", pill: "صالحة", tone: "success" },
    rules: RULES,
    primary: { label: "عرض الحجز", href: bk("BK-21474") },
    secondary: "resend",
  },
  {
    code: "LK-8P3V-6JRC",
    booking: "BK-21475",
    where: "جونسون الزهراء",
    service: "Johnson Ceramic Pro",
    validity: "حتى 28 أكتوبر 2026 · لدى لينكار",
    status: "صالحة",
    tone: "success",
    subtitle: "BK-21475 · ريم س. · جونسون الزهراء",
    hero: { title: "‏Johnson Ceramic Pro · سيدان", line: "حتى 28 أكتوبر 2026 · قرار REQ-0417 قيد النظر", pill: "صالحة · لدى لينكار", tone: "warning" },
    rules: RULES,
    primary: { label: "فتح الطلب REQ-0417", href: "/requests?request=REQ-2026-0417" },
    secondary: "resend",
  },
  {
    code: "LK-3R7D-9KWA",
    booking: "BK-21414",
    where: "قسيمة وكالة",
    service: "Johnson Ceramic Pro",
    validity: "حتى 5 يناير 2027",
    status: "صالحة",
    tone: "success",
    subtitle: "BK-21414 · محمد س. · الريادة PO-2026-01406 · فرع الزهراء",
    hero: { title: "‏Johnson Ceramic Pro · سيدان", line: "حتى 5 يناير 2027", pill: "صالحة · قسيمة وكالة", tone: "success" },
    rules: RULES,
    primary: { label: "عرض الحجز", href: bk("BK-21414") },
    secondary: "resend",
  },
  {
    code: "LK-5C1N-8TQE",
    booking: "BK-21459",
    where: "جونسون المحمدية",
    service: "تفصيل داخلي كامل",
    validity: "استُخدمت 12 أكتوبر 2026",
    status: "مستخدمة",
    tone: "success",
    subtitle: "BK-21459 · سعود ب. · جونسون المحمدية",
    hero: { title: "تفصيل داخلي كامل · SUV كبير", line: "مُسحت 12 أكتوبر 2026 6:10 م", pill: "مستخدمة", tone: "neutral" },
    rules: RULES,
    primary: { label: "عرض الحجز", href: bk("BK-21459") },
    secondary: "close",
  },
  {
    code: "LK-2W8K-6FMA",
    booking: "BK-21471",
    where: "جونسون الحمراء",
    service: "طبقة طاردة للماء + تلميع",
    validity: "أُلغيت 13 أكتوبر 2026",
    status: "ملغاة",
    tone: "danger",
    subtitle: "BK-21471 · ماجد ك. · جونسون الحمراء",
    hero: { title: "طبقة طاردة للماء + تلميع · سيدان", line: "أُلغيت 13 أكتوبر 2026 · RF-2026-0189", pill: "ملغاة", tone: "danger" },
    rules: RULES,
    primary: { label: "عرض الحجز", href: bk("BK-21471") },
    secondary: "close",
  },
];

/** أرقام البطاقات وعدّاد كل تبويب (كل الشهر · الجدول يعرض أحدثها) */
const KPIS = { invoices: 4212, credits: 73, validVouchers: 1240, resent: 64 };
const COUNTS: Record<InvTab, number> = { customer: 4212, provider: 2, credit: 73, vouchers: 2602 };
const KIND: Record<Exclude<InvTab, "vouchers">, DocRow["kind"]> = { customer: "invoice", credit: "credit", provider: "self-billing" };

const log: { id: string; action: "send" | "pdf" | "resend"; at: string }[] = [];

export const invoicesApi = {
  kpis: async () => delay(KPIS, 200),
  list: async ({ tab }: { tab: Exclude<InvTab, "vouchers"> }) => delay({ items: ROWS.filter((r) => r.kind === KIND[tab] && r.listed), total: COUNTS[tab], counts: COUNTS }),
  vouchers: async () => delay({ items: VOUCHERS.map(({ code, booking, where, service, validity, status, tone }): VoucherRow => ({ code, booking, where, service, validity, status, tone })), total: COUNTS.vouchers, counts: COUNTS }),
  /** المستند للعرض (CON5-16V) */
  doc: async (id: string) => {
    const d = VIEWS[id];
    if (!d) throw new ApiError(404, "المستند غير موجود");
    return delay(d, 200);
  },
  /** رابط «الفاتورة الضريبية» / «الإشعار الدائن» من درج الحجز: /invoices?booking=BK-…[&type=credit] → رقم المستند */
  docForBooking: async (booking: string, type?: string) => {
    const r = ROWS.find((x) => x.booking === booking && (type === "credit" ? x.kind === "credit" : x.kind === "invoice"));
    return delay(r?.id ?? null, 100);
  },
  voucher: async (code: string) => {
    const v = VOUCHERS.find((x) => x.code === code);
    if (!v) throw new ApiError(404, "القسيمة غير موجودة");
    return delay(v, 200);
  },
  /** «إرسال للعميل» (العارض) · «إعادة إرسال» (القسيمة) */
  send: async (id: string, action: "send" | "resend" = "send") => {
    log.push({ id, action, at: new Date().toISOString() });
    return delay({ ok: true }, 400);
  },
  /** «تنزيل PDF» — الخادم يرجّع رابط مؤقت */
  pdf: async (id: string) => {
    log.push({ id, action: "pdf", at: new Date().toISOString() });
    return delay({ url: `/files/${id}.pdf` }, 400);
  },
};
