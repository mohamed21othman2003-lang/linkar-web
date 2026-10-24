"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { CarSize } from "@/lib/data/booking/types";
import { Icon } from "@/components/icons/Icon";

export type MenuOption<V extends string> = { value: V; label: string };

// قائمة منسدلة تفاعلية (Popups · قوائم منسدلة تفاعلية): لوحة 300 بيضاء r16 بظل،
// الخيار المختار بخلفية رمادية فاتحة + ✓ ووزن Medium. تتقفل بالضغط برّه أو Esc.
export function DropdownMenu<V extends string>({
  value,
  options,
  onChange,
  trigger,
  align = "start",
  label,
}: {
  value: V;
  options: MenuOption<V>[];
  onChange: (v: V) => void;
  trigger: (open: boolean) => ReactNode;
  align?: "start" | "end";
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {trigger(open)}
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute top-full z-50 mt-1.5 flex w-[300px] max-w-[calc(100vw-32px)] flex-col gap-0.5 rounded-lg border border-border-default bg-white p-2 shadow-elevation-2 ${align === "start" ? "start-0" : "end-0"}`}
        >
          {options.map((o) => {
            const on = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-start text-[16px] transition-colors duration-150 ease-figma-out ${on ? "bg-tile leading-[26px] font-medium" : "leading-[28px] font-light hover:bg-tile"}`}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">{on && <Icon name="check" size={16} className="text-nature-green" />}</span>
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// زر الترتيب/الفترة: «الترتيب: الأعلى خصماً ⌄» (P-11b) · «الفترة: آخر 3 أشهر ⌄» (P-18)
export function LabeledTrigger({ prefix, value, open }: { prefix?: string; value: string; open: boolean }) {
  return (
    <span className="flex h-[42px] items-center gap-2 rounded-md border border-border-default bg-white px-3.5 text-[14px] leading-[22px]">
      {prefix && <span className="font-light text-v3-text-meta">{prefix}</span>}
      <span className="font-medium">{value}</span>
      <Icon name="chevron-down" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
    </span>
  );
}

// P-18 · فلتر الفترة (من W2-38 «الفترة» / W2-65) — مكوّن جاهز لصفحات الحساب
export type Period = "3m" | "6m" | "year" | "all";
export function PeriodFilter({ locale, value, onChange, variant = "filter" }: { locale: Locale; value: Period; onChange: (p: Period) => void; variant?: "filter" | "button" }) {
  const t = getBookingDict(locale);
  const labels = t.periods as Record<Period, string>;
  const prefix = t.periodPrefix;
  return (
    <DropdownMenu
      label={prefix}
      value={value}
      onChange={onChange}
      options={(Object.keys(labels) as Period[]).map((p) => ({ value: p, label: labels[p] }))}
      trigger={(open) =>
        variant === "filter" ? (
          <LabeledTrigger prefix={prefix} value={labels[value]} open={open} />
        ) : (
          <span className="flex h-9 items-center gap-1.5 rounded-md border border-border-default bg-white px-3 text-label-m">
            <Icon name="calendar" size={16} className="text-nature-green" />
            {labels[value]}
          </span>
        )
      }
    />
  );
}

// P-17 · تغيير حجم السيارة (من W2-67b «تغيير» الحجم)
export function CarSizeMenu({ locale, value, onChange }: { locale: Locale; value: CarSize; onChange: (s: CarSize) => void }) {
  const t = getBookingDict(locale);
  const order: CarSize[] = ["large", "suv", "sedan"];
  return (
    <DropdownMenu
      label={t.chooseCarType}
      value={value}
      onChange={onChange}
      align="end"
      options={order.map((s) => ({ value: s, label: t.sizes[s] }))}
      trigger={() => <span className="text-label-m text-green-active hover:underline">{t.change}</span>}
    />
  );
}
