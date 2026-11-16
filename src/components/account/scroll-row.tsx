"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

// صف تبويبات بيتسحب أفقياً (موبايل): مسافة في آخره عشان آخر تبويب مايتقصّش على الحافة، وتلاشي ناعم
// على الحافة اللي وراها تبويبات لسه، والتبويب النشط (aria-current / aria-selected) بيتحرّك لوسط الصف لوحده.
export function ScrollRow({ watch, className = "", style, children, ...rest }: HTMLAttributes<HTMLDivElement> & { watch?: unknown; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ start: false, end: false, rtl: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      // في RTL الـscrollLeft بالسالب (0 ← −max)
      const pos = Math.abs(el.scrollLeft);
      const next = { start: pos > 2, end: max - pos > 2, rtl: getComputedStyle(el).direction === "rtl" };
      setFade((f) => (f.start === next.start && f.end === next.end && f.rtl === next.rtl ? f : next));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    const on = el?.querySelector<HTMLElement>('[aria-current="page"],[aria-selected="true"]');
    if (!el || !on || el.scrollWidth <= el.clientWidth) return;
    const a = on.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: "instant" });
  }, [watch]);

  // التلاشي على الحافة اللي فيها تبويبات مخفية بس (البداية يمين في العربي)
  const edge = 28;
  const left = fade.rtl ? fade.end : fade.start;
  const right = fade.rtl ? fade.start : fade.end;
  const mask = left || right ? `linear-gradient(to right, ${left ? "transparent" : "#000"} 0, #000 ${left ? edge : 0}px, #000 calc(100% - ${right ? edge : 0}px), ${right ? "transparent" : "#000"} 100%)` : undefined;

  return (
    <div
      ref={ref}
      {...rest}
      style={{ ...style, maskImage: mask, WebkitMaskImage: mask }}
      className={`overflow-x-auto [scrollbar-width:none] after:w-3 after:shrink-0 after:content-[''] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}
