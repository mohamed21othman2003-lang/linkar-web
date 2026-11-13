import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Spinner } from "./Spinner";

// Button (القسم 3.5): رئيسي داكن · مميز أخضر فاتح · ثانوي أبيض بإطار · خطر أحمر · رابط — L / M / S
export type ButtonVariant = "primary" | "accent" | "secondary" | "danger" | "danger-outline" | "ghost" | "link";
export type ButtonSize = "L" | "M" | "S";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink/90 disabled:bg-border-strong",
  accent: "bg-lime text-ink hover:bg-lime/85 disabled:bg-border disabled:text-muted",
  secondary: "border border-border bg-white text-ink hover:bg-surface-1 disabled:text-border-strong",
  danger: "bg-danger-strong text-white hover:bg-danger-strong/90 disabled:bg-border-strong",
  "danger-outline": "border border-border bg-white text-danger hover:bg-surface-1",
  ghost: "text-ink hover:bg-surface-2",
  link: "text-success underline-offset-4 hover:underline",
};

// من Figma: L = زر صفحات الدخول (52 / r12 / 16 Medium · 3114:28801) · M = أزرار النوافذ والصفحات (48 / r12 / 14 Medium · 3114:28715)
// S = أزرار الصفوف والبطاقات (32 / r8 / حشو 6·12 / 12 Medium · 3114:28658)
const SIZE: Record<ButtonSize, string> = {
  L: "h-[52px] rounded-12 px-6 text-16 font-medium",
  M: "h-12 rounded-12 px-4 text-14 font-medium",
  S: "h-8 rounded-8 px-3 text-12 font-medium",
};

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  const base = "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap transition-colors disabled:cursor-not-allowed";
  return `${base} ${variant === "link" ? "text-13 font-medium" : SIZE[size]} ${VARIANT[variant]} ${className ?? ""}`;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; loading?: boolean };

export function Button({ variant = "primary", size = "M", icon, loading, className, children, disabled, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button type="button" {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={classes(variant, size, className)}>
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "M", icon, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={classes(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({ label, className, children, ...rest }: { label: string } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
