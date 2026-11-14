"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { REF_NAV, type RefSlug } from "@/lib/api/reference";

// قطع صفحات البيانات المرجعية (CON5-20 3114:74880)

/** «Ref nav» 250: أبيض r16 · حشو 14·10 · مسافة 2 · عناوين المجموعات 11 Medium رمادي · البنود 34 r10 (المختار كحلي 13 SemiBold أبيض) */
export function RefNav({ active }: { active: RefSlug }) {
  return (
    <nav aria-label="البيانات المرجعية" className="flex w-full shrink-0 flex-col gap-0.5 rounded-16 bg-white px-2.5 py-3.5 xl:w-[250px]">
      {REF_NAV.map((g) => (
        <div key={g.group} className="flex flex-col gap-0.5">
          <p className="px-2 pt-2.5 pb-1 text-[11px] leading-[18px] font-medium text-muted">{g.group}</p>
          {g.items.map((i) => {
            const on = i.slug === active;
            return (
              <Link
                key={i.slug}
                href={`/reference/${i.slug}`}
                aria-current={on ? "page" : undefined}
                className={`flex h-[34px] items-center rounded-10 px-2.5 text-13 ${on ? "bg-ink font-semibold text-white" : "text-ink hover:bg-surface-1"}`}
              >
                {i.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** لوحة المحتوى 866: أبيض r16 · حشو 20 · مسافة 14 */
export function Panel({ children }: { children: ReactNode }) {
  return <section className="flex w-full min-w-0 flex-1 flex-col gap-3.5 rounded-16 bg-white p-4 sm:p-5">{children}</section>;
}

/** رأس اللوحة: العنوان 22 Bold + سطر 13 Light + زر على الشمال */
export function PanelHead({ title, sub, action }: { title: ReactNode; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-[22px] leading-[34px] font-bold text-ink">{title}</h1>
        {sub ? <p className="text-13 leading-5 font-light text-muted">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** زر 32 بإطار r8 (تعديل ✎ · حذف 🗑 أحمر) */
export function SmallBtn({ icon, label, danger, onClick }: { icon: UiGlyph; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white hover:bg-surface-1 ${danger ? "text-danger" : "text-ink"}`}>
      <Icon name={icon} size={16} />
    </button>
  );
}

/** مفتاح 36×20 · المقبض 16 (Figma «Switch» داخل صفوف القوائم) */
export function MiniSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "justify-start bg-ink" : "justify-end bg-[#cfd6d3]"}`}
    >
      <span aria-hidden className="size-4 rounded-full bg-white" />
    </button>
  );
}

/** أيقونة التصنيف 40: مربع كحلي + رمز الخدمة أخضر (public/icons/service.svg) */
export function CategoryIcon({ icon }: { icon?: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center bg-ink text-lime">
      {icon ? (
        <svg width={24} height={24} viewBox="0 0 48 48" aria-hidden>
          <use href={`/icons/service.svg#${icon}`} />
        </svg>
      ) : (
        <Icon name="grid" size={20} />
      )}
    </span>
  );
}

/** صف الرأس الرمادي 34 · r10 · حشو 8 · 12 Medium رمادي */
export const HEAD_ROW = "flex items-center gap-2 rounded-10 bg-surface-1 p-2 text-12 leading-[18px] font-medium text-muted";
