import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getBooking, getBookingIds } from "@/lib/server/account";
import { routes } from "@/lib/routes";
import { BookingDetail } from "@/components/account/booking-detail";
import { toDetailView } from "./view";

export async function generateStaticParams() {
  return (await getBookingIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  return { title: getAccountDict(locale).booking.title(id) };
}

// W2-37 · متابعة الحجز — BK-21452 (بانتظار الزيارة) · BK-21431 (في الخدمة) · BK-21388 (مكتمل) · BK-21280 (ملغى · مسترد)
// ?rate=1 بيفتح تقييم الخدمة W2-63 (من «قيّم» في W2-38 و«قيّم واكسب 50 نقطة» في W2-60)
export default async function BookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ rate?: string }> }) {
  const [{ id }, sp, locale, user] = await Promise.all([params, searchParams, getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const booking = await getBooking(user, id);
  if (!booking) notFound();
  return <BookingDetail locale={locale} id={id} v={toDetailView(locale, booking, user)} openRating={sp.rate === "1"} />;
}
