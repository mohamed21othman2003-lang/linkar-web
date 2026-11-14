"use client";

import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import type { ChatLine, MsgStatus } from "@/lib/api/messages";
import { MSG_STATUS_LABEL } from "@/lib/api/messages";
import { ltrRuns, num } from "@/lib/format";

// قطع صفحة الرسائل (CON5-19 3114:1328) وأدراجها (CON5-19D)

/** بطاقة رقم بإطار (Figma «KPI · …»): r16 · حشو 16 · مسافة 6 · إطار #D9DEDB */
export function MsgKpi({ label, icon, value, hint, hintClassName, loading }: { label: string; icon: UiGlyph; value: ReactNode; hint: ReactNode; hintClassName?: string; loading?: boolean }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-16 border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 text-14 font-medium text-ink">{label}</h3>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
      </div>
      {loading ? <Skeleton className="my-2 h-[30px] w-16" /> : <p className="num text-30 font-bold text-ink">{value}</p>}
      <p className={`text-13 font-light ${hintClassName ?? "text-muted"}`}>{hint}</p>
    </section>
  );
}

/** شارة الحالة S (22 · r8 · حشو 1·8 · 12 Medium) */
const TONE: Record<MsgStatus, string> = {
  new: "bg-pending-tint text-pending",
  answered: "bg-success-tint text-success",
  contacted: "bg-success-tint text-success",
  review: "bg-info-tint text-[#2b5f8e]",
};
export function StatusPill({ status }: { status: MsgStatus }) {
  return <span className={`inline-flex h-[22px] w-fit shrink-0 items-center rounded-8 px-2 text-12 font-medium whitespace-nowrap ${TONE[status]}`}>{MSG_STATUS_LABEL[status]}</span>;
}

/** خلية الحالة: الشارة + سطر 12 Medium رمادي */
export function StatusCell({ status, note }: { status: MsgStatus; note?: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <StatusPill status={status} />
      {note ? <span className="text-12 font-medium text-muted">{ltrRuns(note)}</span> : null}
    </div>
  );
}

/** خلية بسطرين: 13 Medium ثم 12 Medium رمادي */
export function TwoLine({ main, sub }: { main: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-13 font-medium text-ink">{main}</span>
      {sub ? <span className="text-12 font-medium text-muted">{sub}</span> : null}
    </div>
  );
}

/** زر «رد» الصغير (32 · r8): كحلي، أو أبيض بإطار للمقترح «قيد الدراسة» */
export function ReplyBtn({ label = "رد", outline, onClick }: { label?: string; outline?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 shrink-0 rounded-8 px-3 text-12 font-medium whitespace-nowrap ${outline ? "border border-border bg-white text-ink hover:bg-surface-1" : "bg-ink text-white hover:bg-ink/90"}`}
    >
      {label}
    </button>
  );
}

/** زر التفاصيل 34×32 بإطار (أيقونة info) */
export function InfoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title="التفاصيل" onClick={onClick} className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1">
      <Icon name="info" size={16} />
    </button>
  );
}

/** فقاعة المحادثة: المرسل #F4F6F5 · رد لينكار #EAF7EC · r12 · حشو 12 · مسافة 4 */
export function Bubble({ line }: { line: ChatLine }) {
  return (
    <div className={`flex flex-col gap-1 rounded-12 p-3 ${line.staff ? "bg-success-tint" : "bg-surface-1"}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <span className="text-13 font-medium text-ink">{line.from}</span>
        <span className="text-12 font-medium text-muted">{ltrRuns(line.at)}</span>
      </div>
      <p className="text-13 font-light text-ink">{ltrRuns(line.text)}</p>
    </div>
  );
}

/** سطر «عرض 1 – 6 من 14 هذا الشهر» مع أزرار الصفحات (32 · r8) */
export function MsgPager({ page, pages, text, onPage }: { page: number; pages: number; text: ReactNode; onPage?: (p: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-13 font-light text-muted">{text}</p>
      <nav aria-label="الصفحات" dir="ltr" className="flex items-center gap-1.5">
        {Array.from({ length: Math.max(1, pages) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage?.(p)}
            aria-current={p === page ? "page" : undefined}
            className={`num flex size-8 items-center justify-center rounded-8 text-12 font-medium ${p === page ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
          >
            {num(p)}
          </button>
        ))}
      </nav>
    </div>
  );
}

/** حقل نص متعدد الأسطر (Figma «Input» 110 · r10 · حشو 10·12 · 13 Medium) */
export const TEXTAREA = "h-[110px] w-full resize-none rounded-10 border bg-white px-3 pt-2.5 text-13 leading-[22px] font-medium text-ink outline-none focus:border-[1.5px] focus:border-ink";
