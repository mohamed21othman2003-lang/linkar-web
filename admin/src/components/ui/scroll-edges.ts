"use client";

import { useEffect, useRef, useState } from "react";

// بيعرف لو فيه محتوى مستخبي على أي طرف في صندوق بتمرير أفقي (اللوحة RTL: start = يمين، end = شمال)
// الاستخدام: <div ref={ref} data-start={edges.start} data-end={edges.end} className="edge-mask overflow-x-auto"> — الظل/التلاشي في globals.css
export function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const x = Math.abs(el.scrollLeft);
      const start = x > 1;
      const end = max - x > 1;
      setEdges((p) => (p.start === start && p.end === end ? p : { start, end }));
    };
    el.addEventListener("scroll", update, { passive: true });
    // ResizeObserver بيبلّغ أول مرة لوحده بعد observe — فمفيش setState متزامن جوه الـ effect
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const c of Array.from(el.children)) ro.observe(c);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);
  return [ref, edges] as const;
}
