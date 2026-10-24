import type { ReactNode } from "react";

// عرض الديسكتوب 1440 بهوامش 80px (زي كل فريمات الفيجما) — على الموبايل 16px
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-4 md:px-10 xl:px-20 ${className}`}>{children}</div>;
}
