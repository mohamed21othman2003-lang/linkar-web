"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { routes } from "@/lib/routes";
import { scrollTrack } from "../motion";
import type { Locale } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { PackageCategory } from "@/lib/data/home/home";
import { OfferCard, type OfferFeature } from "@/components/cards/OfferCard";
import { Icon } from "@/components/icons/Icon";

export type PackageView = {
  key: string;
  provider: Provider;
  discount: number;
  title: [string, string];
  features: OfferFeature[];
  price: number;
  oldPrice: number;
  href: string;
  categories: PackageCategory[];
};

// خطوة الشريط = عرض الكارت + المسافة (313+20 ديسكتوب · 313+16 تابلت · 257+12 موبايل)
function stepOf(el: HTMLElement) {
  const first = el.children[0] as HTMLElement | undefined;
  return first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 333;
}
const desktop = () => window.matchMedia("(min-width: 1280px)").matches;

// Band · Packages (85:30076): فلاتر + أسهم + شريط كروت يتحرك أفقياً + نقاط
// ديسكتوب: الشريط معكوس ومعروض من آخره (XPEL على الطرف + آخر نقطة نشطة) زي الفيجما؛
// تابلت/موبايل (85:34467/85:33788): بترتيب البيانات من البداية (XPEL أول كارت) — النقطة الأولى نشطة
export function PackagesCarousel({
  locale,
  items,
  categories,
  allLabel,
  prevLabel,
  nextLabel,
  slideLabel,
}: {
  locale: Locale;
  items: PackageView[];
  categories: { slug: PackageCategory; label: string }[];
  allLabel: string;
  prevLabel: string;
  nextLabel: string;
  slideLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const list = items;
  const n = list.length;
  const rtl = locale === "ar";

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const max = () => el.scrollWidth - el.clientWidth;
    const onScroll = () => {
      const x = Math.abs(el.scrollLeft);
      const pos = x >= max() - 2 ? n - 1 : Math.min(n - 1, Math.round(x / stepOf(el)));
      setIndex(pos);
    };
    // ديسكتوب: الفيجما بتعرض الشريط في آخره؛ أقل من كده من أوله
    const place = () => {
      setWide(desktop());
      if (touched.current) return;
      el.scrollLeft = desktop() ? (rtl ? -1 : 1) * max() : 0;
      onScroll();
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [rtl, n]);

  const go = (i: number) => {
    touched.current = true;
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(n - 1, i));
    const max = el.scrollWidth - el.clientWidth;
    scrollTrack(el, (rtl ? -1 : 1) * Math.min(max, target * stepOf(el)));
  };
  // الأسهم: كارت واحد للأمام/للخلف من المكان الحالي (SCROLL_ANIMATE 500ms)
  const step = (dir: 1 | -1) => {
    touched.current = true;
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.max(0, Math.min(max, Math.abs(el.scrollLeft) + dir * stepOf(el)));
    scrollTrack(el, (rtl ? -1 : 1) * x);
  };
  const chip = (on: boolean) =>
    `inline-flex h-[31px] shrink-0 items-center rounded-full px-3 text-[12px] font-medium transition-colors md:h-control-sm md:px-3.5 md:text-label-m ${
      on ? "bg-deep-charcoal text-white max-xl:bg-solid-black" : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
    }`;
  const arrow = "flex size-control-md items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong";

  return (
    <div className="flex flex-col gap-[18px] md:gap-7 xl:gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="-me-5 flex h-9 items-center gap-[7px] overflow-x-auto pe-5 [scrollbar-width:none] md:m-0 md:gap-2 md:p-0 [&::-webkit-scrollbar]:hidden">
          <span aria-current="true" className={chip(true)}>
            {allLabel}
          </span>
          {/* Chip (557:194) في الفيجما بيودّي لصفحة الباقات (W2-41) */}
          {categories.map((c) => (
            <Link key={c.slug} href={routes.packages} className={chip(false)}>
              {c.label}
            </Link>
          ))}
        </div>
        <div className="hidden gap-2 xl:flex">
          <button type="button" aria-label={prevLabel} className={arrow} disabled={index === 0} onClick={() => step(-1)}>
            <Icon name="chevron-right" size={20} flip />
          </button>
          <button type="button" aria-label={nextLabel} className={arrow} disabled={index >= n - 1} onClick={() => step(1)}>
            <Icon name="chevron-left" size={20} flip />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="-me-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pe-5 [scrollbar-width:none] md:-me-10 md:gap-4 md:pe-10 xl:m-0 xl:snap-none xl:gap-5 xl:p-0 xl:pt-4 [&::-webkit-scrollbar]:hidden"
      >
        {list.map((p, i) => (
          <div
            key={p.key}
            style={{ "--o": n - 1 - i } as CSSProperties}
            className="w-[257px] shrink-0 snap-start md:w-[313px] xl:order-(--o) [&>*]:max-md:w-[313px] [&>*]:max-md:[zoom:0.821]"
          >
            <OfferCard
              locale={locale}
              provider={p.provider}
              discount={p.discount}
              title={p.title}
              features={p.features}
              price={p.price}
              oldPrice={p.oldPrice}
              detailsHref={p.href}
              bookHref={p.href}
            />
          </div>
        ))}
      </div>

      <div className={`flex justify-center gap-1.5 ${wide ? "flex-row-reverse" : ""}`}>
        {list.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-label={`${slideLabel} ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-xs transition-all ${i === index ? "w-[22px] bg-deep-charcoal md:w-6" : "w-2 bg-dot xl:bg-cool-gray"}`}
          />
        ))}
      </div>
    </div>
  );
}
