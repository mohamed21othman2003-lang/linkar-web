"use client";

import { animate } from "motion";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useState, type ReactNode } from "react";

// حركات الرئيسية من الفيجما (get_motion_context على 557:2 و 600:2964) — نفس المدد والـtimes والـeasing.
// EASE_IN_AND_OUT في الفيجما = cubic-bezier(0.42, 0, 0.58, 1)
type Bezier = [number, number, number, number];
export const FIGMA_EASE_IN_OUT: Bezier = [0.42, 0, 0.58, 1];
const S: Bezier = [0.5, 0, 0.5, 1]; // منحنى «smooth» في keyframes الفيجما
const POP: Bezier = [0.45, 1.45, 0.8, 1];

// SCROLL_ANIMATE — تمرير الصفحة لعنصر (اكتشف المزيد 600ms)
export function scrollToId(id: string, duration = 0.6) {
  const el = document.getElementById(id);
  if (!el) return;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const to = el.getBoundingClientRect().top + window.scrollY - margin;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return window.scrollTo({ top: to, behavior: "instant" });
  // html عليه scroll-behavior: smooth — لازم "instant" عشان كل فريم من الحركة يتطبّق فوراً
  animate(window.scrollY, to, { duration, ease: FIGMA_EASE_IN_OUT, onUpdate: (v) => window.scrollTo({ top: v, behavior: "instant" }) });
}

// SCROLL_ANIMATE لشريط أفقي (الكاروسيل: 500ms EASE_IN_AND_OUT)
export function scrollTrack(el: HTMLElement, left: number, duration = 0.5) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollLeft = left;
    return;
  }
  // الـscroll-snap بيقفز للنقطة الجاية أول ما الحركة تبدأ — نوقفه أثناء الحركة ونرجّعه بعدها
  const snap = el.style.scrollSnapType;
  el.style.scrollSnapType = "none";
  animate(el.scrollLeft, left, {
    duration,
    ease: FIGMA_EASE_IN_OUT,
    onUpdate: (v) => (el.scrollLeft = v),
    onComplete: () => (el.style.scrollSnapType = snap),
  });
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
export function PulseTag({ index, className, children }: { index: number; className: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const t: Transition = { duration: 9, times: tagTimes[index], ease: [S, "easeOut", "easeInOut", S], repeat: Infinity };
  return (
    <motion.span className={className} animate={reduce ? undefined : { scale: [1, 1, 1.12, 1, 1] }} transition={{ scale: t }}>
      {children}
    </motion.span>
  );
}

// Phone · Home / Phone · Voucher (964:311472 / 858:313) — طفو ودوران خفيف (الصور نفسها متصدّرة مايلة،
// فبنحرّك الفرق عن الزاوية الأصلية: -13 → -11.8 = +1.2°، و13 → 11.8 = -1.2°)
export function FloatPhone({
  kind,
  className,
  children,
}: {
  kind: "home" | "voucher" | "guest-home" | "guest-voucher";
  className: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const loop9 = { duration: 9, ease: "easeInOut", repeat: Infinity } as const;
  const float = { rt: { ...loop9, times: [0, 0.5, 1] }, yt: { ...loop9, times: [0, 0.25, 0.5, 0.75, 1] } };
  // V2-02 (600:2964): الـkeyframes في الفيجما مضغوطة في آخر 0.03% من دورة 2 ثانية (times 0.9997…) — يعني الجوال
  // بيزحف ثانيتين وبعدين ينط لأوله، وده اللي كان مبيّنها زي فيديو بيعيد. بناخد نفس القيم (10.5 / 12.6 / 1.2°)
  // على إيقاع V2-01 لنفس الجوالين: طفو ناعم مستمر من غير قفزة.
  const cfg = {
    home: { r: [0, 1.2, 0], y: [0, -10, 0, -10, 0], ...float },
    voucher: { r: [0, -1.2, 0], y: [-12, 0, -12, 0, -12], ...float },
    "guest-home": { r: [0, 1.2, 0], y: [0, -10.5, 0, -10.5, 0], ...float },
    "guest-voucher": { r: [0, -1.2, 0], y: [-12.6, 0, -12.6, 0, -12.6], ...float },
  }[kind];
  return (
    <motion.div
      className={className}
      initial={{ rotate: 0, y: cfg.y[0] }}
      animate={reduce ? undefined : { rotate: cfg.r, y: cfg.y }}
      transition={{ rotate: cfg.rt, y: cfg.yt }}
    >
      {children}
    </motion.div>
  );
}

// Chip · Accepted / Gift / Tracking (557:218/222/226) — تظهر بـpop وتطفو ثم تختفي قبل نهاية الدورة
const chipTimes = {
  accepted: [0, 0.0889, 0.1333, 0.3556, 0.5778],
  tracking: [0, 0.1556, 0.2, 0.4222, 0.6444],
  gift: [0, 0.2222, 0.2667, 0.4889, 0.7111],
} as const;
export function PopChip({ kind, className, children }: { kind: keyof typeof chipTimes; className: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const [, a, b, c, d] = chipTimes[kind];
  const base = { duration: 9, repeat: Infinity } as const;
  if (reduce) return <span className={className}>{children}</span>;
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: [0, 0, 1, 1, 0, 0], scale: [0.85, 0.85, 1, 1], y: [12, 12, 0, -5, 0, 0] }}
      transition={{
        opacity: { ...base, times: [0, a, b, 0.9333, 0.9778, 1], ease: [S, "easeOut", S, "easeIn", "linear"] },
        scale: { ...base, times: [0, a, b, 1], ease: [S, POP, S] },
        y: { ...base, times: [0, a, b, c, d, 1], ease: [S, "easeOut", "easeInOut", "easeInOut", S] },
      }}
    >
      {children}
    </motion.span>
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
