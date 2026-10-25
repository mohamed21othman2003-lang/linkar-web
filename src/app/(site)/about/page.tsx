import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getAboutPage } from "@/lib/server/about";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getAboutPage();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

// p-7 من lg زي الفيجما؛ أقل على الموبايل والتابلت عشان كروت الـ3 أعمدة على 768 ماتتزنقش
const card = "flex flex-col gap-2.5 rounded-xl border border-v3-card-stroke bg-white p-5 lg:p-7";

// W2-95 · من نحن (760:13173) — #vision (رؤيتنا ورسالتنا) و#how-it-works (كيف تعمل لينكار) مربوطين من قائمة «من نحن» والفوتر
export default async function AboutPage() {
  const locale = await getLocale();
  const t = getCommon(locale);
  const p = await getAboutPage();

  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "title") }]} title={tx(locale, p, "title")} description={tx(locale, p, "description")} />
      <Container className="flex flex-col gap-10 pt-12 pb-24 lg:gap-14">
        {/* Story */}
        <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, p, "story_title")}</h2>
            <p className="text-body-l text-text-secondary">{tx(locale, p, "story_body")}</p>
          </div>
          <figure className="flex flex-col gap-3 rounded-[28px] bg-deep-charcoal p-7 md:p-9 lg:w-[460px] lg:shrink-0">
            <span aria-hidden className="text-display-l text-neon-green">“</span>
            <blockquote className="text-h4 text-white md:text-h3">{tx(locale, p, "quote")}</blockquote>
            <figcaption className="text-body-m text-white/70">{tx(locale, p, "quote_caption")}</figcaption>
          </figure>
        </section>

        {/* Vision & mission */}
        <section id="vision" className="grid scroll-mt-24 grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-[28px] bg-deep-charcoal p-7 md:p-9">
            <h2 className="text-overline text-neon-green">{tx(locale, p, "vision_label")}</h2>
            <p className="text-h4 text-white">{tx(locale, p, "vision")}</p>
          </div>
          <div className="flex flex-col gap-3 rounded-[28px] border border-neon-green/70 bg-tint-lime p-7 md:p-9">
            <h2 className="text-overline text-green-active">{tx(locale, p, "mission_label")}</h2>
            <p className="text-h4 text-deep-charcoal">{tx(locale, p, "mission")}</p>
          </div>
        </section>

        {/* Values */}
        <h2 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, p, "values_title")}</h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.values.map((v) => (
            <li key={v.title_ar} className={card}>
              <span className="flex self-start rounded-[14px] bg-neon-green p-3">
                <Icon name={v.icon} size={24} className="text-deep-charcoal" />
              </span>
              <h3 className="text-h5 text-deep-charcoal">{tx(locale, v, "title")}</h3>
              <p className="text-body-s text-v3-text-meta">{tx(locale, v, "body")}</p>
            </li>
          ))}
        </ul>

        {/* How it works */}
        <div id="how-it-works" className="flex scroll-mt-24 flex-col gap-1.5">
          <h2 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, p, "how_title")}</h2>
          <p className="text-body-l text-text-secondary">{tx(locale, p, "how_subtitle")}</p>
        </div>
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.steps.map((s, i) => (
            <li key={s.title_ar} className={card}>
              <span className="self-start rounded-full bg-neon-green px-3.5 py-1.5 text-label-l text-deep-charcoal">{i + 1}</span>
              <h3 className="text-h5 text-deep-charcoal">{tx(locale, s, "title")}</h3>
              <p className="text-body-s text-v3-text-meta">{tx(locale, s, "body")}</p>
            </li>
          ))}
        </ol>

        {/* Audiences */}
        <h2 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, p, "audience_title")}</h2>
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {p.audiences.map((a) => (
            <li key={a.title_ar} className={card}>
              <span className="flex self-start rounded-[14px] bg-neon-green p-3">
                <Icon name={a.icon} size={24} className="text-deep-charcoal" />
              </span>
              <h3 className="text-h5 text-deep-charcoal">{tx(locale, a, "title")}</h3>
              <p className="text-body-s text-v3-text-meta">{tx(locale, a, "body")}</p>
              <Link href={a.href} className="max-lg:relative max-lg:after:absolute max-lg:after:inset-x-0 max-lg:after:-inset-y-2.5 max-lg:after:content-[''] flex items-center gap-1.5 self-start py-0.5 text-label-m text-green-active hover:underline">
                {tx(locale, a, "cta")}
                <Icon name="chevron-left" size={16} flip className="text-nature-green" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
