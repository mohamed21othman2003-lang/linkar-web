import { cookies } from "next/headers";
import type { Locale } from "@/i18n/config";

export type { Locale } from "@/i18n/config";
export { LOCALES, dirOf, pick } from "@/i18n/config";

// قراءة اللغة الحالية من الكوكي (سيرفر فقط) — الافتراضي عربي
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("locale")?.value === "en" ? "en" : "ar";
}
