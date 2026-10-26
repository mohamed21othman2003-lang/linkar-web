"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { FigmaIcon } from "./bits";
import { LOCATION_SET, openLocationModal } from "./location-events";
import { IncompleteSearchDialog, type IncompleteCopy } from "./IncompleteSearchDialog";

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
  trust: string[];
  errors: { services: string; cityCar: string; city: string; car: string };
  popup: IncompleteCopy;
};

// v2 · Hero service tile (85:24324) — اختيار متعدد + البحث: الموقع · نوع السيارة (P-17) · ابحث
// كل الخانات إلزامية: «ابحث» بخانات ناقصة → حالة الخطأ (V2-01e 85:31792) + نافذة P-01e (85:49277)
export function HeroSearch(p: HeroSearchProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<ServiceSlug[]>(p.defaultSelected);
  const [car, setCar] = useState<string | null>(null);
  const [carOpen, setCarOpen] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  // بعد أول ضغطة «ابحث» ناقصة: الخانات الناقصة بتفضل حمرا لحد ما تتملا
  const [checked, setChecked] = useState(false);
  const [dialog, setDialog] = useState(false);
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

  const missing = { service: selected.length === 0, city: !location, car: !car };
  const err = { service: checked && missing.service, city: checked && missing.city, car: checked && missing.car };
  const fieldError = err.city && err.car ? p.errors.cityCar : err.city ? p.errors.city : err.car ? p.errors.car : null;

  const carName = p.carTypes.find((c) => c.slug === car)?.label;
  // ديسكتوب: كبسولة 40 زجاجية · تابلت/موبايل: 50–52 بزوايا 14 (V2-01t/V2-01m)
  const field = (bad: boolean) =>
    `flex h-[50px] w-full items-center gap-2.5 rounded-[14px] border bg-white/10 px-4 text-start text-[15px] leading-[24px] font-light text-white/80 hover:border-white/40 md:h-[52px] lg:h-10 lg:gap-2 lg:rounded-full lg:bg-hero-ink/60 lg:text-body-s lg:text-white/85 ${
      bad ? "border-[1.5px] border-hero-error" : "border-white/28 lg:border-white/22"
    }`;
  const errorText = "text-[13px] leading-[1.9] font-medium text-hero-error";

  return (
    <>
      <div
        role="group"
        aria-label={p.groupLabel}
        className="grid grid-cols-3 gap-x-2.5 gap-y-2 md:flex md:gap-2.5 lg:gap-3"
      >
        {p.tiles.map((t) => {
          const on = selected.includes(t.slug);
          const long = t.slug === "color-change";
          return (
            <button
              key={t.slug}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(t.slug)}
              className={`relative flex h-[89px] min-w-0 flex-1 flex-col items-center justify-center gap-[6.7px] overflow-hidden rounded-[13px] px-[7px] transition-colors duration-200 ease-figma-out md:h-[94px] md:gap-[7px] lg:h-[106px] lg:gap-2 lg:px-2 ${
                on
                  ? "bg-neon-green text-deep-charcoal"
                  : `border-[0.85px] bg-hero-ink/62 text-white lg:border ${err.service ? "border-hero-error" : "border-white/16 hover:border-white/40"}`
              }`}
            >
              <ServiceGlyph name={t.slug} size={44} className={`size-[37px] md:size-[39px] lg:size-11 ${on ? "text-deep-charcoal" : "text-neon-green"}`} />
              <span
                className={`whitespace-nowrap font-medium ${
                  p.compactLabels
                    ? "text-[12px] leading-[20px] lg:text-label-m"
                    : long
                      ? "text-[11.3px] leading-[18.4px] md:text-[12.6px] md:leading-[20.4px] lg:text-label-l"
                      : "text-[13.45px] leading-[21.9px] md:text-[14.2px] md:leading-[23px] lg:text-label-l"
                }`}
              >
                {t.label}
              </span>
              {on ? (
                <span className="absolute end-[8.4px] top-[8.4px] flex size-[13.5px] items-center justify-center rounded-xs bg-deep-charcoal text-white md:end-[8.9px] md:top-[8.9px] md:size-[14.2px] lg:end-2.5 lg:top-2.5 lg:size-4">
                  <Icon name="check" size={12} className="size-[10px] lg:size-3" />
                </span>
              ) : (
                <span className="absolute end-[7.6px] top-[7.6px] size-[13.5px] rounded-xs border-[1.3px] border-white/60 md:end-2 md:top-2 md:size-[14.2px] lg:end-[9px] lg:top-[9px] lg:size-4 lg:border-[1.5px]" />
              )}
            </button>
          );
        })}
      </div>
      {err.service && (
        <p role="alert" className={errorText}>
          {p.errors.services}
        </p>
      )}

      <form
        noValidate
        className="mt-4 flex w-full flex-col gap-2.5 md:mt-5 md:flex-row lg:mt-7 lg:gap-[9px]"
        onSubmit={(e) => {
          e.preventDefault();
          if (missing.service || missing.city || missing.car) {
            setChecked(true);
            setDialog(true);
            return;
          }
          router.push(routes.search({ services: selected }));
        }}
      >
        <button
          type="button"
          onClick={openLocationModal}
          aria-label={p.locationLabel}
          className={`${field(err.city)} md:w-[290px] md:shrink-0 lg:w-auto lg:flex-1`}
        >
          <span className={`truncate ${location ? "text-white" : ""}`}>{location ?? p.locationPlaceholder}</span>
          <Icon name="map-pin" size={18} className="ms-auto size-[18px] shrink-0 text-white lg:size-4" />
        </button>

        <div ref={carRef} className="relative md:w-[250px] md:shrink-0 lg:w-auto lg:flex-1">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={carOpen}
            aria-label={p.carLabel}
            onClick={() => setCarOpen((v) => !v)}
            className={field(err.car)}
          >
            <span className={`truncate ${carName ? "text-white" : ""}`}>{carName ?? p.carPlaceholder}</span>
            <Icon
              name="chevron-down"
              size={18}
              className={`ms-auto size-[18px] shrink-0 text-white transition-transform lg:size-4 ${carOpen ? "rotate-180" : ""}`}
            />
          </button>
          {carOpen && (
            // WEB · Popup · P-17 · Field · نوع السيارة (1443:392232)
            <ul
              role="listbox"
              aria-label={p.carLabel}
              className="absolute start-0 top-full z-30 mt-2 flex w-[300px] animate-dissolve max-w-[calc(100vw-40px)] flex-col gap-0.5 rounded-lg border border-cool-gray bg-white p-2 text-deep-charcoal shadow-[0_12px_24px_#1429362e]"
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

        {/* ديسكتوب: النص في البداية والعدسة في الآخر · تابلت/موبايل: النص والعدسة في النص */}
        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-neon-green px-4 text-[16px] leading-[24px] font-semibold text-deep-charcoal hover:bg-bg-brand-hover md:flex-1 lg:h-10 lg:justify-start lg:rounded-full lg:text-label-m"
        >
          {p.searchLabel}
          <Icon name="search" size={18} className="max-lg:order-first lg:ms-auto" />
        </button>
      </form>
      {fieldError && (
        <p role="alert" className={errorText}>
          {fieldError}
        </p>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 md:gap-x-5 lg:mt-3.5 lg:gap-x-8">
        {p.trust.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[13px] leading-[20px] font-medium text-white md:text-label-m lg:gap-2 lg:text-white/92">
            <Icon name="check" size={16} className="text-neon-green lg:hidden" />
            <FigmaIcon name="shield-check-neon" size={18} className="max-lg:hidden" />
            {item}
          </li>
        ))}
      </ul>

      {dialog && (
        <IncompleteSearchDialog
          copy={p.popup}
          missing={missing}
          onClose={() => setDialog(false)}
        />
      )}
    </>
  );
}
