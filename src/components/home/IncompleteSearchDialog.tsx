"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icon";

export type IncompleteCopy = {
  badge: string;
  title: string;
  body: string;
  service: [label: string, text: string];
  city: [label: string, text: string];
  car: [label: string, text: string];
  ok: string;
  close: string;
};

// P-01e · أكمل خيارات البحث (85:49277) — 480 عرض، r20، بتظهر لما «ابحث» يتضغط بخانات ناقصة.
// السطور = الخانات الناقصة بس (في الفيجما التلاتة)
export function IncompleteSearchDialog({
  copy,
  missing,
  onClose,
}: {
  copy: IncompleteCopy;
  missing: { service: boolean; city: boolean; car: boolean };
  onClose: () => void;
}) {
  const ok = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ok.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const rows = (["service", "city", "car"] as const).filter((k) => missing[k]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="incomplete-title">
      <div className="absolute inset-0 animate-dissolve bg-bg-overlay" onClick={onClose} />
      <div className="relative flex w-[480px] max-w-full animate-dissolve flex-col gap-4 rounded-[20px] bg-white px-7 pt-[26px] pb-7 text-deep-charcoal shadow-[0_12px_24px_#14293640] max-sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-[10px] bg-alert-red-bg px-3 py-1.5 text-[15px] leading-[1.4] font-bold text-alert-red">{copy.badge}</span>
            <h2 id="incomplete-title" className="text-[22px] leading-[1.4] font-bold">
              {copy.title}
            </h2>
            <p className="max-w-[360px] text-[14px] leading-[1.25] text-state-gray">{copy.body}</p>
          </div>
          <button
            type="button"
            aria-label={copy.close}
            onClick={onClose}
            className="flex shrink-0 items-center rounded-full bg-tile p-[9px] text-deep-charcoal hover:bg-cool-gray"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {rows.map((k) => (
            <li key={k} className="flex items-start gap-2.5">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-alert-red-bg text-[13px] font-bold text-alert-red">!</span>
              <p className="flex-1 pt-0.5 text-[14px] leading-[1.35]">
                <span className="font-semibold">{copy[k][0]}</span> {copy[k][1]}
              </p>
            </li>
          ))}
        </ul>
        <button
          ref={ok}
          type="button"
          onClick={onClose}
          className="flex w-full items-center justify-center rounded-full bg-neon-green py-3.5 text-[15px] leading-[1.4] font-bold text-v3-text-on-lime hover:bg-bg-brand-hover"
        >
          {copy.ok}
        </button>
      </div>
    </div>
  );
}
