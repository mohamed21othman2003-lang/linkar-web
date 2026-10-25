"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { Provider, ServiceSlug } from "@/lib/data/types";
import { formatNumber, formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { OfferCard, type OfferFeature } from "@/components/cards/OfferCard";
import { OfferFeaturedCard } from "@/components/cards/OfferFeaturedCard";
import { DropdownMenu, LabeledTrigger } from "@/components/booking/DropdownMenu";
import { Toggle } from "@/components/booking/Radio";
import { LogoTile } from "@/components/booking/LogoTile";
import { Toast } from "@/components/booking/Modal";
import { ChooseCarModal, type CarOption } from "@/components/booking/popups";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export type ListingItem = {
  id: string;
  provider: Provider;
  providerLabel?: string; // الاسم في لوحة التصفية لو مختلف عن الكارت
  services: ServiceSlug[];
  discount: number;
  price: number;
  oldPrice: number;
  title: [string, string];
  featuredTitle?: string;
  features: OfferFeature[];
  featured: boolean;
  endsAt: string | null;
  detailsHref: string;
  bookHref: string;
};

type Sort = "discount" | "savings" | "nearest" | "ending" | "price";
type Chip = "all" | string;

// W2-40 العروض · W2-41 الباقات: لوحة التصفية (تشتغل فعلاً) + الترتيب (P-11b) + الفلاتر النشطة + الكروت
export function Listing({
  locale,
  kind,
  items,
  context,
}: {
  locale: Locale;
  kind: "offers" | "packages";
  items: ListingItem[];
  context: {
    car: string;
    carFull: string;
    area: string;
    priceMin: number;
    priceMax: number;
    providerOrder?: string[];
    cars?: (CarOption & { short: string; full: string })[]; // P-15 «اختر سيارتك» من «نوع السيارة»
  };
}) {
  const t = getBookingDict(locale);
  const offers = kind === "offers";
  const defaultSort: Sort = offers ? "discount" : "savings";
  const [sort, setSort] = useState<Sort>(defaultSort);
  const [providers, setProviders] = useState<string[]>([]);
  const [providerQuery, setProviderQuery] = useState("");
  const [services, setServices] = useState<ServiceSlug[]>([]);
  const [type, setType] = useState<Chip>("all"); // offers: single|multi · packages: 2|3
  const [threshold, setThreshold] = useState<Chip>("all"); // offers: نسبة الخصم · packages: قيمة التوفير
  const [distance, setDistance] = useState<Chip>("all");
  const [priceFrom, setPriceFrom] = useState(context.priceMin);
  const [priceTo, setPriceTo] = useState(context.priceMax);
  const [endingSoon, setEndingSoon] = useState<number | null>(null); // وقت التفعيل
  const [showCar, setShowCar] = useState(true);
  const [showArea, setShowArea] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);

  const providerList = useMemo(() => {
    const map = new Map<string, { provider: Provider; label: string; count: number }>();
    for (const i of items)
      map.set(i.provider.slug, { provider: i.provider, label: i.providerLabel ?? tx(locale, i.provider, "name"), count: (map.get(i.provider.slug)?.count ?? 0) + 1 });
    const order = context.providerOrder ?? [];
    const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : order.length);
    return [...map.values()].sort((a, b) => rank(a.provider.slug) - rank(b.provider.slug));
  }, [items, locale, context.providerOrder]);
  const serviceOrder: ServiceSlug[] = offers ? ["ppf", "tint", "polish", "nano-ceramic"] : ["wash", "ppf", "tint", "polish", "nano-ceramic"];
  const serviceCount = (s: ServiceSlug) => items.filter((i) => i.services.includes(s)).length;

  const soon = (i: ListingItem, now: number) => !!i.endsAt && new Date(i.endsAt).getTime() - now < 7 * 864e5;
  const filtered = items.filter((i) => {
    if (providers.length && !providers.includes(i.provider.slug)) return false;
    if (services.length && !services.some((s) => i.services.includes(s))) return false;
    if (offers) {
      if (type === "single" && i.services.length !== 1) return false;
      if (type === "multi" && i.services.length < 2) return false;
      if (threshold !== "all" && i.discount < Number(threshold)) return false;
      if (endingSoon && !soon(i, endingSoon)) return false;
    } else {
      if (type === "2" && i.services.length !== 2) return false;
      if (type === "3" && i.services.length < 3) return false;
      if (threshold !== "all" && i.oldPrice - i.price < Number(threshold)) return false;
    }
    if (distance !== "all" && i.provider.distance_km > Number(distance)) return false;
    if (i.price < priceFrom || i.price > priceTo) return false;
    return true;
  });
  const sorted = sort === defaultSort ? filtered : [...filtered].sort((a, b) => {
    if (sort === "discount") return b.discount - a.discount;
    if (sort === "savings") return b.oldPrice - b.price - (a.oldPrice - a.price);
    if (sort === "nearest") return a.provider.distance_km - b.provider.distance_km;
    if (sort === "price") return a.price - b.price;
    return (a.endsAt ? new Date(a.endsAt).getTime() : Infinity) - (b.endsAt ? new Date(b.endsAt).getTime() : Infinity);
  });
  // العرض المميّز أولاً (بيمتد على عمودين في الديسكتوب)
  const ordered = [...sorted.filter((i) => i.featured), ...sorted.filter((i) => !i.featured)];

  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [carId, setCarId] = useState(context.cars?.[0]?.id ?? "");
  const [choosingCar, setChoosingCar] = useState(false);
  const carSel = context.cars?.find((c) => c.id === carId);
  const clearAll = () => {
    setToast(t.filtersCleared); // P-10o (OVERLAY · DISSOLVE 200ms، يقفل بعد 2s)
    setProviders([]);
    setProviderQuery("");
    setServices([]);
    setType("all");
    setThreshold("all");
    setDistance("all");
    setPriceFrom(context.priceMin);
    setPriceTo(context.priceMax);
    setEndingSoon(null);
  };
  const toggleProvider = (slug: string) => setProviders((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug]));
  const toggleService = (s: ServiceSlug) => setServices((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const typeChips: [Chip, string][] = offers
    ? [["single", t.single], ["multi", t.multi], ["all", t.all]]
    : [["all", t.all], ["2", t.twoServices], ["3", t.threePlus]];
  const thresholdChips: [Chip, string][] = offers
    ? [["all", t.all], ["15", "15%+"], ["20", "20%+"]]
    : [["all", t.all], ["300", "300+"], ["1000", `${formatNumber(1000)}+`]];
  const distanceChips: [Chip, string][] = [["all", t.all], ["5", t.fill(t.upToKm, { n: 5 })], ["10", t.fill(t.upToKm, { n: 10 })]];
  const fill = (v: number) => Math.min(100, Math.max(0, ((v - context.priceMin) / (context.priceMax - context.priceMin)) * 100));

  const activeChips = [
    ...(providers.length
      ? providers.map((s) => ({ key: s, label: providerList.find((p) => p.provider.slug === s)!.label, clear: () => toggleProvider(s) }))
      : [{ key: "all", label: t.allProviders, clear: () => setProviders([]) }]),
    ...(showArea ? [{ key: "area", label: context.area, clear: () => setShowArea(false) }] : []),
    ...(showCar ? [{ key: "car", label: carSel?.short ?? context.car, clear: () => setShowCar(false) }] : []),
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        aria-expanded={panelOpen}
        className="flex h-11 items-center justify-center gap-2 rounded-md border border-border-default bg-white text-label-m lg:hidden"
      >
        <Icon name="filter" size={18} className="text-nature-green" />
        {t.filterButton}
      </button>
      <aside className={`${panelOpen ? "flex" : "hidden"} w-full shrink-0 flex-col gap-[18px] rounded-[20px] border border-border-default bg-white p-[22px] lg:flex lg:w-[286px]`}>
        <div className="flex items-center justify-between">
          <span className="text-h5">
            {offers ? t.filterOffers : t.filterPackages}
          </span>
          <button type="button" onClick={clearAll} className="text-label-m text-green-active hover:underline">
            {t.clearAll}
          </button>
        </div>

        <FilterGroup title={t.provider}>
          <label className="flex h-11 items-center gap-2 rounded-[10px] border border-border-default px-3">
            <Icon name="search" size={14} className="text-state-gray" />
            <input
              value={providerQuery}
              onChange={(e) => setProviderQuery(e.target.value)}
              placeholder={t.searchProvider}
              className="min-w-0 flex-1 bg-transparent text-body-s outline-none placeholder:text-text-secondary"
            />
          </label>
          <CheckRow on={!providers.length} label={t.allProviders} count={items.length} onClick={() => setProviders([])} />
          {providerList
            .filter(({ label }) => !providerQuery || label.includes(providerQuery.trim()))
            .map(({ provider, label, count }) => (
              <CheckRow
                key={provider.slug}
                on={providers.includes(provider.slug)}
                label={label}
                count={count}
                onClick={() => toggleProvider(provider.slug)}
                logo={<LogoTile slug={provider.slug} src={provider.logo} alt="" size={22} />}
              />
            ))}
        </FilterGroup>

        <FilterGroup title={t.service}>
          {serviceOrder.map((s) => (
            <CheckRow key={s} on={services.includes(s)} label={t.serviceNames[s]} count={serviceCount(s)} onClick={() => toggleService(s)} />
          ))}
        </FilterGroup>

        <FilterGroup title={offers ? t.offerType : t.servicesNum}>
          <Chips value={type} options={typeChips} onChange={setType} wrap={offers} />
        </FilterGroup>
        <FilterGroup title={offers ? t.discountPct : t.savings}>
          <Chips value={threshold} options={thresholdChips} onChange={setThreshold} />
        </FilterGroup>
        <FilterGroup title={t.distance}>
          <Chips value={distance} options={distanceChips} onChange={setDistance} />
        </FilterGroup>

        <FilterGroup title={t.price}>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                [t.from, priceFrom, setPriceFrom],
                [t.to, priceTo, setPriceTo],
              ] as const
            ).map(([label, value, set]) => (
              <label key={label} className="flex flex-col gap-0.5 rounded-[10px] border border-border-default px-3 py-2">
                <span className="text-caption text-text-secondary">{label}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatPrice(locale, value)}
                  onChange={(e) => set(Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                  className="w-full min-w-0 bg-transparent text-label-m outline-none"
                  aria-label={`${t.price} ${label}`}
                />
                            </label>
            ))}
          </div>
          <div className="relative h-1.5 rounded-full bg-cool-gray">
            <span className="absolute inset-y-0 rounded-full bg-nature-green" style={{ insetInlineStart: `${fill(priceFrom)}%`, insetInlineEnd: `${100 - fill(priceTo)}%` }} />
          </div>
        </FilterGroup>

        <FilterGroup title={t.carType}>
          <span className="relative">
            {/* النموذج الأولي: Select ← P-15 «اختر سيارتك» */}
            <button
              type="button"
              onClick={() => setChoosingCar(true)}
              className="flex h-[46px] w-full items-center justify-between rounded-[10px] border border-border-default bg-white px-3 text-body-s"
            >
              {carSel?.full ?? context.carFull}
              <Icon name="chevron-down" size={14} />
            </button>
          </span>
        </FilterGroup>

        {offers && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-label-m">{t.endingSoonOnly}</span>
            <Toggle on={!!endingSoon} onChange={(v) => setEndingSoon(v ? Date.now() : null)} label={t.endingSoonOnly} />
          </div>
        )}

        <a
          href="#results"
          onClick={() => {
            setPanelOpen(false);
            setToast(t.filtersApplied); // P-10s
          }}
          className="flex h-12 items-center justify-center rounded-md bg-neon-green text-label-l transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
        >
          {offers ? t.showOffers(ordered.length) : t.showPackages(ordered.length)}
        </a>
      </aside>

      <section id="results" className="@container flex min-w-0 flex-1 scroll-mt-28 flex-col gap-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h5">{offers ? t.offersCount(ordered.length) : t.packagesCount(ordered.length)}</h2>
          <DropdownMenu
            label={t.sortLabel}
            value={sort}
            onChange={setSort}
            align="end"
            options={(Object.keys(t.sort) as Sort[]).map((s) => ({ value: s, label: t.sort[s] }))}
            trigger={(open) => <LabeledTrigger prefix={t.sortLabel} value={t.sort[sort]} open={open} />}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {activeChips.map((c) => (
            <span key={c.key} className="flex h-8 items-center gap-1.5 rounded-full bg-tile px-2.5 text-body-s">
              {c.label}
              <button type="button" onClick={c.clear} aria-label={`${t.clearAll}: ${c.label}`} className="text-state-gray hover:text-deep-charcoal">
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>

        {ordered.length ? (
          // W2-40: الصف الأول في الفيجما = العرض المميّز (620 وجوّاه الكارت 611 بإزاحة 4.5) + كارت بفاصل 18.9
          // الـ3 أعمدة الثابتة (313×3 + 18.9×2 = 977) بس لما مساحة النتايج تكفّيها (container query) — أضيق من كده عمودين
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 @min-[977px]:grid-cols-[repeat(3,313px)] @min-[977px]:gap-x-[18.9px]">
            {ordered.map((i, k) =>
              i.featured ? (
                <div key={i.id} className="flex justify-center sm:col-span-2 sm:max-md:[zoom:0.9] @min-[977px]:relative @min-[977px]:top-1 @min-[977px]:justify-start @min-[977px]:ps-[4.5px]">
                  <OfferFeaturedCard
                    locale={locale}
                    provider={i.provider}
                    discount={i.discount}
                    title={i.featuredTitle ?? i.title.join(" ").trim()}
                    price={i.price}
                    oldPrice={i.oldPrice}
                    endsAt={i.endsAt ?? ""}
                    bookHref={i.bookHref}
                  />
                </div>
              ) : (
                <div key={i.id} className={k === 1 && ordered[0].featured ? "@min-[977px]:rtl:translate-x-[25px] @min-[977px]:ltr:-translate-x-[25px]" : undefined}>
                  <Card i={i} locale={locale} onOpen={offers ? undefined : () => router.push(i.detailsHref)} />
                </div>
              ),
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-white p-8 text-center text-body-m text-text-secondary">{t.noResults}</p>
        )}
      </section>
      <Toast message={toast} onDone={() => setToast(null)} />
      {context.cars?.length ? (
        <ChooseCarModal
          key={carId}
          locale={locale}
          open={choosingCar}
          cars={context.cars}
          value={carId}
          onClose={() => setChoosingCar(false)}
          onAdd={() => router.push(routes.cars)}
          onConfirm={(id) => (setCarId(id), setChoosingCar(false), setShowCar(true))}
        />
      ) : null}
    </div>
  );
}

// W2-41: الضغط على كارت الباقة كله يفتح W2-42 (ماعدا الأزرار والروابط جوّاه)
function Card({ i, locale, onOpen }: { i: ListingItem; locale: Locale; onOpen?: () => void }) {
  const card = (
    <OfferCard
      locale={locale}
      provider={i.provider}
      discount={i.discount}
      title={i.title}
      features={i.features}
      price={i.price}
      oldPrice={i.oldPrice}
      detailsHref={i.detailsHref}
      bookHref={i.bookHref}
    />
  );
  if (!onOpen) return card;
  return (
    <div className="cursor-pointer" onClick={(e) => !(e.target as HTMLElement).closest("a,button") && onOpen()}>
      {card}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="mb-2.5 text-label-l">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckRow({ on, label, count, onClick, logo }: { on: boolean; label: string; count: number; onClick: () => void; logo?: React.ReactNode }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={onClick} className="flex h-6 items-center justify-between gap-2 text-start">
      <span className="flex min-w-0 items-center gap-2">
        <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-150 ease-figma-out ${on ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-border-default bg-white"}`}>
          {on && <Icon name="check" size={12} className="animate-dissolve-fast" />}
        </span>
        <span className="truncate text-body-s">{label}</span>
        {logo}
      </span>
      <span className="text-caption text-text-secondary">{count}</span>
    </button>
  );
}

// Figma: صف واحد بيطلع شوية برّه اللوحة (255 > 240)، ماعدا «نوع العرض» بيلف لسطرين
function Chips<V extends string>({ value, options, onChange, wrap = false }: { value: V; options: [V, string][]; onChange: (v: V) => void; wrap?: boolean }) {
  return (
    <div className={`flex gap-1.5 ${wrap ? "flex-wrap" : "flex-nowrap max-lg:flex-wrap"}`}>
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`flex h-9 shrink-0 items-center rounded-full border px-3 text-label-m transition-colors duration-150 ease-figma-out ${value === v ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : "border-border-default bg-white"}`}
        >
          <bdi>{label}</bdi>
        </button>
      ))}
    </div>
  );
}
