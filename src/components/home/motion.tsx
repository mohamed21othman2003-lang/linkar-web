"use client";

import { useRef, useState, type ReactNode } from "react";
import { EASE, reducedMotion, tween, useLoop, type Bezier, type Track } from "./waapi";

// حركات الرئيسية من الفيجما (get_motion_context على 557:2 و 600:2964) — نفس المدد والـtimes والـeasing.
// بالـWeb Animations API بتاعة المتصفح (waapi.ts) مش بمكتبة motion، عشان الـJS على أول تحميل للصفحة.
// EASE_IN_AND_OUT في الفيجما = cubic-bezier(0.42, 0, 0.58, 1)
export const FIGMA_EASE_IN_OUT: Bezier = [0.42, 0, 0.58, 1];
const S = EASE.smooth; // منحنى «smooth» في keyframes الفيجما

// SCROLL_ANIMATE — تمرير الصفحة لعنصر (اكتشف المزيد 600ms)
export function scrollToId(id: string, duration = 0.6) {
  const el = document.getElementById(id);
  if (!el) return;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const to = el.getBoundingClientRect().top + window.scrollY - margin;
  if (reducedMotion()) return window.scrollTo({ top: to, behavior: "instant" });
  // html عليه scroll-behavior: smooth — لازم "instant" عشان كل فريم من الحركة يتطبّق فوراً
  tween(window.scrollY, to, duration * 1000, FIGMA_EASE_IN_OUT, (v) => window.scrollTo({ top: v, behavior: "instant" }));
}

// SCROLL_ANIMATE لشريط أفقي (الكاروسيل: 500ms EASE_IN_AND_OUT)
export function scrollTrack(el: HTMLElement, left: number, duration = 0.5) {
  if (reducedMotion()) {
    el.scrollLeft = left;
    return;
  }
  // الـscroll-snap بيقفز للنقطة الجاية أول ما الحركة تبدأ — نوقفه أثناء الحركة ونرجّعه بعدها
  const snap = el.style.scrollSnapType;
  el.style.scrollSnapType = "none";
  tween(
    el.scrollLeft,
    left,
    duration * 1000,
    FIGMA_EASE_IN_OUT,
    (v) => (el.scrollLeft = v),
    () => (el.style.scrollSnapType = snap),
  );
}

export function ScrollLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(to);
      }}
    >
      {children}
    </a>
  );
}

// Tag · قبول الطلب / موعد بديل / مراكز بديلة (557:60/62/64) — نبضة scale 1.12 داخل دورة 9 ثواني
const tagTimes = [
  [0, 0.1111, 0.1444, 0.1889, 1],
  [0, 0.3889, 0.4222, 0.4667, 1],
  [0, 0.6667, 0.7, 0.7444, 1],
];
const tagTracks = tagTimes.map((times): Track[] => [{ prop: "scale", values: [1, 1, 1.12, 1, 1], times, ease: [S, EASE.out, EASE.inOut, S] }]);
export function PulseTag({ index, className, children }: { index: number; className: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLoop(ref, tagTracks[index], 9000);
  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

// Phone · Home / Phone · Voucher (964:311472 / 858:313) — طفو ودوران خفيف (الصور نفسها متصدّرة مايلة،
// فبنحرّك الفرق عن الزاوية الأصلية: -13 → -11.8 = +1.2°، و13 → 11.8 = -1.2°) — طفو ناعم مستمر بدورة 9 ثواني
const half = [0, 0.5, 1];
const quarters = [0, 0.25, 0.5, 0.75, 1];
const float = (r: number, y: [number, number]): Track[] => [
  { prop: "rotate", values: ["0deg", `${r}deg`, "0deg"], times: half, ease: EASE.inOut },
  { prop: "translate", values: [y[0], y[1], y[0], y[1], y[0]].map((v) => `0 ${v}px`), times: quarters, ease: EASE.inOut },
];
const floatTracks = {
  home: float(1.2, [0, -10]),
  voucher: float(-1.2, [-12, 0]),
  "guest-home": float(1.2, [0, -10.5]),
  "guest-voucher": float(-1.2, [-12.6, 0]),
};
export function FloatPhone({ kind, className, children }: { kind: keyof typeof floatTracks; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLoop(ref, floatTracks[kind], 9000);
  // أول فريم (قبل ما الأنيميشن يبدأ) = قيمة البداية
  return (
    <div ref={ref} className={className} style={{ translate: floatTracks[kind][1].values[0] as string }}>
      {children}
    </div>
  );
}

// Chip · Accepted / Gift / Tracking (557:218/222/226) — تظهر بـpop وتطفو ثم تختفي قبل نهاية الدورة
const chipTimes = {
  accepted: [0, 0.0889, 0.1333, 0.3556, 0.5778],
  tracking: [0, 0.1556, 0.2, 0.4222, 0.6444],
  gift: [0, 0.2222, 0.2667, 0.4889, 0.7111],
} as const;
const chip = ([, a, b, c, d]: readonly number[]): Track[] => [
  { prop: "opacity", values: [0, 0, 1, 1, 0, 0], times: [0, a, b, 0.9333, 0.9778, 1], ease: [S, EASE.out, S, EASE.in, EASE.linear] },
  { prop: "scale", values: [0.85, 0.85, 1, 1], times: [0, a, b, 1], ease: [S, EASE.pop, S] },
  { prop: "translate", values: ["0 12px", "0 12px", "0 0", "0 -5px", "0 0", "0 0"], times: [0, a, b, c, d, 1], ease: [S, EASE.out, EASE.inOut, EASE.inOut, S] },
];
const chipTracks = { accepted: chip(chipTimes.accepted), tracking: chip(chipTimes.tracking), gift: chip(chipTimes.gift) };
export function PopChip({ kind, className, children }: { kind: keyof typeof chipTimes; className: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLoop(ref, chipTracks[kind], 9000);
  // البداية مخفية زي أول فريم؛ مع «تقليل الحركة» الأنيميشن مش بيشتغل فبتفضل ظاهرة ثابتة
  return (
    <span
      ref={ref}
      className={`${className} opacity-0 [scale:0.85] [translate:0_12px] motion-reduce:opacity-100 motion-reduce:[scale:1] motion-reduce:[translate:0]`}
    >
      {children}
    </span>
  );
}

// v2 · Toggle (860:310227): ON_CLICK → CHANGE_TO State=Off (DISSOLVE 150ms EASE_OUT)
// On = كحلي والدائرة ليموني (بداية المسار من الشمال) · Off = رمادي والدائرة بيضا (من اليمين)
export function FigmaToggle({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={`ms-auto flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ease-figma-out ${
        on ? "justify-end bg-deep-charcoal" : "justify-start bg-cool-gray"
      }`}
    >
      <span className={`size-5 rounded-full transition-colors duration-150 ease-figma-out ${on ? "bg-neon-green" : "bg-white"}`} />
    </button>
  );
}
