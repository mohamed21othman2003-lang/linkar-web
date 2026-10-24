"use client";

import type { Locale } from "@/i18n/config";
import type { MapGeometry } from "@/lib/data/search/map";

export const pos = (g: MapGeometry, x: number, y: number): React.CSSProperties => ({
  left: `${(x / g.w) * 100}%`,
  top: `${(y / g.h) * 100}%`,
});

// لوحة الخريطة المرسومة (البحر، الطرق، الحدائق، أسماء الأحياء) — الجغرافيا ثابتة في اللغتين.
// الدبابيس والكروت بتتحط فوقها كـ children بإحداثيات الفيجما (pos()).
export function MapCanvas({
  locale,
  geometry: g,
  zoom = 1,
  className = "",
  layer,
  children,
}: {
  locale: Locale;
  geometry: MapGeometry;
  zoom?: number;
  className?: string;
  layer?: React.ReactNode; // عناصر بتتكبّر مع الخريطة (الدبابيس)
  children?: React.ReactNode; // عناصر ثابتة فوق الخريطة (أزرار، كروت)
}) {
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  return (
    <div className={`relative overflow-hidden rounded-[20px] border border-cool-gray bg-map-canvas ${className}`}>
      <div dir="ltr" className="absolute inset-0 origin-center transition-transform duration-300" style={{ transform: `scale(${zoom})` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma/search/map-coast.svg"
          alt=""
          className="absolute max-w-none"
          style={{ left: pct(g.sea.x, g.w), top: pct(g.sea.y, g.h), width: pct(g.sea.w, g.w), height: pct(g.sea.h, g.h) }}
        />
        {g.rects.map((r, i) => (
          <span
            key={i}
            aria-hidden
            className={`absolute ${
              r.kind === "park" ? (g.w === 800 ? "bg-nature-green/14" : "bg-map-park") : r.kind === "block" ? "bg-map-block" : r.kind === "main" ? "border border-cool-gray bg-white" : "bg-white"
            }`}
            style={{
              left: pct(r.x, g.w),
              top: pct(r.y, g.h),
              width: pct(r.w, g.w),
              height: r.kind === "road" || r.kind === "main" ? (r.w > r.h ? r.h : pct(r.h, g.h)) : pct(r.h, g.h),
              borderRadius: r.r,
              transform: r.rot ? `rotate(${-r.rot}deg)` : undefined, // الفيجما: الموجب عكس عقارب الساعة
            }}
          />
        ))}
        {g.labels.map((l) => (
          <span
            key={l.text_en}
            className={`absolute text-caption whitespace-nowrap ${l.sea ? "origin-top-left -rotate-90 text-slate-blue" : "text-state-gray"}`}
            // النص بيتثبّت من حافته اليمنى زي الفيجما، فالإنجليزي الأطول بيمتد لليسار
            style={l.sea ? pos(g, l.x, l.y) : { ...pos(g, l.x + l.w, l.y), transform: "translateX(-100%)" }}
          >
            {locale === "en" ? l.text_en : l.text_ar}
          </span>
        ))}
        {layer}
      </div>
      {children}
    </div>
  );
}
