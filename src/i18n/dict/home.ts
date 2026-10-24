import type { Locale } from "@/i18n/config";

// كلمات واجهة صغيرة خاصة بالرئيسية (أزرار الأسهم، تسميات الوصول، …).
// محتوى الصفحة نفسه في lib/data/home/home.ts
const ar = {
  metaTitle: "لينكار — عناية بسيارتك تستحق الثقة",
  metaDescription: "اختر خدماتك وقارن بين مقدمي الخدمة المعتمدين",
  close: "إغلاق",
  previous: "السابق",
  next: "التالي",
  slide: "الشريحة",
  servicesGroup: "اختر الخدمات",
  carType: "نوع السيارة",
  location: "الموقع",
  filter: "تصفية",
  rating: (v: string) => `التقييم ${v}`,
};

const en: typeof ar = {
  metaTitle: "Linkar — Car care that deserves your trust",
  metaDescription: "Choose your services and compare certified providers",
  close: "Close",
  previous: "Previous",
  next: "Next",
  slide: "Slide",
  servicesGroup: "Choose services",
  carType: "Car type",
  location: "Location",
  filter: "Filter",
  rating: (v: string) => `Rating ${v}`,
};

export const getHomeDict = (locale: Locale) => (locale === "en" ? en : ar);
export type HomeDict = typeof ar;
