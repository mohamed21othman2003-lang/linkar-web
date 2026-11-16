"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export type DropdownOption = { key: string; label: string };

// W2-DD · قائمة منسدلة بشكل الفيجما (بدل <select> المتصفح): صندوق 54 + سهم، والقائمة كارت أبيض بظل تحته.
// القوائم الطويلة (أكتر من 8) فيها بحث فوق. required: حقل مخفي بيمنع الإرسال لو مفيش اختيار.
export function Dropdown({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  required = false,
  disabled = false,
}: {
  id: string;
  value: string;
  onChange: (key: string) => void;
  options: DropdownOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.key === value);
  const searchable = options.length > 8;
  const shown = q.trim() ? options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase())) : options;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    // القائمة تبان كاملة جوه النافذة اللي بتسكرول
    wrap.current?.querySelector("[role=listbox]")?.scrollIntoView({ block: "nearest" });
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (key: string) => {
    onChange(key);
    setOpen(false);
    setQ("");
    button.current?.focus();
  };

  return (
    <div
      ref={wrap}
      className="relative"
      onKeyDown={(e) => {
        // Esc يقفل القائمة بس (مش النافذة كلها)
        if (e.key === "Escape" && open) {
          // مستمع Esc بتاع النافذة على document زي React نفسه ← لازم stopImmediatePropagation
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[54px] w-full items-center justify-between gap-2 rounded-md border bg-white px-3.5 text-start text-body-m outline-none disabled:cursor-not-allowed disabled:bg-tile ${
          open ? "border-[1.5px] border-deep-charcoal" : "border-cool-gray"
        } ${current ? "text-deep-charcoal" : "text-text-tertiary"}`}
      >
        <span className="min-w-0 truncate">{current?.label ?? placeholder}</span>
        <Icon name="chevron-down" size={16} className={`shrink-0 text-state-gray transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          onInvalid={() => button.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        />
      )}
      {open && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1.5 flex flex-col gap-1 rounded-lg border border-cool-gray bg-white p-2 shadow-dialog">
          {searchable && (
            <label className="flex h-11 items-center gap-2 rounded-md border border-cool-gray px-3 focus-within:border-deep-charcoal">
              <Icon name="search" size={16} className="shrink-0 text-state-gray" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-body-m outline-none placeholder:text-text-tertiary focus-visible:shadow-none!"
              />
            </label>
          )}
          <ul className="flex max-h-60 flex-col gap-0.5 overflow-y-auto overscroll-contain">
            {shown.map((o) => (
              <li key={o.key} role="option" aria-selected={o.key === value}>
                <button
                  type="button"
                  onClick={() => pick(o.key)}
                  className={`flex h-11 w-full items-center justify-between gap-2 rounded-[10px] px-3 text-start hover:bg-tile ${o.key === value ? "bg-tile text-label-l" : "text-body-m"}`}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                  {o.key === value && <Icon name="check" size={16} className="shrink-0 text-nature-green" />}
                </button>
              </li>
            ))}
            {!shown.length && <li className="px-3 py-2.5 text-body-s text-state-gray">{emptyLabel}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
