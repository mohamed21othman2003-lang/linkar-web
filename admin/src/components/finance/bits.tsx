"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { ltrRuns } from "@/lib/format";

// قطع مشتركة لصفحات المالية: مستحقات المزوّدين (CON5-14) · المدفوعات والاستردادات (CON5-15) · الفواتير والقسائم (CON5-16)

export type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "neon" | "pending" | "ready";

/** شارة (Figma «Pill»): 24 · r999 · حشو 3·10 · 12 Medium */
const TONE: Record<Tone, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-[#fdf3e1] text-warning",
  danger: "bg-[#fbeaea] text-danger",
  info: "bg-info-tint text-info",
  neutral: "bg-surface-2 text-[#4a5550]",
  neon: "bg-lime text-ink",
  pending: "bg-pending-tint text-pending",
  /** «جاهز للتحويل» (CON5-14) */
  ready: "bg-[#e8f7e8] text-[#2a7d33]",
};
export function Pill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${TONE[tone]} ${className ?? ""}`}>{children}</span>;
}

/** زر دائري 32 بإطار r10 (Figma «Btn · التفاصيل») */
export function RoundBtn({ label, icon = "info", onClick, className }: { label: string; icon?: UiGlyph; onClick: () => void; /** «rounded-8!» لأزرار CON5-14 */ className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`flex size-8 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1 ${className ?? ""}`}>
      <Icon name={icon} size={16} />
    </button>
  );
}

/** خلية نص 13 Regular */
export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={`text-13 leading-5 font-normal text-ink ${className ?? ""}`}>{children}</span>;
}

/** عنوان عمود بسطرين («المبلغ⏎شامل الضريبة») */
export function Head2({ a, b }: { a: string; b: string }) {
  return (
    <span className="block leading-5">
      {a}
      <br />
      {b}
    </span>
  );
}

/** رأس الدرج الكحلي (r16 · حشو 16·18): السطر الأول 16 Bold أبيض + الشارة · السطور 13 Light #C9D1CD */
export function NavyHero({ title, pill, lines, gap = 6 }: { title: ReactNode; pill?: ReactNode; lines: ReactNode[]; gap?: 6 | 8 }) {
  return (
    <div className={`flex flex-col rounded-16 bg-ink px-[18px] py-4 ${gap === 8 ? "gap-2" : "gap-1.5"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-16 leading-6 font-bold text-white">{typeof title === "string" ? ltrRuns(title) : title}</p>
        {pill}
      </div>
      {lines.map((l, i) => (
        <p key={i} className="text-13 leading-5 font-light text-[#c9d1cd]">
          {typeof l === "string" ? ltrRuns(l) : l}
        </p>
      ))}
    </div>
  );
}

/** بطاقة بإطار r14: «card» = عنوان 13 SemiBold رمادي · حشو 14·16 · مسافة 4 — «tile» = عنوان 14 SemiBold · حشو 14 · مسافة 6 */
export function DCard({ title, variant = "card", children, className }: { title?: ReactNode; variant?: "card" | "tile"; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col rounded-14 border border-border bg-white ${variant === "card" ? "gap-1 px-4 py-3.5" : "gap-1.5 p-3.5"} ${className ?? ""}`}>
      {title ? <h3 className={variant === "card" ? "text-13 leading-5 font-semibold text-muted" : "text-14 leading-[22px] font-semibold text-ink"}>{title}</h3> : null}
      {children}
    </section>
  );
}

/** سطر «مفتاح … قيمة» 32: المفتاح 13 Light رمادي يمين والقيمة 13 Medium على الشمال (النص خام: ترتيب الاتجاه الطبيعي زي Figma «BK-21457 · PPF كامل…») */
export function DKV({ k, children, valueClassName }: { k: ReactNode; children: ReactNode; valueClassName?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className={`min-w-0 text-end font-medium ${valueClassName ?? "text-ink"}`}>{children}</span>
    </div>
  );
}

/** زر الذيل: ثانوي 46 بإطار / رئيسي 44 كحلي / مميز 44 أخضر — r12 · 14 Medium · أيقونة 16 */
export function FootBtn({ variant, icon, children, onClick, loading, className }: { variant: "secondary" | "primary" | "accent"; icon?: UiGlyph; children: ReactNode; onClick?: () => void; loading?: boolean; className?: string }) {
  const v = variant === "secondary" ? "h-[46px] border border-border bg-white text-ink hover:bg-surface-1" : variant === "primary" ? "h-11 bg-ink text-white hover:bg-ink/90" : "h-11 bg-lime text-ink hover:bg-lime/85";
  return (
    <button type="button" onClick={onClick} disabled={loading} aria-busy={loading || undefined} className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-12 px-4 text-14 font-medium whitespace-nowrap disabled:opacity-70 ${v} ${className ?? ""}`}>
      {children}
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon ? <Icon name={icon} size={16} /> : null}
    </button>
  );
}

/** زر «تصدير» في رأس الصفحة: ثانوي 46 · r12 · حشو 16 · أيقونة التنزيل 16 على الشمال */
export function ExportBtn({ onClick, label = "تصدير" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[46px] items-center gap-1.5 rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1">
      {label}
      <Icon name="download" size={16} />
    </button>
  );
}

/** ملاحظة تحذير (#FDF3E1 · r12 · حشو 12 · مسافة 8): النص 13 Light بني يمين والأيقونة 16 شمال */
export function WarnNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-12 bg-[#fdf3e1] p-3">
      <p className="min-w-0 flex-1 text-13 leading-[21px] font-light text-warning">{typeof children === "string" ? ltrRuns(children) : children}</p>
      <Icon name="alert" size={16} className="mt-[2.5px] shrink-0 text-warning" />
    </div>
  );
}

/** عمود الإجراءات في جداول DataTable: الزر على بداية العمود (يمين) زي Figma بدل نهايته */
export function StartCell({ width, children }: { width: number; children: ReactNode }) {
  return (
    <span className="flex justify-start" style={{ width }}>
      {children}
    </span>
  );
}

/** بطاقة رقم (نفس KpiCard · القسم 3.5) بس العنوان والسطر الفرعي سطر واحد بـ«…» — في Figma CON5-14 النصوص أطول من البطاقة */
export function FinKpi({ label, icon, value, hint, hintClassName, loading }: { label: string; icon: UiGlyph; value?: ReactNode; hint?: string; hintClassName?: string; loading?: boolean }) {
  return (
    <section className="flex min-w-0 flex-col gap-1.5 rounded-16 bg-white p-4">
      <div className="flex min-w-0 items-center gap-2">
        <h3 title={label} className="min-w-0 truncate text-14 font-medium text-ink">
          {label}
        </h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {loading ? <span className="my-2 block h-[30px] w-16 animate-pulse rounded-8 bg-surface-2" /> : <p className="num text-30 font-bold text-ink">{value}</p>}
      {hint ? (
        <p title={hint} className={`truncate text-13 leading-[22px] font-light ${hintClassName ?? "text-muted"}`}>
          {hint}
        </p>
      ) : null}
    </section>
  );
}
