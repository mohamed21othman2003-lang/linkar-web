import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getDealersPage } from "@/lib/server/business";
import { externalPortals } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { BusinessHead, DarkBand, FeatureCard, IconTile, StepCard } from "@/components/business/Blocks";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getDealersPage();
  return { title: getBusinessDict(locale).meta.dealers, description: tx(locale, p.head, "description") };
}

const h2 = "text-h3 text-deep-charcoal md:text-h2";

// W2-91 · لينكار للوكالات · باقات بأسعار الوكالات (758:12823)
export default async function ForDealersPage() {
  const locale = await getLocale();
  const p = await getDealersPage();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <BusinessHead
        crumbs={[{ label: t.home, href: routes.home }, { label: b.business, href: routes.forProviders }, { label: tx(locale, p.head, "crumb") }]}
        title={tx(locale, p.head, "title")}
        description={tx(locale, p.head, "description")}
        ctaGap
      >
        <Link href={routes.dealerJoin} className={actionClass("primary")}>
          {tx(locale, p, "cta_join")}
          <Icon name="plus" size={16} />
        </Link>
        <a href={externalPortals.dealer} className={actionClass("outline")}>
          {tx(locale, p, "cta_portal")}
          <Icon name="user" size={16} />
        </a>
      </BusinessHead>

      <Container className="flex flex-col gap-7 pt-12 pb-24">
        <h2 className={h2}>{tx(locale, p, "how_title")}</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.steps.map((s, i) => (
            <li key={s.title_ar}>
              <StepCard icon={s.icon} step={b.step(i + 1)} title={tx(locale, s, "title")} body={tx(locale, s, "body")} />
            </li>
          ))}
        </ol>

        <section className="flex flex-col gap-5 rounded-2xl bg-deep-charcoal p-6 md:p-10">
          <p className="text-label-m text-neon-green">{tx(locale, p.pay, "eyebrow")}</p>
          <h2 className="text-h4 text-white md:text-h3">{tx(locale, p.pay, "title")}</h2>
          <p className="text-body-m text-white/85">{tx(locale, p.pay, "body")}</p>
          <div className="grid gap-5 md:grid-cols-2">
            {p.pay.options.map((o) => (
              <article key={o.title_ar} className="flex flex-col gap-2.5 rounded-xl border border-white/14 bg-white/6 p-6">
                <IconTile icon={o.icon} />
                <h3 className="text-h5 text-white">{tx(locale, o, "title")}</h3>
                <p className="text-body-s text-white/80">{tx(locale, o, "body")}</p>
              </article>
            ))}
          </div>
        </section>

        <h2 className={h2}>{tx(locale, p, "features_title")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.features.map((f) => (
            <FeatureCard key={f.title_ar} icon={f.icon} title={tx(locale, f, "title")} body={tx(locale, f, "body")} />
          ))}
        </div>

        <section className="flex flex-col gap-8 rounded-2xl bg-tile p-6 md:p-8 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2.5">
            <h2 className="text-h4 text-deep-charcoal md:text-h3">{tx(locale, p.customer, "title")}</h2>
            <p className="text-body-m text-text-secondary">{tx(locale, p.customer, "body")}</p>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-[18px] border border-border-default bg-white p-5 lg:w-[420px] lg:shrink-0">
            <p className="text-caption text-text-secondary">{tx(locale, p.customer, "sms_from")}</p>
            <p className="text-body-s text-deep-charcoal">{tx(locale, p.customer, "sms")}</p>
          </div>
        </section>

        <h2 className={h2}>{tx(locale, p, "join_title")}</h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {p.join.map((f) => (
            <li key={f.title_ar}>
              <FeatureCard icon={f.icon} title={tx(locale, f, "title")} body={tx(locale, f, "body")} />
            </li>
          ))}
        </ol>

        <DarkBand title={tx(locale, p, "band_title")} body={tx(locale, p, "band_body")} cta={tx(locale, p, "cta_join")} href={routes.dealerJoin} />
      </Container>
    </>
  );
}
