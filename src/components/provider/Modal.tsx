"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { FIGMA_EASE_OUT } from "./motion";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// نافذة منبثقة («10 · النوافذ المنبثقة»): Scrim + كارت أبيض r24 بظل (P-07, P-08b, P-15, P-19) أو أي محتوى (W2-22, P-14)
export function Modal({
  open,
  onClose,
  children,
  label,
  width = 480,
  bare = false,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  width?: number;
  bare?: boolean; // بدون الكارت الأبيض (المحتوى بيرسم خلفيته)
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
  if (typeof document === "undefined") return null;
  // الفيجما: OVERLAY · DISSOLVE 200ms EASE_OUT (الخلفية والنافذة مع بعض) — والقفل أسرع شوية
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, ease: FIGMA_EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.15, ease: FIGMA_EASE_OUT } }}
          className="fixed inset-0 z-[100] flex overflow-y-auto bg-bg-overlay p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`m-auto w-full outline-none ${
              bare ? "" : "flex flex-col gap-4 rounded-2xl bg-white px-5 pt-6 pb-6 shadow-[0_12px_24px_0_#1429362e] sm:px-7 sm:pt-[26px] sm:pb-7"
            } ${className}`}
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

// رأس النافذة: العنوان H4 + زر إغلاق دائري رمادي (P-07, P-08b, P-15, P-19)
export function ModalHead({ title, onClose, closeLabel }: { title: string; onClose: () => void; closeLabel: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 id={id} className="text-h4">
        {title}
      </h2>
      <button type="button" aria-label={closeLabel} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-text-disabled transition-colors duration-200 ease-figma-out hover:bg-bg-muted hover:text-deep-charcoal">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

// زر الاختيار الدائري في P-15 / P-19: ممتلئ كحلي = مختار، حدود رمادية = لا
export function RadioDot({ on }: { on: boolean }) {
  return on ? (
    <span className="size-5 shrink-0 rounded-full bg-deep-charcoal" aria-hidden />
  ) : (
    <span className="size-5 shrink-0 rounded-full border-[1.5px] border-cool-gray bg-white" aria-hidden />
  );
}

// ---------- P-10 · رسائل سريعة: OVERLAY DISSOLVE 200ms + AFTER_TIMEOUT 2s → CLOSE ----------
type ToastMsg = { id: number; text: string; icon: UiGlyph; action?: { label: string; href?: string; onClick?: () => void } };
const ToastCtx = createContext<(t: Omit<ToastMsg, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<ToastMsg | null>(null);
  const show = useCallback((t: Omit<ToastMsg, "id">) => setMsg({ ...t, id: Date.now() }), []);
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2000);
    return () => clearTimeout(id);
  }, [msg]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {msg && (
          <motion.div
            key={msg.id}
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2, ease: FIGMA_EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: FIGMA_EASE_OUT } }}
            className="pointer-events-none fixed inset-x-0 bottom-8 z-[110] flex justify-center px-4"
          >
            <div className="pointer-events-auto flex items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 shadow-[0_12px_24px_0_#14293640]">
              <Icon name={msg.icon} size={16} className="shrink-0 text-neon-green" />
              <span className="text-body-s text-white">{msg.text}</span>
              {msg.action &&
                (msg.action.href ? (
                  <Link href={msg.action.href} className="text-label-m text-neon-green hover:underline">
                    {msg.action.label}
                  </Link>
                ) : (
                  <button type="button" onClick={msg.action.onClick} className="text-label-m text-neon-green hover:underline">
                    {msg.action.label}
                  </button>
                ))}
            </div>
          </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
