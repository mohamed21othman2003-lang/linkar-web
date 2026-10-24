import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getHelpPage } from "@/lib/server/help";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { HelpCenter } from "@/components/help/HelpCenter";
import { ContactBand } from "@/components/help/ContactBand";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { page } = await getHelpPage();
  return { title: tx(locale, page, "title"), description: tx(locale, page, "description") };
}

// W2-97 · مركز المساعدة (761:13678)
export default async function HelpPage() {
  const locale = await getLocale();
  const t = getCommon(locale);
  const { page, topics, articles, band } = await getHelpPage();
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const topicTitle = new Map(topics.map((tp) => [tp.key, tx(locale, tp, "title")]));

  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, page, "title") }]} title={tx(locale, page, "title")} description={tx(locale, page, "description")} />
      <Container className="flex flex-col gap-10 pt-10 pb-24">
        <HelpCenter
          topics={topics.map((tp) => ({
            key: tp.key,
            icon: tp.icon,
            title: tx(locale, tp, "title"),
            allHref: tp.allHref,
            articles: tp.articles.map((s) => ({ title: tx(locale, bySlug.get(s)!, "title"), href: routes.helpArticle(s) })),
          }))}
          articles={articles.map((a) => ({
            title: tx(locale, a, "title"),
            summary: a.placeholder && a.topic === "business" ? "" : tx(locale, a, "summary"),
            topic: topicTitle.get(a.topic)!,
            href: routes.helpArticle(a.slug),
          }))}
          locale={locale}
          placeholder={tx(locale, page, "search_placeholder")}
        />
        <ContactBand
          title={tx(locale, band, "title")}
          body={tx(locale, band, "body")}
          primary={{ label: tx(locale, band, "complaint"), href: band.complaint_href }}
          secondary={{ label: tx(locale, band, "contact"), href: band.contact_href }}
        />
      </Container>
    </>
  );
}
