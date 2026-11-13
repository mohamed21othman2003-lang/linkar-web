import type { ComponentProps, ReactNode } from "react";

// Chip (القسم 3.5 · Figma components «Chip» 40:213): Default / Selected / Disabled · M (36 · حشو 14 · 14 Medium) / S (30 · حشو 12 · 12 Medium) · r999
export function Chip({
  selected,
  size = "M",
  icon,
  className,
  children,
  ...rest
}: { selected?: boolean; size?: "M" | "S"; icon?: ReactNode } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:border-surface-2 disabled:bg-surface-1 disabled:text-border-strong ${
        size === "S" ? "h-[30px] px-3 text-12" : "h-9 px-3.5 text-14"
      } ${selected ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:bg-surface-1"} ${className ?? ""}`}
    >
      {icon}
      {children}
    </button>
  );
}
