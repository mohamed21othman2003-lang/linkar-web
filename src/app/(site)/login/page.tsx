import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { getSession } from "@/lib/server/session";
import { authHref, normalizeSaudiPhone, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, BusinessBox, CardSubtitle, CardTitle, Consent, Divider, MethodTabs, OrDivider, SocialButtons } from "@/components/auth/ui";
import { PhoneForm } from "@/components/auth/PhoneForm";

type Props = { searchParams: Promise<{ next?: string; phone?: string; demo?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.phoneScreen, "meta_title") };
}

// W2-50 · تسجيل الدخول · رقم الجوال (755:10604)
export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (session) redirect(next);
  const { c, side, t, business, consent } = await getAuthCommon(locale);
  const p = c.phoneScreen;
  const d = getAuthDict(locale);
  return (
    <AuthShell side={side}>
      <AuthCard>
        <CardTitle>{tx(locale, p, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, p, "subtitle")}</CardSubtitle>
        <MethodTabs
          active="phone"
          phone={{ label: t.tabPhone, href: authHref(routes.login, { next }) }}
          email={{ label: t.tabEmail, href: authHref(routes.loginEmail, { next }) }}
        />
        <PhoneForm
          next={next}
          // ?demo=filled ← الحالة المعبّأة اللي في الفيجما (للمقارنة بالبكسل)
          initialPhone={sp.demo === "filled" ? c.DEMO_EXISTING_PHONE : (normalizeSaudiPhone(sp.phone ?? "") ?? "")}
          copy={{
            label: tx(locale, p, "label"),
            placeholder: tx(locale, p, "placeholder"),
            hint: tx(locale, p, "hint"),
            cta: tx(locale, p, "cta"),
            prefix: d.phonePrefix,
            errors: d,
          }}
        />
        <OrDivider label={t.or} />
        <SocialButtons next={next} google={t.google} apple={t.apple} />
        <Consent parts={consent} termsHref={routes.terms} privacyHref={routes.privacy} />
        <Divider />
        <BusinessBox title={t.businessTitle} links={business} />
      </AuthCard>
    </AuthShell>
  );
}
