import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// رأس الصفحة (القسم 3.5): مسار الصفحة، والعنوان، والوصف، وأزرار الصفحة على الشمال
export function PageHead({
  title,
  description,
  crumbs,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex flex-col gap-1">
        {crumbs?.length ? (
          <nav aria-label="مسار الصفحة" className="flex items-center gap-1 text-12 text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink">{c.label}</span>
                )}
                {i < crumbs.length - 1 ? <Icon name="chevron-left" size={14} /> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-24 font-bold text-ink">{title}</h1>
        {description ? <p className="text-13 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}

// بطاقة بيضاء بإطار (r16) — القسم 3.3
export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-16 border border-border bg-white p-5 ${className ?? ""}`}>
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h2 className="text-18 font-bold text-ink">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

// حالة فارغة / لا نتائج / خطأ (القسم 2.7)
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted">
        <Icon name="search" size={22} />
      </span>
      <p className="text-16 font-bold text-ink">{title}</p>
      {body ? <p className="max-w-md text-13 text-muted">{body}</p> : null}
      {action}
    </div>
  );
}
