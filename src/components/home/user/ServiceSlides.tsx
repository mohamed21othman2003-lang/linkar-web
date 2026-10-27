"use client";

import Image from "next/image";
import { useRef } from "react";
import { EASE, useAfterLoad, useLoop, type Track } from "../waapi";

// Service slider card · Track + Dots (37:26845 / 37:26859–61) — get_motion_context: دورة 9 ثواني،
// الشريط بيتحرك 410 (= عرض الكارت = 25% من الشريط) كل 3 ثواني، والنقطة النشطة بتطول من 6 لـ20
const TIMES = [0, 0.0556, 0.1111, 0.3889, 0.4444, 0.7222, 0.7778, 1];
const S = EASE.smooth;
const trackTracks: Track[] = [
  {
    prop: "translate",
    values: ["-75%", "-75%", "-50%", "-50%", "-25%", "-25%", "0%", "0%"].map((x) => `${x} 0`),
    times: TIMES,
    ease: [S, EASE.inOut, S, EASE.inOut, S, EASE.inOut, S],
  },
];

export function ServiceSlides({ slides }: { slides: [string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null);
  // أول تحميل: الصورة الظاهرة بس (6 كروت × 3 صور = 18 صورة كانت بتنزل قبل أول رسم على الموبايل)؛
  // الباقي بعد load، والحركة تبدأ ساعتها (أول انتقال أصلاً بعد 0.5 ثانية من الدورة)
  const ready = useAfterLoad();
  useLoop(ref, trackTracks, 9000, ready);
  // ترتيب الشريط في الفيجما (من الشمال): Slide 1 · loop · Slide 3 · Slide 2 · Slide 1 — وبيبدأ ظاهر منه آخر واحد
  const track = [slides[0], slides[2], slides[1], slides[0]];
  return (
    <div ref={ref} aria-hidden dir="ltr" className="absolute inset-y-0 left-0 flex w-[400%] [translate:-75%_0]">
      {track.map((src, i) => (
        <div key={i} className="relative h-full w-1/4">
          {(ready || i === track.length - 1) && (
            <Image src={`/figma/home/services/${src}.jpg`} alt="" fill sizes="(min-width: 1280px) 410px, (min-width: 768px) 45vw, 85vw" className="object-cover" />
          )}
        </div>
      ))}
    </div>
  );
}

// Dots — النشطة ليموني 20، الباقي 6 (cool-gray/60)؛ الترتيب من الشمال: Dot 3 · Dot 2 · Dot 1
const ON = "#abf907";
const OFF = "rgba(217,222,219,0.6)";
const dot = (w: number[], t: number[]): Track[] => [
  { prop: "width", values: w.map((x) => `${x}px`), times: t, ease: EASE.inOut },
  { prop: "backgroundColor", values: w.map((x) => (x > 6 ? ON : OFF)), times: t, ease: EASE.inOut },
];
const dots = {
  d3: dot([6, 6, 20, 20, 6, 6], [0, 0.3889, 0.4444, 0.7222, 0.7778, 1]),
  d2: dot([6, 6, 20, 20, 6, 6], [0, 0.0556, 0.1111, 0.3889, 0.4444, 1]),
  d1: dot([20, 20, 6, 6, 20, 20], [0, 0.0556, 0.1111, 0.7222, 0.7778, 1]),
};

function Dot({ k }: { k: keyof typeof dots }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLoop(ref, dots[k], 9000);
  const on = k === "d1";
  return <span ref={ref} className={`block h-1.5 rounded-[3px] ${on ? "w-5 bg-neon-green" : "w-1.5 bg-cool-gray/60"}`} />;
}

export function ServiceDots() {
  return (
    <div dir="ltr" className="absolute bottom-6 left-6 flex items-center gap-1.5" aria-hidden>
      {(["d3", "d2", "d1"] as const).map((k) => (
        <Dot key={k} k={k} />
      ))}
    </div>
  );
}
