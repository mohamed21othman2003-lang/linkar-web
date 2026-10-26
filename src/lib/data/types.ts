// أشكال البيانات — نفس الشكل اللي الـAPI (Django) هيرجّعه بعدين:
// كل نص له نسختين _ar/_en، والروابط بتتبني من الـslug، والصور مسارات/روابط.
import type { Localized } from "@/i18n/config";

// "color-change" = «تغيير اللون» — الخدمة السادسة في تصميم العميل المعدّل (AVbWFtRb0aHpm34oqkI5ot)
export type ServiceSlug = "wash" | "ppf" | "tint" | "polish" | "nano-ceramic" | "color-change";

export type Service = Localized<"name"> &
  Localized<"chip"> &
  Localized<"description"> & {
    slug: ServiceSlug;
    // مقدّمو الخدمة اللي بيظهروا تحت «تجدها لدى» في كارت الخدمة
    featured_providers: string[];
  };

export type ProviderTier = "platinum" | "gold" | "silver";

export type Provider = Localized<"name"> &
  Localized<"short_name"> & {
    slug: string;
    logo: string; // /figma/logos/*
    rating: number;
    distance_km: number;
    branches: number;
    services: ServiceSlug[];
    // خدمات إضافية ظاهرة في نتايج البحث (W2-30/W2-30a) لكن مش في شيبس الكروت (W2-26)
    more_services?: ServiceSlug[];
    starting_price: number;
    tier: ProviderTier;
    certified: boolean;
    // الشارة الليموني فوق الاسم في الكارت («عروض متاحة»، «الأقرب إليك»…)
    tag: (Localized<"label">) | null;
  };

export type Link = Localized<"label"> & { href: string };

export type MenuItem = Localized<"title"> &
  Localized<"subtitle"> & {
    href: string;
    icon: string; // /figma/icons/menu-*.svg
    highlighted?: boolean;
  };

export type DemoUser = {
  id: string;
  name_ar: string;
  name_en: string;
  first_name_ar: string;
  first_name_en: string;
  initial_ar: string;
  initial_en: string;
  phone: string;
  email: string;
  points: number;
  is_new: boolean;
};
