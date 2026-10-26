import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getProvidersPage } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { ArrowLink, BusinessHead, SectionTitle } from "@/components/business/Blocks";
import { FaqAccordion } from "@/components/business/FaqAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getProvidersPage();
  return { title: getBusinessDict(locale).meta.providers, description: tx(locale, p.head, "description") };
}

// W2-90 · لينكار لمقدّمي الخدمة · صفحة التعريف (758:12311)
export default async function ForProvidersPage() {
  const locale = await getLocale();
  const p = await getProvidersPage();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);
  const tools = p.tools;

  return (
    <>
      <BusinessHead
        tone="dark"
        crumbs={[{ label: t.home, href: routes.home }, { label: b.business, href: routes.forProviders }, { label: tx(locale, p.head, "crumb") }]}
        title={tx(locale, p.head, "title")}
        description={tx(locale, p.head, "description")}
      >
        <Link href={routes.providerJoin} className={actionClass("primary")}>
          {tx(locale, p, "cta_join")}
          <Icon name="chevron-left" size={16} flip />
        </Link>
        <a href={externalPortals.provider} className={actionClass("outline")}>
          {tx(locale, p, "cta_console")}
        </a>
      </BusinessHead>

      <Container className="flex flex-col gap-10 pt-12 pb-24 md:gap-16">
        <SectionTitle title={tx(locale, p, "why_title")} body={tx(locale, p, "why_body")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.why.map((c) => (
            <article key={c.title_ar} className="flex flex-col gap-2.5 rounded-xl border border-v3-card-stroke bg-white p-7">
              <span className="flex w-fit rounded-[14px] bg-neon-green p-3 text-deep-charcoal">
                <Icon name={c.icon} size={24} />
              </span>
              <h3 className="text-h5 text-deep-charcoal">{tx(locale, c, "title")}</h3>
              <p className="text-body-s text-v3-text-meta">{tx(locale, c, "body")}</p>
            </article>
          ))}
        </div>

        <section className="flex flex-col gap-10 rounded-[28px] bg-deep-charcoal p-6 md:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3.5">
            <h2 className="text-h3 text-white md:text-h2">{tx(locale, tools, "title")}</h2>
            <p className="text-body-m text-white/80 md:text-body-l">{tx(locale, tools, "body")}</p>
            <ul className="flex flex-col gap-3.5">
              {tools.features.map((f) => (
                <li key={f.text_ar} className="flex items-start gap-2.5 text-body-m text-white md:items-center">
                  <Icon name="check" size={18} className="mt-[5px] shrink-0 text-neon-green md:mt-0" />
                  {tx(locale, f, "text")}
                </li>
              ))}
            </ul>
          </div>
          <div aria-hidden className="flex w-full flex-col gap-3 rounded-xl border border-border-default bg-white p-5 md:p-6 lg:w-[420px] lg:shrink-0">
            <p className="flex items-center gap-2 text-label-m text-green-active">
              {tx(locale, tools.preview, "badge")}
              <span className="size-2 rounded-full bg-nature-green" />
            </p>
            <p className="text-h5 text-deep-charcoal lg:whitespace-nowrap">{tx(locale, tools.preview, "title")}</p>
            <p className="text-body-s text-text-secondary">{tx(locale, tools.preview, "meta")}</p>
            {tools.preview.rows.map((r) => (
              <div key={r.label_ar} className="flex items-center justify-between text-[14px]">
                <span className="text-body-s text-text-secondary">{tx(locale, r, "label")}</span>
                <span className="text-label-m text-deep-charcoal">{tx(locale, r, "value")}</span>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 whitespace-nowrap">
              <span className="rounded-md border border-border-default bg-white px-3 py-2 text-label-m md:px-3.5 text-deep-charcoal">{tx(locale, tools.preview, "voucher")}</span>
              <span className="rounded-md bg-neon-green px-3 py-2 text-label-m md:px-3.5 text-deep-charcoal">{tx(locale, tools.preview, "checkin")}</span>
            </div>
          </div>
        </section>

        {/* معايير الاعتماد: الهيدر والفوتر بيربطوا هنا (#criteria) — الصفحة مافيهاش قسم معايير منفصل */}
        <SectionTitle id="criteria" title={tx(locale, p, "join_title")} body={tx(locale, p, "join_body")} />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.join.map((c, i) => {
            const inner = (
              <>
                <span className="w-fit rounded-full bg-neon-green px-3.5 py-1.5 text-label-l text-deep-charcoal">{i + 1}</span>
                <h3 className="text-h5 text-deep-charcoal">{tx(locale, c, "title")}</h3>
                <p className="text-body-s text-v3-text-meta">{tx(locale, c, "body")}</p>
              </>
            );
            const cls = "flex h-full flex-col gap-2.5 rounded-xl border border-v3-card-stroke bg-white p-7";
            return (
              <li key={c.title_ar}>
                {i === 0 ? (
                  <Link href={routes.providerJoin} className={`${cls} hover:border-deep-charcoal`}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ol>

        <SectionTitle title={tx(locale, p, "faq_title")} />
        <FaqAccordion items={p.faq.map((f) => ({ q: tx(locale, f, "q"), a: tx(locale, f, "a") }))} />

        <section className="flex flex-col items-start gap-6 rounded-[28px] bg-neon-green px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-9">
          <div className="flex flex-col gap-1.5 text-deep-charcoal">
            <h2 className="text-h4 md:text-h3">{tx(locale, p, "band_title")}</h2>
            <p className="text-body-m">{tx(locale, p, "band_body")}</p>
          </div>
          <ArrowLink href={routes.providerJoin} variant="dark">
            {tx(locale, p, "cta_join")}
          </ArrowLink>
        </section>
      </Container>
    </>
  );
}
