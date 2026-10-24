import type { Localized } from "@/i18n/config";
import type { ProviderTier, ServiceSlug } from "@/lib/data/types";

// W2-64 · المفضلة (749:7852) + W2-64-0 حالة فارغة (1071:600) — نفس شكل الـAPI: نصوص _ar/_en

export const favoritesPage = {
  title_ar: "المفضلة",
  title_en: "Favorites",
  description_ar: "مقدّمو خدمة تتابعهم لتصلك عروضهم أولاً، وخدمات وباقات حفظتها لتحجزها لاحقاً.",
  description_en: "Providers you follow so their offers reach you first, and services and packages you saved to book later.",
  tab_all_ar: "الكل",
  tab_all_en: "All",
  tab_providers_ar: "مقدّمو الخدمة",
  tab_providers_en: "Providers",
  tab_saved_ar: "الخدمات والباقات",
  tab_saved_en: "Services & packages",
  providers_title_ar: "مقدّمو خدمة تتابعهم",
  providers_title_en: "Providers you follow",
  providers_subtitle_ar: "تصلك عروضهم الجديدة أولاً — أوقف التنبيه لأي مقدّم من زر المتابعة.",
  providers_subtitle_en: "Their new offers reach you first — turn off alerts for any provider with the follow button.",
  saved_title_ar: "خدمات وباقات حفظتها",
  saved_title_en: "Services and packages you saved",
  saved_subtitle_ar: "السعر حسب سيارتك الافتراضية: تويوتا كامري 2023 · سيدان.",
  saved_subtitle_en: "Prices are for your default car: Toyota Camry 2023 · Sedan.",
  note_ar: "السعر المحفوظ يتحدّث تلقائياً إذا غيّر مقدّم الخدمة سعره أو انتهى العرض.",
  note_en: "Saved prices update automatically if the provider changes the price or the offer ends.",
  empty_title_ar: "لم تحفظ شيئاً بعد",
  empty_title_en: "Nothing saved yet",
  empty_text_ar: "احفظ مقدّمي الخدمة والخدمات والباقات التي تهمك لتصلك عروضهم وتعود إليها بسرعة.",
  empty_text_en: "Save the providers, services and packages you care about to get their offers and come back to them quickly.",
  empty_cta_ar: "تصفّح مقدّمي الخدمة",
  empty_cta_en: "Browse providers",
};

export type FavoriteTab = "all" | "providers" | "saved";

// كارت مقدّم الخدمة في المفضلة = نفس v2 · Provider card · Logo بقيم الفيجما (الشارة، المسافة، الخدمات، التصنيف)
export type FavoriteProvider = Partial<Localized<"name">> & {
  slug: string;
  tag: Localized<"label">;
  distance_km: number;
  services: ServiceSlug[]; // بترتيب الشيبس من بداية السطر
  tier: ProviderTier;
  // اسم الفرع اللي في سطر التقييم في الفيجما («فرع الروضة») — الكارت المشترك بيعرض عدد الفروع بداله
  branch: Localized<"label">;
};

export const favoriteProviders: FavoriteProvider[] = [
  {
    slug: "johnson",
    name_ar: "جونسون Johnson",
    name_en: "Johnson",
    tag: { label_ar: "باقتان متاحتان", label_en: "2 packages available" },
    distance_km: 5.6,
    services: ["nano-ceramic", "polish"],
    tier: "gold",
    branch: { label_ar: "فرع الزهراء", label_en: "Al Zahra branch" },
  },
  {
    slug: "xpel",
    tag: { label_ar: "عرضان وباقة", label_en: "2 offers and a package" },
    distance_km: 1.2,
    services: ["ppf", "tint"],
    tier: "platinum",
    branch: { label_ar: "فرع الروضة", label_en: "Al Rawdah branch" },
  },
  {
    slug: "nanoshield",
    tag: { label_ar: "باقة واحدة", label_en: "1 package" },
    distance_km: 1.5,
    services: ["nano-ceramic", "polish"],
    tier: "gold",
    branch: { label_ar: "فرع الروضة", label_en: "Al Rawdah branch" },
  },
];

export type SavedItem = Localized<"title"> &
  Localized<"meta"> &
  Localized<"saved"> & {
    id: string;
    kind: "service" | "package";
    provider: string;
    services: ServiceSlug[]; // أيقونات الخدمات من بداية السطر
    price: number;
    old_price?: number;
    // الرابط: صفحة خدمة المقدّم أو صفحة الباقة
    service?: ServiceSlug;
    package_slug?: string;
  };

export const savedItems: SavedItem[] = [
  {
    id: "sv-1",
    kind: "service",
    provider: "johnson",
    title_ar: "Johnson Ceramic Pro",
    title_en: "Johnson Ceramic Pro",
    meta_ar: "جونسون Johnson · يوم واحد · ضمان 9 سنوات",
    meta_en: "Johnson · 1 day · 9-year warranty",
    saved_ar: "حفظتها الأحد 4 أكتوبر",
    saved_en: "Saved Sun 4 Oct",
    services: ["nano-ceramic"],
    price: 1899,
    service: "nano-ceramic",
  },
  {
    id: "sv-2",
    kind: "package",
    provider: "xpel",
    title_ar: "باقة السيارة الجديدة",
    title_en: "New Car Package",
    meta_ar: "‏XPEL السعودية · زيارة واحدة · يومان · 3 خدمات",
    meta_en: "XPEL Saudi Arabia · 1 visit · 2 days · 3 services",
    saved_ar: "حفظتها الخميس 1 أكتوبر",
    saved_en: "Saved Thu 1 Oct",
    services: ["ppf", "nano-ceramic", "tint"],
    price: 7800,
    old_price: 9100,
    package_slug: "xpel-new-car",
  },
];
