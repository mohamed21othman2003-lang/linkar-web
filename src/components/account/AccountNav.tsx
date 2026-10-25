"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/lib/routes";
import { SignOutButton } from "./signout-dialog";

export type AccountNavView = {
  name: string;
  initial: string;
  points: string;
  items: { key: string; label: string; href: string }[];
  signOut: string;
};

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path === routes.account
    ? pathname === path
    : pathname.startsWith(path);
}

// موبايل وتابلت: شريط مضغوط (العميل في سطر + الروابط تبويبات بتتسحب أفقياً) بدل القايمة الطويلة
// اللي كانت بتاخد الشاشة كلها قبل المحتوى. التبويب النشط بيتحرّك لوسط الشريط لوحده.
function AccountNavCompact({
  v,
  pathname,
}: {
  v: AccountNavView;
  pathname: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    const on = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !on) return;
    const a = on.getBoundingClientRect(),
      b = el.getBoundingClientRect();
    el.scrollBy({
      left: a.left + a.width / 2 - (b.left + b.width / 2),
      behavior: "instant",
    });
  }, [pathname]);
  return (
    <nav className="flex flex-col gap-3 rounded-[20px] border border-cool-gray bg-white p-3 lg:hidden">
      <div className="flex items-center gap-2.5 px-1">
        <Link
          href={routes.settings}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neon-green text-label-l text-deep-charcoal"
        >
          {v.initial}
        </Link>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label-l text-deep-charcoal">
            {v.name}
          </span>
          <Link
            href={routes.points}
            className="text-caption text-green-active hover:underline"
          >
            {v.points}
          </Link>
        </span>
        <SignOutButton className="flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-[9px] text-label-m text-promotional-red hover:bg-tile">
          <Icon name="logout" size={16} flip className="text-state-gray" />
          {v.signOut}
        </SignOutButton>
      </div>
      <div
        ref={track}
        className="-mx-3 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {v.items.map((i) => {
          const on = isActive(pathname, i.href);
          return (
            <Link
              key={i.key}
              href={i.href}
              aria-current={on ? "page" : undefined}
              className={`shrink-0 rounded-full px-4 py-[9px] text-label-m whitespace-nowrap ${on ? "bg-deep-charcoal text-neon-green" : "bg-tile text-deep-charcoal hover:bg-bg-muted"}`}
            >
              {i.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Account nav (748:7865) — 272 عرض، r20: العميل + روابط الحساب + تسجيل الخروج
export function AccountNav({ v }: { v: AccountNavView }) {
  const pathname = usePathname();
  return (
    <>
      <AccountNavCompact v={v} pathname={pathname} />
      <nav className="hidden flex-col gap-1 rounded-[20px] border border-cool-gray bg-white px-3 py-4 lg:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-3.5">
          <Link
            href={routes.settings}
            className="flex size-11 items-center justify-center rounded-full bg-neon-green text-label-l text-deep-charcoal"
          >
            {v.initial}
          </Link>
          <span className="flex flex-col">
            <span className="text-label-l text-deep-charcoal">{v.name}</span>
            <Link
              href={routes.points}
              className="text-caption text-green-active hover:underline"
            >
              {v.points}
            </Link>
          </span>
        </div>
        {v.items.map((i) => {
          const on = isActive(pathname, i.href);
          return (
            <Link
              key={i.key}
              href={i.href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 ${on ? "bg-deep-charcoal text-label-l text-white" : "text-body-m text-deep-charcoal hover:bg-tile"}`}
            >
              <span
                className={`h-[18px] w-1 rounded-[2px] ${on ? "bg-neon-green" : "bg-transparent"}`}
              />
              {i.label}
            </Link>
          );
        })}
        <div className="h-px bg-cool-gray" />
        {/* P-06 · تأكيد تسجيل الخروج قبل الخروج */}
        <SignOutButton className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-body-m text-promotional-red hover:bg-tile">
          <Icon name="logout" size={16} flip className="text-state-gray" />
          {v.signOut}
        </SignOutButton>
      </nav>
    </>
  );
}
