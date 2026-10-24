// ملف آمن للعميل والسيرفر (بدون next/headers)
export type Locale = "ar" | "en";

export const LOCALES: Locale[] = ["ar", "en"];

export const dirOf = (l: Locale): "rtl" | "ltr" => (l === "ar" ? "rtl" : "ltr");

// اختيار النص حسب اللغة
export function pick<T>(locale: Locale, ar: T, en: T): T {
  return locale === "en" ? en : ar;
}

// حقل ثنائي اللغة بنفس شكل الـAPI: name_ar / name_en
export type Localized<K extends string> = { [P in `${K}_ar` | `${K}_en`]: string };

// tx(locale, provider, "name") ← provider.name_ar أو provider.name_en
export function tx<K extends string>(locale: Locale, obj: Localized<K>, key: K): string {
  return locale === "en" ? obj[`${key}_en`] : obj[`${key}_ar`];
}
