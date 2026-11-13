import type { ReactNode } from "react";

// Pill (القسم 3.5 · Figma «CON · Pill» 1317:39): 24 · r999 · حشو 2·10 · 12 Medium
// والمقاس S = شارة الحالة جوه الجداول والأدراج (CON5-23 3114:24841): 22 · r8 · حشو 1·8
export type PillTone = "success" | "warning" | "pending" | "info" | "danger" | "neutral" | "neon" | "navy";

const TONE: Record<PillTone, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-[#fff1d6] text-[#8a5b14]",
  pending: "bg-pending-tint text-pending",
  info: "bg-[#e6eef5] text-[#2c6aa0]",
  danger: "bg-[#fbeaea] text-danger",
  neutral: "bg-surface-2 text-[#5a635e]",
  neon: "bg-lime text-ink",
  navy: "bg-ink text-white",
};

export function Pill({ tone = "neutral", size = "M", children, className }: { tone?: PillTone; size?: "M" | "S"; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center whitespace-nowrap text-12 font-medium ${
        size === "S" ? "h-[22px] rounded-8 px-2" : "h-6 rounded-full px-2.5"
      } ${TONE[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
