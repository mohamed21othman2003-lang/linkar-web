import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { Container } from "./Container";

export type Crumb = { label: string; href?: string };

// مسار التنقّل: «الرئيسية › الخدمات» — آخر عنصر هو الصفحة الحالية
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-caption">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <Icon name="chevron-left" size={14} flip className="text-state-gray" />}
          {c.href ? (
            <Link href={c.href} className="text-text-secondary hover:text-text-primary">
              {c.label}
            </Link>
          ) : (
            <span className="text-text-primary" aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// رأس الصفحة الهادي (Page head في W2-25 وغيرها): تدرّج ليموني خفيف + مسار + عنوان H2 + وصف
export function PageHeader({
  crumbs,
  title,
  description,
  aside,
  className = "",
}: {
  crumbs: Crumb[];
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-pagehead pt-9 pb-6 ${className}`}>
      <Container className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Breadcrumb items={crumbs} />
          <h1 className="text-h3 md:text-h2">{title}</h1>
          {description && <p className="max-w-[760px] text-body-l text-text-secondary">{description}</p>}
        </div>
        {aside}
      </Container>
    </div>
  );
}
