"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// إطار النوافذ المنبثقة (القسم «10 · النوافذ المنبثقة»): خلفية معتمة + لوحة في النص، Esc والضغط برّه بيقفلوا.
export function Dialog({
  open,
  onClose,
  label,
  children,
  className = "",
  align = "center",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  align?: "center" | "top";
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-[100] flex animate-dissolve justify-center overflow-y-auto bg-bg-overlay px-4 py-6 ${align === "center" ? "items-start sm:items-center" : "items-start"}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={`w-full outline-none focus-visible:shadow-none ${className}`}>
        {children}
      </div>
    </div>
  );
}

// لوحة P-xx: 480 عرض، r24، حشوة 26/28/28، مسافة 16
export function Popup({
  open,
  onClose,
  title,
  closeLabel,
  icon,
  iconTone = "lime",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  icon?: UiGlyph;
  iconTone?: "lime" | "red";
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} label={title} className="max-w-[480px]">
      <div className="flex flex-col gap-4 rounded-[24px] bg-white px-5 pt-[26px] pb-7 shadow-popup sm:px-7">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
            {icon && (
              <span className={`flex rounded-[14px] p-2.5 text-deep-charcoal ${iconTone === "red" ? "bg-promotional-red/12" : "bg-neon-green/18"}`}>
                <Icon name={icon} size={22} />
              </span>
            )}
            <h2 className="text-h4 text-deep-charcoal">{title}</h2>
          </div>
          <CloseButton label={closeLabel} onClick={onClose} />
        </div>
        {children}
      </div>
    </Dialog>
  );
}

export function CloseButton({ label, onClick, tone = "light" }: { label: string; onClick: () => void; tone?: "light" | "glass" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center rounded-full ${
        tone === "glass" ? "bg-white/12 p-2.5 text-white hover:bg-white/20" : "size-8 bg-tile text-deep-charcoal hover:bg-bg-muted"
      }`}
    >
      <Icon name="x" size={tone === "glass" ? 16 : 14} />
    </button>
  );
}

// أزرار أسفل النافذة: زرين بعرض متساوي، r14، 52 ارتفاع — الثانوي في بداية السطر والأساسي بعده (زي الفيجما)
const popupBtn = "flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-[14px] px-4 text-label-l transition-colors disabled:opacity-50";
export const popupBtnClass = {
  primary: `${popupBtn} bg-neon-green text-deep-charcoal hover:bg-bg-brand-hover`,
  dark: `${popupBtn} bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle`,
  danger: `${popupBtn} bg-promotional-red text-white hover:bg-brik-red`,
  // الزر الثانوي 54 في الفيجما (الحد برّه الـ52)
  outline: `${popupBtn} h-[54px] border border-cool-gray bg-white text-deep-charcoal hover:border-border-strong`,
};

export function PopupActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5 pt-1.5">{children}</div>;
}

// رسائل سريعة P-10x: شريط كحلي r14 يختفي بعد ثانيتين
type ToastState = { text: string; icon: UiGlyph; key: number } | null;

export function useToast(): [ReactNode, (text: string, icon?: UiGlyph) => void] {
  const [toast, setToast] = useState<ToastState>(null);
  const show = useCallback((text: string, icon: UiGlyph = "check") => setToast({ text, icon, key: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      {toast && (
        <div key={toast.key} role="status" className="flex animate-dissolve items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 text-body-s text-white shadow-popup">
          <Icon name={toast.icon} size={16} className="shrink-0 text-neon-green" />
          {toast.text}
        </div>
      )}
    </div>
  );
  return [node, show];
}
