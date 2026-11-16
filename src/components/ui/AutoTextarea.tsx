"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

// textarea بيطول مع الكلام (من غير سكرول داخلي ولا سطر مقصوص) — minRows = أقل ارتفاع بالسطور
export function AutoTextarea({ minRows = 3, className = "", onInput, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight من غير الحدود ← نزوّدها عشان box-sizing: border-box
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  };
  // كل رندر (القيمة المتحكَّم فيها أو defaultValue أول مرة)
  useLayoutEffect(fit);
  return (
    <textarea
      ref={ref}
      rows={minRows}
      {...props}
      onInput={(e) => {
        fit();
        onInput?.(e);
      }}
      className={`resize-none overflow-hidden ${className}`}
    />
  );
}
