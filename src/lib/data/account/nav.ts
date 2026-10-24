import { routes } from "@/lib/routes";

// القائمة الجانبية لحساب العميل (Account nav · 748:7865) — نفس الترتيب في كل صفحات الحساب
export const accountNav = [
  { key: "home", label_ar: "الرئيسية", label_en: "Overview", href: routes.account },
  { key: "bookings", label_ar: "حجوزاتي", label_en: "My bookings", href: routes.bookings() },
  { key: "favorites", label_ar: "المفضلة", label_en: "Favorites", href: routes.favorites() },
  { key: "points", label_ar: "النقاط", label_en: "Points", href: routes.points },
  { key: "gifts", label_ar: "الهدايا", label_en: "Gifts", href: routes.dealerPackages },
  { key: "cars", label_ar: "سياراتي", label_en: "My cars", href: routes.cars },
  { key: "payment", label_ar: "طرق الدفع", label_en: "Payment methods", href: routes.paymentMethods },
  { key: "reviews", label_ar: "التقييمات", label_en: "Reviews", href: routes.reviews },
  { key: "complaints", label_ar: "الشكاوى والمقترحات", label_en: "Complaints and suggestions", href: routes.complaints() },
  { key: "settings", label_ar: "الإعدادات", label_en: "Settings", href: routes.settings },
];

export const accountNavCopy = {
  sign_out_ar: "تسجيل الخروج",
  sign_out_en: "Sign out",
};
