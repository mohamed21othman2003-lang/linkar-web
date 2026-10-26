import Link from "next/link";
import { tx, type Locale } from "@/i18n/config";
import type { BlogPost, blogPage } from "@/lib/data/blog/blog";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import type { PostCardView } from "./PostCard";

type Page = typeof blogPage;

// «3 دقائق قراءة» — العربي: 3–10 «دقائق»، غير كده «دقيقة» (الفيجما: «2 دقيقة قراءة»)
export function minutesLabel(locale: Locale, page: Page, n: number) {
  const few = n >= 3 && n <= 10;
  return (few ? tx(locale, page, "minutes") : tx(locale, page, "minute_one")).replace("{n}", String(n));
}

export function toCard(locale: Locale, p: BlogPost, tag: string, page: Page): PostCardView {
  return {
    slug: p.slug,
    href: routes.blogPost(p.slug),
    title: tx(locale, p, "title"),
    excerpt: tx(locale, p, "excerpt"),
    tag,
    minutes: minutesLabel(locale, page, p.minutes),
    photo: p.photo,
    category: p.category,
  };
}

// CTA band (85:48215) — «جاهز تطبّق النصيحة؟» + «ابحث عن خدمة ‹» → W2-25
export function BlogCta({ locale, page }: { locale: Locale; page: Page }) {
  return (
    <section className="flex flex-col items-start gap-6 rounded-[28px] bg-deep-charcoal px-6 py-7 md:flex-row md:items-center md:justify-between md:px-10 md:py-9">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-[22px]/[34px] font-bold text-white md:text-[24px]/[36px]">{tx(locale, page.cta, "title")}</h2>
        <p className="text-[16px]/[26px] font-light text-v3-card-stroke">{tx(locale, page.cta, "body")}</p>
      </div>
      <Link
        href={routes.services}
        className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-full bg-neon-green ps-6 pe-5 text-label-l font-bold text-deep-charcoal transition-colors hover:bg-bg-brand-hover"
      >
        {tx(locale, page.cta, "button")}
        <Icon name="chevron-left" size={16} flip />
      </Link>
    </section>
  );
}
