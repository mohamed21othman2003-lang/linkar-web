import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import { getSession } from "@/lib/server/session";
import { getCars } from "@/lib/server/account-extra";
import { getCategory, getMarketer, getOtherOffers, getProviderService, getProviderServiceParams } from "@/lib/server/providers";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { ServicePage } from "@/components/provider/ServicePage";
import { availableServiceTabs, type ServiceTab } from "@/components/provider/tabs";
import { ToastRoot } from "@/components/provider/ToastRoot";
import type { DemoCar } from "@/components/provider/Popups";

type Props = {
  params: Promise<{ slug: string; service: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// صفحة لكل خدمة عند كل مقدّم خدمة — أي مسار تاني = 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return getProviderServiceParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service } = await params;
  const locale = await getLocale();
  const found = await getProviderService(slug, service);
  if (!found) return {};
  const t = getProviderDict(locale);
  return {
    title: t.serviceAt(tx(locale, found.service, "name"), tx(locale, found.provider, "short_name")).replace("‏", ""),
    description: tx(locale, found.service, "description"),
  };
}

// W2-32 · الخدمة عند المزوّد (Johnson Ceramic Pro لدى جونسون 710:4119) + W2-32s عبر رابط المسوّق (?ref=SM123)
export default async function ProviderServicePage({ params, searchParams }: Props) {
  const { slug, service: serviceSlug } = await params;
  const sp = await searchParams;
  const found = await getProviderService(slug, serviceSlug);
  if (!found) notFound();
  const { provider, detail, service } = found;
  if (service.slug !== serviceSlug) {
    const qs = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string")).toString();
    redirect(routes.providerService(slug, service.slug) + (qs ? `?${qs}` : ""));
  }
  const locale = await getLocale();
  const c = getCommon(locale);
  const t = getProviderDict(locale);
  const refCode = typeof sp.ref === "string" ? sp.ref : undefined;
  const [marketer, otherOffers, category, session] = await Promise.all([
    getMarketer(refCode),
    getOtherOffers(slug, service),
    getCategory(service.category),
    getSession(),
  ]);

  // سيارات العميل (P-15) — W2-32 بيعرض «تويوتا كامري 2023» حتى في وضع الزائر (ديمو)؛
  // العميل الجديد (بدون سيارات) بيظهر له اختيار حجم السيارة بدلها
  let cars: DemoCar[] | null = null;
  if (!session?.is_new) {
    cars = (await getCars()).map((car) => ({
      id: car.id,
      name: tx(locale, car, "name"),
      size: car.size,
      is_default: car.is_default,
      meta: car.is_default
        ? [t.sizes[car.size], `${tx(locale, car, "plate_letters")} ${car.plate_numbers}`, t.defaultCar].join(" · ")
        : t.sizes[car.size],
    }));
  }

  const d = service.detail;
  const reviews =
    d?.reviews ??
    (detail.reviews?.items ?? [])
      .filter((r) => r.service === service.slug)
      .map(({ who_ar, who_en, ago_ar, ago_en, text_ar, text_en, stars }) => ({ who_ar, who_en, ago_ar, ago_en, text_ar, text_en, stars }));
  const reviewsCount = d?.reviews_count ?? reviews.length;
  const rating = d?.rating ?? provider.rating;
  const photos = d?.photos ?? [service.photo];
  const tabs = availableServiceTabs(service, reviewsCount, photos.length);
  const requested = typeof sp.tab === "string" ? (sp.tab as ServiceTab) : "overview";
  const initialTab = tabs.includes(requested) ? requested : "overview";
  const pkg = d?.package_banner ? detail.packages.find((p) => p.slug === d.package_banner!.package) : undefined;
  const short = tx(locale, provider, "short_name");

  return (
    <ToastRoot>
      <Container className="pt-6 pb-4">
        <Breadcrumb
          items={[
            { label: c.home, href: routes.home },
            { label: t.services, href: routes.services },
            { label: tx(locale, category, "name"), href: routes.search({ services: [category.slug] }) },
            { label: t.serviceAt(tx(locale, service, "name"), short) },
          ]}
        />
      </Container>
      <Container className="pb-16">
        <ServicePage
          locale={locale}
          provider={provider}
          detail={detail}
          service={service}
          tabs={tabs}
          initialTab={initialTab}
          reviews={reviews}
          reviewsCount={reviewsCount}
          rating={rating}
          otherOffers={otherOffers}
          cars={cars}
          marketer={marketer ?? null}
          refCode={refCode}
          category={{ slug: category.slug, name: tx(locale, category, "name") }}
          categoryDefinite={t.categoryDefinite[category.slug]}
          packagePrice={pkg ? { name: tx(locale, pkg, "name"), price: pkg.price, old_price: pkg.old_price } : null}
        />
      </Container>
    </ToastRoot>
  );
}
