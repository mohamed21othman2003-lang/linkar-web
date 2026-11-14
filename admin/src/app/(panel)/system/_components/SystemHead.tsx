"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageHead } from "@/components/panel/PageHead";

// رأس صفحات «الإعدادات» (/system): Figma ما فيهوش تنقّل بين السياسات (CON5-21 3114:64406) والميزات المدفوعة (CON5-22 3114:64759)،
// ورأس الصفحتين في Figma ارتفاعه 100 والعنوان تحت (فراغ 38 فوقه) — حطّينا فيه تبويبين صغيرين (30 + مسافة 8) عشان الصفحتين يتوصلوا من بند «الإعدادات».
const TABS = [
  { href: "/system/policies", label: "السياسات" },
  { href: "/system/paid-features", label: "الميزات المدفوعة" },
];

export function SystemHead({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="الإعدادات" className="flex h-[30px] items-center gap-1.5">
        {TABS.map((t) => {
          const on = path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex h-[30px] items-center rounded-8 px-3 text-12 font-medium whitespace-nowrap ${on ? "bg-ink text-white" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <PageHead title={title} description={description} actions={actions} />
    </div>
  );
}
