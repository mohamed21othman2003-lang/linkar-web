"use client";

import type { ReactNode } from "react";
import { useScrollEdges } from "./scroll-edges";

/** صندوق تمرير أفقي بعلامة: تلاشي على الطرف اللي وراه محتوى (بدل تمرير مستخبي من غير أي إشارة) */
export function ScrollX({ children, className }: { children: ReactNode; className?: string }) {
  const [ref, edges] = useScrollEdges<HTMLDivElement>();
  return (
    <div ref={ref} data-start={edges.start} data-end={edges.end} className={`edge-mask overflow-x-auto ${className ?? ""}`}>
      {children}
    </div>
  );
}
