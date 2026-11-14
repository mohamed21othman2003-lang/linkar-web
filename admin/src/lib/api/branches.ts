// الفروع (القسم 12) — بيانات تجريبية بنفس شكل الخادم المتوقع.
// المصدر: إطارات Figma CON5-08 / 08P / 08A / 08M / 08N / 08T (صفحة 3114:412، قسم «v5 · 08 · الفروع» 3114:55391).
// الفروع تابعة لمقدّمي الخدمة: إضافة/حذف/اعتماد فرع بيحدّث نفس مخزن المنشآت في providers.ts (عدد الفروع وسطر الفروع)،
// وإنشاء منشأة من المعالج (CON5-07N) أو «إضافة فرع» من نوافذ المنشآت (CON5-07M) بيضيف فروعها هنا.
import { ltr } from "../format";
import { ApiError, delay } from "./errors";
import { DISTRICTS, TIER_LABEL, providerEvents, providerStore, type Provider, type Tier } from "./providers";
import { MOCK_NOW, type ListResult } from "./users";

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
/** «14 أكتوبر 2026» من «2026-10-14» (من غير فرق المنطقة الزمنية) */
export const dayLabel = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
};
/** «25 أكتوبر 2026 · 10:00 ص» من «2026-10-25T10:00» */
export const slotLabel = (iso: string) => {
  const [h, mi] = (iso.slice(11, 16) || "10:00").split(":").map(Number);
  return `${dayLabel(iso)} · ${h % 12 || 12}:${String(mi).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
};
export const TODAY = MOCK_NOW.toISOString().slice(0, 10);

// ───────────── القوائم (القسم 17 + نوافذ CON5-08M) ─────────────
export const BRANCH_TABS = ["all", "approved", "pending-visit", "new", "rejected"] as const;
export type BranchTab = (typeof BRANCH_TABS)[number];
export const BRANCH_TAB_LABEL: Record<BranchTab, string> = { all: "الكل", approved: "معتمد", "pending-visit": "بانتظار الزيارة الميدانية", new: "معتمد جديد", rejected: "مرفوض" };

/** المقيّمون (فريق الجودة) */
export const ASSESSORS = ["لينا الحربي", "ماجد الفيفي", "سارة القحطاني"] as const;
export const PAUSE_REASONS = ["صيانة أو تجديد الفرع", "مستندات منتهية", "شكاوى متكررة", "طلب المنشأة", "متأخرات مالية"] as const;
export const DISABLE_REASONS = ["مخالفة معيار حرج في زيارة مفاجئة", "مستندات منتهية", "شكاوى متكررة", "طلب المنشأة", "متأخرات مالية"] as const;
export const REQUEST_REASONS = ["طلب المزوّد", "تعذّر حضور المقيّم", "الفرع غير جاهز", "أخرى"] as const;
/** «المستند» (القسم 17) */
export const DOCUMENTS = ["السجل التجاري", "الشهادة الضريبية", "رخصة البلدية", "شهادة الدفاع المدني", "الاتفاقية مع لينكار (التوقيع)", "شهادة الدفاع المدني (تجديد)", "شهادة اعتماد المنتج"] as const;
export const DEADLINES = [3, 7, 14] as const;
/** «قالب الاعتماد» (القسم 17) */
export const TEMPLATES = ["الجودة الأساسية + قوالب خدمات الفرع", "قالب الجودة الأساسية", "قالب الغسيل", "قالب التلميع", "قالب نانو سيراميك", "قالب حماية PPF", "قالب التظليل"] as const;
/** «عند انتهاء رخصة الفرع» (القسم 17 · CON5-DD 3114:69041) */
export const LICENSE_EXPIRY = ["إخفاء الفرع من الحجز الجديد", "تنبيه فقط", "إيقاف الفرع مؤقتاً"] as const;
export const HOURS_OPTIONS = [
  "السبت – الخميس 9 ص – 11 م · الجمعة 4 م – 11 م",
  "السبت – الخميس · 9 ص – 11 م",
  "السبت – الخميس 9 ص – 11 م",
  "السبت – الخميس 9 ص – 10 م",
  "السبت – الخميس 10 ص – 10 م",
  "يومياً · 10 ص – 11 م",
  "يومياً · 9 ص – 12 م",
  "يومياً · 7 ص – 12 م",
] as const;
/** معايير كل نوع خدمة ومدة التنفيذ الافتراضية (القسم 17 «قالب الاعتماد» + CON5-08N) */
export const SERVICE_CRITERIA: Record<string, { criteria: string; from: string; to: string }> = {
  "نانو سيراميك": { criteria: "15 معياراً · 12 حرجة", from: "يوم", to: "يومان" },
  "حماية PPF": { criteria: "16 معياراً · 10 حرجة", from: "يومان", to: "3 أيام" },
  التظليل: { criteria: "14 معياراً · 9 حرجة", from: "3 ساعات", to: "5 ساعات" },
  التلميع: { criteria: "10 معايير · 3 حرجة", from: "3 ساعات", to: "4 ساعات" },
  الغسيل: { criteria: "19 معياراً · 6 حرجة", from: "45 دقيقة", to: "60 دقيقة" },
  "تغيير اللون": { criteria: "14 معياراً · مسودة", from: "يومان", to: "4 أيام" },
};
export const BASE_QUALITY = "16 معياراً · 7 حرجة";
/** الحد الأدنى لكل فئة (التذييل في CON5-08) */
export const TIER_THRESHOLDS = "فضي 70% · ذهبي 80% · بلاتيني 90% فأكثر";

/** رموز الأحياء في كود الفرع (LK-JN-ZH-001) */
const DISTRICT_CODE: Record<string, string> = {
  الزهراء: "ZH", الحمراء: "HM", المحمدية: "MH", الروضة: "RD", العليا: "OL", السامر: "SM", "أبحر الشمالية": "AB", الصفا: "SF", النسيم: "NS",
  الحمدانية: "HD", السلامة: "SL", الملز: "ML", النرجس: "NR", العارض: "AR", الملقا: "MQ", الياسمين: "YS", الصحافة: "SH", حطين: "HT",
  الشاطئ: "SA", التحلية: "TH", الفيصلية: "FS", النور: "NO", الريان: "RY", العزيزية: "AZ", الشوقية: "SQ", العقربية: "AQ", الثقبة: "TQ", الراكة: "RK",
};
const LATIN: Record<string, string> = { ا: "A", ب: "B", ت: "T", ث: "TH", ج: "J", ح: "H", خ: "KH", د: "D", ذ: "Z", ر: "R", ز: "Z", س: "S", ش: "SH", ص: "S", ض: "D", ط: "T", ظ: "Z", ع: "A", غ: "G", ف: "F", ق: "Q", ك: "K", ل: "L", م: "M", ن: "N", ه: "H", و: "W", ي: "Y", ة: "H", ى: "A", أ: "A", إ: "A", آ: "A" };
const districtCode = (d: string) => {
  if (DISTRICT_CODE[d]) return DISTRICT_CODE[d];
  const letters = d.replace(/^ال/, "").split("").map((c) => LATIN[c] ?? "").join("");
  return (letters.replace(/[AEIOUWY]/g, "").slice(0, 2) || letters.slice(0, 2) || "BR").padEnd(2, "X");
};
export const BRANCH_DISTRICTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DISTRICTS).map(([c, l]) => [c, [...new Set([...l, ...(c === "الرياض" ? ["الملز", "السامر", "الصفا", "النسيم"] : c === "جدة" ? ["أبحر الشمالية", "الحمدانية"] : [])])]]),
);

// ───────────── الأنواع ─────────────
export type BranchStatus = "approved" | "new" | "pending-visit" | "rejected" | "request";
export type ServiceState = "approved" | "paused" | "pending" | "rejected";
export interface BranchService {
  type: string;
  duration: string;
  state: ServiceState;
}
export interface Branch {
  id: string;
  code: string;
  /** الكود محجوز حتى قرار الزيارة */
  reserved?: boolean;
  name: string;
  district: string;
  city: string;
  address: string;
  provider: { id: string; code: string; label: string; full: string; kind: string };
  status: BranchStatus;
  tier: Tier | null;
  /** نتيجة آخر تقييم ميداني (89) */
  score: number | null;
  /** آخر تقييم ميداني (ISO) */
  lastReview: string | null;
  /** موعد الزيارة الميدانية المجدولة (ISO + الساعة) */
  visitAt?: string;
  nextReview: string | null;
  statusLine?: string;
  main: boolean;
  /** «الاسم على لينكار» */
  displayName: string;
  month: number | null;
  rating: number | null;
  linkarRating: number | null;
  complaints: number;
  /** نتيجة الزيارة للمرفوض («61%») */
  result?: string;
  /** ملاحظة مكان بطاقات الأرقام في الملف (معتمد جديد / بانتظار الزيارة) */
  note?: string;
  services: BranchService[];
  baseQuality?: boolean;
  visitsTitle?: string;
  visits: [string, string][];
  docs: [string, string][];
  bookings?: [string, string][];
  durations?: [string, string][];
  manager: string;
  managerPhone?: string;
  email?: string;
  phone?: string;
  capacity?: string;
  liaison?: string;
  hours: string;
  slots: string;
  technicians: string;
  activeBookings: number;
  /** حجوزات بتتحوّل لو الفرع اتوقف (رسالة «حُوِّلت 24 حجزاً») */
  transferable: number;
  assessor?: string;
  rejectReason?: string;
  hasPerformance?: boolean;
  pausedUntil?: string;
  disabled?: boolean;
  createdAt: string;
}

export type BranchQuery = { tab?: BranchTab; provider?: string; q?: string; page?: number };
export type BranchKpis = {
  approved: number;
  providers: number;
  newApproved: number;
  tiers: [number, number, number];
  pending: number;
  pendingNames: string;
  periodic: number;
  periodicNext: string;
};

// ───────────── البيانات (CON5-08 3114:55392 + ملفات CON5-08P) ─────────────
const JN = { id: "lk-jn-001", code: "LK-JN-001", label: "جونسون", full: "جونسون", kind: "مركز عناية" };
const LM = { id: "lk-lm-001", code: "LK-LM-001", label: "لومار", full: "لومار", kind: "مركز عناية" };
const XP = { id: "lk-xp-001", code: "LK-XP-001", label: "XPEL", full: "XPEL السعودية", kind: "مركز عناية" };
const RM = { id: "lk-rm-001", code: "LK-RM-001", label: "مركز الريم", full: "مركز الريم", kind: "مركز عناية" };
const ND = { id: "lk-nd-001", code: "LK-ND-001", label: "مغسلة الندى", full: "مغسلة الندى", kind: "مغسلة" };
const DR = { id: "lk-dr-001", code: "LK-DR-001", label: "درع", full: "درع", kind: "مركز عناية" };
const LA = { id: "lk-la-001", code: "LK-LA-001", label: "مركز لمعة للتلميع", full: "مركز لمعة للتلميع", kind: "مركز عناية" };

const ok = (type: string, duration: string, state: ServiceState = "approved"): BranchService => ({ type, duration, state });
const JN_SERVICES = (last: BranchService) => [ok("نانو سيراميك", "يوم واحد"), ok("حماية PPF", "يومان"), ok("التلميع", "يوم واحد"), ok("الغسيل", "45 – 60 دقيقة"), ok("التفصيل الداخلي", "4 ساعات"), last];
const DOCS_VALID: [string, string][] = [
  ["رخصة البلدية", "سارية حتى يونيو 2027"],
  ["شهادة الدفاع المدني", "سارية حتى مارس 2027"],
  ["صور الفرع", "8 صور · آخر تحديث مع الزيارة الأخيرة"],
];
const DOCS_UPLOADED: [string, string][] = [
  ["رخصة البلدية", "مرفوعة · سارية"],
  ["شهادة الدفاع المدني", "مرفوعة · سارية"],
  ["صور الفرع", "6 صور"],
];
const jnDurations = (wash: string): [string, string][] => [
  ["Johnson Ceramic Pro", "يوم واحد"],
  ["طبقة طاردة للماء + تلميع", "6 ساعات"],
  ["تفصيل داخلي كامل", "4 ساعات"],
  ["PPF للواجهة + نانو سيراميك", "يومان"],
  ["تلميع ثلاث مراحل", "يوم واحد"],
  ["غسيل وتلميع سريع", wash],
];
const base = { baseQuality: false, activeBookings: 0, transferable: 0, complaints: 0, month: null, rating: null, linkarRating: null, createdAt: "2026-01-01" };

const SEED: Branch[] = [
  {
    ...base,
    id: "lk-jn-zh-001",
    code: "LK-JN-ZH-001",
    name: "فرع الزهراء",
    district: "الزهراء",
    city: "جدة",
    address: "شارع الأمير سلطان، حي الزهراء، جدة",
    provider: JN,
    status: "approved",
    tier: "gold",
    score: 89,
    lastReview: "2025-12-30",
    nextReview: "2026-12-30",
    main: true,
    displayName: "جونسون · الزهراء",
    month: 58,
    rating: 4.9,
    linkarRating: 4.4,
    services: JN_SERVICES(ok("طبقة طاردة للماء", "6 ساعات")),
    visits: [
      ["ميداني أولي · 89 · مقبول ذهبي", "30 ديسمبر 2025"],
      ["عملي · نهاية التجربة 90 يوماً · 91 · معتمد", "5 أبريل 2026"],
      ["زيارة مفاجئة · مطابق", "22 سبتمبر 2026"],
      ["ميداني دوري · مجدول", "30 ديسمبر 2026"],
    ],
    docs: DOCS_VALID,
    bookings: [
      ["BK-21475", "ريم س. · Johnson Ceramic Pro · بانتظار قرار لينكار"],
      ["BK-21452", "محمد س. · Ceramic Pro + تفصيل · بانتظار الزيارة"],
      ["BK-21447", "لمى ع. · باقة النانو والتلميع · مكتمل"],
    ],
    durations: jnDurations("45 – 60 دقيقة"),
    manager: "خالد الزهراني",
    managerPhone: "055 318 2207",
    email: "zh@johnsoncare.sa",
    phone: "050 621 4401",
    capacity: "نانو سيراميك 17 سيارة/يوم · PPF‏ 8 سيارات/يوم · التلميع 8 سيارات/يوم",
    hours: "السبت – الخميس 9 ص – 11 م · الجمعة 4 م – 11 م",
    slots: "10",
    technicians: "14",
    activeBookings: 24,
    transferable: 24,
    hasPerformance: true,
    createdAt: "2025-12-01",
  },
  {
    ...base,
    id: "lk-jn-hm-002",
    code: "LK-JN-HM-002",
    name: "فرع الحمراء",
    district: "الحمراء",
    city: "جدة",
    address: "شارع فلسطين، حي الحمراء، جدة",
    provider: JN,
    status: "approved",
    tier: "gold",
    score: 84,
    lastReview: "2026-02-15",
    nextReview: "2027-02-15",
    statusLine: "خدمة الغسيل والتلميع السريع موقوفة حتى 31 أكتوبر 2026",
    main: false,
    displayName: "جونسون · الحمراء",
    month: 46,
    rating: 4.9,
    linkarRating: 4.2,
    complaints: 1,
    services: JN_SERVICES(ok("الغسيل والتلميع السريع", "45 – 60 دقيقة", "paused")),
    visits: [
      ["ميداني أولي · 84 · مقبول ذهبي", "15 فبراير 2026"],
      ["عملي · نهاية التجربة · 86 · معتمد", "15 مايو 2026"],
      ["إيقاف الغسيل والتلميع السريع · نقص الفنيين · REQ-0398", "حتى 31 أكتوبر 2026"],
      ["ميداني دوري · مجدول", "15 فبراير 2027"],
    ],
    docs: DOCS_VALID,
    bookings: [
      ["BK-21474", "عبدالعزيز ف. · باقة العناية الكاملة · بانتظار الزيارة"],
      ["BK-21471", "ماجد ك. · طبقة طاردة + تلميع · ملغى"],
    ],
    durations: jnDurations("45 – 60 دقيقة · موقوفة في الفرع"),
    manager: "عبدالله الغامدي",
    managerPhone: "055 642 1180",
    email: "hm@johnsoncare.sa",
    phone: "050 621 4402",
    capacity: "نانو سيراميك 10 سيارات/يوم · PPF‏ 4 سيارات/يوم · التلميع 4 سيارات/يوم",
    hours: "السبت – الخميس 9 ص – 11 م · الجمعة 4 م – 11 م",
    slots: "6",
    technicians: "9",
    activeBookings: 17,
    transferable: 17,
    hasPerformance: true,
    createdAt: "2026-01-20",
  },
  {
    ...base,
    id: "lk-jn-mh-003",
    code: "LK-JN-MH-003",
    name: "فرع المحمدية",
    district: "المحمدية",
    city: "جدة",
    address: "طريق المدينة، حي المحمدية، جدة",
    provider: JN,
    status: "approved",
    tier: "gold",
    score: 81,
    lastReview: "2026-04-09",
    nextReview: "2027-04-08",
    main: false,
    displayName: "جونسون · المحمدية",
    month: 35,
    rating: 4.8,
    linkarRating: 4.1,
    complaints: 1,
    services: JN_SERVICES(ok("طبقة طاردة للماء", "6 ساعات")),
    visits: [
      ["ميداني أولي · 81 · مقبول ذهبي", "9 أبريل 2026"],
      ["عملي · نهاية التجربة · 84 · معتمد", "8 يوليو 2026"],
      ["زيارة مفاجئة · ملاحظة تهوية", "6 سبتمبر 2026"],
      ["ميداني دوري · مجدول", "8 أبريل 2027"],
    ],
    docs: DOCS_VALID,
    bookings: [
      ["BK-21473", "منيرة ح. · PPF للواجهة + نانو · بانتظار الزيارة"],
      ["BK-21459", "سعود ب. · تفصيل داخلي كامل · مكتمل"],
    ],
    durations: jnDurations("45 – 60 دقيقة"),
    manager: "ياسر العمري",
    managerPhone: "054 980 2234",
    email: "mh@johnsoncare.sa",
    phone: "050 621 4403",
    capacity: "نانو سيراميك 8 سيارات/يوم · PPF‏ 3 سيارات/يوم · التلميع 3 سيارات/يوم",
    hours: "السبت – الخميس 9 ص – 11 م",
    slots: "5",
    technicians: "7",
    activeBookings: 12,
    transferable: 12,
    hasPerformance: true,
    createdAt: "2026-03-10",
  },
  {
    ...base,
    id: "lk-lm-rd-001",
    code: "LK-LM-RD-001",
    name: "فرع الروضة",
    district: "الروضة",
    city: "الرياض",
    address: "طريق الملك عبدالعزيز، حي الروضة، الرياض",
    provider: LM,
    status: "approved",
    tier: "platinum",
    score: 93,
    lastReview: "2026-03-01",
    nextReview: "2027-03-01",
    main: true,
    displayName: "لومار · الروضة",
    month: 71,
    rating: 4.8,
    linkarRating: 4.7,
    services: [ok("التظليل", "3 – 5 ساعات"), ok("حماية PPF", "2 – 3 أيام")],
    visits: [
      ["ميداني أولي · 93 · مقبول بلاتيني", "1 مارس 2026"],
      ["عملي · نهاية التجربة · 94 · معتمد", "30 مايو 2026"],
      ["زيارة مفاجئة · مطابق", "4 أكتوبر 2026"],
      ["ميداني دوري · مجدول", "1 مارس 2027"],
    ],
    docs: DOCS_VALID,
    bookings: [["BK-21472", "سارة م. · تظليل كامل · بانتظار الزيارة"]],
    manager: "نايف العتيبي",
    liaison: "نايف العتيبي",
    hours: "يومياً · 10 ص – 11 م",
    slots: "8",
    technicians: "12",
    activeBookings: 31,
    transferable: 31,
    createdAt: "2026-02-01",
  },
  {
    ...base,
    id: "lk-xp-ol-001",
    code: "LK-XP-OL-001",
    name: "فرع العليا",
    district: "العليا",
    city: "الرياض",
    address: "شارع العليا العام، الرياض",
    provider: XP,
    status: "approved",
    tier: "platinum",
    score: 95,
    lastReview: "2026-01-15",
    nextReview: "2027-01-14",
    statusLine: "طلب إيقاف مؤقت REQ-2026-0414 قيد القرار",
    main: true,
    displayName: "‏XPEL · العليا",
    month: 64,
    rating: 4.9,
    linkarRating: 4.8,
    services: [ok("حماية PPF", "2 – 3 أيام"), ok("التظليل", "3 – 5 ساعات")],
    visits: [
      ["ميداني أولي · 95 · مقبول بلاتيني", "15 يناير 2026"],
      ["عملي · نهاية التجربة · 96 · معتمد", "15 أبريل 2026"],
      ["طلب إيقاف PPF · صيانة الفتحة · REQ-0414", "13 أكتوبر 2026"],
      ["ميداني دوري · مجدول", "14 يناير 2027"],
    ],
    docs: DOCS_VALID,
    bookings: [["BK-21470", "يوسف ع. · PPF كامل للسيارة · بانتظار الزيارة"]],
    manager: "عمر الشمري",
    liaison: "عمر الشمري",
    hours: "يومياً · 9 ص – 12 م",
    slots: "5",
    technicians: "10",
    activeBookings: 22,
    transferable: 22,
    createdAt: "2025-12-20",
  },
  {
    ...base,
    id: "lk-rm-sm-001",
    code: "LK-RM-SM-001",
    name: "فرع السامر",
    district: "السامر",
    city: "الرياض",
    address: "طريق الملك عبدالعزيز، حي السامر، الرياض",
    provider: RM,
    status: "new",
    tier: "silver",
    score: 79,
    lastReview: "2026-10-05",
    nextReview: "2027-10-05",
    statusLine: "لم يقدّم أي خدمة بعد",
    main: true,
    displayName: "مركز الريم · السامر",
    month: 0,
    linkarRating: 3.9,
    note: "«معتمد جديد»: قُبل الفرع ولم يقدّم أي خدمة بعد. يصير «معتمد» تلقائياً مع أول حجز مكتمل، وتبدأ التجربة (90 يوماً) مع أول حجز منفّذ.",
    services: [ok("التلميع", "3 – 4 ساعات"), ok("الغسيل", "45 – 60 دقيقة")],
    baseQuality: true,
    visits: [
      ["ميداني أولي · 79 · مقبول فضي (تلقائي)", "5 أكتوبر 2026"],
      ["اعتماد القرار · الكود LK-RM-SM-001", "6 أكتوبر 2026"],
      ["تسعير أول خدمة · بانتظار الاتفاق", "—"],
    ],
    docs: DOCS_UPLOADED,
    manager: "سعد المطيري",
    hours: "السبت – الخميس 9 ص – 11 م",
    slots: "3",
    technicians: "4",
    createdAt: "2026-09-28",
  },
  {
    ...base,
    id: "lk-jn-ab-004",
    code: "LK-JN-AB-004",
    reserved: true,
    name: "فرع أبحر الشمالية",
    district: "أبحر الشمالية",
    city: "جدة",
    address: "طريق الكورنيش، حي أبحر الشمالية، جدة",
    provider: JN,
    status: "pending-visit",
    tier: null,
    score: null,
    lastReview: null,
    visitAt: "2026-10-28T10:00",
    nextReview: null,
    main: false,
    displayName: "جونسون · أبحر الشمالية",
    note: "لا يظهر الفرع للعملاء ولا يستقبل حجوزات قبل الزيارة. بعدها يُحسب القرار والفئة تلقائياً، ويصير كوده LK-JN-AB-004 إن قُبل.",
    services: [ok("نانو سيراميك", "يوم – يومان", "pending"), ok("التلميع", "3 – 4 ساعات", "pending"), ok("الغسيل", "45 – 60 دقيقة", "pending")],
    baseQuality: true,
    visits: [
      ["أضافته لينكار باتفاق مع جونسون · LK-JN-AB-004 (محجوز)", "12 أكتوبر 2026"],
      ["زيارة ميدانية مجدولة · لينا الحربي · 10:00 ص", "28 أكتوبر 2026"],
    ],
    docs: DOCS_UPLOADED,
    manager: "حسام البلوي",
    managerPhone: "055 318 2296",
    hours: "السبت – الخميس 9 ص – 11 م · الجمعة 4 م – 11 م",
    slots: "6",
    technicians: "8",
    assessor: "لينا الحربي",
    createdAt: "2026-10-12",
  },
  {
    ...base,
    id: "lk-nd-sf-001",
    code: "LK-ND-SF-001",
    reserved: true,
    name: "فرع الصفا",
    district: "الصفا",
    city: "الرياض",
    address: "شارع الأمير مشعل، حي الصفا، الرياض",
    provider: ND,
    status: "pending-visit",
    tier: null,
    score: null,
    lastReview: null,
    visitAt: "2026-10-22T11:00",
    nextReview: null,
    main: true,
    displayName: "مغسلة الندى · الصفا",
    note: "منشأة من نوع «مغسلة»: بيانات الغسيل (آلي + يدوي، موقع مستقل، 8 مواقف انتظار) تُقيَّم بقالب الغسيل، وأول 5 معايير تُحسب تلقائياً منها.",
    services: [ok("الغسيل", "45 – 60 دقيقة", "pending")],
    baseQuality: true,
    visits: [
      ["أُضيف مع منشأة «مغسلة الندى» (طلب JR-0210)", "11 أكتوبر 2026"],
      ["زيارة ميدانية مجدولة · ماجد الفيفي · 11:00 ص", "22 أكتوبر 2026"],
    ],
    docs: DOCS_UPLOADED,
    manager: "فيصل الدوسري",
    hours: "يومياً · 7 ص – 12 م",
    slots: "4 فتحات غسيل · 3 تنشيف",
    technicians: "6",
    assessor: "ماجد الفيفي",
    createdAt: "2026-10-11",
  },
  {
    ...base,
    id: "lk-dr-ns-003",
    code: "LK-DR-NS-003",
    name: "فرع النسيم",
    district: "النسيم",
    city: "الرياض",
    address: "طريق خريص، حي النسيم، الرياض",
    provider: DR,
    status: "new",
    tier: "gold",
    score: 84,
    lastReview: "2026-10-12",
    nextReview: null,
    statusLine: "قُبل ذهبي · لم يقدّم خدمة بعد",
    main: false,
    displayName: "درع · النسيم",
    month: 0,
    linkarRating: 4.2,
    note: "قُبل تلقائياً من نموذج الزيارة (84 ≥ 70 ولا إخفاق حرج). يظهر للعملاء الآن ويصير «معتمد» مع أول حجز مكتمل.",
    services: [ok("حماية PPF", "2 – 3 أيام"), ok("نانو سيراميك", "يوم – يومان")],
    baseQuality: true,
    visits: [
      ["أضافته لينكار باتفاق مع درع", "30 سبتمبر 2026"],
      ["ميداني أولي · 84 · مقبول ذهبي (تلقائي)", "12 أكتوبر 2026"],
      ["معتمد جديد · بانتظار أول خدمة", "—"],
    ],
    docs: DOCS_UPLOADED,
    manager: "رائد الحربي",
    hours: "السبت – الخميس 9 ص – 10 م",
    slots: "4",
    technicians: "6",
    createdAt: "2026-09-30",
  },
  {
    ...base,
    id: "lk-la-hd-004",
    code: "LK-LA-HD-004",
    reserved: true,
    name: "فرع الحمدانية",
    district: "الحمدانية",
    city: "جدة",
    address: "طريق عسفان، حي الحمدانية، جدة",
    provider: LA,
    status: "rejected",
    tier: null,
    score: 61,
    lastReview: "2026-10-04",
    nextReview: null,
    statusLine: "حرج: السلامة · التلميع 58 من 70",
    main: false,
    displayName: "مركز لمعة للتلميع · الحمدانية",
    result: "61%",
    services: [ok("التلميع", "3 – 4 ساعات", "rejected")],
    baseQuality: true,
    visitsTitle: "الزيارة والقرار",
    visits: [
      ["أضافته لينكار باتفاق مع لمعة", "28 سبتمبر 2026"],
      ["ميداني أولي · 61% · غير مقبول (تلقائي) · ماجد الفيفي", "4 أكتوبر 2026"],
      ["يمكن طلب زيارة ثانية بعد الإصلاح", "—"],
    ],
    docs: [
      ["رخصة البلدية", "مرفوعة · سارية"],
      ["شهادة الدفاع المدني", "مرفوعة · طفايات الحريق منتهية"],
      ["صور الفرع", "6 صور"],
    ],
    manager: "مشعل الجهني",
    hours: "السبت – الخميس 10 ص – 10 م",
    slots: "2",
    technicians: "3",
    assessor: "ماجد الفيفي",
    rejectReason: "حرج: السلامة · التلميع 58 من 70",
    createdAt: "2026-09-28",
  },
];

// ───────────── المخزن + الأرقام ─────────────
// الأرقام في البطاقات والتبويبات من الخادم (58 · 53 · 2 · 2 · 1 …) — البيانات التجريبية جزء منها،
// فنحسب الفرق مرة ونضيفه عشان أي تغيير (إضافة، حذف، اعتماد) يبان في الأرقام.
let branches: Branch[] = structuredClone(SEED);
const clone = <T,>(v: T): T => structuredClone(v);

/** «طلب» = فرع اتضاف من نوافذ المنشآت/المعالج بالزيارة لسه ما اتجدولتش — بيتعدّ مع «بانتظار الزيارة» */
const tabOf = (b: Branch, t: BranchTab) => t === "all" || (t === "pending-visit" ? b.status === "pending-visit" || b.status === "request" : b.status === t);
const rawCounts = (l: Branch[]) => Object.fromEntries(BRANCH_TABS.map((t) => [t, l.filter((b) => tabOf(b, t)).length])) as Record<BranchTab, number>;
const FIGMA_COUNTS: Record<BranchTab, number> = { all: 58, approved: 53, "pending-visit": 2, new: 2, rejected: 1 };
const seedCounts = rawCounts(SEED);
const counts = () => {
  const now = rawCounts(branches);
  return Object.fromEntries(BRANCH_TABS.map((t) => [t, Math.max(0, FIGMA_COUNTS[t] - seedCounts[t] + now[t])])) as Record<BranchTab, number>;
};
const tierCount = (l: Branch[], t: Tier) => l.filter((b) => (b.status === "approved" || b.status === "new") && b.tier === t).length;
const FIGMA_TIERS = { platinum: 9, gold: 32, silver: 14 };
const seedTiers = { platinum: tierCount(SEED, "platinum"), gold: tierCount(SEED, "gold"), silver: tierCount(SEED, "silver") };

const find = (id: string) => {
  const b = branches.find((x) => x.id === id);
  if (!b) throw new ApiError(404, "not found");
  return b;
};
const norm = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه");

// الترتيب: المعتمد (حسب الإضافة) ثم معتمد جديد ثم بانتظار الزيارة (الأحدث أولاً) ثم المرفوض — زي CON5-08
const ORDER: Record<BranchStatus, number> = { approved: 0, new: 1, request: 2, "pending-visit": 2, rejected: 3 };
const sorter = (a: Branch, b: Branch) => {
  if (a.status === "new" && b.status === "new") return a.createdAt.localeCompare(b.createdAt) || 0;
  return ORDER[a.status] - ORDER[b.status] || (ORDER[a.status] === 2 ? b.createdAt.localeCompare(a.createdAt) : 0);
};
const seq = new Map(SEED.map((b, i) => [b.id, i]));
const sortList = (l: Branch[]) => [...l].sort((a, b) => sorter(a, b) || (seq.get(a.id) ?? 99) - (seq.get(b.id) ?? 99));

// ───────────── ربط بالمنشآت (providers.ts) ─────────────
const providerRef = (p: Provider) => ({
  id: p.id,
  code: p.code,
  label: p.short ?? p.name,
  full: p.short ?? p.name,
  kind: p.type === "care" ? "مركز عناية" : "مغسلة",
});
/** يعدّل عدد الفروع وسطر الفروع في المنشأة نفسها (CON5-07 «الفروع») */
function syncProvider(providerId: string, change: { pending?: number; approved?: number }) {
  const p = providerStore.find(providerId);
  if (!p) return;
  p.pendingBranches = Math.max(0, p.pendingBranches + (change.pending ?? 0));
  p.approvedBranches = Math.max(0, p.approvedBranches + (change.approved ?? 0));
  p.branchCount = Math.max(0, p.branchCount + (change.pending ?? 0) + (change.approved ?? 0));
  const mine = branches.filter((b) => b.provider.id === providerId);
  const approved = mine.filter((b) => b.status === "approved" || b.status === "new");
  const pending = mine.filter((b) => b.status === "pending-visit" || b.status === "request");
  // السطر المعروض في قائمة المنشآت: من الخادم للمنشآت الكبيرة — نضيف/نشيل الفروع اللي اتغيّرت بس
  if (change.pending && change.pending > 0) p.branchesLine = `${p.branchesLine} · +1 بانتظار الزيارة`;
  else if (p.branchCount <= 3 && mine.length === p.branchCount)
    p.branchesLine = [
      approved.length ? `${approved.length} ${approved.length === 1 ? "فرع" : "فروع"}: ${approved.map((b) => `${b.district}${b.tier ? ` ${TIER_LABEL[b.tier]}` : ""}`).join(" · ")}` : "",
      pending.length ? (approved.length ? `+${pending.length} بانتظار الزيارة` : `${pending.length} فرع: ${pending.map((b) => b.district).join(" · ")} بانتظار الزيارة`) : "",
    ]
      .filter(Boolean)
      .join(" · ");
}

export type NewBranchInput = {
  providerId: string;
  name: string;
  nameMode: "brand-district" | "custom";
  customName?: string;
  district: string;
  city: string;
  address: string;
  code: string;
  main: boolean;
  manager: string;
  managerPhone: string;
  liaison: string;
  phone: string;
  technicians: string;
  slots: string;
  hours: string;
  services: string[];
  licenseExpiry: string;
  assessor: string;
  visitAt: string;
};

function makeBranch(v: NewBranchInput, provider: Branch["provider"]): Branch {
  const label = provider.label;
  return {
    ...base,
    id: v.code.toLowerCase(),
    code: v.code,
    reserved: true,
    name: v.name,
    district: v.district,
    city: v.city,
    address: v.address,
    provider,
    status: "pending-visit",
    tier: null,
    score: null,
    lastReview: null,
    visitAt: v.visitAt,
    nextReview: null,
    main: v.main,
    displayName: v.nameMode === "custom" && v.customName ? v.customName : `${label} · ${v.district}`,
    note: `لا يظهر الفرع للعملاء ولا يستقبل حجوزات قبل الزيارة. بعدها يُحسب القرار والفئة تلقائياً، ويصير كوده ${v.code} إن قُبل.`,
    services: v.services.map((s) => ({ type: s, duration: durationText(s), state: "pending" as const })),
    baseQuality: true,
    visits: [
      [`أضافته لينكار باتفاق مع ${label} · ${v.code} (محجوز)`, dayLabel(TODAY)],
      [`زيارة ميدانية مجدولة · ${v.assessor} · ${slotLabel(v.visitAt).split(" · ")[1]}`, dayLabel(v.visitAt)],
    ],
    docs: DOCS_UPLOADED,
    manager: v.manager,
    managerPhone: v.managerPhone,
    phone: v.phone || undefined,
    liaison: v.liaison || undefined,
    hours: v.hours,
    slots: v.slots,
    technicians: v.technicians,
    assessor: v.assessor,
    createdAt: new Date().toISOString(),
  };
}
const durationText = (s: string) => {
  const c = SERVICE_CRITERIA[s];
  return c ? `${c.from.replace(/^(\d+) (\S+)$/, "$1")} – ${c.to}` : "—";
};

// إنشاء منشأة من المعالج (CON5-07N3) → فروعها «بانتظار الزيارة»
providerEvents.created.push((p, v) => {
  const ref = providerRef(p);
  for (const b of v.branches) {
    if (branches.some((x) => x.code === b.code)) continue;
    const nb = makeBranch(
      {
        providerId: p.id,
        name: b.name || `فرع ${b.district}`,
        nameMode: "brand-district",
        district: b.district,
        city: b.city,
        address: b.address,
        code: b.code,
        main: b.main,
        manager: b.manager,
        managerPhone: b.managerPhone,
        liaison: "",
        phone: "",
        technicians: b.technicians,
        slots: b.slots,
        hours: b.hours,
        services: b.services,
        licenseExpiry: LICENSE_EXPIRY[0],
        assessor: ASSESSORS[0],
        visitAt: b.visitDate ? `${b.visitDate.slice(0, 10)}T10:00` : "",
      },
      ref,
    );
    if (v.publish) Object.assign(nb, { status: "new", tier: v.publish.tier, reserved: false, note: undefined, statusLine: "لم يقدّم أي خدمة بعد", services: nb.services.map((s) => ({ ...s, state: "approved" })) });
    else if (!b.visitDate) nb.status = "request";
    branches = [...branches, nb];
  }
});
// «إضافة فرع» من نوافذ المنشآت (CON5-07M 3114:52063) → فرع بانتظار الزيارة الميدانية
providerEvents.branchAdded.push((p, v) => {
  const ref = providerRef(p);
  const district = v.name.replace(/^فرع\s+/, "").trim() || v.city;
  const code = nextCode(p.code, district);
  branches = [
    ...branches,
    makeBranch(
      {
        providerId: p.id,
        name: v.name.startsWith("فرع") ? v.name : `فرع ${v.name}`,
        nameMode: "brand-district",
        district,
        city: v.city,
        address: `حي ${district}، ${v.city}`,
        code,
        main: false,
        manager: v.manager,
        managerPhone: v.managerPhone,
        liaison: "",
        phone: "",
        technicians: "—",
        slots: "—",
        hours: HOURS_OPTIONS[1],
        services: v.services,
        licenseExpiry: LICENSE_EXPIRY[0],
        assessor: v.assessor,
        visitAt: v.visit,
      },
      ref,
    ),
  ];
});

/** الكود التالي لفرع جديد: LK-RM-ML-002 */
function nextCode(providerCode: string, district: string) {
  const prefix = providerCode.replace(/-\d+$/, "");
  const prov = providerStore.all().find((p) => p.code === providerCode);
  const n = Math.max(prov?.branchCount ?? 0, branches.filter((b) => b.provider.code === providerCode).length) + 1;
  let code = `${prefix}-${districtCode(district)}-${String(n).padStart(3, "0")}`;
  let k = n;
  while (branches.some((b) => b.code === code)) code = `${prefix}-${districtCode(district)}-${String(++k).padStart(3, "0")}`;
  return code;
}

// ───────────── خيارات نافذة «اختر مقدّم الخدمة» (CON5-08M 3114:59692) ─────────────
export type ProviderOption = { id: string; code: string; name: string; line: string; city: string; type: Provider["type"]; label: string };
const branchSummary = (p: Provider) => {
  const mine = branches.filter((b) => b.provider.id === p.id);
  const kind = p.type === "care" ? "مركز عناية" : "مغسلة";
  if (p.id === "lk-jn-001") return `${p.approvedBranches} فروع معتمدة · ${p.pendingBranches} بانتظار الزيارة · ${kind}`;
  if (p.status === "new" && mine.length === 1) return `فرع واحد (${mine[0].district}) · معتمد جديد · ${kind}`;
  if (p.status === "pending-visit") return `${p.pendingBranches === 2 ? "فرعان" : p.pendingBranches === 1 ? "فرع" : `${p.pendingBranches} فروع`} بانتظار الزيارة · ${kind}`;
  const parts = [p.approvedBranches ? `${p.approvedBranches} ${p.approvedBranches === 1 ? "فرع معتمد" : p.approvedBranches === 2 ? "فرعان معتمدان" : "فروع معتمدة"}` : "", p.pendingBranches ? `${p.pendingBranches} بانتظار الزيارة` : ""].filter(Boolean);
  return `${parts.join(" · ") || "بدون فروع"} · ${kind}`;
};

// ───────────── الـAPI ─────────────
const usedFor = (b: Branch) => b.provider.label;

export const branchesApi = {
  /** CON5-08X أداء الفرع والمستحقات — متاح لفروع جونسون المعتمدة في البيانات التجريبية؛ غيرها 404 */
  performance: async (id: string): Promise<{ branch: Branch; perf: BranchPerformance; providerName: string }> => {
    const b = find(id);
    const perf = PERFORMANCE[id];
    if (!perf) throw new ApiError(404, "no performance");
    return delay({ branch: clone(b), perf: clone(perf), providerName: providerStore.find(b.provider.id)?.name ?? b.provider.label });
  },
  list: async (q: BranchQuery = {}): Promise<ListResult<Branch, BranchTab>> => {
    const tab = q.tab ?? "all";
    const s = q.q?.trim() ? norm(q.q.trim()) : "";
    const items = sortList(
      branches
        .filter((b) => tabOf(b, tab))
        .filter((b) => !q.provider || b.provider.id === q.provider)
        .filter((b) => !s || norm(b.name).includes(s) || norm(b.code).includes(s) || norm(usedFor(b)).includes(s)),
    );
    return delay({ items: clone(items), total: items.length, counts: q.provider ? rawCounts(branches.filter((b) => b.provider.id === q.provider)) : counts() });
  },
  kpis: async (): Promise<BranchKpis> => {
    const c = counts();
    const pending = sortList(branches.filter((b) => tabOf(b, "pending-visit")));
    const providersWithBranches = new Set(branches.filter((b) => b.status === "approved" || b.status === "new").map((b) => b.provider.id)).size;
    const seedProviders = new Set(SEED.filter((b) => b.status === "approved" || b.status === "new").map((b) => b.provider.id)).size;
    return delay(
      {
        approved: c.approved + c.new,
        providers: 21 - seedProviders + providersWithBranches,
        newApproved: c.new,
        tiers: [FIGMA_TIERS.platinum - seedTiers.platinum + tierCount(branches, "platinum"), FIGMA_TIERS.gold - seedTiers.gold + tierCount(branches, "gold"), FIGMA_TIERS.silver - seedTiers.silver + tierCount(branches, "silver")],
        pending: c["pending-visit"],
        pendingNames: pending.map((b) => b.district.replace(/ الشمالية$/, "")).join(" · "),
        periodic: 6,
        periodicNext: "2026-12-30",
      },
      250,
    );
  },
  get: async (id: string) => delay(clone(find(id)), 200),
  /** نافذة «اختر مقدّم الخدمة»: بحث بالاسم أو الكود */
  providerOptions: async (q = ""): Promise<ProviderOption[]> => {
    const s = norm(q.trim());
    const list = providerStore
      .all()
      .filter((p) => p.status !== "suspended")
      .filter((p) => !s || norm(p.name).includes(s) || norm(p.code).includes(s) || norm(p.short ?? "").includes(s))
      .map((p) => ({ id: p.id, code: p.code, name: p.name, line: branchSummary(p), city: p.city, type: p.type, label: p.short ?? p.name }));
    // من غير بحث: المنشآت اللي لسه بتكمّل فروعها (معتمد جديد ثم بانتظار الزيارة) — CON5-08M 3114-59692
    const onboarding = (id: string) => providerStore.find(id)?.status;
    const rank = (id: string) => (onboarding(id) === "new" ? 0 : 1);
    return delay(s ? list : list.filter((o) => o.type === "care" && ["new", "pending-visit"].includes(onboarding(o.id) ?? "")).sort((a, b) => rank(a.id) - rank(b.id)), 150);
  },
  /** بيانات صفحة «إضافة فرع» (CON5-08N): المنشأة + كود مقترح + خدمات المنشأة */
  draft: async (providerId: string, district: string) => {
    const p = providerStore.find(providerId);
    if (!p) throw new ApiError(404, "not found");
    const mine = branches.filter((b) => b.provider.id === providerId);
    const services = [...new Set(mine.flatMap((b) => b.services.map((s) => s.type)).filter((s) => SERVICE_CRITERIA[s]))];
    return delay({ provider: { ...providerRef(p), city: p.city, name: p.name }, code: nextCode(p.code, district), services: services.length ? services : ["التلميع", "الغسيل"], hasMain: mine.some((b) => b.main) }, 120);
  },
  create: async (v: NewBranchInput) => {
    const p = providerStore.find(v.providerId);
    if (!p) throw new ApiError(404, "not found");
    if (branches.some((b) => b.code === v.code)) throw new ApiError(422, "code", { code: "هذا الكود مستخدم لفرع آخر" });
    const b = { ...makeBranch(v, providerRef(p)), status: "request" as const };
    if (v.main) branches.forEach((x) => x.provider.id === p.id && (x.main = false));
    branches = [...branches, b];
    syncProvider(p.id, { pending: 1 });
    return delay({ id: b.id, code: b.code, name: b.name, provider: providerRef(p).label, visit: dayLabel(v.visitAt) });
  },
  /** CON5-08M «اعتماد ونشر بدون زيارة» (3114-61688) */
  approvePublish: async (id: string, v: { rating: number; tier: Tier; review: string; scope: string[] }) => {
    const b = find(id);
    const wasPending = b.status === "pending-visit" || b.status === "request";
    Object.assign(b, {
      status: "new",
      tier: v.tier,
      reserved: false,
      linkarRating: v.rating,
      lastReview: TODAY,
      nextReview: null,
      visitAt: undefined,
      statusLine: `اعتماد بدون زيارة · زيارة تحقّق خلال 60 يوماً`,
      note: `اعتُمد ونُشر بدون زيارة (${TIER_LABEL[v.tier]} · ★${v.rating}). زيارة تحقّق خلال 60 يوماً وتراجع الفئة بعدها، ويحل تقييم العملاء محل المبدئي بعد 5 تقييمات.`,
      services: b.services.map((s) => ({ ...s, state: "approved" as const })),
      visits: [...b.visits.filter((x) => !x[0].startsWith("زيارة ميدانية مجدولة")), [`اعتماد ونشر بدون زيارة · ${TIER_LABEL[v.tier]} · ★${v.rating}`, dayLabel(TODAY)], ["زيارة تحقّق · خلال 60 يوماً", "—"]],
    });
    if (wasPending) syncProvider(b.provider.id, { pending: -1, approved: 1 });
    return delay({ ok: true });
  },
  update: async (id: string, v: { manager: string; managerPhone: string; hours: string; technicians: string; slots: string }) => {
    const b = find(id);
    Object.assign(b, v);
    return delay({ ok: true });
  },
  addServiceType: async (id: string, v: { type: string; from: string; to: string; assessor: string; visitAt: string }) => {
    const b = find(id);
    b.services = [...b.services.filter((s) => s.type !== v.type), { type: v.type, duration: `${v.from} – ${v.to}`, state: "pending" }];
    b.visits = [...b.visits, [`زيارة موديول ${v.type} · ${v.assessor}`, dayLabel(v.visitAt)]];
    return delay({ ok: true });
  },
  requestDocument: async (id: string, v: { document: string; days: number }) => {
    const b = find(id);
    b.visits = [...b.visits, [`طلب مستند · ${v.document}`, dayLabel(TODAY)]];
    return delay({ ok: true });
  },
  pause: async (id: string, v: { reason: string; from: string; until: string; transfer: boolean }) => {
    const b = find(id);
    b.pausedUntil = v.until;
    b.statusLine = `موقوف مؤقتاً حتى ${dayLabel(v.until)} · ${v.reason}`;
    const moved = v.transfer ? b.transferable : 0;
    if (v.transfer) b.activeBookings = 0;
    return delay({ ok: true, moved });
  },
  /** «إيقاف الفرع» من الدرج (CON5-08M 3114:55503) */
  suspend: async (id: string, v: { reason: string; vouchers: string; until: string; message: string }) => {
    const b = find(id);
    b.statusLine = `موقوف · ${v.until}`;
    b.activeBookings = 0;
    return delay({ ok: true });
  },
  disable: async (id: string, v: { reason: string }) => {
    const b = find(id);
    b.disabled = true;
    b.statusLine = `معطّل · ${v.reason}`;
    return delay({ ok: true });
  },
  surpriseVisit: async (id: string, v: { assessor: string; date: string; template: string }) => {
    const b = find(id);
    b.visits = [...b.visits, [`زيارة مفاجئة · مجدولة · ${v.assessor}`, dayLabel(v.date)]];
    return delay({ ok: true });
  },
  reschedule: async (id: string, v: { assessor: string; visitAt: string; reason: string }) => {
    const b = find(id);
    b.visitAt = v.visitAt;
    b.assessor = v.assessor;
    b.visits = b.visits.map((x) => (x[0].startsWith("زيارة ميدانية مجدولة") ? [`زيارة ميدانية مجدولة · ${v.assessor} · ${slotLabel(v.visitAt).split(" · ")[1]}`, dayLabel(v.visitAt)] : x));
    if (b.status === "request") b.status = "pending-visit";
    return delay({ ok: true });
  },
  secondVisit: async (id: string, v: { assessor: string; visitAt: string; fixed: boolean }) => {
    const b = find(id);
    Object.assign(b, { status: "pending-visit", visitAt: v.visitAt, assessor: v.assessor, statusLine: undefined, result: undefined });
    b.services = b.services.map((s) => ({ ...s, state: "pending" as const }));
    b.visits = [...b.visits.filter((x) => !x[0].startsWith("يمكن طلب")), [`زيارة ثانية مجدولة · ${v.assessor} · ${slotLabel(v.visitAt).split(" · ")[1]}`, dayLabel(v.visitAt)]];
    syncProvider(b.provider.id, { pending: 0 });
    return delay({ ok: true });
  },
  /** حذف الفرع (معتمد بلا حجوزات / مرفوض) أو حذف الطلب (بانتظار الزيارة) */
  remove: async (id: string, v: { reason?: string } = {}) => {
    void v;
    const b = find(id);
    if (b.activeBookings > 0) throw new ApiError(409, "has bookings");
    branches = branches.filter((x) => x.id !== id);
    const pending = b.status === "pending-visit" || b.status === "request";
    syncProvider(b.provider.id, pending ? { pending: -1 } : b.status === "rejected" ? {} : { approved: -1 });
    return delay({ ok: true });
  },
  bulkMessage: async (v: { ids: string[]; recipients: string[]; channels: string[]; template: string; body: string; link: string; when: string }) => {
    const picked = branches.filter((b) => v.ids.includes(b.id));
    const owners = new Set(picked.map((b) => b.provider.id)).size;
    const managers = v.recipients.includes("مدير الفرع") ? picked.length : 0;
    const ownerCount = v.recipients.includes("المالك") ? owners : 0;
    const techs = v.recipients.includes("فني الفرع") ? picked.length : 0;
    return delay({ ok: true, branches: picked.length, managers, owners: ownerCount, techs, total: managers + ownerCount + techs });
  },
};

// ───────────── CON5-08X · أداء الفرع والمستحقات (الزهراء 3114:60556 · الحمراء 3114:60914 · المحمدية 3114:61283) ─────────────
export type PerfService = { name: string; cost: string; sale: string; margin: string; bookings: number; status: string; paused?: boolean };
export type PerfOffer = { name: string; kind: string; cost: string; sale: string; status: string; tone: "success" | "info" };
export type PerfBooking = { code: string; customer: string; service: string; reason: string; date: string; status: string };
export interface BranchPerformance {
  kpis: { today: number; todayCost: number; month: number; sales: number; cost: number; rating: number; reviews: number; complaints: number; unpaid: number; payout: string };
  services: PerfService[];
  serviceNote?: string;
  offers: PerfOffer[];
  bookings: PerfBooking[];
  dues: [string, string][];
  complaintNote: { tone: "success" | "danger"; text: string };
  reviews: [string, string][];
}
const JN_OFFERS: PerfOffer[] = [
  { name: "باقة العناية الكاملة", kind: "باقة · لينكار باتفاق مع جونسون", cost: "1,240 · 1,400 · 1,600", sale: "1,499 · 1,699 · 1,949", status: "نشطة", tone: "success" },
  { name: "باقة النانو والتلميع", kind: "باقة · لينكار باتفاق مع جونسون", cost: "1,520 · 1,760 · 1,990", sale: "1,899 · 2,199 · 2,499", status: "نشطة", tone: "success" },
  { name: "خصم 10% تفصيل داخلي كامل", kind: "عرض · باتفاق: تكلفة أقل", cost: "320 · 400 · 470", sale: "404 · 494 · 584", status: "مجدول · 15 – 31 أكتوبر 2026", tone: "success" },
  { name: "عرض الشتاء · خصم 10% نانو", kind: "عرض · من هامش لينكار", cost: "بدون تغيير", sale: "1,709 · 1,979 · 2,249", status: "مجدول 1 نوفمبر 2026", tone: "info" },
];
const jnServices = (b: [number, number, number, number, number, number], pausedWash?: boolean): PerfService[] => [
  { name: "Johnson Ceramic Pro", cost: "1,520 · 1,760 · 1,990", sale: "1,899 · 2,199 · 2,499", margin: "20%", bookings: b[0], status: "منشورة" },
  { name: "طبقة طاردة للماء + تلميع", cost: "1,080 · 1,240 · 1,400", sale: "1,299 · 1,499 · 1,699", margin: "17%", bookings: b[1], status: "منشورة" },
  { name: "تفصيل داخلي كامل", cost: "360 · 440 · 520", sale: "449 · 549 · 649", margin: "20%", bookings: b[2], status: "منشورة" },
  { name: "‏PPF للواجهة + نانو سيراميك", cost: "2,780 · 3,200 · 3,620", sale: "3,299 · 3,799 · 4,299", margin: "16%", bookings: b[3], status: "منشورة" },
  { name: "تلميع ثلاث مراحل", cost: "280 · 320 · 360", sale: "داخل الباقات فقط", margin: "20%", bookings: b[4], status: "منشورة" },
  { name: "غسيل وتلميع سريع", cost: "120 · 145 · 160", sale: "149 · 179 · 199", margin: "19%", bookings: b[5], status: pausedWash ? "موقوفة في الفرع حتى 31 أكتوبر 2026" : "منشورة", paused: pausedWash },
];
const PERFORMANCE: Record<string, BranchPerformance> = {
  "lk-jn-zh-001": {
    kpis: { today: 2, todayCost: 1960, month: 52, sales: 80230, cost: 64180, rating: 4.9, reviews: 142, complaints: 0, unpaid: 64180, payout: "2026-11-01" },
    services: jnServices([301, 176, 231, 58, 118, 86]),
    serviceNote: "‏REQ-0421 · طلب إيقاف في الزهراء حتى 31 أكتوبر 2026",
    offers: JN_OFFERS,
    bookings: [
      { code: "BK-21475", customer: "ريم س.", service: "‏Johnson Ceramic Pro · سيدان", reason: "تعذّر من الفرع · نفاد المادة · REQ-0417", date: "14 أكتوبر 2026", status: "لدى لينكار" },
      { code: "BK-21209", customer: "العنود س.", service: "طبقة طاردة للماء + تلميع · سيدان", reason: "تعذّر من الفرع · حُوِّل للحمراء", date: "3 سبتمبر 2026", status: "مسترد" },
    ],
    dues: [
      ["أكتوبر حتى الآن", "52 حجزاً · 64,180 ر.س · لم يُحوَّل"],
      ["اليوم", "2 · 1,960 ر.س"],
      ["سبتمبر", "121 حجزاً · 148,620 ر.س · حُوِّل ضمن TRF-2026-10-0062"],
      ["حساب الاستلام", `الراجحي ${ltr("•••• 4471")} · الافتراضي`],
    ],
    complaintNote: { tone: "success", text: "لا شكاوى مفتوحة · آخر شكوى أُغلقت 27 سبتمبر 2026 · CM-3301" },
    reviews: [
      ["‏BK-21419 · نوف ر.", "★ 5 · «شغل نظيف والتسليم في الوقت»"],
      ["‏BK-21417 · ناصر ع.", "★ 5 · «النانو ممتاز»"],
      ["‏BK-21447 · لمى ع.", "★ 5 · «الباقة تستاهل»"],
    ],
  },
  "lk-jn-hm-002": {
    kpis: { today: 3, todayCost: 3200, month: 38, sales: 57890, cost: 46310, rating: 4.9, reviews: 98, complaints: 1, unpaid: 46310, payout: "2026-11-01" },
    services: jnServices([213, 139, 188, 41, 96, 0], true),
    offers: JN_OFFERS,
    bookings: [
      { code: "BK-21441", customer: "نهى ر.", service: "‏Johnson Ceramic Pro · سيدان", reason: "ألغته لينكار · تأخّر رد الفرع 26 ساعة · استرداد كامل", date: "11 أكتوبر 2026", status: "مسترد" },
      { code: "BK-21384", customer: "عادل ش.", service: "غسيل وتلميع سريع · سيدان", reason: "تعذّر من الفرع · نقص الفنيين · حُوِّل للزهراء", date: "1 أكتوبر 2026", status: "تم التحويل" },
      { code: "BK-21471", customer: "ماجد ك.", service: "طبقة طاردة للماء + تلميع · سيدان", reason: "ألغاه العميل · تغيّرت خطته (ليس اعتذاراً)", date: "13 أكتوبر 2026", status: "مسترد" },
    ],
    dues: [
      ["أكتوبر حتى الآن", "38 حجزاً · 46,310 ر.س · لم يُحوَّل"],
      ["اليوم", "3 · 3,200 ر.س"],
      ["سبتمبر", "104 حجزاً · 121,480 ر.س · حُوِّل ضمن TRF-2026-10-0062"],
      ["حساب الاستلام", `الراجحي ${ltr("•••• 4471")} · الافتراضي`],
    ],
    complaintNote: { tone: "danger", text: "‏CM-3352 · BK-21438 · فهد م. · «انتظرت ساعتين بعد الموعد دون أي إشعار» · مفتوحة" },
    reviews: [
      ["‏BK-21412 · وليد ش.", "★ 5 · «أفضل نانو جربته»"],
      ["‏BK-21438 · فهد م.", "★ 4 · مع شكوى CM-3352"],
      ["‏BK-21436 · راكان م.", "★ 5 · «احترافية»"],
    ],
  },
  "lk-jn-mh-003": {
    kpis: { today: 1, todayCost: 1400, month: 33, sales: 54310, cost: 43450, rating: 4.8, reviews: 80, complaints: 1, unpaid: 43450, payout: "2026-11-01" },
    services: jnServices([224, 128, 171, 49, 81, 126]),
    offers: JN_OFFERS,
    bookings: [{ code: "BK-21331", customer: "غادة ي.", service: "‏PPF للواجهة + نانو سيراميك · سيدان", reason: "تعذّر من الفرع · المادة غير متوفرة · مسترد", date: "23 سبتمبر 2026", status: "مسترد" }],
    dues: [
      ["أكتوبر حتى الآن", "33 حجزاً · 43,450 ر.س · لم يُحوَّل"],
      ["اليوم", "1 · 1,400 ر.س"],
      ["سبتمبر", "109 حجزاً · 140,130 ر.س · حُوِّل ضمن TRF-2026-10-0062"],
      ["حساب الاستلام", "الراجحي •••• 4471 · محفظة STC Pay قيد التحقق (REQ-0435)"],
    ],
    complaintNote: { tone: "danger", text: "‏CM-3349 · BK-21426 · أحمد ز. · فقاعات في الغطاء الأمامي · قيد النظر · خصم مقترح 500 ر.س" },
    reviews: [
      ["‏BK-21459 · سعود ب.", "★ 3 · الرد بانتظار الاعتماد"],
      ["‏BK-21426 · أحمد ز.", "★ 4 · مع شكوى CM-3349"],
      ["‏BK-21432 · ريان هـ.", "★ 5 · «PPF ممتاز»"],
    ],
  },
};
