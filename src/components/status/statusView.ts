import { tx, type Locale } from "@/i18n/config";
import type { StatusContent } from "@/lib/data/help/status";
import type { StatusActionView } from "./StatusPage";

// محتوى صفحة الحالة باللغة المطلوبة
export function statusView(locale: Locale, s: StatusContent): { code?: string; title: string; body: string; actions: StatusActionView[] } {
  return {
    code: s.code,
    title: tx(locale, s, "title"),
    body: tx(locale, s, "body"),
    actions: s.actions.map((a) => ({ label: tx(locale, a, "label"), href: a.href, retry: a.retry, primary: a.primary })),
  };
}
