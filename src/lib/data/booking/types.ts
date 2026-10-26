// أشكال بيانات الحجز والدفع والعروض والباقات — نفس شكل الـAPI (نص ثنائي اللغة _ar/_en)
import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";

// اسم/أرقام المركز كما تظهر في كروت وشاشات الحجز في الفيجما (بتختلف أحياناً عن W2-26:
// «جونسون Johnson · 4.9 | 5.6 كم | 8 فروع»). الحقول الفاضية بتاخد قيمة providers.ts
export type ProviderDisplay = Partial<Localized<"name">> & {
  rating?: number;
  distance_km?: number;
  branches?: number;
};

// بند قابل للحجز لدى مقدّم خدمة (سطر في ملخص الحجز)
export type BookingItem = Localized<"name"> &
  Localized<"chip"> & {
    id: string;
    provider: string;
    service: ServiceSlug;
    price: number;
  };

export type Branch = Localized<"name"> &
  Localized<"street"> &
  Localized<"district"> &
  Localized<"city"> &
  Localized<"hours"> & {
    id: string;
    provider: string;
    distance_km: number;
    // مكان الدبوس على الخريطة التوضيحية (W2-33c) بالنسبة المئوية من يسار/أعلى الخريطة (الخريطة صورة، ما بتنعكسش)
    map: { x: number; y: number };
    phone: string;
    placeholder?: boolean;
  };

export type CarSize = "sedan" | "suv" | "large";

export type Car = Localized<"make"> &
  Localized<"model"> &
  Localized<"color"> &
  Localized<"plate"> & {
    id: string;
    year: number;
    size: CarSize;
    is_default?: boolean;
  };

export type PaymentMethodId = "apple" | "mada" | "stc" | "tabby" | "tamara" | "card" | "cash";

export type PaymentMethod = Localized<"name"> &
  Localized<"description"> & {
    id: PaymentMethodId;
    badge: string; // نص الشارة (Apple Pay · مدى · tabby …)
    badge_en?: string;
    // verify = نافذة تحقق (P-09/P-09b) · redirect = نافذة تقسيط (P-23) · direct = دفع مباشر
    flow: "direct" | "verify" | "redirect" | "card" | "cash"; // direct: P-26a · card: P-26b ← P-09 · verify: P-09b · redirect: P-23 · cash: P-26c
  };

export type Marketer = Localized<"name"> & {
  code: string;
  credit: number;
  min_total: number;
};

// تأكيد حجز تجريبي (W2-36 / W2-36s) — رقم الحجز والقسيمة والتواريخ من الفيجما
export type Confirmation = Localized<"valid_until"> &
  Localized<"booked_on"> &
  Localized<"customer"> & {
    booking_id: string;
    voucher_code: string;
    share_host: string; // رابط مشاركة القسيمة (P-08): <host>/v/<code>
  };

// حجز مكتمل ينتظر التقييم (W2-39)
export type CompletedBooking = Localized<"service"> &
  Localized<"completed_on"> &
  Localized<"customer_display"> & {
    id: string;
    provider: string;
    criteria: (Localized<"label"> & { key: string; value: number; service_specific?: boolean })[]; // service_specific: «سؤال خاص بخدمة …» (W2-39)
    service_category_ar: string; // «التلميع» في «سؤال خاص بخدمة التلميع»
    service_category_en: string;
    overall: number;
    comment_ar: string;
    comment_en: string;
    points_reward: number;
  };
