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
import { LogoTile } from "./LogoTile";
import { DarkResultCard } from "./ResultCard";
import { ClientLogo } from "@/components/cards/ClientLogo";
import { logoAreaSize } from "@/lib/data/providers";

// AI pick (تصميم العميل المعدّل · W2-30 / W2-30a): شريط كحلي 165 — صندوق شعار أبيض 200×129 (الشعار أكبر منه وبيتقص)،
// العنوان + سطر التقييم + الوصف + شيبس، وفي الآخر السعر و«التفاصيل والحجز»
export function AiPick({
  locale,
  logo,
  logoSlug,
  name,
  title,
  rating,
  body,
  chips = [],
  price,
  href,
}: {
  locale: Locale;
  logo: string;
  logoSlug: string;
  name: string;
  title: string;
  rating?: string;
  body: string;
  chips?: string[];
  price: number;
  href: string;
}) {
  const t = getSearchDict(locale);
  const big = logoAreaSize[logoSlug];
  return (
    <div className="flex flex-col gap-4 rounded-[22px] bg-deep-charcoal p-[18px] md:min-h-[165px] md:flex-row md:items-center md:gap-5 md:ps-[18px] md:pe-6">
      <span className="hidden h-[129px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white md:flex">
        {/* الشعار أعرض من الصندوق (230 جوه 200) وبيتقص زي الفيجما — الغلاف عشان max-width:100% */}
        <span className="flex shrink-0 justify-center" style={{ width: big?.[0] }}>
          <ClientLogo slug={logoSlug} src={logo} alt={name} size={big ? [big[0], big[1]] : undefined} />
        </span>
      </span>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="flex items-center gap-2 text-label-m text-neon-green">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/glyphs/ai.svg" alt="" width={24} height={24} className="size-6" />
          {t.aiLabel}
        </span>
        <p className="text-[18px] leading-[28px] font-bold text-white">{title}</p>
        {rating && (
          <p className="text-[13px] leading-4 text-v3-text-meta">
            <span className="text-v3-rating-star">★</span> {rating}
          </p>
        )}
        <p className="text-caption leading-6 text-white/80">{body}</p>
        {chips.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="inline-flex h-[21px] items-center rounded-full bg-v3-chip-dark px-2.5 text-[12px] leading-[15px] text-v3-text-on-dark">
                {c}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="hidden flex-1 md:block" />
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start">
          <span className="text-caption text-white/65">{t.forYourCar}</span>
          <span className="text-[22px] leading-[34px] font-bold whitespace-nowrap text-white">{formatPrice(locale, price)}</span>
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

// «طرق أخرى للحصول على نفس النتيجة» (W2-30a المعدّل): نفس كارت النتيجة الغامق من غير الإجمالي
export function AltCard({ locale, item }: { locale: Locale; item: Alternative }) {
  const c = getCommon(locale);
  const href = item.provider ? routes.providerService(item.provider, item.service) : routes.providers();
  return (
    <DarkResultCard
      locale={locale}
      logo={item.logo}
      logoSlug={item.key}
      name={tx(locale, item.name, "text")}
      href={href}
      pill={item.tag ? tx(locale, item.tag, "text") : null}
      rating={`${item.rating.toFixed(1)} · ${item.distance_km.toFixed(1)} ${c.km}`}
      ratingTone="star"
      lines={[{ key: item.key, name: tx(locale, item.title, "text"), service: item.service, price: formatPrice(locale, item.price) }]}
      specs={(item.specs ?? [item.warranty]).map((x) => tx(locale, x, "text"))}
      compareId={item.key}
      detailsHref={href}
    />
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
