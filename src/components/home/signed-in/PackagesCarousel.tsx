"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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

const STEP = 313 + 20;

// Band · Packages (557:183): فلاتر + أسهم + شريط كروت يتحرك أفقياً + نقاط
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
  const [index, setIndex] = useState(items.length - 1);
  const track = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const list = items;
  const rtl = locale === "ar";

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const max = () => el.scrollWidth - el.clientWidth;
    const onScroll = () => {
      const x = Math.abs(el.scrollLeft);
      const n = el.children.length;
      setIndex(x >= max() - 2 ? n - 1 : Math.min(n - 1, Math.round(x / STEP)));
    };
    // الفيجما بتعرض الشريط في آخره (أول باقة على الطرف + آخر نقطة نشطة)
    const toEnd = () => {
      if (!touched.current) el.scrollLeft = (rtl ? -1 : 1) * max();
    };
    toEnd();
    onScroll();
    // لو الصفحة اتعاد قياسها (resize) قبل ما المستخدم يحرّك الشريط، نرجّعه لآخره
    const ro = new ResizeObserver(toEnd);
    ro.observe(el);
    window.addEventListener("resize", toEnd);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", toEnd);
      el.removeEventListener("scroll", onScroll);
    };
  }, [rtl]);

  const go = (i: number) => {
    touched.current = true;
    const el = track.current;
    if (!el) return;
    const target = Math.max(0, Math.min(list.length - 1, i));
    const max = el.scrollWidth - el.clientWidth;
    scrollTrack(el, (rtl ? -1 : 1) * Math.min(max, target * STEP));
  };
  // الأسهم: كارت واحد للأمام/للخلف من المكان الحالي (SCROLL_ANIMATE 500ms)
  const step = (dir: 1 | -1) => {
    touched.current = true;
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = Math.max(0, Math.min(max, Math.abs(el.scrollLeft) + dir * STEP));
    scrollTrack(el, (rtl ? -1 : 1) * x);
  };
  const chip = (on: boolean) =>
    `inline-flex h-control-sm shrink-0 items-center rounded-full px-3.5 text-label-m transition-colors ${
      on ? "bg-deep-charcoal text-white" : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
    }`;
  const arrow = "flex size-control-md items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 md:pb-0">
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
        <div className="hidden gap-2 md:flex">
          <button type="button" aria-label={prevLabel} className={arrow} disabled={index === 0} onClick={() => step(-1)}>
            <Icon name="chevron-right" size={20} flip />
          </button>
          <button type="button" aria-label={nextLabel} className={arrow} disabled={index >= list.length - 1} onClick={() => step(1)}>
            <Icon name="chevron-left" size={20} flip />
          </button>
        </div>
      </div>

      <div
        ref={track}
        className="-mx-4 flex scroll-px-4 gap-5 max-md:snap-x max-md:snap-mandatory overflow-x-auto px-4 pt-4 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {list.map((p) => (
          <div key={p.key} className="w-[313px] max-w-[85vw] shrink-0 snap-start">
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

      <div className="flex flex-row-reverse justify-center gap-1.5">
        {list.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-label={`${slideLabel} ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-xs transition-all ${i === index ? "w-6 bg-deep-charcoal" : "w-2 bg-cool-gray"}`}
          />
        ))}
      </div>
    </div>
  );
}
