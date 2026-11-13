import type { ReactNode } from "react";

// Badge (القسم 3.5): Neutral / Brand / Success / Warning / Danger / Info · Soft / Solid
export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const SOFT: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  brand: "bg-lime-tint text-success",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-[#FBE9E9] text-danger",
  info: "bg-info-tint text-info",
};
const SOLID: Record<Tone, string> = {
  neutral: "bg-muted text-white",
  brand: "bg-lime text-ink",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  info: "bg-info text-white",
};

export function Badge({ tone = "neutral", solid, children, className }: { tone?: Tone; solid?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-12 font-medium whitespace-nowrap ${solid ? SOLID[tone] : SOFT[tone]} ${className ?? ""}`}>
      {children}
    </span>
  );
}

// شارة العدد جوه التبويبات والقائمة الجانبية
export function CountPill({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`num inline-flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 text-12 font-medium ${active ? "bg-lime text-ink" : "bg-surface-2 text-ink"}`}>
      {children}
    </span>
  );
}
