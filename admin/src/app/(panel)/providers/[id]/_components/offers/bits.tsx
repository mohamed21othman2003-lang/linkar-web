"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { keepFocusQuiet } from "@/components/ui/focus";
import type { ProviderBranch } from "@/lib/api/profile";

// قطع مشتركة لنوافذ ودروج العروض والباقات (CON5-07M عرض جديد 3260-207383 · باقة جديدة 3260-207985 · CON5-07D 3312-197286 · 3312-213599)
// نفس قيم نافذة «إضافة خدمة» (ServiceForm) — منسوخة هنا عشان ملف الخدمات يفضل لوكيله.

/** النافذة الكبيرة 1240×840 · r20 · رأس ثابت (حشو 22·32·14 · عنوان 22 Bold + إغلاق 36) · محتوى بتمرير (حشو 4·32·24 · مسافة 16) · أزرار ثابتة تحت (حشو 16·32 · خط #E7EAE8) */
export function BigModal({ title, description, onClose, footer, children }: { title: string; description: string; onClose: () => void; footer: ReactNode; children: ReactNode }) {
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          dir="rtl"
          data-offer-form
          onOpenAutoFocus={keepFocusQuiet}
          className="fixed inset-0 z-50 flex flex-col bg-white focus:outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(840px,calc(100vh-32px))] sm:w-[min(1240px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]"
        >
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3.5 sm:px-8 sm:pt-[22px]">
            <Dialog.Title className="text-[22px] leading-[42px] font-bold text-ink">{title}</Dialog.Title>
            <Dialog.Description className="sr-only">{description}</Dialog.Description>
            <button type="button" onClick={onClose} aria-label="إغلاق" className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1">
              <Icon name="x" size={16} />
            </button>
          </div>
          <form onSubmit={(e) => e.preventDefault()} noValidate className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-1 pb-6 sm:px-8">
            {children}
          </form>
          <div className="flex flex-wrap items-center gap-2.5 border-t border-[#e7eae8] px-4 py-4 sm:px-8">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** بطاقة داخل النافذة: بيضا r16 · حشو 20 · مسافة 14 · عنوان 18/28 Bold */
export function SCard({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-3.5 rounded-16 bg-white p-0 sm:p-5 ${className ?? ""}`}>
      {title ? <h3 className="text-18 leading-7 font-bold text-ink">{title}</h3> : null}
      {children}
    </section>
  );
}

export const IN = "[&_input]:text-14! [&_input]:font-normal!";
export const SEL = "[&>span]:text-14! [&>span]:font-normal!";

/** شريحة اختيار 34 · r999 · حشو 6·12: المختارة #F7FBE9 بإطار كحلي + ✓ 14 و13 SemiBold · غير المختارة بيضا بإطار و13 Regular */
export function TagChip({ on, onClick, children, disabled }: { on: boolean; onClick?: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-13 leading-5 text-ink disabled:cursor-not-allowed ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white font-normal hover:bg-surface-1"}`}
    >
      {on ? <Icon name="check" size={14} className="shrink-0" /> : null}
      {children}
    </button>
  );
}

/** «كل الفروع» + فرع فرع — [] = كل الفروع */
export function BranchChips({ value, onChange, branches }: { value: string[]; onChange: (v: string[]) => void; branches: ProviderBranch[] }) {
  const all = !value.length || value.length >= branches.length;
  const toggle = (id: string) => {
    const cur = all ? [] : value;
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    onChange(next.length >= branches.length ? [] : next);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <TagChip on={all} onClick={() => onChange([])}>
        كل الفروع
      </TagChip>
      {branches.map((b) => (
        <TagChip key={b.id} on={!all && value.includes(b.id)} onClick={() => toggle(b.id)}>
          فرع {b.name}
        </TagChip>
      ))}
    </div>
  );
}

/** مفتاح v2 (44×24 · المقبض 20): شغّال كحلي بمقبض أخضر فاتح على الشمال · مطفي #D9DEDB بمقبض أبيض على اليمين */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "justify-end bg-ink" : "justify-start bg-border"}`}
    >
      <span aria-hidden className={`size-5 rounded-full ${checked ? "bg-lime" : "bg-white"}`} />
    </button>
  );
}
/** سطر المفتاح: العنوان 13 Medium يمين والمفتاح شمال (24 · مسافة 10) */
export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-13 leading-5 font-medium text-ink">{label}</span>
      <span className="flex-1" />
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

/** خيار راديو بكارت (49 · r12 · حشو 12·14): المختار #F7FBE9 بإطار كحلي 1.5 ودائرة بإطار 5 · 14 SemiBold — غير المختار أبيض بإطار ودائرة #B8C0BC 1.5 · 14 Medium */
export function RadioCard({ on, onClick, title, sub, name }: { on: boolean; onClick: () => void; title: string; sub?: string; name: string }) {
  return (
    <label className={`flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-12 px-3.5 py-3 ${on ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}>
      <input type="radio" name={name} checked={on} onChange={onClick} className="peer sr-only" />
      <span className="order-1 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-14 leading-[22px] text-ink ${on ? "font-semibold" : "font-medium"}`}>{title}</span>
        {sub ? <span className="text-12 leading-[18px] font-light text-muted">{sub}</span> : null}
      </span>
      {/* الدائرة على الشمال (طرف الكارت) والنص يملا الباقي زي Figma */}
      <span aria-hidden className={`order-2 mt-0.5 size-[18px] shrink-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
    </label>
  );
}

/** «مفتاح … قيمة» على عرض البطاقة: المفتاح 13 Light رمادي يمين والقيمة 13 Medium شمال (حشو 6 · مسافة 12) */
export function WideKV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

// ───────────── الدرج (CON5-07D): بطاقات r14 بإطار · حشو 14 · مسافة 6 · عنوان 14 SemiBold · صفوف 32: المفتاح 147 (13 Light رمادي) ثم القيمة 13 Medium ─────────────
export function DTile({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-14 border border-border p-3.5">
      <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </section>
  );
}
export function DKV({ k, children, nowrap }: { k: string; children: ReactNode; nowrap?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-13 leading-5 sm:gap-0">
      <dt className="w-[110px] shrink-0 font-light text-muted sm:w-[147px]">{k}</dt>
      <dd className={`min-w-0 flex-1 font-medium text-ink ${nowrap ? "sm:whitespace-nowrap" : ""}`}>{children}</dd>
    </div>
  );
}

/** الخلايا الملونة: هامش أقل من 15% = تنبيه (#FDF3E1 بنص #9A5B00) · محسوبة = #F4F6F5 بنص أخضر */
export const CELL_CALC = "bg-surface-1 text-success";
export const CELL_ALERT = "bg-[#fdf3e1] text-warning";
export const LOW_MARGIN = 15;
