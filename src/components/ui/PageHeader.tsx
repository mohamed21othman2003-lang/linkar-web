import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { Container } from "./Container";

export type Crumb = { label: string; href?: string };

// مسار التنقّل: «الرئيسية › الخدمات» — آخر عنصر هو الصفحة الحالية
// tone="dark": على رأس الصفحة الغامق (#152935) في تصميم العميل المعدّل — الروابط #b3b3b3 والسهم #999 والحالية أبيض
export function Breadcrumb({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1.5 text-caption">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <Icon name="chevron-left" size={14} flip className={dark ? "text-v3-text-meta" : "text-state-gray"} />}
          {c.href ? (
            <Link href={c.href} className={dark ? "text-v3-card-stroke hover:text-white" : "text-text-secondary hover:text-text-primary"}>
              {c.label}
            </Link>
          ) : i < items.length - 1 ? (
            // خطوة وسطانية من غير رابط (زي تصنيف المقال في W2-100b): نفس لون الخطوات السابقة، والأبيض للصفحة الحالية بس
            <span className={dark ? "text-v3-card-stroke" : "text-text-secondary"}>{c.label}</span>
          ) : (
            <span className={dark ? "text-white" : "text-text-primary"} aria-current="page">
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
  tone = "light",
  descriptionWidth = "max-w-[760px]",
}: {
  crumbs: Crumb[];
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  // "dark": Page head الغامق في تصميم العميل المعدّل (AVbWFtRb0aHpm34oqkI5ot · W2-25 وغيرها) — خلفية #152935، عنوان أبيض، وصف #b3b3b3
  tone?: "light" | "dark";
  // عرض الوصف (760 في الفيجما) — Noto Kufi في الفيجما أعرض ~3% من المتصفح، فصفحة ممكن تمرّر أضيق عشان السطر يلف زي الفيجما (W2-40)
  descriptionWidth?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={`${dark ? "bg-deep-charcoal" : "bg-pagehead"} pt-9 pb-6 ${className}`}>
      <Container className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Breadcrumb items={crumbs} tone={tone} />
          <h1 className={`text-h3 md:text-h2 ${dark ? "text-neon-title" : ""}`}>{title}</h1>
          {description && <p className={`${descriptionWidth} text-body-l ${dark ? "text-v3-card-stroke" : "text-text-secondary"}`}>{description}</p>}
        </div>
        {aside}
      </Container>
    </div>
  );
}
