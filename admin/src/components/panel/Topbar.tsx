"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { useMe } from "@/lib/use-me";

// الشريط العلوي (القسم 4.1): البحث العام (في المرحلة الأولى بيدوّر في مقدمي الخدمة بس)،
// الإشعارات والرسائل (بنقطة تنبيه — لاحقاً)، وقائمة المستخدم: حسابي · تسجيل الخروج.
export function Topbar() {
  const router = useRouter();
  const { data: me } = useMe();
  const [q, setQ] = useState("");
  const [logout, setLogout] = useState(false);
  // نص البحث الكامل مابيكفّيش الموبايل — «ابحث» بس تحت 1024
  const wide = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(min-width: 1024px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-white px-4 sm:gap-6 md:px-6 xl:px-8">
      <button
        type="button"
        aria-label="القائمة"
        aria-controls="panel-sidebar"
        onClick={() => window.dispatchEvent(new Event("panel:menu"))}
        className="flex size-10 shrink-0 items-center justify-center rounded-10 border border-border text-ink hover:bg-surface-1 xl:hidden"
      >
        <Icon name="menu" size={20} />
      </button>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/providers${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
        }}
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-10 border border-border px-3 xl:h-[38px] xl:max-w-[460px] xl:flex-none xl:basis-[460px]"
      >
        <Icon name="search" size={16} className="shrink-0 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={wide ? "ابحث باسم مركز أو رقم طلب أو حجز أو عميل" : "ابحث"} aria-label="بحث" className="min-w-0 flex-1 bg-transparent text-13 font-light outline-none placeholder:text-muted" />
      </form>

      <div className="flex items-center gap-2 sm:gap-3">
        <IconDot label="الرسائل" icon="message" />
        <IconDot label="الإشعارات" icon="bell" />
        <Menu.Root dir="rtl">
          <Menu.Trigger className="flex items-center gap-2.5 rounded-12 py-1 ps-1.5 pe-1 hover:bg-surface-1" aria-label="قائمة المستخدم">
            <span className="flex size-9 items-center justify-center rounded-full bg-lime text-14 font-medium text-ink">{me?.initial ?? ""}</span>
            <span className="hidden flex-col items-start md:flex">
              <span className="text-13 font-medium">{me?.name ?? "…"}</span>
              <span className="text-12 font-medium text-muted">{me?.role}</span>
            </span>
            <Icon name="chevron-down" size={16} className="text-ink" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Content align="end" sideOffset={8} className="z-40 min-w-48 rounded-12 border border-border bg-white p-1.5 shadow-menu">
              <Menu.Item onSelect={() => router.push("/account")} className="flex h-9 cursor-pointer items-center gap-2 rounded-8 px-3 text-13 outline-none data-highlighted:bg-surface-1">
                <Icon name="user" size={18} /> حسابي
              </Menu.Item>
              <Menu.Item onSelect={() => setLogout(true)} className="flex h-9 cursor-pointer items-center gap-2 rounded-8 px-3 text-13 text-danger outline-none data-highlighted:bg-surface-1">
                <Icon name="logout" size={18} /> تسجيل الخروج
              </Menu.Item>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
      </div>

      {/* CON5-24M · تسجيل الخروج (3114-28775) */}
      <Modal
        open={logout}
        onOpenChange={setLogout}
        title="تسجيل الخروج"
        description="هل تريدين تسجيل الخروج من لوحة تحكم لينكار؟"
        footer={
          <>
            <Button
              size="M"
              onClick={async () => {
                await api.auth.logout();
                router.replace("/login");
                router.refresh();
              }}
            >
              تسجيل الخروج
            </Button>
            <Button variant="secondary" size="M" onClick={() => setLogout(false)}>
              إلغاء
            </Button>
          </>
        }
      />
    </header>
  );
}

function IconDot({ label, icon }: { label: string; icon: "bell" | "message" }) {
  return (
    <button type="button" aria-label={label} title={label} className="relative flex size-10 items-center justify-center rounded-10 border border-border text-ink hover:bg-surface-1">
      <Icon name={icon} size={18} />
      <span className="absolute top-[9px] right-2 size-2 rounded-full bg-danger" />
    </button>
  );
}
