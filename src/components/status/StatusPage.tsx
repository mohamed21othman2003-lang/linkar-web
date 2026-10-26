import Link from "next/link";
import type { ReactNode } from "react";
import { RetryButton } from "./RetryButton";

export type StatusActionView = { label: string; href?: string; retry?: boolean; primary?: boolean };

const btn = "inline-flex items-center justify-center rounded-md px-[22px] text-label-l text-deep-charcoal transition-colors";
const tone = (primary?: boolean) => (primary ? "h-[50px] bg-neon-green hover:bg-bg-brand-hover" : "h-[52px] border border-border-default bg-white hover:bg-bg-muted");

// قالب صفحات الحالة المشترك (W2-404 · W2-500 · W2-offline · W2-503 · W2-410 · W2-403 · W2-401):
// خلفية #f4f6f5، كود 64 أخضر (اختياري) + عنوان H2 + وصف Body L + (بحث اختياري) + أزرار (الأساسي ليموني أولاً)
// بيشتغل في سيرفر وكلاينت (error.tsx) — «إعادة المحاولة» زر كلاينت بيستدعي onRetry أو يعيد تحميل الصفحة
export function StatusPage({
  code,
  title,
  body,
  actions,
  onRetry,
  children,
  className = "",
}: {
  code?: string;
  title: string;
  body: string;
  actions: StatusActionView[];
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-1 flex-col items-center bg-tile px-4 pt-16 pb-20 text-center md:px-20 md:pt-24 md:pb-[120px] ${className}`}>
      <div className="flex w-full max-w-[760px] flex-col items-center gap-4">
        {code && <p className="text-display-xl text-green-active">{code}</p>}
        <h1 className="text-h3 text-deep-charcoal md:text-h2">{title}</h1>
        <p className="text-body-l text-text-secondary">{body}</p>
        {children}
        <div className="flex flex-wrap justify-center gap-2.5">
          {actions.map((a) =>
            a.retry ? (
              <RetryButton key={a.label} onRetry={onRetry} className={`${btn} ${tone(a.primary)}`}>
                {a.label}
              </RetryButton>
            ) : (
              <Link key={a.label} href={a.href ?? "/"} className={`${btn} ${tone(a.primary)}`}>
                {a.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
