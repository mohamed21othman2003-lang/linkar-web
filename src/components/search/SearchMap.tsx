"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider } from "@/lib/data/types";
import type { SearchResult, SearchScenario } from "@/lib/data/search/types";
import { mapGeometry } from "@/lib/data/search/map";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { ProviderBadges } from "@/components/ui/Badges";
import { CompareButton, CompareTray, useCompare } from "./Compare";
import { LogoTile } from "./LogoTile";
import { MapCanvas, pos } from "./MapCanvas";
import { resultName, resultWhere } from "./ResultCard";
import { useToast } from "./Toast";

const g = mapGeometry.search;
const ZOOMS = [1, 1.15, 1.3];

// W2-30m · عرض الخريطة (769:16336): خريطة مرسومة بدبابيس الأسعار + قائمة جانبية
export function SearchMap({
  locale,
  scenario: s,
  results,
  providers,
  trayLabel,
  areaToast,
}: {
  locale: Locale;
  scenario: SearchScenario;
  results: SearchResult[];
  providers: Record<string, Provider>;
  trayLabel: string;
  areaToast: string;
}) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  const toast = useToast();
  const { keys } = useCompare();
  const [selected, setSelected] = useState<string | null>(results.some((r) => r.provider === s.map.selected) ? s.map.selected : results[0]?.provider ?? null);
  const [zoom, setZoom] = useState(0);
  const multi = s.services.length > 1;
  const sel = results.find((r) => r.provider === selected) ?? null;
  const name = (r: SearchResult) => resultName(locale, r, providers[r.provider]);
  const details = (r: SearchResult) => routes.providerService(r.provider, r.lines[0]?.service ?? s.services[0]);
  const nearest = () => {
    const n = [...results].sort((a, b) => a.distance_km - b.distance_km)[0];
    if (n) setSelected(n.provider);
  };
  const popupAt = sel
    ? { x: Math.min(Math.max(sel.map.x - 240, 20), g.w - 360), y: Math.min(Math.max(sel.map.y + 46, 70), g.h - 260) }
    : null;

  return (
    <div className="flex flex-col gap-5 lg:flex-row-reverse">
      {/* الخريطة */}
      <MapCanvas
        locale={locale}
        geometry={g}
        zoom={ZOOMS[zoom]}
        className="h-[640px] w-full min-w-0 shrink-0 lg:h-[780px] lg:flex-1 lg:shrink"
        layer={
          <>
            {s.map.cluster && (
              <span className="absolute flex items-center rounded-full bg-nature-green px-3 py-2 text-label-m text-white" style={pos(g, s.map.cluster_at.x, s.map.cluster_at.y)}>
                {s.map.cluster}
              </span>
            )}
            {/* موقعك */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/search/map-me-ring.svg" alt="" className="absolute size-[70px] -translate-x-1/2 -translate-y-1/2" style={pos(g, s.map.me.x, s.map.me.y)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/search/map-me.svg" alt="" className="absolute size-[18px] -translate-x-1/2 -translate-y-1/2" style={pos(g, s.map.me.x, s.map.me.y)} />
            <span
              className="absolute -translate-x-1/2 rounded-full bg-deep-charcoal px-2 py-[3px] text-caption whitespace-nowrap text-white"
              style={pos(g, s.map.me.x, s.map.me.y + 17)}
            >
              {t.you}
            </span>
            {results.map((r) => {
              const on = r.provider === selected;
              const partial = !!r.map_pin_label;
              return (
                <button
                  key={r.provider}
                  type="button"
                  aria-pressed={on}
                  aria-label={name(r)}
                  onClick={() => setSelected(r.provider)}
                  className={`absolute flex items-center gap-1.5 rounded-full border py-1 ps-1 pe-2.5 shadow-[0_3px_4px_rgba(0,0,0,0.15)] ${
                    on ? "z-10 border-deep-charcoal bg-deep-charcoal text-neon-green" : partial ? "border-cool-gray bg-tile text-state-gray" : "border-cool-gray bg-white text-deep-charcoal"
                  }`}
                  dir={locale === "en" ? "ltr" : "rtl"}
                  style={pos(g, r.map.x, r.map.y)}
                >
                  <LogoTile src={providers[r.provider].logo} alt="" size={26} radius={13} />
                  <span className="text-label-m whitespace-nowrap">{partial ? tx(locale, r.map_pin_label!, "text") : formatPrice(locale, r.price)}</span>
                </button>
              );
            })}
          </>
        }
      >
        <div dir={locale === "en" ? "ltr" : "rtl"} className="pointer-events-none absolute inset-0">
          {/* أعلى الخريطة: التكبير، «الأقرب لي»، «ابحث في هذه المنطقة»، شرح السعر */}
          <div className="pointer-events-auto absolute end-5 top-5 flex flex-col items-end gap-[18px]">
            <div className="flex flex-col overflow-hidden rounded-md border border-cool-gray bg-white">
              <button type="button" aria-label={t.zoomIn} onClick={() => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1))} className="flex size-9 items-center justify-center text-deep-charcoal hover:bg-tile">
                <Icon name="plus" size={16} />
              </button>
              <button type="button" aria-label={t.zoomOut} onClick={() => setZoom((z) => Math.max(z - 1, 0))} className="flex size-9 items-center justify-center text-deep-charcoal hover:bg-tile">
                <Icon name="chevron-down" size={16} />
              </button>
            </div>
            <button type="button" onClick={nearest} className="flex items-center gap-1.5 rounded-md border border-cool-gray bg-white px-3 py-2 text-label-m text-deep-charcoal hover:bg-tile">
              <Icon name="navigation" size={14} />
              {t.nearestToMe}
            </button>
          </div>
          <button
            type="button"
            onClick={() => toast(areaToast)}
            className="pointer-events-auto absolute end-[84px] top-5 flex items-center gap-1.5 rounded-full bg-deep-charcoal px-3.5 py-2 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
          >
            <Icon name="search" size={14} />
            {t.searchThisArea}
          </button>
          {/* 330px تحت الـ1440: زرار «ابحث في هذه المنطقة» العربي أعرض وكان راكب على آخر الملاحظة في 1280 */}
          <p className="pointer-events-auto absolute start-5 top-5 hidden max-w-[calc(100%-330px)] items-center min-[1440px]:max-w-[calc(100%-300px)] gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-caption text-state-gray xl:flex">
            <Icon name="info" size={12} className="shrink-0" />
            <span className="truncate">{tx(locale, s.map.legend, "text")}</span>
          </p>

          {/* كارت مقدّم الخدمة المختار */}
          {sel && popupAt && (
            <div
              className="pointer-events-auto absolute flex w-[min(340px,calc(100%-40px))] max-sm:top-[140px]! max-sm:left-5! flex-col items-start gap-2 rounded-[20px] border border-v3-card-stroke bg-white p-4 shadow-[0_8px_12px_rgba(0,0,0,0.16)]"
              style={pos(g, popupAt.x, popupAt.y)}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex min-w-0 flex-col items-start">
                  <p className="text-label-l text-deep-charcoal">{name(sel)}</p>
                  <ProviderBadges locale={locale} tier={sel.tier ?? providers[sel.provider].tier} certified={false} surface="light" />
                  <p className="flex items-center gap-1 text-caption text-v3-text-meta">
                    <Icon name="star-filled" size={12} className="text-v3-rating-star" />
                    {`${sel.rating.toFixed(1)}${sel.reviews ? ` (${sel.reviews})` : ""} · ${resultWhere(locale, sel)}`}
                  </p>
                </div>
                <LogoTile src={providers[sel.provider].logo} alt="" size={40} radius={20} />
              </div>
              <p className="flex flex-wrap items-center gap-1.5 text-[14px] leading-[22px]">
                <span className="font-light text-v3-text-meta">{`${tx(locale, sel.map_popup_line ?? sel.map_title, "text")} ·`}</span>
                <span className="font-medium text-deep-charcoal">{multi ? t.bothPrice(formatPrice(locale, sel.price)) : formatPrice(locale, sel.price)}</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href={details(sel)} className="flex h-[38px] items-center gap-1.5 rounded-[10px] bg-neon-green px-3.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
                  {t.detailsAndBook}
                  <Icon name="chevron-left" size={14} flip />
                </Link>
                <MapCompareButton locale={locale} id={sel.provider} />
              </div>
            </div>
          )}

          {/* شريط المقارنة داخل الخريطة */}
          {keys.length > 0 && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-5 flex justify-center px-3">
              <CompareTray locale={locale} label={trayLabel} />
            </div>
          )}
        </div>
      </MapCanvas>

      {/* القائمة الجانبية */}
      <aside className="flex max-h-[780px] shrink-0 flex-col gap-2.5 overflow-y-auto rounded-[20px] border border-cool-gray bg-white p-4 lg:w-[400px]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-label-l text-deep-charcoal">{multi ? t.mapHead(s.map.total, s.map.both) : t.providersCount(s.map.total)}</p>
          {multi && <p className="text-caption whitespace-nowrap text-state-gray">{t.bothFirst}</p>}
        </div>
        {results.map((r) => {
          const on = r.provider === selected;
          return (
            <div
              key={r.provider}
              onClick={() => setSelected(r.provider)}
              className={`flex cursor-pointer flex-col gap-1.5 rounded-[14px] p-3.5 ${on ? "border-[1.5px] border-deep-charcoal bg-tint-lime" : "border border-cool-gray bg-white hover:border-border-strong"}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex min-w-0 flex-col items-start">
                  <p className="text-label-l text-deep-charcoal">{name(r)}</p>
                  <p className="flex items-center gap-1 text-caption text-state-gray">
                    <Icon name="star-filled" size={12} className="text-v3-rating-star" />
                    {`${r.rating.toFixed(1)} · ${r.distance_km.toFixed(1)} ${c.km} · ${c.branches(r.branches)}`}
                  </p>
                </div>
                <LogoTile src={providers[r.provider].logo} alt="" size={40} radius={20} />
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex min-w-0 flex-col items-start">
                  <p className="text-body-s text-deep-charcoal">{tx(locale, r.map_title, "text")}</p>
                  <p className={`text-caption ${r.map_note_tone === "green" ? "text-green-active" : "text-state-gray"}`}>{tx(locale, r.map_note, "text")}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <p className="text-caption text-state-gray">{tx(locale, r.map_price_label, "text")}</p>
                  <p className="text-label-l whitespace-nowrap text-deep-charcoal">{formatPrice(locale, r.price)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                <CompareButton locale={locale} id={r.provider} variant="chip" />
                <Link href={details(r)} className="flex h-8 items-center gap-1.5 rounded-[10px] border border-cool-gray bg-white px-2.5 text-label-m text-deep-charcoal hover:border-border-strong">
                  {t.details}
                  <Icon name="chevron-left" size={14} flip />
                </Link>
              </div>
            </div>
          );
        })}
        <Link
          href={routes.providers("map")}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-cool-gray bg-white px-3.5 text-label-m text-deep-charcoal hover:border-border-strong"
        >
          {t.showOtherProviders}
          <Icon name="chevron-down" size={14} />
        </Link>
      </aside>
    </div>
  );
}

// «أضف للمقارنة» في كارت الخريطة
function MapCompareButton({ locale, id }: { locale: Locale; id: string }) {
  const t = getSearchDict(locale);
  const { has, toggle } = useCompare();
  const on = has(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggle(id)}
      className={`flex h-10 items-center gap-1.5 rounded-[10px] border px-3.5 text-label-m ${
        on ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
      }`}
    >
      <Icon name={on ? "check" : "plus"} size={14} />
      {on ? t.inCompare : t.addToCompare}
    </button>
  );
}
