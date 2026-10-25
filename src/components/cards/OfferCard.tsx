import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider } from "@/lib/data/types";
import { formatNumber, formatPrice, currency } from "@/lib/format";
import { routes } from "@/lib/routes";
import { RatingMeta } from "@/components/ui/Badges";
import { LogoArea } from "./ClientLogo";

export type OfferFeature = { icon: "clock" | "warranty" | "calendar"; label: string };

// v2 · Offer card · Logo (1626:26141) — 313×614: شعار، خصم، اسم، عنوان العرض بالليموني،
// صندوق المميزات، السعر والسعر القديم، «التفاصيل» و«احجز» (min-h: الاسم الطويل يطوّل الكارت مايقصّش الأزرار)
export function OfferCard({
  locale,
  provider,
  discount,
  title,
  features,
  price,
  oldPrice,
  detailsHref,
  bookHref,
}: {
  locale: Locale;
  provider: Provider;
  discount: number;
  title: [string, string]; // سطرين
  features: OfferFeature[];
  price: number;
  oldPrice: number;
  detailsHref: string;
  bookHref: string;
}) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  return (
    <article
      className="relative flex min-h-[614px] w-full flex-col overflow-hidden rounded-[20px] bg-cover bg-center"
      style={{ backgroundImage: "url(/figma/cards/offer-card-bg.png)" }}
    >
      <LogoArea slug={provider.slug} src={provider.logo} alt={name} />
      <span className="absolute top-[19px] end-[19px] flex h-[30.6px] items-center rounded-full bg-neon-green px-4 text-[15px] font-bold text-v3-text-on-lime">
        {t.discount(discount)}
      </span>
      <div className="flex flex-1 flex-col px-[22px] pt-[22px] pb-[18px]">
        <Link href={routes.provider(provider.slug)} className="text-[17px] leading-[1.5] font-bold text-v3-text-on-dark hover:underline">
          {name}
        </Link>
        <RatingMeta locale={locale} rating={provider.rating} distanceKm={provider.distance_km} branches={provider.branches} className="mt-[2px]" />
        {/* سطرين ثابتين حتى لو العنوان سطر واحد (مكان المميزات والسعر ثابت في الفيجما) */}
        <p className="mt-[36px] min-h-[49.2px] text-[20px] leading-[24.6px] font-medium text-neon-green">
          {title[0]}
          <br />
          {title[1]}
        </p>
        <ul className="mt-[27px] grid h-[66px] grid-cols-3 items-center rounded-sm bg-v3-box-light px-2">
          {/* الإنجليزي أطول من العمود (≈90px) — يتلف سطرين جوه الصندوق بدل ما يركب على اللي جنبه */}
          {features.map((f) => (
            <li
              key={f.icon}
              className={`flex min-w-0 flex-col items-center gap-0.5 text-center text-body-s text-v3-text-meta ${locale === "ar" ? "leading-[1.4] whitespace-nowrap" : "leading-[1.15]"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/figma/glyphs/feature-${f.icon}.svg`} alt="" width={19} height={19} />
              {f.label}
            </li>
          ))}
        </ul>
        <div className="mt-[16px] flex items-end justify-between">
          <span className="text-[32px] leading-[1.4] font-bold text-neon-green">{formatPrice(locale, price)}</span>
          <span className="pb-2 text-[14px] text-white">
            <s>{formatNumber(oldPrice)}</s> {currency(locale)}
          </span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-[9.7px]">
          <Link
            href={bookHref}
            className="flex h-[30px] items-center justify-center rounded-full bg-neon-green max-md:h-10 text-label-m font-bold text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {t.book}
          </Link>
          <Link
            href={detailsHref}
            className="flex h-[30px] items-center justify-center rounded-full bg-v3-box-light max-md:h-10 text-label-m font-bold text-deep-charcoal hover:bg-bg-muted"
          >
            {t.details}
          </Link>
        </div>
      </div>
    </article>
  );
}
