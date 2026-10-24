"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import type { MapPoint } from "@/lib/data/search/types";
import type { SortKey, sortOptions as SortOptionsData, toasts as ToastsData } from "@/lib/data/search/options";
import { mapGeometry } from "@/lib/data/search/map";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { ProviderCard } from "@/components/cards/ProviderCard";
import { Dropdown } from "./Dropdown";
import { LogoTile } from "./LogoTile";
import { MapCanvas, pos } from "./MapCanvas";
import { ViewToggle } from "./SearchResults";
import { ToastProvider, useToast } from "./Toast";

const g = mapGeometry.providers;

type Props = {
  locale: Locale;
  view: "list" | "map";
  providers: Provider[]; // بترتيب «الأقرب إليك»
  services: Service[];
  total: number;
  pageSize: number;
  pins: Record<string, MapPoint>;
  me: MapPoint;
  mapSelected: string;
  location: string;
  sortOptions: typeof SortOptionsData;
  toasts: typeof ToastsData;
};

const hasOffers = (p: Provider) => !!p.tag && p.tag.label_en.toLowerCase().includes("offer");

// W2-26 · كل مقدّمي الخدمة (قائمة) · W2-26m (خريطة)
export function ProvidersListing(props: Props) {
  return (
    <ToastProvider>
      <Body {...props} />
    </ToastProvider>
  );
}

function Body({ locale, view, providers, services, total, pageSize, pins, me, mapSelected, location, sortOptions, toasts }: Props) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  const toast = useToast();
  const [service, setService] = useState<ServiceSlug | null>(null);
  const [offers, setOffers] = useState(false);
  const [sort, setSort] = useState<SortKey>("nearest");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(mapSelected);
  const [zoom, setZoom] = useState(1);
  const options = sortOptions.filter((o) => o.key === "nearest" || o.key === "price" || o.key === "rating");
  const L = (o: { label_ar: string; label_en: string }) => tx(locale, o, "label");

  const filtered = providers
    .filter((p) => (!service || p.services.includes(service)) && (!offers || hasOffers(p)))
    .sort((a, b) => (sort === "price" ? a.starting_price - b.starting_price : sort === "rating" ? b.rating - a.rating : 0));
  const anyFilter = !!service || offers;
  const visible = expanded || anyFilter ? filtered : filtered.slice(0, pageSize);
  const count = anyFilter ? filtered.length : total;
  const sel = providers.find((p) => p.slug === selected);

  const chip = (on: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-label-m whitespace-nowrap ${
      on ? "bg-deep-charcoal text-white" : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
    }`;

  return (
    <>
      {/* Toolbar */}
      <Container className="flex flex-col gap-4 pt-2 pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-[42px] items-center gap-2 rounded-full border border-cool-gray bg-white px-3.5 text-label-m">
              <Icon name="map-pin" size={16} className="text-nature-green" />
              <span className="text-deep-charcoal">{location}</span>
              <span className="h-3.5 w-px bg-cool-gray" aria-hidden />
              <Link href={routes.search()} className="text-green-active hover:underline">
                {t.change}
              </Link>
            </span>
            <p className="text-label-l text-deep-charcoal">{t.providersCount(count)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              label={t.sortLabel}
              align="end"
              value={sort}
              onChange={setSort}
              options={options.map((o) => ({ key: o.key, label: L(o) }))}
              trigger={(open) => (
                <span className="flex h-11 items-center gap-2 rounded-md border border-cool-gray bg-white px-3.5 whitespace-nowrap hover:border-border-strong">
                  <span className="text-caption text-state-gray">{t.sortLabel}</span>
                  <span className="text-label-m text-deep-charcoal">{L(options.find((o) => o.key === sort)!)}</span>
                  <Icon name="chevron-down" size={16} className={`text-deep-charcoal transition-transform ${open ? "rotate-180" : ""}`} />
                </span>
              )}
            />
            <ViewToggle locale={locale} view={view} hrefs={{ list: routes.providers(), map: routes.providers("map") }} />
          </div>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          <button type="button" aria-pressed={!service} onClick={() => setService(null)} className={chip(!service)}>
            {t.allServices}
          </button>
          {services.map((s) => (
            <button key={s.slug} type="button" aria-pressed={service === s.slug} onClick={() => setService(service === s.slug ? null : s.slug)} className={chip(service === s.slug)}>
              <ServiceGlyph name={s.slug} size={18} className={service === s.slug ? "text-neon-green" : "text-state-gray"} />
              {tx(locale, s, "name")}
            </button>
          ))}
          <span className="mx-1 h-6 w-px shrink-0 self-center bg-cool-gray" aria-hidden />
          <button type="button" aria-pressed={offers} onClick={() => setOffers(!offers)} className={chip(offers)}>
            <Icon name="tag" size={16} className={offers ? "text-neon-green" : "text-nature-green"} />
            {t.hasOffers}
          </button>
        </div>
      </Container>

      {view === "list" ? (
        <>
          <Container className="py-2">
            <div className="grid gap-x-[25px] gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProviderCard key={p.slug} locale={locale} provider={p} services={services} showBadges />
              ))}
            </div>
            {visible.length === 0 && <p className="py-10 text-center text-body-m text-state-gray">{t.noMatches}</p>}
          </Container>
          <Container className="flex flex-col items-center gap-2.5 pt-6 pb-[72px]">
            {!anyFilter && !expanded && filtered.length > pageSize && (
              <button
                type="button"
                onClick={() => {
                  setExpanded(true);
                  toast(L(toasts.listAll));
                }}
                className="flex h-[52px] items-center gap-2 rounded-md border border-cool-gray bg-white px-[22px] text-label-l text-deep-charcoal hover:border-border-strong"
              >
                {t.showMore}
                <Icon name="chevron-down" size={18} />
              </button>
            )}
            {!anyFilter && <p className="text-caption text-state-gray">{t.showing(visible.length, total)}</p>}
          </Container>
        </>
      ) : (
        <Container className="pt-2 pb-[72px]">
          <div className="flex flex-col gap-6 lg:flex-row-reverse">
            <MapCanvas
              locale={locale}
              geometry={g}
              zoom={zoom}
              className="h-[640px] w-full shrink-0 rounded-[24px] lg:h-[780px] lg:flex-1 lg:shrink"
              layer={
                <>
                  <span className="absolute size-[23px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-neon-green bg-deep-charcoal" style={pos(g, me.x, me.y)} />
                  <span className="absolute -translate-x-1/2 rounded-full bg-deep-charcoal px-2 py-[3px] text-caption whitespace-nowrap text-white" style={pos(g, me.x, me.y + 17)}>
                    {t.you}
                  </span>
                  {filtered
                    .filter((p) => pins[p.slug])
                    .map((p) => {
                      const on = p.slug === selected;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          aria-pressed={on}
                          aria-label={tx(locale, p, "name")}
                          onClick={() => setSelected(p.slug)}
                          dir={locale === "en" ? "ltr" : "rtl"}
                          className={`absolute flex items-center gap-1.5 rounded-full py-1 ps-1 pe-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.12)] ${
                            on ? "z-10 bg-deep-charcoal text-neon-green" : "border border-cool-gray bg-white text-deep-charcoal"
                          }`}
                          style={pos(g, pins[p.slug].x, pins[p.slug].y)}
                        >
                          <LogoTile src={p.logo} alt="" size={26} radius={13} />
                          <span className="text-label-m whitespace-nowrap">{`${t.from} ${formatNumber(p.starting_price)}`}</span>
                        </button>
                      );
                    })}
                </>
              }
            >
              <div dir={locale === "en" ? "ltr" : "rtl"} className="pointer-events-none absolute inset-0">
                <button
                  type="button"
                  onClick={() => toast(L(toasts.areaUpdated))}
                  className="pointer-events-auto absolute start-1/2 top-5 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-deep-charcoal px-3.5 py-2 text-label-m whitespace-nowrap text-white rtl:translate-x-1/2"
                >
                  <Icon name="search" size={16} className="text-neon-green" />
                  {t.searchThisArea}
                </button>
                <div className="pointer-events-auto absolute end-5 bottom-5 flex flex-col gap-2">
                  <button type="button" aria-label={t.zoomIn} onClick={() => setZoom((z) => Math.min(z + 0.15, 1.3))} className="flex size-10 items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:bg-tile">
                    <Icon name="plus" size={20} />
                  </button>
                  <button type="button" aria-label={t.zoomOut} onClick={() => setZoom((z) => Math.max(z - 0.15, 1))} className="flex size-10 items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:bg-tile">
                    <span className="h-0.5 w-3.5 rounded-[1px] bg-deep-charcoal" />
                  </button>
                  <button type="button" aria-label={t.locate} onClick={() => setSelected(filtered[0]?.slug ?? selected)} className="flex size-10 items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:bg-tile">
                    <Icon name="navigation" size={20} />
                  </button>
                </div>
                {sel && (
                  <div className="pointer-events-auto absolute top-[50.8%] hidden w-[301px] sm:block" style={{ right: 0 }}>
                    <ProviderCard locale={locale} provider={sel} services={services} showBadges />
                  </div>
                )}
              </div>
            </MapCanvas>

            <aside className="flex max-h-[780px] shrink-0 flex-col gap-3 overflow-y-auto lg:w-[456px]">
              <p className="text-caption text-state-gray">{t.sortedByDistance}</p>
              {filtered.map((p) => {
                const on = p.slug === selected;
                return (
                  <div
                    key={p.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(p.slug)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(p.slug))}
                    aria-pressed={on}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-lg bg-white px-4 py-3.5 text-start ${on ? "border-2 border-neon-green" : "border border-cool-gray hover:border-border-strong"}`}
                  >
                    <LogoTile src={p.logo} alt="" size={52} />
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <Link href={routes.provider(p.slug)} onClick={(e) => e.stopPropagation()} className="text-label-l text-deep-charcoal hover:underline">
                        {tx(locale, p, "name")}
                      </Link>
                      <span className="flex flex-wrap items-center gap-1.5 text-caption text-state-gray">
                        <Icon name="star-filled" size={14} className="text-v3-rating-star" />
                        <span className="font-medium text-deep-charcoal">{p.rating.toFixed(1)}</span>
                        <span>·</span>
                        <Icon name="map-pin" size={14} />
                        <span>{`${p.distance_km.toFixed(1)} ${c.km}`}</span>
                        <span>·</span>
                        <span>{c.branches(p.branches)}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span className="text-caption text-state-gray">{c.startsFrom}</span>
                      <span className="text-label-l whitespace-nowrap text-deep-charcoal">{formatPrice(locale, p.starting_price)}</span>
                    </span>
                  </div>
                );
              })}
            </aside>
          </div>
        </Container>
      )}
    </>
  );
}
