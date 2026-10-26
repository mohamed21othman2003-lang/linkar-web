import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getAffiliatesPage } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { BusinessHead, DarkBand, FeatureCard, IconTile, StepCard } from "@/components/business/Blocks";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getAffiliatesPage();
  return { title: getBusinessDict(locale).meta.affiliates, description: tx(locale, p.head, "description") };
}

const h2 = "text-h3 text-deep-charcoal md:text-h2";

// W2-94 · برنامج المسوّقين (1320:346840)
export default async function AffiliatesPage() {
  const locale = await getLocale();
  const p = await getAffiliatesPage();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);
  const c = p.credit;

  return (
    <>
      <BusinessHead
        tone="dark"
        crumbs={[{ label: t.home, href: routes.home }, { label: b.business, href: routes.forProviders }, { label: tx(locale, p.head, "crumb") }]}
        title={tx(locale, p.head, "title")}
        description={tx(locale, p.head, "description")}
        ctaGap
      >
        <Link href={routes.affiliateJoin} className={actionClass("primary")}>
          {tx(locale, p, "cta_join")}
          <Icon name="plus" size={16} />
        </Link>
        <a href={externalPortals.affiliate} className={actionClass("outline")}>
          {tx(locale, p, "cta_portal")}
          <Icon name="user" size={16} />
        </a>
      </BusinessHead>

      <Container className="flex flex-col gap-7 pt-12 pb-24">
        <h2 className={h2}>{tx(locale, p, "how_title")}</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.steps.map((s, i) => (
            <li key={s.title_ar}>
              <StepCard icon={s.icon} step={b.step(i + 1)} title={tx(locale, s, "title")} body={tx(locale, s, "body")} muted="gray" />
            </li>
          ))}
        </ol>

        <section className="flex flex-col gap-10 rounded-2xl bg-deep-charcoal p-6 md:p-10 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-label-m text-neon-green">{tx(locale, c, "eyebrow")}</p>
            <h2 className="text-h4 text-white md:text-h3">{tx(locale, c, "title")}</h2>
            <p className="text-body-m text-white/85">{tx(locale, c, "body")}</p>
            <ul className="flex flex-col gap-3">
              {c.points.map((pt) => (
                <li key={pt.text_ar} className="flex items-start gap-2 text-body-s text-white/90">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-neon-green" />
                  {tx(locale, pt, "text")}
                </li>
              ))}
            </ul>
          </div>
          <div aria-hidden className="flex w-full flex-col gap-3 rounded-xl border border-border-default bg-white p-5 md:p-7 lg:w-[400px] lg:shrink-0">
            <p className="text-caption text-text-secondary">{tx(locale, c, "code_label")}</p>
            <p dir="ltr" className="text-h2 text-deep-charcoal rtl:text-end">
              {c.code}
            </p>
            <p className="flex w-fit items-center gap-1.5 rounded-full bg-bg-success-subtle px-3 py-1.5 text-label-m whitespace-nowrap text-green-active max-md:text-caption">
              {tx(locale, c, "pill")}
              <Icon name="tag" size={14} className="text-nature-green" />
            </p>
            <div className="flex items-center gap-2.5">
              <IconTile icon="qr" tone="gray" />
              <span className="text-body-s text-text-secondary">{tx(locale, c, "qr")}</span>
            </div>
          </div>
        </section>

        <h2 className={h2}>{tx(locale, p, "rules_title")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.rules.map((r) => (
            <FeatureCard key={r.title_ar} icon={r.icon} title={tx(locale, r, "title")} body={tx(locale, r, "body")} muted="gray" />
          ))}
        </div>
        <div className="flex items-start gap-3.5 rounded-lg bg-tile p-5">
          <Icon name="info" size={20} className="mt-0.5 shrink-0 text-deep-charcoal" />
          <div className="flex flex-col gap-1">
            <h3 className="text-label-l text-deep-charcoal">{tx(locale, p.note, "title")}</h3>
            <p className="text-body-s text-text-secondary">{tx(locale, p.note, "body")}</p>
          </div>
        </div>

        <h2 className={h2}>{tx(locale, p, "faq_title")}</h2>
        <dl className="flex flex-col rounded-xl border border-border-default bg-white p-2">
          {p.faq.map((f, i) => (
            <div key={f.q_ar} className={`flex flex-col gap-1.5 px-5 py-4 ${i ? "border-t border-border-default" : ""}`}>
              <dt className="text-label-l text-deep-charcoal">{tx(locale, f, "q")}</dt>
              <dd className="text-body-s text-text-secondary">{tx(locale, f, "a")}</dd>
            </div>
          ))}
        </dl>

        <DarkBand title={tx(locale, p, "band_title")} body={tx(locale, p, "band_body")} cta={tx(locale, p, "band_cta")} href={routes.affiliateJoin} />
      </Container>
    </>
  );
}
