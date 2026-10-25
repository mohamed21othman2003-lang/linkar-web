import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { formatDate } from "@/lib/format";
import { getPolicies, getPolicy } from "@/lib/server/policies";
import type { PolicySlug } from "@/lib/data/policies/policies";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { ActiveIntoView } from "@/components/help/ActiveIntoView";

export async function policyMetadata(slug: PolicySlug): Promise<Metadata> {
  const [locale, policy] = await Promise.all([getLocale(), getPolicy(slug)]);
  return { title: tx(locale, policy, "title") };
}

// قالب السياسات (W2-99 … W2-99e): رأس الصفحة + قائمة السياسات (آخر السطر) + مستند البنود
export async function PolicyPage({ slug }: { slug: PolicySlug }) {
  const [locale, { policies, copy }, policy] = await Promise.all([getLocale(), getPolicies(), getPolicy(slug)]);
  const t = getCommon(locale);
  const title = tx(locale, policy, "title");
  const date = formatDate(locale, policy.updated, { day: "numeric", month: "long", year: "numeric" });
  const meta = tx(locale, copy, "updated").replace("{date}", date).replace("{n}", String(policy.read_minutes));
  const [askBefore, askRest] = tx(locale, copy, "ask").split("{contact}");
  const [askMiddle, askAfter] = askRest.split("{email}");

  return (
    <>
      <PageHeader
        crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, copy, "nav_title"), href: policies[0].href }, { label: title }]}
        title={title}
        description={meta}
      />
      <Container className="flex flex-col gap-8 pt-10 pb-24 lg:flex-row-reverse lg:items-start lg:gap-12">
        {/* تحت lg القائمة بتبقى شريط أفقي بيتسكرول (بدل كتلة طويلة فوق النص)؛ من lg عمود جانبي زي الفيجما */}
        <ActiveIntoView
          activeKey={slug}
          label={tx(locale, copy, "nav_title")}
          className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0 lg:w-[300px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:rounded-lg lg:bg-tile lg:p-3"
        >
          <p className="hidden px-3 py-2 text-label-m text-state-gray lg:block">{tx(locale, copy, "nav_title")}</p>
          {policies.map((p) => {
            const on = p.slug === slug;
            return (
              <Link
                key={p.slug}
                href={p.href}
                aria-current={on ? "page" : undefined}
                className={`shrink-0 rounded-[10px] px-3 py-2.5 text-label-m whitespace-nowrap transition-colors lg:whitespace-normal ${
                  on ? "bg-deep-charcoal text-neon-green" : "bg-tile text-deep-charcoal hover:bg-bg-muted lg:bg-transparent lg:hover:bg-bg-muted"
                }`}
              >
                {tx(locale, p, "title")}
              </Link>
            );
          })}
        </ActiveIntoView>

        <article className="flex min-w-0 flex-1 flex-col gap-7 rounded-xl border border-border-default bg-white p-5 md:p-10">
          {policy.clauses.map((c) => (
            <section key={c.title_ar} className="flex flex-col gap-2">
              <h2 className="text-h5 text-deep-charcoal">{tx(locale, c, "title")}</h2>
              <p className="text-body-m text-text-secondary">{tx(locale, c, "body")}</p>
            </section>
          ))}
          <p className="flex items-start gap-2.5 rounded-[14px] bg-tint-lime px-[18px] py-3.5 text-body-s text-deep-charcoal">
            <Icon name="info" size={16} className="mt-1 shrink-0 text-deep-charcoal" />
            <span>
              {askBefore}
              <Link href={routes.contact} className="underline-offset-2 hover:underline">
                {tx(locale, copy, "ask_contact")}
              </Link>
              {askMiddle}
              <a href={`mailto:${copy.email}`} className="underline-offset-2 hover:underline">
                {copy.email}
              </a>
              {askAfter}
            </span>
          </p>
        </article>
      </Container>
    </>
  );
}
