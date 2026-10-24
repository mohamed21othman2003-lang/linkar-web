import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { authHref, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, BusinessBox, CardSubtitle, CardTitle, Divider, TextLink } from "@/components/auth/ui";
import { ForgotForm } from "@/components/auth/EmailForms";

type Props = { searchParams: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.forgotScreen, "meta_title") };
}

// W2-50f · استعادة كلمة المرور (1070:185)
export default async function ForgotPasswordPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const locale = await getLocale();
  const { c, side, t, business } = await getAuthCommon(locale);
  const f = c.forgotScreen;
  return (
    <AuthShell side={side}>
      <AuthCard>
        <CardTitle>{tx(locale, f, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, f, "subtitle")}</CardSubtitle>
        <ForgotForm next={next} copy={{ email: t.emailLabel, emailPlaceholder: t.emailPlaceholder, cta: tx(locale, f, "cta"), errors: getAuthDict(locale) }} />
        <TextLink href={authHref(routes.loginEmail, { next })}>{t.backToLogin}</TextLink>
        <Divider />
        <BusinessBox title={t.businessTitle} links={business} />
      </AuthCard>
    </AuthShell>
  );
}
