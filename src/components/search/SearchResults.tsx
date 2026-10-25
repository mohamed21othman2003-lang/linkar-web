"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider } from "@/lib/data/types";
import type { SearchResult, SearchScenario } from "@/lib/data/search/types";
import type { SortKey, compareMax as CompareMaxData, filterGroups as FilterGroupsData, sortOptions as SortOptionsData, toasts as ToastsData } from "@/lib/data/search/options";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { OfferCard } from "@/components/cards/OfferCard";
import { AiPick, AltCard, LightOfferCard, SectionHead } from "./Blocks";
import { CompareProvider, CompareTray, type CompareItem } from "./Compare";
import { Dropdown } from "./Dropdown";
import { FiltersModal, activeCount, emptyFilters, type Filters } from "./FiltersModal";
import { ResultCard, resultName } from "./ResultCard";
import { SearchMap } from "./SearchMap";
import { ToastProvider, useToast } from "./Toast";

type Options = {
  sortOptions: typeof SortOptionsData;
  filterGroups: typeof FilterGroupsData;
  compareMax: typeof CompareMaxData;
  toasts: typeof ToastsData;
};

type Props = {
  locale: Locale;
  scenario: SearchScenario;
  providers: Record<string, Provider>;
  view: "list" | "map";
  options: Options;
};

// نتيجة البحث W2-30 / W2-30a / W2-30m: شريط الأدوات (عرض، ترتيب، فلاتر) + القائمة أو الخريطة + المقارنة
export function SearchResults(props: Props) {
  const { locale, scenario: s, providers, options } = props;
  const compareItems = useMemo(() => {
    const items: Record<string, CompareItem> = {};
    for (const r of s.results) {
      const p = providers[r.provider];
      if (!p) continue;
      items[r.provider] = {
        key: r.provider,
        name: resultName(locale, r, p),
        logo: p.logo,
        service: r.title ? tx(locale, r.title, "text") : r.lines.map((l) => tx(locale, l, "name")).join(" + "),
        price: r.price,
        durationHours: r.duration_hours,
        duration: tx(locale, r.duration, "text"),
        warrantyYears: r.warranty_years,
        warranty: tx(locale, r.warranty, "text"),
        rating: r.rating,
        reviews: r.reviews,
        distanceKm: r.distance_km,
        branch: r.branch ? tx(locale, r.branch, "name") : null,
        offer: r.offer ? tx(locale, r.offer, "text") : null,
        offerBest: !!r.offer_best,
        href: routes.providerService(r.provider, r.lines[0]?.service ?? s.services[0]),
      };
    }
    for (const a of s.alternatives?.items ?? []) {
      items[a.key] = {
        key: a.key,
        name: tx(locale, a.name, "text"),
        logo: a.logo,
        service: tx(locale, a.title, "text"),
        price: a.price,
        durationHours: 0,
        duration: "—",
        warrantyYears: a.warranty_years,
        warranty: tx(locale, a.warranty, "text"),
        rating: a.rating,
        reviews: null,
        distanceKm: a.distance_km,
        branch: null,
        offer: null,
        offerBest: false,
        href: a.provider ? routes.providerService(a.provider, a.service) : routes.providers(),
      };
    }
    return items;
  }, [s, providers, locale]);

  return (
    <ToastProvider>
      <CompareProvider
        locale={locale}
        items={compareItems}
        initial={s.compare_initial}
        serviceName={tx(locale, s.compare_label_map, "text")}
        highlight={s.ai?.provider ?? null}
        copy={{ max: options.compareMax, added: options.toasts.added }}
      >
        <Body {...props} />
      </CompareProvider>
    </ToastProvider>
  );
}

function Body({ locale, scenario: s, providers, view, options }: Props) {
  const t = getSearchDict(locale);
  const toast = useToast();
  const L = (o: { label_ar: string; label_en: string }) => tx(locale, o, "label");
  const multi = s.services.length > 1;
  const minPrice = Math.min(...s.results.map((r) => r.price));
  const maxPrice = Math.max(...s.results.map((r) => r.price));
  const [sort, setSort] = useState<SortKey>("nearest");
  const [filters, setFilters] = useState<Filters>(emptyFilters(minPrice));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [preset, setPreset] = useState<Filters | null>(null);
  // Figma: «ضمان 5 سنوات فأكثر» و«لديه عروض» بيفتحوا P-12 (DISSOLVE 200ms) — بنفتحها والخيار متعلّم
  const openFilters = (patch?: Partial<Filters>) => {
    setPreset(patch ? { ...filters, ...patch } : null);
    setFiltersOpen(true);
  };
  const nFilters = activeCount(filters, minPrice);

  const apply = (list: SearchResult[]) => {
    const f = filters;
    const out = list.filter(
      (r) =>
        r.price >= f.priceMin &&
        (f.priceMax === null || r.price <= f.priceMax) &&
        (!f.rating || r.rating >= f.rating) &&
        (!f.warranty || r.warranty_years >= f.warranty) &&
        (!f.duration || (r.duration_hours > 0 && r.duration_hours <= f.duration)) &&
        (!f.hasOffer || r.has_offer) &&
        (!f.hasPackage || r.has_package) &&
        (!f.distance || r.distance_km <= f.distance),
    );
    const by: Record<SortKey, (a: SearchResult, b: SearchResult) => number> = {
      nearest: () => 0,
      price: (a, b) => a.price - b.price,
      rating: (a, b) => b.rating - a.rating,
      warranty: (a, b) => b.warranty_years - a.warranty_years,
      duration: (a, b) => (a.duration_hours || 999) - (b.duration_hours || 999),
    };
    return [...out].sort(by[sort]);
  };

  const byKey = (k: string) => s.results.find((r) => r.provider === k);
  const listResults = apply(s.list.map(byKey).filter((r): r is SearchResult => !!r && !!providers[r.provider]));
  const mapOrder = [...s.list, ...s.results.map((r) => r.provider).filter((k) => !s.list.includes(k))];
  const mapResults = apply(mapOrder.map(byKey).filter((r): r is SearchResult => !!r && !!providers[r.provider]));
  const count = nFilters ? (multi ? t.resultsCount(listResults.length) : t.providersCount(listResults.length)) : tx(locale, s.count, "text");
  const sortLabel = L(options.sortOptions.find((o) => o.key === sort)!);
  const tray = tx(locale, view === "map" ? s.compare_label_map : s.compare_label, "text");

  return (
    <>
      {/* Toolbar */}
      <Container className="flex flex-col-reverse gap-3 pt-1 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <p className="me-1 text-label-l whitespace-nowrap text-deep-charcoal">{count}</p>
          <QuickChip active={filters.hasOffer} onClick={() => openFilters({ hasOffer: !filters.hasOffer })} icon="tag">
            {L(options.filterGroups.offers.hasOffer)}
          </QuickChip>
          <QuickChip active={filters.warranty === 5} onClick={() => openFilters({ warranty: filters.warranty === 5 ? 0 : 5 })}>
            {L(options.filterGroups.warranty5)}
          </QuickChip>
          <QuickChip active={nFilters > 0} onClick={() => openFilters()} icon="filter">
            {L(options.filterGroups.title)}
            {nFilters > 0 && <span className="text-label-m">({nFilters})</span>}
          </QuickChip>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            label={t.sortLabel}
            align="end"
            value={sort}
            onChange={setSort}
            options={options.sortOptions.map((o) => ({ key: o.key, label: L(o) }))}
            trigger={(open) => (
              <span className="flex h-11 items-center gap-2 rounded-md border border-cool-gray bg-white px-3.5 whitespace-nowrap hover:border-border-strong">
                <span className="text-caption text-state-gray">{t.sortLabel}</span>
                <span className="text-label-m text-deep-charcoal">{sortLabel}</span>
                <Icon name="chevron-down" size={16} className={`text-deep-charcoal transition-transform ${open ? "rotate-180" : ""}`} />
              </span>
            )}
          />
          <ViewToggle locale={locale} services={s.services} view={view} />
        </div>
      </Container>

      {view === "map" ? (
        <Container className="pb-12">
          <SearchMap locale={locale} scenario={s} results={mapResults} providers={providers} trayLabel={tray} areaToast={L(options.toasts.areaUpdated)} />
        </Container>
      ) : (
        <>
          {s.ai && providers[s.ai.provider] && (
            <Container className="pb-5">
              <AiPick
                locale={locale}
                logo={providers[s.ai.provider].logo}
                name={tx(locale, providers[s.ai.provider], "name")}
                title={tx(locale, s.ai.title, "text")}
                body={tx(locale, s.ai.body, "text")}
                price={s.ai.price}
                href={routes.providerService(s.ai.provider, s.ai.service)}
                bigLogo={s.ai.big_logo}
              />
            </Container>
          )}

          <Container className={`flex flex-col pb-2 ${multi ? "gap-3.5" : "gap-3"}`}>
            {(tx(locale, s.results_title, "text") || s.size_hint) && (
              <div className={`flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between ${multi ? "pt-3" : "pt-2"}`}>
                {tx(locale, s.results_title, "text") && <h2 className="text-h4 text-deep-charcoal">{tx(locale, s.results_title, "text")}</h2>}
                {s.size_hint && (
                  <p className="flex items-center gap-1.5 self-start rounded-full bg-tint-lime px-3 py-1.5 text-caption text-green-active">
                    <Icon name="info" size={14} className="shrink-0 text-nature-green" />
                    {t.sizeHint}
                  </p>
                )}
              </div>
            )}
            {/* عمودين من xl بس: في 1024 المحتوى جنب عمود المقدّم كان بيضيق لـ240px والأسماء والأسعار تتقصّ */}
            <div className="grid gap-5 xl:grid-cols-2">
              {listResults.map((r) => (
                <ResultCard key={r.provider} locale={locale} result={r} provider={providers[r.provider]} multi={multi} />
              ))}
            </div>
            {listResults.length === 0 && <p className="py-10 text-center text-body-m text-state-gray">{t.noMatches}</p>}
          </Container>

          {s.more_count > 0 && (
            <Container className="flex justify-center py-2">
              <Link
                href={routes.providers()}
                className="flex h-[52px] items-center gap-2 rounded-md border border-cool-gray bg-white px-[22px] text-label-l text-deep-charcoal hover:border-border-strong"
              >
                {t.showMoreProviders(s.more_count)}
                <Icon name="chevron-down" size={16} />
              </Link>
            </Container>
          )}

          {s.alternatives && (
            <Container className="flex flex-col gap-4 pt-10 pb-2">
              <SectionHead title={tx(locale, s.alternatives.title, "text")} description={tx(locale, s.alternatives.description, "text")} />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {s.alternatives.items.map((a) => (
                  <AltCard key={a.key} locale={locale} item={a} />
                ))}
              </div>
            </Container>
          )}

          {s.offers && (
            <Container className="flex flex-col gap-4 pt-10 pb-2">
              <SectionHead title={tx(locale, s.offers.title, "text")} description={tx(locale, s.offers.description, "text")} />
              {s.offers.kind === "light" ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {s.offers.items
                    .filter((o) => providers[o.provider])
                    .map((o) => (
                      <LightOfferCard key={o.provider + o.price} locale={locale} item={o} provider={providers[o.provider]} providerName={displayName(locale, s, providers[o.provider])} />
                    ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(3,313.4px)]">
                  {s.offers.items
                    .filter((o) => providers[o.provider])
                    .map((o) => {
                      const p = providers[o.provider];
                      const r = s.results.find((x) => x.provider === o.provider);
                      const view = { ...p, ...(r?.display_name ?? {}), rating: r?.rating ?? p.rating, distance_km: r?.distance_km ?? p.distance_km, branches: r?.branches ?? p.branches };
                      return (
                        <OfferCard
                          key={o.provider}
                          locale={locale}
                          provider={view}
                          discount={o.discount}
                          title={[tx(locale, o.title[0], "text"), tx(locale, o.title[1], "text") || " "]}
                          features={o.features.map((f) => ({ icon: f.icon, label: tx(locale, f.label, "text") }))}
                          price={o.price}
                          oldPrice={o.old_price}
                          detailsHref={routes.providerService(o.provider, o.services[o.services.length - 1])}
                          bookHref={`${routes.bookingBranch}?provider=${o.provider}&services=${o.services.join(",")}`}
                        />
                      );
                    })}
                </div>
              )}
            </Container>
          )}

          {/* شريط المقارنة ثابت أسفل الشاشة */}
          {/* Figma: Spacer 148 = 24 + الشريط 68 + 56 — والشريط sticky على بعد 24px من أسفل الشاشة */}
          <div className="pointer-events-none sticky bottom-0 z-30 mt-6 mb-8 flex min-h-[92px] justify-center px-4 pb-6">
            <CompareTray locale={locale} label={tray} className="pointer-events-auto" />
          </div>
        </>
      )}

      <FiltersModal
        locale={locale}
        open={filtersOpen}
        groups={options.filterGroups}
        value={preset ?? filters}
        bounds={[minPrice, maxPrice]}
        onClose={() => setFiltersOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
          toast(L(options.toasts.filtersApplied));
        }}
        onClear={() => {
          setFilters(emptyFilters(minPrice));
          setFiltersOpen(false);
          toast(L(options.toasts.filtersCleared));
        }}
      />
    </>
  );
}

const displayName = (locale: Locale, s: SearchScenario, p: Provider) => {
  const r = s.results.find((x) => x.provider === p.slug);
  return r?.display_name ? tx(locale, r.display_name, "name") : tx(locale, p, "name");
};

function QuickChip({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon?: "tag" | "filter"; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-label-m whitespace-nowrap ${
        active ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
      }`}
    >
      {icon && <Icon name={icon} size={14} className={active ? "text-neon-green" : "text-nature-green"} />}
      {children}
    </button>
  );
}

// View toggle: «قائمة» / «خريطة» (روابط بتحافظ على الخدمات المختارة)
export function ViewToggle({ locale, services, view, hrefs }: { locale: Locale; services?: string[]; view: "list" | "map"; hrefs?: { list: string; map: string } }) {
  const t = getSearchDict(locale);
  const list = hrefs?.list ?? routes.search({ services });
  const map = hrefs?.map ?? routes.search({ services, view: "map" });
  const item = (on: boolean) => `flex h-[38px] items-center gap-1.5 rounded-[9px] px-3.5 text-label-m ${on ? "bg-deep-charcoal text-white" : "text-deep-charcoal hover:bg-white/60"}`;
  return (
    <div className="flex shrink-0 gap-1 rounded-md bg-cool-gray/45 p-1">
      <Link href={list} scroll={false} aria-current={view === "list" ? "page" : undefined} className={item(view === "list")}>
        <Icon name="menu" size={16} className={view === "list" ? "text-neon-green" : "text-deep-charcoal"} />
        {t.viewList}
      </Link>
      <Link href={map} scroll={false} aria-current={view === "map" ? "page" : undefined} className={item(view === "map")}>
        <Icon name="map-pin" size={16} className={view === "map" ? "text-neon-green" : "text-deep-charcoal"} />
        {t.viewMap}
      </Link>
    </div>
  );
}
