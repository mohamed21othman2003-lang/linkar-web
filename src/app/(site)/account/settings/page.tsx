import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { getSession } from "@/lib/server/session";
import { getOpenBookingIds, getSettings } from "@/lib/server/account";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { SettingsForm } from "@/components/account/settings-form";
import type { SettingsPref } from "@/lib/data/account/settings";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = getAccountDict(await getLocale()).settings;
  return { title: t.title, description: t.subtitle };
}

const pref = (locale: Locale, p: SettingsPref) => ({ key: p.key, state: p.state, title: tx(locale, p, "title"), body: tx(locale, p, "body") });

// W2-72 · الإعدادات (753:9822)
export default async function SettingsPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const [s, openBookings] = await Promise.all([getSettings(), getOpenBookingIds(user)]);
  return (
    <SettingsForm
      locale={locale}
      v={{
        firstName: tx(locale, s.profile, "first_name"),
        lastName: tx(locale, s.profile, "last_name"),
        phone: s.profile.phone_display,
        email: s.profile.email,
        addresses: s.addresses.map((a) => ({ id: a.id, selected: a.selected, label: tx(locale, a, "label"), area: tx(locale, a, "area") })),
        alerts: s.alerts.map((p) => pref(locale, p)),
        location: pref(locale, s.location),
        openBookings,
        points: formatNumber(user.points),
      }}
    />
  );
}
