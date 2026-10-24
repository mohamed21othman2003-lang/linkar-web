import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getNotificationFeed } from "@/lib/server/account";
import { routes } from "@/lib/routes";
import type { UiGlyph } from "@/components/icons/Icon";
import { NotificationsFeed, type FeedItemView } from "@/components/account/notifications-feed";

export async function generateMetadata(): Promise<Metadata> {
  const t = getAccountDict(await getLocale()).notifications;
  return { title: t.title, description: t.subtitle };
}

const tabs = ["bookings", "offers", "points", "complaints"] as const;

// W2-73 · الإشعارات — التبويب من ?tab= (W2-73-t2…t5)، والعميل الجديد W2-73-0
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const feed = await getNotificationFeed(user);
  const items: FeedItemView[] = feed.map((n) => ({
    id: n.id,
    kind: n.kind as UiGlyph,
    unread: n.unread,
    group: n.group,
    // تبويب «النقاط والهدايا» بيجمع النقاط والهدايا
    tab: n.category === "account" ? "points" : n.category,
    title: tx(locale, n, "title"),
    body: tx(locale, n, "body"),
    time: tx(locale, n, "time"),
    href: n.href,
  }));
  return <NotificationsFeed locale={locale} items={items} initialTab={tabs.find((k) => k === sp.tab) ?? "all"} />;
}
