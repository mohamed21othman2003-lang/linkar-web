import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getProviderJoin } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { ProviderJoinForm } from "@/components/business/forms/ProviderJoinForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = await getProviderJoin();
  return { title: getBusinessDict(locale).meta.providerJoin, description: tx(locale, d.head, "description") };
}

// W2-90b · طلب الانضمام · مقدّم خدمة (759:12657)
// ?demo=figma يعرض حالة الفيجما المعبّاة (للمقارنة بالبكسل)
export default async function ProviderJoinPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const locale = await getLocale();
  const demo = (await searchParams).demo === "figma";
  const d = await getProviderJoin();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <PageHeader
        crumbs={[{ label: t.home, href: routes.home }, { label: b.business, href: routes.forProviders }, { label: tx(locale, d.head, "crumb") }]}
        title={tx(locale, d.head, "title")}
        description={tx(locale, d.head, "description")}
      />
      <Container className="flex flex-col gap-8 pt-10 pb-24 lg:flex-row lg:items-start">
        <ProviderJoinForm locale={locale} d={d} demo={demo} next={routes.joinSent} />
        <aside className="flex w-full flex-col gap-4 rounded-xl bg-tile p-6 md:p-7 lg:w-[380px] lg:shrink-0">
          <h2 className="text-h5 text-deep-charcoal">{tx(locale, d, "after_title")}</h2>
          <ol className="flex flex-col gap-4">
            {d.after.map((s, i) => (
              <li key={s.title_ar} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neon-green text-label-m text-deep-charcoal">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-label-l text-deep-charcoal">{tx(locale, s, "title")}</span>
                  <span className="text-body-s text-text-secondary">{tx(locale, s, "body")}</span>
                </span>
              </li>
            ))}
          </ol>
          <hr className="border-border-default" />
          <p className="text-body-s text-text-secondary">{tx(locale, d, "have_account")}</p>
          <a href={externalPortals.provider} className="flex items-center gap-1.5 self-start rounded-md py-0.5 text-label-m text-green-active hover:underline">
            {tx(locale, d, "console")}
            <Icon name="chevron-left" size={16} flip />
          </a>
        </aside>
      </Container>
    </>
  );
}
