// العملاء (Figma v5 · 05 · العملاء 3114:16053 — الإطارات CON5-05 / 05D / 05M / 05P / 05T).
// بيانات تجريبية بنفس شكل الخادم: القائمة بتاخد الشريحة والفلاتر والصفحة وبترجع { items, total, counts }.
// الإجماليات (18,420 · 3,912 · 4,812 …) جاية من الخادم؛ الصفوف المعروضة هي عملاء Figma نفسهم (14 عميلاً
// بنفس أسماء وأرقام الحجوزات في bookings.ts)، والصفحات البعيدة بتكمّل بصفوف مولّدة بنفس الشكل.
import { ApiError, delay } from "./errors";

export type Segment = "all" | "active" | "vouchers";
export const SEGMENTS: readonly Segment[] = ["all", "active", "vouchers"];

export type KV = { k: string; v: string };
export type DrawerLink = { label: string; href: string };

export type ProfileItem = { title: string; sub: string; href?: string };
/** ملف العميل الكامل (CON5-05P · ملف العميل · محمد سالم 3260:257929 / 258298 / 258667 / 259036) */
export interface Profile {
  stats: { value: string; label: string }[];
  interests: KV[];
  basics: KV[];
  invitesPoints: KV[];
  recentBookings: ProfileItem[];
  payments: KV[];
  invoices: ProfileItem[];
  messages: ProfileItem[];
  complaints: ProfileItem[];
  reviews: ProfileItem[];
}

export interface Customer {
  id: string;
  name: string;
  /** الرقم الكامل (نفس bookings.ts) — الجدول والدرج بيعرضوه مخفي «055 ••• 4567» */
  phone: string;
  city: string;
  top: { service: string; where: string };
  bookings: { count: number; sub: string };
  vouchers: { count: number; sub: string } | null;
  points: number;
  lastBooking: string;
  /** للفلاتر: المراكز والفروع اللي حجز فيها + فئة أكثر خدمة طلبها */
  centers: string[];
  branches: string[];
  category: string;
  active: boolean;
  drawer: {
    bookingsLabel: string;
    interests: KV[];
    invites?: KV[];
    vouchers?: { title: string; sub: string }[];
    cars: string[];
    links: DrawerLink[];
  };
  profile?: Profile;
}

/** «055 123 4567» → «055 ••• 4567» */
export const maskPhone = (p: string) => `${p.slice(0, 3)} ••• ${p.slice(-4)}`;

const bq = (phone: string) => `/bookings?q=${phone.replace(/\s/g, "")}`;
const bk = (id: string) => `/bookings?booking=${id}`;

// الترتيب = ترتيب الخادم (آخر نشاط) — نفس ترتيب الصفوف في كل إطارات Figma المفلترة
const SEED: Customer[] = [
  {
    id: "cu-ms",
    name: "محمد سالم",
    phone: "055 123 4567",
    city: "جدة",
    top: { service: "نانو سيراميك", where: "جونسون · الزهراء" },
    bookings: { count: 9, sub: "3 بعروض · 1 باقة" },
    vouchers: { count: 2, sub: "أقربها تنتهي 25 أكتوبر 2026" },
    points: 1250,
    lastBooking: "11 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-ZH-001"],
    category: "نانو سيراميك",
    active: true,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "نانو سيراميك · 4 حجوزات" },
        { k: "المركز والفرع", v: "جونسون · الزهراء · حجزان" },
        { k: "العروض والباقات", v: "3 حجوزات بعروض · باقة واحدة" },
        { k: "آخر حجز", v: "BK-21452 · 11 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      invites: [
        { k: "دخل برمز دعوة", v: "SARA4K · سارة م. · يونيو 2026" },
        { k: "رمز الدعوة", v: "MOHD7Q" },
        { k: "دعواته", v: "3 أصدقاء · اكتمل 1 (+500 نقطة) · 1 بانتظار الزيارة" },
      ],
      vouchers: [
        { title: "LK-9F3K-7QPD · BK-21452", sub: "جونسون · الزهراء · تنتهي 25 أكتوبر 2026" },
        { title: "قسيمة وكالة الريادة · BK-21414", sub: "تويوتا كامري 2026 · تنتهي 5 يناير 2027" },
      ],
      cars: ["تويوتا كامري 2023 · سيدان · ر س ح 1234", "لكزس ES 2022 · سيدان · ب ن د 5678", "تويوتا كامري 2026 · بدون لوحة بعد"],
      links: [
        { label: "شكوى CM-3340 · مركز لمعة للتلميع · بانتظار رد العميل", href: "/reviews?complaint=CM-3340" },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0551234567") },
      ],
    },
    profile: {
      stats: [
        { value: "2", label: "كوبون وهدية مستخدمة" },
        { value: "23", label: "مرة بحث على الموقع" },
        { value: "3", label: "أصدقاء مدعوون" },
        { value: "2", label: "قسائم صالحة" },
        { value: "1,250", label: "نقطة" },
        { value: "9", label: "حجوزات" },
      ],
      interests: [
        { k: "الخدمة الأكثر طلباً", v: "نانو سيراميك · 4 حجوزات" },
        { k: "المركز والفرع", v: "جونسون · فرع الزهراء · حجزان" },
        { k: "العروض والباقات", v: "3 حجوزات بعروض · باقة واحدة" },
        { k: "آخر حجز", v: "BK-21452 · 11 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      basics: [
        { k: "الجوال", v: "055 123 4567" },
        { k: "المدينة", v: "جدة" },
        { k: "رمز الدعوة", v: "MOHD7Q" },
        { k: "دخل برمز دعوة", v: "SARA4K · سارة م. · يونيو 2026" },
      ],
      invitesPoints: [
        { k: "دعواته", v: "3 أصدقاء · اكتمل 1 (+500 نقطة) · 1 بانتظار الزيارة" },
        { k: "النقاط", v: "1,250 نقطة" },
      ],
      recentBookings: [
        { title: "BK-21452 · Johnson Ceramic Pro + تفصيل داخلي · سيدان", sub: "جونسون · فرع الزهراء · 2,348 ر.س · بانتظار الزيارة", href: bk("BK-21452") },
        { title: "BK-21414 · Johnson Ceramic Pro · كامري 2026", sub: "جونسون · فرع الزهراء · قسيمة وكالة الريادة · بانتظار الزيارة", href: bk("BK-21414") },
        { title: "BK-21388 · تلميع ثلاث مراحل · لكزس ES 2022", sub: "مركز لمعة للتلميع · فرع السلامة · 8 أكتوبر 2026 · مكتملة", href: bk("BK-21388") },
      ],
      payments: [
        { k: "BK-21452", v: "تم الدفع · مدى · 11 أكتوبر 2026 · 2,348 ر.س" },
        { k: "BK-21414", v: "مدفوع من وكالة الريادة · PO-2026-01406" },
      ],
      invoices: [{ title: "INV-L-2026-10-08766 · فاتورة ضريبية مبسّطة", sub: "BK-21452 · 11 أكتوبر 2026 · 2,348 ر.س · مدى", href: "/invoices?invoice=INV-L-2026-10-08766" }],
      messages: [
        { title: "MSG-0418 · الدفع والفواتير", sub: "«أحتاج فاتورة ضريبية باسم شركتي للحجز BK-21452» · 14 أكتوبر 2026", href: "/messages?message=MSG-0418" },
        { title: "SG-0031 · اقتراح", sub: "«إضافة خدمة الغسيل في موقع العميل» · 5 أكتوبر 2026 · تم الرد", href: "/messages?message=SG-0031" },
      ],
      complaints: [{ title: "CM-3340 · شكوى على حجز BK-21388", sub: "مركز لمعة للتلميع · فرع السلامة · جودة التنفيذ · بانتظار رد العميل", href: "/reviews?complaint=CM-3340" }],
      reviews: [],
    },
  },
  {
    id: "cu-rs",
    name: "ريم س.",
    phone: "055 124 7830",
    city: "جدة",
    top: { service: "نانو سيراميك", where: "جونسون · الزهراء" },
    bookings: { count: 6, sub: "2 بعروض" },
    vouchers: { count: 1, sub: "BK-21475 · بانتظار قرار لينكار" },
    points: 920,
    lastBooking: "14 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-ZH-001"],
    category: "نانو سيراميك",
    active: true,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "نانو سيراميك · 3 حجوزات" },
        { k: "المركز والفرع", v: "جونسون · الزهراء · 4 حجوزات" },
        { k: "العروض والباقات", v: "حجزان بعرض" },
        { k: "آخر حجز", v: "BK-21475 · 14 أكتوبر 2026 · بانتظار قرار لينكار" },
      ],
      vouchers: [{ title: "LK-8P3V-6JRC · BK-21475", sub: "معلّقة حتى قرار لينكار في طلب التعذّر · صالحة حتى 28 أكتوبر 2026" }],
      cars: ["تويوتا كورولا 2024 · سيدان", "هيونداي توسان 2023 · SUV متوسطة"],
      links: [
        { label: "طلب تعذّر REQ-2026-0417 على BK-21475 · بانتظار قرار لينكار", href: "/requests?request=REQ-2026-0417" },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0551247830") },
      ],
    },
  },
  {
    id: "cu-af",
    name: "عبدالعزيز ف.",
    phone: "050 743 7717",
    city: "جدة",
    top: { service: "باقة العناية الكاملة", where: "جونسون · الحمراء" },
    bookings: { count: 3, sub: "2 باقات" },
    vouchers: { count: 1, sub: "تنتهي 28 أكتوبر 2026" },
    points: 410,
    lastBooking: "14 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-HM-002"],
    category: "التلميع",
    active: false,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "باقة العناية الكاملة · حجزان" },
        { k: "المركز والفرع", v: "جونسون · الحمراء · 3 حجوزات" },
        { k: "العروض والباقات", v: "باقتان" },
        { k: "آخر حجز", v: "BK-21474 · 14 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      vouchers: [{ title: "LK-9H4T-2PWC · BK-21474", sub: "جونسون · الحمراء · تنتهي 28 أكتوبر 2026" }],
      cars: ["هيونداي سانتافي 2024 · SUV متوسطة"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0507437717") }],
    },
  },
  {
    id: "cu-mh",
    name: "منيرة ح.",
    phone: "053 348 6656",
    city: "جدة",
    top: { service: "PPF للواجهة + نانو سيراميك", where: "جونسون · المحمدية" },
    bookings: { count: 4, sub: "2 باقات · 1 بعرض" },
    vouchers: { count: 1, sub: "تنتهي 28 أكتوبر 2026" },
    points: 560,
    lastBooking: "14 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-MH-003"],
    category: "نانو سيراميك",
    active: false,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "PPF للواجهة + نانو سيراميك · حجزان" },
        { k: "المركز والفرع", v: "جونسون · المحمدية · 3 حجوزات" },
        { k: "العروض والباقات", v: "باقتان · حجز بعرض" },
        { k: "آخر حجز", v: "BK-21473 · 14 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      vouchers: [{ title: "LK-7Q2M-4KDA · BK-21473", sub: "جونسون · المحمدية · تنتهي 28 أكتوبر 2026" }],
      cars: ["مرسيدس C200 2025 · سيدان"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0533486656") }],
    },
  },
  {
    id: "cu-sm",
    name: "سارة م.",
    phone: "050 664 2097",
    city: "الرياض",
    top: { service: "تظليل كامل", where: "لومار · الروضة" },
    bookings: { count: 5, sub: "4 بعروض" },
    vouchers: { count: 1, sub: "تنتهي 28 أكتوبر 2026" },
    points: 690,
    lastBooking: "14 أكتوبر 2026",
    centers: ["لومار"],
    branches: ["LK-LM-RD-001"],
    category: "التظليل",
    active: true,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "تظليل كامل · 3 حجوزات" },
        { k: "المركز والفرع", v: "لومار · الروضة · 4 حجوزات" },
        { k: "العروض والباقات", v: "4 حجوزات بعروض" },
        { k: "آخر حجز", v: "BK-21472 · 14 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      vouchers: [{ title: "LK-3HD8-W1QZ · BK-21472", sub: "لومار · الروضة · تنتهي 28 أكتوبر 2026" }],
      cars: ["هوندا أكورد 2022 · سيدان"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0506642097") }],
    },
  },
  {
    id: "cu-ya",
    name: "يوسف ع.",
    phone: "053 772 0418",
    city: "الرياض",
    top: { service: "PPF كامل للسيارة", where: "XPEL · العليا" },
    bookings: { count: 2, sub: "1 بعرض" },
    vouchers: { count: 1, sub: "تنتهي 26 أكتوبر 2026" },
    points: 300,
    lastBooking: "12 أكتوبر 2026",
    centers: ["XPEL"],
    branches: ["LK-XP-OL-001"],
    category: "حماية PPF",
    active: false,
    drawer: {
      bookingsLabel: "حجزان",
      interests: [
        { k: "الخدمة", v: "PPF كامل للسيارة · حجزان" },
        { k: "المركز والفرع", v: "XPEL · العليا · حجزان" },
        { k: "العروض والباقات", v: "حجز بعرض" },
        { k: "آخر حجز", v: "BK-21470 · 12 أكتوبر 2026 · بانتظار الزيارة" },
      ],
      vouchers: [{ title: "LK-5MXA-88RT · BK-21470", sub: "XPEL · العليا · تنتهي 26 أكتوبر 2026" }],
      cars: ["لكزس LX 2025 · SUV كبيرة"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0537720418") }],
    },
  },
  {
    id: "cu-la",
    name: "لمى ع.",
    phone: "055 905 1180",
    city: "جدة",
    top: { service: "باقة النانو والتلميع", where: "جونسون · الزهراء" },
    bookings: { count: 3, sub: "2 باقات" },
    vouchers: null,
    points: 640,
    lastBooking: "9 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-ZH-001"],
    category: "التلميع",
    active: false,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "باقة النانو والتلميع · حجزان" },
        { k: "المركز والفرع", v: "جونسون · الزهراء · 3 حجوزات" },
        { k: "العروض والباقات", v: "باقتان" },
        { k: "آخر حجز", v: "BK-21447 · 11 أكتوبر 2026 · مكتمل · ضمان ورقي 9 سنوات للنانو" },
      ],
      cars: ["هيونداي توسان 2023 · SUV متوسطة"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0559051180") }],
    },
  },
  {
    id: "cu-rd",
    name: "ريما د.",
    phone: "055 209 6631",
    city: "الرياض",
    top: { service: "نانو سيراميك ثلاث طبقات", where: "نانو شيلد · الروضة" },
    bookings: { count: 3, sub: "2 بعروض" },
    vouchers: null,
    points: 520,
    lastBooking: "12 أكتوبر 2026",
    centers: ["نانو شيلد"],
    branches: ["LK-NS-RD-001"],
    category: "نانو سيراميك",
    active: true,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "نانو سيراميك ثلاث طبقات · حجزان" },
        { k: "المركز والفرع", v: "نانو شيلد · الروضة · 3 حجوزات" },
        { k: "العروض والباقات", v: "حجزان بعرض" },
        { k: "آخر حجز", v: "BK-21468 · 12 أكتوبر 2026 · مكتمل" },
      ],
      cars: ["مرسيدس C200 2023 · سيدان"],
      links: [
        { label: "ضمان BK-21468 بانتظار الإصدار من نانو شيلد", href: bk("BK-21468") },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0552096631") },
      ],
    },
  },
  {
    id: "cu-sb",
    name: "سعود ب.",
    phone: "050 318 4471",
    city: "جدة",
    top: { service: "تفصيل داخلي كامل", where: "جونسون · المحمدية" },
    bookings: { count: 4, sub: "2 بعروض" },
    vouchers: null,
    points: 340,
    lastBooking: "11 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-MH-003"],
    category: "الغسيل",
    active: true,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "تفصيل داخلي كامل · حجزان" },
        { k: "المركز والفرع", v: "جونسون · المحمدية · 3 حجوزات" },
        { k: "العروض والباقات", v: "حجزان بعرض" },
        { k: "آخر حجز", v: "BK-21459 · 11 أكتوبر 2026 · مكتمل · تقييم ★3" },
      ],
      cars: ["تويوتا لاندكروزر 2022 · SUV كبيرة"],
      links: [
        { label: "ضمان BK-21459 بانتظار الإصدار من جونسون", href: bk("BK-21459") },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0503184471") },
      ],
    },
  },
  {
    id: "cu-mj",
    name: "ماجد ك.",
    phone: "056 418 9930",
    city: "جدة",
    top: { service: "طبقة طاردة للماء + تلميع", where: "جونسون · الحمراء" },
    bookings: { count: 4, sub: "2 باقات" },
    vouchers: null,
    points: 450,
    lastBooking: "13 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-HM-002"],
    category: "التلميع",
    active: false,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "طبقة طاردة للماء + تلميع · حجزان" },
        { k: "المركز والفرع", v: "جونسون · الحمراء · 3 حجوزات" },
        { k: "العروض والباقات", v: "باقتان" },
        { k: "آخر حجز", v: "BK-21471 · 13 أكتوبر 2026 · ملغى ومسترد" },
      ],
      cars: ["لكزس ES 2023 · سيدان"],
      links: [
        { label: "BK-21471 · أُلغي بطلب العميل · استُرد 1,299 ر.س · RF-2026-0189", href: bk("BK-21471") },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0564189930") },
      ],
    },
  },
  {
    id: "cu-az",
    name: "أحمد ز.",
    phone: "054 512 3390",
    city: "جدة",
    top: { service: "نانو سيراميك", where: "جونسون · المحمدية" },
    bookings: { count: 4, sub: "—" },
    vouchers: null,
    points: 380,
    lastBooking: "4 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-MH-003"],
    category: "نانو سيراميك",
    active: false,
    drawer: {
      bookingsLabel: "حجوزات",
      interests: [
        { k: "الخدمة", v: "نانو سيراميك · حجزان" },
        { k: "المركز والفرع", v: "جونسون · المحمدية · 3 حجوزات" },
        { k: "العروض والباقات", v: "—" },
        { k: "آخر حجز", v: "BK-21426 · 4 أكتوبر 2026 · مكتمل" },
      ],
      cars: ["جي إم سي يوكن 2022 · SUV كبيرة"],
      links: [
        { label: "شكوى CM-3349 · جونسون · المحمدية · لدى لينكار", href: "/reviews?complaint=CM-3349" },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0545123390") },
      ],
    },
  },
  {
    id: "cu-na",
    name: "ناصر ع.",
    phone: "056 207 8812",
    city: "جدة",
    top: { service: "نانو سيراميك", where: "جونسون · الزهراء" },
    bookings: { count: 1, sub: "عبر المسوّق SM123" },
    vouchers: null,
    points: 0,
    lastBooking: "12 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-ZH-001"],
    category: "نانو سيراميك",
    active: false,
    drawer: {
      bookingsLabel: "حجز",
      interests: [
        { k: "الخدمة", v: "Johnson Ceramic Pro · نانو سيراميك" },
        { k: "المركز والفرع", v: "جونسون · الزهراء" },
        { k: "القناة", v: "عبر المسوّق SM123 · رصيد مسوّق 300 ر.س" },
        { k: "آخر حجز", v: "BK-21417 · 8 أكتوبر 2026 · مكتمل" },
      ],
      cars: ["نيسان باترول 2025 · SUV كبيرة"],
      links: [
        { label: "المسوّق SM123", href: "/partners/marketers?marketer=SM123" },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0562078812") },
      ],
    },
  },
  {
    id: "cu-mk",
    name: "مهند ك.",
    phone: "053 640 6604",
    city: "الدمام",
    top: { service: "تظليل", where: "XPEL · الملقا" },
    bookings: { count: 2, sub: "2 بكود الترحيب" },
    vouchers: null,
    points: 120,
    lastBooking: "13 سبتمبر 2026",
    centers: ["XPEL"],
    branches: ["LK-XP-MQ-002"],
    category: "التظليل",
    active: false,
    drawer: {
      bookingsLabel: "حجزان",
      interests: [
        { k: "الخدمة", v: "تظليل · حجزان" },
        { k: "المركز والفرع", v: "XPEL · الملقا" },
        { k: "العروض والباقات", v: "حجزان بكود الترحيب WELCOME10" },
        { k: "آخر حجز", v: "13 سبتمبر 2026 · مكتمل" },
      ],
      cars: ["كيا سبورتاج 2021 · SUV متوسطة"],
      links: [{ label: "حجوزات العميل في صفحة الحجوزات", href: bq("0536406604") }],
    },
  },
  {
    id: "cu-kd",
    name: "خالد الدوسري",
    phone: "055 318 2287",
    city: "جدة",
    top: { service: "نانو سيراميك", where: "جونسون · الزهراء" },
    bookings: { count: 1, sub: "حجز يدوي · بانتظار الدفع" },
    vouchers: null,
    points: 0,
    lastBooking: "14 أكتوبر 2026",
    centers: ["جونسون"],
    branches: ["LK-JN-ZH-001"],
    category: "نانو سيراميك",
    active: false,
    drawer: {
      bookingsLabel: "حجز",
      interests: [
        { k: "الخدمة", v: "Johnson Ceramic Pro · نانو سيراميك" },
        { k: "المركز والفرع", v: "جونسون · الزهراء" },
        { k: "القناة", v: "حجز يدوي · مكالمة هاتفية · هند المطيري" },
        { k: "آخر حجز", v: "BK-21476 · 14 أكتوبر 2026 · بانتظار الدفع" },
      ],
      cars: ["تويوتا كامري 2025 · سيدان · ر ج د 4821"],
      links: [
        { label: "BK-21476 · رابط الدفع صالح حتى 15 أكتوبر 2026 11:20 ص", href: bk("BK-21476") },
        { label: "حجوزات العميل في صفحة الحجوزات", href: bq("0553182287") },
      ],
    },
  },
];

/** ملف العميل: محمد سالم من Figma حرفياً، وباقي العملاء بنفس الشكل من بيانات الدرج */
export function profileOf(c: Customer): Profile {
  if (c.profile) return c.profile;
  const d = c.drawer;
  const voucherCount = d.vouchers?.length ?? 0;
  return {
    stats: [
      { value: "0", label: "كوبون وهدية مستخدمة" },
      { value: "—", label: "مرة بحث على الموقع" },
      { value: "0", label: "أصدقاء مدعوون" },
      { value: String(voucherCount), label: "قسائم صالحة" },
      { value: c.points.toLocaleString("en-US"), label: "نقطة" },
      { value: String(c.bookings.count), label: d.bookingsLabel },
    ],
    interests: d.interests.map((r) => (r.k === "الخدمة" ? { k: "الخدمة الأكثر طلباً", v: r.v } : r)),
    basics: [
      { k: "الجوال", v: c.phone },
      { k: "المدينة", v: c.city },
    ],
    invitesPoints: [{ k: "النقاط", v: `${c.points.toLocaleString("en-US")} نقطة` }],
    recentBookings: [],
    payments: [],
    invoices: [],
    messages: [],
    complaints: d.links.filter((l) => l.label.startsWith("شكوى")).map((l) => ({ title: l.label.split(" · ")[0], sub: l.label.split(" · ").slice(1).join(" · "), href: l.href })),
    reviews: [],
  };
}

// صفحة «كل العملاء» الأولى في Figma (CON5-05 3114:16054) — باقي العملاء في الصفحة التانية
const ALL_FIRST = ["cu-ms", "cu-rs", "cu-af", "cu-mh", "cu-sm", "cu-ya", "cu-la", "cu-az", "cu-na", "cu-mk"];
// شريحة «نشطون خلال 90 يوماً» مرتبة بعدد الحجوزات بعروض (CON5-05 3114:17243)
const ACTIVE_ORDER = ["cu-sm", "cu-ms", "cu-rs", "cu-rd", "cu-sb"];

// ───────────── خيارات الفلاتر (CON5-05P · 3114:20672 / 20711 / 20754 / 20787) ─────────────
export type MenuOption = { value: string; label: string; count: string; group?: string };
export const CENTER_OPTS: MenuOption[] = [
  { value: "جونسون", label: "جونسون", count: "4,812" },
  { value: "لومار", label: "لومار", count: "2,960" },
  { value: "XPEL", label: "XPEL", count: "2,410" },
  { value: "نانو شيلد", label: "نانو شيلد", count: "1,730" },
  { value: "مركز لمعة للتلميع", label: "مركز لمعة للتلميع", count: "1,120" },
  { value: "مركز درع للحماية", label: "مركز درع للحماية", count: "380" },
  { value: "مركز الريم", label: "مركز الريم", count: "0 · معتمد جديد" },
];
export const BRANCH_OPTS: MenuOption[] = [
  { value: "LK-JN-ZH-001", label: "الزهراء", count: "1,964", group: "جونسون" },
  { value: "LK-JN-HM-002", label: "الحمراء", count: "1,410", group: "جونسون" },
  { value: "LK-JN-MH-003", label: "المحمدية", count: "1,438", group: "جونسون" },
  { value: "LK-LM-RD-001", label: "الروضة", count: "820", group: "لومار" },
  { value: "LK-XP-OL-001", label: "العليا", count: "740", group: "XPEL" },
  { value: "LK-XP-MQ-002", label: "الملقا", count: "520", group: "XPEL" },
  { value: "LK-NS-RD-001", label: "الروضة", count: "690", group: "نانو شيلد" },
];
export const SERVICE_OPTS: MenuOption[] = [
  { value: "الغسيل", label: "الغسيل", count: "5,120" },
  { value: "التظليل", label: "التظليل", count: "3,980" },
  { value: "نانو سيراميك", label: "نانو سيراميك", count: "2,730" },
  { value: "حماية PPF", label: "حماية PPF", count: "2,140" },
  { value: "التلميع", label: "التلميع", count: "1,260" },
  { value: "تغيير اللون", label: "تغيير اللون", count: "140" },
];
export const CITY_OPTS: MenuOption[] = [
  { value: "جدة", label: "جدة", count: "8,640" },
  { value: "الرياض", label: "الرياض", count: "7,210" },
  { value: "الدمام", label: "الدمام", count: "1,380" },
  { value: "مكة المكرمة", label: "مكة المكرمة", count: "640" },
  { value: "الخبر", label: "الخبر", count: "550" },
];
export const ALL_COUNT = "18,420";
const parse = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

/** شرح الشريحة/الفلتر في الشريط الأزرق فوق الجدول (CON5-05 · شريحة …) */
export function viewNote(f: CustomerQuery): string | null {
  if (f.branch) {
    const b = BRANCH_OPTS.find((o) => o.value === f.branch);
    return b ? `عملاء حجزوا في فرع ${b.label} ‎(${b.value})‎ مرة واحدة على الأقل.` : null;
  }
  if (f.center) return `عملاء حجزوا لدى ${f.center} مرة واحدة على الأقل.`;
  if (f.service) return `عملاء أكثر خدمة طلبوها من فئة ${f.service}.`;
  if (f.segment === "active") return "شريحة تلقائية تتحدّث يومياً: من حجزوا بعرض أو كود خصم مرتين فأكثر.";
  if (f.segment === "vouchers") return "قسائم حجوزات مدفوعة لم تُمسح بعد، وقسائم الوكالات. مناسبة لتذكير العميل بالزيارة قبل انتهاء القسيمة.";
  if (f.city) return `عملاء من مدينة ${f.city}.`;
  return null;
}

/** اسم الجمهور تحت «كل عملاء الشريحة محددون» وفي حقل «المستلمون» */
export function audienceName(f: CustomerQuery): string {
  if (f.branch) {
    const b = BRANCH_OPTS.find((o) => o.value === f.branch);
    return `عملاء ${b?.group ?? ""} · ${b?.label ?? ""}`;
  }
  if (f.center) return `عملاء ${f.center}`;
  if (f.service) return `الأكثر طلباً ل${f.service}`;
  if (f.segment === "active") return "شريحة «نشطون خلال 90 يوماً»";
  if (f.segment === "vouchers") return "شريحة «لديهم قسائم صالحة»";
  if (f.city) return `عملاء ${f.city}`;
  return "كل العملاء";
}

// ───────────── القائمة ─────────────
export type CustomerQuery = { segment?: Segment; q?: string; center?: string; branch?: string; service?: string; city?: string; page?: number };
export const PAGE_SIZE = 10;

let store: Customer[] = structuredClone(SEED);
const clone = <T,>(v: T): T => structuredClone(v);

const matches = (c: Customer, f: CustomerQuery) => {
  const q = f.q?.trim();
  if (q && !(c.name.includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")))) return false;
  if (f.segment === "active" && !c.active) return false;
  if (f.segment === "vouchers" && !c.vouchers) return false;
  if (f.center && !c.centers.includes(f.center)) return false;
  if (f.branch && !c.branches.includes(f.branch)) return false;
  if (f.service && c.category !== f.service) return false;
  if (f.city && c.city !== f.city) return false;
  return true;
};

/** إجمالي الخادم لكل عرض مفلتر بفلتر واحد (أرقام Figma) — لو فيه أكتر من فلتر: عدد الصفوف */
function serverTotal(f: CustomerQuery, rows: number): number {
  const keys = [f.segment && f.segment !== "all" ? "segment" : "", f.center && !f.branch ? "center" : "", f.branch ? "branch" : "", f.service ? "service" : "", f.city ? "city" : "", f.q?.trim() ? "q" : ""].filter(Boolean);
  if (keys.length === 0) return parse(ALL_COUNT);
  if (keys.length > 1 || keys[0] === "q") return rows;
  if (f.segment === "active") return 3912;
  if (f.segment === "vouchers") return 742;
  if (f.branch) return parse(BRANCH_OPTS.find((o) => o.value === f.branch)?.count ?? "0");
  if (f.center) return parse(CENTER_OPTS.find((o) => o.value === f.center)?.count ?? "0");
  if (f.service) return parse(SERVICE_OPTS.find((o) => o.value === f.service)?.count ?? "0");
  if (f.city) return parse(CITY_OPTS.find((o) => o.value === f.city)?.count ?? "0");
  return rows;
}

// صفوف مولّدة للصفحات البعيدة (نفس شكل عملاء الصفحة الأولى)
const GEN_NAMES = ["فيصل ق.", "نورة س.", "عبدالله م.", "هيا ع.", "تركي ش.", "دانة ف.", "بندر ح.", "رهف ك.", "سلطان ر.", "جود م."];
function synthetic(n: number): Customer {
  const t = SEED[n % SEED.length];
  const tail = String(1000 + ((n * 7919) % 9000)).slice(-4);
  return { ...clone(t), id: `cu-g${n}`, name: GEN_NAMES[n % GEN_NAMES.length], phone: `05${n % 10} ${String(200 + (n % 700)).padStart(3, "0")} ${tail}`, points: (n * 37) % 900, vouchers: null, lastBooking: `${Math.max(1, 28 - (n % 27))} سبتمبر 2026` };
}

export type CustomerRow = Omit<Customer, "drawer" | "profile">;
const toRow = ({ drawer: _d, profile: _p, ...c }: Customer): CustomerRow => clone(c); // eslint-disable-line @typescript-eslint/no-unused-vars

function viewIds(f: CustomerQuery): Customer[] {
  const filtered = !!(f.q?.trim() || f.center || f.branch || f.service || f.city || (f.segment && f.segment !== "all"));
  if (!filtered) {
    const first = ALL_FIRST.map((id) => store.find((c) => c.id === id)!);
    return [...first, ...store.filter((c) => !ALL_FIRST.includes(c.id))];
  }
  const pool = store.filter((c) => matches(c, f));
  if (f.segment === "active") pool.sort((a, b) => ACTIVE_ORDER.indexOf(a.id) - ACTIVE_ORDER.indexOf(b.id));
  return pool;
}

export const customersApi = {
  list: async (f: CustomerQuery = {}) => {
    const pool = viewIds(f);
    const total = serverTotal(f, pool.length);
    const page = Math.max(1, f.page ?? 1);
    const start = (page - 1) * PAGE_SIZE;
    let items: Customer[];
    if (total > pool.length) {
      // العرض الأول للشريحة/الفلتر بيرجع صفوف Figma بس (عرض 1–5 من 3,912)، والصفحات بعدها مولّدة
      items = page === 1 ? pool.slice(0, PAGE_SIZE) : Array.from({ length: Math.min(PAGE_SIZE, total - start) }, (_, i) => pool[start + i] ?? synthetic(start + i));
    } else items = pool.slice(start, start + PAGE_SIZE);
    return delay({ items: items.map(toRow), total, counts: { all: parse(ALL_COUNT), active: 6210, vouchers: 742, coupons: couponCount() } });
  },
  get: async (id: string) => {
    const c = store.find((x) => x.id === id) ?? (/^cu-g\d+$/.test(id) ? synthetic(+id.slice(4)) : undefined);
    if (!c) throw new ApiError(404);
    return delay(clone(c), 200);
  },
  /** نفس الصفوف كلها (للمستلمين في النوافذ: «3 عملاء محددون · محمد سالم، …») */
  names: async (ids: string[]) => delay(ids.map((id) => store.find((c) => c.id === id)?.name ?? "").filter(Boolean), 100),
};

let couponCountRef = () => 6;
/** عدد الكوبونات النشطة (بطاقة «الكوبونات») — بيتربط بمخزن الكوبونات */
export const couponCount = () => couponCountRef();
export const _setCouponCount = (fn: () => number) => (couponCountRef = fn);

// ───────────── الإجراءات (CON5-05M / 05T) ─────────────
export const POINT_TYPES = [
  { value: "add", label: "إضافة" },
  { value: "deduct", label: "خصم" },
];
export const POINT_REASONS = ["تعويض شكوى", "هدية ولاء", "تصحيح رصيد", "مكافأة دعوة"];

export type Audience = { kind: "selected"; ids: string[] } | { kind: "view"; query: CustomerQuery };
export type Channel = "sms" | "push" | "coupon" | "gift-points" | "gift-service";

export const customersMutations = {
  adjustPoints: async (id: string, v: { amount: number; type: "add" | "deduct"; reason: string }) => {
    const c = store.find((x) => x.id === id);
    if (!c) throw new ApiError(404);
    c.points = Math.max(0, c.points + (v.type === "add" ? v.amount : -v.amount));
    return delay({ ok: true, points: c.points });
  },
  /** إرسال جماعي: رسالة نصية · إشعار · كوبون · نقاط هدية · خدمة هدية — للمحددين أو لكل عملاء العرض */
  send: async (channel: Channel, audience: Audience, payload: Record<string, unknown>) => {
    if (channel === "gift-points" && audience.kind === "selected") {
      const pts = Number(payload.points) || 0;
      for (const id of audience.ids) {
        const c = store.find((x) => x.id === id);
        if (c) c.points += pts;
      }
    }
    return delay({ ok: true, channel, payload });
  },
  test: async (channel: Channel) => delay({ ok: true, channel }),
};

export const _customersStore = { all: () => store, reset: () => (store = clone(SEED)) };
