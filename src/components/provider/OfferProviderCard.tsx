"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { DarkChip, ProviderBadges, RatingMeta, TagPill } from "@/components/ui/Badges";
import { LogoArea } from "@/components/cards/ClientLogo";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import type { OtherOffer } from "./ServicePage";

// «مقدّمو خدمة آخرون يقدّمون …» في W2-32 (العميل المعدّل AVbWFtRb0aHpm34oqkI5ot): نفس شكل v2 · Provider card · Logo (301×453)
// + زر «قارن +» جنب القلب، والشارة = اسم الخدمة عنده، والشيب = الضمان، و«السعر» بدل «يبدأ من».
export function OfferProviderCard({
  locale,
  offer,
  inCompare,
  onCompare,
}: {
  locale: Locale;
  offer: OtherOffer;
  inCompare: boolean;
  onCompare: () => void;
}) {
  const c = getCommon(locale);
  const t = getProviderDict(locale);
  const { provider } = offer;
  const name = tx(locale, provider, "name");
  const warranty = tx(locale, offer, "warranty");
  return (
    <article
      className="relative flex min-h-[453px] w-full flex-col overflow-hidden rounded-[20px] bg-cover bg-center"
      style={{ backgroundImage: "url(/figma/cards/provider-card-bg.png)" }}
    >
      <Link href={routes.provider(provider.slug)} aria-label={name} className="absolute inset-0 z-0" />
      <LogoArea slug={provider.slug} src={provider.logo} alt={name} />
      <FavoriteButton label={c.favorite} className="absolute top-5 end-5 z-10" />
      {/* Compare: أبيض بحدود #b3b3b3 «قارن +» · في المقارنة: ليموني «في المقارنة ✓» */}
      <button
        type="button"
        aria-pressed={inCompare}
        onClick={onCompare}
        className={`absolute top-5 end-[63px] z-10 flex h-[35px] items-center rounded-full px-3 text-[13px] leading-[25px] font-medium whitespace-nowrap text-deep-charcoal transition-colors duration-200 ease-figma-out ${
          inCompare ? "bg-neon-green hover:bg-bg-brand-hover" : "border border-v3-card-stroke bg-white hover:bg-tile"
        }`}
      >
        {inCompare ? `${t.inCompare} ✓` : `${t.compare} +`}
      </button>
      <div className="pointer-events-none relative flex flex-1 flex-col items-start px-[22px] pt-[14px] pb-[18px]">
        <TagPill>{tx(locale, offer, "name")}</TagPill>
        <h3 className="mt-[5px] text-[17px] leading-[1.5] font-bold text-v3-text-on-dark">{name}</h3>
        <RatingMeta locale={locale} rating={provider.rating} distanceKm={provider.distance_km} branches={provider.branches} className="mt-2" />
        {warranty && (
          <div className="mt-[19px] flex">
            <DarkChip>{warranty}</DarkChip>
          </div>
        )}
        <div className="mt-2">
          <ProviderBadges locale={locale} tier={provider.tier} certified={false} />
        </div>
        <div className="mt-auto flex w-full items-center justify-between gap-2">
          <p className="flex items-baseline gap-[7px] whitespace-nowrap">
            <span className="text-body-s text-v3-text-meta">{t.price}</span>
            <span className="text-[17px] font-bold text-white">{formatPrice(locale, offer.price)}</span>
          </p>
          <Link
            href={routes.provider(provider.slug)}
            className="pointer-events-auto relative z-10 inline-flex h-[30px] w-[78px] shrink-0 items-center justify-center rounded-full bg-neon-green text-label-m font-bold text-deep-charcoal hover:bg-bg-brand-hover max-md:h-10 max-md:w-[88px]"
          >
            {c.book}
          </Link>
        </div>
      </div>
    </article>
  );
}
