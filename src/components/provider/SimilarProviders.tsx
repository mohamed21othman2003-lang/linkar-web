"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import type { Localized } from "@/i18n/config";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { ProviderBadges } from "@/components/ui/Badges";
import { ClientLogo } from "@/components/cards/ClientLogo";
import { ProviderCard } from "@/components/cards/ProviderCard";
import { Icon } from "@/components/icons/Icon";
import { scrollContainerTo } from "./motion";

export type SimilarCardData = { provider: Provider; tag: Localized<"tag"> | null; services: ServiceSlug[]; photo: string };
export type CarouselData = Localized<"services"> & Localized<"highlight"> & { provider: Provider; reviews_count?: number };
type FilterKey = "similar" | "nearest" | "same";

// مقاس الشعار جوّه صندوق الكارت 160×61 نسبةً لجدول logoSize (XPEL مربّع فيه مساحة فاضية)
const logoScale: Record<string, number> = { xpel: 0.71, "v-kool": 0.4 };

// «W2-21 · مقدّمو خدمة آخرون (كاروسيل)» (1143:27053) — كارت مضغوط غامق، بيظهر على الموبايل
function CarouselCard({ locale, item }: { locale: Locale; item: CarouselData }) {
  const c = getCommon(locale);
  const t = getProviderDict(locale);
  const p = item.provider;
  const name = tx(locale, p, "name");
  const meta = [item.reviews_count ? `(${formatNumber(item.reviews_count)})` : null, c.branches(p.branches)].filter(Boolean).join(" · ");
  return (
    // min-h بدل h + *:shrink-0: لما الشارات/الميزة تنزل سطرين (الإنجليزي) الكارت يطول بدل ما الاسم (truncate) ينضغط لصفر
    <article className="flex min-h-[287px] w-[217px] shrink-0 snap-start flex-col gap-1.5 overflow-hidden rounded-[18px] *:shrink-0 border border-neon-green/35 bg-linear-to-b from-[#1d3a4a] to-deep-charcoal p-3.5 shadow-[0_12px_24px_0_#08141c47]">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-[84px] items-center justify-center overflow-hidden rounded-sm border border-cool-gray bg-white">
          <ClientLogo slug={p.slug} src={p.logo} alt={name} scale={(logoScale[p.slug] ?? 0.93) * 0.525} />
        </span>
        <span className="flex items-center gap-1 rounded-[10px] bg-neon-green px-2 py-0.5 text-label-m text-deep-charcoal">
          <Icon name="map-pin" size={12} />
          {`${p.distance_km.toFixed(1)} ${c.km}`}
        </span>
      </div>
      <h3 className="truncate text-label-l text-white">{name}</h3>
      <ProviderBadges locale={locale} tier={p.tier} certified={p.certified} />
      <p className="flex items-center gap-1 text-caption">
        <Icon name="star-filled" size={14} className="text-v3-rating-star" />
        <span className="text-label-m text-white">{p.rating.toFixed(1)}</span>
        <span className="text-white/60">{`· ${meta}`}</span>
      </p>
      <p className="truncate text-caption text-white/75">{tx(locale, item, "services")}</p>
      {tx(locale, item, "highlight") && (
        <p className="flex items-center gap-1.5 text-label-m text-neon-green">
          <Icon name="check" size={14} />
          {tx(locale, item, "highlight")}
        </p>
      )}
      <hr className="mt-auto border-white/12" />
      <p className="flex items-center gap-1.5">
        <span className="text-caption text-white/60">{c.startsFrom}</span>
        <span className="text-h5 text-white">{formatPrice(locale, p.starting_price)}</span>
      </p>
      <div className="flex items-center justify-between">
        <Link href={routes.providers()} className="flex items-center gap-0.5 text-label-m text-neon-green hover:underline">
          {t.viewDetails}
          <Icon name="chevron-left" size={14} flip />
        </Link>
        <Link href={routes.search({ services: p.services })} className="flex items-center gap-1 text-label-m text-white">
          <Icon name="plus" size={14} />
          {t.compare}
        </Link>
      </div>
    </article>
  );
}

// Section · مقدّمو خدمة مشابهون (W2-21): خلفية كحلي + فلتر بـ3 خيارات + 4 كروت (الموبايل: كاروسيل)
export function SimilarProviders({
  locale,
  shortName,
  sets,
  carousel,
  services,
}: {
  locale: Locale;
  shortName: string;
  sets: Record<FilterKey, SimilarCardData[]>;
  carousel: CarouselData[];
  services: Service[];
}) {
  const t = getProviderDict(locale);
  const [filter, setFilter] = useState<FilterKey>("similar");
  const [switched, setSwitched] = useState(false); // الحركة بعد أول تغيير بس (مش عند التحميل)
  const [page, setPage] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const filters: { key: FilterKey; label: string }[] = [
    { key: "similar", label: t.similarFilters.similar(shortName) },
    { key: "nearest", label: t.similarFilters.nearest },
    { key: "same", label: t.similarFilters.same },
  ];
  const pages = Math.ceil(carousel.length / 2);
  // Dot · CHANGE_TO Page=n · SMART_ANIMATE 300ms EASE_OUT
  const goPage = (i: number) => {
    const el = track.current;
    if (!el || !el.firstElementChild) return;
    const step = 2 * ((el.firstElementChild as HTMLElement).offsetWidth + 10);
    const rtl = getComputedStyle(el).direction === "rtl";
    setPage(i);
    scrollContainerTo(el, (rtl ? -1 : 1) * i * step, 0.3);
  };
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setPage(Math.min(pages - 1, Math.round(Math.abs(el.scrollLeft) / Math.max(1, el.clientWidth - 40))));
  };
  return (
    <section className="theme-dark bg-deep-charcoal pt-10 pb-2">
      <Container className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 text-white">{t.similarTitle(shortName)}</h2>
            <p className="text-body-m text-white/75">{t.similarSub}</p>
          </div>
          <div role="radiogroup" aria-label={t.similarTitle(shortName)} className="hidden w-fit gap-1 rounded-full bg-white/8 p-1 md:flex">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                role="radio"
                aria-checked={filter === f.key}
                onClick={() => {
                  setFilter(f.key);
                  setSwitched(true);
                }}
                className={`rounded-full px-4 py-2 text-label-m whitespace-nowrap transition-colors duration-200 ease-figma-out ${
                  filter === f.key ? "bg-neon-green text-deep-charcoal shadow-[0_1px_1.5px_0_#14293614]" : "text-white/80 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* العميل المعدّل (85:35696): كروت الشعار (v2 · Provider card · Logo) زي W2-26 — 4 على الديسكتوب · 2×2 تحت 1280 */}
        <div key={filter} className={`hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4 xl:gap-[25.3px] ${switched ? "animate-dissolve" : ""}`}>
          {sets[filter].map((card) => (
            <ProviderCard key={card.provider.slug} locale={locale} provider={card.provider} services={services} showBadges showCertified={false} />
          ))}
        </div>
        {/* موبايل: الكاروسيل */}
        <div className="flex flex-col items-center gap-3 pb-6 md:hidden">
          <div ref={track} onScroll={onScroll} className="flex w-full snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none]">
            {carousel.map((item) => (
              <CarouselCard key={item.provider.slug} locale={locale} item={item} />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex gap-1.5">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t.carouselPage(i + 1)}
                  aria-current={i === page}
                  onClick={() => goPage(i)}
                  className={`h-2 rounded-xs transition-[width,background-color] duration-300 ease-figma-out ${i === page ? "w-5 bg-white" : "w-2 bg-white/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
