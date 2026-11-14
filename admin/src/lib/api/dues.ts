// مستحقات المزوّدين (المرحلة 2 · Figma «v5 · 14 · مستحقات المزوّدين» 3114:71707):
// كل حجز منفّذ تُضاف تكلفته (سعر التكلفة المتفق عليه شامل الضريبة) لمستحقات مقدّم الخدمة، وتحوّل لينكار المستحق كل 15 يوماً
// (1 و16 من الشهر) أو عند بلوغ الحد الأدنى للحساب، مع كشف + فاتورة فوترة ذاتية (SB-… في «الفواتير والقسائم»).
// الأرقام نفس لوحة المزوّد (تحويل جونسون سبتمبر = 410,230 = SB-2026-10-0062). النصوص حرفياً من الإطارات.
import { ApiError, delay } from "./errors";

export type DuesTab = "dues" | "transfers" | "claims";
export type DTone = "success" | "warning" | "info" | "neutral" | "ready" | "danger";

/** نص رئيسي + سطر رمادي تحته */
export type Two = { main: string; sub?: string };

export interface DueRow {
  providerId: string;
  name: string;
  sub: string;
  bookings: string;
  cost: string;
  deductions: Two;
  net: string;
  account: Two;
  status: string;
  tone: DTone;
  /** زر «تحويل» في الصف (بلغ الحد الأدنى) */
  canTransfer: boolean;
}

export interface TransferRow {
  id: string;
  provider: string;
  providerId: string;
  period: string;
  bookings: string;
  amount: string;
  account: string;
  date: string;
  status: string;
}

export interface ClaimRow {
  id: string;
  provider: string;
  providerId: string;
  code: string;
  scope: string;
  date: string;
  bookings: string;
  amount: string;
  invoice: string;
  status: "review" | "approved" | "transferred" | "returned" | "rejected";
  transfer?: string;
}
export const CLAIM_STATUS: Record<ClaimRow["status"], { label: string; tone: DTone }> = {
  review: { label: "قيد النظر", tone: "warning" },
  approved: { label: "معتمدة · جاهز للتحويل", tone: "success" },
  transferred: { label: "تم التحويل", tone: "success" },
  returned: { label: "أُعيدت للتعديل", tone: "warning" },
  rejected: { label: "مرفوضة", tone: "danger" },
};

/** بلوكات أدراج الكشف/التحويل/المطالبة بالترتيب زي Figma */
export type Block =
  | { kind: "kv"; title: string; rows: [string, string, ("success" | "bold")?][] }
  | { kind: "table"; title: string; cols: { h: string; h2?: string; w: number }[]; rows: (string | Two)[][] }
  | { kind: "link"; label: string; href?: string; download?: boolean }
  | { kind: "note"; text: string }
  | { kind: "status"; label: string; tone: DTone };

export interface DrawerDoc {
  title: string;
  subtitle: string;
  hero?: { pill: string; tone: DTone; title: string; lines: string[] };
  blocks: Block[];
}
export interface Statement extends DrawerDoc {
  providerId: string;
  /** أزرار الذيل: تحميل الكشف + (تحويل المستحق) + إضافة خصم أو تسوية — أو «إغلاق» بس */
  footer: "full" | "close";
}

export interface TransferQuote {
  providerId: string;
  name: string;
  subtitle: string;
  rows: [string, string][];
  note?: string;
  amount: string;
  claim?: string;
}

// ───────────── الصفوف (CON5-14 · مستحقات أكتوبر) ─────────────
const R = (providerId: string, name: string, sub: string, bookings: string, cost: string, deductions: Two, net: string, account: Two, status: string, tone: DTone, canTransfer = false): DueRow => ({
  providerId,
  name,
  sub,
  bookings,
  cost,
  deductions,
  net,
  account,
  status,
  tone,
  canTransfer,
});
const DASH: Two = { main: "—" };
const ROWS: DueRow[] = [
  R("lk-jn-001", "جونسون Johnson", "‏LK-JN-001‏ · 3 فروع · مجمّعة · كل 15 يوماً", "123", "153,940", DASH, "153,940", { main: "الراجحي •••• 4471", sub: "طلب تغيير قيد التحقق · REQ-0427" }, "مطالبة قيد النظر", "warning"),
  R("lk-lm-001", "لومار LLumar", "‏LK-LM-001‏ · 5 فروع · لكل فرع · كل 15 يوماً", "186", "241,780", { main: "−1,500", sub: "اشتراك «ظهورك»" }, "240,280", { main: "الأهلي •••• 2208", sub: "موثّق" }, "قيد النظر", "info"),
  R("lk-xp-001", "‏XPEL السعودية", "‏LK-XP-001‏ · 6 فروع · مجمّعة · كل 15 يوماً", "74", "398,620", { main: "—", sub: "سنوي مدفوع مقدماً" }, "398,620", { main: "الإنماء •••• 9035", sub: "موثّق" }, "قيد النظر", "info"),
  R("lk-ns-001", "نانو شيلد", "‏LK-NS-001‏ · 4 فروع · مجمّعة · عند بلوغ 50,000 ر.س", "92", "127,400", DASH, "127,400", { main: "البلاد •••• 6610", sub: "موثّق" }, "جاهز للتحويل", "ready", true),
  R("lk-dr-001", "مركز درع للحماية", "‏LK-DR-001 · فرعان · مجمّعة · عند بلوغ 20,000 ر.س", "38", "61,350", { main: "−1,500", sub: "اشتراك «ظهورك»" }, "59,850", { main: "ساب •••• 5524", sub: "موثّق" }, "جاهز للتحويل", "ready", true),
  R("lk-la-001", "مركز لمعة للتلميع", "‏LK-LA-001‏ · 3 فروع · مجمّعة · كل 15 يوماً", "141", "42,180", { main: "−1,820", sub: "اشتراك · استرداد CM-3341" }, "40,360", { main: "الراجحي •••• 1187", sub: "موثّق" }, "قيد النظر", "info"),
  R("lk-rm-001", "مركز الريم", "‏LK-RM-001 · فرع واحد · مجمّعة · عند بلوغ 500 ر.س", "0", "—", DASH, "—", { main: "الرياض •••• 3092", sub: "موثّق" }, "لا حجوزات بعد", "neutral"),
  R("lk-nd-001", "مغسلة الندى", "‏LK-ND-001 · بانتظار الزيارة · غير مسجّل ضريبياً", "—", "—", DASH, "—", { main: "الجزيرة •••• 7741", sub: "بانتظار التحقق" }, "لم تبدأ", "neutral"),
];

// ───────────── التحويلات (CON5-14 · التحويلات) ─────────────
const T = (id: string, provider: string, providerId: string, period: string, bookings: string, amount: string, account: string, date: string): TransferRow => ({ id, provider, providerId, period, bookings, amount, account, date, status: "تم التحويل" });
const TRANSFERS: TransferRow[] = [
  T("TRF-2026-10-0062", "جونسون Johnson", "lk-jn-001", "سبتمبر 2026", "334", "410,230", "الراجحي •••• 4471", "1 أكتوبر 2026"),
  T("TRF-2026-10-0063", "لومار LLumar", "lk-lm-001", "سبتمبر 2026", "512", "668,940", "الأهلي •••• 2208", "1 أكتوبر 2026"),
  T("TRF-2026-10-0064", "‏XPEL السعودية", "lk-xp-001", "سبتمبر 2026", "203", "1,094,310", "الإنماء •••• 9035", "1 أكتوبر 2026"),
  T("TRF-2026-10-0065", "نانو شيلد", "lk-ns-001", "سبتمبر 2026", "248", "343,560", "البلاد •••• 6610", "1 أكتوبر 2026"),
  T("TRF-2026-10-0066", "مركز لمعة للتلميع", "lk-la-001", "سبتمبر 2026", "389", "116,480", "الراجحي •••• 1187", "1 أكتوبر 2026"),
  T("TRF-2026-10-0067", "مركز درع للحماية", "lk-dr-001", "سبتمبر 2026", "102", "165,240", "ساب •••• 5524", "1 أكتوبر 2026"),
  T("TRF-2026-09-0048", "جونسون Johnson", "lk-jn-001", "أغسطس 2026", "296", "364,080", "الراجحي •••• 4471", "1 سبتمبر 2026"),
];
/** تفاصيل درج التحويل (CON5-14D · TRF-…) */
const TRF_DETAIL: Record<string, { sub: string; account: string; ref: string; arrived: string }> = {
  "TRF-2026-10-0062": { sub: "جونسون Johnson", account: "مصرف الراجحي •••• 4471 · شركة جونسون للعناية بالسيارات", ref: "RJH-0062-7781", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-10-0063": { sub: "لومار LLumar", account: "البنك الأهلي السعودي •••• 2208", ref: "SNB-0063-1204", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-10-0064": { sub: "‏XPEL", account: "مصرف الإنماء •••• 9035", ref: "INM-0064-5520", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-10-0065": { sub: "نانو شيلد", account: "بنك البلاد •••• 6610", ref: "BLD-0065-3307", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-10-0066": { sub: "مركز لمعة للتلميع", account: "مصرف الراجحي •••• 1187", ref: "RJH-0066-8813", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-10-0067": { sub: "مركز درع للحماية", account: "ساب •••• 5524", ref: "SAB-0067-2291", arrived: "وصل الحساب خلال يوم عمل" },
  "TRF-2026-09-0048": { sub: "جونسون Johnson", account: "مصرف الراجحي •••• 4471 · شركة جونسون للعناية بالسيارات", ref: "RJH-0048-7781", arrived: "وصل الحساب خلال يوم عمل" },
};

// ───────────── المطالبات المالية ─────────────
const CLAIMS: ClaimRow[] = [
  { id: "CL-2026-0013", provider: "لومار LLumar", providerId: "lk-lm-001", code: "LK-LM-001", scope: "فرع العليا", date: "14 أكتوبر 2026", bookings: "64", amount: "83,120 ر.س", invoice: "INV-LM-2026-0388", status: "review" },
  { id: "CL-2026-0012", provider: "نانو شيلد", providerId: "lk-ns-001", code: "LK-NS-001", scope: "كل الفروع", date: "14 أكتوبر 2026", bookings: "92", amount: "127,400 ر.س", invoice: "INV-NS-2026-0207", status: "approved" },
  { id: "CL-2026-0011", provider: "مركز درع للحماية", providerId: "lk-dr-001", code: "LK-DR-001", scope: "كل الفروع", date: "14 أكتوبر 2026", bookings: "38", amount: "61,350 ر.س", invoice: "INV-DR-2026-0093", status: "approved" },
  { id: "CL-2026-0010", provider: "جونسون Johnson", providerId: "lk-jn-001", code: "LK-JN-001", scope: "كل الفروع", date: "14 أكتوبر 2026", bookings: "117", amount: "147,380 ر.س", invoice: "INV-JN-2026-0141", status: "review" },
  { id: "CL-2026-0009", provider: "جونسون Johnson", providerId: "lk-jn-001", code: "LK-JN-001", scope: "كل الفروع", date: "30 سبتمبر 2026", bookings: "334", amount: "410,230 ر.س", invoice: "INV-JN-2026-0128", status: "transferred", transfer: "TRF-2026-10-0062" },
];
/** درج مراجعة المطالبة (CON5-14C) */
const CLAIM_DOC: Record<string, Omit<DrawerDoc, "hero">> = {
  "CL-2026-0010": {
    title: "مراجعة المطالبة CL-2026-0010",
    subtitle: "جونسون Johnson · كل الفروع",
    blocks: [
      { kind: "kv", title: "مقدّم الخدمة", rows: [["المنشأة", "جونسون Johnson · LK-JN-001"], ["النطاق", "كل الفروع (3)"], ["رفعها", "فهد العتيبي · المالك"], ["تاريخ الرفع", "14 أكتوبر 2026"]] },
      { kind: "kv", title: "المبالغ", rows: [["الحجوزات", "117"], ["قبل الضريبة", "128,156.52 ر.س"], ["ضريبة القيمة المضافة 15%", "19,223.48 ر.س"], ["الإجمالي شامل الضريبة", "147,380.00 ر.س", "bold"]] },
      {
        kind: "kv",
        title: "التحقق",
        rows: [
          ["الحجوزات", "117 حجزاً معتمداً من لينكار ✓", "success"],
          ["الحد الأدنى للمطالبة", "6,000 ر.س · مستوفى ✓", "success"],
          ["الفاتورة الضريبية", "‏INV-JN-2026-0141 · مطابقة للمبلغ ✓", "success"],
          ["الرقم الضريبي", "311245678900003"],
          ["حساب التحويل", "الراجحي •••• 4471 · موثّق"],
        ],
      },
      {
        kind: "kv",
        title: "حسب الخدمة",
        rows: [
          ["Johnson Ceramic Pro · 40", "68,960 ر.س"],
          ["طبقة طاردة للماء + تلميع · 26", "31,440 ر.س"],
          ["تفصيل داخلي كامل · 30", "12,720 ر.س"],
          ["باقة العناية الكاملة · 10", "13,520 ر.س"],
          ["باقة النانو والتلميع · 8", "12,400 ر.س"],
          ["‏PPF للواجهة + نانو سيراميك · 3", "8,340 ر.س"],
        ],
      },
      { kind: "kv", title: "المرفقات", rows: [["الفاتورة الضريبية", "INV-JN-2026-0141.pdf"], ["كشف الحجوزات", "117 حجزاً · CSV"]] },
    ],
  },
  "CL-2026-0013": {
    title: "مراجعة المطالبة CL-2026-0013",
    subtitle: "لومار LLumar · فرع العليا",
    blocks: [
      { kind: "kv", title: "مقدّم الخدمة", rows: [["المنشأة", "لومار LLumar · LK-LM-001"], ["النطاق", "فرع العليا"], ["رفعها", "المالك"], ["تاريخ الرفع", "14 أكتوبر 2026"]] },
      { kind: "kv", title: "المبالغ", rows: [["الحجوزات", "64"], ["قبل الضريبة", "72,278.26 ر.س"], ["ضريبة القيمة المضافة 15%", "10,841.74 ر.س"], ["الإجمالي شامل الضريبة", "83,120.00 ر.س", "bold"]] },
      {
        kind: "kv",
        title: "التحقق",
        rows: [
          ["الحجوزات", "64 حجزاً معتمداً من لينكار ✓", "success"],
          ["الحد الأدنى للمطالبة", "5,000 ر.س · مستوفى ✓", "success"],
          ["الفاتورة الضريبية", "‏INV-LM-2026-0388 · مطابقة للمبلغ ✓", "success"],
          ["الرقم الضريبي", "310987654300003"],
          ["حساب التحويل", "الأهلي •••• 2208 · موثّق"],
        ],
      },
      {
        kind: "kv",
        title: "حسب الخدمة",
        rows: [
          ["تظليل LLumar CTX‏ · 28", "39,200 ر.س"],
          ["تظليل LLumar IRX‏ · 18", "30,600 ر.س"],
          ["حماية PPF للواجهة · 3", "9,720 ر.س"],
          ["تلميع خارجي · 15", "3,600 ر.س"],
        ],
      },
      { kind: "kv", title: "المرفقات", rows: [["الفاتورة الضريبية", "INV-LM-2026-0388.pdf"], ["كشف الحجوزات", "64 حجزاً · CSV"]] },
    ],
  },
};
/** «سبب التعديل» / «سبب الرفض» (أول خيار = القيمة في الإطار) */
export const CLAIM_EDIT_REASONS = ["الفاتورة الضريبية لا تطابق مبلغ المطالبة", "حجوزات غير معتمدة ضمن المطالبة", "الرقم الضريبي غير مطابق", "سبب آخر"];
export const CLAIM_REJECT_REASONS = ["حجوزات غير معتمدة ضمن المطالبة", "الفاتورة الضريبية لا تطابق مبلغ المطالبة", "مطالبة مكررة", "سبب آخر"];
/** CON5-DD · نوع الخصم · الشكوى والحجز */
export const DEDUCTION_TYPES = ["استرداد لعميل بعد شكوى مثبتة على الخدمة", "اشتراك ميزة مدفوعة", "تسوية أخرى"];
export const DEDUCTION_COMPLAINTS: Record<string, string[]> = { "lk-jn-001": ["‏CM-3349 · BK-21426 · أحمد ز. · المحمدية · Johnson Ceramic Pro"] };

// ───────────── الكشوف (CON5-14D · كشف … · أكتوبر) ─────────────
const COST_COLS = [
  { h: "الفرع", w: 270 },
  { h: "حجوزات منفّذة", w: 110 },
  { h: "بسعر التكلفة", h2: "شامل الضريبة", w: 110 },
];
const LAST_COLS = [
  { h: "الحجز", w: 90 },
  { h: "الفرع", w: 70 },
  { h: "الخدمة", w: 190 },
  { h: "سعر البيع", w: 70 },
  { h: "التكلفة", w: 70 },
];
const LAST = "آخر الحجوزات المنفّذة · الأسعار شاملة الضريبة";
const FIRST_CYCLE: [string, string] = ["أول دورة نصف شهرية", "1 – 15 نوفمبر 2026 · تُحوَّل 16 نوفمبر 2026"];
const VERIFIED: [string, string] = ["الحالة", "موثّق بشهادة الآيبان"];
const settle = (method: string, rule: string, tax: string): Block => ({ kind: "kv", title: "التسوية والضريبة", rows: [["طريقة التسوية", method], ["قاعدة التحويل", rule], ["بسعر التكلفة · الضريبة", tax], FIRST_CYCLE] });
const branches = (rows: [string, string, string][]): Block => ({ kind: "table", title: "حسب الفرع", cols: COST_COLS, rows });
const hero = (pill: string, tone: DTone, due: string, lines: string[]) => ({ pill, tone, title: `المستحق حتى الآن · ${due} ر.س`, lines });

const STATEMENTS: Record<string, Statement> = {
  "lk-jn-001": {
    providerId: "lk-jn-001",
    title: "كشف جونسون Johnson · أكتوبر 2026",
    subtitle: "‏LK-JN-001‏ · 3 فروع · يُحوَّل 1 نوفمبر 2026",
    hero: hero("قيد النظر", "info", "153,940", ["123 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 192,430 · هامش 38,490 (20%)"]),
    blocks: [
      settle("مجمّعة لكل الفروع · تحويل واحد", "كل 15 يوماً · تحددها لينكار", "قبل الضريبة 133,860.87 · ضريبة 15% 20,079.13 · الإجمالي 153,940 ر.س"),
      branches([
        ["الزهراء", "52", "64,180"],
        ["الحمراء", "38", "46,310"],
        ["المحمدية", "33", "43,450"],
      ]),
      {
        kind: "table",
        title: LAST,
        cols: LAST_COLS,
        rows: [
          [{ main: "BK-21459", sub: "سعود ب." }, "المحمدية", "تفصيل داخلي كامل · SUV كبير", "649", "520"],
          [{ main: "BK-21447", sub: "لمى ع." }, "الزهراء", "باقة النانو والتلميع · SUV متوسط", "2,199", "1,760"],
          [{ main: "BK-21438", sub: "فهد م." }, "الحمراء", "تفصيل داخلي كامل · سيدان", "449", "360"],
          [{ main: "BK-21426", sub: "أحمد ز." }, "المحمدية", "‏Johnson Ceramic Pro · SUV كبير", "2,499", "1,990"],
          [{ main: "BK-21419", sub: "نوف ر." }, "الزهراء", "طبقة طاردة للماء + تلميع · SUV متوسط", "1,499", "1,240"],
        ],
      },
      { kind: "link", label: "كل حجوزات جونسون Johnson المنفّذة في أكتوبر", href: "/bookings?provider=lk-jn-001&period=2026-10" },
      {
        kind: "kv",
        title: "الخصومات والتسويات",
        rows: [
          ["اشتراك «ظهورك على لينكار»", "تجربة مجانية حتى 31 أكتوبر 2026 · أول خصم 1,500 في تحويل 1 ديسمبر 2026"],
          ["استرداد بعد شكوى", "لا يوجد هذا الشهر"],
        ],
      },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "مصرف الراجحي •••• 4471"], ["الحالة", "شركة جونسون للعناية بالسيارات · موثّق بشهادة الآيبان"]] },
      { kind: "note", text: "طلب تغيير الحساب REQ-2026-0427 إلى البنك الأهلي •••• 3456 قيد التحقق. التحويلات تبقى على الراجحي حتى الاعتماد." },
    ],
    footer: "full",
  },
  "lk-lm-001": {
    providerId: "lk-lm-001",
    title: "كشف لومار LLumar · أكتوبر 2026",
    subtitle: "‏LK-LM-001‏ · 5 فروع · يُحوَّل 1 نوفمبر 2026",
    hero: hero("قيد النظر", "info", "240,280", ["186 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 300,650 · هامش 58,870 (19.6%)"]),
    blocks: [
      settle("لكل فرع على حدة · 5 تحويلات للحساب نفسه", "كل 15 يوماً لكل فرع · تحددها لينكار", "قبل الضريبة 210,243.48 · ضريبة 15% 31,536.52 · الإجمالي 241,780 ر.س"),
      branches([
        ["الروضة", "41", "53,280"],
        ["العليا", "36", "46,800"],
        ["3 فروع أخرى", "109", "141,700"],
      ]),
      { kind: "kv", title: "الخصومات والتسويات", rows: [["اشتراك «ظهورك على لينكار»", "−1,500 ر.س · أكتوبر"]] },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "البنك الأهلي السعودي •••• 2208 · لكل الفروع الخمسة"], VERIFIED] },
    ],
    footer: "full",
  },
  "lk-xp-001": {
    providerId: "lk-xp-001",
    title: "كشف XPEL · أكتوبر 2026",
    subtitle: "‏LK-XP-001‏ · 6 فروع · يُحوَّل 1 نوفمبر 2026",
    hero: hero("قيد النظر", "info", "398,620", ["74 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 476,180 · هامش 77,560 (16.3%)"]),
    blocks: [
      settle("مجمّعة لكل الفروع · تحويل واحد", "كل 15 يوماً · تحددها لينكار", "قبل الضريبة 346,626.09 · ضريبة 15% 51,993.91 · الإجمالي 398,620 ر.س"),
      branches([
        ["العليا", "21", "113,400"],
        ["الملقا", "17", "91,580"],
        ["4 فروع أخرى", "36", "193,640"],
      ]),
      { kind: "kv", title: "الخصومات والتسويات", rows: [["اشتراك «ظهورك على لينكار»", "سنوي مدفوع مقدماً حتى 31 ديسمبر 2026 · لا خصم شهري"]] },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "مصرف الإنماء •••• 9035"], VERIFIED] },
    ],
    footer: "full",
  },
  "lk-ns-001": {
    providerId: "lk-ns-001",
    title: "كشف نانو شيلد · أكتوبر 2026",
    subtitle: "‏LK-NS-001‏ · 4 فروع · يُحوَّل 1 نوفمبر 2026",
    hero: hero("جاهز للتحويل", "info", "127,400", ["92 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 157,980 · هامش 30,580 (19.4%)"]),
    blocks: [
      settle("مجمّعة لكل الفروع · تحويل واحد", "عند بلوغ 50,000 ر.س · تحددها لينكار", "قبل الضريبة 110,782.61 · ضريبة 15% 16,617.39 · الإجمالي 127,400 ر.س"),
      branches([
        ["الروضة", "34", "47,100"],
        ["السلامة", "26", "36,000"],
        ["فرعان آخران", "32", "44,300"],
      ]),
      { kind: "table", title: LAST, cols: LAST_COLS, rows: [[{ main: "BK-21468", sub: "ريما د." }, "الروضة", "نانو سيراميك ثلاث طبقات · سيدان", "1,799", "1,450"]] },
      { kind: "kv", title: "الخصومات والتسويات", rows: [["خصومات", "لا يوجد هذا الشهر"]] },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "بنك البلاد •••• 6610"], VERIFIED] },
    ],
    footer: "full",
  },
  "lk-dr-001": {
    providerId: "lk-dr-001",
    title: "كشف مركز درع للحماية · أكتوبر 2026",
    subtitle: "‏LK-DR-001 · فرعان · يُحوَّل 1 نوفمبر 2026",
    hero: hero("جاهز للتحويل", "info", "59,850", ["38 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 75,460 · هامش 14,110 (18.7%)"]),
    blocks: [
      settle("مجمّعة لكل الفروع · تحويل واحد", "عند بلوغ 20,000 ر.س · تحددها لينكار", "قبل الضريبة 53,347.83 · ضريبة 15% 8,002.17 · الإجمالي 61,350 ر.س"),
      branches([
        ["النسيم", "14", "22,600"],
        ["فرع آخر", "24", "38,750"],
      ]),
      { kind: "kv", title: "الخصومات والتسويات", rows: [["اشتراك «ظهورك على لينكار»", "−1,500 ر.س · أكتوبر"]] },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "البنك السعودي البريطاني (ساب) •••• 5524"], VERIFIED] },
    ],
    footer: "full",
  },
  "lk-la-001": {
    providerId: "lk-la-001",
    title: "كشف مركز لمعة للتلميع · أكتوبر 2026",
    subtitle: "‏LK-LA-001‏ · 3 فروع · يُحوَّل 1 نوفمبر 2026",
    hero: hero("قيد النظر", "info", "40,360", ["141 حجزاً منفّذاً بسعر التكلفة", "مبيعات لينكار عنها 52,720 · هامش 10,540 (20%)"]),
    blocks: [
      settle("مجمّعة لكل الفروع · تحويل واحد", "كل 15 يوماً · تحددها لينكار", "قبل الضريبة 36,678.26 · ضريبة 15% 5,501.74 · الإجمالي 42,180 ر.س"),
      branches([
        ["السلامة", "47", "14,060"],
        ["فرعان آخران", "94", "28,120"],
      ]),
      {
        kind: "kv",
        title: "الخصومات والتسويات",
        rows: [
          ["اشتراك «ظهورك على لينكار»", "−1,500 ر.س · أكتوبر"],
          ["استرداد بعد شكوى مثبتة", "−320 ر.س · CM-3341 · BK-21391 · تلميع ثلاث مراحل"],
        ],
      },
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "مصرف الراجحي •••• 1187"], VERIFIED] },
    ],
    footer: "full",
  },
  "lk-rm-001": {
    providerId: "lk-rm-001",
    title: "كشف مركز الريم · أكتوبر 2026",
    subtitle: "‏LK-RM-001 · فرع واحد · يُحوَّل 1 نوفمبر 2026",
    hero: hero("لا مستحقات", "neutral", "0", ["«معتمد جديد» · لم يقدّم خدمة بعد. أول مستحقات تظهر هنا بعد أول حجز منفّذ."]),
    blocks: [settle("مجمّعة · فرع واحد", "عند بلوغ 500 ر.س · تحددها لينكار", "لا مبالغ في هذه الدورة"), { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "بنك الرياض •••• 3092"], VERIFIED] }],
    footer: "close",
  },
  "lk-nd-001": {
    providerId: "lk-nd-001",
    title: "كشف مغسلة الندى · أكتوبر 2026",
    subtitle: "‏LK-ND-001 · بانتظار الزيارة الميدانية · يُحوَّل 1 نوفمبر 2026",
    hero: hero("لا مستحقات", "neutral", "0", ["لم تبدأ بعد: الفرع ينتظر الزيارة الميدانية 22 أكتوبر 2026، ولا تظهر للعملاء قبل اعتمادها."]),
    blocks: [
      settle("مجمّعة · فرع واحد", "عند بلوغ 500 ر.س · تحددها لينكار", "غير مسجّل ضريبياً · المبالغ بدون ضريبة"),
      { kind: "kv", title: "حساب التحويل", rows: [["البنك والحساب", "بنك الجزيرة •••• 7741"], ["الحالة", "بانتظار التحقق من شهادة الآيبان · سُجّل عند الإضافة"]] },
    ],
    footer: "close",
  },
};

// ───────────── نوافذ التحويل (CON5-14M · تحويل · …) ─────────────
const QUOTES: Record<string, TransferQuote> = {
  "lk-ns-001": {
    providerId: "lk-ns-001",
    name: "نانو شيلد",
    subtitle: "‏LK-NS-001 · قاعدة التحويل: عند بلوغ 50,000 ر.س · بلغ المستحق 127,400 ر.س",
    rows: [
      ["الحجوزات المنفّذة منذ آخر تحويل", "92 حجزاً"],
      ["الإجمالي بسعر التكلفة · شامل الضريبة", "127,400 ر.س · منها ضريبة 16,617.39"],
      ["الخصومات", "—"],
      ["صافي التحويل", "127,400 ر.س"],
      ["حساب التحويل", "البلاد •••• 6610 · موثّق"],
    ],
    note: "يُسجَّل التحويل برقم {TRF} ويصل المزوّد إشعار به.",
    amount: "127,400",
    claim: "CL-2026-0012",
  },
  "lk-dr-001": {
    providerId: "lk-dr-001",
    name: "مركز درع للحماية",
    subtitle: "‏LK-DR-001 · قاعدة التحويل: عند بلوغ 20,000 ر.س · بلغ المستحق 59,850 ر.س",
    rows: [
      ["الحجوزات المنفّذة منذ آخر تحويل", "38 حجزاً"],
      ["الإجمالي بسعر التكلفة · شامل الضريبة", "59,850 ر.س · منها ضريبة 7,806.52"],
      ["الخصومات", "—"],
      ["صافي التحويل", "59,850 ر.س"],
      ["حساب التحويل", "ساب •••• 5524 · موثّق"],
    ],
    note: "يُسجَّل التحويل برقم {TRF} ويصل المزوّد إشعار به.",
    amount: "59,850",
    claim: "CL-2026-0011",
  },
  "lk-jn-001": {
    providerId: "lk-jn-001",
    name: "جونسون",
    subtitle: "‏LK-JN-001 · قاعدة التحويل: كل 15 يوماً · بلغ المستحق 147,380 ر.س",
    rows: [
      ["الحجوزات في المطالبة", "117 حجزاً"],
      ["الإجمالي بسعر التكلفة · شامل الضريبة", "147,380 ر.س · منها ضريبة 19,223.48"],
      ["الخصومات", "—"],
      ["صافي التحويل", "147,380 ر.س"],
      ["حساب التحويل", "الراجحي •••• 4471 · موثّق"],
    ],
    amount: "147,380",
    claim: "CL-2026-0010",
  },
};

/** معاينة دفعة 1 نوفمبر (CON5-14M) */
const PAYOUT = {
  title: "دفعة تحويل 1 نوفمبر 2026",
  subtitle: "مستحقات أكتوبر 2026 · 21 مقدّم خدمة · 25 تحويلاً (لومار لكل فرع: 5)",
  rows: [
    ["الحجوزات المنفّذة", "1,862 حجزاً"],
    ["الإجمالي بسعر التكلفة · شامل الضريبة", "2,146,320 ر.س · منها ضريبة 279,954.78"],
    ["الخصومات", "−6,320 ر.س · 4 اشتراكات + استرداد CM-3341"],
    ["صافي التحويل", "2,140,000 ر.س"],
    ["مبيعات لينكار عن نفس الحجوزات", "2,672,450 ر.س · هامش 526,130 (19.7%)"],
  ] as [string, string][],
  note: "جونسون: يُحوَّل مستحقها على الحساب الحالي (الراجحي •••• 4471) لأن طلب تغيير الحساب REQ-0427 ما زال قيد التحقق.",
};

// ───────────── الحالة (المخزن التجريبي) ─────────────
let seq = 68;
let scheduled = false;
let deductionsTotal = 6320;
const COUNTS = { dues: 21, transfers: 42, claims: 5 };
const PROVIDER_NAME: Record<string, string> = { "lk-jn-001": "جونسون", "lk-lm-001": "لومار", "lk-xp-001": "XPEL", "lk-ns-001": "نانو شيلد", "lk-dr-001": "مركز درع للحماية", "lk-la-001": "مركز لمعة للتلميع", "lk-rm-001": "مركز الريم", "lk-nd-001": "مغسلة الندى" };

const kpis = () => ({
  due: { value: "2.14 مليون", hint: "عن 1,862 حجزاً منفّذاً حتى اليوم · آخر تسوية شهرية" },
  last: { value: "4.62 مليون", hint: "1 أكتوبر 2026 · 21 تحويلاً عن سبتمبر" },
  deductions: { value: `${deductionsTotal.toLocaleString("en-US")} ر.س`, hint: "4 اشتراكات شهرية «ظهورك» · استرداد بعد شكوى واحدة" },
  pending: { value: "2", hint: "طلب جونسون REQ-0427 · مغسلة الندى" },
});

function doTransfer(providerId: string) {
  const q = QUOTES[providerId];
  const row = ROWS.find((r) => r.providerId === providerId);
  if (!q || !row) throw new ApiError(404, "لا يوجد مستحق للتحويل");
  const id = `TRF-2026-10-${String(seq++).padStart(4, "0")}`;
  TRANSFERS.unshift({ id, provider: row.name, providerId, period: "أكتوبر 2026", bookings: q.rows[0][1].replace(/\D/g, ""), amount: q.amount, account: row.account.main, date: "14 أكتوبر 2026", status: "تم التحويل" });
  TRF_DETAIL[id] = { sub: row.name, account: q.rows[4][1].replace(" · موثّق", ""), ref: "قيد الإرسال للبنك", arrived: "يصل الحساب خلال يوم عمل" };
  COUNTS.transfers++;
  row.status = "تم التحويل";
  row.tone = "success";
  row.canTransfer = false;
  const c = CLAIMS.find((x) => x.id === q.claim);
  if (c) {
    c.status = "transferred";
    c.transfer = id;
  }
  return { id, name: q.name, amount: q.amount };
}

export const duesApi = {
  kpis: async () => delay(kpis(), 200),
  counts: async () => delay({ ...COUNTS }, 100),
  list: async () => delay({ items: ROWS.map((r) => ({ ...r })), total: COUNTS.dues, counts: { ...COUNTS }, scheduled }),
  transfers: async () => delay({ items: TRANSFERS.map((t) => ({ ...t })), total: COUNTS.transfers, counts: { ...COUNTS } }),
  claims: async () => delay({ items: CLAIMS.map((c) => ({ ...c })), total: CLAIMS.length, counts: { ...COUNTS } }),
  statement: async (providerId: string) => {
    const s = STATEMENTS[providerId];
    if (!s) throw new ApiError(404, "لا يوجد كشف لهذا المزوّد");
    const row = ROWS.find((r) => r.providerId === providerId);
    return delay({ ...s, canTransfer: !!row?.canTransfer, blocks: s.blocks.map((b) => (b.kind === "kv" ? { ...b, rows: [...b.rows] } : b)) }, 200);
  },
  transfer: async (id: string): Promise<DrawerDoc & { sb: string }> => {
    const t = TRANSFERS.find((x) => x.id === id);
    const d = TRF_DETAIL[id];
    if (!t || !d) throw new ApiError(404, "التحويل غير موجود");
    const sb = id.replace("TRF", "SB");
    return delay(
      {
        title: id,
        subtitle: `${d.sub} · تحويل ${t.date}`,
        hero: { pill: t.status, tone: "success" as DTone, title: `تفاصيل التحويل · ${t.amount} ر.س`, lines: [`عن ${t.period} · ${t.bookings} حجزاً منفّذاً`, d.arrived] },
        blocks: [
          { kind: "kv", title: "التحويل", rows: [["إلى حساب", d.account], ["المرجع البنكي", d.ref], ["نفّذه", "عبدالرحمن ح. · المالية"], ["اعتمده", "نوف القحطاني · مديرة النظام"]] },
          { kind: "link", label: "كشف الحجوزات المشمولة · PDF", download: true },
          { kind: "link", label: `فاتورة خدمات المزوّد لِلينكار · ${sb} · PDF`, href: `/invoices?invoice=${sb}` },
        ] as Block[],
        sb,
      },
      200,
    );
  },
  claim: async (id: string) => {
    const c = CLAIMS.find((x) => x.id === id);
    const d = CLAIM_DOC[id];
    if (!c || !d) throw new ApiError(404, "المطالبة غير موجودة");
    return delay({ ...d, claim: { ...c } }, 200);
  },
  quote: async (providerId: string) => {
    const q = QUOTES[providerId];
    if (!q) throw new ApiError(404, "لا يوجد مستحق للتحويل");
    return delay({ ...q, note: q.note?.replace("{TRF}", `TRF-2026-10-${String(seq).padStart(4, "0")}`) }, 150);
  },
  payout: async () => delay({ ...PAYOUT, scheduled }, 150),

  // ── الإجراءات ──
  schedulePayout: async () => {
    scheduled = true;
    return delay({ ok: true }, 500);
  },
  confirmTransfer: async (providerId: string) => delay(doTransfer(providerId), 600),
  addDeduction: async (providerId: string, v: { type: string; complaint?: string; amount: number; note: string }) => {
    if (!(v.amount > 0)) throw new ApiError(422, "تحقق من الحقول", { amount: "أدخل المبلغ" });
    const row = ROWS.find((r) => r.providerId === providerId);
    if (!row) throw new ApiError(404, "المزوّد غير موجود");
    const n = (s: string) => Number(s.replace(/[^\d.]/g, "")) || 0;
    const prev = row.deductions.main === "—" ? 0 : n(row.deductions.main);
    const total = prev + v.amount;
    const cm = v.complaint?.match(/CM-\d+/)?.[0];
    row.deductions = { main: `−${total.toLocaleString("en-US")}`, sub: cm ? `استرداد ${cm}` : v.type };
    row.net = (n(row.cost) - total).toLocaleString("en-US");
    deductionsTotal += v.amount;
    const s = STATEMENTS[providerId];
    const tile = s?.blocks.find((b): b is Extract<Block, { kind: "kv" }> => b.kind === "kv" && b.title === "الخصومات والتسويات");
    const line = `−${v.amount.toLocaleString("en-US")} ر.س${cm ? ` · ${cm}` : ""}`;
    if (tile) {
      const i = tile.rows.findIndex((r) => r[0].startsWith("استرداد بعد شكوى"));
      if (i >= 0 && tile.rows[i][1] === "لا يوجد هذا الشهر") tile.rows[i] = [tile.rows[i][0], line];
      else tile.rows.push([v.type, line]);
    }
    return delay({ name: PROVIDER_NAME[providerId] ?? row.name, amount: v.amount.toLocaleString("en-US") }, 500);
  },
  approveClaim: async (id: string) => {
    const c = CLAIMS.find((x) => x.id === id);
    if (!c) throw new ApiError(404, "المطالبة غير موجودة");
    c.status = "approved";
    const row = ROWS.find((r) => r.providerId === c.providerId);
    if (row && QUOTES[c.providerId]) {
      row.status = "جاهز للتحويل";
      row.tone = "ready";
    }
    return delay({ id }, 500);
  },
  returnClaim: async (id: string, v: { reason: string; note: string }) => {
    const c = CLAIMS.find((x) => x.id === id);
    if (!c) throw new ApiError(404, "المطالبة غير موجودة");
    if (!v.reason) throw new ApiError(422, "تحقق من الحقول", { reason: "اختر السبب" });
    c.status = "returned";
    return delay({ id }, 500);
  },
  rejectClaim: async (id: string, v: { reason: string; note: string }) => {
    const c = CLAIMS.find((x) => x.id === id);
    if (!c) throw new ApiError(404, "المطالبة غير موجودة");
    if (!v.reason) throw new ApiError(422, "تحقق من الحقول", { reason: "اختر السبب" });
    c.status = "rejected";
    return delay({ id }, 500);
  },
  download: async (ref: string) => delay({ url: `/files/${ref}.pdf` }, 400),
};
