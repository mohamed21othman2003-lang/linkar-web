import { routes } from "@/lib/routes";

// صفحات الحالة (تصميم العميل المعدّل · القسم 09): W2-500 · W2-offline · W2-503 · W2-410 · W2-403 · W2-401
// (W2-404 في not-found.ts). العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
// actions بترتيب القراءة: الأساسي (الليموني) أولاً. retry = «إعادة المحاولة» (بيعيد تحميل الصفحة/المقطع).

export type StatusKey = "server-error" | "offline" | "maintenance" | "link-expired" | "forbidden" | "session-expired";

export type StatusAction = { label_ar: string; label_en: string; href?: string; retry?: boolean; primary?: boolean };

export type StatusContent = {
  code?: string;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  actions: StatusAction[];
};

const home = { label_ar: "الصفحة الرئيسية", label_en: "Home page", href: routes.home };
const help = { label_ar: "مركز المساعدة", label_en: "Help center", href: routes.help };
const login = { label_ar: "تسجيل الدخول", label_en: "Log in", href: routes.login };
const retry = { label_ar: "إعادة المحاولة", label_en: "Try again", retry: true };

export const statusPages: Record<StatusKey, StatusContent> = {
  // W2-500 · خطأ في الخادم (85:47978) — error.tsx / global-error.tsx
  "server-error": {
    code: "500",
    title_ar: "حدث خطأ من جهتنا",
    title_en: "Something went wrong on our side",
    body_ar: "نعمل على إصلاحه الآن. حاول مرة أخرى بعد قليل، وحجوزاتك ومدفوعاتك محفوظة.",
    body_en: "We’re fixing it now. Please try again shortly — your bookings and payments are safe.",
    actions: [{ ...retry, primary: true }, home, help],
  },
  // W2-offline · لا يوجد اتصال (85:47999) — بيظهر كمان من error.tsx لو المتصفح offline
  offline: {
    title_ar: "لا يوجد اتصال بالإنترنت",
    title_en: "No internet connection",
    body_ar: "تحقق من الشبكة ثم أعد المحاولة، ولن نفقد ما اخترته من خدمات.",
    body_en: "Check your network and try again — we won’t lose the services you picked.",
    actions: [{ ...retry, primary: true }],
  },
  // W2-503 · صيانة مجدولة (85:48020)
  maintenance: {
    code: "503",
    title_ar: "لينكار في صيانة مجدولة",
    title_en: "Linkar is under scheduled maintenance",
    body_ar: "نحسّن المنصة ونعود خلال ساعة تقريباً. قسائمك صالحة ويمكنك استخدامها في الفرع كالمعتاد.",
    body_en: "We’re improving the platform and will be back in about an hour. Your vouchers are still valid and you can use them at the branch as usual.",
    actions: [{ ...help, primary: true }, { label_ar: "تواصل مع لينكار", label_en: "Contact Linkar", href: routes.contact }],
  },
  // W2-410 · الرابط منتهي (85:48041)
  "link-expired": {
    code: "410",
    title_ar: "انتهت صلاحية هذا الرابط",
    title_en: "This link has expired",
    body_ar: "روابط الرسائل صالحة لمدة محدودة. سجّل الدخول لتجد قسائمك وحجوزاتك في «حجوزاتي».",
    body_en: "Message links are valid for a limited time. Log in to find your vouchers and bookings in “My bookings”.",
    actions: [{ ...login, primary: true }, home],
  },
  // W2-403 · غير مصرّح (85:48062)
  forbidden: {
    code: "403",
    title_ar: "ليس لديك صلاحية لعرض هذه الصفحة",
    title_en: "You don’t have permission to view this page",
    body_ar: "قد تكون الصفحة خاصة بحساب آخر. سجّل الدخول بالحساب الصحيح أو ارجع للرئيسية.",
    body_en: "The page may belong to another account. Log in with the right account or go back to the home page.",
    actions: [{ ...login, primary: true }, home],
  },
  // W2-401 · انتهت الجلسة (85:48083)
  "session-expired": {
    code: "401",
    title_ar: "انتهت جلستك",
    title_en: "Your session has expired",
    body_ar: "لحماية حسابك سجّلنا خروجك بعد فترة من عدم الاستخدام. سجّل الدخول للمتابعة من حيث توقفت.",
    body_en: "To protect your account we logged you out after a period of inactivity. Log in to continue where you left off.",
    actions: [{ ...login, primary: true }, home],
  },
};
