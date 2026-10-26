"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");
function left(endsAt: string) {
  const m = Math.floor(Math.max(0, new Date(endsAt).getTime() - Date.now()) / 60000);
  return { d: Math.floor(m / 1440), h: Math.floor((m % 1440) / 60), m: m % 60 };
}

// Countdown (37:27446) — «ينتهي خلال» + 3 مربعات غامقة: يوم · ساعة · دقيقة (من بداية السطر)
export function TileCountdown({ endsAt, label, units }: { endsAt: string; label: string; units: [string, string, string] }) {
  const [v, setV] = useState<ReturnType<typeof left> | null>(null);
  useEffect(() => {
    const tick = () => setV(left(endsAt));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [endsAt]);
  const values = [v?.d, v?.h, v?.m];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-label-m whitespace-nowrap text-deep-charcoal">
        <Icon name="clock" size={18} />
        {label}
      </span>
      {units.map((u, i) => (
        <span key={u} className="flex flex-col items-center rounded-md bg-[#0b0d0a] px-3 py-2 text-white">
          <span className="text-[18px] leading-7 font-bold" suppressHydrationWarning>
            {values[i] === undefined ? "--" : pad(values[i])}
          </span>
          <span className="text-[14px] leading-[22px] font-light">{u}</span>
        </span>
      ))}
    </div>
  );
}
