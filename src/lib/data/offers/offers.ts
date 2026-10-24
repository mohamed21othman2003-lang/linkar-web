import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";
import type { ProviderDisplay } from "@/lib/data/booking/types";

export type OfferFeatureIcon = "clock" | "warranty" | "calendar";

export type Offer = Localized<"title_line1"> &
  Localized<"title_line2"> & {
    id: string;
    provider: string;
    // اسم/أرقام المركز كما تظهر على الكارت في الفيجما
    display?: ProviderDisplay;
    services: ServiceSlug[];
    discount: number;
    price: number;
    old_price: number;
    features: (Localized<"label"> & { icon: OfferFeatureIcon })[];
    featured?: boolean;
    ends_at: string | null; // ISO — «ينتهي خلال» في كارت العرض المميّز
  };

const instant = { icon: "calendar" as const, label_ar: "حجز فوري", label_en: "Instant booking" };

// W2-40 · العروض (725:6463) — الترتيب الافتراضي «الأعلى خصماً» والعرض المميّز أولاً
export const offers: Offer[] = [
  {
    id: "xpel-ppf-front-ceramic",
    provider: "xpel",
    display: { name_ar: "XPEL", name_en: "XPEL", rating: 4.8, distance_km: 1.2, branches: 6 },
    services: ["ppf", "nano-ceramic"],
    discount: 15,
    price: 5950,
    old_price: 7000,
    title_line1_ar: "حماية PPF للواجهة مع نانو سيراميك",
    title_line1_en: "Front PPF protection with nano ceramic",
    title_line2_ar: "",
    title_line2_en: "",
    features: [],
    featured: true,
    ends_at: "2026-10-26T23:59:00+03:00",
  },
  {
    id: "lamaa-polish-ceramic",
    provider: "lamaa",
    services: ["polish", "nano-ceramic"],
    discount: 20,
    price: 720,
    old_price: 900,
    title_line1_ar: "تلميع ثلاث مراحل",
    title_line1_en: "Three-stage polishing",
    title_line2_ar: "مع حماية سيراميك",
    title_line2_en: "with ceramic protection",
    features: [
      { icon: "clock", label_ar: "4 ساعات", label_en: "4 hours" },
      { icon: "warranty", label_ar: "ضمان 6 أشهر", label_en: "6-month warranty" },
      instant,
    ],
    ends_at: null,
  },
  {
    id: "autoshabo-polish-correction",
    provider: "autoshabo",
    services: ["polish"],
    discount: 18,
    price: 899,
    old_price: 1099,
    title_line1_ar: "تلميع وتصحيح دهان",
    title_line1_en: "Polishing and paint correction",
    title_line2_ar: "",
    title_line2_en: "",
    features: [
      { icon: "clock", label_ar: "5 ساعات", label_en: "5 hours" },
      { icon: "warranty", label_ar: "ضمان 6 أشهر", label_en: "6-month warranty" },
      instant,
    ],
    ends_at: null,
  },
  {
    id: "autoshabo-nano-pro",
    provider: "autoshabo",
    services: ["nano-ceramic"],
    discount: 15,
    price: 1019,
    old_price: 1199,
    title_line1_ar: "نانو سيراميك برو",
    title_line1_en: "Nano Ceramic Pro",
    title_line2_ar: "",
    title_line2_en: "",
    features: [
      { icon: "clock", label_ar: "6 ساعات", label_en: "6 hours" },
      { icon: "warranty", label_ar: "ضمان سنتان", label_en: "2-year warranty" },
      instant,
    ],
    ends_at: null,
  },
  {
    id: "xpel-prime-xr-tint",
    provider: "xpel",
    display: { name_ar: "مركز إكسبل السعودية", name_en: "XPEL Saudi Center", rating: 4.8, distance_km: 1.2, branches: 6 },
    services: ["tint"],
    discount: 14,
    price: 2999,
    old_price: 3499,
    title_line1_ar: "تظليل Prime XR",
    title_line1_en: "Prime XR tint",
    title_line2_ar: "لكامل السيارة",
    title_line2_en: "for the whole car",
    features: [
      { icon: "clock", label_ar: "4 ساعات", label_en: "4 hours" },
      { icon: "warranty", label_ar: "ضمان 10 سنوات", label_en: "10-year warranty" },
      instant,
    ],
    ends_at: null,
  },
];

// نصوص صفحة العروض (Page head + فلتر)
export const offersPage = {
  crumb_ar: "العروض",
  crumb_en: "Offers",
  title_ar: "عروض مقدّمي الخدمة",
  title_en: "Provider offers",
  description_ar: "كل عرض يقدّمه مقدّم خدمة على خدماته لفترة محدودة. السعر بعد الخصم لسيارتك واضح قبل أن تحجز.",
  description_en: "Every offer is made by a provider on their own services for a limited time. The discounted price for your car is clear before you book.",
};
