import type { BookingItem, ProviderDisplay } from "./types";

// تخصيصات بنود الحجز (اسم الشيب على الخريطة W2-33c). الأسعار والأسماء من lib/data/provider-details (صفحة المزوّد).
// المصدر: ملخص الحجز في W2-33…W2-35 («Johnson Ceramic Pro 1,899» + «تفصيل داخلي كامل 449»)
// وخريطة W2-33c (شيبس «تفصيل داخلي» و«نانو سيراميك»). باقي البنود بتيجي من العروض والباقات.
export const bookingItems: BookingItem[] = [
  {
    id: "interior-detailing",
    provider: "johnson",
    service: "wash",
    name_ar: "تفصيل داخلي كامل",
    name_en: "Full interior detailing",
    chip_ar: "تفصيل داخلي",
    chip_en: "Interior detailing",
    price: 449,
  },
];

// الاسم والأرقام كما تظهر في شاشات الحجز والعروض والباقات (الفيجما)
export const providerDisplay: Record<string, ProviderDisplay> = {
  johnson: { name_ar: "جونسون Johnson", name_en: "Johnson", rating: 4.9, distance_km: 5.6, branches: 8 },
};
