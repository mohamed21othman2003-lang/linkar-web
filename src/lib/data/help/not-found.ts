import { routes } from "@/lib/routes";

// W2-404 · الصفحة غير موجودة (760:14089) — العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
export const notFoundPage = {
  code: "404",
  title_ar: "الصفحة غير موجودة",
  title_en: "Page not found",
  body_ar: "ربما تغيّر الرابط أو انتهى العرض. ابدأ من الرئيسية أو ابحث عن الخدمة التي تريدها.",
  body_en: "The link may have changed or the offer may have ended. Start from the home page or search for the service you want.",
  search_placeholder_ar: "ابحث عن خدمة أو مقدّم خدمة",
  search_placeholder_en: "Search for a service or provider",
  // ترتيب القراءة: الأساسي أولاً
  actions: [
    { label_ar: "الصفحة الرئيسية", label_en: "Home page", href: routes.home, primary: true },
    { label_ar: "العروض", label_en: "Offers", href: routes.offers },
    { label_ar: "مركز المساعدة", label_en: "Help center", href: routes.help },
  ],
};
