import type { Locale } from "@/i18n/config";

// نصوص واجهة «عن لينكار» و«تواصل معنا» (W2-95 · W2-96). رسائل التحقق مش في الفيجما — صياغتنا (للمراجعة).
const ar = {
  required: "هذا الحقل مطلوب.",
  phoneInvalid: "أدخل رقم جوال صحيح، مثال: 05X XXX XXXX.",
  socialLabel: "حسابات لينكار",
  whatsapp: "واتساب",
};

const en: typeof ar = {
  required: "This field is required.",
  phoneInvalid: "Enter a valid mobile number, e.g. 05X XXX XXXX.",
  socialLabel: "Linkar accounts",
  whatsapp: "WhatsApp",
};

export const getAboutDict = (locale: Locale) => (locale === "en" ? en : ar);
export type AboutDict = typeof ar;
