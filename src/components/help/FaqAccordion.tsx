"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export type FaqEntry = { q: string; a: string };

// «v2 · FAQ item» (927:310559): Closed (68, حد 1 رمادي، plus) ⇄ Open (107، حد 1.5 غامق، x + الإجابة).
// الفيجما: ON_CLICK → CHANGE_TO · SMART_ANIMATE 200ms EASE_OUT في الاتجاهين → بنحرّك الارتفاع (grid-rows 0fr↔1fr)
// وظهور الإجابة ولون/سمك الحد، والـplus بيلف 45° فيبقى x. أول سؤال مفتوح افتراضياً زي الفيجما.
// (لون الأيقونة في الفيجما أبيض بالغلط → Charcoal حسب خاصية Tone)
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  const anim = "duration-200 ease-figma-out";
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div
            key={it.q}
            className={`rounded-lg border-solid bg-white transition-[border-color,border-width] ${anim} ${
              isOpen ? "border-[1.5px] border-deep-charcoal" : "border border-border-default hover:border-border-strong"
            }`}
          >
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 pt-5 text-start"
              >
                <span className="text-label-l text-deep-charcoal">{it.q}</span>
                <Icon name="plus" size={18} className={`shrink-0 text-deep-charcoal transition-transform ${anim} ${isOpen ? "rotate-45" : ""}`} />
              </button>
            </h2>
            <div
              id={id}
              role="region"
              aria-hidden={!isOpen}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] ${anim} ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pt-2.5 text-body-m text-text-secondary">{it.a}</p>
              </div>
            </div>
            <div className="h-5" />
          </div>
        );
      })}
    </div>
  );
}
