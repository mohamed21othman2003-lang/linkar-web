import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider } from "@/lib/data/types";
import { currency, formatNumber } from "@/lib/format";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import { Icon } from "@/components/icons/Icon";
import { LogoTile } from "../bits";

export type SpecIcon = "clock" | "shield" | "calendar" | "package";
export type ListingView = {
  key: string;
  provider: Provider;
  media: string; // /figma/home/offers/*.jpg
  discount: number;
  chip: { icon: "clock" | "package"; label: string };
  category: { icon: "polish" | "tint" | "package"; label: string };
  title: string;
  specs: { icon: SpecIcon; label: string }[];
  price: number;
  oldPrice: number;
  note: string; // «شامل الضريبة · سيدان»
  distance: string; // «3.2 كم منك»
  save: string; // «وفّر {n} ر.س»
  detailsHref: string;
  bookHref: string;
  bookLabel: string;
  spacer?: boolean; // الباقات: «Spacer · push» بعد المواصفات (والأزرار بتنزل لحد 3px من الحافة زي الفيجما)
};

function SpecGlyph({ icon }: { icon: SpecIcon }) {
  if (icon === "clock" || icon === "package") return <Icon name={icon} size={16} className="text-state-gray" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/figma/home/offers/spec-${icon}.svg`} alt="" width={16} height={16} />;
}

// Listing card (37:27333 عرض · 37:27483 باقة) — 302×610: صورة 186 بتدرّج + خصم + قلب + شريحة «ينتهي خلال…»،
// لوحة الشعار 140×54 فوق حافة الصورة، مقدّم الخدمة والمسافة ★، التصنيف، العنوان (سطرين)، 3 مواصفات،
// السعر قبل/بعد، «وفّر…» و«شامل الضريبة»، ثم «التفاصيل» و«احجز…»
export function ListingCard({ locale, v }: { locale: Locale; v: ListingView }) {
  const t = getCommon(locale);
  const name = tx(locale, v.provider, "name");
  return (
    <article className="relative flex h-[610px] w-full flex-col overflow-hidden rounded-[20px] border border-cool-gray/60 bg-white shadow-[0_10px_28px_-6px_#0a0d0a0f,0_1px_2px_#0a0d0a0a]">
      <div className="relative h-[186px] shrink-0">
        <Image src={v.media} alt="" fill sizes="302px" className="object-cover" />
        <span className="absolute inset-0 bg-linear-to-b from-deep-charcoal/0 from-40% to-deep-charcoal/55" />
        <span className="absolute end-3 top-3 flex h-8 items-center rounded-full bg-neon-green px-3 text-[14px] leading-5 font-bold text-deep-charcoal drop-shadow-[0_4px_6px_#0000002e]">
          {t.discount(v.discount)}
        </span>
        <span className="absolute end-3 bottom-3 flex items-center gap-1.5 rounded-full border border-white/28 bg-deep-charcoal/45 px-2.5 py-1 text-label-m text-white backdrop-blur-[5px]">
          <Icon name={v.chip.icon} size={14} />
          {v.chip.label}
        </span>
      </div>
      <FavoriteButton label={t.favorite} className="absolute start-3 top-3 z-10 size-9! rounded-full! bg-white/92! text-nature-green!" />
      <div className="absolute start-4 top-[159px] z-10 shadow-[0_8px_18px_#14293633]">
        <LogoTile slug={v.provider.slug} alt="" size={54} width={140} radius="rounded-md" className="w-[140px]" fit={[83, 31]} />
      </div>
      <div className={`flex flex-1 flex-col items-start gap-3 px-4 pt-[38px] ${v.spacer ? "pb-[3px]" : "pb-4"}`}>
        <div className="flex w-full flex-col items-start gap-0.5">
          <h3 className="w-full truncate text-h5 text-deep-charcoal">{name}</h3>
          <p className="flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="star-filled" size={14} className="text-nature-green" />
            <span className="text-label-m text-deep-charcoal">{v.provider.rating.toFixed(1)}</span>
            <span className="text-caption text-[#66706b]">{v.distance}</span>
          </p>
        </div>
        <p className="flex w-full items-center gap-1.5 text-label-m text-green-active">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/figma/home/offers/cat-${v.category.icon}.svg`} alt="" width={16} height={16} className="shrink-0" />
          <span className="truncate">{v.category.label}</span>
        </p>
        <p className="line-clamp-2 h-14 w-full text-h5 text-deep-charcoal">{v.title}</p>
        <ul className="flex w-full items-start rounded-md bg-cool-gray/35 px-1 py-2.5">
          {v.specs.map((s) => (
            <li key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <SpecGlyph icon={s.icon} />
              <span className="text-[14px] leading-[22px] font-light whitespace-nowrap text-[#5d6158]">{s.label}</span>
            </li>
          ))}
        </ul>
        {v.spacer && <span aria-hidden className="h-px shrink-0" />}
        <div className="flex w-full flex-col items-start gap-1">
          <p className="flex items-baseline gap-2.5 whitespace-nowrap">
            <span className="flex items-baseline gap-1">
              <span className="text-[26px] leading-10 font-bold text-deep-charcoal">{formatNumber(v.price)}</span>
              <span className="text-[14px] leading-6 font-light text-[#5d6158]">{currency(locale)}</span>
            </span>
            <span className="text-[16px] leading-7 font-light text-[#6e746a]">{formatNumber(v.oldPrice)}</span>
          </p>
          <div className="flex h-7 w-full items-center justify-between gap-2">
            <span className="text-caption text-[#66706b]">{v.note}</span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#0b0d0a] px-2 py-1 text-label-m text-neon-green">
              {v.save}
              <Icon name="tag" size={12} />
            </span>
          </div>
        </div>
        <div className="mt-auto flex w-full gap-2">
          <Link
            href={v.bookHref}
            className="flex h-11 flex-1 items-center justify-center rounded-md bg-neon-green px-5 text-[15px] leading-[22px] font-bold whitespace-nowrap text-deep-charcoal transition-colors hover:bg-bg-brand-hover"
          >
            {v.bookLabel}
          </Link>
          <Link
            href={v.detailsHref}
            className="flex h-11 flex-1 items-center justify-center rounded-md border-[1.5px] border-[#d0d3c9] bg-white px-5 text-[15px] leading-[22px] font-bold whitespace-nowrap text-deep-charcoal transition-colors hover:border-deep-charcoal"
          >
            {t.details}
          </Link>
        </div>
      </div>
    </article>
  );
}
