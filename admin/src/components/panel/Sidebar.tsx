"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";

// القائمة الجانبية (القسم 4.1): 240px يمين الشاشة، كحلي. في المرحلة الأولى شغّالين بس:
// مقدّمو الخدمة، والمستخدمون والصلاحيات — والباقي يفتح «قريباً». شارة الطلبات مخفية لحد ما الطلبات تتبني.
type Item = { label: string; icon: UiGlyph; href: string; match?: string; badge?: number };
const GROUPS: { title?: string; items: Item[] }[] = [
  {
    items: [
      { label: "الرئيسية", icon: "grid", href: "/coming-soon?s=home" },
      { label: "التحليلات", icon: "chart", href: "/coming-soon?s=analytics" },
      { label: "التقارير", icon: "file", href: "/coming-soon?s=reports" },
    ],
  },
  {
    title: "العمليات",
    items: [
      { label: "الطلبات", icon: "edit", href: "/coming-soon?s=requests" },
      { label: "الحجوزات", icon: "calendar", href: "/coming-soon?s=bookings" },
      { label: "العملاء", icon: "users", href: "/coming-soon?s=customers" },
      { label: "الفواتير والقسائم", icon: "receipt", href: "/coming-soon?s=invoices" },
    ],
  },
  {
    title: "الشبكة",
    items: [
      { label: "مقدّمو الخدمة", icon: "store", href: "/providers", match: "/providers" },
      { label: "الشركاء", icon: "car", href: "/coming-soon?s=partners" },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { label: "الرسائل", icon: "message", href: "/coming-soon?s=messages" },
      { label: "البيانات المرجعية", icon: "settings", href: "/coming-soon?s=reference" },
      { label: "المستخدمون والصلاحيات", icon: "users", href: "/settings/users", match: "/settings" },
      { label: "الإعدادات", icon: "lock", href: "/coming-soon?s=settings" },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const section = useSearchParams().get("s");
  // أقل من 1280: القائمة مخفية وبتتفتح كدرج من زر القائمة في الشريط العلوي (حدث panel:menu)
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener("panel:menu", toggle);
    return () => window.removeEventListener("panel:menu", toggle);
  }, []);
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setOpen(false);
  }
  const isActive = (it: Item) => (it.match ? path.startsWith(it.match) || (it.match === "/providers" && path.startsWith("/branches")) : path === "/coming-soon" && it.href.endsWith(`s=${section}`));

  return (
    <>
    {open ? <button type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-ink/45 xl:hidden" /> : null}
    <aside
      id="panel-sidebar"
      className={`fixed inset-y-0 right-0 z-40 flex w-60 flex-col overflow-y-auto bg-ink px-4 pt-4 pb-6 text-white transition-transform xl:z-30 xl:translate-x-0 ${open ? "translate-x-0 shadow-drawer" : "translate-x-full"}`}
    >
      <Link href="/providers" className="flex flex-col items-start gap-1 px-3 pb-3">
        <Image src="/logo-inverse.svg" alt="Linkar" width={112} height={15} className="h-[15px] w-[112px]" priority />
        <span className="text-16 font-medium">لوحة تحكم لينكار</span>
      </Link>
      <nav className="flex flex-col">
        {GROUPS.map((g, gi) => (
          <div key={gi} className="flex flex-col">
            {g.title ? <span className="px-3 pt-2 text-12 xl:pt-0 font-medium text-white/50">{g.title}</span> : null}
            {g.items.map((it) => {
              const active = isActive(it);
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-2.5 rounded-10 px-3 text-14 xl:h-[26px] font-medium whitespace-nowrap ${active ? "bg-lime text-ink" : "text-white/88 hover:bg-white/8"}`}
                >
                  <Icon name={it.icon} size={20} />
                  <span className="flex-1">{it.label}</span>
                  {it.badge ? <span className="num rounded-full bg-lime px-2 text-12 font-medium text-ink">{it.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
