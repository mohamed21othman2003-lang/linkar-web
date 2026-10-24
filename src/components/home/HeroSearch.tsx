"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { LOCATION_SET, openLocationModal } from "./location-events";

export type HeroSearchProps = {
  tiles: { slug: ServiceSlug; label: string }[];
  defaultSelected: ServiceSlug[];
  locationPlaceholder: string;
  carPlaceholder: string;
  carTypes: { slug: string; label: string }[];
  searchLabel: string;
  groupLabel: string;
  carLabel: string;
  locationLabel: string;
  compactLabels: boolean; // الإنجليزي: اسم الخدمة 14/22 بدل 16/26
};

// v2 · Hero service tile (1314:405) — اختيار متعدد + شريط البحث: الموقع · نوع السيارة (P-17) · ابحث
export function HeroSearch(p: HeroSearchProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ServiceSlug[]>(p.defaultSelected);
  const [car, setCar] = useState<string | null>(null);
  const [carOpen, setCarOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const carRef = useRef<HTMLDivElement>(null);

  const toggle = (s: ServiceSlug) => setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  useEffect(() => {
    const onSet = (e: Event) => setLocation((e as CustomEvent<string>).detail);
    window.addEventListener(LOCATION_SET, onSet);
    return () => window.removeEventListener(LOCATION_SET, onSet);
  }, []);

  useEffect(() => {
    if (!carOpen) return;
    const onDown = (e: MouseEvent) => carRef.current && !carRef.current.contains(e.target as Node) && setCarOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCarOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [carOpen]);

  const carName = p.carTypes.find((c) => c.slug === car)?.label;
  const field =
    "flex h-10 w-full items-center gap-2 rounded-full border border-white/22 bg-hero-ink/60 px-4 text-start text-body-s text-white/85 backdrop-blur-[2px] hover:border-white/40 lg:w-[234px]";

  return (
    <>
      <div role="group" aria-label={p.groupLabel} className="grid grid-cols-3 gap-2.5 sm:flex sm:flex-wrap sm:gap-[15px]">
        {p.tiles.map((t) => {
          const on = selected.includes(t.slug);
          return (
            <button
              key={t.slug}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(t.slug)}
              className={`relative flex h-[106px] flex-col items-center justify-center gap-2 overflow-hidden rounded-[13px] px-2 transition-colors duration-200 ease-figma-out sm:w-[132px] ${
                on ? "bg-neon-green text-deep-charcoal" : "border border-white/16 bg-hero-ink/62 text-white hover:border-white/40"
              }`}
            >
              <ServiceGlyph name={t.slug} size={44} className={on ? "text-deep-charcoal" : "text-neon-green"} />
              <span className={`whitespace-nowrap ${p.compactLabels ? "text-label-m" : "text-label-m sm:text-label-l"}`}>{t.label}</span>
              {on ? (
                <span className="absolute end-2.5 top-2.5 flex size-4 items-center justify-center rounded-xs bg-deep-charcoal text-white">
                  <Icon name="check" size={12} />
                </span>
              ) : (
                <span className="absolute end-[9px] top-[9px] size-4 rounded-xs border-[1.5px] border-white/60" />
              )}
            </button>
          );
        })}
      </div>

      <form
        className="mt-7 flex w-full flex-col gap-[9px] lg:w-[720px] lg:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(routes.search({ services: selected }));
        }}
      >
        <button type="button" onClick={openLocationModal} aria-label={p.locationLabel} className={field}>
          <span className={`truncate ${location ? "text-white" : ""}`}>{location ?? p.locationPlaceholder}</span>
          <Icon name="map-pin" size={16} className="ms-auto shrink-0 text-white" />
        </button>

        <div ref={carRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={carOpen}
            aria-label={p.carLabel}
            onClick={() => setCarOpen((v) => !v)}
            className={field}
          >
            <span className={`truncate ${carName ? "text-white" : ""}`}>{carName ?? p.carPlaceholder}</span>
            <Icon name="chevron-down" size={16} className={`ms-auto shrink-0 text-white transition-transform ${carOpen ? "rotate-180" : ""}`} />
          </button>
          {carOpen && (
            // WEB · Popup · P-17 · Field · نوع السيارة (1443:392232)
            <ul
              role="listbox"
              aria-label={p.carLabel}
              className="absolute start-0 top-full z-30 mt-2 flex w-[300px] animate-dissolve max-w-[calc(100vw-32px)] flex-col gap-0.5 rounded-lg border border-cool-gray bg-white p-2 text-deep-charcoal shadow-[0_12px_24px_#1429362e]"
            >
              {p.carTypes.map((c) => {
                const on = c.slug === car;
                return (
                  <li key={c.slug} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onClick={() => {
                        setCar(c.slug);
                        setCarOpen(false);
                      }}
                      className={`flex min-h-12 w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-start text-[16px] leading-[26px] hover:bg-tile ${
                        on ? "bg-tile font-medium" : "font-light"
                      }`}
                    >
                      {on ? <Icon name="check" size={16} className="text-nature-green" /> : <span className="size-4 shrink-0" />}
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="flex h-10 w-full items-center gap-2 rounded-full bg-neon-green px-4 text-label-m text-deep-charcoal hover:bg-bg-brand-hover lg:w-[234px]"
        >
          {p.searchLabel}
          <Icon name="search" size={18} className="ms-auto" />
        </button>
      </form>
    </>
  );
}
