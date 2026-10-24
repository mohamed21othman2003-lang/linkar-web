import type { Locale } from "@/i18n/config";

// نصوص واجهة «لينكار للأعمال» (08): المسار، رسائل التحقق في النماذج، الرفع.
// العربي من الفيجما لما يكون موجود؛ رسائل الأخطاء مش موجودة في الفيجما (كتبناها بنفس الأسلوب).
const ar = {
  business: "لينكار للأعمال",
  dealers: "لينكار للوكالات",
  affiliates: "برنامج المسوّقين",
  step: (n: number) => `الخطوة ${n}`,
  errors: {
    required: "هذا الحقل مطلوب.",
    phone: "أدخل رقم جوال سعودي يبدأ بـ 05 ويتكوّن من 10 أرقام.",
    email: "أدخل بريداً إلكترونياً صحيحاً.",
    digits: (n: number) => `أدخل ${n} أرقام.`,
    digits15: "أدخل 15 رقماً.",
    url: "أدخل رابطاً صحيحاً.",
    number: "أدخل عدداً صحيحاً.",
    iban: "أدخل رقم آيبان سعودي صحيح يبدأ بـ SA ويتكوّن من 24 خانة.",
    pickOne: "اختر خياراً واحداً على الأقل.",
    file: "أرفق الملف المطلوب.",
    consent: "يجب الموافقة على الشروط قبل الإرسال.",
    summary: "راجع الحقول المطلوبة قبل الإرسال.",
  },
  remove: "حذف",
  fileDone: (name: string, size: string) => `${name} · ${size}`,
  mb: "ميجابايت",
  kb: "كيلوبايت",
  fileAttached: "أُرفقت الصورة", // P-10n
  photosAttached: (n: number) => `أُرفقت ${n} صور`,
  fileDeleted: "تم حذف الملف", // P-10r
  requestSent: "وصلتنا رسالتك، وسنرد عليك قريباً", // P-10f
  addCity: "إضافة",
  removeCity: (c: string) => `إزالة ${c}`,
  sending: "جارٍ الإرسال…",
  meta: {
    providers: "لينكار لمقدّمي الخدمة",
    providerJoin: "انضم كمقدّم خدمة",
    dealers: "لينكار للوكالات",
    dealerJoin: "طلب الانضمام · وكالة",
    sent: "تم استلام طلبك",
    corporate: "برامج الشركات",
    affiliates: "برنامج المسوّقين",
    affiliateJoin: "طلب الانضمام · مسوّق",
  },
};

const en: typeof ar = {
  business: "Linkar for business",
  dealers: "Linkar for dealerships",
  affiliates: "Affiliate program",
  step: (n: number) => `Step ${n}`,
  errors: {
    required: "This field is required.",
    phone: "Enter a Saudi mobile number starting with 05 (10 digits).",
    email: "Enter a valid email address.",
    digits: (n: number) => `Enter ${n} digits.`,
    digits15: "Enter 15 digits.",
    url: "Enter a valid link.",
    number: "Enter a whole number.",
    iban: "Enter a valid Saudi IBAN starting with SA (24 characters).",
    pickOne: "Choose at least one option.",
    file: "Attach the required file.",
    consent: "You must agree to the terms before submitting.",
    summary: "Check the required fields before submitting.",
  },
  remove: "Remove",
  fileDone: (name: string, size: string) => `${name} · ${size}`,
  mb: "MB",
  kb: "KB",
  fileAttached: "Photo attached",
  photosAttached: (n: number) => `${n} photos attached`,
  fileDeleted: "File deleted",
  requestSent: "We got your message and will reply soon",
  addCity: "Add",
  removeCity: (c: string) => `Remove ${c}`,
  sending: "Sending…",
  meta: {
    providers: "Linkar for service providers",
    providerJoin: "Join as a service provider",
    dealers: "Linkar for dealerships",
    dealerJoin: "Application · Dealership",
    sent: "Application received",
    corporate: "Corporate programs",
    affiliates: "Affiliate program",
    affiliateJoin: "Application · Affiliate",
  },
};

export const getBusinessDict = (locale: Locale) => (locale === "en" ? en : ar);
export type BusinessDict = typeof ar;
