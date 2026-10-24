import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getSession } from "@/lib/server/session";
import { complaintForm as f } from "@/lib/data/account/complaints-data";
import { routes } from "@/lib/routes";
import { AxTabs, AxTitle } from "@/components/account/account-extra-ui";
import { SuggestionForm } from "@/components/account/complaints-form";
import { complaintFormCopy, complaintFormTabs } from "@/components/account/complaints-form-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tx(locale, f, "tab_suggestion"), description: tx(locale, f, "suggestion_description") };
}

// W2-69c · اقتراح لتحسين لينكار (853:311951)
export default async function SuggestionNewPage() {
  const [locale, user] = await Promise.all([getLocale(), getSession()]);
  if (!user) redirect(routes.login);
  return (
    <div className="flex flex-col gap-6">
      <AxTitle title={tx(locale, f, "title")} description={tx(locale, f, "suggestion_description")} />
      <AxTabs label={tx(locale, f, "title")} items={complaintFormTabs(locale, "suggestion")} />
      <SuggestionForm c={complaintFormCopy(locale, "suggestion")} stepTitle={tx(locale, f, "suggestion_step_title")} stepText={tx(locale, f, "suggestion_step_text")} />
    </div>
  );
}
