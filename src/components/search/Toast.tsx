"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

type ToastAction = { label: string; onClick: () => void };
type ToastItem = { id: number; text: string; action?: ToastAction };

const ToastContext = createContext<(text: string, action?: ToastAction) => void>(() => {});

export const useToast = () => useContext(ToastContext);

// P-10 · رسائل التأكيد: كحلي r14، نص أبيض + علامة ليموني، وزر اختياري («قارن الآن»)
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const show = useCallback((text: string, action?: ToastAction) => {
    const id = ++seq.current;
    setItems((cur) => [...cur.slice(-1), { id, text, action }]);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-[70] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <ToastView key={t.id} item={t} onDone={() => setItems((cur) => cur.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const h = setTimeout(onDone, 2000); // P-10 · AFTER_TIMEOUT 2s → CLOSE
    return () => clearTimeout(h);
  }, [onDone]);
  return (
    <div
      role="status"
      className="pointer-events-auto flex max-w-full animate-dissolve items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 shadow-elevation-2"
    >
      <Icon name="check" size={16} className="shrink-0 text-neon-green" />
      <span className="text-body-s text-white">{item.text}</span>
      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action!.onClick();
            onDone();
          }}
          className="shrink-0 text-label-m text-neon-green hover:underline"
        >
          {item.action.label}
        </button>
      )}
    </div>
  );
}
