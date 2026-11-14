// التحليلات (Figma CON5-02 3114:24750 + «سلوك العملاء» 3400:240630) — تبويبات المكوّن «CON5 · التحليلات · تبويبات» 2126:411.
// كل تبويب = أرقام + صفوف بطاقات (أعمدة · أشرطة · جدول · أرقام) بنفس شكل رد الخادم GET /analytics/<tab>?period&city&type&center&branch.
// الأرقام والنصوص حرفياً من Figma (أكتوبر 2026). الشهور بالترتيب الزمني — آخر عنصر = الحالي (أخضر) ويظهر على الشمال.
import { delay } from "./errors";

export const ANALYTICS_TABS = [
  { key: "network", label: "الشبكة" },
  { key: "demand", label: "الطلب" },
  { key: "quality", label: "الجودة" },
  { key: "margin", label: "هامش لينكار" },
  { key: "channels", label: "القنوات" },
  { key: "capacity", label: "الاعتماد والطاقة" },
  { key: "behavior", label: "سلوك العملاء" },
] as const;
export type AnalyticsTab = (typeof ANALYTICS_TABS)[number]["key"];

// قوائم الفلاتر (CON5-DD · الفترة 3114:65914 · المدينة 65898 · نوع الخدمة 65880)
export const PERIOD_OPTIONS = ["هذا الشهر", "آخر 30 يوماً", "آخر 3 أشهر", "هذه السنة", "فترة مخصصة…"].map((v) => ({ value: v, label: v }));
export const CITY_OPTIONS = [{ value: "", label: "الكل" }, ...["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"].map((v) => ({ value: v, label: v }))];
export const TYPE_OPTIONS = [{ value: "", label: "الكل" }, ...["الغسيل والتنظيف", "التلميع", "نانو سيراميك", "حماية PPF", "التظليل", "تغيير اللون"].map((v) => ({ value: v, label: v }))];

export type Stat = { value: string; label: string };
export type BarTone = "ink" | "lime" | "info";
export type Bar = { label: string; value: string; /** نسبة الشريط 0–1 */ pct: number; tone?: BarTone };
export type Column = { label: string; value: string; n: number; hi?: boolean };
export type Cell = string | { text: string; sub?: string; medium?: boolean };
export type TableCol = { label: string; /** عرض ثابت بالبكسل — بدون عرض = العمود المرن (الاسم) */ w?: number };
export type TableRow = { cells: Cell[]; total?: boolean };

export type Block =
  | { kind: "columns"; title: string; sub?: string; cols: Column[]; max?: number }
  | { kind: "bars"; title: string; sub?: string; stats?: Stat[]; bars: Bar[]; tight?: boolean }
  | { kind: "table"; title: string; sub?: string; cols: TableCol[]; groups?: { label: string; span: number }[]; rows: TableRow[]; tables?: { cols: TableCol[]; rows: TableRow[] }[] }
  | { kind: "stats"; title: string; sub?: string; stats: Stat[] };

export interface AnalyticsView {
  /** ملاحظة النطاق فوق الأرقام (اختيار مركز) */
  scope?: string;
  stats?: Stat[];
  rows: Block[][];
  /** ملاحظة زرقاء في آخر التبويب */
  note?: string;
}

const months = (vals: [string, string, string, string], ns: [number, number, number, number]): Column[] =>
  ["يوليو", "أغسطس", "سبتمبر", "أكتوبر"].map((m, i) => ({ label: m, value: vals[i], n: ns[i], hi: i === 3 }));

const TABS: Record<AnalyticsTab, AnalyticsView> = {
  // Tab=الشبكة 2126:412
  network: {
    stats: [
      { value: "21", label: "مراكز نشطة" },
      { value: "55", label: "فرعاً معتمداً" },
      { value: "2", label: "انضمام هذا الشهر" },
      { value: "1.8 يوم", label: "متوسط زمن الاعتماد" },
    ],
    rows: [
      [
        { kind: "columns", title: "نمو الشبكة", sub: "المراكز النشطة نهاية كل شهر", cols: months(["18", "19", "20", "21"], [18, 19, 20, 21]) },
        { kind: "columns", title: "الفروع المعتمدة", sub: "نهاية كل شهر", cols: months(["45", "49", "52", "55"], [45, 49, 52, 55]) },
      ],
      [
        {
          kind: "table",
          title: "التغطية حسب المدينة",
          cols: [{ label: "المدينة" }, { label: "المراكز", w: 70 }, { label: "الفروع", w: 70 }, { label: "حجوزات الشهر", w: 100 }, { label: "التقييم", w: 70 }],
          rows: [
            { cells: ["جدة", "9", "24", "642", "4.7"] },
            { cells: ["الرياض", "9", "22", "498", "4.7"] },
            { cells: ["الدمام", "3", "9", "144", "4.6"] },
          ],
        },
        {
          kind: "bars",
          title: "المراكز حسب نوع الخدمة",
          bars: [
            { label: "نانو سيراميك", value: "18", pct: 1 },
            { label: "التلميع", value: "16", pct: 0.889 },
            { label: "الغسيل", value: "14", pct: 0.778 },
            { label: "التظليل", value: "11", pct: 0.611 },
            { label: "حماية PPF", value: "9", pct: 0.5 },
          ],
        },
      ],
    ],
  },
  // Tab=الطلب 2126:550
  demand: {
    stats: [
      { value: "1,284", label: "حجوزات الشهر" },
      { value: "▲ 10.4%", label: "عن نفس الفترة" },
      { value: "1,884", label: "متوسط قيمة الحجز · ر.س" },
      { value: "38%", label: "عملاء عائدون" },
    ],
    rows: [
      [
        { kind: "columns", title: "الحجوزات الشهرية", sub: "أكتوبر حتى اليوم", cols: months(["1,912", "2,264", "2,507", "1,284"], [1912, 2264, 2507, 1284]) },
        {
          kind: "bars",
          title: "حسب نوع الخدمة",
          bars: [
            { label: "نانو سيراميك", value: "317", pct: 1 },
            { label: "الغسيل", value: "312", pct: 0.984 },
            { label: "التظليل", value: "296", pct: 0.934 },
            { label: "التلميع", value: "241", pct: 0.76 },
            { label: "حماية PPF", value: "118", pct: 0.372 },
          ],
        },
      ],
      [
        {
          kind: "bars",
          title: "حسب القناة",
          bars: [
            { label: "لينكار (الموقع والتطبيق)", value: "1,106 · 86.1%", pct: 1 },
            { label: "من المركز", value: "90 · 7.0%", pct: 0.081 },
            { label: "مسوّق", value: "47 · 3.7%", pct: 0.042 },
            { label: "وكالة", value: "41 · 3.2%", pct: 0.037 },
          ],
        },
        {
          kind: "table",
          title: "أعلى المراكز حجزاً",
          cols: [{ label: "المركز" }, { label: "الحجوزات", w: 80 }, { label: "التقييم", w: 70 }],
          rows: [
            { cells: ["XPEL السعودية", "214", "4.8"] },
            { cells: ["جونسون Johnson", "139", "4.9"] },
            { cells: ["نانو شيلد", "96", "4.7"] },
            { cells: ["لومار LLumar", "88", "4.8"] },
            { cells: ["مركز النخبة للتظليل", "74", "4.6"] },
          ],
        },
      ],
    ],
  },
  // Tab=الجودة 2126:698
  quality: {
    stats: [
      { value: "4.7", label: "متوسط التقييم" },
      { value: "412", label: "تقييماً هذا الشهر" },
      { value: "0.7", label: "شكوى لكل 100 حجز" },
      { value: "1.7 يوم", label: "متوسط زمن الحل" },
    ],
    rows: [
      [
        { kind: "columns", title: "متوسط التقييم الشهري", cols: months(["4.6", "4.7", "4.7", "4.7"], [4.6, 4.7, 4.7, 4.7]), max: 5 },
        {
          kind: "bars",
          title: "تصنيفات الشكاوى",
          sub: "9 شكاوى هذا الشهر",
          bars: [
            { label: "جودة التنفيذ", value: "4", pct: 1 },
            { label: "التعامل", value: "2", pct: 0.5 },
            { label: "تأخير عن الموعد", value: "1", pct: 0.25 },
            { label: "السعر مختلف", value: "1", pct: 0.25 },
            { label: "ضرر بالسيارة", value: "1", pct: 0.25 },
          ],
        },
      ],
      [
        {
          kind: "table",
          title: "مراكز تحت المتابعة",
          sub: "تقييم أقل من 4.6 أو شكوى مصعّدة",
          cols: [{ label: "المركز" }, { label: "التقييم", w: 80 }, { label: "شكاوى الشهر", w: 100 }, { label: "السبب", w: 280 }],
          rows: [
            { cells: ["جونسون Johnson", "4.9", "3", { text: "شكوى لدى لينكار", sub: "CM-3349 · تجاوز مهلة الرد", medium: true }] },
            { cells: ["مغاسل اللؤلؤة", "4.5", "0", { text: "أقل تقييم في الشبكة", medium: true }] },
          ],
        },
      ],
    ],
  },
  // Tab=هامش لينكار 2126:809
  margin: {
    stats: [
      { value: "225,883", label: "هامش الشهر · ر.س" },
      { value: "18.4%", label: "متوسط الهامش" },
      { value: "1,226,450", label: "قيمة المكتملة · ر.س" },
      { value: "768,100", label: "هامش سبتمبر · ر.س" },
    ],
    rows: [
      [
        { kind: "columns", title: "هامش لينكار الشهري", sub: "على الحجوزات المكتملة · ر.س", cols: months(["588,300", "671,900", "768,100", "225,883"], [588300, 671900, 768100, 225883]) },
        {
          kind: "table",
          title: "حسب نوع الخدمة",
          sub: "1 – 14 أكتوبر",
          cols: [{ label: "النوع" }, { label: "النسبة", w: 56 }, { label: "المبيعات المكتملة", w: 90 }, { label: "الهامش", w: 80 }],
          rows: [
            { cells: ["نانو سيراميك", "20%", "452,605", "90,521"] },
            { cells: ["حماية PPF", "16%", "359,013", "57,442"] },
            { cells: ["التظليل", "19%", "270,172", "51,333"] },
            { cells: ["الغسيل", "20%", "66,448", "13,290"] },
            { cells: ["التلميع", "17%", "78,212", "13,297"] },
            { cells: [{ text: "الإجمالي", medium: true }, "18.4%", "1,226,450", { text: "225,883", medium: true }], total: true },
          ],
        },
      ],
    ],
    note: "الهامش = سعر لينكار − سعر المزوّد المتفق عليه، على الحجوزات المكتملة. لا عمولة على مقدّم الخدمة.",
  },
  // Tab=القنوات 2126:904
  channels: {
    rows: [
      [
        {
          kind: "bars",
          title: "الوكالات",
          sub: "قسائم أكتوبر",
          stats: [
            { value: "41", label: "قسيمة صدرت" },
            { value: "27", label: "مستخدمة" },
            { value: "12", label: "وكالة نشطة" },
          ],
          bars: [
            { label: "الريادة للسيارات", value: "14", pct: 1 },
            { label: "شركة الوسيط", value: "7", pct: 0.5 },
            { label: "السهم الذهبي · النخيل", value: "6 · 6", pct: 0.43 },
          ],
        },
        {
          kind: "bars",
          title: "المسوّقون",
          sub: "إحالات أكتوبر",
          stats: [
            { value: "47", label: "حجزاً بالإحالة" },
            { value: "38", label: "مسوّقاً نشطاً" },
            { value: "12,860", label: "عمولات · ر.س" },
          ],
          bars: [
            { label: "رنا الأنصاري · SM118", value: "7", pct: 1 },
            { label: "تركي الحارثي · SM123", value: "6", pct: 0.857 },
            { label: "دانة الزهراني · SM140", value: "5", pct: 0.714 },
          ],
        },
      ],
      [
        {
          kind: "stats",
          title: "إحالة العملاء",
          sub: "صديق يدعو صديقاً",
          stats: [
            { value: "118", label: "دعوة" },
            { value: "64", label: "أول حجز مكتمل" },
            { value: "32,000", label: "نقطة مكافآت" },
          ],
        },
      ],
    ],
  },
  // Tab=الاعتماد والطاقة 2126:1081
  capacity: {
    rows: [
      [
        {
          kind: "bars",
          tight: true,
          title: "التصنيف حسب المدينة",
          sub: "المراكز المقبولة",
          bars: [
            { label: "جدة · 11", value: "بلاتيني 3 · ذهبي 6 · فضي 2", pct: 1 },
            { label: "الرياض · 11", value: "بلاتيني 2 · ذهبي 5 · فضي 4", pct: 1 },
            { label: "الدمام · 4", value: "بلاتيني 1 · ذهبي 2 · فضي 1", pct: 0.36 },
          ],
        },
        {
          kind: "bars",
          tight: true,
          title: "طاقة الشبكة اليومية",
          sub: "خليط 70% تظليل و30% PPF",
          bars: [
            { label: "الطاقة", value: "214 سيارة/يوم", pct: 1 },
            { label: "هدف السنة الأولى", value: "82/يوم · 30,000 حجز", pct: 0.383, tone: "lime" },
            { label: "حجوزات أكتوبر الفعلية (تظليل + PPF)", value: "29/يوم", pct: 0.135, tone: "info" },
          ],
        },
      ],
      [
        {
          kind: "bars",
          tight: true,
          title: "المواد الأكثر استخداماً · حسب العلامة",
          sub: "كم مركز يستخدم كل فلم أو نانو",
          bars: [
            { label: "LLumar (تظليل)", value: "7 مراكز", pct: 1 },
            { label: "XPEL (PPF)", value: "6", pct: 0.857 },
            { label: "Ceramic Pro (نانو)", value: "6", pct: 0.857 },
            { label: "3M (تظليل)", value: "4", pct: 0.571 },
            { label: "Gyeon (نانو)", value: "3", pct: 0.428 },
          ],
        },
        {
          kind: "bars",
          tight: true,
          title: "حسب مكان الصنع",
          bars: [
            { label: "الولايات المتحدة", value: "14 مركزاً", pct: 1 },
            { label: "كوريا الجنوبية", value: "5", pct: 0.357 },
            { label: "ألمانيا", value: "4", pct: 0.285 },
            { label: "الصين", value: "2", pct: 0.142 },
          ],
        },
      ],
      [
        {
          kind: "bars",
          tight: true,
          title: "المغاسل حسب نوع الغسيل",
          sub: "14 مركزاً عندها مغسلة",
          bars: [
            { label: "يدوي فقط", value: "6", pct: 1 },
            { label: "آلي + يدوي", value: "5", pct: 0.833 },
            { label: "آلي فقط", value: "3", pct: 0.5 },
          ],
        },
        {
          kind: "bars",
          tight: true,
          title: "حالات الاعتماد",
          bars: [
            { label: "معتمد LINKAR", value: "21", pct: 1, tone: "lime" },
            { label: "تحت التجربة", value: "2", pct: 0.095 },
            { label: "ينتظر القرار", value: "2", pct: 0.095 },
            { label: "بانتظار التفعيل", value: "1", pct: 0.047 },
            { label: "غير مقبول", value: "1", pct: 0.047 },
          ],
        },
      ],
    ],
  },
  // Tab=سلوك العملاء 3400:228859
  behavior: {
    stats: [
      { value: "21,640", label: "عمليات البحث" },
      { value: "1,652", label: "طلبات الحجز" },
      { value: "7.6%", label: "تحويل البحث إلى طلب" },
      { value: "1,368", label: "بحث بلا نتيجة" },
    ],
    rows: [
      [
        {
          kind: "table",
          title: "الطلب حسب الخدمة والمدينة",
          groups: [{ label: "", span: 1 }, ...["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر", "الإجمالي"].map((c) => ({ label: c, span: 2 }))],
          cols: [{ label: "الخدمة", w: 120 }, ...Array.from({ length: 6 }, () => [{ label: "بحث", w: 66 }, { label: "طلبات", w: 66 }]).flat()],
          rows: [
            { cells: ["نانو سيراميك", "2,520", "202", "1,960", "157", "560", "46", "210", "—", "110", "—", "5,360", "405"] },
            { cells: ["الغسيل", "2,310", "196", "1,780", "151", "500", "41", "160", "—", "85", "—", "4,835", "388"] },
            { cells: ["التظليل", "2,280", "190", "1,790", "147", "520", "47", "190", "—", "105", "—", "4,885", "384"] },
            { cells: ["التلميع", "1,860", "158", "1,450", "121", "390", "33", "100", "—", "55", "—", "3,855", "312"] },
            { cells: ["حماية PPF", "960", "80", "760", "65", "230", "18", "60", "—", "35", "—", "2,045", "163"] },
            { cells: ["الإجمالي", "9,930", "826", "7,740", "641", "2,200", "185", "720", "—", "390", "—", "20,980", "1,652"].map((t) => ({ text: t, medium: true })) },
          ],
        },
      ],
      [
        {
          kind: "columns",
          title: "الأيام المطلوبة",
          sub: "طلبات الحجز حسب اليوم",
          cols: [
            { label: "الأحد", value: "214", n: 214 },
            { label: "الاثنين", value: "196", n: 196 },
            { label: "الثلاثاء", value: "205", n: 205 },
            { label: "الأربعاء", value: "231", n: 231 },
            { label: "الخميس", value: "302", n: 302 },
            { label: "الجمعة", value: "186", n: 186 },
            { label: "السبت", value: "318", n: 318, hi: true },
          ],
        },
        {
          kind: "table",
          title: "أكثر التواريخ طلباً",
          cols: [{ label: "التاريخ" }, { label: "طلبات الحجز", w: 90 }],
          rows: [
            { cells: ["17 أكتوبر 2026", "96"] },
            { cells: ["15 أكتوبر 2026", "88"] },
            { cells: ["10 أكتوبر 2026", "84"] },
            { cells: ["22 أكتوبر 2026", "71"] },
            { cells: ["24 أكتوبر 2026", "66"] },
          ],
        },
      ],
      [
        {
          kind: "table",
          title: "بحث بلا نتيجة",
          cols: [{ label: "الخدمة" }, { label: "المدينة", w: 100 }, { label: "عمليات البحث", w: 90 }],
          rows: [
            { cells: ["نانو سيراميك", "مكة المكرمة", "210"] },
            { cells: ["التظليل", "مكة المكرمة", "190"] },
            { cells: ["الغسيل", "مكة المكرمة", "160"] },
            { cells: ["حماية PPF", "الدمام", "124"] },
            { cells: ["نانو سيراميك", "الخبر", "110"] },
            { cells: ["التظليل", "الخبر", "105"] },
            { cells: ["التلميع", "مكة المكرمة", "100"] },
            { cells: ["الغسيل", "الخبر", "85"] },
          ],
        },
        {
          kind: "table",
          title: "كلمات البحث",
          cols: [{ label: "الكلمة" }, { label: "التصنيف", w: 120 }, { label: "عمليات البحث", w: 90 }],
          rows: [
            { cells: ["نانو", "نانو سيراميك", "1,840"] },
            { cells: ["عازل حراري", "التظليل", "960"] },
            { cells: ["بوليش", "التلميع", "640"] },
            { cells: ["فيلم حماية", "حماية PPF", "520"] },
          ],
          tables: [
            {
              cols: [{ label: "كلمات بلا تصنيف" }, { label: "عمليات البحث", w: 90 }],
              rows: [{ cells: ["تغيير زيت", "214"] }, { cells: ["تنجيد", "96"] }, { cells: ["إطارات", "88"] }],
            },
          ],
        },
      ],
      [
        {
          kind: "bars",
          title: "كيف سمعت عن لينكار؟",
          sub: "1,036 إجابة",
          bars: [
            { label: "سناب شات", value: "286 · 27.6%", pct: 1 },
            { label: "إنستغرام", value: "214 · 20.7%", pct: 0.748 },
            { label: "صديق أو قريب", value: "168 · 16.2%", pct: 0.587 },
            { label: "بحث Google", value: "142 · 13.7%", pct: 0.496 },
            { label: "تيك توك", value: "98 · 9.5%", pct: 0.342 },
            { label: "مركز الخدمة", value: "74 · 7.1%", pct: 0.258 },
            { label: "أخرى", value: "54 · 5.2%", pct: 0.188 },
          ],
        },
      ],
    ],
  },
};

// Tab=الطلب · جونسون 2126:1004 — «الطلب» بعد اختيار مركز من فلتر «المركز»
const SCOPED_DEMAND: Record<string, Omit<AnalyticsView, "scope">> = {
  "lk-jn-001": {
    stats: [
      { value: "139", label: "حجوزات الشهر" },
      { value: "74", label: "مكتملة" },
      { value: "262,450", label: "قيمة الحجوزات · ر.س" },
      { value: "16,296", label: "هامش لينكار · ر.س" },
    ],
    rows: [
      [
        { kind: "columns", title: "الحجوزات الشهرية", sub: "جونسون", cols: months(["259", "296", "334", "139"], [259, 296, 334, 139]) },
        {
          kind: "bars",
          title: "حسب الفرع",
          bars: [
            { label: "فرع الزهراء", value: "58 · 42%", pct: 1 },
            { label: "فرع الحمراء", value: "46 · 33%", pct: 0.793 },
            { label: "فرع المحمدية", value: "35 · 25%", pct: 0.603 },
          ],
        },
      ],
    ],
  },
};

export type AnalyticsFilters = { period?: string; city?: string; type?: string; center?: string; centerName?: string; branch?: string; branchName?: string };

export const analyticsApi = {
  get: async (tab: AnalyticsTab, f: AnalyticsFilters = {}): Promise<AnalyticsView> => {
    if (tab === "demand" && f.center) {
      const name = f.centerName ?? "";
      const scope = f.branch ? `النطاق: ${name} · فرع ${f.branchName ?? ""}.` : `النطاق: ${name} · كل الفروع. اختر فرعاً من «الفرع» لتضييق النطاق.`;
      // مراكز من غير بيانات في الفترة → أصفار بنفس الشكل
      const v = SCOPED_DEMAND[f.center] ?? {
        stats: ["حجوزات الشهر", "مكتملة", "قيمة الحجوزات · ر.س", "هامش لينكار · ر.س"].map((label) => ({ value: "0", label })),
        rows: [[{ kind: "columns", title: "الحجوزات الشهرية", sub: name, cols: months(["0", "0", "0", "0"], [0, 0, 0, 0]) }, { kind: "bars", title: "حسب الفرع", bars: [] }]],
      };
      return delay(structuredClone({ scope, ...v }));
    }
    return delay(structuredClone(TABS[tab]));
  },
};
