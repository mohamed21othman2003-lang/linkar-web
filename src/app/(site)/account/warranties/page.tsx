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

// المتبقي من الضمان من النهارده لحد end_iso: أشهر كاملة ثم أيام (15 نوفمبر ← 8 أبريل = 4 أشهر و24 يوماً)
function remainingParts(endIso: string, today: Date) {
  const end = new Date(`${endIso}T00:00:00`);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (end <= start) return null;
  let months = 0;
  const step = (n: number) => new Date(start.getFullYear(), start.getMonth() + n, start.getDate());
  while (step(months + 1) <= end) months++;
  const days = Math.round((end.getTime() - step(months).getTime()) / 86_400_000);
  return { months, days };
}

function remainingText(locale: "ar" | "en", endIso: string, today: Date) {
  const r = remainingParts(endIso, today);
  if (!r) return locale === "en" ? "Expired" : "منتهٍ";
  if (locale === "en") {
    const parts = [r.months && `${r.months} month${r.months === 1 ? "" : "s"}`, r.days && `${r.days} day${r.days === 1 ? "" : "s"}`].filter(Boolean);
    return `${parts.join(" and ")} left`;
  }
  const mo = (n: number) => (n === 1 ? "شهر" : n === 2 ? "شهران" : n <= 10 ? `${n} أشهر` : `${n} شهراً`);
  const dy = (n: number) => (n === 1 ? "يوم" : n === 2 ? "يومان" : n <= 10 ? `${n} أيام` : `${n} يوماً`);
  return `متبقٍ ${[r.months && mo(r.months), r.days && dy(r.days)].filter(Boolean).join(" و")}`;
}

// نسبة المتبقي لشريط التقدّم
function remainingShare(startIso: string, endIso: string, today: Date) {
  const s = new Date(`${startIso}T00:00:00`).getTime();
  const e = new Date(`${endIso}T00:00:00`).getTime();
  return Math.min(1, Math.max(0, (e - today.getTime()) / (e - s)));
}

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
  const today = new Date();

  const items: WarrantyCardView[] = list.map((w) =>
    w.status === "active"
      ? {
          status: "active",
          booking: w.booking,
          statusLabel: L(statusLabels.active),
          title: L(w.title),
          provider: L(w.provider),
          // ترتيب الفيجما (Meta 202:22768) من اليمين: رقم الشهادة · السيارة · صالح حتى · الحجز — والمجموعة لازقة في الشمال
          meta: [
            [t("certificate_no"), w.certificate],
            [t("car"), L(w.car)],
            [t("valid_until"), L(w.valid_until)],
            [t("booking"), w.booking],
          ],
          remaining: remainingShare(w.start_iso, w.end_iso, today),
          certificate: w.certificate,
          showAt: L(w.show_at),
          rows: [
            [t("popup_status"), `${L(statusLabels.active)} · ${remainingText(locale, w.end_iso, today)}`],
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
            [t("expected"), L(w.expected)],
            [t("car"), L(w.car)],
            [t("booking"), w.booking],
          ],
          note: L(w.note),
        },
  );

  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={t("title")} description={t("description")} />
      <WarrantiesList items={items} copy={{ view: t("view"), popupTitle: t("popup_title"), popupNote: t("popup_note"), close: t("popup_close") }} />
      {/* W2-74: زوايا 14 — «!» عشان تغلب الـ20 الافتراضية في AxNote */}
      {/* Figma Note (202:22768): الأيقونة في آخر السطر (الشمال) والنص مالي العرض ومحاذي يمين */}
      <AxNote className="flex-row-reverse rounded-[14px]! px-4 [&>p]:flex-1">{t("note")}</AxNote>
    </div>
  );
}
