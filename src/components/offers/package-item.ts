import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { PackageWithProvider } from "@/lib/server/packages";
import { bookingHref } from "@/components/booking/query";
import type { ListingItem } from "./Listing";

// باقة ← بيانات كارت (v2 · Package card) — «التفاصيل» W2-42 و«احجز» خطوة الفرع W2-33
export function packageListingItem(locale: Locale, { pkg, provider }: PackageWithProvider): ListingItem {
  return {
    id: pkg.slug,
    provider,
    services: pkg.services,
    discount: pkg.discount,
    price: pkg.price,
    oldPrice: pkg.old_price,
    title: [tx(locale, pkg, "title_line1"), tx(locale, pkg, "title_line2")],
    features: pkg.features.map((f) => ({ icon: f.icon, label: tx(locale, f, "label") })),
    featured: false,
    endsAt: null,
    detailsHref: routes.package(pkg.slug),
    bookHref: bookingHref(routes.bookingBranch, { provider: provider.slug, packages: [pkg.slug] }),
  };
}
