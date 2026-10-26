import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { routes } from "@/lib/routes";
import { getListingContext } from "@/lib/server/offers";
import { getPackages, getPackagesPage } from "@/lib/server/packages";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSession } from "@/lib/server/session";
import { getDisplayCars } from "@/lib/server/booking";
import { getBookingDict } from "@/i18n/dict/booking";
import { carTitle } from "@/components/booking/summary-model";
import { Container } from "@/components/ui/Container";
import { Listing } from "@/components/offers/Listing";
import { packageListingItem } from "@/components/offers/package-item";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, p] = await Promise.all([getLocale(), getPackagesPage()]);
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-41 · الباقات (729:6671)
export default async function PackagesPage() {
  const locale = await getLocale();
  const [p, list, ctx] = await Promise.all([getPackagesPage(), getPackages(), getListingContext()]);
  const t = getCommon(locale);
  const b = getBookingDict(locale);
  const cars = await getDisplayCars(await getSession());
  return (
    <>
      <PageHeader tone="dark" crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "crumb") }]} title={tx(locale, p, "title")} description={tx(locale, p, "description")} />
      <Container className="pt-8 pb-24">
        <Listing
          locale={locale}
          kind="packages"
          items={list.map((x) => packageListingItem(locale, x))}
          context={{
            car: tx(locale, ctx, "car"),
            carFull: tx(locale, ctx, "car_full"),
            area: tx(locale, ctx, "area"),
            priceMin: ctx.packages_price.min,
            priceMax: ctx.packages_price.max,
            providerOrder: ctx.packages_providers,
            cars: cars.map((c) => ({ id: c.id, title: carTitle(locale, c), meta: [b.sizes[c.size], tx(locale, c, "plate"), c.is_default ? b.defaultCar : ""].filter(Boolean).join(" · "), short: carTitle(locale, c), full: carTitle(locale, c, true) })),
          }}
        />
      </Container>
    </>
  );
}
