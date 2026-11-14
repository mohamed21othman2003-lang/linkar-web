// الوكالات (المرحلة 2 · Figma «v5 · 09 · الوكالات» 3114:2149): المعارض والوكالات اللي بتشتري باقات لينكار بأسعار الوكالات
// (ائتمان شهري بكشف شهري، أو رصيد مسبق بيتشحن). الصفحة CON5-09 بتبويباتها الثلاثة + الأدراج CON5-09D (وكالة · طلب شراء · كشف)
// + النوافذ CON5-09M. النصوص حرفياً من الإطارات (اليوم التجريبي = MOCK_NOW 14 أكتوبر 2026).
// الطلبات (DR/DQ) والقسائم (09V) وملف الوكالة (09P) في agency-extra.ts.
import { ApiError, delay } from "./errors";
import { num } from "../format";

export type AgTone = "success" | "danger" | "pending" | "info" | "neutral";
export type Arrangement = "credit" | "prepaid";

/** أزرار صف الوكالة في الجدول (أول زر قبل «التفاصيل») */
export type RowAct = "limit" | "pay" | "topup" | "confirm" | "reactivate";

export interface Agency {
  id: string;
  name: string;
  /** اسم قصير لعنوان «إعادة تفعيل …» */
  short: string;
  city: string;
  cities: string[];
  branches: string;
  /** «جدة والرياض · 4 فروع · 7 أعضاء» — سطر رأس الدرج */
  heroLine: string;
  arrangement: Arrangement;
  status: { label: string; tone: AgTone; sub: string };
  /** الحد (ائتمان) أو الرصيد (مسبق) */
  money: number;
  moneySub: string;
  vouchersOct: number;
  contact: { name: string; phone: string };
  act: RowAct;
  /** زر الصف كحلي (تسجيل سداد · تأكيد الشحن) */
  actPrimary?: boolean;
  /** إحصاءات الدرج: من اليمين لليسار */
  stats: { label: string; value: string }[];
  financeLine: string;
  suspended?: boolean;
  /** له صفحة «ملف الوكالة» (CON5-09P) */
  hasProfile?: boolean;
  // أرقام للإجراءات
  used?: number;
  alertAt?: number;
  pendingTopup?: { id: string; amount: number; sentLine: string };
  overdueInvoice?: string;
  /** «المتاح … · مستخدم …%» أو «المتاح …» بعد تعديل الحد */
  subKind?: "avail-pct" | "avail";
  createdOrder: number;
}

const credit = (a: Omit<Agency, "arrangement">): Agency => ({ ...a, arrangement: "credit" });
const prepaid = (a: Omit<Agency, "arrangement">): Agency => ({ ...a, arrangement: "prepaid" });

let agencies: Agency[] = [
  credit({
    id: "DL-014",
    name: "الريادة للسيارات",
    short: "الريادة للسيارات",
    city: "جدة والرياض",
    cities: ["جدة", "الرياض"],
    branches: "4 فروع",
    heroLine: "جدة والرياض · 4 فروع · 7 أعضاء",
    status: { label: "منتظم", tone: "success", sub: "كشف سبتمبر يستحق 31 أكتوبر 2026" },
    money: 300000,
    moneySub: "المتاح 99,150 · مستخدم 67%",
    vouchersOct: 24,
    contact: { name: "سامي الغامدي", phone: "0552104478" },
    act: "limit",
    stats: [],
    financeLine: "كشف سبتمبر INV-2026-10-0214‏ · 159,200 · يستحق 31 أكتوبر 2026",
    hasProfile: true,
    used: 200850,
    subKind: "avail-pct",
    createdOrder: 1,
  }),
  credit({
    id: "DL-007",
    name: "معارض النخيل للسيارات",
    short: "معارض النخيل للسيارات",
    city: "الدمام",
    cities: ["الدمام"],
    branches: "فرعان",
    heroLine: "الدمام · فرعان · 5 موظفين",
    status: { label: "متأخر 38,450 ر.س", tone: "danger", sub: "تتوقف الطلبات 15 أكتوبر 2026" },
    money: 150000,
    moneySub: "مستخدم 41%",
    vouchersOct: 6,
    contact: { name: "ماجد العلي", phone: "0552289310" },
    act: "pay",
    actPrimary: true,
    stats: [
      { label: "الحد", value: "150,000" },
      { label: "مستخدم", value: "61,850" },
      { label: "متأخر", value: "38,450" },
      { label: "قسائم أكتوبر", value: "6" },
    ],
    financeLine: "كشف أغسطس INV-2026-09-0198 متأخر 13 يوماً · تتوقف الطلبات الجديدة 15 أكتوبر 2026",
    used: 61850,
    overdueInvoice: "INV-2026-09-0198",
    createdOrder: 2,
  }),
  prepaid({
    id: "DL-021",
    name: "معارض الأفق للسيارات",
    short: "معارض الأفق للسيارات",
    city: "الرياض",
    cities: ["الرياض"],
    branches: "فرع واحد",
    heroLine: "الرياض · فرع واحد · 3 موظفين",
    status: { label: "رصيد منخفض", tone: "pending", sub: "آخر شحن TP-2026-0093" },
    money: 48600,
    moneySub: "حد التنبيه 50,000",
    vouchersOct: 5,
    contact: { name: "ناصر القرني", phone: "0546107781" },
    act: "topup",
    stats: [
      { label: "الرصيد", value: "48,600" },
      { label: "حد التنبيه", value: "50,000" },
      { label: "آخر شحن", value: "50,000" },
      { label: "قسائم أكتوبر", value: "2" },
    ],
    financeLine: "آخر شحن TP-2026-0093‏ · 50,000 · 2 أكتوبر 2026",
    alertAt: 50000,
    createdOrder: 3,
  }),
  prepaid({
    id: "DL-018",
    name: "شركة الوسيط لتأجير السيارات",
    short: "شركة الوسيط",
    city: "جدة",
    cities: ["جدة"],
    branches: "فرع واحد",
    heroLine: "جدة · فرع واحد · أسطول 60 سيارة",
    status: { label: "شحنة بانتظار التأكيد", tone: "info", sub: "‏TP-2026-0101‏ · 15,000 ر.س" },
    money: 12400,
    moneySub: "حد التنبيه 10,000",
    vouchersOct: 7,
    contact: { name: "عبير الحربي", phone: "0563304419" },
    act: "confirm",
    actPrimary: true,
    stats: [
      { label: "الرصيد", value: "12,400" },
      { label: "حد التنبيه", value: "10,000" },
      { label: "شحنة معلّقة", value: "15,000" },
      { label: "قسائم أكتوبر", value: "7" },
    ],
    financeLine: "‏TP-2026-0101 · تحويل بنكي 15,000 · 13 أكتوبر 2026 · بانتظار تأكيد الاستلام",
    alertAt: 10000,
    pendingTopup: { id: "TP-2026-0101", amount: 15000, sentLine: "13 أكتوبر 2026 · تحويل بنكي" },
    createdOrder: 4,
  }),
  credit({
    id: "DL-009",
    name: "معارض السهم الذهبي",
    short: "معارض السهم الذهبي",
    city: "جدة",
    cities: ["جدة"],
    branches: "فرعان",
    heroLine: "جدة · فرعان · 6 موظفين",
    status: { label: "منتظم", tone: "success", sub: "سدّد كشف سبتمبر" },
    money: 100000,
    moneySub: "المتاح 77,700",
    vouchersOct: 6,
    contact: { name: "فيصل القحطاني", phone: "0509182203" },
    act: "limit",
    stats: [],
    financeLine: "كشف سبتمبر INV-2026-10-0212‏ · 18,750 · سُدّد 8 أكتوبر 2026",
    used: 22300,
    subKind: "avail",
    createdOrder: 5,
  }),
  credit({
    id: "DL-011",
    name: "مجموعة الحمد للسيارات",
    short: "مجموعة الحمد",
    city: "الرياض",
    cities: ["الرياض"],
    branches: "3 فروع",
    heroLine: "الرياض · 3 فروع",
    status: { label: "موقوفة بطلبها", tone: "neutral", sub: "منذ 20 سبتمبر 2026" },
    money: 200000,
    moneySub: "لا مستحقات",
    vouchersOct: 0,
    contact: { name: "سلمان الحمد", phone: "0551006624" },
    act: "reactivate",
    stats: [
      { label: "الحد", value: "200,000" },
      { label: "مستخدم", value: "0" },
      { label: "مستحق", value: "0" },
      { label: "قسائم أكتوبر", value: "0" },
    ],
    financeLine: "لا مستحقات · أوقفت الوكالة حسابها 20 سبتمبر 2026 لإعادة هيكلة المبيعات",
    suspended: true,
    used: 0,
    createdOrder: 6,
  }),
  // الصفحتين 2 و3 (مش ظاهرة في Figma — نفس الشكل)
  ...(
    [
      ["DL-003", "معارض الجزيرة للسيارات", "الرياض", "3 فروع", 250000, 141200, "فهد السبيعي", "0551203348", 3],
      ["DL-004", "شركة الصفوة لتأجير السيارات", "جدة", "فرعان", 120000, 38600, "خالد الزهراني", "0554410982", 2],
      ["DL-005", "معارض الخليج للسيارات", "الخبر", "فرع واحد", 80000, 12400, "عبدالعزيز الدوسري", "0538812240", 1],
      ["DL-006", "مجموعة البيان للسيارات", "مكة المكرمة", "فرعان", 90000, 47300, "يوسف الشريف", "0567720914", 4],
      ["DL-008", "معارض الرواد للسيارات", "الرياض", "فرع واحد", 60000, 9800, "تركي العتيبي", "0502281176", 0],
      ["DL-010", "شركة المدار لتأجير السيارات", "الدمام", "فرعان", 110000, 52100, "حمد الخالدي", "0549907312", 2],
    ] as const
  ).map(([id, name, city, branches, limit, used, cname, cphone, v], i) =>
    credit({
      id,
      name,
      short: name,
      city,
      cities: [city],
      branches,
      heroLine: `${city} · ${branches}`,
      status: { label: "منتظم", tone: "success", sub: "كشف سبتمبر يستحق 31 أكتوبر 2026" },
      money: limit,
      moneySub: `المتاح ${num(limit - used)}`,
      vouchersOct: v,
      contact: { name: cname, phone: cphone },
      act: "limit",
      stats: [],
      financeLine: "كشف سبتمبر · يستحق 31 أكتوبر 2026",
      used,
      subKind: "avail",
      createdOrder: 7 + i,
    }),
  ),
  prepaid({
    id: "DL-019",
    name: "شركة النقل الذكي لتأجير السيارات",
    short: "شركة النقل الذكي",
    city: "الرياض",
    cities: ["الرياض"],
    branches: "فرع واحد",
    heroLine: "الرياض · فرع واحد",
    status: { label: "منتظم", tone: "success", sub: "آخر شحن TP-2026-0088" },
    money: 64300,
    moneySub: "حد التنبيه 20,000",
    vouchersOct: 4,
    contact: { name: "منصور الغامدي", phone: "0558830216" },
    act: "topup",
    stats: [
      { label: "الرصيد", value: "64,300" },
      { label: "حد التنبيه", value: "20,000" },
      { label: "آخر شحن", value: "80,000" },
      { label: "قسائم أكتوبر", value: "4" },
    ],
    financeLine: "آخر شحن TP-2026-0088‏ · 80,000 · 21 سبتمبر 2026",
    alertAt: 20000,
    createdOrder: 13,
  }),
];

/** إحصاءات درج وكالة بالائتمان (الحد · مستخدم · المتاح · قسائم أكتوبر) بتتحسب من الأرقام */
function withStats(a: Agency): Agency {
  if (a.arrangement === "credit" && !a.stats.length) {
    const used = a.used ?? 0;
    return {
      ...a,
      stats: [
        { label: "الحد", value: num(a.money) },
        { label: "مستخدم", value: num(used) },
        { label: "المتاح", value: num(a.money - used) },
        { label: "قسائم أكتوبر", value: String(a.vouchersOct) },
      ],
    };
  }
  return a;
}

export const CITY_OPTIONS = ["الكل", "جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"];
export const FIN_OPTIONS = ["الكل", "منتظم", "متأخر", "رصيد منخفض", "شحنة بانتظار التأكيد", "موقوفة"];
export const ARR_OPTIONS = ["الكل", "ائتمان شهري", "رصيد مسبق"];
/** CON5-DD · سبب الإيقاف */
export const SUSPEND_REASONS = ["متأخرات مالية", "مستندات منتهية", "شكاوى متكررة", "طلب المنشأة"];
/** CON5-DD · طريقة السداد */
export const PAY_METHODS = ["تحويل بنكي", "رابط دفع", "نقداً في مقر لينكار"];
export const ARR_LABEL: Record<Arrangement, string> = { credit: "ائتمان شهري", prepaid: "رصيد مسبق" };

const finMatch = (a: Agency, f: string) =>
  f === "الكل" ||
  (f === "منتظم" && a.status.label === "منتظم") ||
  (f === "متأخر" && a.status.label.startsWith("متأخر")) ||
  (f === "رصيد منخفض" && a.status.label === "رصيد منخفض") ||
  (f === "شحنة بانتظار التأكيد" && a.status.label === "شحنة بانتظار التأكيد") ||
  (f === "موقوفة" && !!a.suspended);

// ───────────── طلبات الشراء (تبويب «الطلبات والقسائم») ─────────────
export interface PoVoucher {
  code: string;
  booking: string;
  customer: string;
  phone: string;
  used: boolean;
}
export interface PurchaseOrder {
  id: string;
  agencyId: string;
  agency: string;
  /** ISO */
  date: string;
  /** «اليوم 14 أكتوبر 2026» · «7 أكتوبر 2026» */
  dateLabel: string;
  service: string;
  /** سطر تحت الخدمة في الجدول */
  serviceSub: string;
  vouchers: number;
  vouchersLabel: string;
  usedLabel: string;
  value: number;
  status: { label: string; tone: AgTone; sub?: string };
  /** الدرج */
  hero: { pill: string; pillTone: AgTone; title: string; sub: string };
  /** «full» = إحصاءات + جدول القسائم + أزرار · «short» = بطاقة الطلب بس (01190 · 01102) */
  kind: "full" | "short";
  branchRep?: string;
  payment?: string;
  lines?: { k: string; v: string }[];
  /** «‏10 قسائم» تحت «العملاء والقسائم» */
  countLabel?: string;
  list?: PoVoucher[];
  /** «وقسيمتان أخريان في «القسائم والعملاء»» */
  more?: string;
  short?: { service: string; vouchers: string; value: string; note: string };
  sent?: boolean;
  /** في الجدول (الصفحة 1 = أول 5) */
  listed: boolean;
}

const v = (code: string, booking: string, customer: string, phone: string, used = false): PoVoucher => ({ code, booking, customer, phone, used });
const RYADA = { agencyId: "DL-014", agency: "الريادة للسيارات" };

let orders: PurchaseOrder[] = [
  {
    id: "PO-2026-01488",
    ...RYADA,
    date: "2026-10-14",
    dateLabel: "اليوم 14 أكتوبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "جونسون · سيدان · فرع الزهراء",
    vouchers: 10,
    vouchersLabel: "10 قسائم",
    usedLabel: "0 مستخدمة",
    value: 16500,
    status: { label: "بانتظار الاستخدام", tone: "pending", sub: "صالحة حتى 12 يناير 2027" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "جونسون · فرع الزهراء" },
    kind: "full",
    branchRep: "جدة · التحلية · سامي الغامدي",
    payment: "ائتمان شهري · فاتورة أكتوبر · لم تصدر",
    lines: [{ k: "سيدان × 10", v: "‏16,500 ر.س" }],
    countLabel: "‏10 قسائم",
    list: [
      v("LK-3HJ8-Q2WN", "BK-21478", "عبدالله الحربي", "055 184 2730"),
      v("LK-8TPA-5KXR", "BK-21479", "سعود القحطاني", "050 377 9164"),
      v("LK-2MVD-9QLE", "BK-21480", "نواف المالكي", "056 902 4418"),
      v("LK-6WZC-4RTH", "BK-21481", "ريان المطيري", "054 615 0397"),
      v("LK-9FNB-7JUA", "BK-21482", "هشام باوزير", "059 228 7751"),
      v("LK-4KSE-2PDM", "BK-21483", "بندر العنزي", "053 740 1186"),
      v("LK-7XGU-3CVN", "BK-21484", "وليد بخش", "055 963 2045"),
      v("LK-5RLQ-8HZB", "BK-21485", "فارس الدوسري", "050 518 6629"),
      v("LK-1DYT-6MWF", "BK-21486", "أنس الجهني", "058 304 9972"),
      v("LK-8NCK-2EGS", "BK-21487", "مازن الشريف", "056 471 3308"),
    ],
    listed: true,
  },
  {
    id: "PO-2026-01406",
    ...RYADA,
    date: "2026-10-07",
    dateLabel: "7 أكتوبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "جونسون · سيدان · محمد س.",
    vouchers: 1,
    vouchersLabel: "1 قسيمة",
    usedLabel: "BK-21414",
    value: 1650,
    status: { label: "بانتظار الاستخدام", tone: "pending", sub: "صالحة حتى 5 يناير 2027" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "جونسون · فرع الزهراء" },
    kind: "full",
    branchRep: "جدة · التحلية · فيصل الشهري",
    payment: "ائتمان شهري · فاتورة أكتوبر · لم تصدر",
    lines: [{ k: "سيدان × 1", v: "‏1,650 ر.س" }],
    countLabel: "قسيمة واحدة",
    list: [v("LK-3R7D-9KWA", "BK-21414", "محمد سالم", "055 ••• 4567")],
    listed: true,
  },
  {
    id: "PO-2026-01217",
    ...RYADA,
    date: "2026-09-20",
    dateLabel: "20 سبتمبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "جونسون · الزهراء والحمراء",
    vouchers: 4,
    vouchersLabel: "4 قسائم",
    usedLabel: "2 مستخدمة",
    value: 7100,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 19 ديسمبر 2026" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "جونسون · فرعا الزهراء والحمراء" },
    kind: "full",
    branchRep: "جدة · التحلية · فيصل الشهري",
    payment: "ائتمان شهري · INV-2026-10-0214 · مستحقة",
    lines: [
      { k: "سيدان × 2 · فرع الزهراء", v: "‏3,300 ر.س" },
      { k: "‏SUV متوسط × 2 · فرع الحمراء", v: "‏3,800 ر.س" },
    ],
    countLabel: "‏4 قسائم",
    list: [
      v("LK-2F6P-7XRM", "BK-21303", "خلود ص.", "053 ••• 4418", true),
      v("LK-9K3H-5VTC", "BK-21304", "بسام ت.", "050 ••• 2961", true),
      v("LK-6N2C-4HQV", "BK-21305", "عبدالمجيد ر.", "055 ••• 6620"),
      v("LK-8T4W-2PZE", "BK-21306", "مريم ن.", "059 ••• 9214"),
    ],
    listed: true,
  },
  {
    id: "PO-2026-01190",
    agencyId: "DL-007",
    agency: "معارض النخيل للسيارات",
    date: "2026-09-14",
    dateLabel: "14 سبتمبر 2026",
    service: "‏حماية PPF للواجهة + نانو سيراميك",
    serviceSub: "جونسون · سيدان",
    vouchers: 10,
    vouchersLabel: "10 قسائم",
    usedLabel: "7 مستخدمة",
    value: 29000,
    status: { label: "مستخدمة جزئياً", tone: "info" },
    hero: { pill: "مستخدمة جزئياً", pillTone: "info", title: "‏حماية PPF للواجهة + نانو سيراميك", sub: "معارض النخيل للسيارات" },
    kind: "short",
    short: { service: "‏حماية PPF للواجهة + نانو سيراميك · جونسون", vouchers: "10 قسائم · 7 مستخدمة", value: "29,000 ر.س", note: "ضمن كشف أغسطس INV-2026-09-0198" },
    listed: true,
  },
  {
    id: "PO-2026-01102",
    agencyId: "DL-018",
    agency: "شركة الوسيط لتأجير السيارات",
    date: "2026-09-01",
    dateLabel: "1 سبتمبر 2026",
    service: "اشتراك الغسيل الشهري",
    serviceSub: "كار سبا · 20 سيارة",
    vouchers: 20,
    vouchersLabel: "20 قسيمة",
    usedLabel: "20 مستخدمة",
    value: 5380,
    status: { label: "مستخدمة", tone: "success" },
    hero: { pill: "مستخدمة", pillTone: "success", title: "اشتراك الغسيل الشهري", sub: "شركة الوسيط لتأجير السيارات" },
    kind: "short",
    short: { service: "اشتراك الغسيل الشهري · كار سبا", vouchers: "20 قسيمة · 20 مستخدمة", value: "5,380 ر.س", note: "خُصمت من الرصيد المسبق" },
    listed: true,
  },
  {
    id: "PO-2026-01403",
    ...RYADA,
    date: "2026-10-04",
    dateLabel: "4 أكتوبر 2026",
    service: "تلميع خارجي + طبقة طاردة للماء",
    serviceSub: "جونسون · فرع الحمراء",
    vouchers: 4,
    vouchersLabel: "4 قسائم",
    usedLabel: "1 مستخدمة",
    value: 4900,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 2 يناير 2027" },
    hero: { pill: "نشط", pillTone: "success", title: "تلميع خارجي + طبقة طاردة للماء", sub: "جونسون · فرع الحمراء" },
    kind: "full",
    branchRep: "جدة · التحلية · فيصل الشهري",
    payment: "ائتمان شهري · فاتورة أكتوبر · لم تصدر",
    lines: [
      { k: "سيدان × 2", v: "‏2,300 ر.س" },
      { k: "‏SUV متوسط × 2", v: "‏2,600 ر.س" },
    ],
    countLabel: "‏4 قسائم",
    list: [
      v("LK-D4V7-1QHC", "BK-21408", "بدر المحمادي", "056 ••• 7745", true),
      v("LK-7JDX-2LNR", "BK-21409", "سامر الجدعاني", "055 ••• 4127"),
      v("LK-1KQV-6SPE", "BK-21410", "عادل الحازمي", "056 ••• 9013"),
      v("LK-8WHM-4BRT", "BK-21411", "إبراهيم القرشي", "054 ••• 2208"),
    ],
    listed: true,
  },
  {
    id: "PO-2026-01397",
    ...RYADA,
    date: "2026-10-04",
    dateLabel: "4 أكتوبر 2026",
    service: "تظليل وعازل حراري · عازل سيراميك",
    serviceSub: "النخبة · فرع الحمراء",
    vouchers: 3,
    vouchersLabel: "3 قسائم",
    usedLabel: "0 مستخدمة",
    value: 3000,
    status: { label: "بانتظار الاستخدام", tone: "pending", sub: "صالحة حتى 2 يناير 2027" },
    hero: { pill: "نشط", pillTone: "success", title: "تظليل وعازل حراري · عازل سيراميك", sub: "النخبة · فرع الحمراء" },
    kind: "full",
    branchRep: "جدة · الشاطئ · أحمد باعشن",
    payment: "ائتمان شهري · فاتورة أكتوبر · لم تصدر",
    lines: [{ k: "سيدان × 3", v: "‏3,000 ر.س" }],
    countLabel: "‏3 قسائم",
    list: [
      v("LK-6NFA-2QZJ", "BK-21393", "حسن عسيري", "053 ••• 1924"),
      v("LK-2XLR-8MKD", "BK-21394", "مشاري الثبيتي", "059 ••• 9843"),
      v("LK-9CTP-5JWG", "BK-21397", "طلال الحربي", "058 ••• 8762"),
    ],
    listed: true,
  },
  {
    id: "PO-2026-01392",
    ...RYADA,
    date: "2026-10-01",
    dateLabel: "1 أكتوبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "‏XPEL · فرع حطين",
    vouchers: 6,
    vouchersLabel: "6 قسائم",
    usedLabel: "2 مستخدمة",
    value: 15600,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 30 ديسمبر 2026" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "‏XPEL · فرع حطين" },
    kind: "full",
    branchRep: "الرياض · العليا · عبدالرحمن السالم",
    payment: "ائتمان شهري · فاتورة أكتوبر · لم تصدر",
    lines: [{ k: "سيدان × 6", v: "‏15,600 ر.س" }],
    countLabel: "‏6 قسائم",
    list: [
      v("LK-5Y6Z-9BR9", "BK-21380", "زياد القحطاني", "056 ••• 1220", true),
      v("LK-PK8Z-YCUZ", "BK-21381", "عمر الفيفي", "054 ••• 9139", true),
      v("LK-VC33-HEES", "BK-21382", "ريان الشهري", "053 ••• 8058"),
      v("LK-96BB-G5KU", "BK-21383", "سلطان العنزي", "059 ••• 6977"),
    ],
    more: "وقسيمتان أخريان في «القسائم والعملاء»",
    listed: true,
  },
  {
    id: "PO-2026-01271",
    ...RYADA,
    date: "2026-09-29",
    dateLabel: "29 سبتمبر 2026",
    service: "تلميع خارجي + طبقة طاردة للماء",
    serviceSub: "جونسون · فرع المحمدية",
    vouchers: 6,
    vouchersLabel: "6 قسائم",
    usedLabel: "2 مستخدمة",
    value: 6900,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 28 ديسمبر 2026" },
    hero: { pill: "نشط", pillTone: "success", title: "تلميع خارجي + طبقة طاردة للماء", sub: "جونسون · فرع المحمدية" },
    kind: "full",
    branchRep: "جدة · التحلية · فيصل الشهري",
    payment: "ائتمان شهري · INV-2026-10-0214 · مستحقة",
    lines: [{ k: "سيدان × 6", v: "‏6,900 ر.س" }],
    countLabel: "‏6 قسائم",
    list: [
      v("LK-5PXA-8MRD", "BK-21372", "ماهر العمري", "055 ••• 9868", true),
      v("LK-6QDN-3WKH", "BK-21373", "صالح المالكي", "056 ••• 8787", true),
      v("LK-82MZ-JZUF", "BK-21374", "تميم السهلي", "054 ••• 7706"),
      v("LK-SJW4-5ZPD", "BK-21375", "علي الأسمري", "053 ••• 6625"),
    ],
    more: "وقسيمتان أخريان في «القسائم والعملاء»",
    listed: true,
  },
  {
    id: "PO-2026-01259",
    ...RYADA,
    date: "2026-09-27",
    dateLabel: "27 سبتمبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "‏XPEL · فرع حطين",
    vouchers: 10,
    vouchersLabel: "10 قسائم",
    usedLabel: "2 مستخدمة",
    value: 27200,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 26 ديسمبر 2026" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "‏XPEL · فرع حطين" },
    kind: "full",
    branchRep: "الرياض · العليا · عبدالرحمن السالم",
    payment: "ائتمان شهري · INV-2026-10-0214 · مستحقة",
    lines: [
      { k: "سيدان × 6", v: "‏15,600 ر.س" },
      { k: "‏SUV متوسط × 4", v: "‏11,600 ر.س" },
    ],
    countLabel: "‏10 قسائم",
    list: [
      v("LK-TY7A-WFCA", "BK-21362", "معاذ الحربي", "059 ••• 2678", true),
      v("LK-9PNF-VMSB", "BK-21363", "راكان الدوسري", "058 ••• 1597", true),
      v("LK-ZNSE-9GHM", "BK-21364", "حمد السبيعي", "050 ••• 9516"),
      v("LK-N6T6-BBU8", "BK-21365", "نواف العصيمي", "055 ••• 8435"),
    ],
    more: "و6 قسائم أخرى في «القسائم والعملاء»",
    listed: true,
  },
  {
    id: "PO-2026-01247",
    ...RYADA,
    date: "2026-09-24",
    dateLabel: "24 سبتمبر 2026",
    service: "Johnson Ceramic Pro",
    serviceSub: "‏XPEL · فرع الياسمين",
    vouchers: 4,
    vouchersLabel: "4 قسائم",
    usedLabel: "1 مستخدمة",
    value: 10700,
    status: { label: "مستخدمة جزئياً", tone: "pending", sub: "صالحة حتى 23 ديسمبر 2026" },
    hero: { pill: "نشط", pillTone: "success", title: "Johnson Ceramic Pro", sub: "‏XPEL · فرع الياسمين" },
    kind: "full",
    branchRep: "الرياض · الملقا · سامي الغامدي",
    payment: "ائتمان شهري · INV-2026-10-0214 · مستحقة",
    lines: [
      { k: "سيدان × 3", v: "‏7,800 ر.س" },
      { k: "‏SUV متوسط × 1", v: "‏2,900 ر.س" },
    ],
    countLabel: "‏4 قسائم",
    list: [
      v("LK-V98H-33TB", "BK-21340", "سعد البيشي", "053 ••• 8460", true),
      v("LK-2ZUZ-E3C2", "BK-21341", "ناصر الحمدان", "059 ••• 7379"),
      v("LK-R9ED-FWYW", "BK-21342", "مهند العسيري", "058 ••• 6298"),
      v("LK-FXC4-UCND", "BK-21343", "ثامر القرني", "050 ••• 5217"),
    ],
    listed: true,
  },
];

export const PO_STATUS_OPTIONS = ["الكل", "بانتظار الاستخدام", "مستخدمة جزئياً", "مستخدمة"];

// ───────────── الكشوف الشهرية ─────────────
export type StatementState = "overdue" | "issued" | "paid";
export interface Statement {
  id: string;
  agencyId: string;
  agency: string;
  period: string;
  /** «كشف أغسطس» */
  periodFull: string;
  amount: number;
  /** ISO */
  due: string;
  state: StatementState;
  overdueDays?: number;
  paid?: { on: string; method: string; by: string };
  /** الدرج المفصّل (INV-2026-09-0151 · بيتفتح من ملف الوكالة) */
  detailed?: {
    subtitle: string;
    heroSub: string;
    rangeLabel: string;
    issued: string;
    dueLabel: string;
    beforeVat: string;
    vat: string;
    amountLabel: string;
    paidOn: string;
    method: string;
  };
  listed: boolean;
}

let statements: Statement[] = [
  { id: "INV-2026-09-0198", agencyId: "DL-007", agency: "معارض النخيل للسيارات", period: "أغسطس", periodFull: "أغسطس 2026", amount: 38450, due: "2026-10-01", state: "overdue", overdueDays: 13, listed: true },
  { id: "INV-2026-10-0214", agencyId: "DL-014", agency: "الريادة للسيارات", period: "سبتمبر", periodFull: "سبتمبر 2026", amount: 159200, due: "2026-10-31", state: "issued", listed: true },
  { id: "INV-2026-10-0215", agencyId: "DL-007", agency: "معارض النخيل للسيارات", period: "سبتمبر", periodFull: "سبتمبر 2026", amount: 24100, due: "2026-10-31", state: "issued", listed: true },
  { id: "INV-2026-10-0212", agencyId: "DL-009", agency: "معارض السهم الذهبي", period: "سبتمبر", periodFull: "سبتمبر 2026", amount: 18750, due: "2026-10-31", state: "paid", paid: { on: "2026-10-08", method: "تحويل بنكي", by: "عبدالرحمن ح." }, listed: true },
  {
    id: "INV-2026-09-0151",
    agencyId: "DL-014",
    agency: "الريادة للسيارات",
    period: "أغسطس",
    periodFull: "أغسطس 2026",
    amount: 117100,
    due: "2026-10-01",
    state: "paid",
    paid: { on: "2026-09-28", method: "تحويل بنكي", by: "عبدالرحمن ح." },
    detailed: {
      subtitle: "الريادة للسيارات · طلبات أغسطس 2026",
      heroSub: "كشف أغسطس · 7 طلبات · 55 قسيمة",
      rangeLabel: "‏1–31 أغسطس 2026",
      issued: "1 سبتمبر 2026",
      dueLabel: "1 أكتوبر 2026 · صافي 30 يوماً",
      beforeVat: "‏101,826.09 ر.س",
      vat: "‏15,273.91 ر.س",
      amountLabel: "‏117,100.00 ر.س",
      paidOn: "28 سبتمبر 2026",
      method: "تحويل بنكي",
    },
    listed: false,
  },
];

export const ST_STATUS_OPTIONS = ["الكل", "متأخر", "صادر", "مسدّد"];
export const ST_MONTH_OPTIONS = ["الكل", "سبتمبر", "أغسطس"];
export const ST_LABEL: Record<StatementState, { label: string; tone: AgTone }> = {
  overdue: { label: "متأخر", tone: "danger" },
  issued: { label: "صادر", tone: "info" },
  paid: { label: "مسدّد", tone: "success" },
};

// ───────────── القوائم ─────────────
export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
const paginate = <T,>(all: T[], page: number, size: number): ListResult<T> => {
  const pages = Math.max(1, Math.ceil(all.length / size));
  const p = Math.min(Math.max(1, page), pages);
  return { items: all.slice((p - 1) * size, p * size), total: all.length, page: p, pages };
};
const has = (s: string, q: string) => s.toLowerCase().includes(q.trim().toLowerCase());

export interface AgencyListParams {
  page?: number;
  search?: string;
  city?: string;
  fin?: string;
  arr?: string;
}

const stDue = (s: Statement) => s.state !== "paid";
let agencyCounter = 22;

export const agenciesApi = {
  /** أرقام التبويبات + بطاقات الأرقام (CON5-09) */
  summary: async () => {
    const active = agencies.filter((a) => !a.suspended);
    const overdue = statements.filter((s) => s.state === "overdue");
    const od = overdue[0];
    const sept = statements.filter((s) => s.period === "سبتمبر" && stDue(s) && s.listed);
    return delay({
      tabs: { agencies: agencies.length, orders: 51, statements: statements.filter((s) => s.listed).length },
      kpis: {
        overdue: overdue.reduce((t, s) => t + s.amount, 0),
        overdueSub: od ? `ر.س · ${od.agency.replace(" للسيارات", "")} · ${od.overdueDays} يوماً` : "ر.س · لا متأخرات",
        septDue: sept.reduce((t, s) => t + s.amount, 0),
        septSub: "ر.س · تستحق 31 أكتوبر 2026",
        vouchers: 51,
        vouchersSub: "27 مستخدمة لدى المراكز",
        active: active.length,
        activeSub: `${agencies.filter((a) => a.arrangement === "credit").length} ائتمان · ${agencies.filter((a) => a.arrangement === "prepaid").length} رصيد مسبق · ${agencies.length - active.length} موقوفة`,
      },
    });
  },
  list: async ({ page = 1, search = "", city = "الكل", fin = "الكل", arr = "الكل" }: AgencyListParams) => {
    const all = agencies
      .filter((a) => (!search.trim() || has(a.name, search) || has(a.id, search)) && (city === "الكل" || a.cities.includes(city)) && finMatch(a, fin) && (arr === "الكل" || ARR_LABEL[a.arrangement] === arr))
      .sort((x, y) => x.createdOrder - y.createdOrder)
      .map(withStats);
    const r = paginate(all, page, 6);
    return delay({ ...r, credit: all.filter((a) => a.arrangement === "credit").length, prepaid: all.filter((a) => a.arrangement === "prepaid").length });
  },
  get: async (id: string) => {
    const a = agencies.find((x) => x.id === id);
    if (!a) throw new ApiError(404);
    return delay(withStats(a), 200);
  },
  orders: async ({ page = 1, search = "", status = "الكل", agency = "الكل" }: { page?: number; search?: string; status?: string; agency?: string }) => {
    const all = orders.filter(
      (o) =>
        o.listed &&
        (!search.trim() || has(o.id, search) || !!o.list?.some((x) => has(x.code, search) || has(x.booking, search))) &&
        (status === "الكل" || o.status.label === status) &&
        (agency === "الكل" || o.agency === agency),
    );
    return delay(paginate(all, page, 5));
  },
  order: async (id: string) => {
    const o = orders.find((x) => x.id === id);
    if (!o) throw new ApiError(404);
    return delay(o, 200);
  },
  ordersOf: async (agencyId: string) => delay(orders.filter((o) => o.agencyId === agencyId)),
  agencyNames: () => ["الكل", ...new Set(orders.map((o) => o.agency))],
  statements: async ({ page = 1, search = "", status = "الكل", month = "الكل" }: { page?: number; search?: string; status?: string; month?: string }) => {
    const all = statements.filter((s) => s.listed && (!search.trim() || has(s.id, search)) && (status === "الكل" || ST_LABEL[s.state].label === status) && (month === "الكل" || s.period === month));
    return delay(paginate(all, page, 10));
  },
  statement: async (id: string) => {
    const s = statements.find((x) => x.id === id);
    if (!s) throw new ApiError(404);
    return delay(s, 200);
  },
  statementsOf: async (agencyId: string) => delay(statements.filter((s) => s.agencyId === agencyId)),

  // ───── الإجراءات (CON5-09M) ─────
  /** CON5-09M · تعديل الحد → T0901 */
  updateLimit: async (id: string, limit: number, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "", { reason: "اكتب السبب" });
    agencies = agencies.map((a) => {
      if (a.id !== id) return a;
      const used = a.used ?? 0;
      const avail = limit - used;
      const moneySub = a.subKind === "avail-pct" ? `المتاح ${num(avail)} · مستخدم ${Math.round((used / limit) * 100)}%` : a.subKind === "avail" ? `المتاح ${num(avail)}` : a.moneySub;
      const stats = a.stats.length ? a.stats.map((s) => (s.label === "الحد" ? { ...s, value: num(limit) } : s)) : a.stats;
      return { ...a, money: limit, moneySub, stats };
    });
    return delay({ toast: "حُفظ الحد الائتماني الجديد" });
  },
  /** CON5-09M · تسجيل سداد → T0902 */
  recordPayment: async (invoiceId: string, p: { date: string; amount: number; method: string; ref: string }) => {
    const s = statements.find((x) => x.id === invoiceId);
    if (!s) throw new ApiError(404);
    if (!(p.amount > 0)) throw new ApiError(422, "", { amount: "أدخل المبلغ المستلم" });
    statements = statements.map((x) => (x.id === invoiceId ? { ...x, state: "paid", overdueDays: undefined, paid: { on: p.date, method: p.method, by: "نوف القحطاني" } } : x));
    agencies = agencies.map((a) => {
      if (a.id !== s.agencyId) return a;
      const used = Math.max(0, (a.used ?? 0) - p.amount);
      const stillOverdue = statements.some((x) => x.agencyId === a.id && x.state === "overdue");
      if (a.overdueInvoice === invoiceId && !stillOverdue) {
        return {
          ...a,
          used,
          overdueInvoice: undefined,
          status: { label: "منتظم", tone: "success", sub: "كشف سبتمبر يستحق 31 أكتوبر 2026" },
          moneySub: `مستخدم ${Math.round((used / a.money) * 100)}%`,
          act: "limit",
          actPrimary: false,
          stats: [],
          financeLine: `كشف أغسطس ${invoiceId}‏ · ${num(s.amount)} · سُدّد ${p.date.slice(8, 10).replace(/^0/, "")} أكتوبر 2026`,
        };
      }
      return { ...a, used };
    });
    return delay({ toast: "سُجّل السداد وتحدّث الرصيد المتاح" });
  },
  /** CON5-09M · تسجيل شحن → T0903 */
  recordTopup: async (id: string, amount: number) => {
    if (!(amount > 0)) throw new ApiError(422, "", { amount: "أدخل مبلغ الشحن" });
    agencies = agencies.map((a) => {
      if (a.id !== id) return a;
      const money = a.money + amount;
      const low = a.alertAt != null && money < a.alertAt;
      return {
        ...a,
        money,
        status: low ? a.status : { label: "منتظم", tone: "success", sub: "آخر شحن TP-2026-0102" },
        stats: a.stats.map((s) => (s.label === "الرصيد" ? { ...s, value: num(money) } : s.label === "آخر شحن" ? { ...s, value: num(amount) } : s)),
        financeLine: `آخر شحن TP-2026-0102‏ · ${num(amount)} · 14 أكتوبر 2026`,
      };
    });
    return delay({ toast: "سُجّل شحن الرصيد" });
  },
  /** CON5-09M · تأكيد الشحن → T0904 */
  confirmTopup: async (id: string) => {
    agencies = agencies.map((a) => {
      if (a.id !== id || !a.pendingTopup) return a;
      const money = a.money + a.pendingTopup.amount;
      const t = a.pendingTopup;
      return {
        ...a,
        money,
        pendingTopup: undefined,
        act: "topup",
        actPrimary: false,
        status: { label: "منتظم", tone: "success", sub: `آخر شحن ${t.id}` },
        stats: [
          { label: "الرصيد", value: num(money) },
          { label: "حد التنبيه", value: num(a.alertAt ?? 0) },
          { label: "آخر شحن", value: num(t.amount) },
          { label: "قسائم أكتوبر", value: String(a.vouchersOct) },
        ],
        financeLine: `آخر شحن ${t.id}‏ · ${num(t.amount)} · 14 أكتوبر 2026`,
      };
    });
    return delay({ toast: "تأكد الاستلام وأُضيف الرصيد للوكالة" });
  },
  /** CON5-09M · إعادة تفعيل → T0905 */
  reactivate: async (id: string) => {
    agencies = agencies.map((a) =>
      a.id === id ? { ...a, suspended: false, act: a.arrangement === "credit" ? "limit" : "topup", status: { label: "منتظم", tone: "success", sub: "أُعيد تفعيلها 14 أكتوبر 2026" }, financeLine: "لا مستحقات · أُعيد تفعيل الوكالة 14 أكتوبر 2026" } : a,
    );
    return delay({ toast: "أُعيد تفعيل الوكالة" });
  },
  /** CON5-09M · إيقاف → T0906 */
  suspend: async (id: string, reason: string) => {
    agencies = agencies.map((a) =>
      a.id === id ? { ...a, suspended: true, act: "reactivate", actPrimary: false, status: { label: reason === "طلب المنشأة" ? "موقوفة بطلبها" : "موقوفة", tone: "neutral", sub: "منذ 14 أكتوبر 2026" } } : a,
    );
    return delay({ toast: "أُوقفت الوكالة وأُبلغ المسؤول" });
  },
  /** «تذكير» في الكشوف → T0907 */
  remind: async (invoiceId: string) => {
    if (!statements.some((s) => s.id === invoiceId)) throw new ApiError(404);
    return delay({ toast: "أُرسل تذكير السداد للوكالة" });
  },
  /** «إرسال القسائم للعملاء» → T0925 · «إعادة إرسال غير المستخدمة» → T0926 */
  sendVouchers: async (poId: string) => {
    const o = orders.find((x) => x.id === poId);
    if (!o) throw new ApiError(404);
    const first = !o.sent && o.list?.every((x) => !x.used) && o.id === "PO-2026-01488";
    orders = orders.map((x) => (x.id === poId ? { ...x, sent: true } : x));
    return delay({ toast: first ? `أُرسلت ${o.list?.length ?? o.vouchers} رسائل من LINKAR إلى عملاء ${poId}` : "أُعيد إرسال القسائم غير المستخدمة إلى عملائها" });
  },
  /** تغيير المفوّض الرئيسي (ملف الوكالة) */
  setContact: async (id: string, name: string, phone: string) => {
    agencies = agencies.map((a) => (a.id === id ? { ...a, contact: { name, phone } } : a));
    return delay({ ok: true }, 0);
  },
  /** CON5-09W · إضافة وكالة → T0908 */
  create: async (d: { name: string; city: string; branches: number; contact: string; phone: string; arrangement: Arrangement; limit: number; alertAt: number }) => {
    const id = `DL-0${agencyCounter++}`;
    const branches = d.branches <= 1 ? "فرع واحد" : d.branches === 2 ? "فرعان" : `${d.branches} فروع`;
    const a: Agency = {
      id,
      name: d.name,
      short: d.name,
      city: d.city,
      cities: [d.city],
      branches,
      heroLine: `${d.city} · ${branches}`,
      arrangement: d.arrangement,
      status: { label: "منتظم", tone: "success", sub: "أُضيفت 14 أكتوبر 2026" },
      money: d.arrangement === "credit" ? d.limit : 0,
      moneySub: d.arrangement === "credit" ? `المتاح ${num(d.limit)}` : `حد التنبيه ${num(d.alertAt)}`,
      vouchersOct: 0,
      contact: { name: d.contact, phone: d.phone.replace(/\D/g, "") },
      act: d.arrangement === "credit" ? "limit" : "topup",
      stats:
        d.arrangement === "credit"
          ? []
          : [
              { label: "الرصيد", value: "0" },
              { label: "حد التنبيه", value: num(d.alertAt) },
              { label: "آخر شحن", value: "0" },
              { label: "قسائم أكتوبر", value: "0" },
            ],
      financeLine: d.arrangement === "credit" ? "أول كشف يصدر 1 نوفمبر 2026" : "لم يُشحن الرصيد بعد",
      used: 0,
      alertAt: d.arrangement === "prepaid" ? d.alertAt : undefined,
      subKind: d.arrangement === "credit" ? "avail" : undefined,
      createdOrder: 0,
    };
    agencies = [a, ...agencies];
    return delay({ id, toast: `أُضيفت ${d.name} ${id} وتفعّلت · أُرسل رابط البوابة` });
  },
};

/** القسيمة في طلبات الشراء (لدرج القسيمة CON5-09V في agency-extra.ts) */
export const findPoVoucher = (key: string) => {
  for (const o of orders) {
    const v = o.list?.find((x) => x.booking === key || x.code === key);
    if (v) return { po: o, v };
  }
  return null;
};
export const allOrders = () => orders;
/** بعد تغيير العميل/الإلغاء: يتحدّث صف القسيمة في جدول الطلب */
export const patchPoVoucher = (key: string, patch: Partial<PoVoucher> | null) => {
  orders = orders.map((o) => (o.list?.some((x) => x.booking === key || x.code === key) ? { ...o, list: patch ? o.list!.map((x) => (x.booking === key || x.code === key ? { ...x, ...patch } : x)) : o.list!.filter((x) => x.booking !== key && x.code !== key) } : o));
};
