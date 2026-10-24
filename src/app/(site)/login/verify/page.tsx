import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { getSession } from "@/lib/server/session";
import { authHref, formatSaudiPhone, normalizeSaudiPhone, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, CardTitle, TextLink } from "@/components/auth/ui";
import { OtpForm } from "@/components/auth/OtpForm";

type Props = { searchParams: Promise<{ next?: string; phone?: string; demo?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.verifyScreen, "meta_title") };
}

// W2-50b · رمز التحقق (755:11031) · W2-50c · رمز غير صحيح (755:11455)
export default async function VerifyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const phone = normalizeSaudiPhone(sp.phone ?? "");
  if (!phone) redirect(authHref(routes.login, { next }));
  const [locale, session] = await Promise.all([getLocale(), getSession()]);
  if (session) redirect(next);
  const { c, side } = await getAuthCommon(locale);
  const v = c.verifyScreen;
  const d = getAuthDict(locale);
  return (
    <AuthShell side={side}>
      <AuthCard>
        <TextLink href={authHref(routes.login, { next, phone })} padded>
          <Icon name="chevron-right" size={16} flip className="text-nature-green" />
          {tx(locale, v, "edit_number")}
        </TextLink>
        <CardTitle>{tx(locale, v, "title")}</CardTitle>
        <p className="flex flex-wrap items-center gap-x-1.5 text-body-m text-state-gray">
          {tx(locale, v, "sent_to")}
          <bdi dir="ltr" className="text-label-l text-deep-charcoal">
            {formatSaudiPhone(phone, true)}
          </bdi>
        </p>
        <OtpForm
          phone={phone}
          next={next}
          length={c.OTP_LENGTH}
          maxAttempts={c.OTP_MAX_ATTEMPTS}
          resendSeconds={c.OTP_RESEND_SECONDS}
          // ?demo=filled ← W2-50b (7 4 1 _) · ?demo=wrong ← W2-50c (7 4 1 9 غلط)
          demo={sp.demo === "filled" || sp.demo === "wrong" ? sp.demo : undefined}
          copy={{
            resendWait: tx(locale, v, "resend_wait"),
            cta: tx(locale, v, "cta"),
            help: tx(locale, v, "help"),
            resend: tx(locale, v, "resend"),
            wrong2: tx(locale, v, "wrong_2"),
            wrong1: tx(locale, v, "wrong_1"),
            wrongNote: tx(locale, v, "wrong_note"),
            locked: tx(locale, v, "locked"),
            lockedNote: tx(locale, v, "locked_note"),
            digit: tx(locale, v, "digit"),
            incomplete: d.codeIncomplete,
          }}
        />
      </AuthCard>
    </AuthShell>
  );
}
