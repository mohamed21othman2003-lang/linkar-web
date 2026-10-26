"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { Provider, ProviderTier, ServiceSlug } from "@/lib/data/types";
import type { SearchResult } from "@/lib/data/search/types";
import { logoAreaSize } from "@/lib/data/providers";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { ServiceGlyph } from "@/components/icons/Icon";
import { ProviderBadges } from "@/components/ui/Badges";
import { ClientLogo } from "@/components/cards/ClientLogo";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import { useCompare } from "./Compare";

export const resultName = (locale: Locale, r: SearchResult, p: Provider) =>
  r.display_name ? tx(locale, r.display_name, "name") : tx(locale, p, "name");

export const resultWhere = (locale: Locale, r: SearchResult) => {
  const c = getCommon(locale);
  return `${r.distance_km.toFixed(1)} ${c.km}${r.branch ? ` · ${tx(locale, r.branch, "name")}` : ""}`;
};

export type DarkLine = {
  key: string;
  name: string;
  service?: ServiceSlug;
  price: string;
  oldPrice?: string;
  href?: string;
};

// v2 · Result card · Logo (تصميم العميل المعدّل · W2-30 / W2-30a): صندوق الشعار الأبيض 178 + قلب، وجسم غامق:
// الشارات، الاسم، التقييم، سطور الخدمات، المواصفات، الإجمالي، و«قارن +» / «التفاصيل والحجز».
// نفس الكارت لـ«طرق أخرى للحصول على نفس النتيجة» (من غير الإجمالي).
export function DarkResultCard({
  locale,
  logo,
  logoSlug,
  name,
  href,
  tier,
  pill,
  rating,
  ratingTone = "meta",
  lines,
  specs,
  total,
  compareId,
  detailsHref,
}: {
  locale: Locale;
  logo: string;
  logoSlug: string;
  name: string;
  href: string;
  tier?: ProviderTier;
  pill?: string | null;
  rating: string; // «4.9 (320) · 5.6 كم · فرع الزهراء» من غير النجمة
  ratingTone?: "meta" | "star"; // البدائل: السطر كله برتقالي
  lines: DarkLine[];
  specs: string[];
  total?: { label: string; note: string; value: string; old?: string };
  compareId: string;
  detailsHref: string;
}) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  const { has, toggle } = useCompare();
  const on = has(compareId);
  const big = logoAreaSize[logoSlug];
  return (
    <article
      className="relative flex flex-col overflow-hidden rounded-[20px] border border-v3-card-stroke bg-v3-card-dark bg-cover bg-center"
      style={{ backgroundImage: "url(/figma/cards/provider-card-bg.png)" }}
    >
      <Link
        href={href}
        aria-label={name}
        className={`flex h-[178px] shrink-0 justify-center overflow-hidden border-b border-v3-card-stroke bg-white ${big?.[2] === undefined ? "items-center" : "items-start"}`}
        style={{ paddingTop: big?.[2] }}
      >
        <ClientLogo
          slug={logoSlug}
          src={logo}
          alt={name}
          size={big ? [big[0], big[1]] : undefined}
        />
      </Link>
      <FavoriteButton
        label={c.favorite}
        className="absolute end-5 top-5 z-10"
      />
      <div className="flex flex-1 flex-col gap-3 px-5 pt-4 pb-5">
        {(pill || tier) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {pill && (
              <span className="inline-flex h-[31px] items-center rounded-full bg-neon-green px-3 text-[13px] leading-[25px] font-medium whitespace-nowrap text-v3-text-on-lime">
                {pill}
              </span>
            )}
            {tier && (
              <ProviderBadges locale={locale} tier={tier} certified={false} />
            )}
          </div>
        )}
        <Link
          href={href}
          className="self-start text-[20px] leading-[38px] font-bold text-white hover:underline"
        >
          {name}
        </Link>
        <p
          className={`text-[14px] leading-[18px] ${ratingTone === "star" ? "text-v3-rating-star" : "text-v3-text-meta"}`}
        >
          <span className="text-v3-rating-star">★</span>{" "}
          <span dir={locale === "ar" ? "rtl" : "ltr"}>{rating}</span>
        </p>
        <div className="flex flex-col gap-2">
          {lines.map((l) => {
            const inner = (
              <>
                <span className="flex min-w-0 items-center gap-2">
                  {l.service && (
                    <ServiceGlyph
                      name={l.service}
                      size={22}
                      className="shrink-0 text-neon-green"
                    />
                  )}
                  <span className="truncate text-[14px] leading-[18px] text-v3-text-on-dark min-[1440px]:overflow-visible">
                    {l.name}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="text-[14px] leading-[27px] font-medium text-v3-text-on-dark">
                    {l.price}
                  </span>
                  {l.oldPrice && (
                    <s className="text-[12px] leading-[15px] text-v3-text-meta">
                      {l.oldPrice}
                    </s>
                  )}
                </span>
              </>
            );
            const cls =
              "flex h-[45px] items-center justify-between gap-1 rounded-[10px] bg-v3-chip-dark px-3";
            return l.href ? (
              <Link
                key={l.key}
                href={l.href}
                className={`${cls} hover:bg-state-gray`}
              >
                {inner}
              </Link>
            ) : (
              <div key={l.key} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specs.map((s) => (
              <span
                key={s}
                className="inline-flex h-[23px] items-center rounded-full border border-v3-chip-dark px-2.5 text-[12px] leading-[15px] whitespace-nowrap text-v3-card-stroke"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {/* الإجمالي والأزرار في آخر الكارت (mt-auto) */}
        <div className="mt-auto flex flex-col gap-3">
          {total && (
            <>
              <hr className="border-v3-chip-dark" />
              <div className="flex flex-wrap items-center justify-between gap-x-2 whitespace-nowrap min-[1440px]:flex-nowrap">
                <div className="flex min-w-0 flex-col items-start">
                  <span className="text-[13px] leading-[25px] font-medium text-v3-text-on-dark">
                    {total.label}
                  </span>
                  <span className="text-[12px] leading-[15px] text-v3-text-meta">
                    {total.note}
                  </span>
                </div>
                <p className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-[22px] leading-[42px] font-bold text-neon-green">
                    {total.value}
                  </span>
                  {total.old && (
                    <s className="text-[14px] leading-[18px] text-v3-text-meta">
                      {total.old}
                    </s>
                  )}
                </p>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <Link
              href={detailsHref}
              className="flex h-[47px] min-w-0 flex-1 items-center justify-center rounded-full bg-neon-green px-4 text-[14px] leading-[27px] font-bold whitespace-nowrap text-v3-text-on-lime hover:bg-bg-brand-hover"
            >
              {t.detailsAndBook}
            </Link>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => toggle(compareId)}
              className={`flex shrink-0 items-center justify-center rounded-full px-4 text-[14px] leading-[27px] font-medium whitespace-nowrap transition-colors duration-200 ease-figma-out ${
                on
                  ? "h-[47px] bg-neon-green text-v3-text-on-lime"
                  : "h-[49px] border border-v3-card-stroke text-white hover:border-white"
              }`}
            >
              {on ? t.inCompareCheck : t.compareAdd}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// كارت نتيجة البحث (Result card): خدمة واحدة (W2-30a) أو أكتر بالإجمالي (W2-30)
export function ResultCard({
  locale,
  result: r,
  provider: p,
  multi,
}: {
  locale: Locale;
  result: SearchResult;
  provider: Provider;
  multi: boolean;
}) {
  const t = getSearchDict(locale);
  const name = resultName(locale, r, p);
  const reviews = r.reviews ? ` (${r.reviews})` : "";
  const detailsHref = routes.providerService(
    p.slug,
    r.lines[0]?.service ?? p.services[0],
  );
  return (
    <DarkResultCard
      locale={locale}
      logo={p.logo}
      logoSlug={p.slug}
      name={name}
      href={routes.provider(p.slug)}
      tier={r.tier ?? p.tier}
      pill={r.pills[0] ? tx(locale, r.pills[0], "label") : null}
      rating={`${r.rating.toFixed(1)}${reviews} · ${resultWhere(locale, r)}`}
      lines={r.lines.map((l) => ({
        key: l.service,
        name: tx(locale, l, "name"),
        service: l.service,
        price:
          l.price === null
            ? t.free
            : l.price === undefined
              ? ""
              : formatPrice(locale, l.price),
        oldPrice: l.old_price ? formatNumber(l.old_price) : undefined,
        href: routes.providerService(p.slug, l.service),
      }))}
      specs={r.specs.map((x) => tx(locale, x, "label"))}
      total={{
        label: multi ? t.totalBoth : t.priceForCar,
        note: multi ? t.totalNoteMulti : t.startsInclVat,
        value: formatPrice(locale, r.price),
        old: r.old_price ? formatNumber(r.old_price) : undefined,
      }}
      compareId={p.slug}
      detailsHref={detailsHref}
    />
  );
}
