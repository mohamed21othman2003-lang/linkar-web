"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { routes } from "@/lib/routes";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { useToast } from "./account-dialog";

export type FeedItemView = {
  id: string;
  kind: UiGlyph;
  unread: boolean;
  group: "today" | "yesterday" | "week";
  tab: "bookings" | "offers" | "points" | "complaints";
  title: string;
  body: string;
  time: string;
  href: string;
};

type TabKey = "all" | FeedItemView["tab"];
const tabOrder: TabKey[] = ["all", "bookings", "offers", "points", "complaints"];
const groups: FeedItemView["group"][] = ["today", "yesterday", "week"];

// W2-73 · الإشعارات (779:18406) + «W2-73 · تبويبات» (1132:35065) — والعميل الجديد W2-73-0 (1071:1054)
export function NotificationsFeed({ locale, items, initialTab }: { locale: Locale; items: FeedItemView[]; initialTab: TabKey }) {
  const d = getAccountDict(locale);
  const t = d.notifications;
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [list, setList] = useState(items);
  const [toast, showToast] = useToast();
  const alertsHref = `${routes.settings}#alerts`;

  const selectTab = (k: TabKey) => {
    setTab(k);
    window.history.replaceState(null, "", routes.notifications(k === "all" ? undefined : k));
  };
  const markAll = () => {
    setList((l) => l.map((n) => ({ ...n, unread: false })));
    showToast(d.toasts.allRead);
  };
  const visible = list.filter((n) => tab === "all" || n.tab === tab);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3 text-deep-charcoal">{t.title}</h1>
          <p className="text-body-m text-state-gray">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href={alertsHref}
            className="flex items-center gap-1.5 rounded-md border border-cool-gray bg-white px-[18px] py-2.5 text-label-m text-deep-charcoal hover:border-border-strong"
          >
            <Icon name="settings" size={16} />
            {t.alertSettings}
          </Link>
          <button type="button" onClick={markAll} className="py-0.5 text-label-m text-green-active hover:underline">
            {t.markAllRead}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <section className="flex flex-col items-center gap-3.5 rounded-[20px] border border-cool-gray bg-white px-6 py-12 text-center md:px-10">
          <span className="flex rounded-full bg-neon-green/18 p-5 text-deep-charcoal">
            <Icon name="bell" size={32} />
          </span>
          <h2 className="text-h4 text-deep-charcoal">{t.emptyTitle}</h2>
          <p className="max-w-[520px] text-body-m text-state-gray">{t.emptySub}</p>
          <Link href={alertsHref} className="rounded-[14px] bg-neon-green px-[22px] py-[13px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover">
            {t.alertSettings}
          </Link>
        </section>
      ) : (
        <>
          <div className="flex">
            <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-cool-gray/35 p-1">
              {tabOrder.map((k) => {
                const on = k === tab;
                return (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => selectTab(k)}
                    className={`rounded-full px-4 py-2 text-label-m whitespace-nowrap transition-colors duration-200 ease-figma-out ${on ? "bg-deep-charcoal text-neon-green" : "text-deep-charcoal hover:bg-white/60"}`}
                  >
                    {k === "all" ? `${t.tabs.all} (${list.length})` : t.tabs[k]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHANGE_TO · DISSOLVE 200ms EASE_OUT («W2-73 · تبويبات») */}
          <div key={tab} className="flex animate-dissolve flex-col gap-5">
          {groups.map((g) => {
            const inGroup = visible.filter((n) => n.group === g);
            if (!inGroup.length) return null;
            return (
              <section key={g} className="flex flex-col gap-5">
                <h2 className="text-label-m text-state-gray">{t.groups[g]}</h2>
                <ul className="overflow-hidden rounded-[18px] border border-cool-gray bg-white">
                  {inGroup.map((n) => (
                    <li key={n.id} className="border-b border-cool-gray last:border-b-0">
                      <Link
                        href={n.href}
                        className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${n.unread ? "bg-tint-lime" : "bg-white hover:bg-tile"}`}
                      >
                        <span className="flex min-w-0 items-center gap-3.5">
                          <span className={`flex shrink-0 rounded-md p-2.5 text-deep-charcoal ${n.unread ? "bg-neon-green" : "bg-cool-gray/50"}`}>
                            <Icon name={n.kind} size={18} />
                          </span>
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-label-l text-deep-charcoal">{n.title}</span>
                            <span className="text-body-s text-state-gray">{n.body}</span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2 ps-[58px] sm:ps-0">
                          <span className="text-caption text-state-gray">{n.time}</span>
                          {n.unread && (
                            <span className="size-2 rounded-full bg-nature-green">
                              <span className="sr-only">{t.unread}</span>
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          </div>
        </>
      )}
      {toast}
    </div>
  );
}
