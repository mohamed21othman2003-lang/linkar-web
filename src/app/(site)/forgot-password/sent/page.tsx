import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { authHref, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, BusinessBox, CardSubtitle, CardTitle, Divider, TextLink, submitClass } from "@/components/auth/ui";
import { ResendLink } from "@/components/auth/EmailForms";

type Props = { searchParams: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.sentScreen, "meta_title") };
}

// W2-50g · استعادة كلمة المرور · تفقّد بريدك (1070:282) — «أعد الإرسال» ← P-10t
export default async function ResetSentPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  const locale = await getLocale();
  const { c, side, t, business } = await getAuthCommon(locale);
  const s = c.sentScreen;
  return (
    <AuthShell side={side}>
      <AuthCard>
        <span className="flex size-14 items-center justify-center rounded-lg bg-neon-green/18">
          <Icon name="mail" size={28} className="text-deep-charcoal" />
        </span>
        <CardTitle>{tx(locale, s, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, s, "subtitle")}</CardSubtitle>
        {/* تجريبي: يفتح الرابط اللي «وصل» على البريد */}
        <Link href={authHref(routes.resetPassword, { next })} className={submitClass("lg")}>
          {tx(locale, s, "open_link")}
        </Link>
        <ResendLink label={tx(locale, s, "resend")} toast={tx(locale, s, "resent_toast")} />
        <TextLink href={authHref(routes.loginEmail, { next })} tone="dark">
          {t.backToLogin}
        </TextLink>
        <Divider />
        <BusinessBox title={t.businessTitle} links={business} />
      </AuthCard>
    </AuthShell>
  );
}
