"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

// قائمة منسدلة للفلاتر: P-18 «الفترة» و P-20 «السيارة» (Web popup · P-18/P-20 filter)
// الزر: «الفترة: آخر 3 أشهر ⌄» — اللوحة 300 عرض، r16، الخيار المختار خلفية tile + ✓ أخضر
export function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current = options.find((o) => o.value === value);
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-cool-gray bg-white px-3 py-[9px] whitespace-nowrap hover:border-border-strong"
      >
        <span className="text-caption text-state-gray">{label}</span>
        <span className="text-label-m text-deep-charcoal">{current?.label}</span>
        <Icon name="chevron-down" size={14} className="text-deep-charcoal" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute top-12 z-30 flex w-[300px] max-w-[calc(100vw-32px)] flex-col gap-0.5 rounded-[16px] border border-cool-gray bg-white p-2 shadow-popup max-sm:start-0 sm:end-0"
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
                  className={`flex w-full items-center justify-between rounded-[10px] px-3 py-[11px] text-deep-charcoal ${on ? "bg-tile text-label-l" : "text-body-m hover:bg-tile"}`}
                >
                  {o.label}
                  {on ? <Icon name="check" size={16} className="text-nature-green" /> : <span className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
