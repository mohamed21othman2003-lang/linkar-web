"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import type { MkTone } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";

// قطع صفحة المسوّقين (CON5-10 3114:10032) وأدراجها (CON5-10D/Q) ونوافذها (CON5-10M/A) وملف المسوّق (CON5-10P)

/** شارة الحالة S: 22 · r8 · حشو 1·8 · 12 Medium */
const TONE: Record<MkTone, string> = {
  success: "bg-success-tint text-success",
  danger: "bg-[#f8e9e9] text-danger",
  pending: "bg-pending-tint text-pending",
  warning: "bg-warning-tint text-[#9a6b00]",
  neutral: "bg-surface-2 text-ink",
  paid: "bg-ink text-lime",
};
export function MPill({ tone, children, className }: { tone: MkTone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex h-[22px] w-fit shrink-0 items-center rounded-8 px-2 text-12 leading-5 font-medium whitespace-nowrap ${TONE[tone]} ${className ?? ""}`}>{children}</span>;
}

/** شارة «بانتظار المراجعة / القرار» في بطاقة «بانتظار قرار لينكار»: 22 · r999 · حشو 3·10 · 11 Medium */
export function WaitPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-[22px] w-fit shrink-0 items-center rounded-full bg-[#fdf3e1] px-2.5 text-[11px] leading-4 font-medium whitespace-nowrap text-warning">{children}</span>;
}

/** بطاقة رقم بإطار: r16 · حشو 16 · العنوان 14 Medium + مربع أيقونة 32 · الرقم 30 Bold (26 في الملف) · السطر 13 Light */
export function KpiBox({ label, icon, value, hint, hintClass, small, loading }: { label: string; icon: UiGlyph; value?: ReactNode; hint?: ReactNode; hintClass?: string; small?: boolean; loading?: boolean }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-16 border border-border bg-white p-4 ${small ? "gap-1" : "gap-1.5"}`}>
      <div className="flex items-center gap-2">
        <h3 className={`min-w-0 text-14 leading-[22px] font-medium text-ink ${small ? "" : "flex-1"}`}>{label}</h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {loading || value == null ? (
        <span className={`${small ? "my-1.5 h-[30px]" : "my-2 h-[30px]"} w-20 animate-pulse rounded-8 bg-surface-2`} />
      ) : (
        <p className={`num font-bold text-ink ${small ? "text-[26px] leading-10" : "text-30 leading-[46px]"}`}>{value}</p>
      )}
      <p className={`text-13 leading-[22px] font-light ${hintClass ?? "text-muted"}`}>{hint ? ltrRuns(String(hint)) : " "}</p>
    </section>
  );
}

/** زر صف S: 32 · r8 · حشو 6·12 · 12 Medium (كحلي أو أبيض بإطار — «إيقاف» نصه أحمر) */
export function RowBtn({ children, primary, danger, onClick, loading }: { children: ReactNode; primary?: boolean; danger?: boolean; onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 px-3 text-12 font-medium whitespace-nowrap ${primary ? "bg-ink text-white hover:bg-ink/90" : `border border-border bg-white hover:bg-surface-1 ${danger ? "text-danger" : "text-ink"}`}`}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** زر «التفاصيل» 34×32 · r8 بإطار · أيقونة info 18 */
export function InfoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name="info" size={18} />
    </button>
  );
}

/** خلية بسطرين: 13 Medium ثم 12 Medium رمادي */
export function Two({ top, sub, topClass, subClass }: { top: ReactNode; sub?: ReactNode; topClass?: string; subClass?: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className={`text-13 leading-[22px] font-medium ${topClass ?? "text-ink"}`}>{top}</span>
      {sub ? <span className={`text-12 leading-5 font-medium ${subClass ?? "text-muted"}`}>{sub}</span> : null}
    </div>
  );
}

/** ترقيم: أزرار 32 · r8 · مسافة 6 (المختار كحلي) على الشمال + نص 13 Light رمادي على اليمين */
export function Pager({ page, pages, onPage, max, label }: { page: number; pages: number; onPage: (p: number) => void; max: number; label: ReactNode }) {
  const n = Math.min(max, pages);
  const start = Math.max(1, Math.min(page - Math.floor(n / 2), pages - n + 1));
  const list = Array.from({ length: n }, (_, i) => start + i);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-13 leading-5 font-light text-muted">{label}</span>
      {pages > 1 ? (
        <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
          {list.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${p === page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
            >
              {num(p)}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

// ───────────── الأدراج ─────────────

/** رأس كحلي: a = r18 · عنوان 18 Bold · سطر أبيض · أيقونة r14 — b = r16 · عنوان 17 Bold · سطر #C9D1CD · أيقونة r12 */
export function Hero({ icon, title, sub, pill, b }: { icon: UiGlyph; title?: ReactNode; sub?: ReactNode; pill?: ReactNode; b?: boolean }) {
  return (
    <div className={`flex items-center gap-3.5 bg-ink p-[18px] ${b ? "rounded-16" : "rounded-[18px]"}`}>
      <span className={`flex size-12 shrink-0 items-center justify-center bg-lime text-ink ${b ? "rounded-12" : "rounded-14"}`}>
        <Icon name={icon} size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className={`font-bold text-white ${b ? "text-[17px] leading-7" : "text-18 leading-[30px]"}`}>{title}</p> : null}
        {sub ? <p className={`text-13 leading-[22px] font-light ${b ? "text-[#c9d1cd]" : "text-white"}`}>{sub}</p> : null}
      </div>
      {pill}
    </div>
  );
}

/** بلوك: a = r14 · مسافة 8 · سطور 22 — b = خلفية بيضا r12 · مسافة 6 · سطور 32 */
export function MTile({ title, b, children }: { title: ReactNode; b?: boolean; children: ReactNode }) {
  return (
    <section className={`flex flex-col border border-border bg-white p-3.5 ${b ? "gap-1.5 rounded-12" : "gap-2 rounded-14"}`}>
      <h3 className="text-12 leading-5 font-medium text-muted">{title}</h3>
      {children}
    </section>
  );
}
export function MKV({ k, b, children, valueClass }: { k: ReactNode; b?: boolean; children: ReactNode; valueClass?: string }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-13 leading-[22px] ${b ? "py-[5px]" : ""}`}>
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className={`min-w-0 text-end font-medium ${valueClass ?? "text-ink"}`}>{children}</span>
    </div>
  );
}

/** ملاحظة ملوّنة r12 · حشو 12 · أيقونة 18 على اليمين */
const NOTE = { warning: "bg-pending-tint text-pending", danger: "bg-[#f8e9e9] text-danger", success: "bg-success-tint text-success", info: "bg-info-tint text-info", neutral: "bg-surface-1 text-ink" };
export function MNote({ tone, icon, children }: { tone: keyof typeof NOTE; icon: UiGlyph; children: ReactNode }) {
  return (
    <p className={`flex items-start gap-2 rounded-12 p-3 text-13 leading-[22px] font-light ${NOTE[tone]}`}>
      <Icon name={icon} size={18} className="mt-0.5 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
    </p>
  );
}

/** صف مستند: خلفية #F4F6F5 r10 · حشو 10·12 · أيقونة ملف 32 + نص + شارة + «عرض» */
export function DocRow({ title, sub, pill, onView }: { title: string; sub?: string; pill: ReactNode; onView?: () => void }) {
  return (
    <div className="flex items-center gap-2.5 rounded-10 bg-surface-1 px-3 py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-white text-ink">
        <Icon name="file" size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-13 leading-[22px] font-medium text-ink">{title}</span>
        {sub ? <span className="truncate text-12 leading-5 font-medium text-muted">{ltrRuns(sub)}</span> : null}
      </span>
      {pill}
      {onView ? (
        <button type="button" onClick={onView} className="flex h-5 shrink-0 items-center gap-1.5 text-12 leading-5 font-medium text-ink hover:underline">
          عرض
          <Icon name="download" size={14} />
        </button>
      ) : null}
    </div>
  );
}

/** مربع اختيار 20 r6 (كحلي بعلامة ✓ لما يتحدد) + نص 13 Medium */
export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-13 leading-[22px] font-medium text-ink">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${checked ? "bg-ink text-white" : "border border-border-strong bg-white"}`}>
        {checked ? <Icon name="check" size={14} /> : null}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
