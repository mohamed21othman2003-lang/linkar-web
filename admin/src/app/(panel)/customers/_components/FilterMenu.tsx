"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { MenuOption } from "@/lib/api/customers";

// فلتر «العنوان: القيمة» + قائمته (CON5-05 3114:16054 · القوائم CON5-05P 3114:20672 / 20711 / 20754 / 20787):
// الزر 40 · r10 · حشو 12 يمين و10 شمال · مسافة 4 · العنوان 13 Light رمادي · القيمة 13 SemiBold · سهم 14 على الشمال
// المفعّل (CON5-05 · المركز · جونسون 3114:18769): خلفية #F7FBE9 · إطار كحلي 1.5 · ✕ 14 مكان السهم يمسح الفلتر
// القائمة: بيضا r12 بإطار · حشو 8 · مسافة 2 · بحث 36 r8 رمادي · خيارات 36 r8 (الاسم 13 Regular يمين والعدد 12 Light شمال)
// الخيار المختار: #F7FBE9 + ✓ 14 + الاسم SemiBold · عناوين المجموعات (الفرع) 12 Medium رمادي
export function FilterMenu({
  label,
  value,
  valueLabel,
  options,
  onChange,
  allCount,
  searchPlaceholder,
  footer,
  width = 280,
}: {
  label: string;
  value: string;
  /** النص الظاهر على الزر (الفرع: «الزهراء») */
  valueLabel?: string;
  options: MenuOption[];
  onChange: (v: string, opt?: MenuOption) => void;
  /** عدد «الكل» — لو مش موجود ما فيش خيار «الكل» (قائمة الفرع) */
  allCount?: string;
  searchPlaceholder?: string;
  footer?: ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const active = !!value;
  const shown = q.trim() ? options.filter((o) => o.label.includes(q.trim()) || o.value.toLowerCase().includes(q.trim().toLowerCase()) || o.group?.includes(q.trim())) : options;
  const pick = (v: string, o?: MenuOption) => {
    onChange(v, o);
    setOpen(false);
    setQ("");
  };
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div
        className={`flex h-10 w-fit shrink-0 items-center gap-1 rounded-10 ps-3 pe-2.5 text-13 leading-5 text-ink ${active ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}
      >
        <Popover.Trigger className="flex items-center gap-1 outline-none" aria-label={`${label}: ${valueLabel ?? (value || "الكل")}`}>
          <span className="font-light whitespace-nowrap text-muted">{label}:</span>
          <span className="font-semibold whitespace-nowrap">{valueLabel ?? (value || "الكل")}</span>
          {active ? null : <Icon name="chevron-down" size={14} className="shrink-0" />}
        </Popover.Trigger>
        {active ? (
          <button type="button" aria-label={`مسح ${label}`} onClick={() => onChange("")} className="flex shrink-0 items-center">
            <Icon name="x" size={14} />
          </button>
        ) : null}
      </div>
      <Popover.Portal>
        <Popover.Content
          dir="rtl"
          align="start"
          sideOffset={6}
          style={{ width }}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-[70] flex max-h-[min(480px,var(--radix-popover-content-available-height))] max-w-[calc(100vw-32px)] flex-col gap-0.5 overflow-y-auto rounded-12 border border-border bg-white p-2 shadow-card"
        >
          {searchPlaceholder ? (
            <label className="flex h-9 shrink-0 items-center gap-2 rounded-8 bg-surface-1 px-2.5">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-13 leading-5 text-ink outline-none placeholder:text-[#9aa39f]"
              />
              <Icon name="search" size={14} className="shrink-0 text-ink" />
            </label>
          ) : null}
          {allCount != null ? <Opt label="الكل" count={allCount} selected={!value} onClick={() => pick("")} /> : null}
          {shown.map((o, i) => {
            const head = o.group && o.group !== shown[i - 1]?.group ? o.group : null;
            return (
              <div key={o.value} className="contents">
                {head ? <p className="px-2.5 pt-2.5 pb-0.5 text-12 leading-[18px] font-medium text-muted">{head}</p> : null}
                <Opt label={o.label} count={o.count} selected={value === o.value} onClick={() => pick(o.value, o)} />
              </div>
            );
          })}
          {shown.length === 0 ? <p className="px-2.5 py-2 text-13 text-muted">لا توجد نتائج</p> : null}
          {footer}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Opt({ label, count, selected, onClick }: { label: string; count: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-9 shrink-0 items-center justify-between gap-2 rounded-8 px-2.5 py-2 text-start outline-none hover:bg-surface-1 focus-visible:bg-surface-1 ${selected ? "bg-lime-tint! " : ""}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`text-13 leading-5 text-ink ${selected ? "font-semibold" : "font-normal"}`}>{label}</span>
        {selected ? <Icon name="check" size={14} className="shrink-0 text-ink" /> : null}
      </span>
      <span className="num text-12 leading-[18px] font-light text-muted">{count}</span>
    </button>
  );
}

export function MenuFooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="block text-start text-13 leading-5 font-medium text-info hover:underline">
      {children}
    </Link>
  );
}

export function MenuFooterNote({ children }: { children: ReactNode }) {
  return <p className="text-12 leading-[18px] font-light text-muted">{children}</p>;
}
