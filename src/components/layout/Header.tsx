import { getLocale } from "@/i18n/locale";
import { pick, tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSite } from "@/lib/server/content";
import { getSession } from "@/lib/server/session";
import { notifications } from "@/lib/data/notifications";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { MenuItem } from "@/lib/data/types";
import type { UiGlyph } from "@/components/icons/Icon";
import { HeaderClient, type HeaderView, type NavKey } from "./HeaderClient";

// الهيدر (server): بيجهّز النصوص حسب اللغة والجلسة، والتفاعل كله في HeaderClient
export async function Header({ variant = "light" }: { variant?: "hero" | "light" }) {
  const [locale, site, user] = await Promise.all([getLocale(), getSite(), getSession()]);
  const t = getCommon(locale);
  const h = site.header;
  const item = (i: MenuItem) => ({ title: tx(locale, i, "title"), subtitle: tx(locale, i, "subtitle"), href: i.href, icon: i.icon, highlighted: i.highlighted });
  const link = (l: { label_ar: string; label_en: string; href: string }) => ({ label: tx(locale, l, "label"), href: l.href });
  const am = site.aboutMenu;
  const bm = site.businessMenu;
  type CardData = Record<"eyebrow_ar" | "eyebrow_en" | "title_ar" | "title_en" | "body_ar" | "body_en" | "cta_ar" | "cta_en" | "login_ar" | "login_en", string> & {
    cta_href: string;
    login_href: string;
  };
  const card = (c: CardData) => ({
    eyebrow: tx(locale, c, "eyebrow"),
    title: tx(locale, c, "title"),
    body: tx(locale, c, "body"),
    cta: tx(locale, c, "cta"),
    ctaHref: c.cta_href,
    login: tx(locale, c, "login"),
    loginHref: c.login_href,
  });
  const unread = notifications.filter((n) => n.unread).length;

  const v: HeaderView = {
    locale,
    brand: tx(locale, site, "brand_name"),
    nav: Object.fromEntries(Object.entries(site.nav).map(([k, l]) => [k, link(l)])) as HeaderView["nav"] & Record<NavKey, never>,
    search: tx(locale, h, "search"),
    signIn: tx(locale, h, "sign_in"),
    langLabel: pick(locale, h.switch_to_en, h.switch_to_ar),
    menuLabel: tx(locale, h, "menu"),
    closeLabel: tx(locale, h, "close"),
    about: {
      // «حمّل التطبيق» بيودّي لقسم التطبيق في الرئيسية لحد ما روابط المتاجر تتحدد
      featured: {
        eyebrow: tx(locale, am.featured, "eyebrow"),
        title: tx(locale, am.featured, "title"),
        body: tx(locale, am.featured, "body"),
        cta: tx(locale, am.featured, "cta"),
        ctaHref: `${routes.home}#app`,
      },
      customersTitle: tx(locale, am, "customers_title"),
      customers: am.customers.map(item),
      aboutTitle: tx(locale, am, "about_title"),
      about: am.about.map(item),
      policiesLabel: tx(locale, am, "policies_label"),
      policies: am.policies.map(link),
    },
    business: {
      providersCard: card(bm.providersCard),
      dealersCard: card(bm.dealersCard),
      providersTitle: tx(locale, bm, "providers_title"),
      providers: bm.providers.map(item),
      companiesTitle: tx(locale, bm, "companies_title"),
      companies: bm.companies.map(item),
      affiliatesTitle: tx(locale, bm, "affiliates_title"),
      affiliates: bm.affiliates.map(link),
    },
    firstName: user ? tx(locale, user, "first_name") : null,
    account: user
      ? {
          name: tx(locale, user, "name"),
          initial: tx(locale, user, "initial"),
          meta: `${t.points(formatNumber(user.points))} · ‎${user.phone}‎`,
          links: [
            { label: t.accountLinks.account, href: routes.account, icon: "user" as UiGlyph },
            { label: t.accountLinks.bookings, href: routes.bookings(), icon: "calendar" as UiGlyph },
            { label: t.accountLinks.gifts, href: routes.dealerPackages, icon: "gift" as UiGlyph },
            { label: t.accountLinks.settings, href: routes.settings, icon: "settings" as UiGlyph },
          ],
          notificationsTitle: t.notifications,
          newCount: t.newCount(unread),
          markAllRead: t.markAllRead,
          notifications: (user.is_new ? [] : notifications).map((n) => ({
            id: n.id,
            kind: n.kind as UiGlyph,
            unread: n.unread,
            title: tx(locale, n, "title"),
            body: tx(locale, n, "body"),
            time: tx(locale, n, "time"),
            href: n.href,
          })),
          viewAll: t.viewAllNotifications,
          viewAllHref: routes.notifications(),
          signOut: t.signOut,
        }
      : null,
  };
  return <HeaderClient v={v} variant={variant} />;
}
