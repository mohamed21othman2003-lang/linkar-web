"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import type { CenterTone, Tier, VisitTone } from "@/lib/api/field-evaluation";
import { TIERS } from "@/lib/api/field-evaluation";

// قطع قسم التقييم الميداني (Figma «v5 · 17» 3114:62126) — مشتركة بين الزيارات والتصنيف والتقييم العملي

/** شارة صف الزيارة (24 · r999 · حشو 2·10 · 12 Medium): مجدولة #E7F0F8/#2B5C8A · بانتظار القرار #FDF3E1/#9A5B00 · مكتملة #EAF7EC/#3A6932 */
const VISIT_TONE: Record<VisitTone, string> = {
  info: "bg-info-tint text-info",
  warning: "bg-[#fdf3e1] text-warning",
  success: "bg-success-tint text-success",
};
export function VisitPill({ tone, children }: { tone: VisitTone; children: ReactNode }) {
  return <span className={`inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-12 leading-5 font-medium whitespace-nowrap ${VISIT_TONE[tone]}`}>{children}</span>;
}

/** شارة الحالة S (22 · r8 · حشو 1·8 · 12 Medium) في جدول التصنيف والأدراج */
const CENTER_TONE: Record<CenterTone, string> = {
  neutral: "bg-surface-2 text-ink",
  pending: "bg-pending-tint text-pending",
  trial: "bg-info-tint text-[#2b5f8e]",
  success: "bg-success-tint text-success",
  danger: "bg-[#f8e9e9] text-danger",
  navy: "bg-ink text-lime",
  tier: "bg-warning-tint text-[#9a6b00]",
};
export function SPill({ tone, children }: { tone: CenterTone; children: ReactNode }) {
  return <span className={`inline-flex h-[22px] w-fit shrink-0 items-center rounded-8 px-2 text-12 leading-5 font-medium whitespace-nowrap ${CENTER_TONE[tone]}`}>{children}</span>;
}

/** دائرة حرف التصنيف (S · G · P): 40 في صف التصنيفات و20 في الجدول */
const TIER_TONE: Record<Tier, string> = {
  silver: "bg-[#eef0f1] text-[#5f6b73]",
  gold: "bg-warning-tint text-[#9a6b00]",
  platinum: "bg-[#e9eef2] text-[#5b6b78]",
};
export function TierBadge({ tier, big }: { tier: Tier; big?: boolean }) {
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full ${big ? "size-10 text-18 font-bold" : "size-5 text-12 leading-5 font-medium"} ${TIER_TONE[tier]}`}>
      {TIERS[tier].letter}
    </span>
  );
}

/** بطاقة بإطار r14 · حشو 14·16 · مسافة 4 · عنوان 13 SemiBold رمادي (أدراج الزيارة) — أو 12 Medium وحشو 14 ومسافة 8 (أدراج المراكز) */
export function Card({ title, children, center }: { title: ReactNode; children: ReactNode; center?: boolean }) {
  return (
    <section className={`flex flex-col rounded-14 border border-border bg-white ${center ? "gap-2 p-3.5" : "gap-1 px-4 py-3.5"}`}>
      <h3 className={center ? "text-12 leading-5 font-medium text-muted" : "text-13 leading-[22px] font-semibold text-muted"}>{title}</h3>
      {children}
    </section>
  );
}

/** «مفتاح … قيمة»: المفتاح 13 Light رمادي يمين والقيمة 13 Medium شمال (سطر 32 في أدراج الزيارة · 22 في أدراج المراكز) */
export function KV({ k, children, tone, tight }: { k: ReactNode; children: ReactNode; tone?: "success" | "danger"; tight?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-13 leading-[22px] ${tight ? "" : "py-[5px]"}`}>
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className={`min-w-0 text-end font-medium ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-ink"}`}>{children}</span>
    </div>
  );
}

/** ملاحظة بأيقونة على الطرف الشمال (أدراج ونوافذ الزيارة: [أيقونة، نص] في Figma) — r12 · حشو 12 · مسافة 8 · 13 Light */
const NOTE_TONE = {
  info: "bg-info-tint text-ink",
  success: "bg-success-tint text-success",
  pending: "bg-pending-tint text-pending",
  trial: "bg-info-tint text-[#2b5f8e]",
  danger: "bg-[#f8e9e9] text-danger",
  neutral: "bg-surface-1 text-ink",
};
export function EndNote({ tone = "info", icon = "info", start, children }: { tone?: keyof typeof NOTE_TONE; icon?: UiGlyph; /** الأيقونة يمين (قبل النص) */ start?: boolean; children: ReactNode }) {
  return (
    <div className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[22px] font-light ${NOTE_TONE[tone]}`}>
      {start ? <Icon name={icon} size={16} className="mt-[3px] shrink-0 text-ink" /> : null}
      <p className="min-w-0 flex-1">{children}</p>
      {start ? null : <Icon name={icon} size={16} className="mt-[3px] shrink-0 text-ink" />}
    </div>
  );
}

/** خيار راديو بإطار (r12 · حشو 12): الدائرة 20 يمين والنص بعدها — المختار إطار كحلي ونقطة 10 */
export function RadioCard({ title, sub, checked, onSelect }: { title: string; sub?: string; checked: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-12 border bg-white p-3 text-start ${checked ? "border-ink" : "border-border hover:bg-surface-1"}`}
    >
      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${checked ? "border-ink" : "border-border"}`}>{checked ? <span className="size-2.5 rounded-full bg-ink" /> : null}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-13 leading-[22px] font-medium text-ink">{title}</span>
        {sub ? <span className="text-12 leading-5 font-medium text-muted">{sub}</span> : null}
      </span>
    </button>
  );
}

/** شريحة اختيار (24 · r999 · حشو 2·10 · 12 Medium): المختارة كحلي بنص أبيض — الباقي #EEF1EF بنص #4A5550 · القوالب أزرق فاتح */
export function ChoiceChip({ on, info, onClick, children }: { on?: boolean; info?: boolean; onClick?: () => void; children: ReactNode }) {
  const cls = `inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-12 leading-5 font-medium whitespace-nowrap ${info ? "bg-info-tint text-info" : on ? "bg-ink text-white" : "bg-surface-2 text-[#4a5550] hover:bg-border"}`;
  return onClick ? (
    <button type="button" role="radio" aria-checked={!!on} onClick={onClick} className={cls}>
      {children}
    </button>
  ) : (
    <span className={cls}>{children}</span>
  );
}

/** زر نصي بسهم (عمود «فتح النموذج» / «النتيجة»): 13 Medium + سهم 16 شمال */
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-5 items-center gap-1 text-13 leading-5 font-medium whitespace-nowrap text-ink hover:underline">
      {children}
      <Icon name="chevron-left" size={16} className="shrink-0" />
    </button>
  );
}

/** زر دائري 34×32 بإطار (التفاصيل) */
export function InfoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name="info" size={16} />
    </button>
  );
}

/** حقل نص طويل 72 · r10 · حشو 10·12 · 14 Regular */
export function Area({ id, value, onChange, invalid, h = 72, medium }: { id?: string; value: string; onChange: (v: string) => void; invalid?: boolean; h?: number; medium?: boolean }) {
  return (
    <textarea
      id={id}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      style={{ height: h }}
      className={`w-full resize-none rounded-10 border bg-white px-3 pt-2.5 outline-none focus:border-[1.5px] focus:border-ink ${medium ? "text-13 leading-[22px] font-medium" : "text-14 leading-6 font-normal"} text-ink ${invalid ? "border-danger" : "border-border"}`}
    />
  );
}

/** عنوان حقل 12 Medium رمادي + رسالة الخطأ تحت */
export function FieldShell({ label, id, error, hint, children }: { label: string; id?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-12 leading-5 font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-12 leading-5 font-medium text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** كلاس قوائم النوافذ: 42 · r10 · حشو 12 · 14 Regular (الأصل 44 · 13 Medium) */
export const SEL42 = "h-[42px]! text-14! [&>span]:font-normal!";
