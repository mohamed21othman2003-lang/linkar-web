import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { getSession } from "@/lib/server/session";
import { getServices } from "@/lib/server/content";
import { getFavorites } from "@/lib/server/account-extra";
import { favoritesPage as p, type FavoriteTab } from "@/lib/data/account/favorites-data";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { ProviderCard } from "@/components/cards/ProviderCard";
import { AxEmpty, AxSectionHead, AxTabs, AxTitle } from "@/components/account/account-extra-ui";
import { FavoritesHeart } from "@/components/account/favorites-heart";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

const TABS: FavoriteTab[] = ["all", "providers", "saved"];

// W2-64 · المفضلة (749:7852) — تبويبات «W2-64 · تبويبات» (1132:34315): الكل / مقدّمو الخدمة / الخدمات والباقات
// W2-64-0 · حالة فارغة (1071:600) للعميل الجديد
export default async function FavoritesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const t = getAccountExtra(locale);
  const [{ providers, saved }, services] = await Promise.all([getFavorites(user), getServices()]);
  const tab: FavoriteTab = TABS.includes(sp.tab as FavoriteTab) ? (sp.tab as FavoriteTab) : "all";
  const empty = providers.length + saved.length === 0;

  const counts: Record<FavoriteTab, number> = { all: providers.length + saved.length, providers: providers.length, saved: saved.length };
  const tabLabel = (k: FavoriteTab) => `${tx(locale, p, `tab_${k}`)} (${formatNumber(counts[k])})`;

  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={tx(locale, p, "title")} description={tx(locale, p, "description")} />

      {empty ? (
        <AxEmpty
          icon="heart"
          title={tx(locale, p, "empty_title")}
          text={tx(locale, p, "empty_text")}
          cta={{ label: tx(locale, p, "empty_cta"), href: routes.providers() }}
        />
      ) : (
        <>
          <AxTabs
            label={tx(locale, p, "title")}
            items={TABS.map((k) => ({ key: k, label: tabLabel(k), href: routes.favorites(k === "all" ? undefined : k), active: tab === k }))}
          />

          {/* «W2-64 · تبويبات»: CHANGE_TO DISSOLVE 200ms EASE_OUT */}
          <div key={tab} className="flex animate-dissolve flex-col gap-6">
          {tab !== "saved" && (
            <section aria-labelledby="fav-providers" className="flex flex-col gap-6">
              <AxSectionHead id="fav-providers" title={tx(locale, p, "providers_title")} subtitle={tx(locale, p, "providers_subtitle")} />
              {/* 3 كروت 301 (زي الفيجما) محتاجة 935px — المحتوى على 1280 عرضه 816 بس، فـ3 أعمدة مرنة من 1280 والثابتة من 1400
                  (كلها بالـpx: Tailwind بيطلّع الـbreakpoints العشوائية قبل sm/xl فكانت بتتغطّى) */}
              <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1280px]:grid-cols-3 min-[1400px]:grid-cols-[repeat(3,301px)]">
                {providers.map(({ provider, branch }) => (
                  <ProviderCard key={provider.slug} locale={locale} provider={provider} services={services} showBadges meta={tx(locale, branch, "label")} />
                ))}
              </div>
            </section>
          )}

          {tab !== "providers" && (
            <section aria-labelledby="fav-saved" className="flex flex-col gap-6">
              <AxSectionHead id="fav-saved" title={tx(locale, p, "saved_title")} subtitle={tx(locale, p, "saved_subtitle")} />
              <ul className="flex flex-col gap-3">
                {saved.map((s) => {
                  const href = s.package_slug ? routes.package(s.package_slug) : routes.providerService(s.provider, s.service!);
                  return (
                    <li
                      key={s.id}
                      className="flex flex-col gap-4 rounded-[20px] border border-cool-gray bg-white p-[18px] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="hidden shrink-0 gap-1 sm:flex">
                          {s.services.map((sv) => (
                            <span key={sv} className="flex size-10 items-center justify-center rounded-md">
                              <ServiceGlyph name={sv} size={23} className="text-state-gray" />
                            </span>
                          ))}
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <Link href={href} className="text-label-l text-deep-charcoal hover:underline">
                            {tx(locale, s, "title")}
                          </Link>
                          <p className="text-body-s text-state-gray">{tx(locale, s, "meta")}</p>
                          <p className="text-caption text-state-gray">{tx(locale, s, "saved")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-6 sm:justify-start">
                        <p className="flex flex-col">
                          <span className="text-h5 whitespace-nowrap text-deep-charcoal">{formatPrice(locale, s.price)}</span>
                          {s.old_price && <s className="text-caption text-state-gray">{formatNumber(s.old_price)}</s>}
                        </p>
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={href}
                            className="inline-flex h-[42px] items-center gap-1.5 rounded-md bg-neon-green px-[18px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
                          >
                            {t.book}
                            <Icon name="chevron-left" size={16} flip />
                          </Link>
                          <FavoritesHeart label={t.removeFavorite} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="flex items-center gap-2 text-caption text-state-gray">
                <Icon name="info" size={16} className="shrink-0" />
                {tx(locale, p, "note")}
              </p>
            </section>
          )}
          </div>
        </>
      )}
    </div>
  );
}
