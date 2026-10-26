"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

// Service slider card · Track + Dots (37:26845 / 37:26859–61) — get_motion_context: دورة 9 ثواني،
// الشريط بيتحرك 410 (= عرض الكارت = 25% من الشريط) كل 3 ثواني، والنقطة النشطة بتطول من 6 لـ20
const TIMES = [0, 0.0556, 0.1111, 0.3889, 0.4444, 0.7222, 0.7778, 1];
const S: [number, number, number, number] = [0.5, 0, 0.5, 1];
const EASE = [S, "easeInOut", S, "easeInOut", S, "easeInOut", S] as const;
const loop = { duration: 9, repeat: Infinity } as const;

export function ServiceSlides({ slides }: { slides: [string, string, string] }) {
  const reduce = useReducedMotion();
  // ترتيب الشريط في الفيجما (من الشمال): Slide 1 · loop · Slide 3 · Slide 2 · Slide 1 — وبيبدأ ظاهر منه آخر واحد
  const track = [slides[0], slides[2], slides[1], slides[0]];
  return (
    <motion.div
      aria-hidden
      dir="ltr"
      className="absolute inset-y-0 left-0 flex w-[400%]"
      initial={{ x: "-75%" }}
      animate={reduce ? undefined : { x: ["-75%", "-75%", "-50%", "-50%", "-25%", "-25%", "0%", "0%"] }}
      transition={{ x: { ...loop, times: TIMES, ease: EASE as never } }}
    >
      {track.map((src, i) => (
        <div key={i} className="relative h-full w-1/4">
          <Image src={`/figma/home/services/${src}.jpg`} alt="" fill sizes="(min-width: 1280px) 410px, (min-width: 768px) 45vw, 85vw" className="object-cover" />
        </div>
      ))}
    </motion.div>
  );
}

// Dots — النشطة ليموني 20، الباقي 6 (cool-gray/60)؛ الترتيب من الشمال: Dot 3 · Dot 2 · Dot 1
const dot = {
  d3: { w: [6, 6, 20, 20, 6, 6], t: [0, 0.3889, 0.4444, 0.7222, 0.7778, 1] },
  d2: { w: [6, 6, 20, 20, 6, 6], t: [0, 0.0556, 0.1111, 0.3889, 0.4444, 1] },
  d1: { w: [20, 20, 6, 6, 20, 20], t: [0, 0.0556, 0.1111, 0.7222, 0.7778, 1] },
};
export function ServiceDots() {
  const reduce = useReducedMotion();
  return (
    <div dir="ltr" className="absolute bottom-6 left-6 flex items-center gap-1.5" aria-hidden>
      {(["d3", "d2", "d1"] as const).map((k) => {
        const d = dot[k];
        const on = k === "d1";
        return (
          <motion.span
            key={k}
            className={`block h-1.5 rounded-[3px] ${on ? "bg-neon-green" : "bg-cool-gray/60"}`}
            initial={{ width: d.w[0] }}
            animate={reduce ? undefined : { width: d.w, backgroundColor: d.w.map((w) => (w > 6 ? "#abf907" : "rgba(217,222,219,0.6)")) }}
            transition={{ width: { ...loop, times: d.t, ease: "easeInOut" }, backgroundColor: { ...loop, times: d.t, ease: "easeInOut" } }}
          />
        );
      })}
    </div>
  );
}
