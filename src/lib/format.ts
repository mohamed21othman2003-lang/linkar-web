import type { Locale } from "@/i18n/config";

// الأرقام في التصميم العربي بالأرقام اللاتينية (1,399 ر.س)، فبنستخدم en-US للأرقام في اللغتين
const num = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  return num.format(n);
}

// الكسور دايماً رقمين (743.5 ← 743.50) والأرقام الصحيحة من غير كسور
const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// «1,399 ر.س» بالعربي و«SAR 1,399» بالإنجليزي — مسافة غير قابلة للكسر عشان الرقم والعملة ما يتفصلوش على سطرين
export function formatPrice(locale: Locale, amount: number): string {
  const n = Number.isInteger(Math.round(amount * 100) / 100) ? num.format(Math.round(amount)) : money.format(amount);
  return locale === "en" ? `SAR ${n}` : `${n} ر.س`;
}

export function currency(locale: Locale): string {
  return locale === "en" ? "SAR" : "ر.س";
}

// «الأحد 25 أكتوبر» / «Sun 25 Oct»
export function formatDate(locale: Locale, iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  const tag = locale === "en" ? "en-GB" : "ar-SA-u-ca-gregory-nu-latn";
  return new Intl.DateTimeFormat(tag, opts).format(new Date(iso));
}
