import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { getCommon } from "@/i18n/dict/common";
import { formatNumber, formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { getSession } from "@/lib/server/session";
import { getService } from "@/lib/server/content";
import { getPackage, getPackageSlugs, getPackagesPage, getRelatedPackages } from "@/lib/server/packages";
import { getCheckoutConfig, getDisplayCars } from "@/lib/server/booking";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { ProviderBadges } from "@/components/ui/Badges";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { OfferCard } from "@/components/cards/OfferCard";
import { LogoTile } from "@/components/booking/LogoTile";
import { carTitle } from "@/components/booking/summary-model";
import { PackageBookingCard } from "@/components/offers/PackageBookingCard";
import { packageListingItem } from "@/components/offers/package-item";

export async function generateStaticParams() {
  return (await getPackageSlugs()).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const data = await getPackage(slug);
  if (!data) return {};
  const t = getBookingDict(locale);
  return {
    title: t.fill(t.packageAt, { title: tx(locale, data.pkg, "title"), provider: tx(locale, data.provider, "short_name") }),
    description: data.pkg.detail ? tx(locale, data.pkg.detail, "description") : tx(locale, data.pkg, "title_line2"),
  };
}

// W2-42 · تفاصيل الباقة (821:2) — باقة Johnson Ceramic Pro لدى جونسون
export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [locale, user, data] = await Promise.all([getLocale(), getSession(), getPackage(slug)]);
  if (!data) notFound();
  const { pkg, provider } = data;
  const t = getBookingDict(locale);
  const c = getCommon(locale);
  const [page, related, cars, config, main] = await Promise.all([
    getPackagesPage(),
    getRelatedPackages(slug),
    getDisplayCars(user),
    getCheckoutConfig(),
    getService(pkg.main_service),
  ]);
  const d = pkg.detail;
  const count = t.servicesCount(pkg.services.length);
  const providerName = tx(locale, provider, "name");
  const shortName = tx(locale, provider, "short_name");
  const title = tx(locale, pkg, "title");
  const save = pkg.old_price - pkg.price;
  const items = d
    ? d.items.map((i) => ({ name: tx(locale, i, "name"), price: i.free ? t.free : formatPrice(locale, i.price), free: i.free }))
    : [{ name: tx(locale, pkg, "line_name"), price: formatPrice(locale, pkg.price), free: false }];
  const facts = [
    {
      label: t.voucherValidity,
      value: t.voucherDays,
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src="/figma/booking/car-outline.svg" alt="" width={14} height={9} className="mx-1" />,
    },
    {
      label: t.warranty,
      value: d ? tx(locale, d, "warranty") : t.detailPending,
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src="/figma/glyphs/feature-warranty.svg" alt="" width={22} height={22} />,
    },
    {
      label: t.duration,
      value: d ? tx(locale, d, "duration") : tx(locale, pkg.features[0], "label"),
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src="/figma/glyphs/feature-calendar.svg" alt="" width={20} height={22} />,
    },
  ];

  return (
    <>
      <Container className="pt-6 pb-4">
        <Breadcrumb
          items={[
            { label: c.home, href: routes.home },
            { label: tx(locale, page, "crumb"), href: routes.packages },
            { label: t.fill(t.packageAt, { title, provider: shortName }) },
          ]}
        />
      </Container>
      <Container className="flex flex-col gap-8 pb-10 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              {main && (
                <span className="flex items-center gap-1.5 rounded-full bg-cool-gray/35 px-3 py-[5px] text-caption">
                  <ServiceGlyph name={main.slug} size={16} className="text-nature-green" />
                  {tx(locale, main, "name")}
                </span>
              )}
              <span className="rounded-full bg-deep-charcoal px-3 py-[5px] text-caption text-neon-green">{t.fill(t.packageBadge, { count })}</span>
            </div>
            <h1 className="text-h3 md:text-h2">{title}</h1>
            <div className="flex flex-wrap items-center gap-2.5 text-caption">
              <LogoTile slug={provider.slug} src={provider.logo} alt={providerName} size={36} />
              <span className="text-label-l">{providerName}</span>
              <ProviderBadges locale={locale} tier={provider.tier} certified={provider.certified} surface="light" />
              <span className="text-text-secondary">·</span>
              <span className="flex items-center gap-1">
                <Icon name="star-filled" size={14} className="text-v3-rating-star" />
                <span className="text-label-m">{provider.rating.toFixed(1)}</span>
              </span>
              {d && <span className="text-text-secondary">{t.fill(t.reviews, { n: formatNumber(d.reviews) })}</span>}
              <span className="text-text-secondary">·</span>
              <Link href={routes.provider(provider.slug)} className="flex items-center gap-0.5 text-label-m text-green-active hover:underline">
                {t.providerPage}
                <Icon name="chevron-left" size={14} flip />
              </Link>
            </div>
            <p className="text-body-l text-text-secondary">{d ? tx(locale, d, "description") : tx(locale, pkg, "title_line2")}</p>
          </div>

          <section className="flex flex-col gap-[18px] rounded-[20px] border border-border-default bg-white p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-h4">{t.includes}</h2>
              <span className="text-caption text-text-secondary">{t.fill(t.includesMeta, { count })}</span>
            </div>
            {d ? (
              d.items.map((i, k) => (
                <div key={i.name_en} className="flex flex-col gap-[18px]">
                  {k > 0 && <hr className="border-border-default" />}
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-neon-green/16">
                      <ServiceGlyph name={i.service} size={16} className="text-nature-green/60" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <h3 className="text-h5">{tx(locale, i, "name")}</h3>
                      <p className="text-body-s text-text-secondary">{tx(locale, i, "description")}</p>
                      <div className="flex flex-wrap gap-2">
                        {i.chips.map((ch) => (
                          <span key={ch.label_en} className="rounded-full bg-cool-gray/35 px-2.5 py-1 text-caption">
                            {tx(locale, ch, "label")}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      {i.free ? (
                        <>
                          <s className="text-caption text-text-secondary">{formatPrice(locale, i.price)}</s>
                          <span className="text-label-l text-green-active">{t.freeInPackage}</span>
                        </>
                      ) : (
                        <span className="text-label-l">{formatPrice(locale, i.price)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-s text-text-secondary">{t.detailPending}</p>
            )}
            <div className="flex flex-col gap-2.5 rounded-[14px] bg-tile px-[18px] py-4">
              <div className="flex items-center justify-between gap-3 text-body-s text-text-secondary">
                <span>{t.separateTotal}</span>
                <s>{formatPrice(locale, pkg.old_price)}</s>
              </div>
              <div className="flex items-center justify-between gap-3 text-body-s">
                <span className="text-text-secondary">{t.yourSavings}</span>
                <span className="font-medium text-green-active">
                  {formatPrice(locale, save)} · {pkg.discount}%
                </span>
              </div>
              <hr className="border-border-default" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-label-l">{t.packagePriceForCar}</span>
                <span className="text-h4 whitespace-nowrap">{formatPrice(locale, pkg.price)}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-lg bg-cool-gray/30 px-4 py-3.5">
                <span className="shrink-0">{f.icon}</span>
                <div className="flex flex-col gap-0.5 text-[14px] leading-[22px]">
                  <span className="font-light text-text-secondary">{f.label}</span>
                  <span className="font-medium">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-h5">{t.terms}</h2>
            {t.termsList.map((term) => (
              <p key={term} className="flex items-center gap-2.5 text-body-s">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neon-green/20">
                  <Icon name="check" size={14} className="text-white" />
                </span>
                {term}
              </p>
            ))}
          </section>
          {d && (
            <p className="flex items-center gap-2.5 rounded-[14px] bg-neon-green/12 px-3.5 py-3 text-body-s">
              <Icon name="info" size={18} className="shrink-0 text-nature-green" />
              {tx(locale, d, "warranty_note")}
            </p>
          )}
        </div>

        <PackageBookingCard
          locale={locale}
          query={{ provider: provider.slug, packages: [pkg.slug] }}
          cars={cars.map((car) => ({ id: car.id, title: carTitle(locale, car), meta: [t.sizes[car.size], tx(locale, car, "plate"), car.is_default ? t.defaultCar : ""].filter(Boolean).join(" · "), label: carTitle(locale, car, true) }))}
          items={items}
          total={formatPrice(locale, pkg.price)}
          totalTitle={t.fill(t.packagePrice, { count })}
          totalSub={t.fill(t.insteadOf, { old: formatPrice(locale, pkg.old_price), save: formatPrice(locale, save) })}
          catalog={config.carCatalog}
        />
      </Container>

      <section className="pt-10 pb-[72px]">
        <Container className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-h4">{tx(locale, page, "other_title")}</h2>
              <p className="text-body-s text-text-secondary">{t.fill(tx(locale, page, "other_subtitle"), { provider: shortName })}</p>
            </div>
            <Link href={routes.packages} className="flex items-center gap-1 text-label-m text-green-active hover:underline">
              {t.allPackages}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(3,313px)] xl:justify-end">
            {related.map((r) => {
              const i = packageListingItem(locale, r);
              return (
                <OfferCard
                  key={i.id}
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
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
