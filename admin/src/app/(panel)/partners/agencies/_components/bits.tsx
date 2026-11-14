"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import type { AgTone } from "@/lib/api/agencies";
import { num } from "@/lib/format";

// قطع صفحة الوكالات (CON5-09 3114:2150) وأدراجها (CON5-09D) ونوافذها (CON5-09M)

/** شارة الحالة S: 22 · r8 · حشو 1·8 · 12 Medium */
const TONE: Record<AgTone, string> = {
  success: "bg-success-tint text-success",
  danger: "bg-[#f8e9e9] text-danger",
  pending: "bg-pending-tint text-pending",
  info: "bg-info-tint text-info",
  neutral: "bg-surface-2 text-ink",
};
export function APill({ tone, children, className }: { tone: AgTone; children: ReactNode; className?: string }) {
  return <span className={`inline-flex h-[22px] w-fit shrink-0 items-center rounded-8 px-2 text-12 leading-5 font-medium whitespace-nowrap ${TONE[tone]} ${className ?? ""}`}>{children}</span>;
}

/** شارة «بانتظار المراجعة / القرار» في بطاقة الطلبات: 22 · r20 · حشو 3·10 · 11 Medium */
export function WaitPill({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-[22px] w-fit shrink-0 items-center rounded-full bg-[#fdf3e1] px-2.5 text-[11px] leading-4 font-medium whitespace-nowrap text-warning">{children}</span>;
}

/** بطاقة رقم (KPI) بإطار: r16 · حشو 16 · مسافة 6 — العنوان 14 Medium ومربع أيقونة 32 · الرقم 30 Bold · السطر 13 Light */
export function KpiB({ label, icon, value, hint, danger, loading }: { label: string; icon: UiGlyph; value?: number; hint?: string; danger?: boolean; loading?: boolean }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-16 border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 text-14 leading-[22px] font-medium text-ink">{label}</h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {loading || value == null ? <span className="my-2 h-[30px] w-20 animate-pulse rounded-8 bg-surface-2" /> : <p className="num text-30 leading-[46px] font-bold text-ink">{num(value)}</p>}
      <p className={`text-13 leading-[22px] font-light ${danger ? "text-danger" : "text-muted"}`}>{hint ?? " "}</p>
    </section>
  );
}

/** زر صف S: 32 · r8 · حشو 6·12 · 12 Medium (كحلي أو أبيض بإطار) */
export function RowBtn({ children, primary, onClick, loading }: { children: ReactNode; primary?: boolean; onClick: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 px-3 text-12 font-medium whitespace-nowrap ${primary ? "bg-ink text-white hover:bg-ink/90" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** زر «التفاصيل» 34×32 · r8 بإطار · أيقونة info 18 */
export function InfoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title="التفاصيل" onClick={onClick} className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name="info" size={18} />
    </button>
  );
}

/** خلية سطرين: 13 Medium + 12 Medium رمادي */
export function Two({ a, b, bClass }: { a: ReactNode; b?: ReactNode; bClass?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-13 leading-[22px] font-medium text-ink">{a}</span>
      {b ? <span className={`text-12 leading-5 font-medium ${bClass ?? "text-muted"}`}>{b}</span> : null}
    </div>
  );
}

/** ترقيم الصفحات (Figma «Pagination»): أزرار 32 · r8 · 12 Medium — والنص 13 Light رمادي على اليمين */
export function Pager({ page, pages, onPage, text }: { page: number; pages: number; onPage: (p: number) => void; text?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-13 leading-5 font-light text-muted">{text}</p>
      {pages > 1 ? (
        <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${p === page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
            >
              {p}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

// ───────────── الأدراج ─────────────

/** رأس الدرج الكحلي: r18 (r16 في درج الطلب) · حشو 18 · أيقونة 48 خضراء على اليسار والشارة على اليمين */
export function Hero({ icon, title, sub, pill, radius = 18, subClass }: { icon: UiGlyph; title?: ReactNode; sub: ReactNode; pill: ReactNode; radius?: 16 | 18; subClass?: string }) {
  return (
    <div className={`flex items-center gap-3.5 bg-ink p-[18px] ${radius === 16 ? "rounded-16" : "rounded-[18px]"}`}>
      <span className={`flex size-12 shrink-0 items-center justify-center bg-lime text-ink ${radius === 16 ? "rounded-12" : "rounded-14"}`}>
        <Icon name={icon} size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className={`font-bold text-white ${radius === 16 ? "text-[17px] leading-7" : "text-18 leading-[30px]"}`}>{title}</p> : null}
        <p className={`text-13 leading-[22px] font-light ${subClass ?? "text-white/70"}`}>{sub}</p>
      </div>
      {pill}
    </div>
  );
}

/** صف الإحصاءات: مربعات #F4F6F5 r12 · حشو 12 — الرقم 18 Bold والعنوان 12 Medium رمادي */
export function Stats({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((s, i) => (
        <div key={i} className="flex flex-col rounded-12 bg-surface-1 p-3">
          <span className="num text-18 leading-[30px] font-bold text-ink">{s.value}</span>
          <span className="text-12 leading-5 font-medium whitespace-pre-line text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/** بطاقة بإطار r14 (r12) · حشو 14 · عنوان 12 Medium رمادي */
export function DTile({ title, children, gap = 8, r12 }: { title: ReactNode; children: ReactNode; gap?: 6 | 8; r12?: boolean }) {
  return (
    <section className={`flex flex-col border border-border bg-white p-3.5 ${r12 ? "rounded-12" : "rounded-14"} ${gap === 6 ? "gap-1.5" : "gap-2"}`}>
      <h3 className="text-12 leading-5 font-medium text-muted">{title}</h3>
      {children}
    </section>
  );
}

/** مفتاح/قيمة: المفتاح 13 Light رمادي يمين والقيمة 13 Medium شمال — 22 (أو 32 بحشو 6 · pad) */
export function DKV({ k, children, pad }: { k: ReactNode; children: ReactNode; pad?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-3 text-13 leading-[22px] ${pad ? "py-[5px]" : ""}`}>
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

/** بطاقة رقم أصغر في ملف الوكالة (CON5-09P): مسافة 4 · الرقم 26 Bold */
export function KpiS({ label, icon, value, hint, warn }: { label: string; icon: UiGlyph; value: string; hint: string; warn?: boolean }) {
  return (
    <section className="flex flex-col gap-1 rounded-16 border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 text-14 leading-[22px] font-medium text-ink">{label}</h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="num text-[26px] leading-[40px] font-bold text-ink">{value}</p>
      <p className={`text-13 leading-[22px] font-light ${warn ? "text-[#8a5b14]" : "text-muted"}`}>{hint}</p>
    </section>
  );
}
