"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-6 border-b border-border bg-white px-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/providers${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
        }}
        className="flex h-10 w-[460px] items-center gap-2 rounded-10 border border-border px-3.5"
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم مركز أو رقم طلب أو حجز أو عميل" aria-label="بحث" className="min-w-0 flex-1 bg-transparent text-13 outline-none placeholder:text-muted" />
        <Icon name="search" size={16} className="text-muted" />
      </form>

      <div className="flex items-center gap-2">
        <IconDot label="الرسائل" icon="message" />
        <IconDot label="الإشعارات" icon="bell" />
        <Menu.Root dir="rtl">
          <Menu.Trigger className="ms-2 flex items-center gap-2.5 rounded-10 px-1 py-1 hover:bg-surface-1" aria-label="قائمة المستخدم">
            <span className="flex size-9 items-center justify-center rounded-full bg-lime text-16 font-bold text-ink">{me?.initial ?? ""}</span>
            <span className="flex flex-col items-start">
              <span className="text-14 font-bold leading-5">{me?.name ?? "…"}</span>
              <span className="text-12 text-muted">{me?.role}</span>
            </span>
            <Icon name="chevron-down" size={16} className="ms-2 text-ink" />
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
      <span className="absolute top-2 left-2.5 size-2 rounded-full border border-white bg-danger" />
    </button>
  );
}
