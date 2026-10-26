"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icons/Icon";
import { scrollTrack } from "../motion";

export type ReviewView = { rating: string; text: string; name: string; initial: string; service: string; car: string; date: string };

// خطوة الشريط = عرض الكارت (بعد الـzoom) + المسافة
function stepOf(el: HTMLElement) {
  const first = el.children[0] as HTMLElement | undefined;
  return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0") : 435;
}
// تحت xl (V2-01t/V2-01m) الشريط بيبدأ بـ«فهد» ثم «نورة» (الغامق) ثم «عبدالله» — بدّل أول وتالت كارت
const mobileOrder = (i: number) => (i === 0 ? 2 : i === 2 ? 0 : i);

// Band · Reviews (85:30340 · تابلت 85:34702 · موبايل 85:34022): الأسهم في رأس القسم + كروت التقييمات + النقاط
export function ReviewsCarousel({
  rtl,
  items,
  head,
  summary,
  summaryNote,
  prevLabel,
  nextLabel,
  slideLabel,
}: {
  rtl: boolean;
  items: ReviewView[];
  head: React.ReactNode;
  summary: string;
  summaryNote?: string;
  prevLabel: string;
  nextLabel: string;
  slideLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pages = Math.max(1, items.length - 2);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.min(pages - 1, Math.round(Math.abs(el.scrollLeft) / stepOf(el))));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pages]);

  const go = (i: number) => {
    const target = Math.max(0, Math.min(items.length - 1, i));
    // Next/Previous: SCROLL_ANIMATE 500ms EASE_IN_AND_OUT (776:17943 / 776:17946)
    if (track.current) scrollTrack(track.current, (rtl ? -1 : 1) * target * stepOf(track.current));
  };

  return (
    <div className="flex flex-col gap-[18px] md:gap-7 xl:gap-9">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-6">
        {head}
        <div className="flex items-center gap-6 max-md:hidden">
          {/* Rating summary (37:27991) — سطرين: «تقييمات موثّقة…» + «بعد حجوزات مكتملة فقط» */}
          <p className="flex flex-col items-start gap-1 rounded-[20px] border border-cool-gray/60 bg-white px-6 py-4 text-[14px] leading-[22px] max-xl:hidden">
            <span className="font-medium text-deep-charcoal">{summary}</span>
            {summaryNote && <span className="font-light text-state-gray">{summaryNote}</span>}
          </p>
          <div className="flex gap-2 xl:gap-2.5">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => go(index - 1)}
              className="flex size-11 items-center justify-center rounded-full border border-cool-gray bg-white text-state-gray hover:border-border-strong xl:size-12"
            >
              <Icon name="chevron-right" size={20} flip />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => go(index + 1)}
              className="flex size-11 items-center justify-center rounded-full border border-cool-gray bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle xl:size-12"
            >
              <Icon name="chevron-left" size={20} flip />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className="-me-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pe-5 [scrollbar-width:none] md:-me-10 md:gap-4 md:pe-10 xl:m-0 xl:gap-6 xl:p-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r, i) => {
          const dark = i === 1;
          return (
            // تابلت 370×294 / موبايل 329×262 = نفس الكارت (411×327) بـzoom 0.9 / 0.8
            <article
              key={r.name}
              style={{ "--o": mobileOrder(i) } as CSSProperties}
              className={`flex h-[327px] w-[411px] shrink-0 snap-start flex-col gap-4 overflow-hidden rounded-2xl border border-v3-card-stroke p-6 max-xl:order-(--o) max-md:[zoom:0.8] md:max-xl:[zoom:0.9] ${
                dark ? "bg-deep-charcoal max-xl:bg-hero-ink" : "bg-linear-to-b from-white/7 to-cool-gray/24"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[52px] leading-[78px] font-bold ${dark ? "bg-linear-to-b from-neon-green to-nature-green bg-clip-text text-transparent" : "text-green-dark"}`}>
                  ”
                </span>
                <span className={`pt-7 text-label-m ${dark ? "text-neon-green" : "text-deep-charcoal"}`}>{r.rating}</span>
              </div>
              <p className={`text-[18px] leading-[28px] font-bold ${dark ? "text-white" : "text-deep-charcoal"}`}>{r.text}</p>
              <span className="h-px w-full shrink-0 bg-[#b6bcb9]" />
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-label-m text-green-dark">{r.initial}</span>
                <div className="flex flex-col gap-0.5 text-[14px] leading-[22px]">
                  <span className={`font-medium ${dark ? "text-white" : "text-deep-charcoal"}`}>{r.name}</span>
                  <span className={`font-light ${dark ? "text-white" : "text-v3-text-meta"}`}>{r.service}</span>
                  <span className={`font-light ${dark ? "text-white" : "text-text-tertiary"}`}>{r.car}</span>
                </div>
                <span className={`ms-auto text-caption ${dark ? "text-white" : "text-text-tertiary"}`}>{r.date}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex justify-center gap-1.5 xl:justify-start xl:gap-2">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${slideLabel} ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-xs transition-all xl:rounded-full ${i === index ? "w-[22px] bg-deep-charcoal md:w-6 xl:w-7 xl:bg-neon-green" : "w-2 bg-dot xl:bg-cool-gray"}`}
          />
        ))}
      </div>
    </div>
  );
}
