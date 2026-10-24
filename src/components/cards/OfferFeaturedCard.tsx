import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider } from "@/lib/data/types";
import { formatNumber, formatPrice, currency } from "@/lib/format";
import { RatingMeta } from "@/components/ui/Badges";
import { ClientLogo } from "./ClientLogo";
import { Countdown } from "./Countdown";

// v2 · Offer card · Featured (1626:26019) — كارت ثابت 611×611 (r30.5). الأماكن من إحداثيات الفيجما بالظبط
// (start = يمين في العربي): «مقدم من» + صندوق الشعار، التقييم، الخصم الكبير، السعر والسعر القديم،
// عنوان العرض، عدّاد «ينتهي خلال» و«احجز العرض».
export function OfferFeaturedCard({
  locale,
  provider,
  discount,
  title,
  price,
  oldPrice,
  endsAt,
  bookHref,
}: {
  locale: Locale;
  provider: Provider;
  discount: number;
  title: string;
  price: number;
  oldPrice: number;
  endsAt: string; // ISO
  bookHref: string;
}) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  return (
    <article
      className="relative size-[611px] shrink-0 overflow-hidden rounded-[30.5px] border border-white/10 bg-cover bg-center text-white"
      style={{ backgroundImage: "url(/figma/cards/offer-featured-bg.png)" }}
    >
      <span className="absolute start-[49.6px] top-[40.9px] text-[22.97px] leading-normal">{t.offeredBy}</span>
      <div className="absolute start-[180px] top-[52.5px] flex h-[160.9px] w-[270.6px] items-center justify-center overflow-hidden rounded-[10px] border border-v3-card-stroke bg-white">
        <ClientLogo slug={provider.slug} src={provider.logo} alt={name} scale={0.9} />
      </div>
      <div className="absolute start-[180px] top-[220.5px] flex h-[21px] items-center">
        <RatingMeta locale={locale} rating={provider.rating} distanceKm={provider.distance_km} branches={provider.branches} />
      </div>
      <span className="absolute start-[21.8px] top-[265.7px] w-[320px] text-start text-[45.48px] leading-normal font-bold text-neon-green">
        {t.discount(discount)}
      </span>
      <span className="absolute end-[42.3px] top-[281.8px] w-[260px] text-end text-[32px] leading-normal font-bold text-neon-green">
        {formatPrice(locale, price)}
      </span>
      <span className="absolute start-[412.6px] top-[332.1px] w-[150px] text-start text-[14px] leading-normal">
        <s>{formatNumber(oldPrice)}</s> {currency(locale)}
      </span>
      <h3 className="absolute start-[50.3px] top-[387.6px] w-[540px] text-start text-[28.95px] leading-normal font-medium">{title}</h3>
      <Countdown locale={locale} endsAt={endsAt} variant="featured" />
      <Link
        href={bookHref}
        className="absolute end-[42.3px] top-[522.8px] flex h-[30.1px] w-[96.1px] items-center justify-center rounded-full bg-neon-green text-label-m font-bold whitespace-nowrap text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
      >
        {t.bookOffer}
      </Link>
    </article>
  );
}
