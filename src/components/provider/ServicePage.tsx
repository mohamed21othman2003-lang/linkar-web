"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getProviderDict } from "@/i18n/dict/provider";
import type { Provider, ServiceSlug } from "@/lib/data/types";
import type { CarSize, Marketer, ProviderDetail, ProviderService, ServiceReview } from "@/lib/data/provider-details";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { ProviderBadges } from "@/components/ui/Badges";
import { Icon } from "@/components/icons/Icon";
import { BrandIcon, LogoTile, ServiceTile, Stars, bookingHref } from "./bits";
import { useToast } from "./Modal";
import { ChooseCarModal, type DemoCar } from "./Popups";
import { PhotoViewer } from "./PhotoViewer";
import { TabBar } from "./ProviderTabs";
import { OfferProviderCard } from "./OfferProviderCard";
import { scrollToEl } from "./motion";
import type { ServiceTab } from "./tabs";

export type OtherOffer = {
  provider: Provider;
  name_ar: string;
  name_en: string;
  warranty_ar: string;
  warranty_en: string;
  price: number;
  photo: string;
  in_compare?: boolean;
};

const SIZES: CarSize[] = ["sedan", "suv", "large"];
const MAX_COMPARE = 3;

// W2-32 · الخدمة عند المزوّد (+ W2-32s عبر رابط المسوّق): المعرض، العنوان، الباقة، التبويبات، كارت الحجز،
// مقدّمو خدمة آخرون (مقارنة)، وخدمات أخرى لدى نفس المزوّد — كلهم بيتشاركوا حالة الحجز.
export function ServicePage({
  locale,
  provider,
  detail,
  service,
  tabs,
  initialTab,
  reviews,
  reviewsCount,
  rating,
  otherOffers,
  cars,
  marketer,
  refCode,
  category,
  categoryDefinite,
  packagePrice,
}: {
  locale: Locale;
  provider: Provider;
  detail: ProviderDetail;
  service: ProviderService;
  tabs: ServiceTab[];
  initialTab: ServiceTab;
  reviews: ServiceReview[];
  reviewsCount: number;
  rating: number;
  otherOffers: OtherOffer[];
  cars: DemoCar[] | null;
  marketer: Marketer | null;
  refCode?: string;
  category: { slug: ServiceSlug; name: string };
  categoryDefinite: string;
  packagePrice: { name: string; price: number; old_price: number } | null;
}) {
  const t = getProviderDict(locale);
  const toast = useToast();
  const params = useSearchParams();
  const name = tx(locale, provider, "name");
  const short = tx(locale, provider, "short_name");
  const sName = tx(locale, service, "name");
  const d = service.detail;
  const affiliate = !!marketer;

  // التبويبات
  const fromUrl = params.get("tab") as ServiceTab | null;
  const [tab, setTab] = useState<ServiceTab>(initialTab);
  const active = fromUrl && tabs.includes(fromUrl) ? fromUrl : tab;
  // CHANGE_TO Tab=… · DISSOLVE 200ms EASE_OUT
  const [switched, setSwitched] = useState(false);
  const select = (k: ServiceTab) => {
    setSwitched(true);
    setTab(k);
    const url = new URL(window.location.href);
    if (k === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", k);
    window.history.replaceState(null, "", url.pathname + url.search);
  };
  const tabLabels: Record<ServiceTab, string> = {
    overview: t.serviceTabs.overview,
    specs: t.serviceTabs.specs,
    warranty: t.serviceTabs.warranty,
    photos: t.serviceTabs.photos,
    reviews: t.serviceTabs.reviews(reviewsCount),
  };

  // السيارة والحجم
  const defaultCar = cars?.find((x) => x.is_default) ?? cars?.[0];
  const [carId, setCarId] = useState(defaultCar?.id ?? "");
  const [carOpen, setCarOpen] = useState(false);
  const car = cars?.find((x) => x.id === carId);
  const [guestSize, setGuestSize] = useState<CarSize>("sedan");
  const size: CarSize = car?.size ?? guestSize;

  // الخدمات المضافة لنفس الزيارة
  const [addons, setAddons] = useState<string[]>(d ? detail.default_selection.filter((s) => s !== service.slug) : []);
  const toggle = (id: string) => setAddons((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  // «خدمات أخرى»: Add · SCROLL_TO Booking card · SCROLL_ANIMATE 400ms EASE_OUT
  const addAndScroll = (id: string) => {
    toggle(id);
    // الكارت sticky — بنمرّر لبداية الشبكة اللي فيه عشان مكانه ثابت
    scrollToEl(document.getElementById("booking-card")?.parentElement ?? null, 0.4);
  };
  const others = detail.services.filter((s) => s.slug !== service.slug);
  const ordered = [...service.addons, ...others.map((s) => s.slug).filter((s) => !service.addons.includes(s))]
    .map((id) => others.find((s) => s.slug === id))
    .filter((s): s is ProviderService => !!s);
  const cardAddons = ordered.filter((s) => service.addons.includes(s.slug) || addons.includes(s.slug));
  const picked = [service, ...ordered.filter((s) => addons.includes(s.slug))];
  const total = picked.reduce((a, s) => a + s.prices[size], 0);
  const credit = marketer && total >= marketer.min_total ? marketer.credit : 0;
  const href = bookingHref({ provider: provider.slug, services: picked.map((s) => s.slug), size, ref: marketer ? (refCode ?? marketer.code) : undefined });

  // المقارنة مع مزوّدين تانيين
  const [compare, setCompare] = useState<string[]>(otherOffers.filter((o) => o.in_compare).map((o) => o.provider.slug));
  const toggleCompare = (slug: string) => {
    if (compare.includes(slug)) return setCompare(compare.filter((x) => x !== slug));
    // الخدمة الحالية + خدمتين بحد أقصى (3 في المقارنة)
    if (compare.length >= MAX_COMPARE - 1) return;
    const next = [...compare, slug];
    setCompare(next);
    toast({ text: t.addedToCompare(next.length + 1), icon: "check" });
  };
  const compareItems = [
    t.compareItem(sName, short),
    ...otherOffers.filter((o) => compare.includes(o.provider.slug)).map((o) => t.compareItem(tx(locale, o, "name"), tx(locale, o.provider, "short_name"))),
  ];

  // الفرع الأقرب لموقعك في كارت الحجز
  const branch = [...detail.branches].sort((x, y) => x.distance_km - y.distance_km)[0];

  // الصور
  const photos = d?.photos ?? [service.photo];
  const cover = d?.cover ?? service.photo;
  const thumbs = photos.slice(0, 3);
  const [viewer, setViewer] = useState<number | null>(null);
  const [bannerHidden, setBannerHidden] = useState(false);

  const factIcon = { duration: "calendar", warranty: "shield", suitable: "car" } as const;
  const facts =
    d?.facts ??
    [
      service.duration_ar ? { kind: "duration" as const, value_ar: service.duration_ar, value_en: service.duration_en } : null,
      service.warranty_label ? { kind: "warranty" as const, value_ar: service.warranty_label.label_ar, value_en: service.warranty_label.label_en } : null,
    ].filter((f) => !!f);

  return (
    <>
      {affiliate && !bannerHidden && marketer && (
        <div className="pb-2">
          <div className="flex items-center gap-3.5 rounded-lg border border-neon-green/70 bg-neon-green/16 px-4 py-3.5 sm:px-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neon-green text-deep-charcoal">
              <Icon name="tag" size={20} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-label-l text-deep-charcoal">
                {t.affiliateTitle(tx(locale, marketer, "name"), marketer.code, formatPrice(locale, marketer.credit))}
              </p>
              <p className="text-body-s text-state-gray">{t.affiliateSub(formatPrice(locale, marketer.min_total))}</p>
            </div>
            <button type="button" aria-label={t.hide} onClick={() => setBannerHidden(true)} className="shrink-0 self-start text-state-gray hover:text-deep-charcoal sm:self-center">
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 pb-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Main */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex h-[260px] gap-3 sm:h-[380px]">
            <button type="button" onClick={() => setViewer(0)} className="relative min-w-0 flex-1 overflow-hidden rounded-xl">
              <Image src={cover} alt={sName} fill priority sizes="(min-width: 1440px) 656px, 100vw" className="object-cover" />
            </button>
            <div className="hidden w-[180px] shrink-0 flex-col gap-3 sm:flex">
              {thumbs.map((src, i) => {
                const last = i === thumbs.length - 1 && photos.length > thumbs.length;
                return (
                  <button key={i} type="button" onClick={() => setViewer(i)} className="relative min-h-0 flex-1 overflow-hidden rounded-[14px]">
                    <Image src={src} alt={t.photoAlt(sName, i + 1)} fill sizes="360px" className="object-cover" />
                    {last && (
                      <span className="absolute inset-0 flex items-center justify-center bg-deep-charcoal/55 text-label-m text-white">
                        {t.morePhotos(photos.length - thumbs.length)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {affiliate && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={routes.search({ services: [category.slug] })}
                  className="flex items-center gap-1.5 rounded-full bg-cool-gray/35 px-3 py-[5px] text-caption text-deep-charcoal hover:bg-cool-gray/60"
                >
                  <ServiceTile name={category.slug} size={16} variant="outline" />
                  {category.name}
                </Link>
                {service.popular && <span className="rounded-full bg-deep-charcoal px-3 py-[5px] text-caption text-neon-green">{t.popular}</span>}
              </div>
            )}
            <h1 className="text-h3 md:text-h2">{sName}</h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <Link href={routes.provider(provider.slug)} className="flex items-center gap-2.5">
                {/* Partner logo · Tile 56 (r 24.9) في العميل المعدّل */}
                <LogoTile src={provider.logo} alt={name} size={56} radius={25} />
                <span className="text-label-l text-deep-charcoal">{name}</span>
              </Link>
              {/* العميل المعدّل: التصنيف بس حتى في W2-32s (اتشالت «معتمد LINKAR») */}
              <ProviderBadges locale={locale} tier={provider.tier} certified={false} surface="light" />
              {reviewsCount > 0 && (
                <>
                  <span className="text-caption text-state-gray">·</span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="star-filled" size={14} className="text-v3-rating-star" />
                    <span className="text-label-m text-deep-charcoal">{rating.toFixed(1)}</span>
                    <span className="text-caption text-state-gray">{t.serviceReviewsCount(reviewsCount)}</span>
                  </span>
                </>
              )}
              {affiliate && (
                <>
                  <span className="text-caption text-state-gray">·</span>
                  <Link href={routes.provider(provider.slug)} className="flex items-center gap-0.5 text-label-m text-green-active hover:underline">
                    {t.providerPage}
                    <Icon name="chevron-left" size={14} flip />
                  </Link>
                </>
              )}
            </div>
          </div>

          {d?.package_banner && packagePrice && (
            <div className="flex flex-col gap-3 rounded-xl bg-deep-charcoal px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="tag" size={22} className="shrink-0 text-neon-green" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-label-l text-white">{tx(locale, d.package_banner, "title")}</p>
                  <p className="text-caption text-white/75">
                    {t.packageBannerSub(packagePrice.name, formatPrice(locale, packagePrice.price), formatPrice(locale, packagePrice.old_price))}
                  </p>
                </div>
              </div>
              <Link
                href={routes.package(d.package_banner.package)}
                className="flex w-fit shrink-0 items-center gap-1 rounded-[10px] bg-neon-green px-3.5 py-[9px] text-label-m text-deep-charcoal hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out"
              >
                {t.bookAsPackage}
                <Icon name="chevron-left" size={14} flip />
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="border-b border-cool-gray">
              <TabBar
                label={sName}
                tabs={tabs.map((k) => ({ key: k, label: tabLabels[k] }))}
                active={active}
                onSelect={select}
                hrefFor={(k) => routes.providerService(provider.slug, service.slug, k === "overview" ? undefined : k)}
                gap="gap-7"
                pt="pt-2"
                inner="gap-2.5"
              />
            </div>

            <div key={active} className={switched ? "animate-dissolve" : undefined}>
            {active === "overview" && (
              <div className="flex flex-col gap-[18px]">
                <p className="text-body-l text-deep-charcoal">{d ? tx(locale, d, "overview") : tx(locale, service, "description")}</p>
                {facts.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {facts.map((f) => (
                      <div key={f.kind} className="flex items-center gap-3 rounded-lg bg-cool-gray/30 px-4 py-3.5">
                        <BrandIcon name={factIcon[f.kind]} size={22} />
                        <div className="flex flex-col gap-0.5 text-caption">
                          <span className="text-state-gray">{t.facts[f.kind]}</span>
                          <span className="text-label-m text-deep-charcoal">{tx(locale, f, "value")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {d && d.includes_chips.length > 0 && (
                  <>
                    <h2 className="text-h5">{t.includesTitle}</h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-2.5">
                      {d.includes_chips.map((it, i) => (
                        <span key={i} className="flex items-center gap-2 rounded-md border border-cool-gray px-3 py-2 text-body-s text-deep-charcoal">
                          <Icon name="check" size={16} className="text-nature-green" />
                          {tx(locale, it, "label")}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {d?.warranty_note && (
                  <p className="flex items-center gap-2.5 rounded-[14px] bg-neon-green/12 px-3.5 py-3 text-body-s text-deep-charcoal">
                    <Icon name="info" size={18} className="shrink-0 text-nature-green" />
                    {tx(locale, d.warranty_note, "text")}
                  </p>
                )}
              </div>
            )}

            {/* Tab=المواصفات التقنية (85:26713): جدول بصفوف متبادلة — البند في البداية والقيمة في النهاية */}
            {active === "specs" && d && (
              <dl className="mb-0 overflow-hidden rounded-[14px] border border-[#e6e8e6] bg-white">
                {d.specs.map((it, i) => (
                  <div key={i} className={`flex items-center justify-between gap-4 px-5 py-3 ${i % 2 ? "bg-white" : "bg-page-soft"}`}>
                    <dt className="text-[14px] leading-[18px] font-normal text-state-gray">{tx(locale, it, "label")}</dt>
                    <dd className="text-end text-[14px] leading-[18px] font-medium text-deep-charcoal">{tx(locale, it, "value")}</dd>
                  </div>
                ))}
              </dl>
            )}

            {active === "warranty" && (
              <p className="pb-6 text-body-m text-deep-charcoal">
                {d?.warranty_text ? tx(locale, d.warranty_text, "text") : service.warranty_label ? tx(locale, service.warranty_label, "label") : ""}
              </p>
            )}

            {active === "photos" && (
              <div className="flex flex-wrap gap-2.5 pb-6">
                {photos.map((src, i) => (
                  <button key={i} type="button" onClick={() => setViewer(i)} className="relative h-[120px] w-[calc(50%-5px)] overflow-hidden rounded-md bg-tile sm:w-[180px]">
                    <Image src={src} alt={t.photoAlt(sName, i + 1)} fill sizes="360px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {active === "reviews" && (
              <div className="flex flex-col gap-4 pb-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-h4">{t.serviceReviewsTitle}</h2>
                    <p className="text-body-s text-state-gray">{t.serviceReviewsSub(rating.toFixed(1), reviewsCount, short)}</p>
                  </div>
                  <Link href={routes.provider(provider.slug, "reviews")} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
                    {t.allReviews}
                    <Icon name="chevron-left" size={16} flip />
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {reviews.map((r, i) => (
                    <article key={i} className="flex flex-col gap-2.5 rounded-[18px] border border-cool-gray bg-white p-[18px]">
                      <Stars n={r.stars} size={14} label={t.stars(r.stars)} />
                      <p className="text-body-m text-deep-charcoal">{tx(locale, r, "text")}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 text-caption">
                        <span className="text-label-m text-deep-charcoal">{tx(locale, r, "who")}</span>
                        <span className="shrink-0 text-state-gray">{tx(locale, r, "ago")}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Booking card — الخطوة 1 «الخدمات» */}
        <aside id="booking-card" className="h-fit rounded-2xl border border-v3-card-stroke bg-white p-6 shadow-[0_12px_12px_0_#14293614] sticky top-[104px] max-lg:static">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-label-m text-deep-charcoal">{t.yourCar}</span>
              {car ? (
                <button
                  type="button"
                  onClick={() => setCarOpen(true)}
                  className="flex items-center justify-between gap-3 rounded-md border border-cool-gray bg-white px-3.5 py-3 text-start hover:border-border-strong"
                >
                  <span className="text-label-l text-deep-charcoal">{`${car.name} · ${t.sizes[car.size]}`}</span>
                  <span className="text-label-m text-green-active">{t.change}</span>
                </button>
              ) : (
                <div role="radiogroup" aria-label={t.yourCar} className="flex gap-1 rounded-md bg-cool-gray/40 p-1">
                  {SIZES.map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={guestSize === k}
                      onClick={() => setGuestSize(k)}
                      className={`flex-1 rounded-[9px] px-2 py-[7px] text-label-m whitespace-nowrap ${guestSize === k ? "bg-deep-charcoal text-white" : "text-deep-charcoal hover:bg-white/60"}`}
                    >
                      <span dir="auto">{t.sizes[k]}</span>
                    </button>
                  ))}
                </div>
              )}
              <span className="text-caption text-v3-text-meta">{t.priceByCar}</span>
            </div>
            <hr className="border-cool-gray" />
            {/* الفرع الأقرب (العميل المعدّل): «فرع الزهراء · على بُعد 5.6 كم من موقعك · الأقرب إليك» — «تغيير» يفتح خطوة الفرع (W2-33) */}
            {branch && (
              <div className="flex items-center justify-between gap-3 rounded-[14px] border border-neon-green bg-neon-green/12 px-3.5 py-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-label-l text-deep-charcoal">
                    <Icon name="map-pin" size={16} className="shrink-0 text-nature-green" />
                    {tx(locale, branch, "name")}
                  </span>
                  <span className="text-label-m text-green-active">{`${t.branchDistance(branch.distance_km.toFixed(1))} · ${t.nearestSuffix}`}</span>
                </div>
                <Link href={href} className="shrink-0 text-label-m text-green-active hover:underline">
                  {t.change}
                </Link>
              </div>
            )}
            <span className="text-label-m text-v3-text-meta">{t.selectedService}</span>
            <div className="flex items-center justify-between gap-3 rounded-md border-2 border-neon-green bg-neon-green/6 px-3 py-2.5">
              <span className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-[6px] bg-neon-green">
                  <Icon name="check" size={14} />
                </span>
                <span className="text-body-s text-deep-charcoal">{sName}</span>
              </span>
              <span className="text-label-m whitespace-nowrap text-deep-charcoal">{formatPrice(locale, service.prices[size])}</span>
            </div>
            {cardAddons.length > 0 && (
              <>
                <span className="text-label-m text-deep-charcoal">{t.addMore(short)}</span>
                <span className="text-caption text-v3-text-meta">{t.addMoreSub}</span>
                {cardAddons.map((s) => {
                  const on = addons.includes(s.slug);
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(s.slug)}
                      className={`flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-start ${
                        on ? "border-2 border-neon-green bg-neon-green/6" : "border border-cool-gray bg-white hover:border-border-strong"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {on ? (
                          <span className="flex size-5 items-center justify-center rounded-[6px] bg-neon-green">
                            <Icon name="check" size={14} />
                          </span>
                        ) : (
                          <span className="size-5 rounded-[6px] border border-state-gray bg-white" />
                        )}
                        <span className="text-body-s text-deep-charcoal">{tx(locale, s, "name")}</span>
                      </span>
                      <span className="text-label-m whitespace-nowrap text-deep-charcoal">{formatPrice(locale, s.prices[size])}</span>
                    </button>
                  );
                })}
              </>
            )}
            <hr className="border-cool-gray" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-label-l text-deep-charcoal">{t.totalCount(picked.length)}</span>
                <span className="text-caption text-v3-text-meta">{t.oneVisitPay}</span>
              </div>
              <span className="text-h4 whitespace-nowrap text-deep-charcoal">{formatPrice(locale, total)}</span>
            </div>
            <span className="text-caption text-v3-text-meta">{picked.map((s) => tx(locale, s, "name")).join(" + ")}</span>
            {credit > 0 && marketer && (
              <div className="flex items-center gap-2 rounded-md bg-bg-success-subtle px-3 py-2.5">
                <Icon name="tag" size={16} className="shrink-0 text-nature-green" />
                <span className="min-w-0 flex-1 text-label-m text-deep-charcoal">{t.marketerCredit(marketer.voucher_code)}</span>
                <span className="text-label-m whitespace-nowrap text-green-active">{`−${formatPrice(locale, credit)}`}</span>
              </div>
            )}
            <Link href={href} className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-neon-green px-5 text-label-l text-deep-charcoal hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out">
              {t.continue}
              <Icon name="chevron-left" size={18} flip />
            </Link>
            <p className="flex items-center gap-1.5 text-caption text-v3-text-meta">
              <BrandIcon name="shield" size={16} />
              {t.voucherNote}
            </p>
          </div>
        </aside>
      </div>

      {/* مقدّمو خدمة آخرون يقدّمون نفس الخدمة */}
      {otherOffers.length > 0 && (
        <section className="flex flex-col gap-4 pt-10 pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-h4">{t.otherProvidersTitle(categoryDefinite)}</h2>
              <p className="text-body-s text-state-gray">{t.otherProvidersSub}</p>
            </div>
            <Link href={routes.search({ services: [category.slug] })} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
              {t.allProvidersOf(categoryDefinite)}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </div>
          {/* العميل المعدّل: 4 كروت شعار (v2 · Provider card · Logo) بزر «قارن» — 2×2 تحت xl */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[25.3px]">
            {otherOffers.map((o) => (
              <OfferProviderCard
                key={o.provider.slug}
                locale={locale}
                offer={o}
                inCompare={compare.includes(o.provider.slug)}
                onCompare={() => toggleCompare(o.provider.slug)}
              />
            ))}
          </div>
          {compare.length > 0 && (
            <div className="flex flex-col gap-3 rounded-lg bg-cool-gray/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-body-s text-deep-charcoal">{t.compareSummary(compareItems)}</p>
              <Link
                href={routes.search({ services: [category.slug] })}
                className="flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-deep-charcoal px-4 py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
              >
                {t.compareNow(compareItems.length)}
                <Icon name="chevron-left" size={16} flip />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* خدمات أخرى لدى نفس المزوّد */}
      {ordered.length > 0 && (
        <section className="flex flex-col gap-4 pt-10 pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-h4">{t.otherServicesTitle(short)}</h2>
              <p className="text-body-s text-state-gray">{t.otherServicesSub}</p>
            </div>
            <Link href={routes.provider(provider.slug)} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
              {t.providerPage}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ordered.map((s) => {
              const on = addons.includes(s.slug);
              const meta = [tx(locale, s, "duration"), s.warranty_label ? tx(locale, s.warranty_label, "label") : "", formatPrice(locale, s.prices[size])].filter(Boolean).join(" · ");
              return (
                <div
                  key={s.slug}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  onClick={(e) => !(e.target as HTMLElement).closest("a") && addAndScroll(s.slug)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), addAndScroll(s.slug))}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-[18px] p-4 transition-colors duration-200 ease-figma-out ${on ? "border-2 border-neon-green bg-neon-green/6" : "border border-cool-gray bg-white"}`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <ServiceTile name={s.icon} size={44} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-label-l text-deep-charcoal">{tx(locale, s, "name")}</span>
                      <span className="text-caption text-v3-text-meta">{meta}</span>
                    </span>
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-[10px] px-3 py-[7px] text-label-m text-deep-charcoal ${
                      on ? "bg-neon-green hover:bg-bg-brand-hover active:bg-bg-brand-pressed transition-colors duration-200 ease-figma-out" : "border border-deep-charcoal bg-white hover:bg-tile"
                    }`}
                  >
                    {on ? t.added : t.add}
                    <Icon name={on ? "check" : "plus"} size={14} />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <PhotoViewer
        locale={locale}
        open={viewer !== null}
        onClose={() => setViewer(null)}
        title={`${sName} · ${name}`}
        photos={photos}
        index={viewer ?? 0}
        onIndex={setViewer}
      />
      {cars && car && (
        <ChooseCarModal
          locale={locale}
          open={carOpen}
          onClose={() => setCarOpen(false)}
          cars={cars}
          value={car.id}
          onConfirm={(id) => {
            setCarId(id);
            setCarOpen(false);
          }}
        />
      )}
    </>
  );
}
