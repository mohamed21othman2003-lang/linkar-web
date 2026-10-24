// أشكال بيانات صفحة مقدّم الخدمة (W2-21) والخدمة عند المزوّد (W2-32) — نفس شكل الـAPI لاحقاً.
import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";

// نفس مفاتيح أحجام السيارات في بيانات «سياراتي» (account/cars-data)
export type CarSize = "sedan" | "suv" | "large";

export type ServiceReview = Localized<"who"> &
  Localized<"ago"> &
  Localized<"text"> & {
    stars: number;
  };

export type ProviderReview = ServiceReview &
  Localized<"meta"> & {
    service: string; // slug الخدمة
  };

// تفاصيل صفحة الخدمة W2-32 (موجودة بالكامل في الفيجما لـ Johnson Ceramic Pro فقط)
export type ServiceDetail = Localized<"overview"> & {
  facts: (Localized<"value"> & { kind: "duration" | "warranty" | "suitable" })[];
  includes_chips: Localized<"label">[]; // «ما تشمله الخدمة» في نظرة عامة
  includes_list: Localized<"label">[]; // تبويب «ما تشمله»
  warranty_text: (Localized<"text">) | null; // تبويب «الضمان»
  warranty_note: (Localized<"text">) | null; // «للحفاظ على الضمان: …»
  package_banner: (Localized<"title"> & { package: string }) | null; // «متاحة كباقة: …»
  rating: number;
  reviews_count: number;
  reviews: ServiceReview[];
  cover: string; // الصورة الكبيرة في المعرض
  photos: string[]; // المصغّرات + عارض الصور P-14
  // «مقدّمو خدمة آخرون يقدّمون …» — نفس الخدمة عند مزوّدين تانيين
  other_offers: (Localized<"name"> & Localized<"warranty"> & {
    provider: string;
    price: number;
    photo: string;
    in_compare?: boolean; // الحالة الظاهرة في الفيجما
  })[];
};

export type ProviderService = Localized<"name"> &
  Localized<"description"> &
  Localized<"duration"> & {
    slug: string;
    category: ServiceSlug; // صنف الخدمة في لينكار (مسار التنقّل + «مقدّمو خدمة آخرون»)
    group: string; // مفتاح المجموعة في قائمة الخدمات («حماية سيراميك»…)
    icon: ServiceSlug;
    photo: string; // 140×112 في قائمة الخدمات
    popular: boolean;
    prices: Record<CarSize, number>;
    duration_hours: number; // للمقارنة («الأفضل» = الأقصر)
    warranty_years: number | null; // للمقارنة («الأفضل» = الأطول)
    warranty_label: (Localized<"label">) | null; // «ضمان 9 سنوات»
    // نافذة المقارنة W2-22
    compare: Localized<"type"> & Localized<"warranty"> & { package: (Localized<"label">) | null };
    addons: string[]; // الخدمات المقترحة في كارت الحجز W2-32
    detail: ServiceDetail | null;
  };

export type ProviderPackage = Localized<"name"> &
  Localized<"description"> &
  Localized<"meta"> & {
    slug: string; // نفس slug الباقة في lib/data/packages (W2-42)
    icons: ServiceSlug[];
    discount: number;
    price: number;
    old_price: number;
  };

export type ProviderBranch = Localized<"name"> &
  Localized<"short"> &
  Localized<"address"> &
  Localized<"district"> &
  Localized<"hours"> & {
    id: string; // نفس id الفرع في lib/data/booking/branches
    distance_km: number;
    pin: { x: number; y: number }; // مكان الدبوس في الخريطة المصغّرة 520×340
    phone: string;
    whatsapp: string;
    maps_query: string;
  };

export type TrustItem = Localized<"label"> & { icon: "check" | "shield" | "user" };

export type SimilarItem = Localized<"tag"> & { provider: string; services: ServiceSlug[] };

export type CarouselItem = Localized<"services"> &
  Localized<"highlight"> & {
    provider: string;
    reviews_count?: number;
  };

export type ProviderDetail = Localized<"tagline"> &
  Localized<"hours"> &
  Localized<"city"> & {
    slug: string;
    generated: boolean; // true = محتوى مؤقت (placeholder) مش من الفيجما
    cover: string;
    nearest_branch_km: number | null;
    google: { rating: number; count: number } | null;
    linkar: { rating: number; count: number };
    trust: TrustItem[];
    groups: (Localized<"name"> & { key: string; icon: ServiceSlug })[];
    services: ProviderService[];
    default_selection: string[]; // الحالة الظاهرة في الفيجما
    compare_default: string[];
    packages: ProviderPackage[];
    branches: ProviderBranch[];
    reviews: { distribution: [number, number, number, number, number]; items: ProviderReview[] } | null;
    about: (Localized<"text"> & { facts: Localized<"label">[]; policies: Localized<"text">[] }) | null;
    similar: SimilarItem[] | null; // «مشابهون لـ…» (لو null بنحسبها)
    carousel: CarouselItem[] | null;
    card_photo: string; // صورة الكارت في «مقدّمو خدمة مشابهون»
  };

export type Marketer = Localized<"name"> & {
  code: string;
  credit: number;
  min_total: number;
  voucher_code: string;
};
