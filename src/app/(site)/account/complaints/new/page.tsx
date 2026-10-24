import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import { getProviderLogo } from "@/lib/server/account-extra";
import { complaintForm as f, pickerBookings, problemTypes, resolutions } from "@/lib/data/account/complaints-data";
import { routes } from "@/lib/routes";
import { AxTabs, AxTitle } from "@/components/account/account-extra-ui";
import { ComplaintForm } from "@/components/account/complaints-form";
import { complaintFormCopy, complaintFormTabs } from "@/components/account/complaints-form-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, f, "title"), description: tx(locale, f, "description") };
}

// W2-69b · شكوى أو اقتراح جديد (752:9483) — مع «v2 · Complaint booking picker (W2-69b)» (927:311104)
export default async function ComplaintNewPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  const bookings = await Promise.all(
    pickerBookings.map(async (b) => {
      const logo = await getProviderLogo(b.provider);
      return {
        id: b.id,
        title: tx(locale, b, "title"),
        meta: tx(locale, b, "meta"),
        note: b.note ? tx(locale, b.note, "text") : undefined,
        disabled: b.disabled,
        logo: logo?.src ?? "",
        logoAlt: logo ? tx(locale, logo, "name") : "",
      };
    }),
  );
  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={tx(locale, f, "title")} description={tx(locale, f, "description")} />
      <AxTabs label={tx(locale, f, "title")} items={complaintFormTabs(locale, "complaint")} />
      <ComplaintForm
        c={complaintFormCopy(locale, "complaint")}
        bookings={bookings}
        problems={problemTypes.map((p) => ({ key: p.key, label: tx(locale, p, "label") }))}
        resolutions={resolutions.map((r) => ({ key: r.key, label: tx(locale, r, "label") }))}
      />
    </div>
  );
}
