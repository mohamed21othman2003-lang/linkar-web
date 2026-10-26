"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Dropdown } from "@/components/search/Dropdown";
import { LOCATION_SET, openLocationModal } from "./location-events";
import { IncompleteSearchDialog, type IncompleteCopy } from "./IncompleteSearchDialog";

export type HeroSearchBarProps = {
  services: { slug: ServiceSlug; label: string }[];
  providers: { slug: string; label: string }[];
  defaultSelected: ServiceSlug[];
  location: string;
  carTypes: { slug: string; label: string }[];
  copy: {
    provider: string;
    all: string;
    services: string;
    add: string;
    location: string;
    car: string;
    carPlaceholder: string;
    search: string;
    remove: string; // «إزالة {name}»
  };
  errors: { services: string; cityCar: string; city: string; car: string };
  popup: IncompleteCopy;
};

// Search bar · unified (37:26685 / 37:28406) — مقدّم الخدمة · الخدمة أو الخدمات (شيبس + «أضف») · الموقع · نوع السيارة · «ابحث»
// الخدمة والمدينة ونوع السيارة إلزامية: «ابحث» بخانات ناقصة → الخانة بحد أحمر + سطر خطأ + نافذة P-01e (85:49277)
export function HeroSearchBar(p: HeroSearchBarProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<string | null>(null);
  const [selected, setSelected] = useState<ServiceSlug[]>(p.defaultSelected);
  const [location, setLocation] = useState<string | null>(p.location || null);
  const [car, setCar] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    const onSet = (e: Event) => setLocation((e as CustomEvent<string>).detail);
    window.addEventListener(LOCATION_SET, onSet);
    return () => window.removeEventListener(LOCATION_SET, onSet);
  }, []);

  const name = (s: ServiceSlug) => p.services.find((x) => x.slug === s)?.label ?? s;
  const remaining = p.services.filter((s) => !selected.includes(s.slug));
  const missing = { service: selected.length === 0, city: !location, car: !car };
  const err = { service: checked && missing.service, city: checked && missing.city, car: checked && missing.car };
  const fieldError = err.service ? p.errors.services : err.city && err.car ? p.errors.cityCar : err.city ? p.errors.city : err.car ? p.errors.car : null;
  const providerLabel = p.providers.find((x) => x.slug === provider)?.label ?? p.copy.all;
  const carLabel = p.carTypes.find((c) => c.slug === car)?.label;

  // خانة: ارتفاع 56 وبادينج 14، والخطأ حد أحمر داخلي
  const field = (bad: boolean) => `flex h-14 min-w-0 items-center gap-2.5 rounded-xl px-3.5 text-start ${bad ? "ring-[1.5px] ring-promotional-red ring-inset" : ""}`;
  const label = "text-caption whitespace-nowrap text-state-gray";
  const value = "truncate text-label-m";
  const divider = <span aria-hidden className="mx-3.5 h-px shrink-0 bg-cool-gray lg:mx-0 lg:h-9 lg:w-px" />;

  const submit = () => {
    if (missing.service || missing.city || missing.car) {
      setChecked(true);
      setDialog(true);
      return;
    }
    router.push(provider ? routes.provider(provider) : routes.search({ services: selected }));
  };

  return (
    <>
      <div className="flex w-full flex-col gap-1 rounded-[20px] border border-cool-gray bg-white p-2 text-deep-charcoal shadow-[0_6px_12px_#14293614] lg:h-[76px] lg:flex-row lg:items-center xl:w-[982px]">
        {/* مقدّم الخدمة */}
        <Dropdown
          label={p.copy.provider}
          className="shrink-0 lg:w-[150px]"
          value={provider}
          options={[{ key: "", label: p.copy.all }, ...p.providers.map((x) => ({ key: x.slug, label: x.label }))]}
          onChange={(k) => setProvider(k || null)}
          trigger={(open) => (
            <span className={field(false)}>
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className={label}>{p.copy.provider}</span>
                <span className={value}>{providerLabel}</span>
              </span>
              <Icon name="chevron-down" size={16} className={`shrink-0 text-state-gray transition-transform ${open ? "rotate-180" : ""}`} />
            </span>
          )}
        />
        {divider}
        {/* الخدمة أو الخدمات */}
        <div className={`${field(err.service)} lg:flex-1`}>
          <Icon name="search" size={18} className="shrink-0 text-state-gray" />
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className={label}>{p.copy.services}</span>
            <div className="flex max-w-full flex-wrap items-center gap-1.5 lg:flex-nowrap lg:overflow-hidden">
              {selected.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-label={p.copy.remove.replace("{name}", name(s))}
                  onClick={() => setSelected((cur) => cur.filter((x) => x !== s))}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neon-green px-2.5 py-[5px] text-[12px] leading-[18px] font-light whitespace-nowrap hover:bg-bg-brand-hover"
                >
                  {name(s)}
                  <Icon name="x" size={12} />
                </button>
              ))}
              {remaining.length > 0 && (
                <Dropdown
                  label={p.copy.add}
                  value={null}
                  options={remaining.map((s) => ({ key: s.slug, label: s.label }))}
                  onChange={(k) => setSelected((cur) => [...cur, k])}
                  trigger={() => (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cool-gray bg-white px-2.5 py-[5px] text-[12px] leading-[18px] font-light whitespace-nowrap hover:border-border-strong">
                      {p.copy.add}
                      <Icon name="plus" size={12} />
                    </span>
                  )}
                />
              )}
            </div>
          </div>
        </div>
        {divider}
        {/* الموقع أو الفرع — بيفتح نافذة الموقع */}
        <button type="button" onClick={openLocationModal} className={`${field(err.city)} shrink-0 lg:w-[190px]`}>
          <Icon name="map-pin" size={18} className="shrink-0 text-state-gray" />
          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className={label}>{p.copy.location}</span>
            <span className={`${value} ${location ? "" : "text-state-gray"}`}>{location ?? p.copy.location}</span>
          </span>
        </button>
        {divider}
        {/* نوع السيارة — P-17 */}
        <Dropdown
          label={p.copy.car}
          className="shrink-0 lg:w-[180px]"
          value={car}
          options={p.carTypes.map((c) => ({ key: c.slug, label: c.label }))}
          onChange={setCar}
          trigger={(open) => (
            <span className={field(err.car)}>
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className={label}>{p.copy.car}</span>
                <span className={`${value} ${carLabel ? "" : "text-state-gray"}`}>{carLabel ?? p.copy.carPlaceholder}</span>
              </span>
              <Icon name="chevron-down" size={16} className={`shrink-0 text-state-gray transition-transform ${open ? "rotate-180" : ""}`} />
            </span>
          )}
        />
        <button
          type="button"
          onClick={submit}
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-[22px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover max-lg:mt-1"
        >
          <Icon name="search" size={18} />
          {p.copy.search}
        </button>
      </div>
      {fieldError && (
        <p role="alert" className="-mt-3 text-[13px] leading-[1.9] font-medium text-hero-error">
          {fieldError}
        </p>
      )}
      {dialog && <IncompleteSearchDialog copy={p.popup} missing={missing} onClose={() => setDialog(false)} />}
    </>
  );
}
