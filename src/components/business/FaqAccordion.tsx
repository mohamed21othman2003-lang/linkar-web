"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/icons/Icon";

// Figma EASE_OUT = cubic-bezier(0, 0, 0.58, 1)
const ease = [0, 0, 0.58, 1] as const;
const t = { duration: 0.2, ease };

// أسئلة W2-90: كل سؤال CHANGE_TO لنسخته المفتوحة/المقفولة · SMART_ANIMATE 200ms EASE_OUT
// (مستقلة عن بعض — مش accordion حصري). المفتوح: حد 1.5 كحلي + ×، المقفول: حد رمادي + +
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) => setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div
            key={it.q}
            className={`rounded-lg border-solid bg-white transition-[border-color,border-width] duration-200 ease-figma-out ${
              on ? "border-[1.5px] border-deep-charcoal" : "border border-border-default"
            }`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`faq-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start text-label-l text-deep-charcoal"
              >
                {it.q}
                <span className="relative size-[18px] shrink-0">
                  <motion.span className="absolute inset-0" initial={false} animate={{ opacity: on ? 0 : 1, rotate: on ? 45 : 0 }} transition={t}>
                    <Icon name="plus" size={18} />
                  </motion.span>
                  <motion.span className="absolute inset-0" initial={false} animate={{ opacity: on ? 1 : 0, rotate: on ? 0 : -45 }} transition={t}>
                    <Icon name="x" size={18} />
                  </motion.span>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`faq-${i}`}
                  key="a"
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: -10 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={t}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-body-m text-text-secondary">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
