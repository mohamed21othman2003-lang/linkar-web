"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// P-10x · توست (P-10f «وصلتنا رسالتك…» · P-10h «شكراً، سيساعدنا رأيك…»):
// غامق r14، أيقونة نيون 16 من بداية السطر، Body S أبيض. الفيجما: يظهر DISSOLVE 200ms EASE_OUT ويقفل AFTER_TIMEOUT 2s.
export function Toast({ message, icon }: { message: string | null; icon: UiGlyph }) {
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
      {message && (
        <div key={message} className="flex max-w-full animate-dissolve items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 shadow-popup">
          <Icon name={icon} size={16} className="shrink-0 text-neon-green" />
          <p className="text-body-s text-white">{message}</p>
        </div>
      )}
    </div>
  );
}

export function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  return { message, show };
}
