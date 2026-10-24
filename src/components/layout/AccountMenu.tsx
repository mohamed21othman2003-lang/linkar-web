import Link from "next/link";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { signOut } from "@/app/actions/session";

export type NotificationView = { id: string; kind: UiGlyph; unread: boolean; title: string; body: string; time: string; href: string };

export type AccountMenuView = {
  name: string;
  initial: string;
  meta: string; // «1,250 نقطة · 055 123 4567»
  links: { label: string; href: string; icon: UiGlyph }[];
  notificationsTitle: string;
  newCount: string;
  markAllRead: string;
  notifications: NotificationView[];
  viewAll: string;
  viewAllHref: string;
  signOut: string;
};

// W2-71 · قائمة الحساب والإشعارات (754:13223) — 400 عرض، r20
export function AccountMenu({ m, onNavigate }: { m: AccountMenuView; onNavigate?: () => void }) {
  return (
    <div className="flex w-[400px] max-w-[calc(100vw-32px)] flex-col gap-2.5 rounded-[20px] border border-cool-gray bg-white p-4 shadow-[0_12px_12px_#0000002e]">
      <div className="flex items-center gap-2.5 p-1">
        <span className="flex size-10 items-center justify-center rounded-full bg-neon-green text-label-l text-deep-charcoal">{m.initial}</span>
        <span className="flex flex-col">
          <span className="text-label-l text-deep-charcoal">{m.name}</span>
          <span className="text-caption text-green-active" dir="auto">
            {m.meta}
          </span>
        </span>
      </div>
      <div className="flex gap-2">
        {m.links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className="flex flex-1 flex-col items-center gap-1 rounded-md bg-tile px-1 py-2.5 text-caption text-deep-charcoal hover:bg-bg-muted"
          >
            <Icon name={l.icon} size={18} />
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-label-l text-deep-charcoal">{m.notificationsTitle}</span>
        <span className="rounded-full bg-neon-green px-3 py-1 text-caption text-deep-charcoal">{m.newCount}</span>
        <button type="button" className="py-0.5 text-label-m text-green-active hover:underline">
          {m.markAllRead}
        </button>
      </div>
      {m.notifications.map((n) => (
        <Link
          key={n.id}
          href={n.href}
          onClick={onNavigate}
          className={`flex items-start gap-2.5 rounded-md p-2.5 ${n.unread ? "bg-tint-lime" : "bg-white hover:bg-tile"}`}
        >
          <span className={`flex rounded-[10px] p-2 text-deep-charcoal ${n.unread ? "bg-neon-green" : "bg-cool-gray/50"}`}>
            <Icon name={n.kind} size={16} />
          </span>
          <span className="flex flex-1 flex-col gap-px text-[14px] leading-[22px]">
            <span className="font-medium text-deep-charcoal">{n.title}</span>
            <span className="font-light text-state-gray" dir="auto">
              {n.body}
            </span>
            <span className={`font-light ${n.unread ? "text-green-active" : "text-state-gray"}`}>{n.time}</span>
          </span>
        </Link>
      ))}
      <div className="h-px bg-cool-gray" />
      <div className="flex items-center justify-between">
        <Link href={m.viewAllHref} onClick={onNavigate} className="flex items-center gap-1.5 py-1 text-label-m text-green-active hover:underline">
          {m.viewAll}
          <Icon name="chevron-left" size={16} flip className="text-nature-green" />
        </Link>
        <form action={signOut}>
          <button type="submit" className="py-1 text-label-m text-promotional-red hover:underline">
            {m.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
