"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import type { filterGroups as FilterGroupsData } from "@/lib/data/search/options";
import { formatPrice } from "@/lib/format";
import { ChoiceChip } from "./Pill";
import { CloseCircle, Modal } from "./Modal";

export type Filters = {
  priceMin: number;
  priceMax: number | null; // null = بلا حد أعلى
  rating: number;
  warranty: number;
  duration: number;
  hasOffer: boolean;
  hasPackage: boolean;
  distance: number;
};

export const emptyFilters = (min: number): Filters => ({
  priceMin: min,
  priceMax: null,
  rating: 0,
  warranty: 0,
  duration: 0,
  hasOffer: false,
  hasPackage: false,
  distance: 0,
});

export const activeCount = (f: Filters, min: number) =>
  [f.priceMin > min, f.priceMax !== null, f.rating, f.warranty, f.duration, f.hasOffer, f.hasPackage, f.distance].filter(Boolean).length;

type Groups = typeof FilterGroupsData;

// P-12 · كل الفلاتر (835:21)
export function FiltersModal({
  locale,
  open,
  groups,
  value,
  bounds,
  onClose,
  onApply,
  onClear,
}: {
  locale: Locale;
  open: boolean;
  groups: Groups;
  value: Filters;
  bounds: [number, number];
  onClose: () => void;
  onApply: (f: Filters) => void;
  onClear: () => void;
}) {
  const c = getCommon(locale);
  const [draft, setDraft] = useState(value);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(value);
  }
  const set = (patch: Partial<Filters>) => setDraft((d) => ({ ...d, ...patch }));
  const [lo, hi] = bounds;
  const maxVal = draft.priceMax ?? hi;
  const pct = (v: number) => (hi === lo ? 0 : ((v - lo) / (hi - lo)) * 100);
  const L = (o: { label_ar: string; label_en: string }) => tx(locale, o, "label");

  const group = (title: string, body: React.ReactNode) => (
    <div className="flex flex-col gap-2.5">
      <p className="text-label-l text-deep-charcoal">{title}</p>
      {body}
    </div>
  );
  const chips = <V extends number>(options: { value: V; label_ar: string; label_en: string }[], current: number, key: keyof Filters) => (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <ChoiceChip key={o.value} active={current === o.value} onClick={() => set({ [key]: o.value } as Partial<Filters>)}>
          {L(o)}
        </ChoiceChip>
      ))}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} label={L(groups.title)} className="flex max-w-[480px] flex-col gap-4 rounded-2xl px-5 pt-[26px] pb-7 sm:px-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h4 text-deep-charcoal">{L(groups.title)}</h2>
        <CloseCircle label={c.close} onClick={onClose} />
      </div>

      {group(
        L(groups.price),
        <>
          <div className="relative h-6" dir="ltr">
            <div className="absolute inset-x-0 top-2.5 h-1 rounded-[2px] bg-cool-gray" />
            <div
              className="absolute top-2.5 h-1 rounded-[2px] bg-neon-green"
              style={{ left: `${pct(draft.priceMin)}%`, right: `${100 - pct(maxVal)}%` }}
            />
            <input
              type="range"
              aria-label={L(groups.price)}
              min={lo}
              max={hi}
              step={1}
              value={draft.priceMin}
              onChange={(e) => set({ priceMin: Math.min(Number(e.target.value), maxVal) })}
              className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
            />
            <input
              type="range"
              aria-label={L(groups.noMax)}
              min={lo}
              max={hi}
              step={1}
              value={maxVal}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), draft.priceMin);
                set({ priceMax: v >= hi ? null : v });
              }}
              className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
            />
          </div>
          <div className="flex justify-between text-caption text-state-gray">
            <span>{`${getSearchDict(locale).from} ${formatPrice(locale, draft.priceMin)}`}</span>
            <span>{draft.priceMax === null ? L(groups.noMax) : formatPrice(locale, draft.priceMax)}</span>
          </div>
        </>,
      )}
      {group(L(groups.rating), chips(groups.rating.options, draft.rating, "rating"))}
      {group(L(groups.warranty), chips(groups.warranty.options, draft.warranty, "warranty"))}
      {group(L(groups.duration), chips(groups.duration.options, draft.duration, "duration"))}
      {group(
        L(groups.offers),
        <div className="flex flex-wrap gap-2">
          <ChoiceChip active={draft.hasOffer} onClick={() => set({ hasOffer: !draft.hasOffer })}>
            {L(groups.offers.hasOffer)}
          </ChoiceChip>
          <ChoiceChip active={draft.hasPackage} onClick={() => set({ hasPackage: !draft.hasPackage })}>
            {L(groups.offers.hasPackage)}
          </ChoiceChip>
        </div>,
      )}
      {group(L(groups.distance), chips(groups.distance.options, draft.distance, "distance"))}

      <div className="flex gap-2.5 pt-1.5">
        <button type="button" onClick={onClear} className="h-[52px] flex-1 rounded-[14px] border border-cool-gray bg-white text-label-l text-deep-charcoal hover:border-border-strong">
          {L(groups.clearAll)}
        </button>
        <button type="button" onClick={() => onApply(draft)} className="h-[52px] flex-1 rounded-[14px] bg-neon-green text-label-l text-deep-charcoal hover:bg-bg-brand-hover">
          {L(groups.apply)}
        </button>
      </div>
    </Modal>
  );
}
