// المرحلة 2 · المسوّقون (Figma «v5 · 10 · المسوّقون» 3114:10031). بيانات تجريبية بنفس شكل الخادم.
// الصفحة: المسوّقون / المبيعات / العمولات + نسب العمولة + ملف المسوّق (CON5-10P) + الأدراج والنوافذ.
import { ApiError, delay } from "./errors";
import { registerDocs } from "./shared";

export type MkTone = "success" | "danger" | "pending" | "warning" | "neutral" | "paid";

// ───────────── المسوّقون ─────────────
export interface MkStat {
  value: string;
  label: string;
}
export interface MkProfileSale {
  id: string;
  date: string;
  customer: string;
  service: string;
  center: string;
  method: "الرابط" | "الكود" | "حجز المسوّق";
  paid: number;
  commission: number;
  /** «5%» · «مبلغ ثابت» · «أُلغيت» */
  rate: string;
  status: "awaiting" | "pending" | "approved" | "cancelled" | "paid";
  /** درج البيع (CON5-10D · BK-… · تركي الحارثي) — لو مش موجود بيتبني من بيانات الصف */
  detail?: { price: string; balance: string; paidLabel?: string; commissionLabel?: string; methodText: string; stages: [string, string][] };
}
export interface MkPayoutRow {
  id: string;
  period: string;
  range: string;
  count: string;
  amount: number;
  account: string;
  status: "draft" | "paid";
  statusSub: string;
  /** درج دفعة المسوّق (CON5-10D · PY-… · SM123) */
  items?: { bk: string; service: string; paid: number; commission: number }[];
  heroSub?: string;
  transferStatus?: string;
  accountFull?: string;
}
export interface MkProfile {
  head: "actions" | "simple";
  headSub: string;
  kpis: { transferred: [string, string]; approved: [string, string]; pending: [string, string]; sales: [string, string] };
  links: string;
  phone: string;
  email: string;
  channel: string;
  joined: string;
  accounts: { name: string; masked: string; type: string; pill: "default" | "approved" }[];
  sales: MkProfileSale[];
  payouts: MkPayoutRow[];
  payoutsNote: string;
}
export interface Marketer {
  id: string;
  name: string;
  city: string;
  since: string;
  status: "active" | "stopped";
  /** السطر تحت الحالة في الجدول */
  statusNote?: string;
  octCommission: number | null;
  octSales: number;
  /** درج المسوّق CON5-10D */
  drawerSub: string;
  stats: MkStat[];
  history: string;
  note?: string;
  balance: { min: number; value: number };
  profile?: MkProfile;
}

const SALE_STAGES = (pay: string, exec: string, appr: string, out: string): [string, string][] => [
  ["الدفع", pay],
  ["تنفيذ الخدمة", exec],
  ["اعتماد العمولة", appr],
  ["الصرف", out],
];
const pending = (n: string, svc: string, center: string, customer: string, date: string, paid: number, commission: number, method: MkProfileSale["method"] = "الرابط"): MkProfileSale => ({
  id: n, date, customer, service: svc, center, method, paid, commission, rate: "5%", status: "pending",
});

const MARKETERS: Marketer[] = [
  {
    id: "SM118",
    name: "رنا الأنصاري",
    city: "الرياض",
    since: "يوليو 2026",
    status: "active",
    statusNote: "5 معتمدة · 2 بانتظار التنفيذ",
    octCommission: 644.1,
    octSales: 7,
    drawerSub: "الرياض · إنستغرام وسناب",
    stats: [
      { value: "644.10", label: "عمولة أكتوبر" },
      { value: "7", label: "مبيعات أكتوبر" },
    ],
    history: "منذ يوليو 2026 · 2,140.30 ر.س عمولات محوّلة",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "simple",
      headSub: "مسوّق مستقل · الرياض · إنستغرام وسناب · عضو منذ يوليو 2026",
      kpis: { transferred: ["2,140.30", "ر.س · 3 دفعات"], approved: ["382.52", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["186.87", "ر.س · عمولة حجزين"], sales: ["7", "حجوزات في أكتوبر"] },
      links: "5 روابط · آخرها 13 أكتوبر 2026",
      phone: "056 318 7720",
      email: "rana.ansari@gmail.com",
      channel: "إنستغرام وسناب",
      joined: "يوليو 2026",
      accounts: [{ name: "مصرف الراجحي", masked: "SA•• •••• •••• •••• 7731 · رنا الأنصاري", type: "حساب بنكي", pill: "default" }],
      sales: [
        pending("BK-21487", "طلاء نانو سيراميك · بريميوم", "XPEL السعودية · فرع العليا", "سارة ع.", "13 أكتوبر 2026", 2699, 117.35),
        pending("BK-21483", "تظليل وعازل حراري · LLumar IRX", "لومار LLumar · فرع العليا", "محمد ق.", "12 أكتوبر 2026", 1599, 69.52),
        { id: "BK-21441", date: "8 أكتوبر 2026", customer: "خالد ر.", service: "حماية PPF · الواجهة الأمامية", center: "XPEL السعودية · فرع العليا", method: "الكود", paid: 4500, commission: 195.65, rate: "5%", status: "approved" },
        { id: "BK-21405", date: "2 أكتوبر 2026", customer: "هند ط.", service: "حماية PPF · الواجهة الأمامية", center: "XPEL السعودية · فرع العليا", method: "الكود", paid: 4500, commission: 0, rate: "أُلغيت", status: "cancelled" },
        { id: "BK-21428", date: "6 أكتوبر 2026", customer: "نوف س.", service: "طلاء نانو سيراميك · بريميوم", center: "XPEL السعودية · فرع الملقا", method: "الرابط", paid: 2699, commission: 117.35, rate: "5%", status: "approved" },
        { id: "BK-21412", date: "3 أكتوبر 2026", customer: "عبدالله م.", service: "تظليل وعازل حراري · LLumar IRX", center: "لومار LLumar · فرع العليا", method: "الرابط", paid: 1599, commission: 69.52, rate: "5%", status: "approved" },
        { id: "BK-21318", date: "21 سبتمبر 2026", customer: "فيصل ن.", service: "طلاء نانو سيراميك · بريميوم", center: "XPEL السعودية · فرع العليا", method: "الرابط", paid: 2699, commission: 117.35, rate: "5%", status: "paid" },
      ],
      payouts: [
        { id: "PY-2026-11-001", period: "عمولات أكتوبر", range: "حتى اليوم", count: "3 معتمدة", amount: 382.52, account: "مصرف الراجحي · 7731", status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026" },
        { id: "PY-2026-10-001", period: "عمولات سبتمبر", range: "1–30 سبتمبر 2026", count: "8", amount: 980.4, account: "مصرف الراجحي · 7731", status: "paid", statusSub: "1 أكتوبر 2026" },
        { id: "PY-2026-09-001", period: "عمولات أغسطس", range: "1–31 أغسطس 2026", count: "6", amount: 760.55, account: "مصرف الراجحي · 7731", status: "paid", statusSub: "1 سبتمبر 2026" },
      ],
      payoutsNote: "المحوّل منذ الانضمام 2,140.30 ر.س · 3 دفعات",
    },
  },
  {
    id: "SM123",
    name: "تركي الحارثي",
    city: "جدة",
    since: "أغسطس 2026",
    status: "active",
    statusNote: "4 بالرابط · 2 بالكود",
    octCommission: 515.04,
    octSales: 6,
    drawerSub: "جدة · واتساب ومعارف",
    stats: [
      { value: "515.04", label: "عمولة أكتوبر" },
      { value: "7", label: "مبيعات أكتوبر" },
    ],
    history: "منذ أغسطس 2026 · 1,670.85 ر.س محوّلة",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "actions",
      headSub: "مسوّق مستقل · جدة · واتساب ومعارف · عضو منذ أغسطس 2026",
      kpis: { transferred: ["1,670.85", "ر.س · دفعتان"], approved: ["382.52", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["132.52", "ر.س · عمولة حجزين"], sales: ["7", "حجوزات · منها BK-21490 بانتظار الدفع"] },
      links: "4 روابط · آخرها 3 أكتوبر 2026",
      phone: "050 812 3344",
      email: "turki.alharthi@gmail.com",
      channel: "واتساب ومعارف",
      joined: "أغسطس 2026",
      accounts: [
        { name: "البنك الأهلي السعودي", masked: "SA•• •••• •••• •••• 4410 · تركي الحارثي", type: "حساب بنكي", pill: "default" },
        { name: "STC Pay", masked: "050 ••• 3344 · تركي الحارثي", type: "محفظة إلكترونية", pill: "approved" },
      ],
      sales: [
        { id: "BK-21490", date: "14 أكتوبر 2026", customer: "فهد الغامدي", service: "طلاء نانو سيراميك · بريميوم + تنظيف داخلي عميق", center: "جونسون Johnson · فرع الزهراء", method: "حجز المسوّق", paid: 2048, commission: 89.04, rate: "5%", status: "awaiting" },
        {
          ...pending("BK-21489", "طلاء نانو سيراميك · بريميوم", "XPEL السعودية · فرع الروضة", "عبدالرحمن ب.", "14 أكتوبر 2026", 2699, 117.35),
          detail: { price: "2,999.00 ر.س", balance: "300.00 ر.س", methodText: "رابط المسوّق", stages: SALE_STAGES("14 أكتوبر 2026", "القسيمة صالحة حتى 28 أكتوبر 2026", "بعد تنفيذ الخدمة", "1 نوفمبر 2026") },
        },
        {
          ...pending("BK-21455", "تلميع خارجي · 3 مراحل", "مركز لمعة للتلميع · فرع السلامة", "منى ق.", "12 أكتوبر 2026", 349, 15.17),
          detail: { price: "349.00 ر.س", balance: "لا ينطبق", methodText: "رابط المسوّق", stages: SALE_STAGES("12 أكتوبر 2026", "القسيمة صالحة حتى 26 أكتوبر 2026", "بعد تنفيذ الخدمة", "1 نوفمبر 2026") },
        },
        {
          id: "BK-21433", date: "10 أكتوبر 2026", customer: "خالد ش.", service: "حماية PPF · الواجهة الأمامية", center: "XPEL السعودية · فرع الروضة", method: "الكود", paid: 4500, commission: 195.65, rate: "5%", status: "approved",
          detail: { price: "4,800.00 ر.س", balance: "300.00 ر.س", methodText: "كود العميل SM123-300", stages: SALE_STAGES("10 أكتوبر 2026", "13 أكتوبر 2026", "13 أكتوبر 2026", "1 نوفمبر 2026") },
        },
        {
          id: "BK-21422", date: "9 أكتوبر 2026", customer: "ريم ح.", service: "تظليل وعازل حراري · عازل سيراميك", center: "XPEL السعودية · فرع الروضة", method: "الكود", paid: 2699, commission: 0, rate: "أُلغيت", status: "cancelled",
          detail: { price: "2,999.00 ر.س", balance: "300.00 ر.س", paidLabel: "دفعه العميل ثم استُرد", commissionLabel: "العمولة · أُلغيت", methodText: "كود العميل SM123-300", stages: [["الدفع", "9 أكتوبر 2026"], ["إلغاء الحجز واسترداد المبلغ", "11 أكتوبر 2026"]] },
        },
        {
          id: "BK-21417", date: "8 أكتوبر 2026", customer: "ناصر ع.", service: "طلاء نانو سيراميك · بريميوم", center: "جونسون Johnson · فرع الزهراء", method: "الرابط", paid: 1599, commission: 69.52, rate: "5%", status: "approved",
          detail: { price: "1,899.00 ر.س", balance: "300.00 ر.س", methodText: "رابط المسوّق", stages: SALE_STAGES("8 أكتوبر 2026", "8 أكتوبر 2026", "8 أكتوبر 2026", "1 نوفمبر 2026") },
        },
        {
          id: "BK-21415", date: "7 أكتوبر 2026", customer: "سعد م.", service: "طلاء نانو سيراميك · بريميوم", center: "XPEL السعودية · فرع الروضة", method: "الرابط", paid: 2699, commission: 117.35, rate: "5%", status: "approved",
          detail: { price: "2,999.00 ر.س", balance: "300.00 ر.س", methodText: "رابط المسوّق", stages: SALE_STAGES("7 أكتوبر 2026", "7 أكتوبر 2026", "7 أكتوبر 2026", "1 نوفمبر 2026") },
        },
        {
          id: "BK-21329", date: "23 سبتمبر 2026", customer: "طلال ي.", service: "حماية PPF · الواجهة الأمامية", center: "XPEL السعودية · فرع الروضة", method: "الرابط", paid: 4500, commission: 195.65, rate: "5%", status: "paid",
          detail: { price: "4,800.00 ر.س", balance: "300.00 ر.س", methodText: "رابط المسوّق", stages: SALE_STAGES("23 سبتمبر 2026", "23 سبتمبر 2026", "23 سبتمبر 2026", "1 أكتوبر 2026 · PY-2026-10-001") },
        },
      ],
      payouts: [
        {
          id: "PY-2026-11-001", period: "عمولات أكتوبر", range: "حتى اليوم", count: "3 معتمدة", amount: 382.52, account: "البنك الأهلي · 4410", status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026",
          heroSub: "3 معتمدة عمولة · البنك الأهلي السعودي · 4410", transferStatus: "تُحوَّل 1 نوفمبر 2026", accountFull: "البنك الأهلي السعودي · SA•• 4410",
          items: [
            { bk: "BK-21433", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
            { bk: "BK-21417", service: "نانو · جونسون", paid: 1599, commission: 69.52 },
            { bk: "BK-21415", service: "نانو · XPEL", paid: 2699, commission: 117.35 },
          ],
        },
        {
          id: "PY-2026-10-001", period: "عمولات سبتمبر", range: "1–30 سبتمبر 2026", count: "9", amount: 1240.5, account: "البنك الأهلي · 4410", status: "paid", statusSub: "1 أكتوبر 2026",
          heroSub: "9 عمولة · البنك الأهلي السعودي · 4410", transferStatus: "1 أكتوبر 2026", accountFull: "البنك الأهلي السعودي · SA•• 4410",
          items: [
            { bk: "BK-21329", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
            { bk: "BK-21327", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
            { bk: "BK-21325", service: "تلميع · لمعة", paid: 349, commission: 15.17 },
            { bk: "BK-21323", service: "تظليل · XPEL", paid: 2675, commission: 116.3 },
            { bk: "BK-21320", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
            { bk: "BK-21318", service: "PPF · XPEL", paid: 4460, commission: 193.91 },
            { bk: "BK-21315", service: "نانو · XPEL", paid: 2699, commission: 117.35 },
            { bk: "BK-21312", service: "تلميع · لمعة", paid: 349, commission: 15.17 },
            { bk: "BK-21310", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
          ],
        },
        {
          id: "PY-2026-09-001", period: "عمولات أغسطس", range: "1–31 أغسطس 2026", count: "3", amount: 430.35, account: "البنك الأهلي · 4410", status: "paid", statusSub: "1 سبتمبر 2026",
          heroSub: "3 عمولة · البنك الأهلي السعودي · 4410", transferStatus: "1 سبتمبر 2026", accountFull: "البنك الأهلي السعودي · SA•• 4410",
          items: [
            { bk: "BK-21284", service: "PPF · XPEL", paid: 4500, commission: 195.65 },
            { bk: "BK-21271", service: "نانو · XPEL", paid: 2699, commission: 117.35 },
            { bk: "BK-21262", service: "نانو · XPEL", paid: 2699, commission: 117.35 },
          ],
        },
      ],
      payoutsNote: "المحوّل منذ الانضمام 1,670.85 ر.س · دفعتان",
    },
  },
  {
    id: "SM140",
    name: "دانة الزهراني",
    city: "جدة",
    since: "أغسطس 2026",
    status: "active",
    octCommission: 388.4,
    octSales: 5,
    drawerSub: "جدة · تيك توك",
    stats: [
      { value: "388.40", label: "عمولة أكتوبر" },
      { value: "5", label: "مبيعات أكتوبر" },
    ],
    history: "منذ أغسطس 2026",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "simple",
      headSub: "مسوّق مستقل · جدة · إنستغرام · عضو منذ أغسطس 2026",
      kpis: { transferred: ["428.60", "ر.س · دفعتان"], approved: ["104.21", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["65.17", "ر.س · عمولة حجز واحد"], sales: ["5", "حجوزات في أكتوبر"] },
      links: "3 روابط · آخرها 11 أكتوبر 2026",
      phone: "055 640 2219",
      email: "dana.zahrani@gmail.com",
      channel: "إنستغرام",
      joined: "أغسطس 2026",
      accounts: [{ name: "البنك الأهلي السعودي", masked: "SA•• •••• •••• •••• 6612 · دانة الزهراني", type: "حساب بنكي", pill: "default" }],
      sales: [
        pending("BK-21484", "طلاء نانو سيراميك · متقدم", "نانو شيلد · فرع الروضة", "ريم ق.", "13 أكتوبر 2026", 1499, 65.17),
        { id: "BK-21436", date: "7 أكتوبر 2026", customer: "أمل ح.", service: "طلاء نانو سيراميك · بريميوم", center: "جونسون Johnson · فرع الزهراء", method: "الرابط", paid: 1599, commission: 69.52, rate: "5%", status: "approved" },
        { id: "BK-21420", date: "4 أكتوبر 2026", customer: "منيرة ك.", service: "تلميع خارجي · 3 مراحل", center: "مركز لمعة للتلميع · فرع السلامة", method: "الكود", paid: 349, commission: 15.17, rate: "5%", status: "approved" },
        { id: "BK-21407", date: "2 أكتوبر 2026", customer: "سلمى ع.", service: "تنظيف داخلي عميق", center: "جونسون Johnson · فرع الحمراء", method: "الرابط", paid: 449, commission: 19.52, rate: "5%", status: "approved" },
        { id: "BK-21322", date: "22 سبتمبر 2026", customer: "هيا م.", service: "حماية PPF للواجهة + نانو سيراميك", center: "جونسون Johnson · فرع الزهراء", method: "الرابط", paid: 2999, commission: 120, rate: "مبلغ ثابت", status: "paid" },
      ],
      payouts: [
        { id: "PY-2026-11-001", period: "عمولات أكتوبر", range: "حتى اليوم", count: "3 معتمدة", amount: 104.21, account: "البنك الأهلي · 6612", status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026" },
        { id: "PY-2026-10-001", period: "عمولات سبتمبر", range: "1–30 سبتمبر 2026", count: "4", amount: 288.6, account: "البنك الأهلي · 6612", status: "paid", statusSub: "1 أكتوبر 2026" },
        { id: "PY-2026-09-001", period: "عمولات أغسطس", range: "1–31 أغسطس 2026", count: "2", amount: 140, account: "البنك الأهلي · 6612", status: "paid", statusSub: "1 سبتمبر 2026" },
      ],
      payoutsNote: "المحوّل منذ الانضمام 428.60 ر.س · دفعتان",
    },
  },
  {
    id: "SM131",
    name: "سعد البقمي",
    city: "الدمام",
    since: "أغسطس 2026",
    status: "active",
    octCommission: 210,
    octSales: 4,
    drawerSub: "الدمام · مجموعات واتساب",
    stats: [
      { value: "210.00", label: "عمولة أكتوبر" },
      { value: "4", label: "مبيعات أكتوبر" },
    ],
    history: "منذ أغسطس 2026",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "simple",
      headSub: "مسوّق مستقل · الدمام · واتساب · عضو منذ أغسطس 2026",
      kpis: { transferred: ["305.80", "ر.س · دفعتان"], approved: ["167.35", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["69.52", "ر.س · عمولة حجز واحد"], sales: ["4", "حجوزات في أكتوبر"] },
      links: "2 رابطان · آخرها 10 أكتوبر 2026",
      phone: "054 912 7703",
      email: "saad.buqami@gmail.com",
      channel: "واتساب",
      joined: "أغسطس 2026",
      accounts: [{ name: "بنك البلاد", masked: "SA•• •••• •••• •••• 2290 · سعد البقمي", type: "حساب بنكي", pill: "default" }],
      sales: [
        pending("BK-21485", "تظليل وعازل حراري · LLumar IRX", "لومار LLumar · فرع العليا", "تركي س.", "13 أكتوبر 2026", 1599, 69.52),
        { id: "BK-21432", date: "7 أكتوبر 2026", customer: "ماجد ف.", service: "طلاء نانو سيراميك · بريميوم", center: "XPEL السعودية · فرع العليا", method: "الكود", paid: 2699, commission: 117.35, rate: "5%", status: "approved" },
        { id: "BK-21416", date: "3 أكتوبر 2026", customer: "عادل ش.", service: "تلميع خارجي + طبقة طاردة للماء", center: "جونسون Johnson · فرع الحمراء", method: "الرابط", paid: 999, commission: 50, rate: "مبلغ ثابت", status: "approved" },
        { id: "BK-21320", date: "21 سبتمبر 2026", customer: "وليد ر.", service: "تنظيف داخلي عميق", center: "جونسون Johnson · فرع الزهراء", method: "الرابط", paid: 449, commission: 19.52, rate: "5%", status: "paid" },
      ],
      payouts: [
        { id: "PY-2026-11-001", period: "عمولات أكتوبر", range: "حتى اليوم", count: "2 معتمدة", amount: 167.35, account: "بنك البلاد · 2290", status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026" },
        { id: "PY-2026-10-001", period: "عمولات سبتمبر", range: "1–30 سبتمبر 2026", count: "3", amount: 210.8, account: "بنك البلاد · 2290", status: "paid", statusSub: "1 أكتوبر 2026" },
        { id: "PY-2026-09-001", period: "عمولات أغسطس", range: "1–31 أغسطس 2026", count: "1", amount: 95, account: "بنك البلاد · 2290", status: "paid", statusSub: "1 سبتمبر 2026" },
      ],
      payoutsNote: "المحوّل منذ الانضمام 305.80 ر.س · دفعتان",
    },
  },
  {
    id: "SM152",
    name: "ياسر الشمري",
    city: "الرياض",
    since: "سبتمبر 2026",
    status: "active",
    octCommission: 74.95,
    octSales: 1,
    drawerSub: "الرياض · معارف",
    stats: [
      { value: "74.95", label: "عمولة أكتوبر" },
      { value: "1", label: "حجز" },
    ],
    history: "منذ سبتمبر 2026",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "simple",
      headSub: "مسوّق مستقل · الرياض · تيك توك · عضو منذ سبتمبر 2026",
      kpis: { transferred: ["0.00", "ر.س · لا دفعات بعد"], approved: ["69.52", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["0.00", "ر.س · لا حجوزات بانتظار التنفيذ"], sales: ["1", "حجز في أكتوبر"] },
      links: "رابط واحد · 1 أكتوبر 2026",
      phone: "059 330 4418",
      email: "yasser.shammari@gmail.com",
      channel: "تيك توك",
      joined: "سبتمبر 2026",
      accounts: [{ name: "مصرف الإنماء", masked: "SA•• •••• •••• •••• 5501 · ياسر الشمري", type: "حساب بنكي", pill: "default" }],
      sales: [{ id: "BK-21445", date: "8 أكتوبر 2026", customer: "بدر ع.", service: "تظليل وعازل حراري · LLumar IRX", center: "لومار LLumar · فرع العليا", method: "الرابط", paid: 1599, commission: 69.52, rate: "5%", status: "approved" }],
      payouts: [{ id: "PY-2026-11-001", period: "عمولات أكتوبر", range: "حتى اليوم", count: "1 معتمدة", amount: 69.52, account: "مصرف الإنماء · 5501", status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026" }],
      payoutsNote: "المحوّل منذ الانضمام 0.00 ر.س · لا دفعات بعد",
    },
  },
  {
    id: "SM104",
    name: "منصور الصاعدي",
    city: "جدة",
    since: "يونيو 2026",
    status: "stopped",
    statusNote: "إحالة ذاتية · 3 محاولات مرفوضة",
    octCommission: null,
    octSales: 0,
    drawerSub: "جدة",
    stats: [
      { value: "—", label: "عمولة" },
      { value: "0", label: "مبيعات أكتوبر" },
      { value: "3", label: "محاولات مرفوضة" },
    ],
    history: "أُوقف 27 سبتمبر 2026 · إحالة ذاتية بنفس رقم الجوال",
    note: "رُفضت 3 إحالات لأن رقم جوال العميل مطابق لرقم المسوّق.",
    balance: { min: 1000, value: 300 },
    profile: {
      head: "simple",
      headSub: "مسوّق مستقل · جدة · واتساب · عضو منذ يونيو 2026",
      kpis: { transferred: ["15.17", "ر.س · دفعة واحدة"], approved: ["0.00", "ر.س · تُحوَّل 1 نوفمبر 2026"], pending: ["0.00", "ر.س · لا حجوزات بانتظار التنفيذ"], sales: ["0", "موقوف · إحالة ذاتية"] },
      links: "الروابط متوقفة",
      phone: "050 221 9087",
      email: "mansour.saedi@gmail.com",
      channel: "واتساب",
      joined: "يونيو 2026",
      accounts: [{ name: "مصرف الراجحي", masked: "SA•• •••• •••• •••• 1043 · منصور الصاعدي", type: "حساب بنكي", pill: "default" }],
      sales: [
        { id: "BK-21368", date: "27 سبتمبر 2026", customer: "منصور ص.", service: "طلاء نانو سيراميك · بريميوم", center: "جونسون Johnson · فرع الزهراء", method: "الكود", paid: 1599, commission: 0, rate: "أُلغيت", status: "cancelled" },
        { id: "BK-21210", date: "12 أغسطس 2026", customer: "حسن ب.", service: "تلميع خارجي · 3 مراحل", center: "مركز لمعة للتلميع · فرع السلامة", method: "الرابط", paid: 349, commission: 15.17, rate: "5%", status: "paid" },
      ],
      payouts: [{ id: "PY-2026-09-001", period: "عمولات أغسطس", range: "1–31 أغسطس 2026", count: "1", amount: 15.17, account: "مصرف الراجحي · 1043", status: "paid", statusSub: "1 سبتمبر 2026" }],
      payoutsNote: "المحوّل منذ الانضمام 15.17 ر.س · دفعة واحدة",
    },
  },
];

// باقي المسوّقين (الإجمالي 39 في Figma «عرض 1 – 6 من 39») — صفحات 2…7 من القائمة
const FIRST = ["عبدالله", "نورة", "فيصل", "ريم", "خالد", "سارة", "ماجد", "لمى", "بندر", "هيفاء", "سلطان", "أريج", "نايف", "جود", "مشاري", "شهد", "عادل", "رهف", "وليد", "منيرة", "تركي", "العنود", "حمد", "لينا", "زياد", "دلال", "طلال", "غدير", "راشد", "بشاير", "مازن", "أسيل", "يوسف"];
const LAST = ["العتيبي", "القحطاني", "الدوسري", "المطيري", "الشهري", "الغامدي", "الزهراني", "الحربي", "العنزي", "السبيعي", "الرشيدي"];
const MONTHS = ["يونيو", "يوليو", "أغسطس", "سبتمبر"];
const CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "الخبر"];
const CHANNELS = ["إنستغرام", "سناب شات", "تيك توك", "إكس", "يوتيوب"];
const usedIds = new Set(MARKETERS.map((m) => m.id));
let nextFill = 101;
for (let i = 0; i < 33; i++) {
  while (usedIds.has(`SM${nextFill}`)) nextFill++;
  const id = `SM${nextFill++}`;
  usedIds.add(id);
  const sales = (i * 7) % 4;
  const commission = sales ? Math.round((sales * 61.37 + i * 3.1) * 100) / 100 : 0;
  const since = `${MONTHS[i % 4]} 2026`;
  MARKETERS.push({
    id,
    name: `${FIRST[i]} ${LAST[i % LAST.length]}`,
    city: CITIES[i % CITIES.length],
    since,
    status: "active",
    octCommission: commission,
    octSales: sales,
    drawerSub: `${CITIES[i % CITIES.length]} · ${CHANNELS[i % CHANNELS.length]}`,
    stats: [
      { value: commission.toFixed(2), label: "عمولة أكتوبر" },
      { value: String(sales), label: "مبيعات أكتوبر" },
    ],
    history: `منذ ${since}`,
    balance: { min: 1000, value: 300 },
  });
}

// ───────────── طلبات الانضمام (AR) وطلبات المسوّقين (MQ) ─────────────
export interface JoinDoc {
  title: string;
  sub: string;
  docId: string;
}
export interface JoinRequest {
  id: string;
  name: string;
  female: boolean;
  role: string;
  date: string;
  submitted: string;
  heroSub: string;
  phone: string;
  channel: string;
  iban: string;
  docs: JoinDoc[];
  docsOf: string;
  /** «عند الاعتماد» (يظهر لـAR-0058 بس في Figma) */
  onApprove?: boolean;
  newId: string;
  complete: { items: { label: string; checked: boolean }[]; note: string; placeholder?: boolean };
  status: "open" | "approved" | "rejected" | "more";
}
const JOIN: JoinRequest[] = [
  {
    id: "AR-0058",
    name: "هالة الدوسري",
    female: true,
    role: "مسوّقة محتوى",
    date: "13 أكتوبر 2026",
    submitted: "13 أكتوبر 2026 · 9:40 م",
    heroSub: "الدمام · إنستغرام · instagram.com/hala.cars",
    phone: "053 220 9184 · موثّق برمز التحقق",
    channel: "إنستغرام · محتوى سيارات",
    iban: "SA03 8000 •••• 4471 · الراجحي",
    docs: [
      { title: "رقم الهوية الوطنية", sub: "1•••••••42", docId: "AR-0058-ID" },
      { title: "شهادة الآيبان", sub: "IBAN-Alrajhi.pdf", docId: "AR-0058-IBAN" },
    ],
    docsOf: "المتطلبات · 2 من 2 مرفقة",
    onApprove: true,
    newId: "SM158",
    complete: { items: [{ label: "رقم الهوية الوطنية أو الإقامة · مرفق", checked: false }, { label: "شهادة الآيبان · مرفقة", checked: false }], note: "اكتب ما تحتاجه من المسوّقة.", placeholder: true },
    status: "open",
  },
  {
    id: "AR-0057",
    name: "عمر بن سعيد",
    female: false,
    role: "مسوّق",
    date: "12 أكتوبر 2026",
    submitted: "12 أكتوبر 2026",
    heroSub: "جدة · واتساب · معارفي وعملائي",
    phone: "055 902 6611 · موثّق برمز التحقق",
    channel: "واتساب · معارف شخصية",
    iban: "لم يُضف",
    docs: [{ title: "رقم الهوية الوطنية", sub: "1•••••••07", docId: "AR-0057-ID" }],
    docsOf: "المتطلبات · 1 من 2 مرفقة",
    newId: "SM159",
    complete: {
      items: [
        { label: "رقم الهوية الوطنية أو الإقامة · لا يطابق الاسم", checked: true },
        { label: "شهادة الآيبان · اختيارية حتى أول تحويل", checked: false },
      ],
      note: "رقم الهوية لا يطابق الاسم المسجّل. صحّح الرقم خلال 7 أيام.",
    },
    status: "open",
  },
];
registerDocs([
  { id: "AR-0058-ID", kind: "الهوية الوطنية", file: "AR-0058-ID.pdf", page: 1, pages: 1, authority: "وزارة الداخلية · المملكة العربية السعودية", title: "بطاقة الهوية الوطنية", fields: [["الاسم", "هالة الدوسري"], ["رقم الهوية", "1•••••••42"], ["المدينة", "الدمام"]] },
  { id: "AR-0058-IBAN", kind: "شهادة الآيبان", file: "IBAN-Alrajhi.pdf", page: 1, pages: 1, authority: "مصرف الراجحي", title: "شهادة الآيبان", fields: [["صاحب الحساب", "هالة الدوسري"], ["الآيبان", "SA03 8000 •••• 4471"], ["البنك", "مصرف الراجحي"]] },
  { id: "AR-0057-ID", kind: "الهوية الوطنية", file: "AR-0057-ID.pdf", page: 1, pages: 1, authority: "وزارة الداخلية · المملكة العربية السعودية", title: "بطاقة الهوية الوطنية", fields: [["الاسم", "عمر بن سعيد"], ["رقم الهوية", "1•••••••07"], ["المدينة", "جدة"]] },
  { id: "MQ-2026-0022-IBAN", kind: "شهادة الآيبان", file: "IBAN-SNB.pdf", page: 1, pages: 1, authority: "البنك الأهلي السعودي", title: "شهادة الآيبان", fields: [["صاحب الحساب", "تركي الحارثي"], ["الآيبان", "SA44 1000 0000 7781 2290 5126"], ["البنك", "البنك الأهلي السعودي"]] },
]);

export interface MarketerRequest {
  id: string;
  marketerId: string;
  kind: "email" | "bank";
  type: string;
  title: string;
  field: string;
  rows: [string, string][];
  /** تفاصيل جدول «طلبات التعديل» في الملف */
  detail: string;
  current: string;
  heroTitle: string;
  heroSub: string;
  doc?: { title: string; docId: string };
  status: "open" | "approved" | "rejected";
}
const MQ: MarketerRequest[] = [
  {
    id: "MQ-2026-0021",
    marketerId: "SM123",
    kind: "email",
    type: "تعديل البيانات",
    title: "تعديل البريد الإلكتروني",
    field: "البريد الإلكتروني",
    rows: [
      ["البيان", "البريد الإلكتروني"],
      ["الحالي", "turki.alharthi@gmail.com"],
      ["الجديد", "turki.h@outlook.com"],
      ["الملاحظة", "—"],
    ],
    detail: "البريد: turki.h@outlook.com",
    current: "الحالي: turki.alharthi@gmail.com",
    heroTitle: "تعديل البريد الإلكتروني",
    heroSub: "تركي الحارثي · SM123",
    status: "open",
  },
  {
    id: "MQ-2026-0022",
    marketerId: "SM123",
    kind: "bank",
    type: "تعديل الحساب البنكي",
    title: "تعديل الحساب البنكي",
    field: "الحساب البنكي",
    rows: [
      ["الحساب الحالي", "البنك الأهلي السعودي · SA•• 4410"],
      ["الآيبان الجديد", "SA44 1000 0000 7781 2290 5126"],
      ["اسم صاحب الحساب", "تركي الحارثي"],
    ],
    detail: "الآيبان الجديد: SA44 1000 0000 7781 2290 5126",
    current: "الحالي: البنك الأهلي السعودي · 4410",
    heroTitle: "SA44 1000 0000 7781 2290 5126",
    heroSub: "الآيبان الجديد · البنك الأهلي السعودي",
    doc: { title: "شهادة الآيبان", docId: "MQ-2026-0022-IBAN" },
    status: "open",
  },
];

// ───────────── المبيعات (حجوزات بالإحالة) ─────────────
export type SaleCommission = "awaiting" | "pending" | "review" | "approved" | "rejected";
export interface MarketerSale {
  id: string;
  customer: string;
  marketerId: string;
  method: string;
  center: string;
  service: string;
  value: number;
  valueSub?: string;
  bookingStatus: "awaiting" | "done" | "visit";
  commission: SaleCommission;
  amount: number;
  /** سطر تحت العمولة (السبب) */
  commissionSub?: string;
  /** يفتح صفحة الحجوزات بدل درج البيع (BK-21490 — لا يوجد إطار 10D له) */
  bookingLink?: boolean;
  /** درج CON5-10D */
  drawer?: {
    subtitle: string;
    heroTitle: string;
    heroSub: string;
    reason?: string;
    rate?: string;
    methodText?: string;
    valueText?: string;
  };
}
const SALES: MarketerSale[] = [
  { id: "BK-21490", customer: "فهد غ.", marketerId: "SM123", method: "حجز المسوّق", center: "جونسون Johnson", service: "نانو سيراميك + تنظيف داخلي", value: 2348, valueSub: "دفع 2,048 · رصيد 300", bookingStatus: "awaiting", commission: "awaiting", amount: 89.04, bookingLink: true },
  {
    id: "BK-21458", customer: "وليد ش.", marketerId: "SM118", method: "بالرابط", center: "لومار LLumar", service: "تظليل كامل", value: 1599, bookingStatus: "done", commission: "review", amount: 69.52, commissionSub: "نفس جهاز حجز سابق",
    drawer: { subtitle: "SM118 · رنا الأنصاري", heroTitle: "1,599 ر.س · لومار LLumar", heroSub: "وليد ش. · تظليل كامل · مكتمل", reason: "الحجز تم من نفس الجهاز الذي حُجز منه BK-21402 عبر رابط المسوّق نفسه قبل أسبوع.", rate: "5%" },
  },
  {
    id: "BK-21417", customer: "ناصر ع.", marketerId: "SM123", method: "بالرابط", center: "جونسون Johnson", service: "طلاء نانو سيراميك · بريميوم", value: 1899, valueSub: "دفع 1,599 · رصيد 300", bookingStatus: "done", commission: "approved", amount: 69.52,
    drawer: { subtitle: "بيع مسوّق", heroTitle: "1,899 ر.س", heroSub: "ناصر ع. · جونسون · Johnson Ceramic Pro", methodText: "رابط المسوّق", valueText: "1,899 ر.س · دفع العميل 1,599 + رصيد مسوّق 300" },
  },
  {
    id: "BK-21464", customer: "ليلى م.", marketerId: "SM118", method: "بالرابط", center: "لومار LLumar", service: "تظليل كامل", value: 1599, bookingStatus: "visit", commission: "pending", amount: 69.52,
    drawer: { subtitle: "حجز بالإحالة", heroTitle: "1,599 ر.س", heroSub: "ليلى م. · لومار · تظليل كامل", methodText: "رابط SM118" },
  },
  {
    id: "BK-21451", customer: "عمر ن.", marketerId: "SM140", method: "بالرابط", center: "كار سبا", service: "باقة الغسيل الشهرية", value: 349, bookingStatus: "done", commission: "approved", amount: 15.17,
    drawer: { subtitle: "حجز بالإحالة", heroTitle: "349 ر.س", heroSub: "عمر ن. · كار سبا · باقة الغسيل الشهرية", methodText: "رابط SM140" },
  },
  {
    id: "BK-21424", customer: "منصور ص.", marketerId: "SM104", method: "بالكود SM104-300", center: "مركز الصفوة للعناية", service: "تلميع", value: 449, bookingStatus: "done", commission: "rejected", amount: 0, commissionSub: "إحالة ذاتية",
    drawer: { subtitle: "حجز بالإحالة", heroTitle: "449 ر.س", heroSub: "منصور ص. · الصفوة · تلميع", methodText: "كود SM104-300" },
  },
];
// باقي مبيعات الشهر (48 حجزاً في Figma) — صفحات 2…8
{
  const people = ["سامي ع.", "هند ر.", "ماجد ق.", "نوال س.", "بدر ح.", "أمل ت.", "رائد م.", "دانة ف."];
  const svc: [string, string, number][] = [
    ["جونسون Johnson", "طلاء نانو سيراميك · بريميوم", 1599],
    ["لومار LLumar", "تظليل كامل", 1599],
    ["XPEL السعودية", "حماية PPF · الواجهة الأمامية", 4500],
    ["مركز لمعة للتلميع", "تلميع خارجي · 3 مراحل", 349],
    ["نانو شيلد", "نانو سيراميك ثلاث طبقات", 1499],
  ];
  const mk = ["SM118", "SM123", "SM140", "SM131", "SM152"];
  for (let i = 0; i < 42; i++) {
    const [center, service, value] = svc[i % svc.length];
    const done = i % 3 !== 0;
    SALES.push({
      id: `BK-${21400 - i * 3}`,
      customer: people[i % people.length],
      marketerId: mk[i % mk.length],
      method: i % 4 === 0 ? "بالكود" : "بالرابط",
      center,
      service,
      value,
      bookingStatus: done ? "done" : "visit",
      commission: done ? "approved" : "pending",
      amount: Math.round(value * 0.0435 * 100) / 100,
      drawer: { subtitle: "حجز بالإحالة", heroTitle: `${value.toLocaleString("en-US")} ر.س`, heroSub: `${people[i % people.length]} · ${center} · ${service}`, methodText: `${i % 4 === 0 ? "كود" : "رابط"} ${mk[i % mk.length]}` },
    });
  }
}

// ───────────── دفعات العمولات ─────────────
export interface Payout {
  id: string;
  period: string;
  periodSub?: string;
  marketers: number;
  total: number;
  status: "draft" | "paid";
  statusSub: string;
  transferredBy?: string;
  transferDate: string;
  heroSub: string;
  top: [string, string][];
}
const PAYOUTS: Payout[] = [
  {
    id: "PY-2026-11-001", period: "عمولات أكتوبر", periodSub: "حتى 14 أكتوبر 2026", marketers: 27, total: 12962.94, status: "draft", statusSub: "تُحوَّل 1 نوفمبر 2026", transferDate: "1 نوفمبر 2026",
    heroSub: "عمولات أكتوبر حتى الآن · 27 مسوّقاً",
    top: [
      ["رنا الأنصاري · SM118", "644.10 · منها 505.06 معتمدة"],
      ["تركي الحارثي · SM123", "515.04 · منها 382.52 معتمدة"],
      ["دانة الزهراني · SM140", "388.40 · كلها معتمدة"],
    ],
  },
  {
    id: "PY-2026-10-001", period: "عمولات سبتمبر", marketers: 31, total: 18420.75, status: "paid", statusSub: "1 أكتوبر 2026 · عبدالرحمن ح.", transferDate: "1 أكتوبر 2026",
    heroSub: "عمولات سبتمبر · 31 مسوّقاً",
    top: [
      ["تركي الحارثي · SM123", "1,240.50"],
      ["رنا الأنصاري · SM118", "1,120.40"],
      ["دانة الزهراني · SM140", "465.75"],
    ],
  },
  {
    id: "PY-2026-09-001", period: "عمولات أغسطس", marketers: 22, total: 9860.4, status: "paid", statusSub: "1 سبتمبر 2026", transferDate: "1 سبتمبر 2026",
    heroSub: "عمولات أغسطس · 22 مسوّقاً",
    top: [
      ["رنا الأنصاري · SM118", "980.60"],
      ["تركي الحارثي · SM123", "430.35"],
      ["دانة الزهراني · SM140", "312.40"],
    ],
  },
];

// ───────────── نسب العمولة ─────────────
export interface CommissionRate {
  id: string;
  provider: string;
  providerId: string;
  service: string;
  branches: string;
  type: string;
  value: string;
}
const RATES: CommissionRate[] = [
  { id: "r1", provider: "جونسون Johnson", providerId: "lk-jn-001", service: "Johnson Ceramic Pro", branches: "الفروع الثلاثة", type: "نسبة من سعر البيع", value: "5%" },
  { id: "r2", provider: "جونسون Johnson", providerId: "lk-jn-001", service: "طبقة طاردة للماء + تلميع", branches: "الفروع الثلاثة", type: "مبلغ ثابت", value: "50 ر.س" },
  { id: "r3", provider: "جونسون Johnson", providerId: "lk-jn-001", service: "PPF للواجهة + نانو سيراميك", branches: "الفروع الثلاثة", type: "مبلغ ثابت", value: "120 ر.س" },
  { id: "r4", provider: "جونسون Johnson", providerId: "lk-jn-001", service: "غسيل وتلميع سريع", branches: "الزهراء والمحمدية", type: "نسبة من سعر البيع", value: "5%" },
  { id: "r5", provider: "لومار LLumar", providerId: "lk-lm-001", service: "تظليل كامل", branches: "الروضة والعليا", type: "نسبة من سعر البيع", value: "5%" },
  { id: "r6", provider: "نانو شيلد", providerId: "lk-ns-001", service: "نانو سيراميك ثلاث طبقات", branches: "الروضة والسلامة", type: "نسبة من سعر البيع", value: "5%" },
];

// ───────────── القوائم المنسدلة (CON5-DD) ─────────────
export const STOP_REASONS = ["مخالفة الشروط", "إساءة استخدام الكود", "طلب المسوّق"].map((v) => ({ value: v, label: v }));
export const REJECT_COMMISSION_REASONS = ["إحالة مكررة من نفس الجهاز", "خيار آخر من القائمة المرجعية…"].map((v) => ({ value: v, label: v }));
export const JOIN_REJECT_REASONS = ["مستندات غير مكتملة", "بيانات غير صحيحة", "خيار آخر من القائمة المرجعية…"].map((v) => ({ value: v, label: v }));
export const CHANNEL_OPTIONS = CHANNELS.map((v) => ({ value: v, label: v }));
export const CITY_OPTIONS = ["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"].map((v) => ({ value: v, label: v }));
export const CITY_FILTER = [{ value: "all", label: "الكل" }, ...CITY_OPTIONS];
export const STATUS_FILTER = [
  { value: "all", label: "الكل" },
  { value: "active", label: "نشط" },
  { value: "stopped", label: "موقوف" },
];
export const COMMISSION_FILTER = [
  { value: "all", label: "الكل" },
  { value: "review", label: "تحتاج مراجعة" },
  { value: "awaiting", label: "بانتظار الدفع" },
  { value: "pending", label: "بانتظار التنفيذ" },
  { value: "approved", label: "معتمدة" },
  { value: "rejected", label: "مرفوضة" },
];
export const PAYOUT_FILTER = [
  { value: "all", label: "الكل" },
  { value: "draft", label: "مسودة" },
  { value: "paid", label: "مُحوّلة" },
];
export const METHOD_FILTER = ["الكل", "الرابط", "الكود", "حجز المسوّق"].map((v) => ({ value: v, label: v }));
export const PERIOD_FILTER = ["أكتوبر 2026", "سبتمبر 2026", "آخر 3 أشهر", "من بداية السنة", "فترة مخصصة"].map((v) => ({ value: v, label: v }));
export const PROFILE_STATUS_FILTER = [
  { value: "all", label: "الكل" },
  { value: "awaiting", label: "بانتظار الدفع" },
  { value: "pending", label: "بانتظار التنفيذ" },
  { value: "approved", label: "معتمدة" },
  { value: "paid", label: "مدفوعة" },
  { value: "cancelled", label: "ملغاة" },
];

// ───────────── الـAPI ─────────────
export const MK_PAGE = 6;
export type MarketerRow = Marketer & { code: string };
const row = (m: Marketer): MarketerRow => ({ ...m, code: `${m.id}-300` });
const find = (id: string) => {
  const m = MARKETERS.find((x) => x.id === id);
  if (!m) throw new ApiError(404, "المسوّق غير موجود");
  return m;
};
const has = (s: string, q: string) => s.toLowerCase().includes(q.trim().toLowerCase());
const dual = (n: number, one: string, two: string, many: string, none: string) => (n === 0 ? none : n === 1 ? one : n === 2 ? two : `${n} ${many}`);

function summary() {
  const review = SALES.filter((s) => s.commission === "review");
  const stopped = MARKETERS.filter((m) => m.status === "stopped").length;
  const joins = JOIN.filter((j) => j.status === "open").length;
  const draft = PAYOUTS.find((p) => p.status === "draft");
  return {
    kpis: {
      review: { value: review.length, hint: review.length ? `${review[0].id} · ${review[0].commissionSub}` : "لا توجد عمولات تحتاج مراجعة" },
      commissions: { value: draft?.total ?? 0, hint: draft ? "ر.س حتى الآن · مسودة" : "ر.س · لا مسودة" },
      sales: { value: SALES.length, hint: "هذا الشهر · 3.8% من الحجوزات" },
      active: { value: MARKETERS.length - stopped, hint: `${stopped} موقوف · ${dual(joins, "طلب انضمام", "طلبا انضمام", "طلبات انضمام", "لا طلبات انضمام")}` },
    },
    counts: { marketers: MARKETERS.length, sales: SALES.length, commissions: PAYOUTS.length },
  };
}

export const marketersApi = {
  summary: async () => delay(summary(), 200),

  /** «بانتظار قرار لينكار» — طلبات الانضمام المفتوحة + طلبات المسوّقين */
  pending: async () =>
    delay(
      [
        ...JOIN.filter((j) => j.status === "open").map((j) => ({ kind: "join" as const, id: j.id, title: `${j.name} · ${j.id}`, sub: `طلب انضمام · ${j.date} · ${j.role}`, pill: "بانتظار المراجعة" })),
        ...MQ.filter((q) => q.status === "open").map((q) => ({ kind: "mq" as const, id: q.id, title: `${q.id} · ${find(q.marketerId).name}`, sub: `${q.title} · اليوم`, pill: "بانتظار القرار" })),
      ],
      200,
    ),

  list: async (p: { page?: number; q?: string; status?: string; city?: string }) => {
    let items = MARKETERS;
    if (p.status && p.status !== "all") items = items.filter((m) => m.status === p.status);
    if (p.city && p.city !== "all") items = items.filter((m) => m.city === p.city);
    if (p.q?.trim()) items = items.filter((m) => has(m.name, p.q!) || has(m.id, p.q!));
    const page = Math.max(1, p.page ?? 1);
    return delay({ items: items.slice((page - 1) * MK_PAGE, page * MK_PAGE).map(row), total: items.length, page, pageSize: MK_PAGE });
  },
  get: async (id: string) => delay(row(find(id)), 150),

  sales: async (p: { page?: number; q?: string; commission?: string; marketer?: string }) => {
    let items = SALES;
    if (p.commission && p.commission !== "all") items = items.filter((s) => s.commission === p.commission);
    if (p.marketer && p.marketer !== "all") items = items.filter((s) => s.marketerId === p.marketer);
    if (p.q?.trim()) items = items.filter((s) => has(s.id, p.q!) || has(s.marketerId, p.q!) || has(find(s.marketerId).name, p.q!));
    const page = Math.max(1, p.page ?? 1);
    return delay({ items: items.slice((page - 1) * MK_PAGE, page * MK_PAGE), total: items.length, page, pageSize: MK_PAGE });
  },
  sale: async (id: string) => {
    const s = SALES.find((x) => x.id === id);
    if (!s) throw new ApiError(404, "الحجز غير موجود");
    return delay({ ...s, marketer: row(find(s.marketerId)) }, 150);
  },

  payouts: async (p: { q?: string; status?: string }) => {
    let items = PAYOUTS;
    if (p.status && p.status !== "all") items = items.filter((x) => x.status === p.status);
    if (p.q?.trim()) items = items.filter((x) => has(x.id, p.q!));
    return delay({ items, total: items.length });
  },
  payout: async (id: string) => {
    const x = PAYOUTS.find((y) => y.id === id);
    if (!x) throw new ApiError(404, "الدفعة غير موجودة");
    return delay(x, 150);
  },

  rates: async () => delay({ items: RATES, total: RATES.length, providers: new Set(RATES.map((r) => r.providerId)).size }),

  join: async (id: string) => {
    const j = JOIN.find((x) => x.id === id);
    if (!j) throw new ApiError(404, "الطلب غير موجود");
    return delay(j, 150);
  },
  request: async (id: string) => {
    const q = MQ.find((x) => x.id === id);
    if (!q) throw new ApiError(404, "الطلب غير موجود");
    return delay({ ...q, marketer: row(find(q.marketerId)) }, 150);
  },
  requestsOf: async (marketerId: string) => delay(MQ.filter((q) => q.marketerId === marketerId && q.status === "open"), 200),
  profile: async (id: string) => {
    const m = find(id);
    if (!m.profile) throw new ApiError(404, "لا يوجد ملف لهذا المسوّق");
    return delay({ ...row(m), openRequests: MQ.filter((q) => q.marketerId === id && q.status === "open").length }, 200);
  },

  // ── الإجراءات ──
  stop: async (id: string, reason: string) => {
    if (!reason) throw new ApiError(422, "تحقق من الحقول", { reason: "اختر السبب" });
    const m = find(id);
    m.status = "stopped";
    m.statusNote = reason;
    return delay({ ok: true }, 450);
  },
  reactivate: async (id: string) => {
    const m = find(id);
    m.status = "active";
    m.statusNote = undefined;
    m.note = undefined;
    return delay({ ok: true }, 450);
  },
  approveCommission: async (id: string) => {
    const s = SALES.find((x) => x.id === id);
    if (!s) throw new ApiError(404, "الحجز غير موجود");
    s.commission = "approved";
    s.commissionSub = undefined;
    return delay({ ok: true }, 450);
  },
  rejectCommission: async (id: string, reason: string) => {
    if (!reason) throw new ApiError(422, "تحقق من الحقول", { reason: "اختر السبب" });
    const s = SALES.find((x) => x.id === id);
    if (!s) throw new ApiError(404, "الحجز غير موجود");
    s.commission = "rejected";
    s.commissionSub = reason;
    return delay({ ok: true }, 450);
  },
  add: async (v: { name: string; phone: string; channel: string; city: string; iban: string }) => {
    const errors: Record<string, string> = {};
    if (!v.name.trim()) errors.name = "اكتب الاسم";
    if (!/^05\d{8}$/.test(v.phone.replace(/\s/g, ""))) errors.phone = "رقم جوال غير صحيح";
    if (!v.channel) errors.channel = "اختر قناة الترويج";
    if (!v.city) errors.city = "اختر المدينة";
    if (!v.iban.trim()) errors.iban = "اكتب الآيبان";
    if (Object.keys(errors).length) throw new ApiError(422, "تحقق من الحقول", errors);
    const id = `SM${160 + MARKETERS.filter((m) => /^SM16\d$/.test(m.id)).length}`;
    MARKETERS.unshift({
      id, name: v.name.trim(), city: v.city, since: "أكتوبر 2026", status: "active", octCommission: 0, octSales: 0,
      drawerSub: `${v.city} · ${v.channel}`, stats: [{ value: "0.00", label: "عمولة أكتوبر" }, { value: "0", label: "مبيعات أكتوبر" }], history: "منذ أكتوبر 2026", balance: { min: 1000, value: 300 },
    });
    return delay({ id, name: v.name.trim() }, 500);
  },
  nextId: () => `SM${160 + MARKETERS.filter((m) => /^SM16\d$/.test(m.id)).length}`,
  approveJoin: async (id: string) => {
    const j = JOIN.find((x) => x.id === id);
    if (!j) throw new ApiError(404, "الطلب غير موجود");
    j.status = "approved";
    const city = j.heroSub.split(" · ")[0];
    MARKETERS.unshift({
      id: j.newId, name: j.name, city, since: "أكتوبر 2026", status: "active", octCommission: 0, octSales: 0,
      drawerSub: j.heroSub.split(" · ").slice(0, 2).join(" · "), stats: [{ value: "0.00", label: "عمولة أكتوبر" }, { value: "0", label: "مبيعات أكتوبر" }], history: "منذ أكتوبر 2026", balance: { min: 1000, value: 300 },
    });
    return delay({ id: j.newId, name: j.name, female: j.female }, 450);
  },
  rejectJoin: async (id: string, reason: string, message: string) => {
    if (!reason) throw new ApiError(422, "تحقق من الحقول", { reason: "اختر السبب" });
    if (!message.trim()) throw new ApiError(422, "تحقق من الحقول", { message: "اكتب الرسالة" });
    const j = JOIN.find((x) => x.id === id);
    if (j) j.status = "rejected";
    return delay({ ok: true }, 450);
  },
  completeJoin: async (id: string, items: string[], note: string) => {
    if (!items.length) throw new ApiError(422, "تحقق من الحقول", { items: "اختر المطلوب استكماله" });
    if (!note.trim()) throw new ApiError(422, "تحقق من الحقول", { note: "اكتب الملاحظة" });
    const j = JOIN.find((x) => x.id === id);
    if (j) j.status = "more";
    return delay({ ok: true }, 450);
  },
  approveRequest: async (id: string) => {
    const q = MQ.find((x) => x.id === id);
    if (!q) throw new ApiError(404, "الطلب غير موجود");
    q.status = "approved";
    const m = find(q.marketerId);
    if (m.profile && q.kind === "email") m.profile.email = q.rows[2][1];
    if (m.profile && q.kind === "bank") m.profile.accounts[0] = { ...m.profile.accounts[0], masked: `SA•• •••• •••• •••• 5126 · ${m.name}` };
    return delay({ kind: q.kind }, 450);
  },
  rejectRequest: async (id: string, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "تحقق من الحقول", { reason: "اكتب السبب" });
    const q = MQ.find((x) => x.id === id);
    if (q) q.status = "rejected";
    return delay({ ok: true }, 450);
  },
  saveData: async (id: string, v: { name: string; phone: string; email: string; channel: string; city: string }) => {
    const errors: Record<string, string> = {};
    if (!v.name.trim()) errors.name = "اكتب الاسم";
    if (!/^05\d{8}$/.test(v.phone.replace(/\s/g, ""))) errors.phone = "رقم جوال غير صحيح";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "بريد غير صحيح";
    if (!v.channel.trim()) errors.channel = "اكتب قناة الترويج";
    if (!v.city.trim()) errors.city = "اكتب المدينة";
    if (Object.keys(errors).length) throw new ApiError(422, "تحقق من الحقول", errors);
    const m = find(id);
    m.name = v.name.trim();
    m.city = v.city.trim();
    if (m.profile) Object.assign(m.profile, { phone: v.phone, email: v.email.trim(), channel: v.channel.trim() });
    return delay({ ok: true }, 450);
  },
  saveBalance: async (id: string, v: { min: number; value: number }) => {
    if (!(v.value > 0)) throw new ApiError(422, "تحقق من الحقول", { value: "أدخل قيمة أكبر من صفر" });
    if (!(v.min >= v.value)) throw new ApiError(422, "تحقق من الحقول", { min: "الحد الأدنى لازم يكون أكبر من قيمة الرصيد أو يساويها" });
    find(id).balance = v;
    return delay({ ok: true }, 450);
  },
  registerTransfer: async (id: string, v: { ref: string; date: string; note: string }) => {
    if (!v.ref.trim()) throw new ApiError(422, "تحقق من الحقول", { ref: "اكتب رقم المرجع" });
    const x = PAYOUTS.find((y) => y.id === id);
    if (!x) throw new ApiError(404, "الدفعة غير موجودة");
    x.status = "paid";
    x.statusSub = `${v.date} · نوف القحطاني`;
    return delay({ ok: true }, 450);
  },
  /** كشف دفعة مسوّق PDF (الخادم يرجّع رابط مؤقت) */
  statement: async (payoutId: string, marketerId?: string) => delay({ url: `/files/${payoutId}${marketerId ? `-${marketerId}` : ""}.pdf` }, 300),
  transferFile: async (payoutId: string) => delay({ url: `/files/${payoutId}-transfer.csv` }, 300),
};
