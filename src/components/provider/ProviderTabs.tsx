"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getProviderDict } from "@/i18n/dict/provider";
import type { Provider } from "@/lib/data/types";
import type { CarSize, ProviderDetail } from "@/lib/data/provider-details";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { BrandIcon, LogoTile, ServiceTile, SpecPill, Stars, bookingHref } from "./bits";
import { CompareModal } from "./CompareModal";
import { ContactBranchModal } from "./Popups";
import { availableTabs, type ProviderTab } from "./tabs";
import { scrollToEl } from "./motion";

const SIZES: CarSize[] = ["sedan", "suv", "large"];
// الباقات في نفس قائمة الاختيار بمعرّف مختلف (slug الباقة ممكن يساوي slug خدمة)
const PKG = "pkg:";

// شريط التبويبات (W2-21 / W2-32): النشط Label L كحلي + خط ليموني 3px، الباقي Body M رمادي
export function TabBar<K extends string>({
  tabs,
  active,
  onSelect,
  hrefFor,
  gap = "gap-8",
  pt = "pt-4",
  inner = "gap-3",
  label,
}: {
  tabs: { key: K; label: string }[];
  active: K;
  onSelect: (k: K) => void;
  hrefFor: (k: K) => string;
  gap?: string;
  pt?: string;
  inner?: string;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={`-mb-px flex ${gap} overflow-x-auto [scrollbar-width:none]`}>
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <a
            key={tab.key}
            role="tab"
            aria-selected={on}
            href={hrefFor(tab.key)}
            onClick={(e) => {
              e.preventDefault();
              onSelect(tab.key);
            }}
            className={`flex shrink-0 flex-col items-center ${inner} ${pt} whitespace-nowrap`}
          >
            <span className={on ? "text-label-l text-deep-charcoal" : "text-body-m text-state-gray hover:text-deep-charcoal"}>{tab.label}</span>
            <span className={`h-[3px] w-full rounded-xs ${on ? "bg-neon-green" : "bg-transparent"}`} />
          </a>
        );
      })}
    </div>
  );
}

// W2-21 · التبويبات (مكوّن تفاعلي 1129:30644): الخدمات · الباقات والعروض · الفروع · التقييمات · نبذة
// الحالة (الخدمات المختارة + حجم السيارة) مشتركة بين التبويبات وكارت الحجز ونافذة المقارنة W2-22.
export function ProviderTabs({
  locale,
  provider,
  detail,
  initialTab,
  refCode,
}: {
  locale: Locale;
  provider: Provider;
  detail: ProviderDetail;
  initialTab: ProviderTab;
  refCode?: string;
}) {
  const t = getProviderDict(locale);
  const params = useSearchParams();
  const router = useRouter();
  const tabs = availableTabs(detail);
  const fromUrl = params.get("tab") as ProviderTab | null;
  const [tab, setTab] = useState<ProviderTab>(initialTab);
  const active = fromUrl && tabs.includes(fromUrl) ? fromUrl : tab;
  // CHANGE_TO Tab=… · DISSOLVE 200ms EASE_OUT (بعد ضغط المستخدم، مش عند التحميل)
  const [switched, setSwitched] = useState(false);
  const select = (k: ProviderTab) => {
    setSwitched(true);
    setTab(k);
    const url = new URL(window.location.href);
    if (k === "services") url.searchParams.delete("tab");
    else url.searchParams.set("tab", k);
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  const [size, setSize] = useState<CarSize>("sedan");
  const [selected, setSelected] = useState<string[]>(detail.default_selection);
  const toggle = useCallback((id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id])), []);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compared, setCompared] = useState<string[]>(detail.compare_default);
  const [contact, setContact] = useState<string | null>(null);
  const [pin, setPin] = useState(detail.branches[0]?.id);

  const name = tx(locale, provider, "name");
  const short = tx(locale, provider, "short_name");
  const city = tx(locale, detail, "city");
  const labels: Record<ProviderTab, string> = {
    services: t.tabs.services(detail.services.length),
    packages: t.tabs.packages(detail.packages.length),
    branches: t.tabs.branches(detail.branches.length, city),
    reviews: t.tabs.reviews(detail.linkar.count),
    about: t.tabs.about,
  };

  const items = selected
    .map((id) => {
      const s = detail.services.find((x) => x.slug === id);
      if (s) return { id, name: tx(locale, s, "name"), price: s.prices[size] };
      const p = detail.packages.find((x) => PKG + x.slug === id);
      if (p) return { id, name: tx(locale, p, "name"), price: p.price };
      return null;
    })
    .filter((x): x is { id: string; name: string; price: number } => !!x);
  const total = items.reduce((a, b) => a + b.price, 0);
  const href = bookingHref({
    provider: provider.slug,
    services: items.filter((i) => !i.id.startsWith(PKG)).map((i) => i.id),
    packages: items.filter((i) => i.id.startsWith(PKG)).map((i) => i.id.slice(PKG.length)),
    size,
    ref: refCode,
  });

  const openCompare = (ids: string[]) => {
    const svc = ids.filter((id) => detail.services.some((s) => s.slug === id));
    setCompared(svc.length >= 2 ? svc.slice(0, 3) : detail.compare_default);
    setCompareOpen(true);
  };

  return (
    <div id="provider-tabs" className="scroll-mt-24">
      <div className="border-b border-cool-gray">
        <Container>
          <TabBar
            label={name}
            tabs={tabs.map((k) => ({ key: k, label: labels[k] }))}
            active={active}
            onSelect={select}
            hrefFor={(k) => routes.provider(provider.slug, k === "services" ? undefined : k)}
          />
        </Container>
      </div>

      <div key={active} className={switched ? "animate-dissolve" : undefined}>
      {active === "services" && (
        <Container className="grid grid-cols-1 gap-8 pt-8 pb-10 lg:grid-cols-[minmax(0,1fr)_392px]">
          {/* قائمة الخدمات */}
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-h4">{t.chooseServices}</h2>
                <p className="text-caption text-state-gray">{t.chooseServicesSub}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-caption whitespace-nowrap text-state-gray">{t.pricePerCar}</span>
                <div role="radiogroup" aria-label={t.pricePerCar} className="flex gap-1 rounded-md bg-cool-gray/40 p-1">
                  {SIZES.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={size === k}
                      onClick={() => setSize(k)}
                      className={`rounded-[9px] px-3.5 py-[7px] text-label-m whitespace-nowrap ${size === k ? "bg-deep-charcoal text-white" : "text-deep-charcoal hover:bg-white/60"}`}
                    >
                      <span dir="auto">{t.sizes[k]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {detail.groups.map((g) => {
              const list = detail.services.filter((s) => s.group === g.key);
              if (!list.length) return null;
              return (
                <div key={g.key} className="flex flex-col gap-5">
                  <h3 className="flex items-center gap-2 pt-2 text-label-l text-deep-charcoal">
                    <ServiceTile name={g.icon} size={22} variant="outline" />
                    {tx(locale, g, "name")}
                  </h3>
                  {list.map((s) => {
                    const on = selected.includes(s.slug);
                    const sName = tx(locale, s, "name");
                    return (
                      <article
                        key={s.slug}
                        onClick={(e) => !(e.target as HTMLElement).closest("button,a") && router.push(routes.providerService(provider.slug, s.slug))}
                        className={`flex cursor-pointer flex-col gap-4 rounded-xl p-4 transition-colors duration-200 ease-figma-out sm:flex-row sm:items-center sm:gap-5 sm:ps-4 sm:pe-5 ${
                          on ? "border-2 border-neon-green bg-neon-green/6" : "border border-cool-gray bg-white"
                        }`}
                      >
                        <Link href={routes.providerService(provider.slug, s.slug)} className="relative hidden h-28 w-[140px] shrink-0 overflow-hidden rounded-[14px] sm:block">
                          <Image src={s.photo} alt={sName} fill sizes="280px" className="object-cover" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={routes.providerService(provider.slug, s.slug)} className="text-h5 text-deep-charcoal hover:underline">
                              {sName}
                            </Link>
                            {s.popular && <span className="rounded-full bg-deep-charcoal px-2.5 py-[3px] text-caption text-neon-green">{t.popular}</span>}
                          </div>
                          <p className="text-body-s text-state-gray">{tx(locale, s, "description")}</p>
                          {(s.warranty_label || s.duration_ar) && (
                            <div className="flex flex-wrap gap-2">
                              {s.warranty_label && <SpecPill icon="shield">{tx(locale, s.warranty_label, "label")}</SpecPill>}
                              {s.duration_ar && <SpecPill icon="calendar">{tx(locale, s, "duration")}</SpecPill>}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-2.5 sm:w-[150px] sm:flex-col sm:items-end">
                          <div className="flex flex-col sm:items-end">
                            <span className="text-h4 text-deep-charcoal">{formatPrice(locale, s.prices[size])}</span>
                            <span className="text-caption text-state-gray">{t.forCar(t.sizes[size])}</span>
                          </div>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => toggle(s.slug)}
                            className={`flex h-10 w-[150px] items-center justify-center gap-1.5 rounded-[10px] text-label-m text-deep-charcoal ${
                              on ? "bg-neon-green hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out" : "border border-deep-charcoal bg-white hover:bg-tile"
                            }`}
                          >
                            {on && <Icon name="check" size={16} />}
                            {on ? t.added : t.addToBooking}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              );
            })}

            {detail.services.length > 1 && (
              <div className="flex flex-col gap-2 rounded-lg bg-cool-gray/30 px-[18px] py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-body-s text-deep-charcoal">{t.compareHint}</p>
                <button type="button" onClick={() => openCompare(detail.compare_default)} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
                  {t.compareServices}
                  <Icon name="chevron-left" size={16} flip />
                </button>
              </div>
            )}
          </div>

          {/* كارت الحجز — الخطوة 1 «الخدمات» */}
          <aside className="h-fit rounded-2xl border border-cool-gray bg-white p-6 shadow-[0_12px_12px_0_#14293614] sticky top-[104px] max-lg:static">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <LogoTile src={provider.logo} alt={name} size={44} radius={16} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-state-gray">{t.bookingAt}</span>
                  <span className="text-h5 text-deep-charcoal">{name}</span>
                </div>
              </div>
              <hr className="border-cool-gray" />
              <p className="text-label-m text-state-gray">{t.selectedServices(items.length)}</p>
              {items.length ? (
                items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 text-body-s text-deep-charcoal">{it.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-label-m text-deep-charcoal">{formatPrice(locale, it.price)}</span>
                      <button type="button" aria-label={t.removeItem(it.name)} onClick={() => toggle(it.id)} className="relative text-state-gray after:absolute after:-inset-3 after:content-[''] hover:text-deep-charcoal">
                        <Icon name="x" size={16} />
                      </button>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-caption text-state-gray">{t.emptySelection}</p>
              )}
              <hr className="border-cool-gray" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-label-l text-deep-charcoal">{t.total}</span>
                  <span className="text-caption text-state-gray">{t.inclTax(t.sizes[size])}</span>
                </div>
                <span className="text-h3 whitespace-nowrap text-deep-charcoal">{formatPrice(locale, total)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-neon-green/14 px-3 py-2.5">
                <BrandIcon name="calendar" size={18} />
                <span className="text-label-m text-deep-charcoal">{t.oneVisitBranchPay}</span>
              </div>
              {items.length ? (
                <Link
                  href={href}
                  className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-5 text-label-l text-deep-charcoal hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out"
                >
                  {t.continue}
                  <Icon name="chevron-left" size={18} flip />
                </Link>
              ) : (
                <span aria-disabled className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-5 text-label-l text-deep-charcoal opacity-50">
                  {t.continue}
                  <Icon name="chevron-left" size={18} flip />
                </span>
              )}
              {detail.services.length > 1 && (
                <button
                  type="button"
                  onClick={() => openCompare(selected)}
                  className="flex h-12 items-center justify-center rounded-[14px] border border-cool-gray px-5 text-label-m text-deep-charcoal hover:border-border-strong"
                >
                  {t.compareSelected}
                </button>
              )}
              <p className="flex items-center gap-1.5 text-caption text-state-gray">
                <BrandIcon name="shield" size={16} />
                {t.voucherNote}
              </p>
            </div>
          </aside>
          <CompareModal
            locale={locale}
            open={compareOpen}
            onClose={() => setCompareOpen(false)}
            providerName={name}
            shortName={short}
            size={size}
            services={detail.services}
            compared={compared}
            setCompared={setCompared}
            selected={selected}
            onToggle={toggle}
          />
        </Container>
      )}

      {active === "packages" && (
        <Container className="flex flex-col gap-5 pt-10 pb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3">{t.packagesTitle}</h2>
            <p className="text-body-m text-state-gray">{t.packagesSub(short)}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {detail.packages.map((p) => {
              const on = selected.includes(PKG + p.slug);
              return (
                <article
                  key={p.slug}
                  onClick={(e) => !(e.target as HTMLElement).closest("button,a") && router.push(routes.package(p.slug))}
                  className={`flex cursor-pointer flex-col gap-3.5 rounded-xl p-[22px] transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/6" : "border border-cool-gray bg-white"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {p.icons.map((ic) => (
                        <ServiceTile key={ic} name={ic} size={40} />
                      ))}
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-deep-charcoal px-3 py-[5px] text-label-m text-neon-green">
                      <Icon name="tag" size={14} />
                      {t.discount(p.discount)}
                    </span>
                  </div>
                  <Link href={routes.package(p.slug)} className="text-h4 text-deep-charcoal hover:underline">
                    {tx(locale, p, "name")}
                  </Link>
                  <p className="text-body-s text-state-gray">{tx(locale, p, "description")}</p>
                  <div>
                    <SpecPill icon="calendar">{tx(locale, p, "meta")}</SpecPill>
                  </div>
                  <hr className="mt-auto border-cool-gray" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-h4 text-deep-charcoal">{formatPrice(locale, p.price)}</span>
                      <span className="text-caption text-state-gray line-through">{p.old_price.toLocaleString("en-US")}</span>
                      <span className="rounded-full bg-neon-green/25 px-2 py-[3px] text-caption text-green-active">
                        {t.saveAmount(formatPrice(locale, p.old_price - p.price))}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(PKG + p.slug)}
                      className={`flex items-center gap-1.5 rounded-[10px] px-4 py-2.5 text-label-m text-deep-charcoal ${
                        on ? "bg-neon-green hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out" : "border border-deep-charcoal bg-white hover:bg-tile"
                      }`}
                    >
                      {on && <Icon name="check" size={16} />}
                      {on ? t.added : t.addToBooking}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      )}

      {active === "branches" && (
        <Container className="flex flex-col gap-5 pt-10 pb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3">{t.branchesTitle(city)}</h2>
            <p className="text-body-m text-state-gray">{t.branchesSub}</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {detail.branches.map((b) => (
                <div
                  key={b.id}
                  data-branch={b.id}
                  className="flex scroll-mt-24 items-center justify-between gap-3 rounded-lg border border-cool-gray bg-white px-[18px] py-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPin(b.id);
                      setContact(b.id);
                    }}
                    className="flex min-w-0 flex-col items-start gap-1 text-start"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-label-l text-deep-charcoal">{tx(locale, b, "name")}</span>
                      <span className="text-caption text-state-gray">{t.kmAway(b.distance_km.toFixed(1))}</span>
                    </span>
                    <span className="text-body-s text-state-gray">{tx(locale, b, "address")}</span>
                    <span className="text-caption text-green-active">{tx(locale, b, "hours")}</span>
                  </button>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(b.maps_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 text-caption text-state-gray hover:text-deep-charcoal"
                  >
                    {t.directions}
                    <Icon name="navigation" size={14} />
                  </a>
                </div>
              ))}
            </div>
            {/* الخريطة المصغّرة (توضيحية) — مرسومة LTR زي الفيجما */}
            <div dir="ltr" role="group" aria-label={t.mapLabel} className="relative h-[340px] w-full shrink-0 overflow-hidden rounded-xl bg-[#eef1ef] lg:w-[520px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/provider/map-coast.svg" alt="" className="absolute -top-5 -left-2.5 h-[380px] w-[102px]" />
              <div className="absolute top-[120px] left-[90px] h-3.5 w-[460px] bg-white" />
              <div className="absolute top-[252px] left-[90px] h-2.5 w-[460px] rotate-3 bg-white" />
              <div className="absolute -top-2.5 left-[250px] h-[380px] w-3.5 bg-white" />
              <div className="absolute -top-2.5 left-[407px] h-[380px] w-2.5 -rotate-2 bg-white" />
              <div className="absolute top-[150px] left-[300px] h-20 w-[110px] rounded-[14px] bg-nature-green/14" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/figma/provider/icons/map-you-dot.svg" alt={t.youAreHere} className="absolute top-[106px] left-[376px] size-[22px]" />
              {detail.branches.map((b) => {
                const on = b.id === pin;
                return (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setPin(b.id);
                      // SCROLL_TO كارت الفرع · SCROLL_ANIMATE 400ms EASE_OUT
                      scrollToEl(document.querySelector(`[data-branch="${b.id}"]`), 0.4);
                    }}
                    style={{ left: b.pin.x, top: b.pin.y }}
                    className={`absolute flex items-center gap-1.5 rounded-full py-1 ps-2.5 pe-1 ${
                      on ? "bg-deep-charcoal text-neon-green" : "border border-cool-gray bg-white text-deep-charcoal"
                    }`}
                  >
                    <span className="text-caption" dir="auto">
                      {tx(locale, b, "short")}
                    </span>
                    <LogoTile src={provider.logo} alt="" size={24} radius={12} />
                  </button>
                );
              })}
            </div>
          </div>
          <ContactBranchModal
            locale={locale}
            open={!!contact}
            onClose={() => setContact(null)}
            providerName={name}
            logo={provider.logo}
            branch={detail.branches.find((b) => b.id === contact) ?? null}
            city={city}
          />
        </Container>
      )}

      {active === "reviews" && detail.reviews && (
        <Container className="flex flex-col gap-5 pt-10 pb-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3">{t.reviewsTitle}</h2>
            <p className="text-body-m text-state-gray">{t.reviewsSub}</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
            <div className="flex shrink-0 flex-col gap-2.5 rounded-[18px] bg-deep-charcoal p-5 lg:w-[360px]">
              <div className="flex items-center gap-2.5">
                <span className="text-display-l text-neon-green">{detail.linkar.rating.toFixed(1)}</span>
                <span className="text-body-m text-white">{t.outOf5}</span>
              </div>
              <p className="text-caption text-white/75">{t.linkarRatingsCount(detail.linkar.count)}</p>
              {detail.reviews.distribution.map((count, i) => {
                const stars = 5 - i;
                const total = detail.reviews!.distribution.reduce((a, b) => a + b, 0);
                return (
                  <div key={stars} className="flex items-center gap-2.5">
                    <Icon name="star-filled" size={14} className="text-neon-green" />
                    <span className="w-2 text-label-m text-white">{stars}</span>
                    <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/12">
                      <span className="h-2 rounded-xs bg-neon-green" style={{ width: `${Math.max(2, (count / total) * 100)}%` }} />
                    </span>
                    <span className="w-8 text-caption text-white/70">{count}</span>
                  </div>
                );
              })}
              <Link href={routes.provider(provider.slug, "reviews")} scroll={false} className="flex items-center gap-1 text-label-m text-neon-green hover:underline">
                {t.allReviews}
                <Icon name="chevron-left" size={16} flip />
              </Link>
            </div>
            {detail.reviews.items.map((r, i) => (
              <article key={i} className="flex min-w-0 flex-1 flex-col gap-3 rounded-[18px] border border-cool-gray bg-white p-5">
                <Stars n={r.stars} label={t.stars(r.stars)} />
                <p className="text-body-m text-deep-charcoal">{tx(locale, r, "text")}</p>
                <hr className="border-cool-gray" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-label-m text-deep-charcoal">{tx(locale, r, "who")}</span>
                    <span className="text-caption text-state-gray">{tx(locale, r, "meta")}</span>
                  </div>
                  <span className="shrink-0 text-caption text-state-gray">{tx(locale, r, "ago")}</span>
                </div>
              </article>
            ))}
          </div>
        </Container>
      )}

      {active === "about" && detail.about && (
        <Container className="flex flex-col gap-5 pt-10 pb-2">
          <h2 className="text-h3">{t.aboutTitle(short)}</h2>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-body-l text-deep-charcoal">{tx(locale, detail.about, "text")}</p>
              <div className="flex flex-wrap gap-2.5">
                {detail.about.facts.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-full border border-cool-gray px-3 py-1.5 text-label-m text-deep-charcoal">
                    <Icon name="check" size={16} className="text-nature-green" />
                    {tx(locale, f, "label")}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 rounded-[18px] bg-cool-gray/30 p-5 lg:w-[420px]">
              <p className="text-label-l text-deep-charcoal">{t.policies}</p>
              {detail.about.policies.map((p, i) => (
                <p key={i} className="flex items-start gap-2 text-body-s text-deep-charcoal">
                  <span className="pt-[3px]">
                    <BrandIcon name="shield" size={18} />
                  </span>
                  {tx(locale, p, "text")}
                </p>
              ))}
            </div>
          </div>
        </Container>
      )}
      </div>
    </div>
  );
}
