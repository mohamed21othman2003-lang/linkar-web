import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { routes } from "@/lib/routes";
import { getListingContext, getOffers, getOffersPage } from "@/lib/server/offers";
import { getProvider } from "@/lib/server/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/server/session";
import { getDisplayCars } from "@/lib/server/booking";
import { getBookingDict } from "@/i18n/dict/booking";
import { carTitle } from "@/components/booking/summary-model";
import { Container } from "@/components/ui/Container";
import { Listing, type ListingItem } from "@/components/offers/Listing";
import { bookingHref } from "@/components/booking/query";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, p] = await Promise.all([getLocale(), getOffersPage()]);
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-40 · العروض (725:6463)
export default async function OffersPage() {
  const locale = await getLocale();
  const [p, list, ctx] = await Promise.all([getOffersPage(), getOffers(), getListingContext()]);
  const t = getCommon(locale);
  const b = getBookingDict(locale);
  const cars = await getDisplayCars(await getSession());
  const base = Object.fromEntries(await Promise.all(list.map(async ({ provider }) => [provider.slug, await getProvider(provider.slug)] as const)));
  const items: ListingItem[] = list.map(({ offer, provider }) => ({
    id: offer.id,
    provider,
    providerLabel: base[provider.slug] ? tx(locale, base[provider.slug]!, "name") : undefined,
    services: offer.services,
    discount: offer.discount,
    price: offer.price,
    oldPrice: offer.old_price,
    title: [tx(locale, offer, "title_line1"), tx(locale, offer, "title_line2")],
    features: offer.features.map((f) => ({ icon: f.icon, label: tx(locale, f, "label") })),
    featured: !!offer.featured,
    endsAt: offer.ends_at,
    // لا توجد شاشة تفاصيل عرض في الفيجما ← «التفاصيل» تفتح صفحة مقدّم الخدمة (W2-21)
    detailsHref: routes.provider(provider.slug),
    bookHref: bookingHref(routes.bookingBranch, { provider: provider.slug, offer: offer.id }),
  }));
  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "crumb") }]} title={tx(locale, p, "title")} description={tx(locale, p, "description")} />
      <Container className="pt-8 pb-24">
        <Listing
          locale={locale}
          kind="offers"
          items={items}
          context={{
            car: tx(locale, ctx, "car"),
            carFull: tx(locale, ctx, "car_full"),
            area: tx(locale, ctx, "area"),
            priceMin: ctx.offers_price.min,
            priceMax: ctx.offers_price.max,
            providerOrder: ctx.offers_providers,
            cars: cars.map((c) => ({ id: c.id, title: carTitle(locale, c), meta: [b.sizes[c.size], tx(locale, c, "plate"), c.is_default ? b.defaultCar : ""].filter(Boolean).join(" · "), short: carTitle(locale, c), full: carTitle(locale, c, true) })),
          }}
        />
      </Container>
    </>
  );
}
