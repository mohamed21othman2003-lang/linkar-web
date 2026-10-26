import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";
import type { ProviderDisplay } from "@/lib/data/booking/types";
import type { OfferFeatureIcon } from "@/lib/data/offers/offers";

export type PackageItem = Localized<"name"> &
  Localized<"description"> & {
    service: ServiceSlug;
    price: number;
    free: boolean; // «مجاناً في الباقة»
    chips: Localized<"label">[];
  };

export type PackageDetail = Localized<"description"> &
  Localized<"duration"> &
  Localized<"warranty"> &
  Localized<"warranty_note"> & {
    reviews: number;
    items: PackageItem[];
  };

export type Package = Localized<"title"> &
  Localized<"title_line1"> &
  Localized<"title_line2"> &
  Localized<"line_name"> & {
    slug: string;
    provider: string;
    display?: ProviderDisplay;
    services: ServiceSlug[];
    main_service: ServiceSlug; // الشيب بجانب «باقة · خدمتان»
    discount: number;
    price: number;
    old_price: number;
    features: (Localized<"label"> & { icon: OfferFeatureIcon })[];
    // تفاصيل W2-42 — موجودة في الفيجما لباقة Johnson Ceramic Pro فقط
    detail: PackageDetail | null;
  };

const oneVisit = { icon: "calendar" as const, label_ar: "زيارة واحدة", label_en: "One visit" };
const twoServices = { icon: "warranty" as const, label_ar: "خدمتان", label_en: "2 services" };
const threeServices = { icon: "warranty" as const, label_ar: "3 خدمات", label_en: "3 services" };

// W2-41 · الباقات (729:6671) — الترتيب الافتراضي من الفيجما («الأكثر توفيراً»)
export const packages: Package[] = [
  {
    slug: "llumar-protection-tint",
    provider: "llumar",
    services: ["ppf", "tint"],
    main_service: "ppf",
    discount: 15,
    price: 4950,
    old_price: 5850,
    title_ar: "باقة الحماية والتظليل",
    title_en: "Protection and tint package",
    title_line1_ar: "باقة الحماية والتظليل",
    title_line1_en: "Protection and tint package",
    title_line2_ar: "PPF + تظليل كامل",
    title_line2_en: "PPF + full tint",
    line_name_ar: "باقة الحماية والتظليل",
    line_name_en: "Protection and tint package",
    features: [{ icon: "clock", label_ar: "يومان", label_en: "2 days" }, twoServices, oneVisit],
    detail: null,
  },
  {
    slug: "xpel-new-car",
    provider: "xpel",
    display: { name_ar: "‏XPEL السعودية", name_en: "XPEL Saudi Arabia", rating: 4.8, distance_km: 1.2, branches: 18 },
    services: ["ppf", "nano-ceramic", "tint"],
    main_service: "ppf",
    discount: 14,
    price: 7800,
    old_price: 9100,
    title_ar: "باقة السيارة الجديدة",
    title_en: "New car package",
    title_line1_ar: "باقة السيارة الجديدة",
    title_line1_en: "New car package",
    title_line2_ar: "PPF + نانو + تظليل",
    title_line2_en: "PPF + nano + tint",
    line_name_ar: "باقة السيارة الجديدة",
    line_name_en: "New car package",
    features: [{ icon: "clock", label_ar: "يومان", label_en: "2 days" }, threeServices, oneVisit],
    detail: null,
  },
  {
    slug: "johnson-ceramic-pro",
    provider: "johnson",
    services: ["nano-ceramic", "polish"],
    main_service: "nano-ceramic",
    discount: 16,
    price: 1899,
    old_price: 2250,
    title_ar: "باقة Johnson Ceramic Pro",
    title_en: "Johnson Ceramic Pro package",
    title_line1_ar: "باقة Johnson Ceramic Pro",
    title_line1_en: "Johnson Ceramic Pro package",
    title_line2_ar: "مع تلميع مجاني",
    title_line2_en: "with free polishing",
    line_name_ar: "Johnson Ceramic Pro",
    line_name_en: "Johnson Ceramic Pro",
    features: [{ icon: "clock", label_ar: "يوم واحد", label_en: "1 day" }, twoServices, oneVisit],
    detail: {
      reviews: 128,
      description_ar: "‏Johnson Ceramic Pro مع تلميع ثلاث مراحل مجاناً، في زيارة واحدة وبقسيمة واحدة.",
      description_en: "Johnson Ceramic Pro with free three-stage polishing, in one visit and with one voucher.",
      duration_ar: "زيارة واحدة · يوم واحد",
      duration_en: "One visit · 1 day",
      warranty_ar: "9 سنوات على Johnson Ceramic Pro",
      warranty_en: "9 years on Johnson Ceramic Pro",
      warranty_note_ar: "للحفاظ على الضمان: صيانة دورية لدى جونسون كل 12 شهراً، وتجنّب الغسيل الآلي بالفرش أول أسبوعين.",
      warranty_note_en: "To keep the warranty: periodic maintenance at Johnson every 12 months, and avoid brush car washes for the first two weeks.",
      items: [
        {
          service: "nano-ceramic",
          name_ar: "‏Johnson Ceramic Pro",
          name_en: "Johnson Ceramic Pro",
          description_ar: "طبقة نانو سيراميك بصلابة 9H تحمي الطلاء وتمنحه لمعاناً يدوم.",
          description_en: "A 9H nano ceramic coating that protects the paint and gives it a lasting shine.",
          price: 1899,
          free: false,
          chips: [
            { label_ar: "يوم واحد", label_en: "1 day" },
            { label_ar: "ضمان 9 سنوات", label_en: "9-year warranty" },
          ],
        },
        {
          service: "polish",
          name_ar: "تلميع ثلاث مراحل",
          name_en: "Three-stage polishing",
          description_ar: "إزالة الخدوش الدقيقة وآثار الغسيل، وإعادة اللمعان قبل طبقة الحماية.",
          description_en: "Removes fine scratches and wash marks and restores the shine before the protective coat.",
          price: 351,
          free: true,
          chips: [{ label_ar: "ضمن نفس الزيارة", label_en: "Within the same visit" }],
        },
      ],
    },
  },
  {
    slug: "nanoshield-monthly-care",
    provider: "nanoshield",
    services: ["wash", "polish", "nano-ceramic"],
    main_service: "nano-ceramic",
    discount: 18,
    price: 1690,
    old_price: 2070,
    title_ar: "باقة العناية الشهرية",
    title_en: "Monthly care package",
    title_line1_ar: "باقة العناية الشهرية",
    title_line1_en: "Monthly care package",
    title_line2_ar: "غسيل وتلميع ونانو سيراميك",
    title_line2_en: "Wash, polish and nano ceramic",
    line_name_ar: "باقة العناية الشهرية",
    line_name_en: "Monthly care package",
    features: [{ icon: "clock", label_ar: "يوم واحد", label_en: "1 day" }, threeServices, oneVisit],
    detail: null,
  },
  {
    slug: "johnson-full-care",
    provider: "johnson",
    services: ["wash", "polish", "nano-ceramic"],
    main_service: "nano-ceramic",
    discount: 14,
    price: 1499,
    old_price: 1748,
    title_ar: "باقة العناية الكاملة",
    title_en: "Full care package",
    title_line1_ar: "باقة العناية الكاملة",
    title_line1_en: "Full care package",
    title_line2_ar: "طاردة للماء + تلميع + تفصيل",
    title_line2_en: "Water repellent + polish + detailing",
    line_name_ar: "باقة العناية الكاملة",
    line_name_en: "Full care package",
    features: [{ icon: "clock", label_ar: "8 ساعات", label_en: "8 hours" }, threeServices, oneVisit],
    detail: null,
  },
];

// «باقات أخرى» في W2-42
export const relatedPackages: Record<string, string[]> = {
  "johnson-ceramic-pro": ["llumar-protection-tint", "nanoshield-monthly-care", "johnson-full-care"],
};
// تصميم العميل المعدّل (85:37809): «باقات أخرى» بقت 4 كروت — أولها (يمين) عرض أوتوشابو «نانو سيراميك برو» من lib/data/offers
export const relatedOffers: Record<string, string[]> = {
  "johnson-ceramic-pro": ["autoshabo-nano-pro"],
};

// نصوص صفحة الباقات (Page head)
export const packagesPage = {
  crumb_ar: "الباقات",
  crumb_en: "Packages",
  title_ar: "باقات مقدّمي الخدمة",
  title_en: "Provider packages",
  description_ar: "خدمات يجمعها كل مقدّم خدمة في باقة واحدة بسعر أقل من مجموعها، وتُحجز كأي خدمة. السعر لسيارتك واضح قبل أن تحجز.",
  description_en: "Services each provider bundles into one package for less than their total, booked like any service. The price for your car is clear before you book.",
  other_title_ar: "باقات أخرى",
  other_title_en: "Other packages",
  other_subtitle_ar: "باقات من مقدّمي خدمة آخرين ومن {provider}.",
  other_subtitle_en: "Packages from other providers and from {provider}.",
};
