"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getSearchDict } from "@/i18n/dict/search";
import type { Service, ServiceSlug } from "@/lib/data/types";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Dropdown } from "./Dropdown";

export type CarSize = { key: string; label_ar: string; label_en: string };

// Search bar · unified (767:15558): الخدمات (شيبس + «أضف») · الموقع · نوع السيارة (P-17) · «ابحث»
export function SearchBar({
  locale,
  services,
  selected: initial,
  carSizes,
  location,
  view,
  onSearch,
  className = "",
}: {
  locale: Locale;
  services: Service[];
  selected: ServiceSlug[];
  carSizes: CarSize[];
  location: string;
  view?: "map";
  onSearch?: () => void;
  className?: string;
}) {
  const t = getSearchDict(locale);
  const router = useRouter();
  const [selected, setSelected] = useState<ServiceSlug[]>(initial);
  const [car, setCar] = useState<string | null>(null);
  const name = (s: ServiceSlug) => tx(locale, services.find((x) => x.slug === s)!, "name");
  const remaining = services.filter((s) => !selected.includes(s.slug));
  const carLabel = car ? tx(locale, carSizes.find((c) => c.key === car)!, "label") : t.carPlaceholder;
  const go = () => {
    onSearch?.();
    router.push(routes.search({ services: selected, view }));
  };
  const req = <span className="text-required-mark"> *</span>;

  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border border-cool-gray bg-white p-2 shadow-[0_6px_12px_rgba(20,41,54,0.08)] lg:h-[76px] lg:flex-row lg:items-center ${className}`}
    >
      {/* الخدمة أو الخدمات */}
      <div className="flex min-h-14 min-w-0 flex-1 items-center gap-2.5 px-3.5">
        <Icon name="grid" size={18} className="shrink-0 text-state-gray" />
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="text-caption text-state-gray">
            {t.servicesLabel}
            {req}
          </span>
          <div className="flex max-w-full flex-wrap items-center gap-1.5 py-0.5">
            {selected.map((s) => (
              <button
                key={s}
                type="button"
                aria-label={t.removeService(name(s))}
                onClick={() => setSelected((cur) => cur.filter((x) => x !== s))}
                className="inline-flex items-center gap-1 rounded-full bg-neon-green px-2.5 py-[5px] text-[12px] leading-[18px] font-light text-deep-charcoal hover:bg-bg-brand-hover"
              >
                {name(s)}
                <Icon name="x" size={12} />
              </button>
            ))}
            {remaining.length > 0 && (
              <Dropdown
                label={t.add}
                value={null}
                options={remaining.map((s) => ({ key: s.slug, label: tx(locale, s, "name") }))}
                onChange={(k) => setSelected((cur) => [...cur, k])}
                trigger={() => (
                  <span className="inline-flex items-center gap-1 rounded-full border border-cool-gray bg-white px-2.5 py-[5px] text-[12px] leading-[18px] font-light text-deep-charcoal hover:border-border-strong">
                    {t.add}
                    <Icon name="plus" size={12} />
                  </span>
                )}
              />
            )}
          </div>
        </div>
        <Icon name="chevron-down" size={16} className="shrink-0 text-state-gray" />
      </div>

      <span className="mx-3.5 h-px bg-cool-gray lg:mx-0 lg:h-9 lg:w-px" aria-hidden />

      {/* الموقع أو الفرع */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-3.5 lg:w-[190px]">
        <Icon name="map-pin" size={18} className="shrink-0 text-state-gray" />
        <div className="flex min-w-0 flex-col items-start whitespace-nowrap">
          <span className="text-caption text-state-gray">
            {t.locationLabel}
            {req}
          </span>
          <span className="text-label-m text-deep-charcoal">{location}</span>
        </div>
      </div>

      <span className="mx-3.5 h-px bg-cool-gray lg:mx-0 lg:h-9 lg:w-px" aria-hidden />

      {/* نوع السيارة — P-17 */}
      <Dropdown
        label={t.carLabel}
        className="shrink-0 lg:w-[180px]"
        align="start"
        value={car}
        options={carSizes.map((c) => ({ key: c.key, label: tx(locale, c, "label") }))}
        onChange={setCar}
        trigger={(open) => (
          <span className="flex h-14 w-full items-center justify-between gap-2.5 px-3.5 text-start">
            <span className="flex min-w-0 flex-col items-start whitespace-nowrap">
              <span className="text-caption text-state-gray">
                {t.carLabel}
                {req}
              </span>
              <span className={`text-label-m ${car ? "text-deep-charcoal" : "text-state-gray"}`}>{carLabel}</span>
            </span>
            <Icon name="chevron-down" size={16} className={`shrink-0 text-state-gray transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        )}
      />

      <button
        type="button"
        onClick={go}
        className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-[22px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
      >
        <Icon name="search" size={18} />
        {t.search}
      </button>
    </div>
  );
}
