"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// نافذة منبثقة عامة: خلفية معتمة (Scrim) + كارت أبيض r24 — Esc والضغط برّه بيقفلوا، والتركيز بيرجع للزر اللي فتحها
export function AxDialog({
  open,
  onClose,
  labelledBy,
  width = 480,
  className = "",
  animate = true,
  shadow = "shadow-dialog",
  children,
}: {
  /** ظل الكارت: P-xx = #142936 18%، نوافذ النماذج (W2-67b/68b) = أسود 18% */
  shadow?: string;
  open: boolean;
  /** P-xx overlays: DISSOLVE 200ms EASE_OUT (الخلفية كمان). W2-67b / W2-68b في الفيجما NAVIGATE INSTANT */
  animate?: boolean;
  onClose: () => void;
  labelledBy: string;
  width?: number;
  className?: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  // الإغلاق في ref عشان الـeffect ما يتعادش مع كل رندر (وإلا التركيز بيرجع لأول حقل مع كل حرف)
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const auto = panel.current?.querySelector<HTMLElement>("[data-autofocus]");
    if (auto) auto.focus();
    else panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-deep-charcoal/72 p-4 ${animate ? "animate-dissolve" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`my-auto w-full rounded-2xl bg-white outline-none ${shadow} ${className}`}
        style={{ maxWidth: width }}
      >
        {children}
      </div>
    </div>
  );
}

// زر الإغلاق: P-xx دائرة رمادية 32، والنماذج (W2-67b · W2-68b) مربع 40 بحد
export function AxCloseButton({ onClick, label, variant = "round" }: { onClick: () => void; label: string; variant?: "round" | "square" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        variant === "round"
          ? "flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-deep-charcoal hover:bg-cool-gray"
          : "flex size-10 shrink-0 items-center justify-center rounded-md border border-cool-gray text-deep-charcoal hover:bg-tile"
      }
    >
      <Icon name="x" size={variant === "round" ? 14 : 18} />
    </button>
  );
}

// P-04 / P-04b / P-05 / P-05b: أيقونة في مربع أحمر فاتح، عنوان، نص، وزرّين متساويين
export function AxConfirm({
  open,
  onClose,
  icon,
  title,
  text,
  closeLabel,
  primary,
  secondary,
}: {
  open: boolean;
  onClose: () => void;
  icon?: UiGlyph;
  title: string;
  text: ReactNode;
  closeLabel: string;
  primary: { label: string; onClick: () => void; tone: "danger" | "dark" };
  secondary: { label: string; onClick: () => void };
}) {
  const id = useId();
  return (
    <AxDialog open={open} onClose={onClose} labelledBy={id} className="flex flex-col gap-4 px-7 pt-[26px] pb-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2.5">
          {icon && (
            <span className="flex size-[42px] items-center justify-center rounded-[14px] bg-promotional-red/12">
              <Icon name={icon} size={22} className="text-promotional-red" />
            </span>
          )}
          <h2 id={id} className="text-h4 text-deep-charcoal">
            {title}
          </h2>
        </div>
        <AxCloseButton onClick={onClose} label={closeLabel} />
      </div>
      <p className="text-body-s text-state-gray">{text}</p>
      <div className="grid grid-cols-2 items-center gap-2.5 pt-1.5">
        <button
          type="button"
          onClick={secondary.onClick}
          className="h-[54px] rounded-[14px] border border-cool-gray bg-white px-4 text-label-l text-deep-charcoal hover:bg-tile"
        >
          {secondary.label}
        </button>
        <button
          type="button"
          data-autofocus
          onClick={primary.onClick}
          className={`h-control-lg rounded-[14px] px-4 text-label-l ${
            primary.tone === "danger" ? "bg-promotional-red text-white hover:bg-brik-red" : "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle"
          }`}
        >
          {primary.label}
        </button>
      </div>
    </AxDialog>
  );
}

// P-10x: رسالة سريعة كحلي بأيقونة ليموني — تختفي تلقائياً بعد ثانيتين
export function useAxToast() {
  const [toast, setToast] = useState<{ id: number; text: string; icon: UiGlyph } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string, icon: UiGlyph = "check") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), text, icon });
    timer.current = setTimeout(() => setToast(null), 2000);
  }, []);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      {toast && (
        <div key={toast.id} role="status" className="flex animate-dissolve items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 shadow-popup">
          <Icon name={toast.icon} size={16} className="shrink-0 text-neon-green" />
          <span className="text-body-s text-white">{toast.text}</span>
        </div>
      )}
    </div>
  );
  return { show, node };
}
