"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";

// قالب نوافذ «10 · النوافذ المنبثقة» (P-07، P-08…): كارت أبيض 480، r24، ظل، زر إغلاق رمادي دائري
export function Popup({
  open,
  title,
  closeLabel,
  onClose,
  children,
  dissolve = false,
}: {
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  /** OVERLAY · DISSOLVE 200ms EASE_OUT (W2-81)؛ غير كده INSTANT زي W2-80c */
  dissolve?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center bg-bg-overlay p-4 sm:items-center ${dissolve ? "animate-dissolve" : ""}`} onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100dvh-32px)] w-full max-w-[480px] flex-col gap-4 overflow-y-auto rounded-2xl bg-white px-5 pt-[26px] pb-7 shadow-[0_12px_24px_0_#1429362e] outline-none sm:px-7"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-h4 text-deep-charcoal">{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-deep-charcoal hover:bg-bg-muted">
            <Icon name="x" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// رسالة مؤقتة: flash("…") تظهر 2.4 ثانية
export function useFlash() {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2000); // AFTER_TIMEOUT 2s → CLOSE
    return () => clearTimeout(id);
  }, [msg]);
  return [msg?.text ?? null, (text: string) => setMsg((m) => ({ text, n: (m?.n ?? 0) + 1 }))] as const;
}

// P-10 · رسالة قصيرة (Toast) غامقة بعلامة ✓ ليموني
export function Toast({ message }: { message: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {message && (
        <p key={message} className="flex animate-dissolve items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 text-body-s text-white shadow-[0_12px_24px_0_#14293640]">
          {message}
          <Icon name="check" size={16} className="shrink-0 text-neon-green" />
        </p>
      )}
    </div>
  );
}
