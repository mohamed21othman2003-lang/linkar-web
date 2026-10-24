import { tx, type Locale } from "@/i18n/config";
import { getAuthContent } from "@/lib/server/auth";
import type { SidePanelCopy } from "./ui";

// تجهيز النصوص المشتركة بين شاشات الدخول حسب اللغة
export async function getAuthCommon(locale: Locale) {
  const c = await getAuthContent();
  const side: SidePanelCopy = {
    logoLabel: locale === "en" ? "LINKAR" : "لينكار",
    title: tx(locale, c.sidePanel, "title"),
    benefits: c.sidePanel.benefits.map((b) => ({ icon: b.icon, text: tx(locale, b, "text") })),
    note: tx(locale, c.sidePanel, "note"),
  };
  const s = c.shared;
  return {
    c,
    side,
    t: {
      tabPhone: tx(locale, s, "tab_phone"),
      tabEmail: tx(locale, s, "tab_email"),
      or: tx(locale, s, "or"),
      google: tx(locale, s, "google"),
      apple: tx(locale, s, "apple"),
      businessTitle: tx(locale, s, "business_title"),
      backToLogin: tx(locale, s, "back_to_login"),
      emailLabel: tx(locale, s, "email_label"),
      emailPlaceholder: tx(locale, s, "email_placeholder"),
      passwordLabel: tx(locale, s, "password_label"),
      passwordHint: tx(locale, s, "password_hint"),
    },
    business: c.businessLinks.map((l) => ({ key: l.key, label: tx(locale, l, "label"), href: l.href })),
    consent: {
      before: tx(locale, c.consent, "before"),
      terms: tx(locale, c.consent, "terms"),
      and: tx(locale, c.consent, "and"),
      privacy: tx(locale, c.consent, "privacy"),
      after: tx(locale, c.consent, "after"),
    },
  };
}
