"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/server/session";
import { routes } from "@/lib/routes";

// تسجيل دخول تجريبي (بعد رمز التحقق) — kind: "user" عميل حالي، "new" عميل جديد
export async function signIn(kind: "user" | "new" = "user", next: string = routes.account) {
  (await cookies()).set(SESSION_COOKIE, kind, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  redirect(next);
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(routes.home);
}
