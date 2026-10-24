import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getDealerJoin } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { AfterSubmitList } from "@/components/business/Blocks";
import { DealerJoinForm } from "@/components/business/forms/DealerJoinForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const d = await getDealerJoin();
  return { title: getBusinessDict(locale).meta.dealerJoin, description: tx(locale, d.head, "description") };
}

// W2-91b · طلب الانضمام · وكالة (759:13176)
// ?demo=figma يعرض حالة الفيجما المعبّاة (للمقارنة بالبكسل)
export default async function DealerJoinPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const locale = await getLocale();
  const demo = (await searchParams).demo === "figma";
  const d = await getDealerJoin();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t.home, href: routes.home },
          { label: b.business, href: routes.forProviders },
          { label: b.dealers, href: routes.forDealers },
          { label: tx(locale, d.head, "crumb") },
        ]}
        title={tx(locale, d.head, "title")}
        description={tx(locale, d.head, "description")}
      />
      <Container className="flex flex-col gap-8 pt-10 pb-24 lg:flex-row lg:items-start">
        <DealerJoinForm locale={locale} d={d} demo={demo} next={routes.joinSent} />
        <AfterSubmitList
          title={tx(locale, d, "after_title")}
          steps={d.after.map((s) => tx(locale, s, "text"))}
          haveAccount={tx(locale, d, "have_account")}
          portal={tx(locale, d, "portal")}
          portalHref={externalPortals.dealer}
        />
      </Container>
    </>
  );
}
