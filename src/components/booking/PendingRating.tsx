import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getPendingRating } from "@/lib/server/booking";
import { getSession } from "@/lib/server/session";
import { PendingRatingPrompt } from "./PendingRatingPrompt";

// نافذة «قيّم الخدمة» التلقائية بعد اكتمال الخدمة — نفس بيانات /booking/rate (W2-39)
export async function PendingRating() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  const data = await getPendingRating(user);
  if (!data) return null;
  const { booking, provider } = data;
  const subtitle = [tx(locale, booking, "service"), tx(locale, provider, "name"), booking.id, tx(locale, booking, "completed_on")].join(" · ");
  return (
    <PendingRatingPrompt
      bookingId={booking.id}
      locale={locale}
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
  );
}
