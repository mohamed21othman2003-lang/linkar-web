// قواعد التحقق في شاشات الدخول — دوال صافية تشتغل في السيرفر والعميل.
import { routes } from "@/lib/routes";

// رقم جوال سعودي: 5XXXXXXXX (9 أرقام) — نقبل 05… و 9665… و +9665… والمسافات والأرقام العربية
export function normalizeSaudiPhone(raw: string): string | null {
  const latin = raw.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^\d]/g, "");
  const local = latin.replace(/^(00966|966)/, "").replace(/^0/, "");
  return /^5\d{8}$/.test(local) ? local : null;
}

// 551234567 ← «55 123 4567»
export function formatSaudiPhone(local: string, withCode = false): string {
  const s = `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`.trim();
  return withCode ? `+966 ${s}` : s;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// «8 أحرف على الأقل، وتحتوي على رقم وحرف.»
export function isStrongPassword(pw: string) {
  return pw.length >= 8 && /\d/.test(pw) && /\p{L}/u.test(pw);
}

// ?next= — مسارات داخلية بس (يمنع التحويل لموقع خارجي)
export function safeNext(next: string | string[] | undefined | null): string {
  const v = Array.isArray(next) ? next[0] : next;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return routes.account;
  return v;
}

// يبني رابط شاشة دخول مع ?next= و ?phone= … (next الافتراضي ما بيتكتبش)
export function authHref(base: string, params: Record<string, string | null | undefined> = {}): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!v) continue;
    if (k === "next" && v === routes.account) continue;
    p.set(k, v);
  }
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}
