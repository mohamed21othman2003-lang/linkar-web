"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  return path === routes.account ? pathname === path : pathname.startsWith(path);
}

// Account nav (748:7865) — 272 عرض، r20: العميل + روابط الحساب + تسجيل الخروج
export function AccountNav({ v }: { v: AccountNavView }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 rounded-[20px] border border-cool-gray bg-white px-3 py-4">
      <div className="flex items-center gap-2.5 px-2 pt-1 pb-3.5">
        <Link href={routes.settings} className="flex size-11 items-center justify-center rounded-full bg-neon-green text-label-l text-deep-charcoal">
          {v.initial}
        </Link>
        <span className="flex flex-col">
          <span className="text-label-l text-deep-charcoal">{v.name}</span>
          <Link href={routes.points} className="text-caption text-green-active hover:underline">
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
            <span className={`h-[18px] w-1 rounded-[2px] ${on ? "bg-neon-green" : "bg-transparent"}`} />
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
  );
}
