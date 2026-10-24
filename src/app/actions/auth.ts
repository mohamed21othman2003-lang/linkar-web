"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/app/actions/session";
import { routes } from "@/lib/routes";
import type { AuthError } from "@/i18n/dict/auth";
import {
  VERIFIED_PHONE_COOKIE,
  authHref,
  checkEmailLogin,
  checkOtp,
  isExistingPhone,
  isStrongPassword,
  isValidEmail,
  isValidInvite,
  normalizeSaudiPhone,
  safeNext,
} from "@/lib/server/auth";

// تسجيل الدخول التجريبي (القسم 05) — مفيش SMS ولا إيميل حقيقي.
export type AuthState = { error?: AuthError; field?: string; ok?: boolean } | null;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

// W2-50 ← W2-50b
export async function sendOtp(_: AuthState, fd: FormData): Promise<AuthState> {
  const phone = normalizeSaudiPhone(str(fd, "phone"));
  if (!phone) return { error: "phoneInvalid", field: "phone" };
  redirect(authHref(routes.loginVerify, { phone, next: safeNext(str(fd, "next")) }));
}

// W2-50b: عميل حالي ← يدخل على طول · عميل جديد ← W2-50d
export async function verifyOtp(phoneRaw: string, code: string, nextRaw: string): Promise<{ ok: false }> {
  const phone = normalizeSaudiPhone(phoneRaw);
  const next = safeNext(nextRaw);
  if (!phone) redirect(authHref(routes.login, { next }));
  if (!(await checkOtp(phone, code))) return { ok: false };
  if (await isExistingPhone(phone)) await signIn("user", next);
  (await cookies()).set(VERIFIED_PHONE_COOKIE, phone, { path: "/", maxAge: 60 * 30, sameSite: "lax", httpOnly: true });
  redirect(authHref(routes.loginComplete, { next }));
}

// W2-50d — يتحقق من البيانات؛ لو تمام العميل بيشوف P-24 «أضف سيارتك» قبل الدخول
export async function completeAccount(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!str(fd, "first_name").trim() || !str(fd, "last_name").trim()) return { error: "nameRequired", field: "name" };
  const email = str(fd, "email").trim();
  const password = str(fd, "password");
  if (email && !isValidEmail(email)) return { error: "emailInvalid", field: "email" };
  if ((email || password) && !isStrongPassword(password)) return { error: "passwordWeak", field: "password" };
  const invite = str(fd, "invite").trim();
  if (invite && !(await isValidInvite(invite))) return { error: "inviteInvalid", field: "invite" };
  if (fd.get("terms") !== "on") return { error: "termsRequired", field: "terms" };
  return { ok: true };
}

// P-24 «إضافة السيارة والمتابعة» / «لاحقاً» ← جلسة عميل جديد
export async function finishSignup(nextRaw: string) {
  (await cookies()).delete(VERIFIED_PHONE_COOKIE);
  await signIn("new", safeNext(nextRaw));
}

// W2-50e
export async function emailLogin(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email");
  const password = str(fd, "password");
  if (!isValidEmail(email)) return { error: "emailInvalid", field: "email" };
  if (!password) return { error: "passwordRequired", field: "password" };
  if (!(await checkEmailLogin(email, password))) return { error: "wrongCredentials", field: "password" };
  await signIn("user", safeNext(str(fd, "next")));
  return null;
}

// «المتابعة مع Google / Apple» — تجريبي، زي البروتوتايب: يروح لـ«أكمل حسابك» (W2-50d)
export async function socialLogin(nextRaw: string) {
  const next = safeNext(nextRaw);
  (await cookies()).set(VERIFIED_PHONE_COOKIE, "social", { path: "/", maxAge: 60 * 30, sameSite: "lax", httpOnly: true });
  redirect(authHref(routes.loginComplete, { next }));
}

// W2-50f ← W2-50g
export async function requestReset(_: AuthState, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").trim();
  if (!isValidEmail(email)) return { error: "emailInvalid", field: "email" };
  redirect(authHref(routes.forgotPasswordSent, { email, next: safeNext(str(fd, "next")) }));
}

// W2-50h ← تسجيل الدخول بالبريد
export async function resetPassword(_: AuthState, fd: FormData): Promise<AuthState> {
  const password = str(fd, "password");
  if (!isStrongPassword(password)) return { error: "passwordWeak", field: "password" };
  if (password !== str(fd, "confirm")) return { error: "passwordMismatch", field: "confirm" };
  redirect(authHref(routes.loginEmail, { next: safeNext(str(fd, "next")) }));
}
