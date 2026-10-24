import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getAuthDict } from "@/i18n/dict/auth";
import { getSession } from "@/lib/server/session";
import { authHref, getVerifiedPhone, safeNext } from "@/lib/server/auth";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { getAuthCommon } from "@/components/auth/copy";
import { AuthCard, AuthShell, CardSubtitle, CardTitle } from "@/components/auth/ui";
import { CompleteForm } from "@/components/auth/CompleteForm";

type Props = { searchParams: Promise<{ next?: string; demo?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { c } = await getAuthCommon(locale);
  return { title: tx(locale, c.completeScreen, "meta_title") };
}

// W2-50d · إكمال الحساب · أول دخول (755:11885) — بيفتح بعد التحقق من رقم عميل جديد بس
export default async function CompletePage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  // ?demo=filled ← الحالة المعبّأة اللي في الفيجما (للمقارنة بالبكسل) — بتتعرض من غير تحقق
  const demo = sp.demo === "filled";
  const [locale, session, phone] = await Promise.all([getLocale(), getSession(), getVerifiedPhone()]);
  if (session) redirect(next);
  if (!phone && !demo) redirect(authHref(routes.login, { next }));
  const { c, side, t } = await getAuthCommon(locale);
  const k = c.completeScreen;
  const m = c.addCarModal;
  const d = getAuthDict(locale);
  return (
    <AuthShell side={side}>
      <AuthCard>
        <span className="flex items-center gap-1.5 rounded-full bg-nature-green/14 px-3 py-1 text-caption text-green-active">
          {tx(locale, k, "verified")}
          <Icon name="check" size={12} className="text-nature-green" />
        </span>
        <CardTitle>{tx(locale, k, "title")}</CardTitle>
        <CardSubtitle>{tx(locale, k, "subtitle")}</CardSubtitle>
        <CompleteForm
          next={next}
          inviteCodes={c.INVITE_CODES}
          initial={
            demo
              ? { first_name: tx(locale, k, "first_name_placeholder"), last_name: tx(locale, k, "last_name_placeholder"), email: "", password: "linkar26", invite: c.INVITE_CODES[0] }
              : undefined
          }
          copy={{
            firstName: tx(locale, k, "first_name"),
            lastName: tx(locale, k, "last_name"),
            firstPlaceholder: tx(locale, k, "first_name_placeholder"),
            lastPlaceholder: tx(locale, k, "last_name_placeholder"),
            email: t.emailLabel,
            emailPlaceholder: t.emailPlaceholder,
            emailHint: tx(locale, k, "email_hint"),
            password: t.passwordLabel,
            passwordHint: t.passwordHint,
            invite: tx(locale, k, "invite_label"),
            inviteApplied: tx(locale, k, "invite_applied"),
            terms: tx(locale, k, "terms"),
            smsOffers: tx(locale, k, "sms_offers"),
            cta: tx(locale, k, "cta"),
            errors: d,
          }}
          car={{
            copy: {
              created: tx(locale, m, "created"),
              title: tx(locale, m, "title"),
              body: tx(locale, m, "body"),
              make: tx(locale, m, "make"),
              model: tx(locale, m, "model"),
              year: tx(locale, m, "year"),
              color: tx(locale, m, "color"),
              plate: tx(locale, m, "plate"),
              platePlaceholder: tx(locale, m, "plate_placeholder"),
              sizeNote: tx(locale, m, "size_note"),
              sizeLabel: tx(locale, m, "size_label"),
              later: tx(locale, m, "later"),
              cta: tx(locale, m, "cta"),
              close: tx(locale, m, "close"),
            },
            options: {
              makes: c.carMakes.map((mk) => ({
                slug: mk.slug,
                name: tx(locale, mk, "name"),
                models: mk.models.map((md) => ({ slug: md.slug, name: tx(locale, md, "name"), size: md.size ? tx(locale, c.carSizes[md.size], "label") : null })),
              })),
              colors: c.carColors.map((cl) => ({ slug: cl.slug, name: tx(locale, cl, "name") })),
              years: c.carYears,
              defaults: c.carDefaults,
            },
          }}
        />
      </AuthCard>
    </AuthShell>
  );
}
