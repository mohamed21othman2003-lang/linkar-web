// طبقة بيانات الدخول (القسم 05) — دلوقتي بيانات تجريبية؛ في المرحلة 3 الدوال دي بس هي اللي تتغيّر
// (إرسال OTP حقيقي، التحقق، تسجيل الدخول بالبريد، استعادة كلمة المرور).
import { cookies } from "next/headers";
import * as data from "@/lib/data/auth/auth";
import { routes } from "@/lib/routes";

// كوكي قصير بعد التحقق من الرقم لعميل جديد — عشان «أكمل حسابك» ما تتفتحش من غير تحقق
export const VERIFIED_PHONE_COOKIE = "linkar_verified_phone";

export async function getAuthContent() {
  return data;
}

// ---------- قواعد التحقق (مشتركة بين السيرفر والعميل عن طريق auth-rules) ----------
export { normalizeSaudiPhone, isValidEmail, isStrongPassword, formatSaudiPhone, safeNext, authHref } from "@/lib/data/auth/rules";

export async function isExistingPhone(phone: string) {
  return phone === data.DEMO_EXISTING_PHONE;
}

export async function checkOtp(_phone: string, code: string) {
  return code === data.DEMO_OTP;
}

export async function checkEmailLogin(email: string, password: string) {
  return email.trim().toLowerCase() === data.DEMO_EXISTING_EMAIL && password.length > 0;
}

export async function isValidInvite(code: string) {
  return data.INVITE_CODES.includes(code.trim().toUpperCase());
}

export async function getVerifiedPhone() {
  return (await cookies()).get(VERIFIED_PHONE_COOKIE)?.value ?? null;
}

export const defaultNext = routes.account;
