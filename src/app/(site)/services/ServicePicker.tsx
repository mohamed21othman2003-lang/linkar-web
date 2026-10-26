"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import type { ServicePageCard } from "@/lib/data/pages/services-page";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/format";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { LogoTile } from "@/components/search/LogoTile";
import { getCommon } from "@/i18n/dict/common";

export type PickerService = { service: Service; card: ServicePageCard; providers: Provider[] };
type Copy = Record<"selectedOne" | "selectedTwo" | "selectedMany" | "together" | "ctaOne" | "ctaTwo" | "ctaMany" | "hint" | "topLabel", string>;

// كروت الخدمات الغامقة قابلة للاختيار المتعدد + شريط الاختيار (Selection bar) في W2-25
export function ServicePicker({
  locale,
  items,
  copy,
  defaultSelected = [],
  definiteNames = {},
}: {
  locale: Locale;
  items: PickerService[];
  copy: Copy;
  defaultSelected?: ServiceSlug[];
  // الاسم بأداة التعريف في جملة الاختيار («النانو سيراميك»)
  definiteNames?: Partial<Record<ServiceSlug, string>>;
}) {
  // الحالة الافتراضية في الفيجما (W2-25): خدمتين مختارين
  const [selected, setSelected] = useState<ServiceSlug[]>(defaultSelected);
  const toggle = (s: ServiceSlug) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  const names = selected.map((s) => definiteNames[s] ?? tx(locale, items.find((i) => i.service.slug === s)!.service, "name"));
  const n = names.length;
  const title =
    n === 1
      ? copy.selectedOne.replace("{a}", names[0])
      : n === 2
        ? copy.selectedTwo.replace("{a}", names[0]).replace("{b}", names[1])
        : copy.selectedMany.replace("{n}", String(n)).replace("{list}", names.join(" + "));
  const cta = n === 1 ? copy.ctaOne : n === 2 ? copy.ctaTwo : copy.ctaMany;

  return (
    <div className="flex flex-col gap-5">
      {/* Services grid (تصميم العميل المعدّل 85:37060): 3 كروت في السطر 410 وبينهم 25، والسطور بينها 24 */}
      <div className="grid grid-cols-1 gap-x-[25px] gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ServiceOverviewCard
            key={item.service.slug}
            locale={locale}
            item={item}
            topLabel={copy.topLabel}
            on={selected.includes(item.service.slug)}
            onToggle={() => toggle(item.service.slug)}
          />
        ))}
      </div>

      {n > 0 ? (
        <div className="flex flex-col gap-4 rounded-[20px] bg-deep-charcoal px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 text-white">
            <p className="text-label-l">{title}</p>
            {n > 1 && <p className="text-caption">{copy.together}</p>}
          </div>
          <Link
            href={routes.search({ services: selected })}
            className="flex items-center justify-center gap-1.5 rounded-md bg-neon-green px-[18px] py-2.5 text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
          >
            {cta}
            <Icon name="chevron-left" size={16} flip />
          </Link>
        </div>
      ) : (
        <p className="text-body-s text-text-secondary">{copy.hint}</p>
      )}
    </div>
  );
}

// v2 · Service card (W2-25 المعدّل) — 410 عرض، p24 gap16، r20، #142224؛ المختار: حد ليموني 4 من جوّه.
// الفيجما مثبّت الارتفاع على 456 فالفوتر (السعر و«احجز») بيطلع برّه الكارت ويتقص — هنا الكارت بياخد طول محتواه (499)
// عشان السعر والزرار يبانوا كاملين. الحد الليموني (4 من جوّه) بيزوّد 8 على الطول، فكل الكروت min-h 507 عشان الاختيار مايحرّكش الصفحة.
function ServiceOverviewCard({
  locale,
  item: { service, card, providers },
  topLabel,
  on,
  onToggle,
}: {
  locale: Locale;
  item: PickerService;
  topLabel: string;
  on: boolean;
  onToggle: () => void;
}) {
  const t = getCommon(locale);
  return (
    <article
      role="checkbox"
      aria-checked={on}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), onToggle())}
      className={`flex cursor-pointer flex-col gap-4 rounded-[20px] bg-v3-card-dark p-6 xl:min-h-[507px] transition-[border-color] duration-200 ease-figma-out ${on ? "border-4 border-neon-green" : ""}`}
    >
      {/* Top: الأيقونة والاسم في البداية، والـCheckbox في الآخر */}
      <div className="flex h-[52px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ServiceGlyph name={service.slug} size={52} className="shrink-0 text-neon-green" />
          <h3 className="text-[22px] leading-[42px] font-medium text-neon-green">{tx(locale, service, "name")}</h3>
        </div>
        <span
          aria-hidden
          className={`flex size-[26px] shrink-0 items-center justify-center rounded-[7px] ${on ? "bg-neon-green text-v3-card-dark" : "border-[1.5px] border-v3-card-stroke"}`}
        >
          {on && <Icon name="check" size={16} />}
        </span>
      </div>
      <p className="min-h-[54px] text-[14px] leading-[27px] font-light text-v3-card-stroke">{tx(locale, card, "description")}</p>
      <div className="flex flex-wrap gap-2">
        {card.chips.map((c) => (
          <span key={c.text_ar} className="rounded-full bg-v3-chip-dark px-3 py-[5px] text-[12px] leading-[15px] text-v3-text-on-dark">
            {tx(locale, c, "text")}
          </span>
        ))}
      </div>
      <hr className="h-px border-0 bg-v3-chip-dark" />
      <p className="text-[12px] leading-[23px] font-medium text-v3-text-meta">{topLabel}</p>
      <ul className="flex flex-col gap-2.5">
        {providers.map((p) => (
          <li key={p.slug} className="flex h-10 items-center justify-between gap-2.5">
            <span className="flex min-w-0 items-center gap-2.5">
              <LogoTile src={p.logo} alt="" size={40} radius={10} className="border-0" />
              <span className="truncate text-[14px] leading-[27px] font-medium text-v3-text-on-dark">{tx(locale, p, "name")}</span>
            </span>
            <span className="shrink-0 text-[12px] leading-[15px] text-v3-text-meta">
              <span className="text-v3-rating-star">★</span> {p.rating.toFixed(1)} · {p.distance_km.toFixed(1)} {t.km}
            </span>
          </li>
        ))}
      </ul>
      {/* Spacer + Footer: «يبدأ من» والسعر في البداية، و«احجز» في الآخر */}
      <div className="h-px flex-1" />
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[12px] leading-[15px] text-v3-text-meta">{t.startsFrom}</span>
          <span className="text-[18px] leading-[34px] font-bold text-v3-text-on-dark">{formatPrice(locale, card.starting_price)}</span>
        </p>
        <Link
          href={routes.search({ services: [service.slug] })}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[39px] items-center justify-center rounded-full bg-neon-green px-[22px] text-[14px] leading-[27px] font-bold text-v3-card-dark hover:bg-bg-brand-hover"
        >
          {t.book}
        </Link>
      </div>
    </article>
  );
}
