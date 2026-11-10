"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { menuOptionClass } from "@/components/ui/MenuSelect";

export type DropdownOption<K extends string> = { key: K; label: string };

// قائمة منسدلة بنمط «Popups · قوائم منسدلة تفاعلية» (P-11 الترتيب · P-17 حجم السيارة):
// لوحة بيضاء r16 بحد cool-gray وظل، الخيار المختار بخلفية tile وعلامة خضراء
export function Dropdown<K extends string>({
  trigger,
  options,
  value,
  onChange,
  align = "start",
  panelClassName = "",
  className = "",
  label,
  menu = false,
}: {
  trigger: (open: boolean) => React.ReactNode;
  options: DropdownOption<K>[];
  value: K | null;
  onChange: (key: K) => void;
  align?: "start" | "end";
  panelClassName?: string;
  className?: string;
  label: string;
  /** W2-DD · الموقع (202:27207): لوحة 420 · r12 · p6 · gap2 · ظل 0 8 24 9% وخيارات 36px بخط 13 و✓ في الآخر */
  menu?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)} className="block w-full">
        {trigger(open)}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={`absolute top-[calc(100%+6px)] z-30 flex max-w-[calc(100vw-32px)] flex-col gap-0.5 border border-cool-gray bg-white ${
            menu ? "w-[420px] rounded-md p-1.5 shadow-[0_8px_24px_0_#0d1a2416]" : "w-[300px] rounded-lg p-2 shadow-elevation-2"
          } ${
            align === "start" ? "start-0" : "end-0"
          } ${panelClassName}`}
        >
          {options.map((o) => {
            const on = o.key === value;
            return (
              <li key={o.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    onChange(o.key);
                    setOpen(false);
                  }}
                  className={
                    menu
                      ? menuOptionClass(on)
                      : `flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[11px] text-start text-deep-charcoal hover:bg-tile ${
                          on ? "bg-tile text-label-l" : "text-body-m leading-[28px]"
                        }`
                  }
                >
                  {menu ? (
                    <>
                      <span>{o.label}</span>
                      {on && <Icon name="check" size={14} className="shrink-0 text-deep-charcoal" />}
                    </>
                  ) : (
                    <>
                      <span className="flex size-4 shrink-0 items-center justify-center">{on && <Icon name="check" size={16} className="text-nature-green" />}</span>
                      {o.label}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
