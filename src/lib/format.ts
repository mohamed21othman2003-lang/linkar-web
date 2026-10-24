import type { Locale } from "@/i18n/config";

// الأرقام في التصميم العربي بالأرقام اللاتينية (1,399 ر.س)، فبنستخدم en-US للأرقام في اللغتين
const num = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return num.format(n);
}

// «1,399 ر.س» بالعربي و«SAR 1,399» بالإنجليزي
export function formatPrice(locale: Locale, amount: number): string {
  return locale === "en" ? `SAR ${num.format(amount)}` : `${num.format(amount)} ر.س`;
}

export function currency(locale: Locale): string {
  return locale === "en" ? "SAR" : "ر.س";
}

// «الأحد 25 أكتوبر» / «Sun 25 Oct»
export function formatDate(locale: Locale, iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  const tag = locale === "en" ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn";
  return new Intl.DateTimeFormat(tag, opts).format(new Date(iso));
}
