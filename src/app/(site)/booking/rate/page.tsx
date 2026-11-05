import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { routes } from "@/lib/routes";
import { getCompletedBooking } from "@/lib/server/booking";
import { getSession } from "@/lib/server/session";
import { getBooking } from "@/lib/server/account";
import { BookingDetail } from "@/components/account/booking-detail";
import { toDetailView } from "../../account/bookings/[id]/view";
import AccountLayout from "../../account/layout";
import { RateScreen } from "./RateScreen";

export async function generateMetadata(): Promise<Metadata> {
  const t = getBookingDict(await getLocale());
  return { title: t.rateTitle };
}

// W2-39 · تقييم الخدمة بعد اكتمالها مباشرة — /booking/rate?booking=<id>: النافذة فوق متابعة الحجز المكتمل (W2-37c) زي الفيجما
export default async function BookingRatePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const id = typeof sp.booking === "string" ? sp.booking : undefined;
  const [locale, data, user] = await Promise.all([getLocale(), getCompletedBooking(id), getSession()]);
  if (!data) notFound();
  const detail = user ? await getBooking(user, data.booking.id) : null;
  const { booking, provider } = data;
  const t = getBookingDict(locale);
  const subtitle = [tx(locale, booking, "service"), tx(locale, provider, "name"), booking.id, tx(locale, booking, "completed_on")].join(" · ");
  return (
    <div className="min-h-[70vh] bg-page-soft">
      {detail && user ? (
        // نفس صفحة متابعة الحجز (بالقائمة الجانبية) تحت النافذة
        <AccountLayout>
          <BookingDetail locale={locale} id={data.booking.id} v={toDetailView(locale, detail, user)} openRating={false} />
        </AccountLayout>
      ) : (
        <h1 className="sr-only">{t.rateTitle}</h1>
      )}
      <RateScreen
        locale={locale}
        backHref={routes.booking(booking.id)}
        subtitle={subtitle}
        provider={{ slug: provider.slug, name: tx(locale, provider, "name"), logo: provider.logo }}
        overall={booking.overall}
        criteria={booking.criteria.map((c) => ({ key: c.key, label: tx(locale, c, "label"), value: c.value, serviceSpecific: c.service_specific }))}
        serviceCategory={tx(locale, booking, "service_category")}
        comment={tx(locale, booking, "comment")}
        publicName={tx(locale, booking, "customer_display")}
        points={booking.points_reward}
        complaintHref={routes.complaintNew}
      />
    </div>
  );
}
