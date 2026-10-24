// بيانات لوحة التصفية في W2-40 / W2-41 (الفيجما): السيارة المختارة ومنطقة العميل وحدود السعر
export const listingContext = {
  car_ar: "تويوتا كامري 2023",
  car_en: "Toyota Camry 2023",
  car_full_ar: "تويوتا كامري 2023 · سيدان",
  car_full_en: "Toyota Camry 2023 · Sedan",
  area_ar: "حي الروضة، جدة",
  area_en: "Al Rawdah, Jeddah",
  // نطاق السعر المعروض في الفلتر (من/إلى)
  offers_price: { min: 500, max: 8000 },
  packages_price: { min: 1000, max: 8000 },
  // ترتيب مقدّمي الخدمة في لوحة التصفية (من الفيجما)
  offers_providers: ["xpel", "autoshabo", "lamaa"],
  packages_providers: ["xpel", "llumar", "nanoshield", "johnson"],
};
