import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import { getWarranties } from "@/lib/server/account-extra";
import { statusLabels, warrantiesPage as p } from "@/lib/data/account/warranties";
import { routes } from "@/lib/routes";
import { AxNote, AxTitle } from "@/components/account/account-extra-ui";
import { WarrantiesList, type WarrantyCardView } from "@/components/account/warranties-list";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// W2-74 · ضماناتي (202:22768) — شهادة سارية بشريط المدة و«عرض الشهادة» (P-30)، وشهادة بتصدر بعد التنفيذ، وملاحظة الضمان
export default async function WarrantiesPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const list = await getWarranties(user);
  const L = (x: { ar: string; en: string }) => (locale === "en" ? x.en : x.ar);
  const t = (k: string) => tx(locale, p, k as "title");

  const items: WarrantyCardView[] = list.map((w) =>
    w.status === "active"
      ? {
          status: "active",
          booking: w.booking,
          statusLabel: L(statusLabels.active),
          title: L(w.title),
          provider: L(w.provider),
          meta: [
            [t("booking"), w.booking],
            [t("valid_until"), L(w.valid_until)],
            [t("car"), L(w.car)],
            [t("certificate_no"), w.certificate],
          ],
          remaining: w.remaining,
          certificate: w.certificate,
          showAt: L(w.show_at),
          rows: [
            [t("popup_status"), L(w.status_line)],
            [t("popup_provider"), L(w.provider)],
            [t("popup_service"), L(w.service_line)],
            [t("car"), L(w.car_line)],
            [t("popup_duration"), L(w.duration)],
            [t("popup_covers"), L(w.covers)],
          ],
        }
      : {
          status: "pending",
          booking: w.booking,
          statusLabel: L(statusLabels.pending),
          title: L(w.title),
          provider: L(w.provider),
          meta: [
            [t("booking"), w.booking],
            [t("car"), L(w.car)],
            [t("expected"), L(w.expected)],
          ],
          note: L(w.note),
        },
  );

  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={t("title")} description={t("description")} />
      <WarrantiesList items={items} copy={{ view: t("view"), popupTitle: t("popup_title"), popupNote: t("popup_note"), close: t("popup_close") }} />
      {/* W2-74: زوايا 14 — «!» عشان تغلب الـ20 الافتراضية في AxNote */}
      <AxNote className="rounded-[14px]! px-4">{t("note")}</AxNote>
    </div>
  );
}
