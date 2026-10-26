// أشكال بيانات البحث والمقارنة (W2-26 · W2-29 · W2-30 · W2-30a · W2-30m · W2-31)
import type { Localized } from "@/i18n/config";
import type { ProviderTier, ServiceSlug } from "@/lib/data/types";

export type PillTone = "green" | "dark" | "gray";
export type PillIcon = "check" | "tag" | "clock" | "package";
// شارات الكارت: «يقدّم الخدمتين» (أخضر فاتح) · «عرض · خصم 15%» (كحلي) · مواصفات (رمادي)
export type ResultPill = Localized<"label"> & { tone: PillTone; icon: PillIcon };

// سطر خدمة داخل كارت نتيجة متعددة الخدمات (W2-30): الاسم عند المزوّد + السعر
export type ResultLine = Localized<"name"> & {
  service: ServiceSlug;
  price?: number | null; // null = «مجاناً» · undefined = بدون سعر (نتيجة مبنية تلقائياً)
  old_price?: number;
};

// «خدمات أخرى لدى …» في كارت الخدمة الواحدة (W2-30a)
export type SimilarItem = Localized<"name"> & { price: number; service?: ServiceSlug };

export type MapPoint = { x: number; y: number }; // بكسل داخل لوحة الخريطة في الفيجما

// نتيجة بحث = مقدّم خدمة + ما يقدّمه من الخدمات المطلوبة بأسعار سيارتك
export type SearchResult = {
  provider: string; // slug من providers.ts
  // اسم العرض في شاشات البحث لو مختلف عن providers.ts (مثلاً «جونسون Johnson»)
  display_name?: Localized<"name">;
  tier?: ProviderTier; // لو التصنيف في الفيجما مختلف عن providers.ts
  show_certified: boolean; // «معتمد LINKAR ✓» ظاهرة في هذا الكارت؟
  rating: number;
  reviews: number | null; // «(240)»
  distance_km: number;
  branch: Localized<"name"> | null; // أقرب فرع «فرع الروضة»
  branches: number;
  services_line: Localized<"text">; // «نانو سيراميك · تلميع · غسيل»
  covers: ServiceSlug[]; // الخدمات المطلوبة اللي بيقدّمها
  pills: ResultPill[];
  // كارت الخدمة الواحدة: اسم الخدمة عند المزوّد + وصف
  title?: Localized<"text">;
  description?: Localized<"text">;
  lines: ResultLine[];
  specs: ResultPill[];
  price: number;
  old_price?: number;
  price_layout?: "inline"; // نانو شيلد في W2-30: «الإجمالي للخدمتين شامل الضريبة» بجانب السعر
  big_logo?: boolean; // نانو شيلد في W2-30: شعار 146 بدون رابط صفحة المزوّد
  similar: SimilarItem[];
  // المقارنة والفلاتر
  duration_hours: number;
  duration: Localized<"text">;
  warranty_years: number;
  warranty: Localized<"text">;
  offer: Localized<"text"> | null;
  offer_best?: boolean;
  has_offer: boolean;
  has_package: boolean;
  // الخريطة (W2-30m)
  map: MapPoint;
  map_title: Localized<"text">; // «نانو سيراميك 9H + تلميع ثلاث مراحل»
  map_note: Localized<"text">; // «يقدّم الخدمتين معاً»
  map_note_tone: "green" | "gray";
  map_price_label: Localized<"text">; // «للخدمتين» / «للنانو فقط»
  map_pin_label?: Localized<"text">; // «خدمة من اثنتين» بدل السعر
  map_popup_line?: Localized<"text">; // «نانو 9H + تلميع ثلاث مراحل ·»
};

export type FactIcon = "shield" | "calendar" | "price";
export type Fact = Localized<"label"> & Localized<"value"> & { icon: FactIcon };

// بديل في «طرق أخرى للحصول على نفس النتيجة» (W2-30a)
export type Alternative = {
  key: string;
  provider: string | null; // slug لو موجود في providers.ts
  logo: string;
  name: Localized<"text">;
  rating: number;
  distance_km: number;
  title: Localized<"text">;
  description: Localized<"text">;
  warranty: Localized<"text">;
  warranty_years: number;
  service: ServiceSlug;
  price: number;
  // تصميم العميل المعدّل: شارة ليموني فوق الاسم («حماية أقوى») + شيبس المواصفات («ضمان 5 سنوات»، «زيارة واحدة»)
  tag?: Localized<"text">;
  specs?: Localized<"text">[];
};

// عرض/باقة فاتحة (W2-30a «عروض وباقات تشمل …»)
export type LightOffer = {
  provider: string;
  badge: Localized<"text">; // «عرض · خصم 15%»
  services: ServiceSlug[];
  title: Localized<"text">;
  description: Localized<"text">;
  price: number;
  old_price: number;
  note: Localized<"text">; // «ينتهي خلال 3 أيام»
};

// عرض غامق (v2 · Offer card) في W2-30 «باقات تشمل الخدمات المختارة.»
export type DarkOffer = {
  provider: string;
  discount: number;
  services: ServiceSlug[];
  title: [Localized<"text">, Localized<"text">];
  features: { icon: "clock" | "warranty" | "calendar"; label: Localized<"text"> }[];
  price: number;
  old_price: number;
};

export type SearchScenario = {
  services: ServiceSlug[];
  title: Localized<"text">;
  crumb: Localized<"text">;
  description: Localized<"text">;
  tile: ServiceSlug | null; // مربع الخدمة الليموني بجانب العنوان
  facts: Fact[];
  count: Localized<"text">; // «6 نتائج» / «9 مقدّمي خدمة»
  ai: {
    provider: string;
    title: Localized<"text">;
    body: Localized<"text">;
    price: number;
    service: ServiceSlug;
    big_logo: boolean;
    // تصميم العميل المعدّل: شيبس تحت الوصف («ضمان 9 سنوات»، «يوم واحد»…) — من بداية السطر
    chips?: Localized<"text">[];
  } | null;
  results_title: Localized<"text">;
  size_hint: boolean;
  list: string[]; // ترتيب الكروت في القائمة (من بداية السطر)
  results: SearchResult[];
  more_count: number; // «عرض 5 مقدّمي خدمة آخرين»
  alternatives: { title: Localized<"text">; description: Localized<"text">; items: Alternative[] } | null;
  offers:
    | { kind: "dark"; title: Localized<"text">; description: Localized<"text">; items: DarkOffer[] }
    | { kind: "light"; title: Localized<"text">; description: Localized<"text">; items: LightOffer[] }
    | null;
  compare_label: Localized<"text">; // «نانو + تلميع» في شريط المقارنة
  compare_label_map: Localized<"text">;
  compare_initial: string[];
  map: {
    total: number;
    both: number;
    legend: Localized<"text">;
    cluster: string; // «+5»
    cluster_at: MapPoint;
    me: MapPoint;
    selected: string;
    popup_at: MapPoint;
  };
  generic?: boolean; // نتيجة مبنية تلقائياً (مافيش لها فريم في الفيجما)
};
