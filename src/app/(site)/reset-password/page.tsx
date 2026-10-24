import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { safeNext } from "@/lib/server/auth";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, BusinessBox, CardSubtitle, CardTitle, Divider } from "@/components/auth/ui";
import { ResetForm } from "@/components/auth/EmailForms";

type Props = { searchParams: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.resetScreen, "meta_title") };
}

// W2-50h · تعيين كلمة مرور جديدة (1070:381) — من رابط الاستعادة في البريد
export default async function ResetPasswordPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const locale = await getLocale();
  const { c, side, t, business } = await getAuthCommon(locale);
  const r = c.resetScreen;
  return (
    <AuthShell side={side}>
      <AuthCard>
        <CardTitle>{tx(locale, r, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, r, "subtitle")}</CardSubtitle>
        <ResetForm
          next={next}
          copy={{
            newLabel: tx(locale, r, "new_label"),
            confirmLabel: tx(locale, r, "confirm_label"),
            hint: t.passwordHint,
            cta: tx(locale, r, "cta"),
            errors: getAuthDict(locale),
          }}
        />
        <Divider />
        <BusinessBox title={t.businessTitle} links={business} />
      </AuthCard>
    </AuthShell>
  );
}
