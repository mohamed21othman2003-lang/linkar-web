"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { scrollTrack } from "../motion";

export type ReviewView = { rating: string; text: string; name: string; initial: string; service: string; car: string; date: string };

const STEP = 411 + 24;

// Band · Reviews (557:286): الأسهم في رأس القسم + كروت التقييمات + النقاط
export function ReviewsCarousel({
  rtl,
  items,
  head,
  summary,
  prevLabel,
  nextLabel,
  slideLabel,
}: {
  rtl: boolean;
  items: ReviewView[];
  head: React.ReactNode;
  summary: string;
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
    const onScroll = () => setIndex(Math.min(pages - 1, Math.round(Math.abs(el.scrollLeft) / STEP)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pages]);

  const go = (i: number) => {
    const target = Math.max(0, Math.min(items.length - 1, i));
    // Next/Previous: SCROLL_ANIMATE 500ms EASE_IN_AND_OUT (776:17943 / 776:17946)
    if (track.current) scrollTrack(track.current, (rtl ? -1 : 1) * target * STEP);
  };

  return (
    <div className="flex flex-col gap-9">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        {head}
        <div className="flex items-center gap-6">
          <p className="flex h-14 items-center rounded-xl border border-cool-gray/60 bg-white px-6 text-label-m text-deep-charcoal">{summary}</p>
          <div className="hidden gap-2.5 md:flex">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => go(index - 1)}
              className="flex size-12 items-center justify-center rounded-full border border-cool-gray bg-white text-state-gray hover:border-border-strong"
            >
              <Icon name="chevron-right" size={20} flip />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => go(index + 1)}
              className="flex size-12 items-center justify-center rounded-full border border-cool-gray bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle"
            >
              <Icon name="chevron-left" size={20} flip />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r, i) => {
          const dark = i === 1;
          return (
            <article
              key={r.name}
              className={`flex w-[411px] max-w-[85vw] shrink-0 snap-start flex-col gap-4 overflow-hidden rounded-2xl lg:h-[327px] border border-v3-card-stroke p-6 ${
                dark ? "bg-deep-charcoal" : "bg-linear-to-b from-white/7 to-cool-gray/24"
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`text-[52px] leading-[78px] font-bold ${dark ? "bg-linear-to-b from-neon-green to-nature-green bg-clip-text text-transparent" : "text-green-dark"}`}>
                  ”
                </span>
                <span className={`pt-7 text-label-m ${dark ? "text-neon-green" : "text-deep-charcoal"}`}>{r.rating}</span>
              </div>
              <p className={`text-[18px] leading-[28px] font-bold ${dark ? "text-white" : "text-deep-charcoal"}`}>{r.text}</p>
              <span className={`h-px w-full ${dark ? "bg-border-subtle" : "bg-text-disabled"}`} />
              <div className="flex items-start gap-3">
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

      <div className="flex justify-center gap-2 lg:justify-start">
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${slideLabel} ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-neon-green" : "w-2 bg-cool-gray"}`}
          />
        ))}
      </div>
    </div>
  );
}
