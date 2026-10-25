"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

function remaining(endsAt: string) {
  const ms = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const m = Math.floor(ms / 60000);
  return { d: Math.floor(m / 1440), h: Math.floor((m % 1440) / 60), m: m % 60 };
}

function useRemaining(endsAt: string) {
  const [left, setLeft] = useState<ReturnType<typeof remaining> | null>(null);
  useEffect(() => {
    const tick = () => setLeft(remaining(endsAt));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [endsAt]);
  return left;
}

// صناديق الكارت المميّز (Box · Day/Hour/Min) — الصورة مصدّرة من الفيجما شاملة الإطار الليموني المتدرّج.
// [المفتاح، بداية الصندوق من اليمين، العرض]
const featuredBoxes: ["day" | "hour" | "min", number, number][] = [
  ["day", 156, 57],
  ["hour", 210, 66],
  ["min", 273, 72],
];

// عدّاد «ينتهي خلال»
// variant="featured": بإحداثيات الكارت المميّز 611×611 (لازم يتحط جوه عنصر relative)
export function Countdown({ locale, endsAt, variant = "inline" }: { locale: Locale; endsAt: string; variant?: "inline" | "featured" }) {
  const t = getCommon(locale);
  const left = useRemaining(endsAt);
  const values = { day: left?.d ?? 0, hour: left?.h ?? 0, min: left?.m ?? 0 };
  const labels = { day: t.day, hour: t.hour, min: t.minute };

  if (variant === "featured") {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/clock-white.svg" alt="" width={15} height={15} className="absolute start-[47.2px] top-[530.4px] size-[14.84px]" />
        <span className="absolute start-[70.5px] top-[523.1px] text-[14px] leading-normal whitespace-nowrap">{t.endsIn}</span>
        {featuredBoxes.map(([key, start, width]) => (
          <div
            key={key}
            className="absolute top-[499px] h-[78px] bg-size-[100%_100%] bg-no-repeat"
            style={{ insetInlineStart: start, width, backgroundImage: `url(/figma/cards/countdown-box-${key}@2x.png)` }}
          >
            <span className="absolute inset-x-0 top-[2.9px] text-center text-[20.38px] leading-normal font-bold" suppressHydrationWarning>
              {left ? pad(values[key]) : "--"}
            </span>
            <span className="absolute inset-x-0 top-[41.25px] text-center text-[14px] leading-normal">{labels[key]}</span>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      <span className="flex items-center gap-1.5 text-[14px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/glyphs/clock-white.svg" alt="" width={15} height={15} />
        {t.endsIn}
      </span>
      <div className="flex">
        {featuredBoxes.map(([key, , width]) => (
          <div
            key={key}
            className="flex h-[78px] flex-col items-center justify-center bg-size-[100%_100%] bg-no-repeat"
            style={{ width, backgroundImage: `url(/figma/cards/countdown-box-${key}@2x.png)` }}
          >
            <span className="text-[20px] leading-[1.4] font-bold" suppressHydrationWarning>
              {left ? pad(values[key]) : "--"}
            </span>
            <span className="text-[14px]">{labels[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
