"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { ltrRuns, num } from "@/lib/format";

// قطع صغيرة مشتركة بين شاشات العملاء (Figma v5 · 05 · العملاء 3114:16053)

/** مربع اختيار 18 · r5 · إطار 1.5 #B8C0BC — المختار كحلي بعلامة ✓ 14 بيضا، والجزئي (رأس الجدول) شَرطة بيضا */
export function Checkbox({ checked, indeterminate, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; label: string }) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${on ? "border-ink bg-ink text-white" : "border-border-strong bg-white hover:border-ink"}`}
    >
      {checked ? <Icon name="check" size={14} /> : indeterminate ? <span className="h-0.5 w-2 rounded-full bg-white" /> : null}
    </button>
  );
}

/** خلية بسطرين: 13/20 SemiBold + 12/18 Light رمادي */
export function TwoLine({ top, bottom, ltrBottom }: { top: ReactNode; bottom?: ReactNode; ltrBottom?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-13 leading-5 font-semibold text-ink">{typeof top === "string" ? ltrRuns(top) : top}</span>
      {bottom ? (
        ltrBottom ? (
          <bdi dir="ltr" className="num block text-end text-12 leading-[18px] font-light text-muted">
            {bottom}
          </bdi>
        ) : (
          <span className="text-12 leading-[18px] font-light text-muted">{typeof bottom === "string" ? ltrRuns(bottom) : bottom}</span>
        )
      ) : null}
    </div>
  );
}

export const Plain = ({ children }: { children: ReactNode }) => <span className="num block text-13 leading-5 font-normal text-ink">{children}</span>;

/** ترقيم (CON5-05 3114:16054): «عرض 1–10 من 18,420» يمين · أزرار 32 r8 13 Medium على الشمال (المختار كحلي) */
export function Pager({ page, pages, from, to, total, onPage, forceOne }: { page: number; pages: number; from: number; to: number; total: number; onPage: (p: number) => void; forceOne?: boolean }) {
  const shown = Math.min(5, pages);
  const start = Math.max(1, Math.min(page - 2, pages - shown + 1));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      <p className="num text-13 leading-5 font-light text-muted">{total ? `عرض ${num(from)}–${num(to)} من ${num(total)}` : ""}</p>
      {shown > 1 || (forceOne && shown === 1) ? (
        <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
          {Array.from({ length: shown }, (_, i) => start + i).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`num flex size-8 items-center justify-center rounded-8 text-13 font-medium ${p === page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
            >
              {num(p)}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

/** «3 عملاء محددون» بصيغة العدد العربية */
export function selectedLabel(n: number) {
  if (n === 1) return "عميل واحد محدد";
  if (n === 2) return "عميلان محددان";
  if (n <= 10) return `${num(n)} عملاء محددون`;
  return `${num(n)} عميلاً محدداً`;
}

/** شريط أزرق للمعلومة (Note): r12 · حشو 12 · 13/21 Light كحلي · أيقونة info 16 على الشمال (زي Figma) */
export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 leading-[21px] font-light text-ink ${className ?? ""}`}>
      <span className="min-w-0 flex-1">{children}</span>
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
    </p>
  );
}

// بطاقة شريحة (CON5-05 · Segments): 275×100 · r16 · حشو 14·16 · مسافة 2 · العنوان 14 Medium + أيقونة 28 r8 · الرقم 26/40 Bold
// المختارة كحلي: النص أبيض والأيقونة على #24414F بلون أخضر فاتح
export function SegmentCard({ label, icon, value, active, onClick }: { label: string; icon: UiGlyph; value: number | undefined; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[100px] flex-col gap-0.5 rounded-16 border px-4 py-3.5 text-start ${active ? "border-ink bg-ink text-white" : "border-border bg-white text-ink hover:bg-surface-1"}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-14 leading-[22px] font-medium">{label}</span>
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-8 ${active ? "bg-[#24414f] text-lime" : "bg-surface-2 text-ink"}`}>
          <Icon name={icon} size={16} />
        </span>
      </span>
      {value == null ? <Skeleton className="my-2 h-6 w-16" /> : <span className="num text-[26px] leading-10 font-bold">{num(value)}</span>}
    </button>
  );
}
