// طبقة بيانات المساعدة (W2-97 · W2-97b · W2-98 · W2-404 · P-21 · P-22).
import { helpPage, helpTopics, helpArticles, contactBand } from "@/lib/data/help/help-center";
import { faqPage, faqTabs, type FaqTabKey } from "@/lib/data/help/faq";
import { notFoundPage } from "@/lib/data/help/not-found";
import { statusPages, type StatusKey } from "@/lib/data/help/status";
import { assistantPopup, whatsappPopup } from "@/lib/data/help/popups";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import type { HelpPopupsCopy } from "@/components/help/HelpPopupButton";

export async function getHelpPage() {
  return { page: helpPage, topics: helpTopics, articles: helpArticles, band: contactBand };
}

export async function getHelpArticles() {
  return helpArticles;
}

export async function getHelpArticle(slug: string) {
  const article = helpArticles.find((a) => a.slug === slug);
  if (!article) return undefined;
  const topic = helpTopics.find((t) => t.key === article.topic)!;
  const related = article.related.map((s) => helpArticles.find((a) => a.slug === s)).filter((a) => !!a);
  return { article, topic, related, page: helpPage, band: contactBand };
}

export async function getFaq() {
  return { page: faqPage, tabs: faqTabs, band: contactBand };
}

export function isFaqTab(v: string | undefined): v is FaqTabKey {
  return faqTabs.some((t) => t.key === v);
}

export async function getNotFoundPage() {
  return notFoundPage;
}

// صفحات الحالة (W2-500 · W2-offline · W2-503 · W2-410 · W2-403 · W2-401)
export async function getStatusPage(key: StatusKey) {
  return statusPages[key];
}

// نصوص P-21 / P-22 — للأزرار العائمة (Fabs) وأيقونة واتساب في «تواصل معنا»
export async function getHelpPopups() {
  return { assistant: assistantPopup, whatsapp: whatsappPopup };
}

// نصوص P-21 / P-22 جاهزة باللغة الحالية — تتبعت لـ <HelpPopupButton copy={…} /> (@/components/help/HelpPopupButton)
export async function getHelpPopupsCopy(): Promise<HelpPopupsCopy> {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const a = assistantPopup;
  const w = whatsappPopup;
  const name = user ? tx(locale, user, "first_name") : null;
  return {
    assistant: {
      title: tx(locale, a, "title"),
      status: tx(locale, a, "status"),
      greeting: name ? tx(locale, a, "greeting").replace("{name}", name) : tx(locale, a, "greeting_guest"),
      prompt: tx(locale, a, "prompt"),
      quick: a.quick
        .filter((q) => !("userOnly" in q && q.userOnly) || (user && !user.is_new))
        .map((q) => ({ key: q.key, label: tx(locale, q, "label").replace("{booking}", a.demo_booking), href: q.href })),
      placeholder: tx(locale, a, "input_placeholder"),
      send: tx(locale, a, "send"),
      note: tx(locale, a, "note"),
      pendingReply: tx(locale, a, "pending_reply"),
      close: tx(locale, a, "close"),
    },
    whatsapp: { title: tx(locale, w, "title"), body: tx(locale, w, "body"), open: tx(locale, w, "open"), close: tx(locale, w, "close"), href: w.href },
  };
}
