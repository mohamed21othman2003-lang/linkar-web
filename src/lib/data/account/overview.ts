import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";

// W2-60 · حسابي · الرئيسية (748:7673) + W2-60-0 عميل جديد (1072:21) — محتوى الكروت كما في الفيجما بالحرف.

// حجزك القادم (الكارت الغامق) + يُنفَّذ الآن — ملخص لحجوزات من bookings.ts
export const overviewNext = {
  booking_id: "BK-21452",
  provider_slug: "johnson",
  provider_name: "Johnson",
  title_ar: "‏Johnson Ceramic Pro + تفصيل داخلي كامل",
  title_en: "Johnson Ceramic Pro + Full interior detailing",
  meta_ar: "جونسون Johnson · فرع الزهراء · تويوتا كامري 2023 · BK-21452",
  meta_en: "Johnson · Al Zahra branch · Toyota Camry 2023 · BK-21452",
  when_ar: "القسيمة صالحة حتى الأحد 25 أكتوبر",
  when_en: "Voucher valid until Sun 25 Oct",
};

export const overviewInProgress = {
  booking_id: "BK-21431",
  provider_slug: "xpel",
  provider_name: "XPEL",
  title_ar: "باقة السيارة الجديدة · XPEL السعودية",
  title_en: "New car package · XPEL Saudi Arabia",
  meta_ar: "بدأ العمل السبت 10 أكتوبر · فرع الروضة · BK-21431",
  meta_en: "Work started Sat 10 Oct · Al Rawdah branch · BK-21431",
};

export type OverviewStat = Localized<"value"> &
  Localized<"note"> & {
    key: "cars" | "favorites" | "gifts" | "points";
    icon: "car" | "heart" | "gift" | "tag";
    href: string;
  };

// ترتيب الفيجما من بداية السطر (يمين): النقاط · الهدايا · المفضلة · سياراتي
// قيمة النقاط بتيجي من رصيد العميل (formatNumber(user.points))
export const overviewStats: OverviewStat[] = [
  { key: "points", icon: "tag", href: routes.points, value_ar: "", value_en: "", note_ar: "تساوي 25 ر.س · أقرب انتهاء 14 يونيو 2027", note_en: "Worth SAR 25 · Earliest expiry 14 Jun 2027" },
  { key: "gifts", icon: "gift", href: routes.dealerPackages, value_ar: "1 جاهزة", value_en: "1 ready", note_ar: "من وكالة الريادة للسيارات", note_en: "From Al Riyada Motors" },
  { key: "favorites", icon: "heart", href: routes.favorites(), value_ar: "5", value_en: "5", note_ar: "3 مقدّمي خدمة · خدمة وباقة", note_en: "3 providers · a service and a package" },
  { key: "cars", icon: "car", href: routes.cars, value_ar: "2", value_en: "2", note_ar: "الافتراضية: تويوتا كامري 2023", note_en: "Default: Toyota Camry 2023" },
];

// كيف كانت تجربتك مع …؟ (يفتح تقييم الخدمة W2-63 على BK-21388)
export const overviewRate = {
  booking_id: "BK-21388",
  provider_slug: "lamaa",
  provider_ar: "مركز لمعة للتلميع",
  provider_en: "Lamaa Polishing Center",
  meta_ar: "تلميع ثلاث مراحل · اكتمل الخميس 8 أكتوبر · BK-21388",
  meta_en: "Three-stage polish · Completed Thu 8 Oct · BK-21388",
};

export type OverviewOffer = Localized<"pill"> &
  Localized<"title"> &
  Localized<"provider"> &
  Localized<"note"> & {
    id: string;
    services: ServiceSlug[];
    provider_slug: string;
    price: number;
    old_price: number;
    href: string;
  };

// «جديد من مقدّمي خدمة تتابعهم» — نفس الكروت في حالة العميل الجديد («عروض قد تهمك»)
// الترتيب من بداية السطر: PPF + نانو · تظليل · باقة العناية — كل كارت يفتح W2-32 (الخدمة عند المزود) زي الفيجما
export const overviewOffers: OverviewOffer[] = [
  {
    id: "ppf-nano-front",
    pill_ar: "خصم 15%",
    pill_en: "15% off",
    services: ["ppf", "nano-ceramic"],
    title_ar: "حماية PPF للواجهة + نانو سيراميك",
    title_en: "Front PPF + Nano ceramic",
    provider_slug: "xpel",
    provider_ar: "‏XPEL السعودية",
    provider_en: "XPEL Saudi Arabia",
    note_ar: "ينتهي خلال يومين",
    note_en: "Ends in 2 days",
    price: 5950,
    old_price: 7000,
    href: routes.providerService("xpel", "ppf"),
  },
  {
    id: "prime-xr-full",
    pill_ar: "خصم 14%",
    pill_en: "14% off",
    services: ["tint"],
    title_ar: "تظليل Prime XR لكامل السيارة",
    title_en: "Prime XR tint for the whole car",
    provider_slug: "xpel",
    provider_ar: "‏XPEL السعودية",
    provider_en: "XPEL Saudi Arabia",
    note_ar: "ينتهي خلال أسبوع",
    note_en: "Ends in a week",
    price: 2999,
    old_price: 3499,
    href: routes.providerService("xpel", "tint"),
  },
  {
    id: "monthly-care",
    pill_ar: "باقة · خصم 18%",
    pill_en: "Package · 18% off",
    services: ["wash", "polish", "nano-ceramic"],
    title_ar: "باقة العناية الشهرية",
    title_en: "Monthly care package",
    provider_slug: "nanoshield",
    provider_ar: "نانو شيلد",
    provider_en: "NanoShield",
    note_ar: "زيارة واحدة",
    note_en: "One visit",
    price: 1690,
    old_price: 2070,
    href: routes.providerService("nanoshield", "wash"),
  },
];
