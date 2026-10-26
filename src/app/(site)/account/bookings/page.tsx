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
import { AxEmpty } from "@/components/account/account-extra-ui";
import { BookingTable, type BookingRowView } from "@/components/account/booking-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = getAccountDict(await getLocale());
  return { title: t.bookings.title, description: t.bookings.subtitle };
}

const tabs = ["upcoming", "completed", "cancelled"] as const;

// W2-38 · حجوزاتي (723:6282 → 85:40069) — التبويب من ?tab= (W2-38-t2…t4) — والعميل الجديد W2-38-0 (85:43581)
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
        // W2-38-0 (85:43581): النسخة المعتمدة شالت «تصفّح العروض» — زر «ابحث عن خدمة» بس
        <AxEmpty icon="calendar" title={b.emptyTitle} text={b.emptySub} cta={{ label: b.findService, href: routes.search() }} />
      )}
    </div>
  );
}
