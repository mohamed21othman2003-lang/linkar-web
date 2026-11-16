// الحجوزات (Figma v5 · 04 · الحجوزات 3114:33570 — الإطارات CON5-04 / 04D / 04M / 04N / 04T).
// بيانات تجريبية بنفس شكل الخادم: القائمة بتاخد التبويب والفلاتر والصفحة وبترجع { items, total, counts }.
// الأعداد (2,603 · 1,240 …) جاية من الخادم كإجمالي؛ الصفوف المعروضة هي حجوزات Figma نفسها، والصفحات
// بعد الأولى في «الكل» بتكمّل بحجوزات أقدم (CON5-04D · BK-21438 … BK-21398) وبعدها صفوف مولّدة بنفس الشكل.
import { arDate, num } from "../format";
import { ApiError, delay } from "./errors";

export type BookingStatus = "pending-payment" | "awaiting-visit" | "linkar-decision" | "completed" | "approved" | "cancelled";
export type BookingTab = "all" | "awaiting-visit" | "completed" | "approved" | "cancelled" | "linkar" | "manual";
export const BOOKING_TABS: readonly BookingTab[] = ["all", "awaiting-visit", "completed", "approved", "cancelled", "linkar", "manual"];
export type Channel = "app" | "manual" | "agency" | "marketer";
export type Tone = "success" | "danger" | "muted";

export type KVRow = { k: string; v: string; tone?: Tone; /** القيمة رقم جوال → زر «اتصال» */ call?: boolean };
export type TileRow = KVRow | { sub: string; divider?: boolean } | { link: string; modal?: string; href?: string };
export type DrawerBlock =
  | { kind: "tile"; title: string; rows: TileRow[] }
  | { kind: "contact" }
  | { kind: "prices"; margin?: string; sale?: string }
  | { kind: "link"; label: string; href: string }
  | { kind: "timeline"; steps: { label: string; sub: string; done: boolean }[] }
  | { kind: "note"; text: string };

export interface ProviderContact {
  done: boolean;
  date?: string;
  by?: string;
}
export interface LinkarContact {
  done: boolean;
  satisfied?: boolean;
  employee?: string;
  date?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  /** ترتيب العرض في «الكل» (الأحدث أولاً كما في Figma) */
  order: number;
  /** false = حجز أقدم يفتح بالرابط ومن الصفحات التالية في «الكل» بس */
  listed: boolean;
  customer: { name: string; phone: string };
  providerId: string;
  provider: string;
  branch: string;
  branchCode: string;
  service: string;
  size: string;
  category: string;
  channel: Channel;
  /** أُنشئ من «حجز يدوي» في اللوحة */
  manual?: boolean;
  sale: number;
  cost: number;
  status: BookingStatus;
  /** عمود «القسيمة»: «حتى 28 أكتوبر 2026» · «ملغاة 13 أكتوبر 2026» · «استُخدمت 13 أكتوبر 2026» */
  voucher: string;
  voucherCode?: string;
  /** آخر يوم لصلاحية القسيمة (ISO) — للتمديد */
  validUntil?: string;
  /** وسيلة الدفع الأصلية (الاسترداد بيرجع لها) */
  payMethod?: string;
  /** الفاتورة الضريبية */
  invoice?: string;
  visitDate?: string;
  /** عمود «تاريخ الإلغاء» */
  cancelledAt?: string;
  /** عمود «الطلب» في تبويب «بانتظار قرار لينكار» */
  request?: { id: string; label: string; kind: "unable" | "reschedule" };
  rating?: number;
  providerContact?: ProviderContact;
  linkar?: LinkarContact;
  drawer: {
    sub?: string;
    menu: boolean;
    /** حشو أوسع (رأس 28·14 · مسافة 14 · الأزرار 16·24) — أدراج BK-21438 … و BK-21466 … (3114-37601 · 3114-39411) */
    roomy?: boolean;
    /** شكل أقدم للدرج (CON5-04D · BK-21414): رأس كحلي بأيقونة وخط زمني */
    legacy?: { title: string; line: string };
    hero: { pill?: { label: string; tone: PillKind }; title: string; lines: string[] };
    blocks: DrawerBlock[];
    footer: ("request" | "approve")[];
  };
}

export type PillKind = "linkar" | "visit" | "cancelled" | "approved" | "payment" | "approval";
export const STATUS_PILL: Record<BookingStatus, { label: string; kind: PillKind }> = {
  "pending-payment": { label: "بانتظار الدفع", kind: "payment" },
  "awaiting-visit": { label: "بانتظار الزيارة", kind: "visit" },
  "linkar-decision": { label: "بانتظار قرار لينكار", kind: "linkar" },
  completed: { label: "بانتظار الاعتماد", kind: "approval" },
  approved: { label: "معتمد", kind: "approved" },
  cancelled: { label: "ملغى", kind: "cancelled" },
};

// ───────────── خيارات الفلاتر (CON5-DD · 3114:65411) ─────────────
export const CHANNELS = [
  { value: "app", label: "التطبيق" },
  { value: "manual", label: "حجز يدوي" },
  { value: "agency", label: "وكالة" },
  { value: "marketer", label: "مسوّق" },
] as const;
export const PERIODS = [
  { value: "2026-10", label: "أكتوبر 2026" },
  { value: "2026-09", label: "سبتمبر 2026" },
  { value: "2026-08", label: "أغسطس 2026" },
] as const;
export const CATEGORIES = ["الغسيل والتنظيف", "التلميع", "نانو سيراميك", "حماية PPF", "التظليل", "تغيير اللون"] as const;
export const PROVIDER_OPTS = [
  { value: "lk-jn-001", label: "جونسون" },
  { value: "lk-lm-001", label: "لومار" },
  { value: "lk-xp-001", label: "XPEL" },
  { value: "lk-ns-001", label: "نانو شيلد" },
  { value: "lk-la-001", label: "مركز لمعة للتلميع" },
  { value: "lk-dr-001", label: "مركز درع للحماية" },
  { value: "lk-rm-001", label: "مركز الريم" },
] as const;
export const BRANCH_OPTS = [
  { value: "LK-JN-ZH-001", label: "الزهراء · LK-JN-ZH-001 · ذهبي 89" },
  { value: "LK-JN-HM-002", label: "الحمراء · LK-JN-HM-002 · ذهبي 84" },
  { value: "LK-JN-MH-003", label: "المحمدية · LK-JN-MH-003 · ذهبي 81" },
  { value: "LK-LM-RD-001", label: "الروضة · LK-LM-RD-001 · بلاتيني 93" },
  { value: "LK-XP-OL-001", label: "العليا · LK-XP-OL-001 · بلاتيني 95" },
  { value: "LK-NS-RD-001", label: "الروضة · LK-NS-RD-001 · ذهبي" },
] as const;

// ───────────── البيانات ─────────────
const JN = { providerId: "lk-jn-001", provider: "جونسون" };
const BR = {
  ZH: { ...JN, branch: "الزهراء", branchCode: "LK-JN-ZH-001" },
  HM: { ...JN, branch: "الحمراء", branchCode: "LK-JN-HM-002" },
  MH: { ...JN, branch: "المحمدية", branchCode: "LK-JN-MH-003" },
  LM: { providerId: "lk-lm-001", provider: "لومار", branch: "الروضة", branchCode: "LK-LM-RD-001" },
  XP: { providerId: "lk-xp-001", provider: "XPEL", branch: "العليا", branchCode: "LK-XP-OL-001" },
  NS: { providerId: "lk-ns-001", provider: "نانو شيلد", branch: "الروضة", branchCode: "LK-NS-RD-001" },
};
const tile = (title: string, rows: (TileRow | [string, string, Tone?])[]): DrawerBlock => ({
  kind: "tile",
  title,
  rows: rows.map((r) => (Array.isArray(r) ? { k: r[0], v: r[1], tone: r[2] } : r)),
});
const customerTile = (name: string, phone: string, car: string, history: string) =>
  tile("العميل", [["الاسم", name], { k: "الجوال", v: phone, call: true }, ["السيارة", car], ["حجوزاته على لينكار", history]]);
const prices: DrawerBlock = { kind: "prices" };
const contact: DrawerBlock = { kind: "contact" };
const REEM = "ريم الشهري · خدمة العملاء";

// حجوزات معتمدة أقدم (CON5-04D · BK-21438 … BK-21398): نفس الشكل — الخدمة والمنتج · الأسعار · الضمان · الفاتورة · الكشف
type Old = [id: string, name: string, br: keyof typeof BR, service: string, size: string, date: string, voucher: string, car: string, cost: number, sale: number, product: [string, string][], warranty: string, invoice: string, margin?: string, carLine?: string];
const CERAMIC: [string, string][] = [["المنتج", "Ceramic Pro 9H · بريميوم"], ["الشركة · المنشأ", "Ceramic Pro · الولايات المتحدة"], ["عدد الطبقات · الصلابة", "2 · 9H"]];
const REPEL: [string, string][] = [["المنتج", "Menzerna · ألمانيا"], ["المراحل · الماكينة", "2 · Dual Action"], ["طبقة الحماية", "طبقة بوليمر طاردة للماء"]];
const INTERIOR: [string, string][] = [["المواد", "Koch Chemie · ألمانيا"], ["نوع الغسيل · التعقيم", "يدوي · بخار 150° م"]];
const PPF: [string, string][] = [["الفيلم", "Johnson PPF · JP-850 · Johnson Window Films · الولايات المتحدة"], ["سماكة الفيلم · التئام ذاتي", "8.5 ميل · نعم"], ["التغطية", "الواجهة الأمامية"], ["النانو للهيكل", "Ceramic Pro 9H"]];
const CARE: [string, string][] = [["طبقة طاردة للماء + تلميع", "Menzerna · ألمانيا · مرحلتان · طبقة بوليمر طاردة للماء"], ["تفصيل داخلي كامل", "Koch Chemie · ألمانيا · تعقيم بخار 150° م"]];
const W9 = "9 سنوات · ورقي يسلّمه المركز · صيانة كل 12 شهراً";
const W2 = "سنتان · ورقي يسلّمه المركز";
const W5 = "5 سنوات · ورقي يسلّمه المركز · صيانة كل 6 أشهر";
const W2C = "سنتان للطبقة الطاردة · ورقي يسلّمه المركز";
const W0 = "لا ضمان لهذه الخدمة";
const OLD: Old[] = [
  ["BK-21438", "فهد م.", "HM", "تفصيل داخلي كامل", "سيدان", "10 أكتوبر 2026", "LK-6T2Q-8NHA", "نيسان صني 2022", 360, 449, INTERIOR, W0, "INV-L-2026-10-08530"],
  ["BK-21436", "راكان م.", "HM", "Johnson Ceramic Pro", "SUV متوسط", "9 أكتوبر 2026", "LK-3H9W-2KDT", "تويوتا راف فور 2024", 1760, 2199, CERAMIC, W9, "INV-L-2026-10-08511"],
  ["BK-21434", "دانة ر.", "ZH", "Johnson Ceramic Pro", "سيدان", "9 أكتوبر 2026", "LK-8M4E-5QRA", "هوندا سيفيك 2024", 1520, 1899, CERAMIC, W9, "INV-L-2026-10-08498"],
  ["BK-21432", "ريان هـ.", "MH", "PPF للواجهة + نانو سيراميك", "SUV متوسط", "9 أكتوبر 2026", "LK-2C7N-9WPE", "كيا سورينتو 2025", 3200, 3799, PPF, W5, "INV-L-2026-10-08487"],
  ["BK-21429", "عبير ح.", "HM", "باقة العناية الكاملة", "سيدان", "8 أكتوبر 2026", "LK-5R1D-7TMB", "هيونداي أكسنت 2023", 1240, 1499, CARE, W2C, "INV-L-2026-10-08455"],
  ["BK-21426", "أحمد ز.", "MH", "Johnson Ceramic Pro", "SUV كبير", "9 أكتوبر 2026", "LK-4K8P-3SVA", "جي إم سي يوكن 2023", 1990, 2499, CERAMIC, W9, "INV-L-2026-10-08470"],
  ["BK-21421", "تركي س.", "HM", "طبقة طاردة للماء + تلميع", "SUV متوسط", "7 أكتوبر 2026", "LK-9D3F-6HNC", "كيا سبورتاج 2023", 1240, 1499, REPEL, W2, "INV-L-2026-10-08402"],
  ["BK-21419", "نوف ر.", "ZH", "طبقة طاردة للماء + تلميع", "SUV متوسط", "8 أكتوبر 2026", "LK-7A2M-4RQD", "هيونداي توسان 2022", 1240, 1499, REPEL, W2, "INV-L-2026-10-08441"],
  ["BK-21417", "ناصر ع.", "ZH", "Johnson Ceramic Pro", "سيدان", "8 أكتوبر 2026", "LK-1Q6T-8BWE", "هوندا أكورد 2024", 1520, 1599, CERAMIC, W9, "INV-L-2026-10-08433", "9.48 ر.س"],
  ["BK-21413", "جواهر س.", "MH", "باقة العناية الكاملة", "SUV متوسط", "5 أكتوبر 2026", "LK-3W5H-2MFA", "تويوتا هايلاندر 2022", 1400, 1699, CARE, W2C, "INV-L-2026-10-08279"],
  ["BK-21412", "وليد ش.", "HM", "Johnson Ceramic Pro", "سيدان", "4 أكتوبر 2026", "LK-8N2K-5DTE", "تويوتا كامري 2021", 1520, 1899, CERAMIC, W9, "INV-L-2026-10-08266"],
  ["BK-21408", "بدر م.", "HM", "طبقة طاردة للماء + تلميع", "سيدان", "4 أكتوبر 2026", "LK-D4V7-1QHC", "", 1080, 1150, REPEL, W2, "", undefined, "العميل: بدر المحمادي · قسيمة الريادة للسيارات"],
  ["BK-21406", "عمر ف.", "ZH", "تفصيل داخلي كامل", "سيدان", "4 أكتوبر 2026", "LK-2E9R-7KPA", "نيسان باترول 2020", 360, 449, INTERIOR, W0, "INV-L-2026-10-08243"],
  ["BK-21403", "عبدالله ق.", "MH", "طبقة طاردة للماء + تلميع", "سيدان", "3 أكتوبر 2026", "LK-6F1B-9TWD", "تويوتا كورولا 2022", 1080, 1299, REPEL, W2, "INV-L-2026-10-08211"],
  ["BK-21400", "ليان م.", "ZH", "PPF للواجهة + نانو سيراميك", "سيدان", "3 أكتوبر 2026", "LK-7H3C-2NMA", "مازدا CX-30 2024", 2780, 3299, PPF, W5, "INV-L-2026-10-08197"],
  ["BK-21398", "فيصل د.", "HM", "PPF للواجهة + نانو سيراميك", "سيدان", "3 أكتوبر 2026", "LK-5Q8D-3VRE", "لكزس IS 2024", 2780, 3299, PPF, W5, "INV-L-2026-10-08190"],
];

function categoryOf(service: string) {
  if (/PPF/.test(service)) return "حماية PPF";
  if (/تظليل/.test(service)) return "التظليل";
  if (/Ceramic|نانو|النانو/.test(service)) return "نانو سيراميك";
  if (/طاردة|تلميع|العناية/.test(service)) return "التلميع";
  return "الغسيل والتنظيف";
}

// «كشف جونسون · أكتوبر» و«الفاتورة الضريبية» بيفتحوا صفحات أقسام تانية (مستحقات المزوّدين · الفواتير)
const statementLink: DrawerBlock = { kind: "link", label: "كشف جونسون · أكتوبر", href: "/dues?provider=lk-jn-001&period=2026-10" };
const invoiceLink = (inv: string): DrawerBlock =>
  inv ? { kind: "link", label: `الفاتورة الضريبية · ${inv}`, href: `/invoices?invoice=${inv}` } : { kind: "link", label: "فاتورة الريادة للسيارات · أكتوبر", href: "/invoices?q=الريادة" };

function oldBooking([id, name, br, service, size, date, code, car, cost, sale, product, warranty, invoice, margin, carLine]: Old, order: number, status: "approved" | "completed" = "approved"): Booking {
  return {
    id,
    order,
    listed: status === "completed",
    customer: { name, phone: "" },
    ...BR[br],
    service,
    size,
    category: categoryOf(service),
    channel: carLine ? "agency" : "app",
    sale,
    cost,
    status,
    voucher: `استُخدمت ${date}`,
    voucherCode: code,
    invoice: invoice || undefined,
    payMethod: "مدى",
    rating: status === "approved" ? 5 : undefined,
    drawer: {
      sub: `${name} · جونسون · فرع ${BR[br].branch}`,
      menu: status === "completed",
      roomy: true,
      hero: {
        title: `${service} · ${size}`,
        lines: [`نُفّذ ${date} بمسح القسيمة ${code}`, carLine ?? `السيارة: ${car}`],
      },
      blocks: [
        tile("الخدمة والمنتج", [["الخدمة", service], ["الحجم", size], ...product]),
        { kind: "prices", margin },
        tile("الضمان", [["الضمان", warranty]]),
        ...(status === "completed" ? [tile("تجربة العميل", [])] : []),
        invoiceLink(invoice),
        statementLink,
      ],
      footer: status === "completed" ? ["approve"] : [],
    },
  };
}

// المكتملة بانتظار اعتماد لينكار (CON5-04D · BK-21466 … BK-21460 · تبويب «مكتملة» 3114:33711)
const DONE: Old[] = [
  ["BK-21466", "مازن ق.", "HM", "تفصيل داخلي كامل", "سيدان", "14 أكتوبر 2026", "LK-2P7K-9TQA", "هيونداي إلنترا 2023", 360, 449, INTERIOR, W0, "INV-L-2026-10-08836"],
  ["BK-21465", "هالة ع.", "HM", "Johnson Ceramic Pro", "SUV متوسط", "14 أكتوبر 2026", "LK-7W3N-4HDA", "كيا سبورتاج 2025", 1760, 2199, CERAMIC, W9, "INV-L-2026-10-08829"],
  ["BK-21463", "جود م.", "ZH", "Johnson Ceramic Pro", "سيدان", "14 أكتوبر 2026", "LK-4Q8R-2MEA", "تويوتا كامري 2024", 1520, 1899, CERAMIC, W9, "INV-L-2026-10-08821"],
  ["BK-21462", "سامي ر.", "HM", "طبقة طاردة للماء + تلميع", "سيدان", "14 أكتوبر 2026", "LK-9C1T-6WNA", "هوندا سيفيك 2022", 1080, 1299, REPEL, W2, "INV-L-2026-10-08817"],
  ["BK-21461", "رنا ك.", "ZH", "تفصيل داخلي كامل", "SUV متوسط", "14 أكتوبر 2026", "LK-5H6M-3KRA", "نيسان إكس تريل 2023", 440, 549, INTERIOR, W0, "INV-L-2026-10-08814"],
  ["BK-21460", "خالد ب.", "MH", "طبقة طاردة للماء + تلميع", "SUV كبير", "14 أكتوبر 2026", "LK-8D2F-7QPA", "تويوتا لاندكروزر 2021", 1400, 1699, REPEL, W2, "INV-L-2026-10-08813"],
];

const MAIN: Booking[] = [
  {
    id: "BK-21475",
    payMethod: "تابي",
    validUntil: "2026-10-28",
    order: 10,
    listed: true,
    customer: { name: "ريم س.", phone: "055 124 7830" },
    ...BR.ZH,
    service: "Johnson Ceramic Pro",
    size: "سيدان",
    category: "نانو سيراميك",
    channel: "app",
    sale: 1899,
    cost: 1520,
    status: "linkar-decision",
    voucher: "حتى 28 أكتوبر 2026",
    voucherCode: "LK-8P3V-6JRC",
    request: { id: "REQ-2026-0417", label: "تعذّر قبول الخدمة", kind: "unable" },
    drawer: {
      menu: false,
      hero: {
        title: "Johnson Ceramic Pro · سيدان",
        lines: ["تم الدفع · تابي · 14 أكتوبر 2026", "طلب تعذّر من الفرع REQ-2026-0417 · نفاد المادة", "القسيمة LK-8P3V-6JRC · صالحة حتى 28 أكتوبر 2026"],
      },
      blocks: [
        tile("الخدمة", [["الخدمة", "Johnson Ceramic Pro"], ["الحجم", "سيدان"], ["الفرع", "جونسون · فرع الزهراء"], ["المنتج", "Ceramic Pro 9H · بريميوم"], ["الشركة · المنشأ", "Ceramic Pro · الولايات المتحدة"], ["عدد الطبقات · الصلابة", "2 · 9H"], ["الضمان", "9 سنوات"]]),
        prices,
        customerTile("ريم س.", "055 124 7830", "تويوتا كورولا 2024 · سيدان", "1 · هذا أول حجز"),
      ],
      footer: ["request"],
    },
  },
  {
    id: "BK-21474",
    payMethod: "مدى",
    validUntil: "2026-10-28",
    order: 20,
    listed: true,
    customer: { name: "عبدالعزيز ف.", phone: "050 743 7717" },
    ...BR.HM,
    service: "باقة العناية الكاملة",
    size: "SUV متوسط",
    category: "التلميع",
    channel: "app",
    sale: 1699,
    cost: 1400,
    status: "awaiting-visit",
    voucher: "حتى 28 أكتوبر 2026",
    voucherCode: "LK-9H4T-2PWC",
    visitDate: "16 أكتوبر 2026",
    providerContact: { done: true, date: "14 أكتوبر 2026", by: "عبدالله الغامدي · مدير فرع الحمراء" },
    linkar: { done: true, satisfied: true, employee: REEM, date: "14 أكتوبر 2026", notes: "أكّد العميل موعد الزيارة 16 أكتوبر 2026." },
    drawer: {
      menu: true,
      hero: { title: "باقة العناية الكاملة · SUV متوسط", lines: ["تم الدفع · مدى · 14 أكتوبر 2026", "القسيمة LK-9H4T-2PWC · صالحة حتى 28 أكتوبر 2026"] },
      blocks: [
        tile("الخدمة", [
          ["الخدمة", "باقة العناية الكاملة"],
          ["المكوّنات", "طبقة طاردة للماء + تلميع + تفصيل داخلي كامل"],
          ["الحجم", "SUV متوسط"],
          ["الفرع", "جونسون · فرع الحمراء"],
          ["طبقة طاردة للماء + تلميع", "Menzerna · ألمانيا · مرحلتان · طبقة بوليمر · ضمان سنتان (للطبقة الطاردة)"],
          ["تفصيل داخلي كامل", "Koch Chemie · ألمانيا · تعقيم بخار 150° م · بدون ضمان"],
        ]),
        tile("الموعد", [["موعد الزيارة", "16 أكتوبر 2026"]]),
        contact,
        prices,
        customerTile("عبدالعزيز ف.", "050 743 7717", "هيونداي سانتافي 2024 · SUV متوسط", "3 · آخرها مكتمل في أغسطس"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21473",
    payMethod: "Apple Pay",
    validUntil: "2026-10-28",
    order: 30,
    listed: true,
    customer: { name: "منيرة ح.", phone: "053 348 6656" },
    ...BR.MH,
    service: "PPF للواجهة + نانو سيراميك",
    size: "سيدان",
    category: "حماية PPF",
    channel: "app",
    sale: 3299,
    cost: 2780,
    status: "awaiting-visit",
    voucher: "حتى 28 أكتوبر 2026",
    voucherCode: "LK-7Q2M-4KDA",
    visitDate: "18 أكتوبر 2026",
    providerContact: { done: false },
    linkar: { done: false },
    drawer: {
      menu: true,
      hero: { title: "PPF للواجهة + نانو سيراميك · سيدان", lines: ["تم الدفع · Apple Pay · 14 أكتوبر 2026", "القسيمة LK-7Q2M-4KDA · صالحة حتى 28 أكتوبر 2026"] },
      blocks: [
        tile("الخدمة", [
          ["الخدمة", "PPF للواجهة + نانو سيراميك"],
          ["الحجم", "سيدان"],
          ["الفرع", "جونسون · فرع المحمدية"],
          ["الفيلم", "Johnson PPF · JP-850 · Johnson Window Films · الولايات المتحدة"],
          ["سماكة الفيلم · التئام ذاتي", "8.5 ميل · نعم"],
          ["التغطية · التشطيب", "الواجهة الأمامية · لامع"],
          ["النانو للهيكل", "Ceramic Pro 9H"],
          ["الضمان", "5 سنوات"],
        ]),
        tile("الموعد", [["موعد الزيارة", "18 أكتوبر 2026"]]),
        contact,
        prices,
        customerTile("منيرة ح.", "053 348 6656", "مرسيدس C200 2025 · سيدان", "1 · هذا أول حجز"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21472",
    payMethod: "مدى",
    validUntil: "2026-10-28",
    order: 40,
    listed: true,
    customer: { name: "سارة م.", phone: "050 664 2097" },
    ...BR.LM,
    service: "تظليل كامل",
    size: "سيدان",
    category: "التظليل",
    channel: "app",
    sale: 1599,
    cost: 1300,
    status: "linkar-decision",
    voucher: "حتى 28 أكتوبر 2026",
    voucherCode: "LK-3HD8-W1QZ",
    visitDate: "20 أكتوبر 2026",
    request: { id: "REQ-2026-0436", label: "إعادة جدولة", kind: "reschedule" },
    drawer: {
      menu: false,
      hero: { title: "تظليل كامل · سيدان", lines: ["تم الدفع · مدى · 14 أكتوبر 2026", "القسيمة LK-3HD8-W1QZ · صالحة حتى 28 أكتوبر 2026"] },
      blocks: [
        tile("الخدمة", [["الخدمة", "تظليل كامل"], ["الحجم", "سيدان"], ["الفرع", "لومار · فرع الروضة"], ["الفيلم", "LLumar IRX"], ["الضمان", "10 سنوات"], ["شهادة المنتج", "بانتظار الاعتماد · REQ-2026-0440"]]),
        tile("الموعد", [
          ["موعد الزيارة", "20 أكتوبر 2026"],
          ["تواصل المزوّد", "تم التواصل", "success"],
          ["إعادة الجدولة", "REQ-2026-0436 · يقترح الفرع 22 أكتوبر 2026 (أو 22 – 24) · امتلاء الطاقة الاستيعابية للفرع"],
        ]),
        prices,
        customerTile("سارة م.", "050 664 2097", "هوندا أكورد 2022 · سيدان", "2 · آخرها مكتمل في يونيو"),
      ],
      footer: ["request"],
    },
  },
  {
    id: "BK-21471",
    payMethod: "تمارا",
    order: 50,
    listed: true,
    customer: { name: "ماجد ك.", phone: "056 418 9930" },
    ...BR.HM,
    service: "طبقة طاردة للماء + تلميع",
    size: "سيدان",
    category: "التلميع",
    channel: "app",
    sale: 1299,
    cost: 1080,
    status: "cancelled",
    voucher: "ملغاة 13 أكتوبر 2026",
    cancelledAt: "13 أكتوبر 2026",
    drawer: {
      menu: false,
      hero: {
        title: "طبقة طاردة للماء + تلميع · سيدان",
        lines: ["تم الدفع · تمارا · 13 أكتوبر 2026", "أُلغي 13 أكتوبر 2026 بطلب العميل (تغيّرت خطته)", "استُرد 1,299 ر.س إلى تمارا · RF-2026-0189"],
      },
      blocks: [
        tile("الخدمة", [["الخدمة", "طبقة طاردة للماء + تلميع"], ["الحجم", "سيدان"], ["الفرع", "جونسون · فرع الحمراء"], ["المنتج", "Menzerna · ألمانيا"], ["المراحل · الماكينة", "2 · Dual Action"], ["طبقة الحماية", "طبقة بوليمر طاردة للماء"], ["الضمان", "سنتان (للطبقة الطاردة)"]]),
        { kind: "prices", margin: "—" },
        customerTile("ماجد ك.", "056 418 9930", "لكزس ES 2023 · سيدان", "4 · آخرها مكتمل في سبتمبر"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21470",
    payMethod: "تابي",
    validUntil: "2026-10-26",
    order: 60,
    listed: true,
    customer: { name: "يوسف ع.", phone: "053 772 0418" },
    ...BR.XP,
    service: "PPF كامل للسيارة",
    size: "SUV كبير",
    category: "حماية PPF",
    channel: "app",
    sale: 8999,
    cost: 7400,
    status: "awaiting-visit",
    voucher: "حتى 26 أكتوبر 2026",
    voucherCode: "LK-5MXA-88RT",
    visitDate: "17 أكتوبر 2026",
    providerContact: { done: false },
    linkar: { done: true, satisfied: false, employee: REEM, date: "13 أكتوبر 2026", notes: "يطلب العميل موعداً أقرب من 17 أكتوبر 2026." },
    drawer: {
      menu: true,
      hero: {
        title: "PPF كامل للسيارة · SUV كبير",
        lines: ["تم الدفع · تابي · 12 أكتوبر 2026", "القسيمة LK-5MXA-88RT · صالحة حتى 26 أكتوبر 2026", "على فرع العليا طلب إيقاف مؤقت REQ-2026-0414"],
      },
      blocks: [
        tile("الخدمة", [["الخدمة", "PPF كامل للسيارة"], ["الحجم", "SUV كبير"], ["الفرع", "XPEL · فرع العليا"], ["الفيلم", "XPEL Ultimate Plus"], ["رقم الشهادة", "XP-UP-2024-031"], ["الضمان", "10 سنوات"]]),
        tile("الموعد", [["موعد الزيارة", "17 أكتوبر 2026"]]),
        contact,
        prices,
        customerTile("يوسف ع.", "053 772 0418", "لكزس LX 2025 · SUV كبير", "1 · هذا أول حجز"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21468",
    payMethod: "مدى",
    order: 70,
    listed: true,
    customer: { name: "ريما د.", phone: "055 209 6631" },
    ...BR.NS,
    service: "نانو سيراميك ثلاث طبقات",
    size: "سيدان",
    category: "نانو سيراميك",
    channel: "app",
    sale: 1799,
    cost: 1450,
    status: "approved",
    voucher: "استُخدمت 13 أكتوبر 2026",
    rating: 5,
    drawer: {
      menu: true,
      hero: {
        title: "نانو سيراميك ثلاث طبقات · سيدان",
        lines: ["تم الدفع · مدى · 12 أكتوبر 2026", "نُفّذ 13 أكتوبر 2026 · مُسحت القسيمة في الفرع", "تقييم العميل ★5 · ضمان ورقي 5 سنوات من الفرع"],
      },
      blocks: [
        tile("تجربة العميل", [["الشكاوى", "لا توجد"], ["رد المركز", "—"], { link: "تقييم بالنيابة عن العميل", modal: "rate" }]),
        tile("تفاصيل الخدمة", [
          ["خدمة المركز", "نانو سيراميك ثلاث طبقات · نانو شيلد"],
          ["المنتج", "Nano Shield 9H · Nano Shield · الإمارات · 3 طبقات"],
          ["الضمان", "ورقي 5 سنوات · سلّمه فرع الروضة"],
          ["التنفيذ", "فرع الروضة · مسح القسيمة 13 أكتوبر 2026"],
          { link: "صفحة الخدمة في الكتالوج", href: "/providers/lk-ns-001?tab=services" },
        ]),
        prices,
        customerTile("ريما د.", "055 209 6631", "مرسيدس C200 2023 · سيدان", "3 · آخرها مكتمل في أغسطس"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21459",
    payMethod: "مدى",
    order: 80,
    listed: true,
    customer: { name: "سعود ب.", phone: "050 318 4471" },
    ...BR.MH,
    service: "تفصيل داخلي كامل",
    size: "SUV كبير",
    category: "الغسيل والتنظيف",
    channel: "app",
    sale: 649,
    cost: 520,
    status: "approved",
    voucher: "استُخدمت 12 أكتوبر 2026",
    rating: 3,
    drawer: {
      menu: true,
      hero: {
        title: "تفصيل داخلي كامل · SUV كبير",
        lines: ["تم الدفع · مدى · 11 أكتوبر 2026", "نُفّذ 12 أكتوبر 2026 · تقييم العميل ★3 · رد المركز بانتظار الاعتماد", "لا ضمان لهذه الخدمة"],
      },
      blocks: [
        tile("تجربة العميل", [
          ["التقييم", "★3 · RV-88402 · منشور"],
          ["الجوانب", "جودة العمل ★3 · التعامل ★4 · القيمة ★3 · العناية بالسيارة ★2"],
          ["تعليق العميل", "«التنظيف الداخلي مقبول، لكن بقيت آثار طين على الدواسات والسقف ما تنظّف كويس.»"],
          ["رد المركز", "كتبه ياسر العمري · بانتظار اعتماد لينكار قبل النشر"],
          ["الشكاوى", "لا توجد"],
          { link: "عرض التقييم والرد · RV-88402", href: "/reviews?review=RV-88402" },
        ]),
        tile("تفاصيل الخدمة", [
          ["خدمة المركز", "تفصيل داخلي كامل · جونسون"],
          ["الخدمة", "تفصيل داخلي كامل · داخلي عميق"],
          ["يشمل", "شفط كامل · غسيل المقاعد · تنظيف السقف · تلميع التابلوه"],
          ["المواد", "Koch Chemie · يدوي داخل المغسلة · تعقيم بخار 150° م"],
          ["التنفيذ", "فرع المحمدية · مسح القسيمة فيصل القحطاني (فني الفرع) · 12 أكتوبر 2026"],
          { link: "صفحة الخدمة في الكتالوج", href: "/providers/lk-jn-001?tab=services" },
        ]),
        prices,
        customerTile("سعود ب.", "050 318 4471", "تويوتا لاندكروزر 2022 · SUV كبير", "2 · آخرها مكتمل في مايو"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21452",
    payMethod: "مدى",
    validUntil: "2026-10-25",
    order: 90,
    listed: true,
    customer: { name: "محمد س.", phone: "055 123 4567" },
    ...BR.ZH,
    service: "Johnson Ceramic Pro + تفصيل داخلي",
    size: "سيدان",
    category: "نانو سيراميك",
    channel: "app",
    sale: 2348,
    cost: 1880,
    status: "awaiting-visit",
    voucher: "حتى 25 أكتوبر 2026",
    voucherCode: "LK-9F3K-7QPD",
    visitDate: "19 أكتوبر 2026",
    providerContact: { done: true, date: "12 أكتوبر 2026", by: "خالد الزهراني · مدير فرع الزهراء" },
    linkar: { done: true, satisfied: true, employee: REEM, date: "13 أكتوبر 2026", notes: "أكّد العميل موعده الجديد 19 أكتوبر 2026." },
    drawer: {
      menu: true,
      hero: { title: "Johnson Ceramic Pro + تفصيل داخلي · سيدان", lines: ["تم الدفع · مدى · 11 أكتوبر 2026", "القسيمة LK-9F3K-7QPD · صالحة حتى 25 أكتوبر 2026"] },
      blocks: [
        tile("الخدمة", [
          ["الخدمة", "Johnson Ceramic Pro + تفصيل داخلي"],
          ["الحجم", "سيدان"],
          ["الفرع", "جونسون · فرع الزهراء"],
          ["Johnson Ceramic Pro", "Ceramic Pro 9H · بريميوم · الولايات المتحدة · طبقتان · 9H · ضمان 9 سنوات"],
          ["تفصيل داخلي كامل", "Koch Chemie · ألمانيا · تعقيم بخار 150° م · بدون ضمان"],
        ]),
        tile("الموعد", [["موعد الزيارة", "19 أكتوبر 2026 (كان 15 أكتوبر 2026)"]]),
        contact,
        prices,
        customerTile("محمد س.", "055 123 4567", "تويوتا كامري 2023 · سيدان", "2 · آخرها مكتمل في سبتمبر"),
      ],
      footer: [],
    },
  },
  {
    id: "BK-21447",
    payMethod: "تمارا",
    order: 100,
    listed: true,
    customer: { name: "لمى ع.", phone: "055 905 1180" },
    ...BR.ZH,
    service: "باقة النانو والتلميع",
    size: "SUV متوسط",
    category: "نانو سيراميك",
    channel: "app",
    sale: 2199,
    cost: 1760,
    status: "approved",
    voucher: "استُخدمت 11 أكتوبر 2026",
    rating: 5,
    drawer: {
      menu: true,
      hero: { title: "باقة النانو والتلميع · SUV متوسط", lines: ["تم الدفع · تمارا · 9 أكتوبر 2026", "نُفّذ 11 أكتوبر 2026 · تقييم العميل ★5", "ضمان ورقي 9 سنوات للنانو · سلّمه فرع الزهراء"] },
      blocks: [
        tile("تجربة العميل", [
          ["التقييم", "★5 · RV-88391 · منشور"],
          ["الجوانب", "جودة العمل ★5 · التعامل ★5 · القيمة ★4 · العناية بالسيارة ★5"],
          ["تعليق العميل", "«النانو سيراميك ممتاز والتعامل راقٍ.»"],
          ["رد المركز", "لا يوجد"],
          ["الشكاوى", "لا توجد"],
          { link: "عرض التقييم · RV-88391", href: "/reviews?review=RV-88391" },
        ]),
        tile("تفاصيل الخدمة", [
          ["الباقة", "باقة النانو والتلميع · جونسون"],
          ["مكوّناتها", "Johnson Ceramic Pro (طبقتان · Ceramic Pro 9H) + تلميع ثلاث مراحل (Menzerna)"],
          ["الضمان", "ورقي 9 سنوات للنانو · صيانة كل 12 شهراً · سلّمه فرع الزهراء"],
          ["التنفيذ", "فرع الزهراء · مسح القسيمة ماجد الحربي (فني الفرع) · 11 أكتوبر 2026"],
          { link: "صفحة الخدمة في الكتالوج", href: "/providers/lk-jn-001?tab=services" },
        ]),
        prices,
        customerTile("لمى ع.", "055 905 1180", "هيونداي توسان 2023 · SUV متوسط", "1 · هذا أول حجز"),
      ],
      footer: [],
    },
  },
  // حجز من بوابة المسوّقين (CON5-04D · BK-21490 · بانتظار الدفع · من المسوّق 3114:39882)
  {
    id: "BK-21490",
    order: 110,
    listed: false,
    customer: { name: "فهد الغامدي", phone: "055 731 4402" },
    ...BR.ZH,
    service: "Johnson Ceramic Pro + تفصيل داخلي كامل",
    size: "سيدان",
    category: "نانو سيراميك",
    channel: "marketer",
    sale: 1958.96,
    cost: 1880,
    status: "pending-payment",
    voucher: "حتى 15 أكتوبر 2026",
    drawer: {
      // Figma ما رسمش ⋯ في هذا الدرج؛ أضفناه عشان «إعادة إرسال رابط الدفع» و«إلغاء حجز غير مدفوع» (3114-39952 · 3114-39956)
      menu: true,
      hero: { title: "Johnson Ceramic Pro + تفصيل داخلي كامل · سيدان", lines: ["حجز من المسوّق تركي الحارثي · SM123 · 14 أكتوبر 2026 2:30 م", "رابط الدفع صالح حتى 15 أكتوبر 2026 2:30 م"] },
      blocks: [
        tile("الخدمة", [["الخدمة", "Johnson Ceramic Pro + تفصيل داخلي كامل"], ["الحجم", "سيدان"], ["الفرع", "جونسون · فرع الزهراء"]]),
        { kind: "prices", margin: "78.96 ر.س", sale: " ر.س" },
        tile("العميل", [["الاسم", "فهد الغامدي · عميل جديد"], { k: "الجوال", v: "055 731 4402", call: true }, ["السيارة", "تويوتا كامري 2026 · سيدان"], ["ملاحظة داخلية", "عميل المسوّق SM123 · عمولته 89.04 ر.س بعد الدفع"]]),
      ],
      footer: [],
    },
  },
  // حجز وكالة (CON5-04D · BK-21414 3114:37162) — شكل الدرج الأقدم
  {
    id: "BK-21414",
    order: 120,
    listed: false,
    customer: { name: "محمد س.", phone: "" },
    ...BR.ZH,
    service: "Johnson Ceramic Pro",
    size: "سيدان",
    category: "نانو سيراميك",
    channel: "agency",
    sale: 1899,
    cost: 1520,
    status: "awaiting-visit",
    voucher: "حتى 5 يناير 2027",
    providerContact: { done: false },
    linkar: { done: false },
    drawer: {
      sub: "جونسون · فرع الزهراء",
      menu: false,
      roomy: true,
      legacy: { title: "Johnson Ceramic Pro", line: "محمد س. · كامري 2026" },
      hero: { title: "", lines: [] },
      blocks: [
        tile("الخدمة والمنتج", [["الخدمة", "Johnson Ceramic Pro"], ["المنتج", "Ceramic Pro 9H · بريميوم"], ["الشركة · المنشأ", "Ceramic Pro · الولايات المتحدة"], ["عدد الطبقات · الصلابة", "2 · 9H"]]),
        {
          kind: "timeline",
          steps: [
            { label: "حُجز ودُفع", sub: "عبر وكالة · PO-2026-01406", done: true },
            { label: "بانتظار الزيارة", sub: "صالحة حتى 5 يناير 2027", done: true },
            { label: "مكتمل", sub: "—", done: false },
          ],
        },
        tile("تفاصيل الحجز", [["المركز والفرع", "جونسون · فرع الزهراء"], ["القناة", "وكالة · PO-2026-01406"], ["الدفع", "قسيمة وكالة · الريادة للسيارات"]]),
        contact,
        { kind: "note", text: "مدفوعة من الريادة للسيارات · PO-2026-01406" },
      ],
      footer: [],
    },
  },
];

const clone = <T,>(v: T): T => structuredClone(v);
let store: Booking[] = [...MAIN, ...DONE.map((d, i) => oldBooking(d, 200 + i, "completed")), ...OLD.map((d, i) => oldBooking(d, 300 + i))];
const SEED = clone(store);

// ───────────── الأعداد ─────────────
// الإجمالي من الخادم (CON5-04 3114:33571): الأعداد = إجمالي Figma − حجوزات Figma المعروضة + الحالية، فأي إجراء بيغيّرها
const statusTab = (b: Booking): BookingTab =>
  b.status === "pending-payment" ? (b.manual ? "manual" : "all") : b.status === "awaiting-visit" ? "awaiting-visit" : b.status === "linkar-decision" ? "linkar" : (b.status as BookingTab);
const FIGMA_COUNTS: Record<BookingTab, number> = { all: 2603, "awaiting-visit": 1240, completed: 6, approved: 1282, cancelled: 73, linkar: 2, manual: 0 };
function rawCounts(list: Booking[]) {
  const c = Object.fromEntries(BOOKING_TABS.map((t) => [t, 0])) as Record<BookingTab, number>;
  for (const b of list) {
    if (b.status === "pending-payment" && !b.manual) continue; // حجز المسوّق قبل الدفع ما يتحسبش
    c.all++;
    const t = statusTab(b);
    if (t !== "all") c[t]++;
  }
  return c;
}
const SEED_COUNTS = rawCounts(SEED);
function counts() {
  const now = rawCounts(store);
  return Object.fromEntries(BOOKING_TABS.map((t) => [t, FIGMA_COUNTS[t] - SEED_COUNTS[t] + now[t]])) as Record<BookingTab, number>;
}

// ───────────── «حجوزات جديدة بانتظار التواصل» (CON7 في 3114:33571) ─────────────
export interface ContactRow {
  provider: string;
  /** null = صف «مزوّدون آخرون» */
  providerId: string | null;
  branches: number;
  branchLine?: string;
  fresh: number;
  providerContacted: number;
  linkarContacted: number;
  nearest: string;
  /** أقرب موعد ISO (الرئيسية بتنسّقه بنفسها) */
  nearestIso: string | null;
}
// مصدر واحد لأعداد «حجوزات جديدة بانتظار التواصل» — الرئيسية (overviewApi) والحجوزات وملف المزوّد بيقروا من هنا
const CONTACT_ROWS: (ContactRow & { ids: string[] })[] = [
  { provider: "XPEL السعودية", providerId: "lk-xp-001", branches: 5, branchLine: "العليا · الملقا · +3 أخرى", fresh: 24, providerContacted: 23, linkarContacted: 24, nearest: "17 أكتوبر 2026", nearestIso: "2026-10-17", ids: [] },
  { provider: "لومار", providerId: "lk-lm-001", branches: 4, branchLine: "الروضة · الياسمين · +2 أخرى", fresh: 19, providerContacted: 19, linkarContacted: 19, nearest: "16 أكتوبر 2026", nearestIso: "2026-10-16", ids: [] },
  { provider: "جونسون", providerId: "lk-jn-001", branches: 3, branchLine: "الحمراء · المحمدية · الزهراء", fresh: 14, providerContacted: 13, linkarContacted: 13, nearest: "16 أكتوبر 2026", nearestIso: "2026-10-16", ids: ["BK-21473"] },
  { provider: "مزوّدون آخرون (14)", providerId: null, branches: 29, fresh: 129, providerContacted: 129, linkarContacted: 129, nearest: "—", nearestIso: null, ids: [] },
];
// الأرقام الأساسية من غير الحجوزات المتتبَّعة (BK-21473 لسه ما اتواصلش معاها لينكار → 13 من 14 · وبعد التواصل 14 من 14 و«تم التواصل مع 186»)
export function contactSummary() {
  let extra = 0;
  const rows: ContactRow[] = CONTACT_ROWS.map(({ ids, ...r }) => {
    const done = ids.filter((id) => store.find((b) => b.id === id)?.linkar?.done).length;
    extra += done;
    return { ...r, linkarContacted: r.linkarContacted + done };
  });
  return { fresh: 186, branches: 41, providers: 17, contacted: 185 + extra, rows };
}

// ───────────── الطلبات ─────────────
export type BookingQuery = { tab?: BookingTab; q?: string; provider?: string; branch?: string; category?: string; period?: string; channel?: string; page?: number };
export const PAGE_SIZE = 10;

const matches = (b: Booking, f: BookingQuery) => {
  const s = f.q?.trim().replace(/\s/g, "");
  if (s && !(b.id.toLowerCase().includes(s.toLowerCase()) || b.customer.phone.replace(/\s/g, "").includes(s) || b.customer.name.includes(f.q!.trim()))) return false;
  if (f.provider && b.providerId !== f.provider) return false;
  if (f.branch && b.branchCode !== f.branch) return false;
  if (f.category && b.category !== f.category) return false;
  if (f.period && f.period !== "2026-10") return false;
  if (f.channel && b.channel !== f.channel) return false;
  return true;
};

// صفوف مولّدة للصفحات البعيدة في «الكل» (نفس شكل الحجوزات المعتمدة الأقدم)
function synthetic(n: number): Booking {
  const t = OLD[n % OLD.length];
  const num = 21397 - n;
  const day = Math.max(1, 30 - Math.floor(n / 90));
  const b = oldBooking([`BK-${num}`, t[1], t[2], t[3], t[4], `${day} سبتمبر 2026`, t[6], t[7], t[8], t[9], t[10], t[11], t[12] ? `INV-L-2026-09-${String(8000 - n).padStart(5, "0")}` : "", t[13], t[14]], 1000 + n);
  return b;
}

const toRow = (b: Booking) => clone(b);

export const bookingsApi = {
  list: async (f: BookingQuery = {}) => {
    const tab = f.tab ?? "all";
    const filtered = !!(f.q?.trim() || f.provider || f.branch || f.category || (f.period && f.period !== "2026-10") || f.channel);
    const sorted = [...store].sort((a, b) => a.order - b.order);
    let pool: Booking[];
    if (tab === "all") pool = sorted.filter((b) => (b.listed || filtered) && !(b.status === "pending-payment" && !b.manual && !filtered));
    else pool = sorted.filter((b) => b.listed && statusTab(b) === tab);
    pool = pool.filter((b) => matches(b, f));
    const page = Math.max(1, f.page ?? 1);
    let items: Booking[];
    let total: number;
    if (tab === "all" && !filtered) {
      total = counts().all;
      const rest = sorted.filter((b) => !pool.includes(b) && !(b.status === "pending-payment" && !b.manual));
      const full = [...pool, ...rest];
      const start = (page - 1) * PAGE_SIZE;
      items = Array.from({ length: Math.max(0, Math.min(PAGE_SIZE, total - start)) }, (_, i) => full[start + i] ?? synthetic(start + i - full.length));
    } else {
      total = pool.length;
      items = pool.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    }
    return delay({ items: items.map(toRow), total, counts: counts() });
  },
  kpis: async () => {
    const c = counts();
    const manualVisits = store.filter((b) => b.manual && b.status === "awaiting-visit").length;
    return delay({ today: 186, awaitingVisit: c["awaiting-visit"] - manualVisits, linkar: c.linkar, cancelled: c.cancelled }, 200);
  },
  contactSummary: async () => delay(contactSummary(), 250),
  get: async (id: string) => {
    const b = store.find((x) => x.id === id) ?? (/^BK-\d+$/.test(id) && +id.slice(3) <= 21397 ? synthetic(21397 - +id.slice(3)) : undefined);
    if (!b) throw new ApiError(404);
    return delay(clone(b), 200);
  },
};

// ───────────── الإجراءات (CON5-04M / 04T) ─────────────
const TODAY_AR = "14 أكتوبر 2026";
function find(id: string) {
  const b = store.find((x) => x.id === id);
  if (!b) throw new ApiError(404);
  return b;
}
const addDays = (iso: string, d: number) => {
  const t = new Date(`${iso}T12:00:00`);
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

export type TransferTarget = { providerId: string; provider: string; branch: string; branchCode: string };
/** وجهة التحويل المقترحة لكل حجز (CON5-04M · تحويل الحجز) */
export const TRANSFER_DEFAULTS: Record<string, TransferTarget & { mode: "provider" | "branch"; cost?: number; service?: string; reason: string; consent?: string }> = {
  "BK-21475": { mode: "provider", providerId: "lk-ns-001", provider: "نانو شيلد", branch: "الروضة", branchCode: "LK-NS-RD-001", cost: 1450, service: "نانو سيراميك ثلاث طبقات · سيدان", reason: "تعذّر الفرع · نفاد المادة (REQ-2026-0417)", consent: "وافق العميل على الخدمة البديلة (مكالمة اليوم)" },
  "BK-21474": { mode: "branch", ...BR.MH, reason: "طلب العميل · أقرب لموقعه" },
  "BK-21473": { mode: "branch", ...BR.ZH, reason: "طلب العميل · أقرب لموقعه" },
  "BK-21472": { mode: "branch", providerId: "lk-lm-001", provider: "لومار", branch: "الياسمين", branchCode: "LK-LM-YS-002", reason: "طلب العميل · أقرب لموقعه" },
  "BK-21470": { mode: "branch", providerId: "lk-xp-001", provider: "XPEL", branch: "الملقا", branchCode: "LK-XP-MQ-002", reason: "إيقاف فرع العليا (REQ-2026-0414)" },
  "BK-21452": { mode: "branch", ...BR.HM, reason: "طلب العميل · أقرب لموقعه" },
  "BK-21476": { mode: "branch", ...BR.HM, reason: "طلب العميل · أقرب لموقعه" },
};
export const TRANSFER_REASONS = ["تعذّر الفرع · نفاد المادة (REQ-2026-0417)", "طلب العميل · أقرب لموقعه", "إيقاف فرع العليا (REQ-2026-0414)", "إعادة جدولة بسبب الضغط"];
export const CANCEL_REASONS = ["طلب العميل", "تعذّر الفرع · نفاد المادة (REQ-2026-0417)", "تعذّر الفرع · عطل في المعدات", "إيقاف الفرع", "خطأ في الحجز"];
export const UNPAID_REASONS = ["العميل غيّر رأيه", "خطأ في الحجز", "طلب العميل"];
export const EXTEND_OPTIONS = [3, 7, 14, 30, 90];
export const extendLabel = (d: number) => (d === 3 ? "3 أيام" : d === 7 ? "7 أيام" : `${d} يوماً`);
export const EXTEND_REASONS = ["سفر العميل", "تعذّر الفرع · المادة تصل الأسبوع القادم", "إيقاف فرع العليا مؤقتاً"];
export const TRANSFER_BRANCHES: (TransferTarget & { label: string })[] = [
  { providerId: "lk-jn-001", provider: "جونسون", branch: "الزهراء", branchCode: "LK-JN-ZH-001", label: "الزهراء · LK-JN-ZH-001 · ذهبي 89" },
  { providerId: "lk-jn-001", provider: "جونسون", branch: "الحمراء", branchCode: "LK-JN-HM-002", label: "الحمراء · LK-JN-HM-002 · ذهبي 84" },
  { providerId: "lk-jn-001", provider: "جونسون", branch: "المحمدية", branchCode: "LK-JN-MH-003", label: "المحمدية · LK-JN-MH-003 · ذهبي 81" },
  { providerId: "lk-lm-001", provider: "لومار", branch: "الروضة", branchCode: "LK-LM-RD-001", label: "الروضة · LK-LM-RD-001 · بلاتيني 93" },
  { providerId: "lk-lm-001", provider: "لومار", branch: "الياسمين", branchCode: "LK-LM-YS-002", label: "الياسمين · LK-LM-YS-002 · بلاتيني 90" },
  { providerId: "lk-xp-001", provider: "XPEL", branch: "العليا", branchCode: "LK-XP-OL-001", label: "العليا · LK-XP-OL-001 · بلاتيني 95" },
  { providerId: "lk-xp-001", provider: "XPEL", branch: "الملقا", branchCode: "LK-XP-MQ-002", label: "الملقا · LK-XP-MQ-002 · بلاتيني 90" },
  { providerId: "lk-ns-001", provider: "نانو شيلد", branch: "الروضة", branchCode: "LK-NS-RD-001", label: "الروضة · LK-NS-RD-001 · ذهبي" },
];

function setVoucherLine(b: Booking) {
  if (!b.validUntil) return;
  const until = arDate(b.validUntil);
  b.voucher = `حتى ${until}`;
  b.drawer.hero.lines = b.drawer.hero.lines.map((l) => (l.startsWith("القسيمة ") ? `القسيمة ${b.voucherCode} · صالحة حتى ${until}` : l));
}
const T = (toast: string, ms?: number) => delay({ toast }, ms);

export const bookingsMutations = {
  /** CON5-04M · إلغاء واسترداد → CON5-04T · أُلغي BK-… */
  cancelRefund: async (id: string, v: { reason: string; notify: boolean }) => {
    const b = find(id);
    const refund = `يُسترد ${num(b.sale)} ر.س إلى ${b.payMethod ?? "وسيلة الدفع الأصلية"} خلال 5 أيام عمل`;
    b.status = "cancelled";
    b.cancelledAt = TODAY_AR;
    b.voucher = `ملغاة ${TODAY_AR}`;
    b.request = undefined;
    b.drawer.menu = false;
    b.drawer.footer = [];
    b.drawer.hero.pill = undefined;
    b.drawer.hero.lines = [b.drawer.hero.lines[0], `أُلغي ${TODAY_AR} · ${v.reason}`, refund];
    b.drawer.blocks = b.drawer.blocks.filter((x) => x.kind !== "contact").map((x) => (x.kind === "prices" ? { kind: "prices", margin: "—" } : x));
    return T(`أُلغي ${id} · ${refund}`);
  },
  /** CON5-04M · بلا صلاحية الاسترداد → CON5-04T · أُرسل لقسم الحجوزات */
  requestCancel: async (id: string) => T(`أُرسل طلب إلغاء ${id} للينكار`),
  /** CON5-04M · تحويل الحجز → CON5-04T · حُوِّل BK-… */
  transfer: async (id: string, v: TransferTarget & { cost?: number; reason: string }) => {
    const b = find(id);
    const from = `${b.provider} · فرع ${b.branch}`;
    Object.assign(b, { providerId: v.providerId, provider: v.provider, branch: v.branch, branchCode: v.branchCode });
    if (v.cost) b.cost = v.cost;
    if (b.status === "linkar-decision") {
      b.status = "awaiting-visit";
      b.request = undefined;
      b.drawer.footer = [];
      b.drawer.menu = true;
    }
    b.drawer.sub = undefined;
    b.drawer.hero.lines = [...b.drawer.hero.lines.filter((l) => !l.startsWith("طلب تعذّر") && !l.startsWith("على فرع")), `حُوِّل من ${from} · ${v.reason}`];
    b.drawer.blocks = b.drawer.blocks.map((x) => (x.kind === "tile" ? { ...x, rows: x.rows.map((r) => ("k" in r && r.k === "الفرع" ? { ...r, v: `${v.provider} · فرع ${v.branch}` } : r)) } : x));
    return T(`حُوِّل ${id} إلى ${v.provider} · ${v.branch} · أُرسلت رسالة للعميل وللفرعين`);
  },
  /** CON5-04M · تمديد الصلاحية → CON5-04T · مُدّدت الصلاحية */
  extend: async (id: string, days: number) => {
    const b = find(id);
    b.validUntil = addDays(b.validUntil ?? "2026-10-28", days);
    setVoucherLine(b);
    return T(`مُدّدت صلاحية ${b.voucherCode} حتى ${arDate(b.validUntil)} · أُرسلت رسالة للعميل`);
  },
  /** CON5-04A · إعادة إرسال القسيمة → CON5-04T */
  resendVoucher: async (id: string) => {
    const b = find(id);
    return T(`أُعيد إرسال القسيمة ${b.voucherCode} إلى ${b.customer.name} برسالة نصية`, 250);
  },
  /** CON5-04M · اتصال → سُجّل الاتصال */
  logCall: async (id: string) => {
    const b = find(id);
    return T(b.manual ? `سُجّل الاتصال ب${b.customer.name} في سجل الحجز ${id}` : `سُجّل التواصل مع العميل في سجل الحجز ${id}`, 250);
  },
  /** CON5-04M · تواصل لينكار (راضٍ / غير راضٍ) */
  linkarContact: async (id: string, v: { satisfied: boolean; notes: string }) => {
    const b = find(id);
    b.linkar = { done: true, satisfied: v.satisfied, employee: REEM, date: TODAY_AR, notes: v.notes.trim() };
    return T(`سُجّل التواصل مع ${b.customer.name} · ${id}`);
  },
  /** CON5-04M · اعتماد التنفيذ → اعتُمد الحجز */
  approve: async (id: string) => {
    const b = find(id);
    b.status = "approved";
    b.drawer.footer = [];
    b.drawer.hero.pill = undefined;
    return T("اعتُمد التنفيذ · أُضيف الحجز لمستحقات المزوّد");
  },
  /** CON5-04M · تقييم بالنيابة عن العميل */
  rate: async (id: string, v: { aspects: number[]; text: string }) => {
    const b = find(id);
    const avg = Math.round((v.aspects.reduce((s, x) => s + x, 0) / v.aspects.length) * 2) / 2;
    b.rating = Math.round(avg);
    return T(`سُجّل تقييم ${id} بالنيابة عن ${b.customer.name} · ★${num(avg, avg % 1 ? 1 : 0)} · سُجّل هاتفياً`);
  },
  issueInvoice: async (id: string) => {
    const b = find(id);
    b.invoice ??= `INV-L-2026-10-0${8790 + (+id.slice(3) % 40)}`;
    return T(`أُصدرت الفاتورة الضريبية ${b.invoice} · أُرسلت للعميل`, 250);
  },
  /** إصدار شهادة ضمان (CON5-04A · BK-21468) — مفيش إطار رسالة في Figma */
  issueWarranty: async (id: string) => T(`أُصدرت شهادة الضمان · ${id} · أُرسلت للعميل`, 250),
  /** CON5-04M · قرار إعادة الجدولة */
  reschedule: async (id: string, v: { choice: "approve" | "reject"; date: string }) => {
    const b = find(id);
    const old = b.visitDate;
    b.status = "awaiting-visit";
    b.request = undefined;
    b.drawer.footer = [];
    b.drawer.menu = true;
    b.providerContact ??= { done: true, date: TODAY_AR };
    b.linkar ??= { done: false };
    if (v.choice === "approve") b.visitDate = v.date;
    b.drawer.blocks = b.drawer.blocks.map((x) =>
      x.kind === "tile" && x.title === "الموعد" ? { ...x, rows: [{ k: "موعد الزيارة", v: v.choice === "approve" ? `${v.date} (كان ${old})` : (old ?? "—") }] } : x,
    );
    if (!b.drawer.blocks.some((x) => x.kind === "contact")) b.drawer.blocks.splice(2, 0, { kind: "contact" });
    return T(v.choice === "approve" ? `اعتُمد موعد ${id} الجديد ${v.date} · أُبلغت العميلة والفرع` : `رُفض طلب الفرع · يبقى موعد ${id} ${old}`);
  },
  notifyCrm: async () => T("أُرسل التنبيه إلى ريم الشهري"),
  notifyProviders: async (names: string[]) => T(`أُرسل التنبيه إلى ${names.join("و")}`),
  /** الحجز اليدوي: إعادة إرسال رابط الدفع · تسجيل دفعة · إلغاء قبل الدفع */
  resendPayLink: async (id: string) => {
    const b = find(id);
    const until = b.drawer.hero.lines.find((l) => l.startsWith("رابط الدفع صالح حتى "))?.replace("رابط الدفع صالح حتى ", "") ?? "";
    return T(`أُعيد إرسال رابط الدفع إلى ${b.customer.name} · صالح حتى ${until}`, 250);
  },
  registerPayment: async (id: string, v: { ref: string }) => {
    const b = find(id);
    b.status = "awaiting-visit";
    b.voucherCode = "LK-6TB2-9WQE";
    b.validUntil = "2026-10-28";
    b.voucher = "حتى 28 أكتوبر 2026";
    b.payMethod = "مدى";
    b.providerContact = { done: false };
    b.linkar = { done: false };
    b.drawer.hero.lines = [b.drawer.hero.lines[0].replace(/ · 14 أكتوبر 2026.*$/, ""), `دُفع بتحويل بنكي ${v.ref} · ${TODAY_AR}`, `القسيمة ${b.voucherCode} · صالحة حتى 28 أكتوبر 2026`];
    b.drawer.blocks.splice(1, 0, { kind: "contact" });
    return T(`سُجّلت الدفعة وصدرت القسيمة ${b.voucherCode} · أُرسلت للعميل وظهرت لفرع ${b.branch}`);
  },
  cancelUnpaid: async (id: string) => {
    const b = find(id);
    b.status = "cancelled";
    b.cancelledAt = TODAY_AR;
    b.voucher = `ملغاة ${TODAY_AR}`;
    b.drawer.menu = false;
    b.drawer.hero.lines = [b.drawer.hero.lines[0], `أُلغي ${TODAY_AR} قبل الدفع · لا استرداد ولا قسيمة`];
    return T(`أُلغي الحجز ${id} قبل الدفع · لا استرداد ولا قسيمة`);
  },
};

// ───────────── CON5-04N · حجز يدوي ─────────────
export interface ManualService {
  id: string;
  name: string;
  /** سطر «للعملاء: …» */
  line: string;
  sale: number;
  cost: number;
  /** عرض لم يبدأ بعد → البطاقة معطّلة */
  disabled?: boolean;
  type: "service" | "package" | "offer";
  category: string;
  /** سطر المكوّن في بطاقة «الخدمة» بالدرج */
  detail?: string;
}
/** خدمات وباقات وعروض جونسون · فرع الزهراء (CON5-04N2 3114:36379) */
export const MANUAL_CATALOG: ManualService[] = [
  { id: "jcp", name: "Johnson Ceramic Pro", line: "للعملاء: طلاء نانو سيراميك · بريميوم · خدمة · ضمان 9 سنوات", sale: 1899, cost: 1520, type: "service", category: "نانو سيراميك", detail: "Ceramic Pro 9H · بريميوم · الولايات المتحدة · طبقتان · 9H · ضمان 9 سنوات" },
  { id: "int", name: "تفصيل داخلي كامل", line: "للعملاء: تنظيف داخلي عميق · خدمة · بدون ضمان", sale: 449, cost: 360, type: "service", category: "الغسيل والتنظيف", detail: "Koch Chemie · ألمانيا · تعقيم بخار 150° م · بدون ضمان" },
  { id: "ppf", name: "PPF للواجهة + نانو سيراميك", line: "للعملاء: حماية PPF للواجهة + نانو سيراميك · خدمة · ضمان 5 سنوات", sale: 3299, cost: 2780, type: "service", category: "حماية PPF" },
  { id: "rep", name: "طبقة طاردة للماء + تلميع", line: "للعملاء: تلميع خارجي + طبقة طاردة للماء · خدمة · ضمان سنتان", sale: 1299, cost: 1080, type: "service", category: "التلميع" },
  { id: "wash", name: "غسيل وتلميع سريع", line: "للعملاء: غسيل خارجي + تلميع سريع · خدمة", sale: 149, cost: 120, type: "service", category: "الغسيل والتنظيف" },
  { id: "care", name: "باقة العناية الكاملة", line: "باقة · تلميع + طبقة طاردة + تنظيف داخلي", sale: 1499, cost: 1240, type: "package", category: "التلميع" },
  { id: "nano", name: "باقة النانو والتلميع", line: "باقة · Ceramic Pro + تلميع 3 مراحل", sale: 1899, cost: 1520, type: "package", category: "نانو سيراميك" },
  { id: "winter", name: "عرض الشتاء · خصم 10% نانو سيراميك", line: "عرض · يبدأ 1 نوفمبر 2026", sale: 1709, cost: 1520, type: "offer", category: "نانو سيراميك", disabled: true },
];
export interface ManualInput {
  phone: string;
  name: string;
  email?: string;
  make: string;
  model: string;
  year: string;
  size: string;
  plate: string;
  branchCode: string;
  services: string[];
  pay: "link" | "bank";
  channel: string;
}
export async function createManualBooking(v: ManualInput) {
  const id = `BK-${Math.max(21475, ...store.filter((b) => b.manual).map((b) => +b.id.slice(3))) + 1}`;
  const br = TRANSFER_BRANCHES.find((x) => x.branchCode === v.branchCode) ?? TRANSFER_BRANCHES[0];
  const picked = MANUAL_CATALOG.filter((s) => v.services.includes(s.id));
  const service = picked.map((s) => s.name).join(" + ");
  const sale = picked.reduce((s, x) => s + x.sale, 0);
  const cost = picked.reduce((s, x) => s + x.cost, 0);
  const car = `${v.make} ${v.model} ${v.year} · ${v.size}${v.plate ? ` · ${v.plate}` : ""}`;
  const b: Booking = {
    id,
    order: 0,
    listed: true,
    customer: { name: v.name, phone: v.phone },
    ...br,
    service,
    size: v.size,
    category: picked[0]?.category ?? "نانو سيراميك",
    channel: "manual",
    manual: true,
    sale,
    cost,
    status: "pending-payment",
    voucher: "حتى 15 أكتوبر 2026",
    drawer: {
      menu: true,
      hero: { title: `${service} · ${v.size}`, lines: [`حجز يدوي · ${v.channel} · هند المطيري · 14 أكتوبر 2026 11:20 ص`, "رابط الدفع صالح حتى 15 أكتوبر 2026 11:20 ص"] },
      blocks: [
        tile("الخدمة", [["الخدمة", service], ["الحجم", v.size], ["الفرع", `${br.provider} · فرع ${br.branch}`], ...picked.filter((s) => s.detail).map((s) => [s.name, s.detail!] as [string, string])]),
        prices,
        tile("العميل", [["الاسم", `${v.name} · عميل جديد`], { k: "الجوال", v: v.phone, call: true }, ["السيارة", car], ["ملاحظة داخلية", "طلب الحضور بعد الظهر خلال الأسبوع القادم"]]),
      ],
      footer: [],
    },
  };
  store = [b, ...store];
  return delay({ id, toast: `أُنشئ الحجز ${id} · أُرسل رابط الدفع إلى ${v.name}` });
}

export const _bookingsStore = { all: () => store, set: (next: Booking[]) => (store = next), reset: () => (store = clone(SEED)) };
