import type { ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";

// صف بطاقات الأرقام (القسم 3.5 «KPIs» · Figma CON5-07 3114:48542): بطاقات بيضا r16 · حشو 16 · مسافة 6 · بينها 12
// الرأس: مربع أيقونة 32 على #EEF1EF r8 (أيقونة 16) + العنوان 14 Medium · الرقم 30 Bold
export function KpiRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`grid auto-cols-fr grid-flow-col gap-3 ${className ?? ""}`}>{children}</div>;
}

export function KpiCard({ label, icon, value, hint, loading }: { label: string; icon: UiGlyph; value: ReactNode; hint?: ReactNode; loading?: boolean }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-16 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-2 text-ink">
          <Icon name={icon} size={16} />
        </span>
        <h3 className="text-14 font-medium text-ink">{label}</h3>
      </div>
      {loading ? <Skeleton className="my-2 h-[30px] w-16" /> : <p className="num text-30 font-bold text-ink">{value}</p>}
      {hint ? <p className="text-12 font-light text-muted">{hint}</p> : null}
    </section>
  );
}
