"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons/Icon";

// غطاء النوافذ: Scrim كحلي 72% + Esc للإغلاق + قفل تمرير الصفحة
export function Modal({
  open,
  onClose,
  label,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="fixed inset-0 animate-dissolve bg-deep-charcoal/72" onClick={onClose} />
      <div className={`relative w-full animate-dissolve bg-white shadow-elevation-3 ${className}`}>{children}</div>
    </div>
  );
}

// زر الإغلاق الدائري الرمادي في نوافذ P-12/P-13
export function CloseCircle({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-deep-charcoal hover:bg-bg-muted">
      <Icon name="x" size={14} />
    </button>
  );
}
