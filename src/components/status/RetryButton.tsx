"use client";

import type { ReactNode } from "react";

// «إعادة المحاولة» — في error.tsx بيستدعي unstable_retry، وفي باقي الصفحات بيعيد تحميل الصفحة
export function RetryButton({ onRetry, className, children }: { onRetry?: () => void; className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => (onRetry ? onRetry() : window.location.reload())} className={className}>
      {children}
    </button>
  );
}
