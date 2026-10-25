"use client";

import { useEffect, useRef, type ReactNode } from "react";

// شريط تبويبات بيتسكرول أفقي على الموبايل (الأسئلة الشائعة، قائمة السياسات):
// بيجيب العنصر النشط (aria-current) لنص الشريط عشان مايبقاش مستخبي برّه الشاشة — من غير ما يحرّك الصفحة رأسياً
export function ActiveIntoView({ activeKey, className = "", label, children }: { activeKey: string; className?: string; label?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !el || box.scrollWidth <= box.clientWidth) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    box.scrollBy({ left: r.left + r.width / 2 - (b.left + b.width / 2), behavior: "instant" });
  }, [activeKey]);
  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  );
}
