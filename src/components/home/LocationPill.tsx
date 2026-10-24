"use client";

import { useEffect, useState } from "react";
import { LOCATION_SET, openLocationModal } from "./location-events";

// «قريب من: حي الروضة، جدة | تغيير» — «تغيير» بتفتح نافذة الموقع (658:2075)
export function LocationPill({ near, location, change }: { near: string; location: string; change: string }) {
  const [label, setLabel] = useState(location);
  useEffect(() => {
    const onSet = (e: Event) => setLabel((e as CustomEvent<string>).detail);
    window.addEventListener(LOCATION_SET, onSet);
    return () => window.removeEventListener(LOCATION_SET, onSet);
  }, []);
  return (
    <div className="flex h-12 max-w-full items-center gap-2.5 rounded-full border border-cool-gray bg-white px-[18px]">
      <span className="size-2.5 shrink-0 rounded-full border-[3px] border-neon-green bg-nature-green" />
      <span className="truncate text-label-l text-deep-charcoal">
        {near} {label}
      </span>
      <span className="h-4 w-px shrink-0 bg-cool-gray" />
      <button type="button" onClick={openLocationModal} className="shrink-0 text-label-m text-green-active hover:underline">
        {change}
      </button>
    </div>
  );
}
