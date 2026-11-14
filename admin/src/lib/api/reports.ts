// التقارير (Figma CON5-02R 3114:24825 · المحتوى = المكوّن «CON5 · محتوى التقارير» 2126:1282 بتسع تقارير)
// كل تقرير: عنوان ووصف وفلاتر (الفترة · من · إلى · المدينة/الوكالة/المسوّق) وجدول مقسّم صفحات — زي GET /reports/<key>?period&from&to&city&page.
// الأرقام والنصوص حرفياً من Figma. الصفحات بعد الأولى في البيانات التجريبية = نفس الصفوف بترتيب مختلف لحد ما الخادم يجهز.
import { delay } from "./errors";
import type { UiGlyph } from "@/components/ui/icon-names";

export type ReportKey = "providers" | "approvals" | "documents" | "bookings" | "performance" | "complaints" | "margin" | "agencies" | "marketers";
export type PillTone = "success" | "pending" | "danger" | "info" | "neutral";
export type ReportCell = string | { text: string; pill?: PillTone; medium?: boolean };
export type ReportCol = { label: string; w?: number };
export type ReportRow = { cells: ReportCell[]; total?: boolean };

export const REPORT_GROUPS: { title: string; items: { key: ReportKey; label: string; icon: UiGlyph }[] }[] = [
  {
    title: "الشبكة والاعتماد",
    items: [
      { key: "providers", label: "مقدّمو الخدمة", icon: "store" },
      { key: "approvals", label: "الاعتماد والقرارات", icon: "check" },
      { key: "documents", label: "المستندات والشهادات", icon: "file" },
    ],
  },
  {
    title: "الطلب والجودة",
    items: [
      { key: "bookings", label: "الحجوزات حسب الخدمة والمدينة", icon: "calendar" },
      { key: "performance", label: "أداء المراكز", icon: "chart" },
      { key: "complaints", label: "الشكاوى والتقييمات", icon: "message" },
    ],
  },
  {
    title: "الهامش والقنوات",
    items: [
      { key: "margin", label: "هامش لينكار", icon: "wallet" },
      { key: "agencies", label: "كشوف الوكالات", icon: "receipt" },
      { key: "marketers", label: "عمولات المسوّقين", icon: "share" },
    ],
  },
];
export const REPORT_KEYS = REPORT_GROUPS.flatMap((g) => g.items.map((i) => i.key));

// قوائم الفلاتر (CON5-DD · الفترة 3114:65994 · من 65978 · إلى 65962 · المدينة 65946)
export const REPORT_PERIODS = ["هذا الشهر", "آخر 30 يوماً", "آخر 3 أشهر", "هذه السنة", "فترة مخصصة…"].map((v) => ({ value: v, label: v }));
export const FROM_OPTIONS = ["1 أكتوبر 2026", "14 أكتوبر 2026", "15 أكتوبر 2026", "1 نوفمبر 2026", "30 نوفمبر 2026", "اختيار تاريخ آخر…"].map((v) => ({ value: v, label: v }));
export const TO_OPTIONS = ["14 أكتوبر 2026", "15 أكتوبر 2026", "1 نوفمبر 2026", "30 نوفمبر 2026", "اختيار تاريخ آخر…"].map((v) => ({ value: v, label: v }));
export const REPORT_DEFAULTS = { period: "هذا الشهر", from: "1 أكتوبر 2026", to: "14 أكتوبر 2026", scope: "" };

export interface ReportDef {
  title: string;
  description: string;
  /** الفلتر الرابع: المدينة (الافتراضي) أو الوكالة أو المسوّق */
  scope: { label: string; icon: UiGlyph; options: { value: string; label: string }[] };
  /** الجزء بعد «عرض 1 – 7 · » */
  summary: string;
  pageSize: number;
  pages: number;
  total: number;
  cols: ReportCol[];
  /** عمود يتفلتر بقيمة الفلتر الرابع (المدينة/الوكالة/المسوّق) */
  scopeCol?: number;
  rows: ReportRow[];
}

const CITIES = [{ value: "", label: "الكل" }, ...["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"].map((v) => ({ value: v, label: v }))];
const city = { label: "المدينة", icon: "map-pin" as UiGlyph, options: CITIES };
const all = (xs: string[]) => [{ value: "", label: "الكل" }, ...xs.map((v) => ({ value: v, label: v }))];
const ok = (t: string): ReportCell => ({ text: t, pill: "success" });
const tot = (t: string): ReportCell => ({ text: t, medium: true });

const REPORTS: Record<ReportKey, ReportDef> = {
  // Report=مقدّمو الخدمة 2126:1283
  providers: {
    title: "تقرير مقدّمو الخدمة",
    description: "كل مراكز الشبكة وحالتها وأداؤها في الفترة.",
    scope: city,
    summary: "24 منشأة",
    pageSize: 7,
    pages: 3,
    total: 24,
    cols: [{ label: "المركز" }, { label: "المدينة", w: 80 }, { label: "الفروع", w: 70 }, { label: "خدمات منشورة", w: 100 }, { label: "حجوزات الفترة", w: 110 }, { label: "التقييم", w: 70 }, { label: "الحالة", w: 110 }],
    scopeCol: 1,
    rows: [
      { cells: ["XPEL السعودية", "الرياض", "6", "9", "214", "4.8", ok("نشط")] },
      { cells: ["جونسون Johnson", "جدة", "3", "4", "244", "4.9", ok("نشط")] },
      { cells: ["نانو شيلد", "جدة", "4", "5", "96", "4.7", ok("نشط")] },
      { cells: ["لومار LLumar", "الرياض", "5", "7", "88", "4.8", ok("نشط")] },
      { cells: ["مركز النخبة للتظليل", "الدمام", "2", "3", "74", "4.6", ok("نشط")] },
      { cells: ["مركز الريم", "الرياض", "1", "0", "—", "—", { text: "معتمد جديد", pill: "pending" }] },
      { cells: ["مغسلة الريان", "جدة", "2", "0", "—", "4.4", { text: "موقوف", pill: "danger" }] },
    ],
  },
  // Report=الاعتماد والقرارات 2126:1441
  approvals: {
    title: "تقرير الاعتماد والقرارات",
    description: "كل قرارات فريق لينكار على طلبات الانضمام والفروع والشهادات والتعديلات.",
    scope: city,
    summary: "13 قراراً · 11 اعتماد · 2 رفض · متوسط 1.8 يوم",
    pageSize: 5,
    pages: 2,
    total: 13,
    cols: [{ label: "الطلب", w: 100 }, { label: "النوع", w: 120 }, { label: "الجهة" }, { label: "قُدّم", w: 120 }, { label: "القرار", w: 100 }, { label: "بواسطة", w: 120 }, { label: "المدة", w: 70 }],
    rows: [
      { cells: ["SV-0229", "شهادة منتج", "XPEL السعودية", "الأربعاء 7 أكتوبر", ok("اعتُمد"), "لينا الحربي", "يوم"] },
      { cells: ["JR-0208", "انضمام مركز", "مركز البريق السريع", "الاثنين 5 أكتوبر", { text: "رُفض", pill: "danger" }, "لينا الحربي", "يومان"] },
      { cells: ["CH-0136", "تعديل بيانات", "جونسون Johnson", "الاثنين 5 أكتوبر", ok("اعتُمد"), "نوف القحطاني", "يوم"] },
      { cells: ["JR-0209", "انضمام مركز", "مركز الريم", "الأربعاء 30 سبتمبر", ok("اعتُمد"), "لينا الحربي", "3 أيام"] },
      { cells: ["DR-0031", "انضمام وكالة", "معارض الفخامة", "الاثنين 28 سبتمبر", { text: "رُفض", pill: "danger" }, "عبدالعزيز المالكي", "3 أيام"] },
    ],
  },
  // Report=المستندات والشهادات 2126:1577
  documents: {
    title: "تقرير المستندات والشهادات",
    description: "حالة مستندات المراكز وشهادات المنتجات وتواريخ انتهائها.",
    scope: city,
    summary: "184 مستنداً · 181 ساري · 2 ينتهي خلال 30 يوماً · 1 منتهٍ",
    pageSize: 5,
    pages: 4,
    total: 184,
    cols: [{ label: "المستند" }, { label: "المركز", w: 160 }, { label: "الرقم", w: 150 }, { label: "ينتهي", w: 150 }, { label: "الحالة", w: 120 }],
    rows: [
      { cells: ["شهادة اعتماد المنتج · Nano Shield 9H", "نانو شيلد", "NS-9H-2024-118", "10 أكتوبر 2026", { text: "منتهٍ", pill: "danger" }] },
      { cells: ["تأمين المسؤولية", "لومار LLumar", "TWN-55-7712", "28 أكتوبر 2026", { text: "ينتهي قريباً", pill: "pending" }] },
      { cells: ["رخصة البلدية · الزهراء", "جونسون Johnson", "40-1145-2290", "3 نوفمبر 2026", { text: "ينتهي قريباً", pill: "pending" }] },
      { cells: ["السجل التجاري", "XPEL السعودية", "1010554120", "14 فبراير 2027", ok("ساري")] },
      { cells: ["شهادة اعتماد المنتج · Ceramic Pro", "جونسون Johnson", "CP-SA-2025-0773", "30 يونيو 2027", ok("ساري")] },
    ],
  },
  // Report=الحجوزات حسب الخدمة والمدينة 2126:1703
  bookings: {
    title: "تقرير الحجوزات حسب الخدمة والمدينة",
    description: "توزيع الحجوزات على أنواع الخدمات والمدن.",
    scope: city,
    summary: "1,284 حجزاً · 2,418,650 ر.س",
    pageSize: 6,
    pages: 1,
    total: 6,
    cols: [{ label: "نوع الخدمة" }, { label: "جدة", w: 90 }, { label: "الرياض", w: 90 }, { label: "الدمام", w: 90 }, { label: "الإجمالي", w: 90 }, { label: "القيمة", w: 130 }],
    rows: [
      { cells: ["نانو سيراميك", "165", "121", "31", "317", "892,570"] },
      { cells: ["الغسيل", "150", "118", "44", "312", "131,040"] },
      { cells: ["التظليل", "138", "120", "38", "296", "532,800"] },
      { cells: ["التلميع", "125", "92", "24", "241", "154,240"] },
      { cells: ["حماية PPF", "64", "47", "7", "118", "708,000"] },
      { cells: [tot("الإجمالي"), "642", "498", "144", "1,284", "2,418,650"], total: true },
    ],
  },
  // Report=أداء المراكز 2126:1829
  performance: {
    title: "تقرير أداء المراكز",
    description: "مقارنة المراكز في الحجوزات والإنجاز والجودة.",
    scope: city,
    summary: "الأعلى حجزاً في الفترة",
    pageSize: 6,
    pages: 3,
    total: 18,
    cols: [{ label: "المركز" }, { label: "الحجوزات", w: 90 }, { label: "مكتملة", w: 80 }, { label: "ملغاة", w: 70 }, { label: "القيمة", w: 120 }, { label: "التقييم", w: 70 }, { label: "الشكاوى", w: 80 }],
    rows: [
      { cells: ["XPEL السعودية", "214", "108", "5", "486,300", "4.8", "1"] },
      { cells: ["جونسون Johnson", "139", "74", "3", "262,450", "4.9", "3"] },
      { cells: ["نانو شيلد", "96", "49", "2", "241,900", "4.7", "1"] },
      { cells: ["لومار LLumar", "88", "45", "2", "168,600", "4.8", "1"] },
      { cells: ["مركز النخبة للتظليل", "74", "38", "1", "129,500", "4.6", "0"] },
      { cells: ["مركز لمعة للتلميع", "61", "31", "1", "46,200", "4.7", "1"] },
    ],
  },
  // Report=الشكاوى والتقييمات 2126:1965
  complaints: {
    title: "تقرير الشكاوى والتقييمات",
    description: "الشكاوى ونتائجها، ومدة الحل لكل مركز.",
    scope: city,
    summary: "9 شكاوى · 6 مغلقة · متوسط الحل 1.7 يوم",
    pageSize: 5,
    pages: 2,
    total: 9,
    cols: [{ label: "الشكوى", w: 90 }, { label: "المركز" }, { label: "التصنيف", w: 120 }, { label: "فُتحت", w: 130 }, { label: "النتيجة", w: 220 }, { label: "المدة", w: 70 }],
    rows: [
      { cells: ["CM-3352", "جونسون · الحمراء", "التعامل", "14 أكتوبر", "مفتوحة · لدى المركز", "—"] },
      { cells: ["CM-3349", "جونسون · المحمدية", "جودة التنفيذ", "10 أكتوبر", "مفتوحة · لدى لينكار", "—"] },
      { cells: ["CM-3351", "كار سبا", "السعر مختلف", "13 أكتوبر", "اعتذار وتوضيح", "6 ساعات"] },
      { cells: ["CM-3347", "نانو شيلد", "جودة التنفيذ", "8 أكتوبر", "أُعيدت الخدمة مجاناً", "يومان"] },
      { cells: ["CM-3345", "لومار LLumar", "ضرر بالسيارة", "5 أكتوبر", "أصلح المركز الضرر", "3 أيام"] },
    ],
  },
  // Report=هامش لينكار 2126:2085
  margin: {
    title: "تقرير هامش لينكار",
    description: "هامش لينكار = سعر لينكار − سعر المزوّد المتفق عليه، على الحجوزات المكتملة.",
    scope: city,
    summary: "1 – 14 أكتوبر · 225,883 ر.س · 18.4% في المتوسط",
    pageSize: 6,
    pages: 1,
    total: 6,
    cols: [{ label: "نوع الخدمة" }, { label: "النسبة", w: 90 }, { label: "المبيعات المكتملة", w: 160 }, { label: "الهامش", w: 140 }],
    rows: [
      { cells: ["نانو سيراميك", "20%", "452,605", "90,521"] },
      { cells: ["حماية PPF", "16%", "359,013", "57,442"] },
      { cells: ["التظليل", "19%", "270,172", "51,333"] },
      { cells: ["الغسيل", "20%", "66,448", "13,290"] },
      { cells: ["التلميع", "17%", "78,212", "13,297"] },
      { cells: [tot("الإجمالي"), "18.4%", "1,226,450", tot("225,883")], total: true },
    ],
  },
  // Report=كشوف الوكالات 2126:2198
  agencies: {
    title: "تقرير كشوف الوكالات",
    description: "الكشوف الشهرية الصادرة للوكالات وحالة سدادها.",
    scope: { label: "الوكالة", icon: "store", options: all(["معارض النخيل للسيارات", "الريادة للسيارات", "معارض السهم الذهبي"]) },
    summary: "4 كشوف · 142,600 ر.س · متأخر 38,450",
    pageSize: 4,
    pages: 1,
    total: 4,
    cols: [{ label: "الكشف", w: 150 }, { label: "الوكالة" }, { label: "الفترة", w: 100 }, { label: "المبلغ", w: 120 }, { label: "الاستحقاق", w: 150 }, { label: "الحالة", w: 110 }],
    scopeCol: 1,
    rows: [
      { cells: ["INV-2026-09-0198", "معارض النخيل للسيارات", "أغسطس", "38,450", "1 أكتوبر", { text: "متأخر", pill: "danger" }] },
      { cells: ["INV-2026-10-0214", "الريادة للسيارات", "سبتمبر", "61,300", "31 أكتوبر", { text: "صادر", pill: "info" }] },
      { cells: ["INV-2026-10-0215", "معارض النخيل للسيارات", "سبتمبر", "24,100", "31 أكتوبر", { text: "صادر", pill: "info" }] },
      { cells: ["INV-2026-10-0212", "معارض السهم الذهبي", "سبتمبر", "18,750", "31 أكتوبر", ok("مسدّد")] },
    ],
  },
  // Report=عمولات المسوّقين 2126:2317
  marketers: {
    title: "تقرير عمولات المسوّقين",
    description: "عمولات المسوّقين على الحجوزات المكتملة بالإحالة.",
    scope: { label: "المسوّق", icon: "user", options: all(["رنا الأنصاري · SM118", "تركي الحارثي · SM123", "دانة الزهراني · SM140", "سعد البقمي · SM131", "ياسر الشمري · SM152"]) },
    summary: "أكتوبر حتى اليوم · 27 مسوّقاً · 12,860.40 ر.س",
    pageSize: 5,
    pages: 6,
    total: 27,
    cols: [{ label: "المسوّق" }, { label: "الحجوزات", w: 90 }, { label: "المبيعات المكتملة", w: 140 }, { label: "الهامش", w: 120 }, { label: "الحالة", w: 130 }],
    scopeCol: 0,
    rows: [
      { cells: ["رنا الأنصاري · SM118", "7", "12,882", "644.10", { text: "مسودة", pill: "neutral" }] },
      { cells: ["تركي الحارثي · SM123", "6", "8,250", "412.50", { text: "مسودة", pill: "neutral" }] },
      { cells: ["دانة الزهراني · SM140", "5", "7,768", "388.40", { text: "مسودة", pill: "neutral" }] },
      { cells: ["سعد البقمي · SM131", "4", "4,200", "210.00", { text: "مسودة", pill: "neutral" }] },
      { cells: ["ياسر الشمري · SM152", "1", "1,499", "74.95", { text: "مسودة", pill: "neutral" }] },
    ],
  },
};

export type ReportQuery = { period?: string; from?: string; to?: string; scope?: string; page?: number };
export interface ReportResult extends Omit<ReportDef, "rows"> {
  rows: ReportRow[];
  page: number;
  /** «عرض 1 – 7 · 24 منشأة» */
  range: string;
}

const text = (c: ReportCell) => (typeof c === "string" ? c : c.text);

export const reportsApi = {
  get: async (key: ReportKey, q: ReportQuery = {}): Promise<ReportResult> => {
    const def = REPORTS[key];
    let rows = def.rows;
    let pages = def.pages;
    if (q.scope && def.scopeCol != null) {
      rows = rows.filter((r) => r.total || text(r.cells[def.scopeCol!]) === q.scope);
      pages = 1;
    }
    const page = Math.min(Math.max(1, q.page ?? 1), pages);
    // بيانات تجريبية: الصفحات التالية = نفس الصفوف بإزاحة (الخادم هيرجّع الصفحة الفعلية)
    if (page > 1) rows = [...rows.slice(page - 1), ...rows.slice(0, page - 1)].filter((r) => !r.total);
    const from = rows.length ? (page - 1) * def.pageSize + 1 : 0;
    const to = Math.min((page - 1) * def.pageSize + rows.filter((r) => !r.total).length, def.total);
    const range = `عرض ${from} – ${to} · ${def.summary}`;
    return delay(structuredClone({ ...def, rows, pages, page, range }));
  },
  /** «إعادة تعيين» — الخادم بيرجّع الفلاتر الافتراضية للتقرير */
  defaults: async () => delay({ ...REPORT_DEFAULTS }, 150),
};
