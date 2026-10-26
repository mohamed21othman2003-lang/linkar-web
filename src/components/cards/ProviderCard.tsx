import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { DarkChip, ProviderBadges, RatingMeta, TagPill } from "@/components/ui/Badges";
import { LogoArea } from "./ClientLogo";
import { FavoriteButton } from "./FavoriteButton";

// v2 · Provider card · Logo (1669:21274) — 301×453: لوجو أبيض + قلب، جسم غامق، شارة، الاسم،
// الشارات، التقييم، الخدمات، السعر و«احجز». الأزرار في آخر الكارت (mt-auto) عشان الكروت تتساوى.
// الطول min-h مش ثابت: لو الاسم اتلفّ سطرين (موبايل / إنجليزي) الكارت يطول بدل ما الزرار يتقصّ.
export function ProviderCard({
  locale,
  provider,
  services,
  showBadges = false,
  showCertified = true,
  className = "",
  tagLabel,
  aiLabel = false,
  meta,
}: {
  // بديل عدد الفروع في سطر التقييم (اسم الفرع في المفضلة)
  meta?: string;
  locale: Locale;
  provider: Provider;
  services: Service[];
  showBadges?: boolean;
  // تصميم العميل المعدّل (W2-26): الكارت بيعرض التصنيف بس من غير «معتمد LINKAR»
  showCertified?: boolean;
  className?: string;
  // نص الشارة الليموني بدل provider.tag (الرئيسية V2-01 بتحدد شارة لكل كارت)
  tagLabel?: string | null;
  // «ترشيح الذكاء الاصطناعي» مكان الشارة (كارت V-KOOL في V2-01)
  aiLabel?: boolean;
}) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  const chips = provider.services
    .map((s) => services.find((x) => x.slug === s))
    .filter((s): s is Service => !!s);
  return (
    <article
      className={`relative flex min-h-[453px] w-full flex-col overflow-hidden rounded-[20px] bg-cover bg-center ${className}`}
      style={{ backgroundImage: "url(/figma/cards/provider-card-bg.png)" }}
    >
      <Link href={routes.provider(provider.slug)} aria-label={name} className="absolute inset-0 z-0" />
      <LogoArea slug={provider.slug} src={provider.logo} alt={name} />
      <FavoriteButton label={t.favorite} className="absolute top-[19.5px] end-[19.6px] z-10" />
      <div className="pointer-events-none relative flex flex-1 flex-col items-start px-[22px] pt-[14px] pb-[18px]">
        {aiLabel ? (
          <span className="flex h-[30px] items-center gap-3 text-[12px] text-neon-green">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/glyphs/ai.svg" alt="" width={29} height={29} />
            {t.aiPick}
          </span>
        ) : (tagLabel !== undefined ? tagLabel : provider.tag && tx(locale, provider.tag, "label")) ? (
          <TagPill>{tagLabel !== undefined ? tagLabel : tx(locale, provider.tag!, "label")}</TagPill>
        ) : (
          <span className="h-[30px]" />
        )}
        <h3 className="mt-[5px] text-[17px] leading-[1.5] font-bold text-v3-text-on-dark">{name}</h3>
        <RatingMeta locale={locale} rating={provider.rating} distanceKm={provider.distance_km} branches={provider.branches} meta={meta} className="mt-2" />
        <div className="mt-[19px] flex flex-wrap gap-[6.4px]">
          {chips.map((s) => (
            <DarkChip key={s.slug}>{tx(locale, s, "chip")}</DarkChip>
          ))}
        </div>
        {showBadges && (
          <div className="mt-2">
            <ProviderBadges locale={locale} tier={provider.tier} certified={showCertified && provider.certified} />
          </div>
        )}
        <div className="mt-auto flex w-full items-center justify-between gap-2">
          <p className="flex items-baseline gap-[7px] whitespace-nowrap">
            <span className="text-body-s text-v3-text-meta">{t.startsFrom}</span>
            <span className="text-[17px] font-bold text-white">{formatPrice(locale, provider.starting_price)}</span>
          </p>
          <Link
            href={routes.provider(provider.slug)}
            className="pointer-events-auto relative z-10 inline-flex h-[30px] w-[78px] shrink-0 items-center max-md:h-10 max-md:w-[88px] justify-center rounded-full bg-neon-green text-label-m font-bold text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {t.book}
          </Link>
        </div>
      </div>
    </article>
  );
}
