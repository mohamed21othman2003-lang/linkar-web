"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { api } from "@/lib/api";

// القائمة الجانبية (القسم 4.1): 240px يمين الشاشة، كحلي — نفس بنود Figma (13 بند).
// المرحلة التانية: كل البنود ليها صفحات. «الإعدادات» = /system (السياسات والميزات المدفوعة).
type Item = { label: string; icon: UiGlyph; href: string; match?: string; badge?: number; sub?: { label: string; href: string }[] };
const GROUPS: { title?: string; items: Item[] }[] = [
  {
    items: [
      { label: "الرئيسية", icon: "grid", href: "/overview", match: "/overview" },
      { label: "التحليلات", icon: "chart", href: "/analytics", match: "/analytics" },
      { label: "التقارير", icon: "file", href: "/reports", match: "/reports" },
    ],
  },
  {
    title: "العمليات",
    items: [
      { label: "الطلبات", icon: "edit", href: "/requests", match: "/requests" },
      { label: "الحجوزات", icon: "calendar", href: "/bookings", match: "/bookings" },
      { label: "العملاء", icon: "users", href: "/customers", match: "/customers" },
      { label: "الفواتير والقسائم", icon: "receipt", href: "/invoices", match: "/invoices|/payments" },
    ],
  },
  {
    title: "الشبكة",
    items: [
      { label: "مقدّمو الخدمة", icon: "store", href: "/providers", match: "/providers|/branches|/dues|/field-evaluation|/reviews" },
      { label: "الشركاء", icon: "car", href: "/partners/agencies", match: "/partners", sub: [{ label: "الوكالات", href: "/partners/agencies" }, { label: "المسوّقون", href: "/partners/marketers" }] },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { label: "الرسائل", icon: "message", href: "/messages", match: "/messages" },
      { label: "البيانات المرجعية", icon: "settings", href: "/reference", match: "/reference" },
      { label: "المستخدمون والصلاحيات", icon: "users", href: "/settings/users", match: "/settings" },
      { label: "الإعدادات", icon: "lock", href: "/system/policies", match: "/system" },
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
  // match: بادئات المسار مفصولة بـ| (الصفحات اللي مالهاش بند في القائمة بتنوّر البند الأقرب ليها)
  // شارة «الطلبات» = عدد الطلبات المفتوحة (لم يُبتّ فيها) من /requests — بتتحدّث بعد كل قرار (invalidate ["requests"])
  const openRequests = useQuery({ queryKey: ["requests", "open-count"], queryFn: api.requests.openCount }).data;
  const isActive = (it: Item) => (it.match ? it.match.split("|").some((m) => path === m || path.startsWith(`${m}/`)) : path === "/coming-soon" && it.href.endsWith(`s=${section}`));

  return (
    <>
    {open ? <button type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-ink/45 xl:hidden" /> : null}
    <aside
      id="panel-sidebar"
      className={`fixed inset-y-0 right-0 z-40 flex w-60 flex-col overflow-y-auto bg-ink px-4 pt-4 pb-6 text-white transition-transform xl:z-30 xl:translate-x-0 ${open ? "translate-x-0 shadow-drawer" : "translate-x-full"}`}
    >
      <Link href="/overview" className="flex flex-col items-start gap-1 px-3 pb-3">
        <Image src="/logo-inverse.svg" alt="Linkar" width={112} height={15} className="h-[15px] w-[112px]" priority />
        <span className="text-16 font-medium">لوحة تحكم لينكار</span>
      </Link>
      <nav className="flex flex-col">
        {GROUPS.map((g, gi) => (
          <div key={gi} className="flex flex-col">
            {g.title ? <span className="px-3 pt-2 text-12 xl:pt-0 font-medium text-white/50">{g.title}</span> : null}
            {g.items.map((it) => {
              const active = isActive(it);
              const badge = it.href === "/requests" ? openRequests : it.badge;
              return (
                <div key={it.label} className="flex flex-col">
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-2.5 rounded-10 px-3 text-14 xl:h-[26px] font-medium whitespace-nowrap ${active ? "bg-lime text-ink" : "text-white/88 hover:bg-white/8"}`}
                >
                  <Icon name={it.icon} size={20} />
                  <span className="flex-1">{it.label}</span>
                  {badge ? <span className="num rounded-full bg-lime px-2 text-12 font-medium text-ink">{badge}</span> : null}
                </Link>
                {/* «الشركاء» = صفحتين (الوكالات · المسوّقون) ومفيش رابط بينهم في Figma — روابط فرعية تحت البند وهو مفتوح */}
                {active && it.sub ? (
                  <div className="flex flex-col gap-0.5 py-1 ps-[42px]">
                    {it.sub.map((s) => {
                      const on = path === s.href || path.startsWith(`${s.href}/`);
                      return (
                        <Link key={s.href} href={s.href} aria-current={on ? "page" : undefined} className={`flex h-9 items-center rounded-8 px-2 text-13 xl:h-7 ${on ? "font-medium text-lime" : "text-white/70 hover:text-white"}`}>
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
