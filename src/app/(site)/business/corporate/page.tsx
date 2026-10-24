import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getCorporatePage } from "@/lib/server/business";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { CorporateForm } from "@/components/business/forms/CorporateForm";
import type { Card } from "@/lib/data/business/types";
import type { Locale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getCorporatePage();
  return { title: getBusinessDict(locale).meta.corporate, description: tx(locale, p.head, "description") };
}

function Benefit({ locale, c, children }: { locale: Locale; c: Card; children?: React.ReactNode }) {
  return (
    <article className="flex items-start gap-1.5 rounded-xl border border-border-default bg-white p-5">
      <span className="flex shrink-0 rounded-md bg-neon-green p-2.5 text-deep-charcoal">
        <Icon name={c.icon ?? "check"} size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 ps-1.5">
        <h3 className="text-label-l text-deep-charcoal">{tx(locale, c, "title")}</h3>
        <p className="text-body-s text-text-secondary">{tx(locale, c, "body")}</p>
        {children}
      </div>
    </article>
  );
}

// W2-93 · برامج الشركات (1100:29770) — الإرسال بيظهر P-10f «وصلتنا رسالتك، وسنرد عليك قريباً»
export default async function CorporatePage() {
  const locale = await getLocale();
  const p = await getCorporatePage();
  const t = getCommon(locale);

  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p.head, "crumb") }]} title={tx(locale, p.head, "title")} description={tx(locale, p.head, "description")} />
      <Container className="flex flex-col gap-8 pt-12 pb-24 lg:flex-row lg:items-start">
        <CorporateForm locale={locale} d={p} />
        <div className="flex w-full flex-col gap-3 lg:w-[420px] lg:shrink-0">
          {p.benefits.map((c) => (
            <Benefit key={c.title_ar} locale={locale} c={c} />
          ))}
          <Benefit locale={locale} c={p.partners}>
            <Link href={routes.forProviders} className="flex items-center gap-1.5 self-start rounded-md py-0.5 text-label-m text-green-active hover:underline">
              {tx(locale, p, "partners_link")}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </Benefit>
        </div>
      </Container>
    </>
  );
}
