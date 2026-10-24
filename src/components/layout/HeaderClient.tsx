"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/lib/routes";
import { LangSwitch } from "./LangSwitch";
import { AboutMegaMenu, BusinessMegaMenu, type AboutMenuView, type BusinessMenuView } from "./MegaMenus";
import { AccountMenu, type AccountMenuView } from "./AccountMenu";
import { SearchPanel } from "@/components/search/SearchPanel";

export type NavKey = "home" | "services" | "offers" | "packages" | "about" | "business";
export type HeaderView = {
  locale: Locale;
  brand: string;
  nav: Record<NavKey, { label: string; href: string }>;
  search: string;
  signIn: string;
  langLabel: string;
  menuLabel: string;
  closeLabel: string;
  about: AboutMenuView;
  business: BusinessMenuView;
  account: AccountMenuView | null;
  firstName: string | null;
};

type Panel = "about" | "business" | "account" | null;

function activeKey(pathname: string): NavKey | null {
  if (pathname === "/") return "home";
  // W2-26 (/providers) ما فيهاش عنصر نشط في الفيجما
  if (pathname.startsWith("/services") || pathname.startsWith("/search")) return "services";
  if (pathname.startsWith("/offers")) return "offers";
  if (pathname.startsWith("/packages")) return "packages";
  if (pathname.startsWith("/about") || pathname.startsWith("/help") || pathname.startsWith("/faq") || pathname.startsWith("/contact")) return "about";
  if (pathname.startsWith("/business")) return "business";
  return null;
}

// v2 · Web header — hero: شفاف فوق صورة الهيرو (الرئيسية)، light: أبيض للصفحات الداخلية.
// في الرئيسية بعد تجاوز الهيرو بيظهر الهيدر الأبيض ثابت ومعاه زر «ابحث».
export function HeaderClient({ v, variant }: { v: HeaderView; variant: "hero" | "light" }) {
  const pathname = usePathname();
  const active = activeKey(pathname);
  const [panel, setPanel] = useState<Panel>(null);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // W2-29 · لوحة البحث
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // اقفل القوائم لما الصفحة تتغيّر (تحديث الحالة أثناء الرندر بدل useEffect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanel(null);
    setDrawer(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    if (variant !== "hero") return;
    const onScroll = () => setScrolled(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const dark = variant === "hero" && !scrolled;
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
  const close = () => setPanel(null);
  const navKeys: NavKey[] = variant === "hero" ? ["home", "services", "offers", "packages", "about", "business"] : ["services", "offers", "packages", "about", "business"];

  return (
    <div ref={ref} className={variant === "hero" ? "absolute inset-x-0 top-0 z-40" : "sticky top-0 z-40"}>
      {/* الهيدر الأبيض الثابت في الرئيسية بعد الهيرو */}
      {variant === "hero" && scrolled && <div className="h-20" />}
      <header
        // الطول 80 شامل الخط اللي تحت (stroke INSIDE في الفيجما) — مش 80 + 1
        className={
          dark
            ? "relative h-20"
            : `${variant === "hero" ? "fixed inset-x-0 top-0" : "relative"} h-20 border-b border-cool-gray bg-white`
        }
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center px-4 md:px-10 xl:px-20">
          <Link href={routes.home} aria-label={v.brand} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dark ? "/brand/logo-inverse.svg" : "/brand/logo-primary.svg"}
              alt={v.brand}
              width={dark ? 210 : 160}
              height={dark ? 28 : 21}
              className={dark ? "h-auto w-[150px] xl:w-[210px]" : "h-auto w-[130px] xl:w-[160px]"}
            />
          </Link>

          <nav className={`hidden items-center gap-7 lg:flex ${dark ? "ms-10 xl:ms-[154px]" : "mx-auto"}`}>
            {navKeys.map((k) => {
              const item = v.nav[k];
              const isMenu = k === "about" || k === "business";
              const isActive = active === k;
              const color = dark ? (isActive ? "text-neon-green" : "text-white") : isActive ? "text-green-active" : "text-deep-charcoal";
              const inner = (
                <>
                  <span>{item.label}</span>
                  {/* السهم موجود في الهيدر الأبيض بس شفاف في الفيجما (بياخد مكانه 16px) — ظاهر في هيدر الهيرو */}
                  {isMenu && (
                    <Icon
                      name="chevron-down"
                      size={dark ? 14 : 16}
                      className={`transition-transform duration-200 ease-figma-out ${panel === k ? "rotate-180" : ""} ${dark ? "text-white" : "opacity-0"}`}
                    />
                  )}
                  {isActive && !dark && <span className="absolute -bottom-[25px] start-1/2 h-[3px] w-[37px] -translate-x-1/2 rounded-[2px] bg-neon-green rtl:translate-x-1/2" />}
                </>
              );
              return isMenu ? (
                <button
                  key={k}
                  type="button"
                  aria-expanded={panel === k}
                  onClick={() => toggle(k as Panel)}
                  className={`relative flex items-center gap-1 text-label-l ${color}`}
                >
                  {inner}
                </button>
              ) : (
                <Link key={k} href={item.href} className={`relative flex items-center gap-1 text-label-l ${color}`} aria-current={isActive ? "page" : undefined}>
                  {inner}
                </Link>
              );
            })}
          </nav>

          <div className={`flex items-center gap-3 ${dark ? "ms-auto gap-3.5" : ""}`}>
            <LangSwitch
              locale={v.locale}
              label={v.langLabel}
              className={
                dark
                  ? "flex size-[43px] items-center justify-center rounded-full border border-neon-green/55 bg-hero-ink/35 text-label-m text-white"
                  : "flex h-control-sm items-center rounded-full border border-cool-gray px-3 text-label-m text-deep-charcoal"
              }
            />
            {v.account ? (
              <button
                type="button"
                aria-expanded={panel === "account"}
                onClick={() => toggle("account")}
                className={`hidden items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-label-m sm:flex ${
                  dark ? "h-[44px] border-neon-green/55 bg-hero-ink/35 text-white" : "border-cool-gray text-deep-charcoal"
                }`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-neon-green text-label-m text-deep-charcoal">{v.account.initial}</span>
                {v.firstName}
                <Icon name="chevron-down" size={16} />
              </button>
            ) : dark ? (
              <Link
                href={routes.login}
                className="hidden items-center gap-2 rounded-full border border-neon-green/55 bg-hero-ink/35 px-4 py-2.5 text-label-m text-white hover:bg-hero-ink/55 sm:flex"
              >
                <Icon name="user" size={16} />
                {v.signIn}
              </Link>
            ) : (
              <Link href={routes.login} className="hidden h-control-md items-center px-5 text-[15px] leading-[22px] font-bold text-deep-charcoal sm:flex">
                {v.signIn}
              </Link>
            )}
            {/* نتايج البحث (W2-30) فيها شريط بحث خاص بيها، فالهيدر من غير «ابحث» */}
            {!dark && !pathname.startsWith("/search") && (
              <button
                type="button"
                aria-expanded={searchOpen}
                onClick={() => {
                  setPanel(null);
                  setSearchOpen((o) => !o);
                }}
                className="hidden h-control-md items-center gap-1.5 rounded-md bg-neon-green px-5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover sm:flex"
              >
                <Icon name="search" size={18} />
                {v.search}
              </button>
            )}
            <button
              type="button"
              aria-label={v.menuLabel}
              onClick={() => setDrawer(true)}
              className={`flex size-control-md items-center justify-center rounded-md lg:hidden ${dark ? "text-white" : "text-deep-charcoal"}`}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* القوائم المنسدلة — 12px تحت الهيدر */}
        {(panel === "about" || panel === "business") && (
          <>
            <div className="fixed inset-x-0 top-20 bottom-0 -z-10 animate-dissolve bg-bg-overlay" onClick={close} />
            <div className="absolute inset-x-0 top-[92px] hidden animate-dissolve justify-center px-4 lg:flex">
              {panel === "about" ? <AboutMegaMenu m={v.about} onNavigate={close} /> : <BusinessMegaMenu m={v.business} onNavigate={close} />}
            </div>
          </>
        )}
        {panel === "account" && v.account && (
          <div className="absolute top-[76px] end-4 animate-dissolve md:end-10 xl:end-20">
            <AccountMenu m={v.account} onNavigate={close} />
          </div>
        )}
      </header>

      {searchOpen && <SearchPanel locale={v.locale} onClose={() => setSearchOpen(false)} />}

      {/* قائمة الموبايل */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 animate-dissolve bg-bg-overlay" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[min(360px,90vw)] flex-col gap-1 overflow-y-auto bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-primary.svg" alt={v.brand} width={130} height={17} className="h-auto w-[130px]" />
              <button type="button" aria-label={v.closeLabel} onClick={() => setDrawer(false)} className="flex size-control-md items-center justify-center text-deep-charcoal">
                <Icon name="x" />
              </button>
            </div>
            {(["home", "services", "offers", "packages"] as NavKey[]).map((k) => (
              <Link key={k} href={v.nav[k].href} className={`rounded-md px-3 py-3 text-label-l ${active === k ? "bg-tint-lime text-green-active" : "text-deep-charcoal"}`}>
                {v.nav[k].label}
              </Link>
            ))}
            <details className="group rounded-md">
              <summary className="flex items-center justify-between px-3 py-3 text-label-l text-deep-charcoal">
                {v.nav.about.label}
                <Icon name="chevron-down" size={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-col ps-3">
                {[...v.about.about, ...v.about.customers].map((i) => (
                  <Link key={i.href} href={i.href} className="px-3 py-2 text-body-m text-deep-charcoal">
                    {i.title}
                  </Link>
                ))}
              </div>
            </details>
            <details className="group rounded-md">
              <summary className="flex items-center justify-between px-3 py-3 text-label-l text-deep-charcoal">
                {v.nav.business.label}
                <Icon name="chevron-down" size={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-col ps-3">
                {[...v.business.providers, ...v.business.companies].map((i) => (
                  <Link key={i.href} href={i.href} className="px-3 py-2 text-body-m text-deep-charcoal">
                    {i.title}
                  </Link>
                ))}
                {v.business.affiliates.map((l) => (
                  <Link key={l.label} href={l.href} className="px-3 py-2 text-body-m text-deep-charcoal">
                    {l.label}
                  </Link>
                ))}
              </div>
            </details>
            <div className="mt-4 flex flex-col gap-2 border-t border-cool-gray pt-4">
              <button
                type="button"
                onClick={() => {
                  setDrawer(false);
                  setSearchOpen(true);
                }}
                className="flex h-control-md items-center justify-center gap-1.5 rounded-md bg-neon-green text-label-m text-deep-charcoal"
              >
                <Icon name="search" size={18} />
                {v.search}
              </button>
              {v.account ? (
                <Link href={routes.account} className="flex h-control-md items-center justify-center gap-2 rounded-md border border-cool-gray text-label-m text-deep-charcoal">
                  <span className="flex size-7 items-center justify-center rounded-full bg-neon-green">{v.account.initial}</span>
                  {v.account.name}
                </Link>
              ) : (
                <Link href={routes.login} className="flex h-control-md items-center justify-center rounded-md border border-cool-gray text-label-m font-bold text-deep-charcoal">
                  {v.signIn}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
