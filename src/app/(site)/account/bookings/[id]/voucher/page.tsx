import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getBooking, getBookingIds } from "@/lib/server/account";
import { routes } from "@/lib/routes";
import { BookingDetail } from "@/components/account/booking-detail";
import { toDetailView } from "../view";

export async function generateStaticParams() {
  return (await getBookingIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  return { title: `${getAccountDict(locale).voucher.label} · ${id}` };
}

// W2-37v · القسيمة كاملة (828:3): نافذة فوق صفحة متابعة الحجز — الإغلاق يرجع لـ W2-37
export default async function VoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, locale, user] = await Promise.all([params, getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const booking = await getBooking(user, id);
  if (!booking || booking.detail?.voucher.state === "cancelled") notFound();
  return <BookingDetail locale={locale} id={id} v={toDetailView(locale, booking, user)} openVoucher />;
}
