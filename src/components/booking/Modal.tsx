"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/icons/Icon";

const noop = () => () => {};
// Figma: OVERLAY · DISSOLVE 200ms EASE_OUT (الخلفية والكارت مع بعض) · الإغلاق 150ms
const EASE_OUT = [0, 0, 0.58, 1] as const;
export const dissolve = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE_OUT } },
};
// true بعد الـhydration فقط (البورتال ما يترسمش على السيرفر)
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

// نافذة منبثقة عامة (قسم «10 · النوافذ المنبثقة»): خلفية Scrim + كارت أبيض r24 بظل، تتقفل بـ Esc أو الضغط برّه
export function Modal({
  open,
  onClose,
  children,
  width = 480,
  label,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          {...dissolve}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-bg-overlay p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`my-auto flex w-full flex-col gap-4 rounded-2xl bg-white px-5 pt-6 pb-6 shadow-elevation-3 outline-none sm:px-7 sm:pt-[26px] sm:pb-7 ${className}`}
            style={{ maxWidth: width }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// رأس النافذة: أيقونة اختيارية فوق العنوان + زر إغلاق دائري (P-09, P-15, P-23 …)
export function PopupHead({ title, icon, onClose, closeLabel }: { title: string; icon?: ReactNode; onClose: () => void; closeLabel: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-2.5">
        {icon}
        <h2 id={id} className="text-h4">
          {title}
        </h2>
      </div>
      <button type="button" aria-label={closeLabel} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile hover:bg-bg-muted">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

// أزرار النافذة: زرّين بنفس العرض (الثانوي أبيض بحدود والرئيسي ليموني/كحلي)
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5 pt-1.5">{children}</div>;
}

export const btnPrimary = "flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-neon-green px-4 text-label-l text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed disabled:opacity-50";
export const btnDark = "flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-deep-charcoal px-4 text-label-l text-neon-green hover:bg-bg-inverse-subtle";
export const btnSecondary = "flex h-[54px] items-center justify-center gap-2 rounded-[14px] border border-border-default bg-white px-4 text-label-l text-deep-charcoal hover:border-border-strong";

// رسالة سريعة (P-10 · AFTER_TIMEOUT 2s CLOSE): كحلي r14 بأيقونة ليموني، تظهر DISSOLVE 200ms
export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  const mounted = useMounted();
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, 2000);
    return () => clearTimeout(id);
  }, [message, onDone]);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div key={message} {...dissolve} role="status" className="fixed inset-x-0 bottom-8 z-[110] flex justify-center px-4">
          <div className="flex items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 text-body-s text-white shadow-elevation-3">
            <Icon name="check" size={16} className="text-neon-green" />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
