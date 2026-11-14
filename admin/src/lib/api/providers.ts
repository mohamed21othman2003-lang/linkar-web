// مقدّمو الخدمة (القسم 7 و 8) — بيانات تجريبية بنفس شكل الخادم المتوقع.
// المصدر: إطارات Figma CON5-07 / 07D / 07A / 07M / 07N (صفحة 3114:412، قسم «v5 · 07 · مقدّمو الخدمة»).
import { ltr, ltrRuns } from "../format";
import { ApiError, delay } from "./errors";
import type { ListResult } from "./users";

// ───────────── القوائم (القسم 17 + CON5-07P) ─────────────
export const CITIES = ["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"] as const;
export const TIERS = [
  { value: "platinum", label: "بلاتيني" },
  { value: "gold", label: "ذهبي" },
  { value: "silver", label: "فضي" },
] as const;
export type Tier = (typeof TIERS)[number]["value"];
export const RATINGS = [
  { value: "4.5", label: "4.5 فأكثر" },
  { value: "4", label: "4 فأكثر" },
  { value: "lt4", label: "أقل من 4" },
] as const;
export const SORTS = [
  { value: "top-selling", label: "الأعلى مبيعاً" },
  { value: "most-bookings", label: "الأكثر حجوزات" },
  { value: "top-rated", label: "الأعلى تقييماً" },
  { value: "newest", label: "الأحدث انضماماً" },
] as const;
export type ProviderSort = (typeof SORTS)[number]["value"];

export const PROVIDER_TABS = ["all", "care", "wash", "pending-visit", "suspended"] as const;
export type ProviderTab = (typeof PROVIDER_TABS)[number];

/** أنواع الخدمات (القسم 17 «إضافة خدمة · التصنيف») */
export const SERVICE_TYPES = ["الغسيل والتنظيف", "التلميع", "نانو سيراميك", "حماية PPF", "التظليل", "تغيير اللون"] as const;
export const BANKS = ["مصرف الإنماء", "مصرف الراجحي", "البنك الأهلي السعودي", "بنك الرياض", "البنك السعودي الفرنسي", "بنك البلاد", "بنك الجزيرة", "البنك العربي الوطني", "بنك ساب"] as const;
export const DISTRICTS: Record<string, string[]> = {
  الرياض: ["النرجس", "العارض", "الملقا", "العليا", "الياسمين", "الروضة", "السلامة", "الصحافة", "حطين", "السامر"],
  جدة: ["الزهراء", "الحمراء", "المحمدية", "الروضة", "السلامة", "النسيم", "الصفا", "الشاطئ", "التحلية"],
  الدمام: ["الشاطئ", "الفيصلية", "النور", "الريان"],
  "مكة المكرمة": ["العزيزية", "الشوقية", "النسيم"],
  الخبر: ["العقربية", "الثقبة", "الراكة"],
};
export const HOURS = [
  "السبت – الخميس · 9 ص – 11 م · الجمعة 4 م – 11 م",
  "السبت – الخميس · 10 ص – 10 م",
  "السبت – الخميس · 8 ص – 10 م",
  "يومياً · 24 ساعة",
] as const;
export const TIER_LABEL: Record<Tier, string> = { platinum: "بلاتيني", gold: "ذهبي", silver: "فضي" };
export const SUSPEND_REASONS = ["مستندات منتهية", "شكاوى متكررة", "طلب المنشأة", "متأخرات مالية"] as const;

// ───────────── الأنواع ─────────────
export type ProviderType = "care" | "wash";
export type ProviderStatus = "approved" | "new" | "pending-visit" | "suspended";
/** قائمة الإجراءات (CON5-07A) تختلف حسب حالة المنشأة */
export type ProviderMenu = "full" | "cost" | "new" | "pending-schedule" | "pending-match" | "suspended";
export type ValueTone = "success" | "danger" | "warning";

export type DrawerBlock =
  | { kind: "hero" }
  | { kind: "stats"; items: [string, string][] }
  | { kind: "note"; tone: "info" | "warning" | "danger"; text: string }
  | { kind: "tile"; title: string; rows?: [string, string, ValueTone?][]; text?: string };

export interface ProviderDrawer {
  subtitle: string;
  heroLine?: string;
  pill?: { label: string; tone: "success" | "pending" | "danger" };
  blocks: DrawerBlock[];
  footer: "active" | "active-full" | "new" | "suspended" | "pending" | "none";
  /** زر «ملف فرع …» للمنشأة الجديدة */
  branchLabel?: string;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  /** الاسم المختصر في رسائل التأكيد («مركز الواحة») */
  short?: string;
  type: ProviderType;
  city: string;
  status: ProviderStatus;
  menu: ProviderMenu;
  branchesLine: string;
  branchCount: number;
  approvedBranches: number;
  pendingBranches: number;
  tiers: Tier[];
  services: number | null;
  bookings2026: number | null;
  monthBookings: number;
  rating: number | null;
  ratingCount: number | null;
  /** السطر تحت شارة «بانتظار الزيارة الميدانية» */
  visitLine?: string;
  /** حجوزات قائمة بقسائم سارية — تمنع الحذف */
  activeBookings: number;
  rank: number;
  joinedAt: string;
  company: CompanyData;
  drawer: ProviderDrawer;
  suspendedUntil?: string;
  disabled?: boolean;
}

export interface CompanyData {
  legalName: string;
  brand: string;
  vat: string;
  cr: string;
  owner: string;
  kind: string;
  bank: string;
  contact: string;
}

export type ProviderQuery = { tab?: ProviderTab; city?: string; tier?: string; rating?: string; sort?: ProviderSort; q?: string };
export type ProviderKpis = { approvedProviders: number; approvedBranches: number; pendingVisit: number; rating: number };

// ───────────── البيانات (CON5-07 3114:48542 وتبويباته + أدراج CON5-07D) ─────────────
const active = (city: string, line: string): Pick<ProviderDrawer, "subtitle" | "heroLine" | "pill"> => ({
  subtitle: `${city} · مركز نشط`,
  heroLine: `${city} · ${line}`,
  pill: { label: "نشط", tone: "success" },
});
const contact = (v: string): DrawerBlock => ({ kind: "tile", title: "مسؤول التواصل مع لينكار", text: ltrRuns(v) });
const network = (branches: string, services: string, types: string): DrawerBlock => ({
  kind: "tile",
  title: "الشبكة والخدمات",
  rows: [
    ["الفروع", branches],
    ["الخدمات", services],
    ["أنواع الخدمات المسعّرة", types],
  ],
});
const docs = (v: string, tone?: ValueTone): DrawerBlock => ({ kind: "tile", title: "المستندات والشهادات", rows: [["الحالة", v, tone]] });
const stats = (complaints: number, rating: number, done: number, month: number): DrawerBlock => ({
  kind: "stats",
  items: [
    [String(month), "حجوزات الشهر"],
    [String(done), "مكتملة"],
    [`★ ${rating.toFixed(1)}`, "التقييم"],
    [String(complaints), "شكاوى مفتوحة"],
  ],
});
const company = (c: Partial<CompanyData> & { brand: string }): CompanyData => ({
  legalName: `شركة ${c.brand}`,
  vat: "310000000000003",
  cr: "1010000000",
  owner: "—",
  kind: "مركز عناية · عدة فروع",
  bank: "—",
  contact: "—",
  ...c,
});

const SEED: Provider[] = [
  {
    id: "lk-jn-001",
    code: "LK-JN-001",
    name: "جونسون Johnson",
    short: "جونسون",
    type: "care",
    city: "جدة",
    status: "approved",
    menu: "full",
    branchesLine: "3 فروع: الزهراء ذهبي · الحمراء ذهبي · المحمدية ذهبي · +1 بانتظار الزيارة",
    branchCount: 4,
    approvedBranches: 3,
    pendingBranches: 1,
    tiers: ["gold"],
    services: 6,
    bookings2026: 2426,
    monthBookings: 139,
    rating: 4.9,
    ratingCount: 320,
    activeBookings: 53,
    rank: 1,
    joinedAt: "2026-02-10",
    company: company({
      legalName: "شركة جونسون للعناية بالسيارات",
      brand: "جونسون Johnson",
      vat: "311245678900003",
      cr: "4030412233",
      owner: "فهد العتيبي · 055 410 2290",
      bank: "الراجحي •••• 4471",
      contact: "خالد الزهراني · 055 318 2207",
    }),
    // CON5-07D · جونسون Johnson (3114-48736)
    drawer: {
      subtitle: "جدة",
      heroLine: "جدة · نانو سيراميك · حماية PPF · التلميع · الغسيل",
      blocks: [
        { kind: "hero" },
        stats(2, 4.9, 123, 139),
        { kind: "note", tone: "warning", text: "شكوى CM-3349 لدى لينكار · مستندات الفروع سارية" },
        network("3 فروع + أبحر الشمالية قيد النظر", "5 منشورة · 1 داخل الباقات", "نانو سيراميك · حماية PPF · التلميع · الغسيل"),
        { kind: "tile", title: "المستندات والشهادات", rows: [["الحالة", "سارية"]] },
      ],
      footer: "active-full",
    },
  },
  {
    id: "lk-lm-001",
    code: "LK-LM-001",
    name: "لومار LLumar",
    type: "care",
    city: "الرياض",
    status: "approved",
    menu: "cost",
    branchesLine: "5 فروع: الروضة بلاتيني · الياسمين بلاتيني · +3 أخرى",
    branchCount: 5,
    approvedBranches: 5,
    pendingBranches: 0,
    tiers: ["platinum"],
    services: 7,
    bookings2026: null,
    monthBookings: 88,
    rating: 4.8,
    ratingCount: 365,
    activeBookings: 21,
    rank: 2,
    joinedAt: "2026-03-02",
    company: company({ brand: "لومار LLumar", legalName: "شركة لومار العربية", contact: "هشام القرشي · 054 661 0932" }),
    // CON5-07D · لومار LLumar (3114-48866)
    drawer: {
      ...active("الرياض", "التظليل · حماية PPF"),
      blocks: [
        { kind: "hero" },
        stats(0, 4.8, 45, 88),
        { kind: "note", tone: "warning", text: "تأمين المسؤولية ينتهي 28 أكتوبر 2026" },
        network("5 فروع · الرياض 3 · الدمام 2", "7 منشورة", "التظليل · حماية PPF"),
        docs("مستند ينتهي خلال 14 يوماً", "warning"),
        contact("هشام القرشي · 054 661 0932"),
      ],
      footer: "active",
    },
  },
  {
    id: "lk-xp-001",
    code: "LK-XP-001",
    name: "XPEL السعودية",
    short: "XPEL",
    type: "care",
    city: "الرياض",
    status: "approved",
    menu: "cost",
    branchesLine: "6 فروع: العليا بلاتيني · الملقا بلاتيني · +4 أخرى",
    branchCount: 6,
    approvedBranches: 6,
    pendingBranches: 0,
    tiers: ["platinum"],
    services: 9,
    bookings2026: null,
    monthBookings: 214,
    rating: 4.8,
    ratingCount: 1240,
    activeBookings: 37,
    rank: 3,
    joinedAt: "2026-01-20",
    company: company({ brand: "XPEL السعودية", legalName: "شركة إكسبل السعودية", contact: "تركي العتيبي · 050 112 4455" }),
    // CON5-07D · XPEL السعودية (3114-48672)
    drawer: {
      ...active("الرياض", "حماية PPF · التظليل · نانو سيراميك"),
      blocks: [
        { kind: "hero" },
        stats(0, 4.8, 108, 214),
        { kind: "note", tone: "info", text: "تعديل الشعار CH-0141 بانتظار الاعتماد" },
        network("6 فروع · الرياض 4 · جدة 2", "9 منشورة", "حماية PPF · التظليل · نانو سيراميك"),
        docs("7 مستندات سارية", "success"),
        contact("تركي العتيبي · 050 112 4455"),
      ],
      footer: "active",
    },
  },
  {
    id: "lk-ns-001",
    code: "LK-NS-001",
    name: "نانو شيلد",
    type: "care",
    city: "جدة",
    status: "approved",
    menu: "cost",
    branchesLine: "4 فروع: الروضة ذهبي · السلامة ذهبي · +2 أخرى",
    branchCount: 4,
    approvedBranches: 4,
    pendingBranches: 0,
    tiers: ["gold"],
    services: 5,
    bookings2026: null,
    monthBookings: 96,
    rating: 4.7,
    ratingCount: 410,
    activeBookings: 14,
    rank: 4,
    joinedAt: "2026-04-11",
    company: company({ brand: "نانو شيلد", legalName: "مؤسسة نانو شيلد لحماية السيارات", contact: "رامي الشهري · 055 340 2211" }),
    // CON5-07D · نانو شيلد (3114-48802)
    drawer: {
      ...active("جدة", "نانو سيراميك · التلميع"),
      blocks: [
        { kind: "hero" },
        stats(0, 4.7, 49, 96),
        { kind: "note", tone: "danger", text: "شهادة Nano Shield 9H انتهت 10 أكتوبر 2026 · التجديد REQ-2026-0441 قيد النظر" },
        network("4 فروع · جدة", "4 منشورة · 1 مخفية حتى تجديد الشهادة", "نانو سيراميك · التلميع"),
        docs("شهادة منتج منتهية", "danger"),
        contact("رامي الشهري · 055 340 2211"),
      ],
      footer: "active",
    },
  },
  {
    id: "lk-la-001",
    code: "LK-LA-001",
    name: "مركز لمعة للتلميع",
    type: "care",
    city: "الرياض",
    status: "approved",
    menu: "cost",
    branchesLine: "3 فروع: السلامة فضي · +2 أخرى",
    branchCount: 3,
    approvedBranches: 3,
    pendingBranches: 0,
    tiers: ["silver"],
    services: 5,
    bookings2026: null,
    monthBookings: 61,
    rating: 4.7,
    ratingCount: 276,
    activeBookings: 9,
    rank: 5,
    joinedAt: "2026-05-03",
    company: company({ brand: "مركز لمعة للتلميع", legalName: "مؤسسة لمعة للتلميع", contact: "سامي الحربي · 053 908 3321" }),
    // CON5-07D · مركز لمعة للتلميع (3114-48994)
    drawer: {
      ...active("الرياض", "التلميع · الغسيل"),
      blocks: [
        { kind: "hero" },
        stats(1, 4.7, 31, 61),
        { kind: "note", tone: "info", text: "CM-3340 · اقترح المركز إعادة التلميع · بانتظار رد العميل" },
        network("3 فروع · الرياض", "5 منشورة", "التلميع · الغسيل"),
        docs("6 مستندات سارية", "success"),
        contact("سامي الحربي · 053 908 3321"),
      ],
      footer: "active",
    },
  },
  {
    id: "lk-dr-001",
    code: "LK-DR-001",
    name: "مركز درع للحماية",
    type: "care",
    city: "جدة",
    status: "approved",
    menu: "cost",
    branchesLine: "2 فروع: النسيم ذهبي · +1 أخرى",
    branchCount: 2,
    approvedBranches: 2,
    pendingBranches: 0,
    tiers: ["gold"],
    services: 4,
    bookings2026: null,
    monthBookings: 57,
    rating: 4.8,
    ratingCount: 142,
    activeBookings: 6,
    rank: 6,
    joinedAt: "2026-05-28",
    company: company({ brand: "مركز درع للحماية", legalName: "مؤسسة درع لحماية السيارات", contact: "نايف الغامدي · 050 448 9012" }),
    // CON5-07D · مركز درع للحماية (3114-49058)
    drawer: {
      ...active("جدة", "حماية PPF · نانو سيراميك"),
      blocks: [
        { kind: "hero" },
        stats(0, 4.8, 29, 57),
        network("فرعان · جدة", "4 منشورة", "حماية PPF · نانو سيراميك"),
        docs("5 مستندات سارية", "success"),
        contact("نايف الغامدي · 050 448 9012"),
      ],
      footer: "active",
    },
  },
  {
    id: "lk-nd-001",
    code: "LK-ND-001",
    name: "مغسلة الندى",
    type: "wash",
    city: "جدة",
    status: "pending-visit",
    menu: "pending-schedule",
    branchesLine: "1 فرع: الصفا بانتظار الزيارة",
    branchCount: 1,
    approvedBranches: 0,
    pendingBranches: 1,
    tiers: [],
    services: null,
    bookings2026: null,
    monthBookings: 0,
    rating: null,
    ratingCount: null,
    visitLine: "الزيارة 22 أكتوبر 2026",
    activeBookings: 0,
    rank: 7,
    joinedAt: "2026-10-12",
    company: company({ brand: "مغسلة الندى", legalName: "مؤسسة الندى لغسيل السيارات", vat: "310998812400003", cr: "4030587712", owner: "عبدالعزيز ن. · 056 220 4418", kind: "مغسلة سيارات · فرع واحد" }),
    // CON5-07D · مغسلة الندى (3312-205476)
    drawer: {
      subtitle: "LK-ND-001 · بانتظار الزيارة الميدانية",
      blocks: [
        {
          kind: "tile",
          title: "المنشأة",
          rows: [
            ["النوع", "مغسلة سيارات · فرع واحد"],
            ["الاسم القانوني", "مؤسسة الندى لغسيل السيارات"],
            ["السجل التجاري", "4030587712"],
            ["الرقم الضريبي", "310998812400003"],
            ["الكود", "LK-ND-001 · الفرع LK-ND-SF-001"],
          ],
        },
        { kind: "tile", title: "المالك", rows: [["الاسم · الجوال", "عبدالعزيز ن. · 056 220 4418"]] },
        {
          kind: "tile",
          title: "بيانات الغسيل",
          rows: [
            ["نوع الغسيل", "آلي ويدوي"],
            ["موقع الغسيل", "داخل المغسلة"],
            ["فتحات الغسيل", "4 · أماكن التجفيف 3 · مواقف الانتظار 6"],
            ["الخدمات", "غسيل خارجي · غسيل شامل · تلميع سريع"],
          ],
        },
        {
          kind: "tile",
          title: "الزيارة الميدانية",
          rows: [
            ["الموعد", "22 أكتوبر 2026"],
            ["المقيّم", "ماجد ف. · فريق الجودة"],
          ],
        },
      ],
      footer: "none",
    },
  },
  {
    id: "lk-rm-001",
    code: "LK-RM-001",
    name: "مركز الريم",
    type: "care",
    city: "الرياض",
    status: "new",
    menu: "new",
    branchesLine: "1 فرع: السامر فضي",
    branchCount: 1,
    approvedBranches: 1,
    pendingBranches: 0,
    tiers: ["silver"],
    services: null,
    bookings2026: null,
    monthBookings: 0,
    rating: null,
    ratingCount: null,
    activeBookings: 0,
    rank: 8,
    joinedAt: "2026-10-03",
    company: company({ brand: "مركز الريم", legalName: "مؤسسة الريم للعناية بالسيارات", owner: "سعد المطيري · 055 214 7730", kind: "مركز عناية · فرع واحد", contact: "سعد المطيري · 055 214 7730" }),
    // CON5-07D · مركز الريم (3114-49302)
    drawer: {
      subtitle: "الرياض · قيد الإعداد",
      heroLine: "الرياض · التلميع · الغسيل",
      pill: { label: "قيد الإعداد", tone: "pending" },
      blocks: [
        { kind: "hero" },
        {
          kind: "tile",
          title: "مراحل الإعداد",
          rows: [
            ["اعتماد الانضمام", "3 أكتوبر 2026 · JR-0209"],
            ["أول فرع", "JR-0209 فرع السامر · قيد النظر"],
            ["الخدمات", "4 مسودات · شهادة REQ-2026-0439 قيد النظر"],
          ],
        },
        { kind: "tile", title: "المالك ومسؤول التواصل", text: "سعد المطيري · 055 214 7730" },
        { kind: "note", tone: "info", text: "يصبح المركز «نشطاً» ويظهر للعملاء بعد اعتماد أول فرع وتسعير أول خدمة." },
      ],
      footer: "new",
      branchLabel: "ملف فرع السامر",
    },
  },
  {
    id: "lk-lq-001",
    code: "LK-LQ-001",
    name: "مغاسل اللؤلؤة",
    type: "wash",
    city: "الدمام",
    status: "approved",
    menu: "cost",
    branchesLine: "3 فروع · فضي",
    branchCount: 3,
    approvedBranches: 3,
    pendingBranches: 0,
    tiers: ["silver"],
    services: 3,
    bookings2026: null,
    monthBookings: 47,
    rating: 4.5,
    ratingCount: 604,
    activeBookings: 11,
    rank: 9,
    joinedAt: "2026-06-15",
    company: company({ brand: "مغاسل اللؤلؤة", legalName: "مؤسسة اللؤلؤة لغسيل السيارات", kind: "مغسلة سيارات · عدة فروع", contact: "علي المطيري · 056 902 1144" }),
    // CON5-07D · مغاسل اللؤلؤة (3114-49241)
    drawer: {
      ...active("الدمام", "الغسيل"),
      blocks: [{ kind: "hero" }, stats(0, 4.5, 24, 47), network("3 فروع · الدمام والخبر", "3 منشورة", "الغسيل"), docs("6 مستندات سارية", "success"), contact("علي المطيري · 056 902 1144")],
      footer: "active",
    },
  },
  {
    id: "lk-wa-001",
    code: "LK-WA-001",
    name: "مركز الواحة للعناية",
    short: "مركز الواحة",
    type: "care",
    city: "الرياض",
    status: "pending-visit",
    menu: "pending-match",
    branchesLine: "2 فروع بانتظار الزيارة: النرجس · العارض",
    branchCount: 2,
    approvedBranches: 0,
    pendingBranches: 2,
    tiers: [],
    services: null,
    bookings2026: null,
    monthBookings: 0,
    rating: null,
    ratingCount: null,
    visitLine: "فرعان · 18 و19 أكتوبر 2026",
    activeBookings: 0,
    rank: 10,
    joinedAt: "2026-10-14",
    company: company({
      brand: "مركز الواحة للعناية",
      legalName: "شركة الواحة لخدمات السيارات",
      vat: "311908234500003",
      cr: "1010822416",
      owner: "بندر الزهراني · 050 914 2276",
      bank: "مصرف الإنماء •••• 2290",
      contact: "بندر الزهراني · 050 914 2276",
    }),
    // CON5-07D · مركز الواحة للعناية (3114-49936)
    drawer: {
      subtitle: "الرياض · LK-WA-001 · بانتظار الزيارة الميدانية",
      blocks: [
        {
          kind: "tile",
          title: "المنشأة",
          rows: [
            ["النوع", "مركز عناية"],
            ["العلامة التجارية", "مركز الواحة للعناية · Al Waha Car Care"],
            ["الاسم القانوني", "شركة الواحة لخدمات السيارات"],
            ["السجل التجاري", "1010822416"],
            ["الرقم الضريبي", "311908234500003"],
            ["المدينة الرئيسية", "الرياض"],
            ["أضافته", "نوف القحطاني · 14 أكتوبر 2026"],
          ],
        },
        {
          kind: "tile",
          title: "المالك",
          rows: [
            ["الاسم", "بندر الزهراني"],
            ["الجوال", "050 914 2276"],
            ["البريد", "bandar@alwaha.sa"],
          ],
        },
        {
          kind: "tile",
          title: "الحساب البنكي",
          rows: [
            ["البنك", "مصرف الإنماء •••• 2290"],
            ["صاحب الحساب", "شركة الواحة لخدمات السيارات"],
          ],
        },
        {
          kind: "tile",
          title: "الشبكة والخدمات",
          rows: [
            ["الفروع", "النرجس (الرئيسي) · العارض"],
            ["أنواع الخدمات", "نانو سيراميك · التظليل · التلميع"],
            ["الخدمات المنشورة", "0"],
          ],
        },
        {
          kind: "tile",
          title: "فرع النرجس · الرئيسي",
          rows: [
            ["الكود", "LK-WA-NR-001"],
            ["العنوان", "طريق الملك سلمان، حي النرجس · الرياض"],
            ["مدير الفرع", "سلمان الحربي · 055 210 9934"],
            ["ساعات العمل", "السبت – الخميس · 9 ص – 11 م · الجمعة 4 م – 11 م"],
            ["الفنيون · فتحات العمل", "6 · 4"],
            ["الخدمات", "نانو سيراميك · التلميع"],
            ["قدرة الاستيعاب", "نانو سيراميك 7 سيارات/يوم · التلميع 3 سيارات/يوم"],
            ["الزيارة الميدانية", "18 أكتوبر 2026"],
          ],
        },
        {
          kind: "tile",
          title: "فرع العارض",
          rows: [
            ["الكود", "LK-WA-AR-002"],
            ["العنوان", "طريق أبي بكر الصديق، حي العارض · الرياض"],
            ["مدير الفرع", "عبدالمجيد القحطاني · 054 771 3360"],
            ["ساعات العمل", "السبت – الخميس · 10 ص – 10 م"],
            ["الفنيون · فتحات العمل", "4 · 3"],
            ["الخدمات", "التظليل · التلميع"],
            ["الزيارة الميدانية", "19 أكتوبر 2026"],
          ],
        },
        docs("4 مستندات سارية", "success"),
      ],
      footer: "pending",
    },
  },
  {
    id: "lk-ry-001",
    code: "LK-RY-001",
    name: "مغسلة الريان",
    type: "wash",
    city: "جدة",
    status: "suspended",
    menu: "suspended",
    branchesLine: "2 فروع",
    branchCount: 2,
    approvedBranches: 2,
    pendingBranches: 0,
    tiers: ["silver"],
    services: 6,
    bookings2026: null,
    monthBookings: 0,
    rating: 4.4,
    ratingCount: 318,
    activeBookings: 0,
    rank: 11,
    joinedAt: "2026-03-22",
    company: company({ brand: "مغسلة الريان", legalName: "مؤسسة الريان لغسيل السيارات", kind: "مغسلة سيارات · عدة فروع", contact: "وليد الحربي · 050 765 3301" }),
    // CON5-07D · مغسلة الريان (3114-49345)
    drawer: {
      subtitle: "جدة · موقوف",
      heroLine: "جدة · الغسيل",
      pill: { label: "موقوف", tone: "danger" },
      blocks: [
        { kind: "hero" },
        { kind: "note", tone: "warning", text: "أُوقف 1 أكتوبر 2026 بطلب من المركز لتجديد الفرعين. آخر شكوى CM-3311 أُغلقت 30 سبتمبر 2026." },
        {
          kind: "stats",
          items: [
            ["2", "فروع مخفية"],
            ["3", "خدمات"],
            ["★ 4.4", "318 تقييماً"],
          ],
        },
        contact("وليد الحربي · 050 765 3301"),
      ],
      footer: "suspended",
    },
  },
];

// الأرقام في البطاقات والتبويبات من الخادم (24 · 18 · 6 · 2 · 1) — البيانات التجريبية جزء منها،
// فنحسب الفرق مرة ونضيفه عشان أي تغيير (إنشاء، إيقاف، حذف) يبان في الأرقام.
let providers: Provider[] = structuredClone(SEED);

const tabOf = (p: Provider, tab: ProviderTab) =>
  tab === "all" ? true : tab === "suspended" ? p.status === "suspended" : p.status === "suspended" ? false : tab === "pending-visit" ? p.status === "pending-visit" : p.type === (tab === "care" ? "care" : "wash");

const rawCounts = (list: Provider[]) => Object.fromEntries(PROVIDER_TABS.map((t) => [t, list.filter((p) => tabOf(p, t)).length])) as Record<ProviderTab, number>;
const rawKpis = (list: Provider[]) => ({
  approvedProviders: list.filter((p) => p.status === "approved" || p.status === "new").length,
  approvedBranches: list.filter((p) => p.status !== "suspended").reduce((s, p) => s + p.approvedBranches, 0),
});
const FIGMA_COUNTS: Record<ProviderTab, number> = { all: 24, care: 18, wash: 6, "pending-visit": 2, suspended: 1 };
const FIGMA_KPIS = { approvedProviders: 21, approvedBranches: 55 };
const seedCounts = rawCounts(SEED);
const seedKpis = rawKpis(SEED);
const counts = () => {
  const now = rawCounts(providers);
  return Object.fromEntries(PROVIDER_TABS.map((t) => [t, Math.max(0, FIGMA_COUNTS[t] - seedCounts[t] + now[t])])) as Record<ProviderTab, number>;
};

const clone = <T,>(v: T): T => structuredClone(v);
const find = (id: string) => {
  const p = providers.find((x) => x.id === id);
  if (!p) throw new ApiError(404, "not found");
  return p;
};

const matchRating = (p: Provider, r?: string) => !r || (p.rating != null && (r === "lt4" ? p.rating < 4 : p.rating >= +r));
const norm = (s: string) => s.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه");

const SORTERS: Record<ProviderSort, (a: Provider, b: Provider) => number> = {
  "top-selling": (a, b) => (b.bookings2026 ?? -1) - (a.bookings2026 ?? -1) || a.rank - b.rank,
  "most-bookings": (a, b) => b.monthBookings - a.monthBookings || a.rank - b.rank,
  "top-rated": (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.ratingCount ?? 0) - (a.ratingCount ?? 0),
  newest: (a, b) => b.joinedAt.localeCompare(a.joinedAt),
};

export type NewBranchInput = {
  name: string;
  district: string;
  city: string;
  code: string;
  main: boolean;
  services: string[];
  visitDate: string;
  manager: string;
  managerPhone: string;
  address: string;
  hours: string;
  technicians: string;
  slots: string;
};
export type NewProviderInput = {
  type: ProviderType;
  brand: string;
  brandEn: string;
  city: string;
  legalName: string;
  unified: string;
  vat: string;
  cr: string;
  code: string;
  ownerName: string;
  ownerPhone: string;
  email: string;
  bank: string;
  accountName: string;
  iban: string;
  branches: NewBranchInput[];
  /** «اعتماد ونشر بدون زيارة» (CON5-07M 3114-54483) */
  publish?: { tier: Tier; rating: number; review: string };
};

const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dayMonth = (iso: string) => {
  const d = new Date(iso);
  return { day: d.getDate(), month: `${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}` };
};
/** «18 و19 أكتوبر 2026» */
export function visitDates(isos: string[]) {
  const ds = isos.filter(Boolean).map(dayMonth);
  if (!ds.length) return "";
  const sameMonth = ds.every((d) => d.month === ds[0].month);
  if (sameMonth) return `${ds.map((d) => d.day).join(" و")} ${ds[0].month}`;
  return ds.map((d) => `${d.day} ${d.month}`).join(" و");
}
/** «فرع» · «فرعان» · «3 فروع» */
export const branchWord = (n: number) => (n === 1 ? "فرع" : n === 2 ? "فرعان" : `${n} فروع`);

export const providersApi = {
  list: async (q: ProviderQuery = {}): Promise<ListResult<Provider, ProviderTab>> => {
    const tab = q.tab ?? "all";
    const s = q.q?.trim() ? norm(q.q.trim()) : "";
    const items = providers
      .filter((p) => tabOf(p, tab))
      .filter((p) => !q.city || p.city === q.city)
      .filter((p) => !q.tier || p.tiers.includes(q.tier as Tier))
      .filter((p) => matchRating(p, q.rating))
      .filter((p) => !s || norm(p.name).includes(s) || norm(p.code).includes(s))
      // تبويب «بانتظار الزيارة» من غير ترتيب مختار: الأحدث أولاً (CON5-07 3114-50499: الواحة ثم الندى)
      .sort(tab === "pending-visit" && !q.sort ? SORTERS.newest : SORTERS[q.sort ?? "top-selling"]);
    return delay({ items: clone(items), total: items.length, counts: counts() });
  },
  kpis: async (): Promise<ProviderKpis> => {
    const k = rawKpis(providers);
    return delay(
      {
        approvedProviders: FIGMA_KPIS.approvedProviders - seedKpis.approvedProviders + k.approvedProviders,
        approvedBranches: FIGMA_KPIS.approvedBranches - seedKpis.approvedBranches + k.approvedBranches,
        pendingVisit: counts()["pending-visit"],
        rating: 4.8,
      },
      250,
    );
  },
  get: async (id: string) => delay(clone(find(id)), 200),
  /** الأكواد المستخدمة — لاقتراح كود جديد في المعالج */
  codes: async () => delay(providers.map((p) => p.code), 100),
  pause: async (id: string, v: { reason: string; until: string }) => {
    const p = find(id);
    p.status = "suspended";
    p.menu = "suspended";
    p.suspendedUntil = v.until;
    p.drawer = { ...p.drawer, subtitle: `${p.city} · موقوف`, pill: { label: "موقوف", tone: "danger" }, footer: "suspended" };
    return delay({ ok: true });
  },
  disable: async (id: string, v: { reason: string }) => {
    void v; // يُسجَّل في سجل التدقيق على الخادم
    const p = find(id);
    p.status = "suspended";
    p.menu = "suspended";
    p.disabled = true;
    p.drawer = { ...p.drawer, subtitle: `${p.city} · موقوف`, pill: { label: "موقوف", tone: "danger" }, footer: "suspended" };
    return delay({ ok: true });
  },
  reactivate: async (id: string, note: string) => {
    void note;
    const p = find(id);
    p.status = "approved";
    p.menu = "cost";
    p.disabled = false;
    p.suspendedUntil = undefined;
    p.drawer = { ...p.drawer, subtitle: `${p.city} · مركز نشط`, pill: { label: "نشط", tone: "success" }, footer: "active", blocks: p.drawer.blocks.filter((b) => b.kind !== "note") };
    return delay({ ok: true });
  },
  remove: async (id: string) => {
    const p = find(id);
    if (p.activeBookings > 0) throw new ApiError(409, "has bookings");
    providers = providers.filter((x) => x.id !== id);
    return delay({ ok: true });
  },
  requestDocument: async (id: string, v: { document: string; branch: string; note: string }) => {
    void v;
    find(id);
    return delay({ ok: true });
  },
  updateCompany: async (id: string, v: CompanyData) => {
    const p = find(id);
    p.company = { ...v };
    if (v.brand.trim()) p.name = v.brand.trim();
    return delay({ ok: true });
  },
  addBranch: async (id: string, v: { name: string; city: string; manager: string; managerPhone: string; services: string[]; assessor: string; visit: string }) => {
    const p = find(id);
    p.branchCount += 1;
    p.pendingBranches += 1;
    p.branchesLine = `${p.branchesLine} · +1 بانتظار الزيارة`;
    providerEvents.branchAdded.forEach((fn) => fn(p, v));
    return delay({ ok: true, name: v.name });
  },
  create: async (v: NewProviderInput) => {
    if (providers.some((p) => p.code === v.code)) throw new ApiError(422, "code", { code: "هذا الكود مستخدم لمقدّم خدمة آخر" });
    const n = v.branches.length;
    const published = !!v.publish;
    const dates = visitDates(v.branches.map((b) => b.visitDate));
    const districts = v.branches.map((b) => b.district).join(" · ");
    const types = [...new Set(v.branches.flatMap((b) => b.services))];
    const short = v.brand.replace(/\s+للعناية$/, "");
    const p: Provider = {
      id: v.code.toLowerCase(),
      code: v.code,
      name: v.brand,
      short,
      type: v.type,
      city: v.city,
      status: published ? "approved" : "pending-visit",
      menu: published ? "cost" : "pending-match",
      branchesLine: published
        ? `${n} ${n === 1 ? "فرع" : "فروع"}: ${v.branches.map((b) => `${b.district} ${TIER_LABEL[v.publish!.tier]}`).join(" · ")}`
        : n === 1
          ? `1 فرع: ${districts} بانتظار الزيارة`
          : `${n} فروع بانتظار الزيارة: ${districts}`,
      branchCount: n,
      approvedBranches: published ? n : 0,
      pendingBranches: published ? 0 : n,
      tiers: published ? [v.publish!.tier] : [],
      services: published ? types.length : null,
      bookings2026: null,
      monthBookings: 0,
      rating: published ? v.publish!.rating : null,
      ratingCount: published ? 0 : null,
      visitLine: published ? undefined : n === 1 ? `الزيارة ${dates}` : `${branchWord(n)} · ${dates}`,
      activeBookings: 0,
      rank: 100 + providers.length,
      joinedAt: new Date().toISOString().slice(0, 10),
      company: company({
        brand: v.brand,
        legalName: v.legalName,
        vat: v.vat,
        cr: v.cr,
        owner: `${v.ownerName} · ${v.ownerPhone}`,
        kind: v.type === "care" ? (n > 1 ? "مركز عناية · عدة فروع" : "مركز عناية · فرع واحد") : n > 1 ? "مغسلة سيارات · عدة فروع" : "مغسلة سيارات · فرع واحد",
        bank: `${v.bank} ${ltr(`•••• ${v.iban.replace(/\s/g, "").slice(-4)}`)}`,
        contact: `${v.ownerName} · ${v.ownerPhone}`,
      }),
      drawer: {
        subtitle: `${v.city} · ${v.code} · ${published ? "مركز نشط" : "بانتظار الزيارة الميدانية"}`,
        blocks: [
          {
            kind: "tile",
            title: "المنشأة",
            rows: [
              ["النوع", v.type === "care" ? "مركز عناية" : "مغسلة سيارات"],
              ["العلامة التجارية", v.brandEn ? `${v.brand} · ${v.brandEn}` : v.brand],
              ["الاسم القانوني", v.legalName],
              ["السجل التجاري", v.cr],
              ["الرقم الضريبي", v.vat],
              ["المدينة الرئيسية", v.city],
            ],
          },
          {
            kind: "tile",
            title: "المالك",
            rows: [
              ["الاسم", v.ownerName],
              ["الجوال", v.ownerPhone],
              ["البريد", v.email],
            ],
          },
          {
            kind: "tile",
            title: "الحساب البنكي",
            rows: [
              ["البنك", `${v.bank} ${ltr(`•••• ${v.iban.replace(/\s/g, "").slice(-4)}`)}`],
              ["صاحب الحساب", v.accountName],
            ],
          },
          ...v.branches.map(
            (b): DrawerBlock => ({
              kind: "tile",
              title: `فرع ${b.district}${b.main ? " · الرئيسي" : ""}`,
              rows: [
                ["الكود", b.code],
                ["العنوان", `${b.address} · ${b.city}`],
                ["مدير الفرع", `${b.manager} · ${b.managerPhone}`],
                ["ساعات العمل", b.hours],
                ["الفنيون · فتحات العمل", `${b.technicians} · ${b.slots}`],
                ["الخدمات", b.services.join(" · ") || "—"],
                ["الزيارة الميدانية", b.visitDate ? visitDates([b.visitDate]) : "—"],
              ],
            }),
          ),
        ],
        footer: published ? "active" : "pending",
      },
    };
    providers = [...providers, p];
    providerEvents.created.forEach((fn) => fn(p, v));
    return delay({ id: p.id, code: p.code, name: p.name, short, dates, branches: n });
  },
};

// ───────────── للفروع (القسم 12 · src/lib/api/branches.ts) ─────────────
// الفروع بتقرا وتكتب نفس مخزن المنشآت (عدد الفروع وسطر الفروع)، وبتسمع لإنشاء منشأة أو إضافة فرع من نوافذ مقدّمي الخدمة.
export type AddBranchInput = Parameters<typeof providersApi.addBranch>[1];
export const providerStore = {
  all: () => providers,
  find: (id: string) => providers.find((p) => p.id === id),
};
export const providerEvents = {
  created: [] as ((p: Provider, v: NewProviderInput) => void)[],
  branchAdded: [] as ((p: Provider, v: AddBranchInput) => void)[],
};
