"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// شريط الفلاتر (القسم 3.5 «Filters» · Figma CON5-23L 3114:28160 و CON5-07 3114:48542):
// بحث (40 · r10 · حشو 12 · عدسة 16 على اليمين) + قوائم «العنوان: القيمة» (<Select variant="filter" />) + «مسح الفلاتر» لما يكون فيه فلتر مفعّل.
export function FilterBar({ children, onClear, canClear, className }: { children: ReactNode; onClear?: () => void; canClear?: boolean; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className ?? ""}`}>
      {children}
      {onClear && canClear ? <ClearFilters onClick={onClear} /> : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  label,
  iconEnd,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
  label?: string;
  /** العدسة على الشمال (CON5-07 3114:48542) بدل اليمين */
  iconEnd?: boolean;
}) {
  return (
    <label className={`flex h-10 items-center gap-2 rounded-10 border border-border bg-white px-3 focus-within:border-ink ${className ?? "w-full sm:w-[280px]"}`}>
      {iconEnd ? null : <Icon name="search" size={16} className="shrink-0 text-muted" />}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="min-w-0 flex-1 bg-transparent text-13 text-ink outline-none placeholder:font-light placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button type="button" aria-label="مسح البحث" onClick={() => onChange("")} className="shrink-0 text-muted hover:text-ink">
          <Icon name="x" size={14} />
        </button>
      ) : null}
      {iconEnd ? <Icon name="search" size={16} className="shrink-0 text-ink" /> : null}
    </label>
  );
}

export function ClearFilters({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 items-center gap-1.5 rounded-10 px-2 text-13 font-medium text-ink hover:bg-surface-2">
      <Icon name="x" size={14} />
      مسح الفلاتر
    </button>
  );
}
