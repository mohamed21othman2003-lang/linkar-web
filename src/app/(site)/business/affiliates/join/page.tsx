import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getAffiliateJoin } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { AfterSubmitList } from "@/components/business/Blocks";
import { AffiliateJoinForm } from "@/components/business/forms/AffiliateJoinForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = await getAffiliateJoin();
  return { title: getBusinessDict(locale).meta.affiliateJoin, description: tx(locale, d.head, "description") };
}

// W2-94b · طلب الانضمام · مسوّق (1320:347210)
// ?demo=figma يعرض حالة الفيجما المعبّاة (للمقارنة بالبكسل)
export default async function AffiliateJoinPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const locale = await getLocale();
  const demo = (await searchParams).demo === "figma";
  const d = await getAffiliateJoin();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <PageHeader tone="dark"
        crumbs={[
          { label: t.home, href: routes.home },
          { label: b.business, href: routes.forProviders },
          { label: b.affiliates, href: routes.affiliates },
          { label: tx(locale, d.head, "crumb") },
        ]}
        title={tx(locale, d.head, "title")}
        description={tx(locale, d.head, "description")}
      />
      <Container className="flex flex-col gap-8 pt-10 pb-24 lg:flex-row lg:items-start">
        <AffiliateJoinForm locale={locale} d={d} demo={demo} next={routes.affiliateJoinSent} />
        <AfterSubmitList
          title={tx(locale, d, "after_title")}
          steps={d.after.map((s) => tx(locale, s, "text"))}
          haveAccount={tx(locale, d, "have_account")}
          portal={tx(locale, d, "portal")}
          portalHref={externalPortals.affiliate}
        />
      </Container>
    </>
  );
}
