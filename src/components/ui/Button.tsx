import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Button (36:192) + أزرار V2: Primary = إجراء رئيسي واحد في الشاشة.
// hover = bg/brand-hover · pressed = bg/brand-pressed · focus = Focus/Ring (في globals.css)
type Variant = "primary" | "dark" | "light" | "ghost" | "outline" | "glass";
type Size = "lg" | "md" | "sm" | "pill";

const variants: Record<Variant, string> = {
  primary: "bg-neon-green text-deep-charcoal hover:bg-bg-brand-hover active:bg-bg-brand-pressed",
  dark: "bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle",
  light: "bg-v3-box-light text-deep-charcoal hover:bg-bg-muted",
  ghost: "text-deep-charcoal hover:bg-tile",
  outline: "border border-border-default bg-bg-surface text-deep-charcoal hover:border-border-strong",
  glass: "border border-neon-green/55 bg-hero-ink/35 text-white hover:bg-hero-ink/55",
};

// lg: 52 · md: 44 · sm: 36 (r12) — pill: 30 (كروت V3)
const sizes: Record<Size, string> = {
  lg: "h-control-lg rounded-md px-6 gap-2 text-label-l font-bold",
  md: "h-control-md rounded-md px-5 gap-2 text-label-m",
  sm: "h-control-sm rounded-md px-3.5 gap-1.5 text-label-m font-bold",
  pill: "h-[30px] rounded-full px-5 text-label-m font-bold",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function buttonClass({ variant = "primary", size = "lg", className = "" }: Omit<Common, "children">) {
  return `inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;
}

export function Button({ variant, size, className, children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type="button" className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}
