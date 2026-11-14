"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import type { HeroTone, TypeTone } from "@/lib/api/requests";

// قطع صفحة الطلبات (CON5-03 3114:29233) وأدراجها (CON5-03D)

/** شارة النوع في الجدول (Figma «Pill»): 24 · r999 · حشو 3·10 · 12 Medium */
const TYPE_TONE: Record<TypeTone, string> = {
  danger: "bg-[#fbeaea] text-danger",
  warning: "bg-[#fdf3e1] text-warning",
  info: "bg-info-tint text-info",
  neutral: "bg-surface-2 text-[#4a5550]",
};
export function TypePill({ tone, children }: { tone: TypeTone; children: ReactNode }) {
  return <span className={`inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${TYPE_TONE[tone]}`}>{children}</span>;
}

/** شارة حالة الطلب جوه رأس الدرج: الجديد r999 (24 · حشو 3·10) — القديم S r8 (22 · حشو 1·8) */
const HERO_TONE: Record<HeroTone, string> = {
  review: "bg-[#fdf3e1] text-warning",
  neon: "bg-lime text-ink",
  info: "bg-info-tint text-info",
  approved: "bg-success-tint text-success",
  pending: "bg-pending-tint text-pending",
  rejected: "bg-[#fbeaea] text-danger",
};
export function HeroPill({ tone, small, children }: { tone: HeroTone; small?: boolean; children: ReactNode }) {
  return (
    <span className={`inline-flex w-fit shrink-0 items-center text-12 font-medium whitespace-nowrap ${small ? "h-[22px] rounded-8 px-2 leading-5" : "h-6 rounded-full px-2.5 leading-[18px]"} ${HERO_TONE[tone]}`}>
      {children}
    </span>
  );
}

/** شرائح الحالة (Figma «Chips · الحالة»): 31 · r14 · حشو 4·12 · 12 Medium · #F1F3F2 والمختارة كحلي بنص أبيض */
export function StatusChips<K extends string>({ items, value, onChange }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void }) {
  return (
    <div role="tablist" aria-label="حالة الطلب" className="flex flex-wrap items-center gap-2">
      {items.map((c) => {
        const on = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.key)}
            className={`h-[31px] rounded-14 px-3 text-12 leading-[23px] font-medium whitespace-nowrap ${on ? "bg-ink text-white" : "bg-[#f1f3f2] text-ink hover:bg-surface-2"}`}
          >
            {c.label}
            {c.count != null ? ` · ${c.count}` : ""}
          </button>
        );
      })}
    </div>
  );
}

/** زر دائري 32 بإطار (Figma «Btn · التفاصيل») */
export function RoundBtn({ label, icon, onClick }: { label: string; icon: UiGlyph; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name={icon} size={16} />
    </button>
  );
}

// ───────────── الدرج الجديد ─────────────

/** بطاقة بإطار r14 · حشو 14 مسافة 6 (أو 12·14 مسافة 4) · عنوان 14 SemiBold */
export function RTile({ title, dense, children }: { title?: ReactNode; dense?: boolean; children: ReactNode }) {
  return (
    <section className={`flex flex-col rounded-14 border border-border bg-white ${dense ? "gap-1 px-3.5 py-3" : "gap-1.5 p-3.5"}`}>
      {title ? <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3> : null}
      {children}
    </section>
  );
}

/** سطر «مفتاح … قيمة» 32 (حشو 6) أو 30 (حشو 5): المفتاح 13 Light رمادي يمين والقيمة 13 Medium على الشمال */
export function RKV({ k, dense, children }: { k: ReactNode; dense?: boolean; children: ReactNode }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-13 leading-5 ${dense ? "py-[5px]" : "py-1.5"}`}>
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

/** رابط بإطار 46 · r12 · حشو 12·14: النص 13 Medium يمين والسهم 16 شمال */
export function LinkRow({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[46px] items-center gap-2 rounded-12 border border-border bg-white px-3.5 py-3 text-start hover:bg-surface-1">
      <span className="min-w-0 flex-1 text-13 leading-5 font-medium text-ink">{children}</span>
      <Icon name="chevron-left" size={16} className="shrink-0 text-ink" />
    </button>
  );
}

/** حقل 42 · r10 · حشو 12 · نص 14 Regular (+ أيقونة التقويم على الشمال) */
export const FIELD = "flex h-[42px] items-center gap-2 rounded-10 border border-border bg-white px-3 text-14 leading-[22px] text-ink";
