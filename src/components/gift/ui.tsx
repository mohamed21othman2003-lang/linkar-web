import type { ReactNode } from "react";

// أزرار شاشات الرسائل والأعمال: 50px (px 22 · py 12) بخط Label L Medium — زي الفيجما بالظبط
// (Button المشترك بيحط font-bold، فالشاشات دي بتستخدم الكلاس ده).
export type ActionVariant = "primary" | "outline" | "dark" | "wallet";

const variants: Record<ActionVariant, string> = {
  primary: "bg-neon-green text-deep-charcoal hover:bg-bg-brand-hover active:bg-bg-brand-pressed",
  outline: "border border-border-default bg-white text-deep-charcoal hover:border-border-strong",
  dark: "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle",
  wallet: "bg-wallet-black text-white hover:bg-solid-black",
};

export function actionClass(variant: ActionVariant = "primary", className = "") {
  return `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-[22px] py-3 text-label-l transition-colors disabled:opacity-50 ${variants[variant]} ${className}`;
}

// شارة صغيرة (Chip): 30px، Label M
export function Chip({ tone, children }: { tone: "glass" | "neon" | "gray" | "info"; children: ReactNode }) {
  const tones = {
    glass: "bg-white/12 text-white",
    neon: "bg-neon-green text-deep-charcoal",
    gray: "bg-icon-tile text-deep-charcoal",
    info: "bg-chip-info-bg text-chip-info-fg",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-m ${tones[tone]}`}>{children}</span>;
}

// سطر «عنوان … قيمة» في كروت القسيمة
export function KvRow({ label, value, divided = false }: { label: string; value: ReactNode; divided?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${divided ? "border-t border-border-default pt-2" : ""}`}>
      <span className="shrink-0 text-body-s text-text-secondary">{label}</span>
      <span className="min-w-0 text-end text-label-m text-deep-charcoal">{value}</span>
    </div>
  );
}
