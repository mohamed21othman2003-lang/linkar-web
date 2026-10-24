import type { Locale } from "@/i18n/config";

// رسائل التحقق في شاشات الدخول (القسم 05). الفيجما ما فيهاش حالات الخطأ دي — صياغتنا (للمراجعة).
const ar = {
  phoneInvalid: "أدخل رقم جوال سعودي صحيح يبدأ بـ 5 ومن 9 أرقام.",
  codeIncomplete: "أدخل الرمز كاملاً من 4 أرقام.",
  emailInvalid: "أدخل بريداً إلكترونياً صحيحاً.",
  passwordRequired: "أدخل كلمة المرور.",
  passwordWeak: "كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على رقم وحرف.",
  passwordMismatch: "كلمتا المرور غير متطابقتين.",
  wrongCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  nameRequired: "أدخل الاسم الأول واسم العائلة.",
  termsRequired: "يجب الموافقة على الشروط والأحكام وسياسة الخصوصية للمتابعة.",
  inviteInvalid: "رمز الدعوة غير صحيح.",
  phonePrefix: "مفتاح الدولة",
};

const en: typeof ar = {
  phoneInvalid: "Enter a valid Saudi mobile number: 9 digits starting with 5.",
  codeIncomplete: "Enter the full 4-digit code.",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Enter your password.",
  passwordWeak: "Password must be at least 8 characters and include a number and a letter.",
  passwordMismatch: "Passwords don't match.",
  wrongCredentials: "Incorrect email or password.",
  nameRequired: "Enter your first and last name.",
  termsRequired: "Please accept the Terms & Conditions and Privacy Policy to continue.",
  inviteInvalid: "Invalid invite code.",
  phonePrefix: "Country code",
};

export const getAuthDict = (locale: Locale) => (locale === "en" ? en : ar);
export type AuthDict = typeof ar;
export type AuthError = keyof Omit<AuthDict, "phonePrefix">;
