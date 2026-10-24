// طبقة بيانات حساب العميل (الجزء الأول): الرئيسية · حجوزاتي · متابعة الحجز · الإشعارات · الإعدادات.
// دلوقتي بترجع البيانات التجريبية؛ في المرحلة 3 بتتغيّر لـ fetch من Django API بنفس الشكل.
// العميل الجديد (is_new) بياخد قوائم فاضية → حالات W2-xx-0.
import type { DemoUser } from "@/lib/data/types";
import { bookings, bookingCars, type Booking } from "@/lib/data/account/bookings";
import { overviewInProgress, overviewNext, overviewOffers, overviewRate, overviewStats, onboardingSteps } from "@/lib/data/account/overview";
import { settingsAddresses, settingsAlerts, settingsLocation, settingsProfile } from "@/lib/data/account/settings";
import { notificationFeed, type FeedNotification } from "@/lib/data/notifications";

export async function getBookings(user: DemoUser): Promise<Booking[]> {
  return user.is_new ? [] : bookings;
}

// صفحات المتابعة الموجودة في الفيجما (W2-37 · 37b · 37c · 37d)
export async function getBookingIds(): Promise<string[]> {
  return bookings.filter((b) => b.detail).map((b) => b.id);
}

// صفحة حجز معيّن بتفتح حتى للعميل الجديد (لسه مخلّص حجز من W2-36 أو متابعة من الرئيسية)؛
// قايمة «حجوزاتي» بتفضل فاضية له (W2-38-0)
export async function getBooking(_user: DemoUser, id: string): Promise<Booking | undefined> {
  return bookings.find((b) => b.id === id && b.detail);
}

export async function getBookingCars() {
  return bookingCars;
}

// حجوزات مدفوعة لم تكتمل (تمنع حذف الحساب — P-03a)
export async function getOpenBookingIds(user: DemoUser): Promise<string[]> {
  return (await getBookings(user)).filter((b) => b.status === "waiting" || b.status === "in_service").map((b) => b.id);
}

export async function getOverview() {
  return {
    next: overviewNext,
    inProgress: overviewInProgress,
    stats: overviewStats,
    rate: overviewRate,
    offers: overviewOffers,
    onboarding: onboardingSteps,
  };
}

export async function getNotificationFeed(user: DemoUser): Promise<FeedNotification[]> {
  return user.is_new ? [] : notificationFeed;
}

export async function getSettings() {
  return { profile: settingsProfile, addresses: settingsAddresses, alerts: settingsAlerts, location: settingsLocation };
}
