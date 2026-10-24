import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getBookingCars, getBookings } from "@/lib/server/account";
import { bookingTabOf } from "@/lib/data/account/bookings";
import { formatPrice } from "@/lib/format";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { AccountTitle } from "@/components/account/account-ui";
import { BookingTable, type BookingRowView } from "@/components/account/booking-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = getAccountDict(await getLocale());
  return { title: t.bookings.title, description: t.bookings.subtitle };
}

const tabs = ["upcoming", "completed", "cancelled"] as const;

// W2-38 · حجوزاتي (723:6282) — التبويب من ?tab= (W2-38-t2…t4) — والعميل الجديد W2-38-0 (1071:21)
export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, user, sp] = await Promise.all([getLocale(), getSession(), searchParams]);
  if (!user) redirect(routes.login);
  const t = getAccountDict(locale);
  const b = t.bookings;
  const [list, cars] = await Promise.all([getBookings(user), getBookingCars()]);
  const initialTab = tabs.find((k) => k === sp.tab) ?? "all";

  const rows: BookingRowView[] = list.map((r) => ({
    id: r.id,
    status: r.status,
    tab: bookingTabOf[r.status],
    providerSlug: r.provider_slug,
    provider: tx(locale, r, "provider"),
    services: tx(locale, r, "services_short"),
    date: tx(locale, r, "date"),
    dateIso: r.date_iso,
    branch: tx(locale, r, "branch"),
    car: tx(locale, r, "car_short"),
    carKey: r.car_key,
    amount: formatPrice(locale, r.amount),
    action: r.action,
    hasDetail: !!r.detail,
  }));

  return (
    <div className="flex flex-col gap-5">
      <AccountTitle
        title={b.title}
        subtitle={b.subtitle}
        aside={
          <Link href={routes.search()} className="flex items-center gap-1.5 rounded-md bg-neon-green px-4 py-2.5 text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
            {t.newBooking}
            <Icon name="plus" size={16} />
          </Link>
        }
      />
      {rows.length ? (
        <BookingTable locale={locale} rows={rows} cars={cars.map((c) => ({ key: c.key, label: tx(locale, c, "label") }))} initialTab={initialTab} />
      ) : (
        <section className="flex flex-col items-center gap-3.5 rounded-[20px] border border-cool-gray bg-white px-6 py-12 text-center md:px-10">
          <span className="flex rounded-full bg-neon-green/18 p-5 text-deep-charcoal">
            <Icon name="calendar" size={32} />
          </span>
          <h2 className="text-h4 text-deep-charcoal">{b.emptyTitle}</h2>
          <p className="max-w-[520px] text-body-m text-state-gray">{b.emptySub}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={routes.search()} className="rounded-[14px] bg-neon-green px-[22px] py-[13px] text-label-l text-deep-charcoal hover:bg-bg-brand-hover">
              {b.findService}
            </Link>
            <Link href={routes.offers} className="text-label-m text-green-active hover:underline">
              {t.browseOffers}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
