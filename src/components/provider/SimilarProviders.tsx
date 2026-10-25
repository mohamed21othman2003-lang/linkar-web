"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import type { Localized } from "@/i18n/config";
import { currency, formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { ProviderBadges } from "@/components/ui/Badges";
import { ClientLogo } from "@/components/cards/ClientLogo";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import { Icon } from "@/components/icons/Icon";
import { scrollContainerTo } from "./motion";

export type SimilarCardData = { provider: Provider; tag: Localized<"tag"> | null; services: ServiceSlug[]; photo: string };
export type CarouselData = Localized<"services"> & Localized<"highlight"> & { provider: Provider; reviews_count?: number };
type FilterKey = "similar" | "nearest" | "same";

// مقاس الشعار جوّه صندوق الكارت 160×61 نسبةً لجدول logoSize (XPEL مربّع فيه مساحة فاضية)
const logoScale: Record<string, number> = { xpel: 0.71, "v-kool": 0.4 };

// كارت مقدّم الخدمة بالصورة (Section · مقدّمو خدمة مشابهون في W2-21): صورة + شارة + قلب + شعار عائم + الاسم + التقييم + الخدمات + السعر
function SimilarCard({ locale, card, services }: { locale: Locale; card: SimilarCardData; services: Service[] }) {
  const c = getCommon(locale);
  const { provider } = card;
  const name = tx(locale, provider, "name");
  const chips = card.services.slice(0, 2).map((s) => services.find((x) => x.slug === s)!);
  const more = card.services.length - chips.length;
  return (
    <article className="relative flex h-[453px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/6 bg-white/6 sm:w-auto">
      <Link href={routes.provider(provider.slug)} aria-label={name} className="absolute inset-0 z-0" />
      <div className="pointer-events-none relative h-[200px] shrink-0">
        <Image src={card.photo} alt="" fill sizes="(min-width: 1024px) 302px, 280px" className="object-cover" />
        {card.tag && (
          <span className="absolute start-2.5 top-3 flex h-6 items-center gap-1.5 rounded-full bg-hero-ink px-2 text-label-m text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/provider/icons/badge-check.svg" alt="" width={14} height={14} />
            {tx(locale, card.tag, "tag")}
          </span>
        )}
      </div>
      <div className="pointer-events-auto absolute end-3 top-3 z-10">
        <FavoriteButton label={c.favorite} className="size-9! rounded-full! bg-white/92! text-nature-green!" />
      </div>
      <div className="pointer-events-none absolute start-[15px] top-[171px] flex h-[61px] w-[160px] items-center justify-center overflow-hidden rounded-md border border-cool-gray bg-white shadow-[0_8px_18px_0_#14293638]">
        <ClientLogo slug={provider.slug} src={provider.logo} alt={name} scale={logoScale[provider.slug] ?? 0.93} />
      </div>
      <div className="pointer-events-none relative flex flex-1 flex-col items-start gap-2.5 px-4 pt-10 pb-4">
        <h3 className="text-h4 text-white">{name}</h3>
        <div className="flex items-center gap-2">
          <Icon name="star-filled" size={14} className="text-v3-rating-star" />
          <span className="text-label-l text-white">{provider.rating.toFixed(1)}</span>
          <span className="size-[3px] rounded-full bg-white/40" />
          <span className="flex items-center gap-1 text-body-s text-text-on-image-muted">
            <Icon name="map-pin" size={16} />
            {`${provider.distance_km.toFixed(1)} ${c.km} · ${c.branches(provider.branches)}`}
          </span>
        </div>
        <div className="flex gap-1.5">
          {chips.map((s) => (
            <span key={s.slug} className="flex h-6 items-center rounded-full bg-white/10 px-2.5 text-label-m whitespace-nowrap text-white">
              {locale === "ar" ? s.name_ar : s.chip_en}
            </span>
          ))}
          {more > 0 && <span className="flex h-6 items-center rounded-full bg-white/10 px-2.5 text-label-m text-white">{`+${more}`}</span>}
        </div>
        <hr className="mt-auto w-full border-white/6" />
        <div className="flex w-full items-center justify-between gap-2">
          <p className="flex items-baseline gap-1.5 text-white">
            <span className="text-body-s">{c.startsFrom}</span>
            {locale === "en" && <span className="text-body-s">{currency(locale)}</span>}
            <span className="text-h5">{formatNumber(provider.starting_price)}</span>
            {locale === "ar" && <span className="text-body-s">{currency(locale)}</span>}
          </p>
          <Link
            href={routes.provider(provider.slug)}
            className="pointer-events-auto relative z-10 flex h-11 items-center rounded-md bg-neon-green px-5 text-[15px] leading-[22px] font-bold text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
          >
            {c.book}
          </Link>
        </div>
      </div>
    </article>
  );
}

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
        {/* ديسكتوب: 4 كروت · تابلت ولابتوب صغير (< 1280): 2×2 عشان سطر السعر مايتكسرش */}
        <div key={filter} className={`hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4 ${switched ? "animate-dissolve" : ""}`}>
          {sets[filter].map((card) => (
            <SimilarCard key={card.provider.slug} locale={locale} card={card} services={services} />
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
