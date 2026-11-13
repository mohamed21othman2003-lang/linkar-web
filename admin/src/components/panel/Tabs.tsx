"use client";

import Link from "next/link";
import { num } from "@/lib/format";

// تبويبات + شارة عدد (القسم 3.5 «Tabs + Count»). شكلين في Figma:
// underline = تبويبات بخط تحت (CON5-23 3114:24841): حشو 10·14·12 · 14 Medium · المختار كحلي بخط 3 والباقي رمادي · فاصل سفلي #D9DEDB
// pill      = أزرار (CON5-07 3114:48542): 40 · r10 · حشو 8·14 · المختار كحلي بنص أبيض SemiBold وشارة خضراء
export type TabItem<K extends string = string> = { key: K; label: string; count?: number; href?: string };

export function Tabs<K extends string>({
  items,
  value,
  onChange,
  variant = "underline",
  label = "التبويبات",
  className,
}: {
  items: readonly TabItem<K>[];
  value: K;
  onChange?: (k: K) => void;
  variant?: "underline" | "pill";
  label?: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={`flex ${variant === "underline" ? "items-end gap-1 border-b border-border" : "flex-wrap items-center gap-2"} ${className ?? ""}`}>
      {items.map((t) => {
        const active = t.key === value;
        const cls =
          variant === "underline"
            ? `-mb-px flex items-center gap-1.5 px-3.5 pt-2.5 text-14 font-medium ${active ? "border-b-[3px] border-ink pb-3 text-ink" : "pb-3 text-muted hover:text-ink"}`
            : `flex h-10 items-center gap-1.5 rounded-10 px-3.5 text-14 ${active ? "bg-ink font-semibold text-white" : "border border-border bg-white font-medium text-ink hover:bg-surface-1"}`;
        const content = (
          <>
            <span>{t.label}</span>
            {t.count != null ? <Count active={active} variant={variant} n={t.count} /> : null}
          </>
        );
        return t.href ? (
          <Link key={t.key} href={t.href} role="tab" aria-selected={active} className={cls} replace>
            {content}
          </Link>
        ) : (
          <button key={t.key} type="button" role="tab" aria-selected={active} className={cls} onClick={() => onChange?.(t.key)}>
            {content}
          </button>
        );
      })}
    </div>
  );
}

function Count({ n, active, variant }: { n: number; active: boolean; variant: "underline" | "pill" }) {
  const tone = variant === "underline" ? (active ? "bg-ink text-lime" : "bg-surface-2 text-ink") : active ? "bg-lime text-ink" : "bg-surface-2 text-ink";
  return <span className={`num inline-flex h-5 min-w-[21px] items-center justify-center rounded-full px-[7px] text-12 ${variant === "pill" ? "font-semibold" : "font-medium"} ${tone}`}>{num(n)}</span>;
}
