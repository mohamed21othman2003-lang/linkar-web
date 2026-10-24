import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { getSession } from "@/lib/server/session";
import { authHref, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, BusinessBox, CardSubtitle, CardTitle, Divider, MethodTabs, OrDivider, SocialButtons, TextLink } from "@/components/auth/ui";
import { EmailLoginForm } from "@/components/auth/EmailForms";

type Props = { searchParams: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.emailScreen, "meta_title") };
}

// W2-50e · تسجيل الدخول · البريد الإلكتروني وكلمة المرور (1070:58)
export default async function EmailLoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (session) redirect(next);
  const { c, side, t, business } = await getAuthCommon(locale);
  const e = c.emailScreen;
  return (
    <AuthShell side={side}>
      <AuthCard>
        <CardTitle>{tx(locale, e, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, e, "subtitle")}</CardSubtitle>
        <MethodTabs
          active="email"
          phone={{ label: t.tabPhone, href: authHref(routes.login, { next }) }}
          email={{ label: t.tabEmail, href: authHref(routes.loginEmail, { next }) }}
        />
        <EmailLoginForm
          next={next}
          forgotHref={authHref(routes.forgotPassword, { next })}
          copy={{
            email: t.emailLabel,
            emailPlaceholder: t.emailPlaceholder,
            password: t.passwordLabel,
            forgot: tx(locale, e, "forgot"),
            cta: tx(locale, e, "cta"),
            errors: getAuthDict(locale),
          }}
        />
        <OrDivider label={t.or} />
        <SocialButtons next={next} google={t.google} apple={t.apple} />
        <TextLink href={authHref(routes.login, { next })} tone="dark">
          {tx(locale, e, "no_account")}
        </TextLink>
        <Divider />
        <BusinessBox title={t.businessTitle} links={business} />
      </AuthCard>
    </AuthShell>
  );
}
