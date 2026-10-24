"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider } from "@/lib/data/types";
import type { SearchResult } from "@/lib/data/search/types";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { ProviderBadges } from "@/components/ui/Badges";
import { CompareButton, useCompare } from "./Compare";
import { LogoTile } from "./LogoTile";
import { Pill } from "./Pill";

export const resultName = (locale: Locale, r: SearchResult, p: Provider) => (r.display_name ? tx(locale, r.display_name, "name") : tx(locale, p, "name"));

export const resultWhere = (locale: Locale, r: SearchResult) => {
  const c = getCommon(locale);
  return `${r.distance_km.toFixed(1)} ${c.km}${r.branch ? ` · ${tx(locale, r.branch, "name")}` : ""}`;
};

// كارت نتيجة البحث (Result · …): عمود مقدّم الخدمة الرمادي + المحتوى
//  - multi: سطور الخدمات بالأسعار والإجمالي (W2-30)
//  - single: اسم الخدمة + وصف + «خدمات أخرى لدى …» (W2-30a)
export function ResultCard({ locale, result: r, provider: p, multi }: { locale: Locale; result: SearchResult; provider: Provider; multi: boolean }) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  const name = resultName(locale, r, p);
  const providerHref = routes.provider(p.slug);
  const detailsHref = routes.providerService(p.slug, r.lines[0]?.service ?? p.services[0]);
  const reviews = r.reviews ? ` (${r.reviews})` : "";
  const titleLine = r.title ? tx(locale, r.title, "text") : null;
  const inCompare = useCompare().has(p.slug);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[20px] bg-white transition-colors duration-200 ease-figma-out sm:flex-row ${
        inCompare ? "border-[1.5px] border-deep-charcoal" : "border border-v3-card-stroke"
      }`}
    >
      {/* عمود مقدّم الخدمة */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 bg-tile px-4 py-5 text-center sm:w-[220px]">
        <Link href={providerHref} aria-label={name} className={r.big_logo ? "-my-3" : ""}>
          <LogoTile src={p.logo} alt={name} size={r.big_logo ? 146 : 112} />
        </Link>
        <span className="h-1" aria-hidden />
        <Link href={providerHref} className="w-full text-h5 text-deep-charcoal hover:underline">
          {name}
        </Link>
        <span className="flex items-center gap-1 text-label-m text-deep-charcoal">
          <Icon name="star-filled" size={14} className="text-v3-rating-star" />
          <span dir="ltr">{`${r.rating.toFixed(1)}${reviews}`}</span>
        </span>
        <p className="w-full text-caption text-v3-text-meta">{tx(locale, r.services_line, "text")}</p>
        <span className="flex items-center gap-1 text-caption text-v3-text-meta">
          <Icon name="map-pin" size={13} className="text-v3-text-meta" />
          {resultWhere(locale, r)}
        </span>
        <span className="text-caption text-v3-text-meta">{c.branches(r.branches)}</span>
        {!r.big_logo && (
          <Link href={providerHref} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
            <Icon name="chevron-left" size={14} flip className="text-nature-green" />
            {t.providerPage}
          </Link>
        )}
      </div>

      {/* المحتوى */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5 p-5">
        <div className="flex min-h-[22px] flex-wrap items-center gap-1.5 lg:flex-nowrap">
          {r.pills.map((x) => (
            <Pill key={x.label_ar} tone={x.tone} icon={x.icon}>
              {tx(locale, x, "label")}
            </Pill>
          ))}
          <ProviderBadges locale={locale} tier={r.tier ?? p.tier} certified={r.show_certified} surface="light" />
        </div>

        {multi ? (
          r.lines.map((l) => (
            <Link
              key={l.service}
              href={routes.providerService(p.slug, l.service)}
              className="flex w-full items-center justify-between gap-3 rounded-md bg-tile px-3 py-[9px] hover:bg-bg-muted"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center">
                  <ServiceGlyph name={l.service} size={14} className="text-state-gray" />
                </span>
                <span className="truncate text-label-l text-deep-charcoal">{tx(locale, l, "name")}</span>
              </span>
              {l.price !== undefined && (
                <span className="flex shrink-0 items-center gap-1.5 text-[14px] leading-[22px]">
                  <span className={l.price === null ? "font-medium text-green-active" :"font-medium text-deep-charcoal"}>
                    {l.price === null ? t.free : formatPrice(locale, l.price)}
                  </span>
                  {l.old_price && <s className="font-light text-v3-text-meta">{formatNumber(l.old_price)}</s>}
                </span>
              )}
            </Link>
          ))
        ) : (
          <>
            {titleLine && (
              <h3 className="flex items-center gap-2 text-h5 text-deep-charcoal">
                <span className="flex size-[26px] shrink-0 items-center justify-center">
                  <ServiceGlyph name={r.lines[0]?.service ?? p.services[0]} size={15} className="text-state-gray" />
                </span>
                {titleLine}
              </h3>
            )}
            {r.description && <p className="text-body-s text-v3-text-meta">{tx(locale, r.description, "text")}</p>}
          </>
        )}

        {r.specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {r.specs.map((x) => (
              <Pill key={x.label_ar} tone={x.tone} icon={x.icon}>
                {tx(locale, x, "label")}
              </Pill>
            ))}
          </div>
        )}

        <div className="min-h-px flex-1" />

        {r.price_layout === "inline" ? (
          <div className="flex w-full items-center justify-between gap-3">
            <p className="max-w-[108px] text-caption text-v3-text-meta">{t.totalBothInclVat}</p>
            <p className="text-h4 text-deep-charcoal">{formatPrice(locale, r.price)}</p>
          </div>
        ) : (
          <div className="flex flex-col items-start">
            <p className="text-caption text-v3-text-meta">{multi ? t.totalBoth : t.priceForCar}</p>
            <p className="flex items-baseline gap-1.5">
              <span className="text-h4 text-deep-charcoal">{formatPrice(locale, r.price)}</span>
              {r.old_price && <s className="text-caption text-v3-text-meta">{formatNumber(r.old_price)}</s>}
            </p>
            <p className="text-caption text-v3-text-meta">{t.startsInclVat}</p>
          </div>
        )}

        <div className="flex w-full items-center gap-2">
          <CompareButton locale={locale} id={p.slug} />
          <Link
            href={detailsHref}
            className="flex h-[42px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-neon-green px-3.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {t.detailsAndBook}
            <Icon name="chevron-left" size={14} flip />
          </Link>
        </div>

        {!multi && r.similar.length > 0 && (
          <div className="flex w-full flex-col gap-1.5 rounded-md bg-tile px-3 py-2.5">
            <p className="text-caption text-v3-text-meta">{t.otherServicesAt(tx(locale, p, "short_name"))}</p>
            {r.similar.map((s) => (
              <Link
                key={s.name_ar}
                href={s.service ? routes.providerService(p.slug, s.service) : providerHref}
                className="flex items-center justify-between gap-2 rounded-[10px] border border-cool-gray bg-white px-2.5 py-1.5 hover:border-border-strong"
              >
                <span className="text-label-m text-deep-charcoal">{tx(locale, s, "name")}</span>
                <span className="text-caption whitespace-nowrap text-v3-text-meta">{formatPrice(locale, s.price)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
