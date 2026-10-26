import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { formatDate } from "@/lib/format";
import { getBlogPost, getBlogSlugs } from "@/lib/server/blog";
import type { BlogSection } from "@/lib/data/blog/blog";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { PostCard } from "@/components/blog/PostCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { TocNav } from "@/components/blog/TocNav";
import { minutesLabel, toCard } from "@/components/blog/bits";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getBlogSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [locale, data] = await Promise.all([getLocale(), getBlogPost(slug)]);
  if (!data) return {};
  return { title: tx(locale, data.post, "title"), description: tx(locale, data.post, "excerpt") };
}

// W2-100b · مقال (85:48224) — المقال (صورة · مقدمة · أقسام · جدول مقارنة · نصيحة · قائمة · مشاركة) + عمود جانبي (المحتويات · دعوة للخدمة · الكاتب) + مقالات ذات صلة
// المقالات المؤقتة (placeholder) بتعرض المقتطف + «محتوى المقال قيد الإعداد»
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [locale, data] = await Promise.all([getLocale(), getBlogPost(slug)]);
  if (!data) notFound();
  const { post, related, category, categories, page } = data;
  const catLabel = new Map(categories.map((c) => [c.key, tx(locale, c, "label")]));
  const t = getCommon(locale);
  const title = tx(locale, post, "title");
  const date = formatDate(locale, post.date, { day: "numeric", month: "long", year: "numeric" });
  const sections = post.sections ?? [];
  const toc = sections.filter((s): s is Extract<BlogSection, { id: string }> => "id" in s).map((s) => ({ id: s.id, label: s.kind === "h2" ? tx(locale, s, "text") : "" }));
  // «مقارنة سريعة» = عنوان الجدول في المحتويات (مالوش عنوان ظاهر في المقال)
  const tocItems = toc.map((x) => (x.label ? x : { ...x, label: locale === "en" ? "Quick comparison" : "مقارنة سريعة" }));
  const ctaServices = post.cta_services ?? [];

  return (
    <>
      <PageHeader
        tone="dark"
        crumbs={[
          { label: t.home, href: routes.home },
          { label: tx(locale, page, "crumb"), href: routes.blog },
          { label: tx(locale, category, "label") },
          { label: tx(locale, post, "crumb") },
        ]}
        title={title}
        description={`${tx(locale, page, "author")} · ${minutesLabel(locale, page, post.minutes)} · ${date}`}
      />
      <Container className="flex flex-col gap-12 pt-12 pb-24 lg:gap-16">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-12">
          {/* Article (820) */}
          <article className="flex min-w-0 flex-col gap-[22px] xl:flex-1">
            <div className="relative aspect-[820/420] w-full overflow-hidden rounded-2xl">
              <Image src={post.photo} alt="" fill sizes="(min-width: 1024px) 820px, 100vw" className="object-cover" priority />
            </div>
            <p className="text-[17px]/[32px] text-deep-charcoal md:text-[19px]/[36px]">{(locale === "en" ? post.lead_en : post.lead_ar) ?? tx(locale, post, "excerpt")}</p>
            {post.placeholder && <p className="rounded-lg bg-tile px-5 py-4 text-body-m text-state-gray">{tx(locale, page, "placeholder_body")}</p>}
            {sections.map((s, i) => {
              switch (s.kind) {
                case "h2":
                  return (
                    <h2 key={i} id={s.id} className="scroll-mt-28 text-[22px]/[34px] font-bold text-deep-charcoal md:text-[24px]/[38px]">
                      {tx(locale, s, "text")}
                    </h2>
                  );
                case "p":
                  return (
                    <p key={i} className="text-[16px]/[30px] font-light text-state-gray md:text-[17px]/[32px]">
                      {tx(locale, s, "text")}
                    </p>
                  );
                case "table":
                  return (
                    <div key={i} id={s.id} className="scroll-mt-28 overflow-x-auto rounded-[18px] border border-hairline">
                      <table className="w-full min-w-[560px] border-collapse text-start text-[15px]/[24px]">
                        <thead>
                          <tr className="bg-deep-charcoal">
                            {s.head.map((h, j) => (
                              <th key={j} scope="col" className={`h-[52px] px-5 text-start font-bold ${j === 0 ? "w-[340px] text-white" : "w-[240px] text-neon-green"}`}>
                                {tx(locale, h, "text")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.rows.map((r, j) => (
                            <tr key={j} className={j % 2 ? "bg-page-soft" : "bg-white"}>
                              {r.map((c, k) =>
                                k === 0 ? (
                                  <th key={k} scope="row" className="h-[52px] px-5 text-start font-bold text-deep-charcoal">
                                    {tx(locale, c, "text")}
                                  </th>
                                ) : (
                                  <td key={k} className="h-[52px] px-5 font-light text-deep-charcoal">
                                    {tx(locale, c, "text")}
                                  </td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                case "tip":
                  return (
                    <aside key={i} className="flex items-start gap-3.5 rounded-lg border-s-4 border-neon-green bg-tip-lime px-[22px] py-5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-neon-green text-deep-charcoal">
                        <Icon name="info" size={18} />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="text-[16px]/[24px] font-bold text-green-active">{tx(locale, s, "title")}</p>
                        <p className="text-[15px]/[26px] font-light text-tip-ink">{tx(locale, s, "text")}</p>
                      </div>
                    </aside>
                  );
                case "list":
                  return (
                    <ul key={i} className="flex flex-col gap-3">
                      {s.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-3 text-[16px]/[28px] text-deep-charcoal md:text-[17px]/[30px]">
                          <span className="mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-deep-charcoal text-neon-green">
                            <Icon name="check" size={14} />
                          </span>
                          {tx(locale, it, "text")}
                        </li>
                      ))}
                    </ul>
                  );
              }
            })}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
              <ul className="flex flex-wrap gap-2">
                {(post.tags ?? [{ text_ar: category.label_ar, text_en: category.label_en }]).map((tg) => (
                  <li key={tg.text_ar} className="rounded-full bg-tile px-3 py-[5px] text-[13px]/[20px] font-medium text-deep-charcoal">
                    {tx(locale, tg, "text")}
                  </li>
                ))}
              </ul>
              <ShareButtons title={title} share={tx(locale, page, "share")} copy={tx(locale, page, "copy")} copied={tx(locale, page, "copied")} />
            </div>
          </article>

          {/* Side (412) */}
          <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:w-[412px] xl:shrink-0">
            {tocItems.length > 0 && <TocNav title={tx(locale, page, "toc")} items={tocItems} />}
            {ctaServices.length > 0 && (
              <div className="flex flex-col gap-3.5 rounded-[22px] bg-deep-charcoal px-6 py-[26px]">
                <div className="flex gap-2">
                  {[...ctaServices].reverse().map((sv) => (
                    <span key={sv.service} className="flex size-[52px] items-center justify-center rounded-[14px] bg-white/8 text-neon-green">
                      <ServiceGlyph name={sv.service} size={32} />
                    </span>
                  ))}
                </div>
                <h2 className="text-[20px]/[30px] font-bold text-white">{tx(locale, page.service_cta, "title")}</h2>
                <p className="text-body-s text-v3-card-stroke">{tx(locale, page.service_cta, "body")}</p>
                {ctaServices.map((sv, i) => (
                  <Link
                    key={sv.service}
                    href={routes.services}
                    className={`flex items-center justify-center rounded-full px-[18px] py-3 text-[15px]/[24px] transition-colors ${
                      i === 0 ? "bg-neon-green font-bold text-deep-charcoal hover:bg-bg-brand-hover" : "border border-white/40 font-medium text-white hover:bg-white/8"
                    }`}
                  >
                    {tx(locale, sv, "label")}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 rounded-xl bg-tile px-5 py-[18px]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-neon-green text-[20px]/[28px] font-bold text-deep-charcoal">
                {tx(locale, page, "author_initial")}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[16px]/[24px] font-bold text-deep-charcoal">{tx(locale, page, "author")}</p>
                <p className="text-[13px]/[20px] font-light text-state-gray">{tx(locale, page, "author_bio")}</p>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-[24px]/[36px] font-bold text-deep-charcoal">{tx(locale, page, "related")}</h2>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <PostCard p={toCard(locale, p, catLabel.get(p.category)!, page)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}

