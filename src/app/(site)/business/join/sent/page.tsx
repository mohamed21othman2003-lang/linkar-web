import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getJoinSent } from "@/lib/server/business";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: getBusinessDict(locale).meta.sent, robots: { index: false } };
}

// W2-92 · طلب الانضمام · تم الإرسال (759:13693)
export default async function JoinSentPage() {
  const locale = await getLocale();
  const d = await getJoinSent();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <PageHeader
        crumbs={[{ label: t.home, href: routes.home }, { label: b.business, href: routes.forProviders }, { label: tx(locale, d.head, "crumb") }]}
        title={tx(locale, d.head, "title")}
        description={tx(locale, d.head, "description")}
      />
      <Container className="pt-10 pb-24">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-[18px] rounded-2xl border border-border-default bg-white p-5 text-center md:p-10">
          <span className="flex rounded-full bg-neon-green p-4 text-deep-charcoal">
            <Icon name="check" size={32} />
          </span>
          <h2 className="text-h4 text-deep-charcoal md:text-h3">
            {tx(locale, d, "title")} <span dir="ltr">{d.request_no}</span>
          </h2>
          <p className="text-body-m text-text-secondary">{tx(locale, d, "body")}</p>
          <ol className="flex w-full flex-col gap-3 rounded-lg bg-tile p-5">
            {d.timeline.map((s) => (
              <li key={s.label_ar} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className={`flex items-center gap-2 text-label-m ${s.done ? "text-deep-charcoal" : "text-text-secondary"}`}>
                  <Icon name={s.done ? "check" : "clock"} size={16} className={s.done ? "text-nature-green" : "text-state-gray"} />
                  {tx(locale, s, "label")}
                </span>
                <span className={`text-caption ${s.done ? "text-green-active" : "text-text-secondary"}`}>{tx(locale, s, "when")}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href={routes.forProviders} className={actionClass("outline")}>
              {tx(locale, d, "back")}
            </Link>
            <Link href={routes.home} className={actionClass("primary")}>
              {tx(locale, d, "home")}
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
