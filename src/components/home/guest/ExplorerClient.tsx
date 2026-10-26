"use client";

import Link from "next/link";
import { useState } from "react";
import type { ServiceSlug } from "@/lib/data/types";
import { Icon } from "@/components/icons/Icon";
import { FigmaIcon, LogoTile } from "../bits";
import { GuestServiceIcon } from "./ServiceIcon";

export type ExplorerItem = {
  slug: ServiceSlug;
  name: string;
  sub: string;
  price: string;
  description: string;
  popular: string | null;
  benefits: { icon: string; text: string }[];
  logos: { slug: string; name: string; href: string }[];
  ctaProviders: string;
  ctaAbout: string;
  providersHref: string;
  aboutHref: string;
};

export function ExplorerClient({ items, initial, startsFrom, availableAt }: { items: ExplorerItem[]; initial: ServiceSlug; startsFrom: string; availableAt: string }) {
  const [active, setActive] = useState<ServiceSlug>(initial);
  const cur = items.find((i) => i.slug === active) ?? items[0];
  return (
    <div className="flex flex-col gap-6 lg:h-[632px] lg:flex-row lg:items-stretch">
      {/* Service list (37:28486) — 6 صفوف بتتقسم الطول بالتساوي؛ المرور/التركيز بيعرض تفاصيل الخدمة في اللوحة، والضغط → W2-30a */}
      <ul className="flex flex-col gap-2 lg:w-[400px] lg:shrink-0">
        {items.map((it) => {
          const on = it.slug === active;
          return (
            <li key={it.slug} className="lg:flex lg:flex-1">
              <Link
                href={it.providersHref}
                aria-current={on ? "true" : undefined}
                aria-controls="service-detail"
                onMouseEnter={() => setActive(it.slug)}
                onFocus={() => setActive(it.slug)}
                className={`flex min-h-[84px] w-full items-center justify-between gap-3 rounded-xl ps-4 pe-5 text-start transition-colors duration-200 ease-figma-out lg:min-h-0 ${
                  on ? "bg-deep-charcoal shadow-[0_12px_14px_#14293638]" : "bg-surface-soft hover:bg-cool-gray/60"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3.5">
                  {on ? (
                    <GuestServiceIcon slug={it.slug} variant="neon" size={52} />
                  ) : (
                    <span className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-white">
                      <GuestServiceIcon slug={it.slug} variant="outline" size={40} />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className={`text-h5 ${on ? "text-white" : "text-deep-charcoal"}`}>{it.name}</span>
                    <span className={`truncate text-caption ${on ? "text-white/70" : "text-state-gray"}`}>{it.sub}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  <span className="flex flex-col">
                    <span className={`text-caption ${on ? "text-white/60" : "text-state-gray"}`}>{startsFrom}</span>
                    <span className={`text-label-l ${on ? "text-neon-green" : "text-deep-charcoal"}`}>{it.price}</span>
                  </span>
                  <Icon name="chevron-left" size={18} flip className={on ? "text-white" : "text-state-gray"} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Detail */}
      <div id="service-detail" aria-live="polite" className="relative flex flex-1 flex-col gap-5 overflow-hidden rounded-3xl bg-deep-charcoal p-6 text-white sm:p-10 lg:min-h-[632px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/home/icons/brand-chevron-outline.svg" alt="" aria-hidden className="pointer-events-none absolute end-6 top-5 w-[300px] opacity-12" />
        <div className="relative flex items-center gap-3.5">
          <GuestServiceIcon slug={cur.slug} variant="white" size={88} />
          {cur.popular && <span className="rounded-full bg-neon-green px-3.5 py-1.5 text-label-m text-deep-charcoal">{cur.popular}</span>}
        </div>
        <h3 className="relative text-[26px]/[40px] font-bold md:text-h2">{cur.name}</h3>
        <p className="relative max-w-[600px] text-body-l text-white/78">{cur.description}</p>
        {cur.benefits.length > 0 && (
          <ul className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cur.benefits.map((b) => (
              <li key={b.text} className="flex min-h-[86px] items-center gap-3 rounded-[18px] border border-white/10 bg-white/6 p-4 text-label-l">
                {b.icon === "service" ? (
                  <GuestServiceIcon slug={cur.slug} variant="neon" size={40} />
                ) : (
                  <FigmaIcon name={b.icon} size={40} />
                )}
                {b.text}
              </li>
            ))}
          </ul>
        )}
        <div className="flex-1" />
        <div className="relative flex flex-wrap items-center gap-4">
          <span className="text-label-m text-white/72">{availableAt}</span>
          <span className="flex flex-wrap gap-2.5">
            {cur.logos.map((l) => (
              <LogoTile key={l.slug} slug={l.slug} alt={l.name} size={48} border={false} href={l.href} />
            ))}
          </span>
        </div>
        <span className="relative h-px bg-white/12" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex flex-col">
            <span className="text-caption text-white/60">{startsFrom}</span>
            <span className="text-[26px]/[40px] font-bold whitespace-nowrap text-neon-green">{cur.price}</span>
          </span>
          <span className="flex flex-wrap items-center gap-5">
            <Link
              href={cur.providersHref}
              className="flex h-[54px] items-center gap-2 rounded-[14px] bg-neon-green px-[22px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
            >
              {cur.ctaProviders}
              <Icon name="chevron-left" size={18} flip />
            </Link>
            <Link href={cur.aboutHref} className="flex items-center gap-1 text-label-l text-white hover:underline">
              {cur.ctaAbout}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
