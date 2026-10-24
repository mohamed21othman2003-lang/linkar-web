"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icon";

export type WhatsAppCopy = { title: string; body: string; open: string; close: string; href: string };

// P-22 · تواصل عبر واتساب (956:62) — نافذة وسط الشاشة 440، r24. الفيجما: OVERLAY CENTER · DISSOLVE 200ms EASE_OUT، و«إغلاق» CLOSE فوري
export function WhatsAppDialog({ open, onClose, copy }: { open: boolean; onClose: () => void; copy: WhatsAppCopy }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-dissolve items-center justify-center bg-bg-overlay p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="p22-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[440px] flex-col gap-4 rounded-2xl bg-white px-7 pt-[26px] pb-7 shadow-popup"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2.5">
            <span className="flex self-start rounded-[14px] bg-whatsapp/14 p-2.5">
              <Icon name="message" size={22} className="text-nature-green" />
            </span>
            <h2 id="p22-title" className="text-h4 text-deep-charcoal">
              {copy.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile text-deep-charcoal hover:bg-bg-muted"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <p className="text-body-s text-text-secondary">{copy.body}</p>
        {/* ترتيب الفيجما: «إغلاق» من بداية السطر و«فتح واتساب» في آخره */}
        <div className="flex gap-2.5 pt-1.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[54px] flex-1 items-center justify-center rounded-[14px] border border-border-default bg-white px-4 text-label-l text-deep-charcoal hover:bg-tile"
          >
            {copy.close}
          </button>
          <a
            href={copy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] flex-1 items-center justify-center rounded-[14px] bg-whatsapp px-4 text-label-l text-white hover:brightness-95"
          >
            {copy.open}
          </a>
        </div>
      </div>
    </div>
  );
}
