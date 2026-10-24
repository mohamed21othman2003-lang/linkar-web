"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider } from "@/lib/data/types";
import type { Alternative, LightOffer } from "@/lib/data/search/types";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { CompareButton } from "./Compare";
import { LogoTile } from "./LogoTile";

// AI pick (708:3588 · 704:3341): شريط كحلي بترشيح الذكاء الاصطناعي
export function AiPick({
  locale,
  logo,
  name,
  title,
  body,
  price,
  href,
  bigLogo,
}: {
  locale: Locale;
  logo: string;
  name: string;
  title: string;
  body: string;
  price: number;
  href: string;
  bigLogo: boolean;
}) {
  const t = getSearchDict(locale);
  return (
    <div
      className={`flex flex-col gap-4 rounded-[22px] bg-deep-charcoal p-[18px] md:min-h-[136px] md:flex-row md:items-center md:gap-5 md:ps-[18px] md:pe-6 ${
        bigLogo ? "md:py-0" : "md:py-[18px]"
      }`}
    >
      <LogoTile src={logo} alt={name} size={bigLogo ? 139 : 64} height={bigLogo ? 136 : 64} className={bigLogo ? "hidden md:inline-block" : ""} />
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="flex items-center gap-2 text-label-m text-neon-green">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/glyphs/ai.svg" alt="" width={24} height={24} className="size-6" />
          {t.aiLabel}
        </span>
        <p className="text-h5 text-white">{title}</p>
        <p className="text-caption leading-6 text-white/80">{body}</p>
      </div>
      <div className="hidden flex-1 md:block" />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start">
          <span className="text-caption text-white/65">{t.forYourCar}</span>
          <span className="text-h4 whitespace-nowrap text-white">{formatPrice(locale, price)}</span>
        </div>
        <Link href={href} className="flex h-12 items-center gap-1.5 rounded-md bg-neon-green px-[18px] text-label-l whitespace-nowrap text-deep-charcoal hover:bg-bg-brand-hover">
          {t.detailsAndBook}
          <Icon name="chevron-left" size={16} flip />
        </Link>
      </div>
    </div>
  );
}

// عنوان قسم: H4 + سطر وصف
export function SectionHead({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-h4 text-deep-charcoal">{title}</h2>
      {description && <p className="text-caption leading-6 text-state-gray">{description}</p>}
    </div>
  );
}

// Alt · … في «طرق أخرى للحصول على نفس النتيجة» (W2-30a)
export function AltCard({ locale, item }: { locale: Locale; item: Alternative }) {
  const t = getSearchDict(locale);
  const name = tx(locale, item.name, "text");
  const href = item.provider ? routes.providerService(item.provider, item.service) : routes.providers();
  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-cool-gray bg-white p-5">
      <div className="flex items-center gap-2.5">
        <LogoTile src={item.logo} alt={name} size={44} />
        <div className="flex flex-col items-start gap-0.5">
          <p className="text-label-l text-deep-charcoal">{name}</p>
          <p className="flex items-center gap-1.5 text-caption text-v3-text-meta">
            <Icon name="star-filled" size={14} className="text-v3-rating-star" />
            <span className="font-medium text-deep-charcoal">{item.rating.toFixed(1)}</span>
            <span>·</span>
            <Icon name="map-pin" size={14} className="text-v3-text-meta" />
            <span>{`${item.distance_km.toFixed(1)} ${getCommon(locale).km}`}</span>
          </p>
        </div>
      </div>
      <h3 className="text-h5 text-deep-charcoal">{tx(locale, item.title, "text")}</h3>
      <p className="text-body-s text-v3-text-meta">{tx(locale, item.description, "text")}</p>
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-cool-gray/35 px-2.5 py-[5px] text-caption text-deep-charcoal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/search/fact-shield.svg" alt="" width={16} height={16} className="size-4 object-contain" />
        {tx(locale, item.warranty, "text")}
      </span>
      <hr className="mt-auto border-cool-gray" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-baseline gap-1">
          <span className="text-caption text-v3-text-meta">{t.forYourCar}</span>
          <span className="text-h5 text-deep-charcoal">{formatPrice(locale, item.price)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link href={href} className="flex h-[38px] items-center gap-1 rounded-[10px] bg-deep-charcoal px-3 text-label-m text-neon-green hover:bg-bg-inverse-subtle">
            {t.details}
            <Icon name="chevron-left" size={14} flip />
          </Link>
          <CompareButton locale={locale} id={item.key} variant="outline" />
        </div>
      </div>
    </article>
  );
}

// Offer · … (عروض وباقات فاتحة في W2-30a)
export function LightOfferCard({ locale, item, provider, providerName }: { locale: Locale; item: LightOffer; provider: Provider; providerName: string }) {
  const t = getSearchDict(locale);
  const href = routes.providerService(provider.slug, item.services[item.services.length - 1]);
  return (
    <article className="flex flex-col gap-3 rounded-[20px] border border-v3-card-stroke bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex gap-1.5">
          {item.services.map((s) => (
            <span key={s} className="flex size-9 items-center justify-center rounded-md bg-neon-green text-deep-charcoal">
              <ServiceGlyph name={s} size={21} />
            </span>
          ))}
        </span>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-deep-charcoal px-3 text-label-m text-neon-green">
          <Icon name="tag" size={14} />
          {tx(locale, item.badge, "text")}
        </span>
      </div>
      <h3 className="text-h5 text-deep-charcoal">{tx(locale, item.title, "text")}</h3>
      <p className="text-body-s text-v3-text-meta">{tx(locale, item.description, "text")}</p>
      <Link href={routes.provider(provider.slug)} className="flex items-center gap-2 self-start text-label-m text-deep-charcoal hover:underline">
        <LogoTile src={provider.logo} alt={providerName} size={32} />
        {providerName}
      </Link>
      <hr className="mt-auto border-cool-gray" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-start">
          <p className="flex items-baseline gap-1.5">
            <span className="text-h5 text-deep-charcoal">{formatPrice(locale, item.price)}</span>
            <s className="text-caption text-v3-text-meta">{formatNumber(item.old_price)}</s>
          </p>
          <span className="text-caption text-green-active">{tx(locale, item.note, "text")}</span>
        </div>
        <Link href={href} className="flex h-[38px] items-center gap-1 rounded-[10px] bg-neon-green px-3 text-label-m whitespace-nowrap text-deep-charcoal hover:bg-bg-brand-hover">
          {t.detailsAndBook}
          <Icon name="chevron-left" size={14} flip />
        </Link>
      </div>
    </article>
  );
}
