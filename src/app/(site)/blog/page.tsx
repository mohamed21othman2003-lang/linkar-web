import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx, type Locale } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { formatDate } from "@/lib/format";
import { getBlogPage } from "@/lib/server/blog";
import type { BlogPost, blogPage } from "@/lib/data/blog/blog";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { BlogList } from "@/components/blog/BlogList";
import { BlogCta, minutesLabel, toCard } from "@/components/blog/bits";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { page } = await getBlogPage();
  return { title: tx(locale, page, "title"), description: tx(locale, page, "description") };
}

// W2-100 · المدونة (85:48104) — البحث والتصنيفات · المقال المميز · الكروت · الترقيم · «جاهز تطبّق النصيحة؟»
export default async function BlogPage() {
  const locale = await getLocale();
  const t = getCommon(locale);
  const { page, categories, featured, posts, pageCount } = await getBlogPage();
  const catLabel = new Map(categories.map((c) => [c.key, tx(locale, c, "label")]));

  return (
    <>
      <PageHeader
        tone="dark"
        crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, page, "crumb") }]}
        title={tx(locale, page, "title")}
        description={tx(locale, page, "description")}
      />
      <Container className="flex flex-col gap-10 pt-10 pb-24 lg:gap-12">
        <BlogList
          categories={categories.map((c) => ({ key: c.key, label: tx(locale, c, "label") }))}
          posts={posts.map((p) => toCard(locale, p, catLabel.get(p.category)!, page))}
          search={tx(locale, page, "search")}
          empty={tx(locale, page, "empty")}
          featured={<Featured locale={locale} post={featured} tag={`${catLabel.get(featured.category)} · ${tx(locale, page, "featured_tag")}`} page={page} />}
          pagination={
            // الترقيم زي الفيجما (3 صفحات، الأولى نشطة) — المقالات الحالية كلها في الصفحة الأولى؛ الباقي بييجي من الـAPI
            <nav aria-label={tx(locale, page, "next")} className="flex h-11 items-center justify-center gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <span
                  key={n}
                  aria-current={n === 1 ? "page" : undefined}
                  aria-disabled={n === 1 ? undefined : true}
                  className={`flex size-11 items-center justify-center rounded-full text-[15px]/[22px] ${
                    n === 1 ? "bg-deep-charcoal font-bold text-neon-green" : "border border-chip-line bg-white font-medium text-deep-charcoal"
                  }`}
                >
                  {n}
                </span>
              ))}
              <span aria-disabled className="flex size-11 items-center justify-center rounded-full border border-chip-line bg-white text-deep-charcoal">
                <Icon name="chevron-left" size={16} flip />
                <span className="sr-only">{tx(locale, page, "next")}</span>
              </span>
            </nav>
          }
        />
        <BlogCta locale={locale} page={page} />
      </Container>
    </>
  );
}

// Featured · PPF أم نانو سيراميك (85:48128) — 420 ارتفاع: النص يمين (620) والصورة شمال (660)
function Featured({ locale, post, tag, page }: { locale: Locale; post: BlogPost; tag: string; page: typeof blogPage }) {
  const date = formatDate(locale, post.date, { day: "numeric", month: "long", year: "numeric" });
  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] bg-deep-charcoal lg:h-[420px] lg:flex-row">
      <div className="flex flex-col justify-center gap-4 p-6 md:p-10 lg:w-[620px] lg:shrink-0 lg:p-12">
        <span className="self-start rounded-full bg-neon-green px-3 py-[5px] text-[13px]/[20px] font-bold text-deep-charcoal">{tag}</span>
        <h2 className="max-w-[524px] text-[26px]/[40px] font-bold text-white md:text-h2">{tx(locale, post, "title")}</h2>
        <p className="max-w-[524px] text-body-m text-v3-card-stroke">{tx(locale, post, "excerpt")}</p>
        <div className="flex flex-wrap items-center gap-2 text-[13px]/[20px] text-v3-card-stroke">
          <span className="flex size-[26px] items-center justify-center rounded-full bg-neon-green text-[12px]/[16px] font-bold text-deep-charcoal">{tx(locale, page, "author_initial")}</span>
          <span className="font-medium">{tx(locale, page, "author")} ·</span>
          <span className="font-light">
            {minutesLabel(locale, page, post.minutes)} · {date}
          </span>
        </div>
        <Link
          href={routes.blogPost(post.slug)}
          className="inline-flex h-[50px] items-center gap-2 self-start rounded-full bg-neon-green ps-[22px] pe-[18px] text-[15px]/[24px] font-bold text-deep-charcoal transition-colors hover:bg-bg-brand-hover"
        >
          {tx(locale, page, "read")}
          <Icon name="chevron-left" size={16} flip />
        </Link>
      </div>
      <div className="relative order-first h-[240px] shrink-0 md:h-[320px] lg:order-none lg:h-full lg:w-[660px]">
        <Image src={post.photo} alt="" fill sizes="(min-width: 1024px) 660px, 100vw" className="object-cover" priority />
      </div>
    </article>
  );
}
