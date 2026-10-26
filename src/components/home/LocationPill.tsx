"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { LOCATION_SET, openLocationModal } from "./location-events";

// «قريب من: حي الروضة، جدة | تغيير» — «تغيير» بتفتح نافذة الموقع (85:31445)
// ديسكتوب (85:29832): أبيض بحد ونقطة خضرا · تابلت/موبايل (85:34284/85:33666): رمادي فاتح بأيقونة دبوس ومن غير فاصل
export function LocationPill({ near, location, change, className = "" }: { near: string; location: string; change: string; className?: string }) {
  const [label, setLabel] = useState(location);
  useEffect(() => {
    const onSet = (e: Event) => setLabel((e as CustomEvent<string>).detail);
    window.addEventListener(LOCATION_SET, onSet);
    return () => window.removeEventListener(LOCATION_SET, onSet);
  }, []);
  return (
    <div
      className={`flex h-9 max-w-full items-center gap-2 rounded-full bg-tile px-3 md:h-[38px] md:px-3.5 xl:h-12 xl:gap-2.5 xl:border xl:border-cool-gray xl:bg-white xl:px-[18px] ${className}`}
    >
      <span className="size-2.5 shrink-0 rounded-full border-[3px] border-neon-green bg-nature-green max-xl:hidden" />
      <Icon name="map-pin" size={16} className="shrink-0 text-nature-green xl:hidden" />
      <span className="truncate text-[13px]/[20px] font-medium text-deep-charcoal xl:text-label-l">
        {near} {label}
      </span>
      <span className="h-4 w-px shrink-0 bg-cool-gray max-xl:hidden" />
      <button
        type="button"
        onClick={openLocationModal}
        className="shrink-0 text-[13px]/[20px] font-semibold text-green-active hover:underline xl:text-label-m"
      >
        {change}
      </button>
    </div>
  );
}
