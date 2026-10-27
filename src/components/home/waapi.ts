"use client";

import { useEffect, useState, type RefObject } from "react";

// حركات الرئيسية بالـWeb Animations API بتاعة المتصفح بدل مكتبة motion (اللي كانت ~45KB JS على الصفحة الأولى).
// نفس keyframes الفيجما: قيم + times (0..1) + easing لكل مقطع (keyframe[i].easing = منحنى المقطع من i لـi+1).

export type Bezier = [number, number, number, number];
const bez = ([a, b, c, d]: Bezier) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

// أسماء منحنيات motion → CSS
export const EASE = {
  inOut: bez([0.42, 0, 0.58, 1]), // easeInOut = EASE_IN_AND_OUT في الفيجما
  out: bez([0, 0, 0.58, 1]),
  in: bez([0.42, 0, 1, 1]),
  smooth: bez([0.5, 0, 0.5, 1]), // منحنى «smooth» في keyframes الفيجما
  pop: bez([0.45, 1.45, 0.8, 1]),
  linear: "linear",
} as const;

export type Track = {
  prop: "translate" | "rotate" | "scale" | "opacity" | "width" | "backgroundColor";
  values: (string | number)[];
  times: number[];
  ease: string | string[];
};

function keyframes({ prop, values, times, ease }: Track): Keyframe[] {
  return values.map((v, i) => ({
    [prop]: v,
    offset: times[i],
    easing: Array.isArray(ease) ? (ease[i] ?? "linear") : ease,
  }));
}

export function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// دورة لا نهائية على عنصر — كل track أنيميشن مستقل (translate/rotate/scale منفصلين فبيتجمّعوا)
export function useLoop(ref: RefObject<Element | null>, tracks: Track[], durationMs: number, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || reducedMotion()) return;
    const anims = tracks.map((t) => el.animate(keyframes(t), { duration: durationMs, iterations: Infinity }));
    return () => anims.forEach((a) => a.cancel());
    // tracks ثابتة لكل مكوّن (معرّفة برّه الرندر)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, durationMs, enabled]);
}

// true بعد ما الصفحة تخلص تحميل (load) — للحاجات اللي مش لازمة في أول رسم (صور السلايدز التانية)
export function useAfterLoad() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setTimeout(() => setReady(true), 0);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return ready;
}

// cubic-bezier → دالة easing (حلّ نيوتن ثم تنصيف) — للتمرير بـrequestAnimationFrame
function bezierFn([x1, y1, x2, y2]: Bezier) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-5) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1;
    t = x;
    while (hi - lo > 1e-5) {
      if (sx(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

// قيمة من from لـto في duration بمنحنى الفيجما (بديل animate() من motion)
export function tween(from: number, to: number, durationMs: number, ease: Bezier, onUpdate: (v: number) => void, onComplete?: () => void) {
  const f = bezierFn(ease);
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / durationMs);
    onUpdate(from + (to - from) * f(p));
    if (p < 1) requestAnimationFrame(step);
    else onComplete?.();
  };
  requestAnimationFrame(step);
}
