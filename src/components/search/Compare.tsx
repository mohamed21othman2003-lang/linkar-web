"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { LogoTile } from "./LogoTile";
import { CloseCircle, Modal } from "./Modal";
import { useToast } from "./Toast";

export const COMPARE_MAX = 3;

export type CompareItem = {
  key: string;
  name: string;
  logo: string;
  service: string;
  price: number;
  durationHours: number; // 0 = غير معروف
  duration: string;
  warrantyYears: number;
  warranty: string;
  rating: number;
  reviews: number | null;
  distanceKm: number;
  branch: string | null;
  offer: string | null;
  offerBest: boolean;
  href: string;
};

type L = { label_ar: string; label_en: string };
export type CompareCopy = { max: { title: L; body: L; open: L; ok: L }; added: L };

type Ctx = {
  keys: string[];
  has: (key: string) => boolean;
  toggle: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  openCompare: () => void;
  items: Record<string, CompareItem>;
};

const CompareContext = createContext<Ctx | null>(null);
export function useCompare() {
  const c = useContext(CompareContext);
  if (!c) throw new Error("useCompare outside CompareProvider");
  return c;
}

// حالة المقارنة (حتى 3 مقدّمي خدمة) + نافذة المقارنة W2-31 + نافذة الحد الأقصى P-13 + رسالة P-10c
export function CompareProvider({
  locale,
  items,
  initial,
  serviceName,
  highlight,
  copy,
  children,
}: {
  locale: Locale;
  items: Record<string, CompareItem>;
  initial: string[];
  serviceName: string;
  highlight: string | null;
  copy: CompareCopy;
  children: React.ReactNode;
}) {
  const toast = useToast();
  const [keys, setKeys] = useState<string[]>(initial.filter((k) => items[k]));
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const addedToast = useCallback(
    (n: number) =>
      toast(tx(locale, copy.added, "label").replace("{n}", String(n)), {
        label: getSearchDict(locale).compareNow,
        onClick: () => setOpen(true),
      }),
    [toast, locale, copy.added],
  );

  const toggle = useCallback(
    (key: string) => {
      if (keys.includes(key)) {
        setKeys(keys.filter((k) => k !== key));
        return;
      }
      if (keys.length >= COMPARE_MAX) {
        setPending(key);
        return;
      }
      setKeys([...keys, key]);
      addedToast(keys.length + 1);
    },
    [keys, addedToast],
  );

  const value = useMemo<Ctx>(
    () => ({
      keys,
      has: (k) => keys.includes(k),
      toggle,
      remove: (k) => setKeys((cur) => cur.filter((x) => x !== k)),
      clear: () => setKeys([]),
      openCompare: () => setOpen(true),
      items,
    }),
    [keys, toggle, items],
  );

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareModal
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        list={keys.map((k) => items[k]).filter(Boolean)}
        serviceName={serviceName}
        highlight={highlight}
        onRemove={(k) => setKeys((cur) => cur.filter((x) => x !== k))}
      />
      <CompareMaxModal
        locale={locale}
        copy={copy.max}
        pending={pending ? items[pending] : null}
        list={keys.map((k) => items[k]).filter(Boolean)}
        onClose={() => setPending(null)}
        onOpenCompare={() => {
          setPending(null);
          setOpen(true);
        }}
        onReplace={(k) => {
          const next = [...keys.filter((x) => x !== k), pending!];
          setKeys(next);
          setPending(null);
          addedToast(next.length);
        }}
      />
    </CompareContext.Provider>
  );
}

// زر «قارن» / «في المقارنة» على الكروت
export function CompareButton({
  locale,
  id,
  variant = "card",
  className = "",
}: {
  locale: Locale;
  id: string;
  variant?: "card" | "chip" | "outline";
  className?: string;
}) {
  const t = getSearchDict(locale);
  const { has, toggle } = useCompare();
  const on = has(id);
  if (variant === "chip") {
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => toggle(id)}
        className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-2.5 text-caption ${
          on ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
        } ${className}`}
      >
        <Icon name={on ? "check" : "plus"} size={12} />
        {on ? t.inCompare : t.compare}
      </button>
    );
  }
  if (variant === "outline") {
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => toggle(id)}
        className={`inline-flex h-10 shrink-0 items-center gap-1 rounded-[10px] border px-3 text-label-m ${
          on ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
        } ${className}`}
      >
        {on ? t.inCompare : t.compare}
        <Icon name={on ? "check" : "plus"} size={14} />
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggle(id)}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md px-3.5 text-label-m transition-colors duration-200 ease-figma-out ${
        on ? "h-[42px] bg-deep-charcoal text-neon-green" : "h-11 border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong"
      } ${className}`}
    >
      <Icon name={on ? "check" : "plus"} size={14} />
      {on ? t.inCompare : t.compare}
    </button>
  );
}

// شريط المقارنة (Compare tray) — يظهر لما يكون فيه اختيار واحد أو أكثر
export function CompareTray({ locale, label, className = "" }: { locale: Locale; label: string; className?: string }) {
  const t = getSearchDict(locale);
  const { keys, items, clear, openCompare } = useCompare();
  if (!keys.length) return null;
  const empty = COMPARE_MAX - keys.length;
  return (
    <div
      className={`flex max-w-[calc(100vw-32px)] animate-dissolve flex-wrap items-center gap-x-4 gap-y-2 rounded-[28px] bg-deep-charcoal py-2.5 ps-[22px] pe-2.5 shadow-[0_12px_24px_rgba(13,26,33,0.3)] sm:flex-nowrap sm:rounded-full ${className}`}
    >
      <div className="flex min-w-0 flex-col items-start">
        <p className="text-label-l whitespace-nowrap text-white">{t.selectedForCompare(keys.length)}</p>
        <p className="text-caption whitespace-nowrap text-white/65">
          {label} · {t.upTo3}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {[...keys].reverse().map((k) => (
          <LogoTile key={k} src={items[k].logo} alt={items[k].name} size={36} radius={18} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={i} aria-label={t.emptySlot} className="flex size-9 items-center justify-center rounded-[10px] border border-dashed border-white/35 text-white">
            <Icon name="plus" size={14} />
          </span>
        ))}
      </div>
      <button type="button" onClick={clear} className="text-label-m text-white/70 hover:text-white">
        {t.clear}
      </button>
      <button
        type="button"
        onClick={openCompare}
        className="ms-auto flex h-12 items-center gap-1.5 rounded-full bg-neon-green px-5 text-label-l whitespace-nowrap text-deep-charcoal hover:bg-bg-brand-hover"
      >
        {t.compareNow}
        <Icon name="chevron-left" size={16} flip />
      </button>
    </div>
  );
}

// W2-31 · نافذة مقارنة · نفس الخدمة عند مزودين (709:3771)
function CompareModal({
  locale,
  open,
  onClose,
  list,
  serviceName,
  highlight,
  onRemove,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  list: CompareItem[];
  serviceName: string;
  highlight: string | null;
  onRemove: (key: string) => void;
}) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  const many = list.length > 1;
  const best = <T,>(get: (i: CompareItem) => T | null, pickBest: (vals: T[]) => T) => {
    const vals = list.map(get).filter((v): v is T => v !== null);
    if (!many || vals.length < 2) return () => false;
    const b = pickBest(vals);
    if (vals.every((v) => v === b)) return () => false;
    return (i: CompareItem) => get(i) === b;
  };
  const bestPrice = best((i) => i.price, (v) => Math.min(...v));
  const bestDuration = best((i) => (i.durationHours > 0 ? i.durationHours : null), (v) => Math.min(...v));
  const bestWarranty = best((i) => (i.warrantyYears > 0 ? i.warrantyYears : null), (v) => Math.max(...v));
  const bestRating = best((i) => i.rating, (v) => Math.max(...v));
  const bestDistance = best((i) => i.distanceKm, (v) => Math.min(...v));
  const km = (i: CompareItem) => `${i.distanceKm.toFixed(1)} ${c.km}${i.branch ? ` · ${i.branch}` : ""}`;
  const rating = (i: CompareItem) => `${i.rating.toFixed(1)}${i.reviews ? ` (${i.reviews})` : ""}`;
  const rows: { label: string; value: (i: CompareItem) => string; isBest: (i: CompareItem) => boolean }[] = [
    { label: t.rowService, value: (i) => i.service, isBest: () => false },
    { label: t.rowPrice, value: (i) => formatPrice(locale, i.price), isBest: bestPrice },
    { label: t.rowDuration, value: (i) => i.duration, isBest: bestDuration },
    { label: t.rowWarranty, value: (i) => i.warranty, isBest: bestWarranty },
    { label: t.rowRating, value: rating, isBest: bestRating },
    { label: t.rowDistance, value: km, isBest: bestDistance },
    { label: t.rowOffers, value: (i) => i.offer ?? "—", isBest: (i) => many && i.offerBest },
  ];
  return (
    <Modal open={open} onClose={onClose} label={t.compareTitle(serviceName)} className="max-w-[1160px] overflow-hidden rounded-[28px]">
      <div className="flex items-start justify-between gap-4 px-5 pt-[22px] pb-[18px] sm:px-7">
        <div className="flex flex-col gap-1">
          <h2 className="text-h4 text-deep-charcoal">{t.compareTitle(serviceName)}</h2>
          <p className="text-caption text-state-gray">{t.compareSub}</p>
        </div>
        <button type="button" aria-label={c.close} onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-md border border-cool-gray text-deep-charcoal hover:bg-tile">
          <Icon name="x" size={20} />
        </button>
      </div>
      <div className="overflow-x-auto px-5 sm:px-7">
        <div className="flex min-w-max">
          {/* عمود العناوين */}
          <div className="flex w-[160px] shrink-0 flex-col bg-cool-gray/25 sm:w-[204px]">
            <div className="flex h-[120px] items-center px-4">
              <button type="button" onClick={onClose} className="flex h-10 items-center gap-1.5 rounded-[10px] border border-cool-gray bg-white px-3 text-caption text-deep-charcoal hover:border-border-strong">
                <Icon name="plus" size={14} />
                {t.addProvider}
              </button>
            </div>
            {rows.map((r) => (
              <div key={r.label} className="flex h-[52px] items-center border-t border-cool-gray px-4 text-label-m text-state-gray">
                {r.label}
              </div>
            ))}
            <div className="h-[77px]" />
          </div>
          {list.map((i) => {
            const hi = i.key === highlight;
            return (
              <div key={i.key} className={`flex w-[240px] shrink-0 flex-col sm:w-[300px] ${hi ? "bg-neon-green/6" : ""}`}>
                <div className="flex h-[120px] flex-col items-center justify-center gap-1.5">
                  <LogoTile src={i.logo} alt={i.name} size={48} />
                  <p className="text-label-l text-deep-charcoal">{i.name}</p>
                  <button type="button" onClick={() => onRemove(i.key)} className="flex items-center gap-1 text-caption text-state-gray hover:text-deep-charcoal">
                    <Icon name="x" size={12} />
                    {t.remove}
                  </button>
                </div>
                {rows.map((r) => {
                  const b = r.isBest(i);
                  return (
                    <div key={r.label} className="flex h-[52px] items-center justify-center gap-2 border-t border-cool-gray px-4 text-center">
                      <span className={`text-deep-charcoal ${b ? "text-label-l" : "text-body-m"}`}>{r.value(i)}</span>
                      {b && <span className="rounded-full bg-neon-green px-2 py-0.5 text-caption text-deep-charcoal">{t.best}</span>}
                    </div>
                  );
                })}
                <div className="flex h-[77px] items-start justify-center border-t border-cool-gray px-4 pt-3.5">
                  <Link
                    href={i.href}
                    className={`flex h-11 items-center gap-1.5 rounded-md px-4 text-label-m ${
                      hi ? "bg-neon-green text-deep-charcoal hover:bg-bg-brand-hover" : "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle"
                    }`}
                  >
                    {t.detailsAndBook}
                    <Icon name="chevron-left" size={16} flip />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-cool-gray/20 px-5 pt-3.5 pb-[18px] sm:px-7">
        <Icon name="info" size={16} className="shrink-0 text-state-gray" />
        <p className="text-caption text-state-gray">{t.compareNote}</p>
      </div>
    </Modal>
  );
}

// P-13 · وصلت للحد الأقصى للمقارنة (835:91)
function CompareMaxModal({
  locale,
  copy,
  pending,
  list,
  onClose,
  onOpenCompare,
  onReplace,
}: {
  locale: Locale;
  copy: CompareCopy["max"];
  pending: CompareItem | null;
  list: CompareItem[];
  onClose: () => void;
  onOpenCompare: () => void;
  onReplace: (key: string) => void;
}) {
  const t = getSearchDict(locale);
  const c = getCommon(locale);
  return (
    <Modal open={!!pending} onClose={onClose} label={tx(locale, copy.title, "label")} className="flex max-w-[480px] flex-col gap-4 rounded-2xl px-7 pt-[26px] pb-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col items-start gap-2.5">
          <span className="flex size-[42px] items-center justify-center rounded-[14px] bg-neon-green/18 text-deep-charcoal">
            <Icon name="info" size={22} />
          </span>
          <h2 className="text-h4 text-deep-charcoal">{tx(locale, copy.title, "label")}</h2>
        </div>
        <CloseCircle label={c.close} onClick={onClose} />
      </div>
      <p className="text-caption leading-6 text-state-gray">{tx(locale, copy.body, "label").replace("{name}", pending?.name ?? "")}</p>
      <ul className="flex flex-col gap-2">
        {list.map((i) => (
          <li key={i.key} className="flex items-center justify-between gap-2.5 rounded-md border border-cool-gray px-3 py-2">
            <span className="flex items-center gap-2.5">
              <LogoTile src={i.logo} alt={i.name} size={32} />
              <span className="text-label-l text-deep-charcoal">{i.name}</span>
            </span>
            <button type="button" onClick={() => onReplace(i.key)} className="flex items-center gap-1 text-label-m text-state-gray hover:text-deep-charcoal">
              <Icon name="x" size={12} />
              {t.remove}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2.5 pt-1.5">
        <button type="button" onClick={onClose} className="h-[52px] flex-1 rounded-[14px] border border-cool-gray bg-white text-label-l text-deep-charcoal hover:border-border-strong">
          {tx(locale, copy.ok, "label")}
        </button>
        <button type="button" onClick={onOpenCompare} className="h-[52px] flex-1 rounded-[14px] bg-deep-charcoal text-label-l text-neon-green hover:bg-bg-inverse-subtle">
          {tx(locale, copy.open, "label")}
        </button>
      </div>
    </Modal>
  );
}
