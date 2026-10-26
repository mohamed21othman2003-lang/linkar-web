"use client";

import Link from "next/link";
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { scrollTrack } from "../motion";

// خطوة الشريط = عرض الكارت + المسافة
function stepOf(el: HTMLElement) {
  const first = el.children[0] as HTMLElement | undefined;
  return first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 326;
}
const desktop = () => window.matchMedia("(min-width: 1280px)").matches;

// Band · Packages (37:27460): فلاتر + أسهم (Controls) + شريط كروت (Carousel) + نقاط (Dots)
// ديسكتوب: الشريط معكوس ومعروض من آخره (XPEL على الطرف + آخر نقطة نشطة) زي الفيجما؛ تحت xl من أوله
export function PackagesCarousel({
  children,
  rtl,
  categories,
  allLabel,
  prevLabel,
  nextLabel,
  slideLabel,
}: {
  children: ReactNode;
  rtl: boolean;
  categories: string[];
  allLabel: string;
  prevLabel: string;
  nextLabel: string;
  slideLabel: string;
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [wide, setWide] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const max = () => el.scrollWidth - el.clientWidth;
    const onScroll = () => {
      const x = Math.abs(el.scrollLeft);
      setIndex(x >= max() - 2 ? n - 1 : Math.min(n - 1, Math.round(x / stepOf(el))));
    };
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
    const max = el.scrollWidth - el.clientWidth;
    scrollTrack(el, (rtl ? -1 : 1) * Math.min(max, Math.max(0, Math.min(n - 1, i)) * stepOf(el)));
  };
  const step = (dir: 1 | -1) => {
    touched.current = true;
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    scrollTrack(el, (rtl ? -1 : 1) * Math.max(0, Math.min(max, Math.abs(el.scrollLeft) + dir * stepOf(el))));
  };
  const chip = (on: boolean) =>
    `inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-label-m whitespace-nowrap transition-colors ${
      on ? "bg-deep-charcoal text-white" : "border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
    }`;
  const arrow =
    "flex size-11 items-center justify-center rounded-md border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong disabled:opacity-50";

  return (
    <div className="flex flex-col gap-[18px] md:gap-7 xl:gap-8">
      <div className="flex items-center justify-between gap-4">
        <div className="-me-4 flex items-center gap-2 overflow-x-auto pe-4 [scrollbar-width:none] md:-me-10 md:pe-10 xl:m-0 xl:p-0 [&::-webkit-scrollbar]:hidden">
          <span aria-current="true" className={chip(true)}>
            {allLabel}
          </span>
          {categories.map((c) => (
            <Link key={c} href={routes.packages} className={chip(false)}>
              {c}
            </Link>
          ))}
        </div>
        <div className="hidden shrink-0 gap-2 xl:flex">
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
        className="-me-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-4 [scrollbar-width:none] md:-me-10 md:pe-10 xl:m-0 xl:snap-none xl:gap-6 xl:p-0 xl:pt-4 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((card, i) => (
          <div key={i} style={{ "--o": n - 1 - i } as CSSProperties} className="w-[290px] shrink-0 snap-start md:w-[302px] xl:order-(--o)">
            {card}
          </div>
        ))}
      </div>

      <div className={`flex justify-center gap-1.5 ${wide ? "flex-row-reverse" : ""}`}>
        {items.map((_, i) => (
          <button
            key={i}
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
