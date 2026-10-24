import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getHelpDict } from "@/i18n/dict/help";
import { getHelpArticle, getHelpArticles } from "@/lib/server/help";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { ContactBand } from "@/components/help/ContactBand";
import { ArticleFeedback } from "@/components/help/ArticleFeedback";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getHelpArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [locale, data] = await Promise.all([getLocale(), getHelpArticle(slug)]);
  if (!data) return {};
  return { title: tx(locale, data.article, "title"), description: tx(locale, data.article, "summary") };
}

// W2-97b · مقال مساعدة (761:14200) — قالب واحد لكل المقالات؛ المقالات المؤقتة (placeholder) بتعرض ملاحظة «قيد الإعداد»
export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  const [locale, data] = await Promise.all([getLocale(), getHelpArticle(slug)]);
  if (!data) notFound();
  const { article: a, topic, related, page, band } = data;
  const t = getCommon(locale);
  const d = getHelpDict(locale);
  const title = tx(locale, a, "title");
  const steps = a.steps ?? [];

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t.home, href: routes.home },
          { label: tx(locale, topic, "title"), href: topic.allHref },
          { label: tx(locale, page, "title"), href: routes.help },
          { label: title },
        ]}
        title={title}
        description={tx(locale, a, "summary")}
      />
      <Container className="flex flex-col gap-10 pt-10 pb-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <article className="flex min-w-0 flex-1 flex-col gap-[18px] rounded-xl border border-border-default bg-white p-5 md:p-8">
            {a.placeholder ? (
              <p className="rounded-md border border-dashed border-border-strong bg-tile px-4 py-3 text-body-m text-text-secondary">{d.placeholderBody}</p>
            ) : (
              <>
                {a.intro_ar && <p className="text-body-l text-deep-charcoal">{tx(locale, a as { intro_ar: string; intro_en: string }, "intro")}</p>}
                {steps.length > 0 && (
                  <ol className="flex flex-col gap-[18px]">
                    {steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-3.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neon-green text-label-l text-deep-charcoal">{i + 1}</span>
                        <div className="flex flex-col gap-0.5">
                          <h2 className="text-h5 text-deep-charcoal">{tx(locale, s, "title")}</h2>
                          <p className="text-body-m text-text-secondary">{tx(locale, s, "body")}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {a.note_ar && (
                  <p className="flex items-start gap-2.5 rounded-xl border border-neon-green/60 bg-tint-lime px-[18px] py-3.5 text-body-s text-deep-charcoal">
                    <Icon name="info" size={16} className="mt-1 shrink-0 text-deep-charcoal" />
                    {tx(locale, a as { note_ar: string; note_en: string }, "note")}
                  </p>
                )}
              </>
            )}
            <hr className="border-border-default" />
            <ArticleFeedback question={d.helpful} yes={d.yes} no={d.no} thanks={tx(locale, page, "feedback_toast")} />
          </article>

          {related.length > 0 && (
            <aside className="flex w-full flex-col gap-3 lg:w-[340px] lg:shrink-0">
              <h2 className="text-h5 text-deep-charcoal">{tx(locale, page, "related_title")}</h2>
              {related.map((r) => (
                <Link key={r.slug} href={routes.helpArticle(r.slug)} className="flex items-center justify-between gap-1 rounded-md bg-tile px-4 py-3 text-body-m text-deep-charcoal hover:bg-bg-muted">
                  <span>{tx(locale, r, "title")}</span>
                  <Icon name="chevron-left" size={14} flip className="shrink-0 text-state-gray" />
                </Link>
              ))}
            </aside>
          )}
        </div>
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
