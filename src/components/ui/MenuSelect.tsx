"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export type MenuSelectItem = { value: string; label: string };

// W2-DD · قوائم P-24 (الشركة 202:27161 · الموديل 202:27147 · سنة الصنع 202:27193 · اللون 202:27179)
// لوحة بعرض الحقل تحته بـ4px: r12 · p6 · gap2 · حد #d9dedb · ظل 0 8 24 #0d1a24 9% — الخيار 36px (p8/10 · r8 · 13px)،
// والمختار بخلفية #f7fbe9 + وزن 600 + ✓ 14 في آخر السطر. Esc/برّه يقفل، والأسهم بتتنقّل. بديل <select> عشان شكل القائمة يطابق الفيجما.
export const menuPanelClass =
  "absolute start-0 top-full z-30 mt-1 flex max-h-[278px] w-full animate-dissolve flex-col gap-0.5 overflow-y-auto rounded-md border border-cool-gray bg-white p-1.5 shadow-[0_8px_24px_0_#0d1a2416] [scrollbar-width:thin]";
export const menuOptionClass = (on: boolean) =>
  `flex min-h-9 w-full shrink-0 items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-start text-[13px] leading-5 text-deep-charcoal outline-none ${
    on ? "bg-[#f7fbe9] font-semibold" : "font-normal hover:bg-tile focus-visible:bg-tile"
  }`;

export function MenuSelect({
  id,
  name,
  items,
  value,
  defaultValue,
  onChange,
  autoFocus,
  className,
  "aria-labelledby": labelledBy,
}: {
  id?: string;
  /** للنماذج: بيتبعت كـ input مخفي بنفس الاسم */
  name?: string;
  items: MenuSelectItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  autoFocus?: boolean;
  /** شكل الحقل نفسه (زي الـ select القديم) */
  className: string;
  "aria-labelledby"?: string;
}) {
  const auto = useId();
  const listId = `${id ?? auto}-list`;
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value ?? "");
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const label = items.find((i) => i.value === current)?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const options = () => Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
  const openMenu = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      const btn = options()[Math.max(0, items.findIndex((i) => i.value === current))];
      btn?.focus();
      btn?.scrollIntoView({ block: "nearest" });
    });
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const pick = (v: string) => {
    if (value === undefined) setInner(v);
    onChange?.(v);
    close();
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const btns = options();
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // ما يقفلش النافذة كلها
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = btns.length;
      btns[(i + (e.key === "ArrowDown" ? 1 : -1) + n) % n]?.focus();
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={wrap} className="relative w-full">
      {name && <input type="hidden" name={name} value={current} />}
      <button
        ref={trigger}
        id={id}
        type="button"
        autoFocus={autoFocus}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelledBy}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`${className} relative text-start ${open ? "border-deep-charcoal" : ""}`}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={`pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-deep-charcoal transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul ref={list} id={listId} role="listbox" aria-labelledby={labelledBy} onKeyDown={onListKey} className={menuPanelClass}>
          {items.map((i) => {
            const on = i.value === current;
            return (
              <li key={i.value} className="flex">
                <button type="button" role="option" aria-selected={on} onClick={() => pick(i.value)} className={menuOptionClass(on)}>
                  <span>{i.label}</span>
                  {on && <Icon name="check" size={14} className="shrink-0 text-deep-charcoal" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
