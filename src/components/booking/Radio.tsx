"use client";

import { motion } from "motion/react";

// Radio 22×22: المختار كحلي بنقطة ليموني، غير المختار أبيض بحدود رمادية 2px
export function RadioDot({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-[22px] shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-figma-out ${on ? "bg-deep-charcoal" : "border-2 border-state-gray bg-white"} ${className}`}
    >
      {on && <span className="size-2 animate-dissolve rounded-full bg-neon-green" />}
    </span>
  );
}

// v2 · Toggle 44×24: مفعّل كحلي بدائرة ليموني، غير مفعّل رمادي بدائرة بيضاء — CHANGE_TO · DISSOLVE 150ms EASE_OUT
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ease-figma-out ${on ? "justify-end bg-deep-charcoal" : "justify-start bg-cool-gray"}`}
    >
      <motion.span layout transition={{ duration: 0.15, ease: [0, 0, 0.58, 1] }} className={`size-5 rounded-full transition-colors duration-150 ease-figma-out ${on ? "bg-neon-green" : "bg-white"}`} />
    </button>
  );
}
