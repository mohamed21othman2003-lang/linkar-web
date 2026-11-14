"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { ltrRuns } from "@/lib/format";
import { Icon } from "./Icon";

// رسائل التأكيد (القسم 16 · Figma CON5-T2301 3114:25307): شريط كحلي r12 · حشو 12·18 · مسافة 10 · علامة ✓ 18 أخضر فاتح
// + نص الرسالة 13 Medium أبيض. مكانها فوق في نص منطقة المحتوى (تحت الشريط العلوي بـ20) وبتختفي لوحدها.
// toast(title, body): العنوان للقارئ الصوتي، والظاهر هو نص الرسالة (أو العنوان لو مفيش نص) زي التصميم.
type Toast = { id: number; title: string; body?: string };
const Ctx = createContext<(title: string, body?: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  // القائمة الجانبية 240 على اليمين: الرسالة في نص المحتوى مش نص الشاشة
  const [offset, setOffset] = useState(0);
  const seq = useRef(0);
  const show = useCallback((title: string, body?: string) => {
    const id = ++seq.current;
    setOffset(document.querySelector("aside")?.getBoundingClientRect().width ?? 0);
    setItems((l) => [...l, { id, title, body }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" style={{ right: offset }} className="pointer-events-none fixed top-[92px] left-0 z-[60] flex flex-col items-center gap-2">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex max-w-[560px] items-center gap-2.5 rounded-12 bg-ink px-[18px] py-3 text-13 font-medium text-white shadow-card">
            <Icon name="check" size={18} className="shrink-0 text-lime" />
            <span className="sr-only">{t.title} — </span>
            {/* الأكواد والأرقام جوه الرسالة معزولة عشان ما تنقلبش (REQ-0429 · LK-WA-001 · 055 410 2290) — القسم 19.1 · 8 */}
            <span>{ltrRuns(t.body ?? t.title)}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
