"use client";

import { useEffect, useRef, useState } from "react";

// يقرا القيمة الفعلية من الـCSS (مش من نسخة مكتوبة هنا) عشان الصفحة تفضل مطابقة لـglobals.css
function toHex(rgb: string): string {
  const m = rgb.match(/[\d.]+/g);
  if (!m) return rgb;
  const [r, g, b, a] = m.map(Number);
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}${a !== undefined && a < 1 ? h(a * 255) : ""}`;
}

export default function Swatch({ token }: { token: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (ref.current) setValue(toHex(getComputedStyle(ref.current).backgroundColor));
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div
        ref={ref}
        className="size-control-md shrink-0 rounded-md border border-border-subtle"
        style={{ backgroundColor: `var(--color-${token})` }}
      />
      <div className="min-w-0">
        <div className="text-label-m truncate" dir="ltr">{token}</div>
        <div className="text-caption text-text-secondary" dir="ltr">{value}</div>
      </div>
    </div>
  );
}
