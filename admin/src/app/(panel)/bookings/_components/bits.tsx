"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import type { PillKind } from "@/lib/api/bookings";
import { ltrRuns, num } from "@/lib/format";

// قطع صغيرة مشتركة بين شاشات الحجوزات (Figma v5 · 04 · الحجوزات 3114:33570)

// شارة الحالة: 24 · r999 · حشو 3·10 · 12 Medium
const PILL: Record<PillKind, string> = {
  linkar: "bg-info-tint text-info",
  visit: "bg-[#fdf3e1] text-warning",
  approval: "bg-[#fdf3e1] text-warning",
  cancelled: "bg-[#fbeaea] text-danger",
  approved: "bg-success-tint text-success",
  payment: "bg-surface-2 text-[#4a5550]",
};
export function StatusPill({ kind, children }: { kind: PillKind; children: ReactNode }) {
  return <span className={`inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-12 leading-[18px] font-medium whitespace-nowrap ${PILL[kind]}`}>{children}</span>;
}

/** خلية بسطرين: 13 SemiBold + 12 Light رمادي */
export function TwoLine({ top, bottom, ltrBottom }: { top: ReactNode; bottom?: ReactNode; ltrBottom?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-13 leading-5 font-semibold text-ink">{top}</span>
      {bottom ? (
        ltrBottom ? (
          <bdi dir="ltr" className="num block text-end text-12 leading-[18px] font-light text-muted">
            {bottom}
          </bdi>
        ) : (
          <span className="text-12 leading-[18px] font-light text-muted">{bottom}</span>
        )
      ) : null}
    </div>
  );
}

export const Plain = ({ children }: { children: ReactNode }) => <span className="num block text-13 leading-5 font-normal text-ink">{children}</span>;
export const Money = ({ v }: { v: number }) => <Plain>{num(v)}</Plain>;
export const Txt = ({ s }: { s: string }) => <>{ltrRuns(s)}</>;

/** زر أيقونة 32 r8 بإطار (التفاصيل) */
export function SquareBtn({ icon, label, onClick }: { icon: UiGlyph; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name={icon} size={16} />
    </button>
  );
}

/** زر ⋯ 32 دائري (Row menu) — في الحجوزات بيفتح نافذة الإجراءات CON5-04A */
export function DotsBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center gap-[3px] rounded-full border border-border bg-white hover:bg-surface-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1 rounded-full bg-ink" />
      ))}
    </button>
  );
}

/** «✓ راضٍ» / «✓ تم» — 13 Medium بعلامة 14 */
export function Done({ label, tone = "ok" }: { label: string; tone?: "ok" | "bad" }) {
  return (
    <span className={`flex h-[25px] items-center gap-1 text-13 font-medium ${tone === "ok" ? "text-[#3bb34b]" : "text-danger"}`}>
      {label}
      <Icon name="check" size={14} />
    </span>
  );
}

/** ترقيم الصفحات (CON5-04 3114:33571): 29×30 · r8 · 12 Medium · المختار كحلي — على الشمال */
export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const list: (number | "…")[] = [];
  const add = (n: number) => !list.includes(n) && n >= 1 && n <= pages && list.push(n);
  if (page <= 3) [1, 2, 3].forEach(add);
  else [1, page - 1, page, page + 1].forEach(add);
  if (pages > (list.at(-1) as number) + 1) list.push("…");
  add(pages);
  return (
    <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5 self-end">
      {list.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-2.5 text-center text-12 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`num flex h-[30px] min-w-[29px] items-center justify-center rounded-8 border border-border px-2.5 text-12 font-medium ${p === page ? "bg-ink text-white" : "bg-white text-ink hover:bg-surface-1"}`}
          >
            {num(p)}
          </button>
        ),
      )}
    </nav>
  );
}
