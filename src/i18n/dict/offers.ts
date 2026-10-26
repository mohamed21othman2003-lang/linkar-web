import type { Locale } from "@/i18n/config";

// نصوص العروض والباقات الجديدة في تصميم العميل المعدّل (AVbWFtRb0aHpm34oqkI5ot · W2-40 / W2-41 / W2-42).
// الباقي لسه في dict/booking.ts. العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا.
const ar = {
  // عنوان لوحة الفلاتر (مع أيقونة filter)
  filterOffers: "فلتر العروض",
  filterPackages: "فلتر الباقات",
  // كارت الحجز في W2-42: الفرع الأقرب
  branchAway: (km: string) => `على بُعد ${km} كم من موقعك · الأقرب إليك`,
};

const en: typeof ar = {
  filterOffers: "Filter offers",
  filterPackages: "Filter packages",
  branchAway: (km: string) => `${km} km from you · Nearest to you`,
};

export const getOffersDict = (locale: Locale) => (locale === "en" ? en : ar);
