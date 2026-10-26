"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { scrollTrack } from "./motion";

// شريط أفقي للتابلت والموبايل (V2-01t · V2-01m: «Carousel» + «Dots») — بيطلع لحد حافة الشاشة من ناحية النهاية.
// reverse: الفيجما بتبدأ الشريط من آخر عنصر في ترتيب الديسكتوب (مثلاً ڤي كول أول كارت تحت xl).
// من xl (أو desktopFrom="none") بيبقى زي ما هو في trackClass (جريد/صف) والنقاط بتختفي.
export function Rail({
  children,
  trackClass,
  itemClass = "",
  reverse = false,
  dots,
  dotsClass = "",
  label,
}: {
  children: ReactNode;
  trackClass: string;
  itemClass?: string;
  reverse?: boolean;
  dots?: "light" | "dark";
  dotsClass?: string;
  label?: string;
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return setIndex(0);
      const x = Math.abs(el.scrollLeft);
      setIndex(x >= max - 2 ? n - 1 : Math.min(n - 1, Math.round((x / max) * (n - 1))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [n]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const rtl = getComputedStyle(el).direction === "rtl";
    scrollTrack(el, (rtl ? -1 : 1) * (n > 1 ? (max * i) / (n - 1) : 0));
  };

  return (
    <>
      <div ref={track} aria-label={label} className={`[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClass}`}>
        {items.map((child, i) => (
          <div
            key={i}
            className={`${itemClass} ${reverse ? "max-xl:order-(--o)" : ""}`}
            style={reverse ? ({ "--o": n - 1 - i } as CSSProperties) : undefined}
          >
            {child}
          </div>
        ))}
      </div>
      {dots && n > 1 && (
        <div className={`flex justify-center gap-1.5 ${dotsClass}`}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 rounded-xs transition-all duration-200 ease-figma-out ${
                i === index
                  ? `w-[22px] md:w-6 ${dots === "dark" ? "bg-neon-green" : "bg-deep-charcoal"}`
                  : `w-2 ${dots === "dark" ? "bg-white/30" : "bg-dot"}`
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
