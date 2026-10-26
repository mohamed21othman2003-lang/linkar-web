"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/icons/Icon";

// Figma EASE_OUT = cubic-bezier(0, 0, 0.58, 1)
const t = { duration: 0.2, ease: [0, 0, 0.58, 1] as const };

// W2-93 «قبل أن تبدأ» (Accordion 85:46601): المفتوح خلفية #f4f6f5 بدون حد + دائرة كحلي فيها × ليموني،
// المقفول أبيض بحد #e3e6e4 + دائرة رمادي فيها + — كل سؤال مستقل (أول واحد مفتوح زي الفيجما)
export function FaqCards({ items, idPrefix = "faq" }: { items: { q: string; a: string }[]; idPrefix?: string }) {
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) => setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div
            key={it.q}
            className={`rounded-lg border transition-colors duration-200 ease-figma-out ${on ? "border-transparent bg-tile" : "border-hairline bg-white"}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`${idPrefix}-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-4 py-5 text-start text-[16px]/[26px] font-bold text-deep-charcoal md:px-6 md:text-h5"
              >
                {it.q}
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-figma-out ${
                    on ? "bg-deep-charcoal text-neon-green" : "bg-tile text-deep-charcoal"
                  }`}
                >
                  <motion.span className="flex" initial={false} animate={{ rotate: on ? 45 : 0 }} transition={t}>
                    <Icon name="plus" size={14} />
                  </motion.span>
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={`${idPrefix}-${i}`}
                  key="a"
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: -10 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={t}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-5 text-[15px]/[26px] font-light text-state-gray md:px-6">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
