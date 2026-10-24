"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import type { CarSize, ProviderService } from "@/lib/data/provider-details";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { ServiceTile } from "./bits";
import { Modal } from "./Modal";

const MAX = 3;

function Best({ label }: { label: string }) {
  return <span className="rounded-full bg-neon-green px-2 py-0.5 text-caption text-deep-charcoal">{label}</span>;
}

// W2-22 · نافذة مقارنة · خدمات داخل مقدّم خدمة واحد (حتى 3 خدمات، والأفضل في كل بند متعلّم)
export function CompareModal({
  locale,
  open,
  onClose,
  providerName,
  shortName,
  size,
  services,
  compared,
  setCompared,
  selected,
  onToggle,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  providerName: string;
  shortName: string;
  size: CarSize;
  services: ProviderService[];
  compared: string[];
  setCompared: (ids: string[]) => void;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const [adding, setAdding] = useState(false);
  const cols = compared.map((id) => services.find((s) => s.slug === id)).filter((s): s is ProviderService => !!s);
  const candidates = services.filter((s) => !compared.includes(s.slug));
  const multi = cols.length > 1;
  const minPrice = Math.min(...cols.map((s) => s.prices[size]));
  const durations = cols.map((s) => s.duration_hours).filter((h) => h > 0);
  const minDuration = durations.length > 1 ? Math.min(...durations) : -1;
  const years = cols.map((s) => s.warranty_years ?? 0);
  const maxYears = Math.max(...years);
  const isBest = {
    price: (s: ProviderService) => multi && s.prices[size] === minPrice && cols.filter((x) => x.prices[size] === minPrice).length === 1,
    duration: (s: ProviderService) => multi && s.duration_hours === minDuration && durations.filter((h) => h === minDuration).length === 1,
    warranty: (s: ProviderService) => multi && maxYears > 0 && (s.warranty_years ?? 0) === maxYears && years.filter((y) => y === maxYears).length === 1,
  };
  const cell = "flex items-center justify-center gap-2 border-t border-cool-gray px-4 text-center";
  const label = "flex items-center border-t border-cool-gray px-4 text-label-m text-deep-charcoal";
  const sizeName = t.sizes[size];
  return (
    <Modal open={open} onClose={onClose} label={t.compareTitle(providerName)} width={1160} bare>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_12px_24px_0_#0000004d]">
        <div className="flex items-start justify-between gap-4 px-5 pt-[22px] pb-[18px] sm:px-7">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4">{t.compareTitle(providerName)}</h2>
            <p className="text-caption text-state-gray">{t.compareSub(sizeName)}</p>
          </div>
          <button type="button" aria-label={c.close} onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-md border border-cool-gray hover:border-border-strong">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="overflow-x-auto px-5 sm:px-7">
          <div className="flex min-w-max">
            {/* عمود العناوين */}
            <div className="flex w-[160px] shrink-0 flex-col bg-cool-gray/25 sm:w-[204px]">
              <div className="relative flex h-[120px] items-center px-4">
                {candidates.length > 0 && (
                  <>
                    <button
                      type="button"
                      aria-expanded={adding}
                      disabled={cols.length >= MAX}
                      title={cols.length >= MAX ? t.compareNote(shortName) : undefined}
                      onClick={() => setAdding((v) => !v)}
                      className="flex items-center disabled:cursor-not-allowed gap-1.5 rounded-[10px] border border-cool-gray bg-white px-3 py-2 text-caption text-deep-charcoal hover:border-border-strong"
                    >
                      <Icon name="plus" size={14} />
                      {t.addService}
                    </button>
                    {adding && (
                      <ul className="absolute start-4 top-[84px] z-10 flex w-[240px] flex-col rounded-md border border-cool-gray bg-white py-1 shadow-elevation-2">
                        {candidates.map((s) => (
                          <li key={s.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                setCompared([...compared, s.slug]);
                                setAdding(false);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-start text-caption text-deep-charcoal hover:bg-tile"
                            >
                              <ServiceTile name={s.icon} size={24} variant="outline" />
                              {tx(locale, s, "name")}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              <div className={`${label} h-[52px]`}>{t.rows.type}</div>
              <div className={`${label} h-[92px]`}>{t.rows.offers}</div>
              <div className={`${label} h-[52px]`}>{t.rows.price}</div>
              <div className={`${label} h-[52px]`}>{t.rows.duration}</div>
              <div className={`${label} h-[52px]`}>{t.rows.warranty}</div>
              <div className={`${label} h-[52px]`}>{t.rows.asPackage}</div>
              <div className="h-[77px]" />
            </div>
            {cols.map((s) => {
              const on = selected.includes(s.slug);
              return (
                <div key={s.slug} className={`flex w-[240px] shrink-0 flex-col sm:w-[300px] ${on ? "bg-neon-green/6" : ""}`}>
                  <div className="flex h-[120px] flex-col items-center justify-center gap-1.5">
                    <ServiceTile name={s.icon} size={48} variant="outline" />
                    <p className="text-label-l text-deep-charcoal">{tx(locale, s, "name")}</p>
                    <button
                      type="button"
                      onClick={() => setCompared(compared.filter((x) => x !== s.slug))}
                      className="flex items-center gap-1 text-caption text-state-gray hover:text-deep-charcoal"
                    >
                      <Icon name="x" size={12} />
                      {t.remove}
                    </button>
                  </div>
                  <div className={`${cell} h-[52px] text-body-m text-deep-charcoal`}>{tx(locale, s.compare, "type")}</div>
                  <div className={`${cell} h-[92px] text-body-s text-deep-charcoal`}>{tx(locale, s, "description")}</div>
                  <div className={`${cell} h-[52px]`}>
                    <span className="text-label-l text-deep-charcoal">{formatPrice(locale, s.prices[size])}</span>
                    {isBest.price(s) && <Best label={t.best} />}
                  </div>
                  <div className={`${cell} h-[52px]`}>
                    <span className="text-body-m text-deep-charcoal">{tx(locale, s, "duration") || "—"}</span>
                    {isBest.duration(s) && <Best label={t.best} />}
                  </div>
                  <div className={`${cell} h-[52px]`}>
                    <span className={`text-body-m ${s.warranty_years ? "text-deep-charcoal" : "text-state-gray"}`}>{tx(locale, s.compare, "warranty")}</span>
                    {isBest.warranty(s) && <Best label={t.best} />}
                  </div>
                  <div className={`${cell} h-[52px]`}>
                    <span className={`text-body-m ${s.compare.package ? "text-deep-charcoal" : "text-state-gray"}`}>
                      {s.compare.package ? tx(locale, s.compare.package, "label") : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center border-t border-cool-gray px-4 pt-3.5 pb-[18px]">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onToggle(s.slug)}
                      className={`flex items-center gap-1.5 rounded-md px-4 py-[11px] text-label-m ${
                        on ? "bg-neon-green text-deep-charcoal hover:bg-bg-brand-hover" : "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle"
                      }`}
                    >
                      {on ? t.addedToBooking : t.addToBooking}
                      <Icon name={on ? "check" : "plus"} size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-cool-gray/20 px-5 pt-3.5 pb-[18px] sm:px-7">
          <Icon name="info" size={16} className="shrink-0 text-state-gray" />
          <p className="text-caption text-state-gray">{t.compareNote(shortName)}</p>
        </div>
      </div>
    </Modal>
  );
}
