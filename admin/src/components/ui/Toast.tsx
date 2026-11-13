"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

// رسائل التأكيد (القسم 16): عنوان + نص، بتختفي لوحدها
type Toast = { id: number; title: string; body?: string };
const Ctx = createContext<(title: string, body?: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);
  const show = useCallback((title: string, body?: string) => {
    const id = ++seq.current;
    setItems((l) => [...l, { id, title, body }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-6 z-[60] flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex min-w-[320px] max-w-[440px] items-start gap-3 rounded-12 bg-ink px-4 py-3 text-white shadow-card">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
              <Icon name="check" size={14} />
            </span>
            <div className="flex flex-col">
              <span className="text-14 font-bold">{t.title}</span>
              {t.body ? <span className="text-13 text-white/80">{t.body}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
