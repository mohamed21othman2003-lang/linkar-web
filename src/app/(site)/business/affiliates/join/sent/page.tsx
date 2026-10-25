import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getAffiliateSent } from "@/lib/server/business";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: getBusinessDict(locale).meta.sent, robots: { index: false } };
}

// W2-94c · طلب الانضمام · مسوّق · تم الإرسال (1320:347568)
export default async function AffiliateSentPage() {
  const locale = await getLocale();
  const d = await getAffiliateSent();
  const t = getCommon(locale);
  const b = getBusinessDict(locale);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t.home, href: routes.home },
          { label: b.business, href: routes.forProviders },
          { label: b.affiliates, href: routes.affiliates },
          { label: tx(locale, d.head, "crumb") },
        ]}
        title={tx(locale, d.head, "title")}
        description={tx(locale, d.head, "description")}
      />
      <Container className="pt-10 pb-24">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-[18px] rounded-2xl border border-border-default bg-white p-5 md:p-10">
          <span className="flex size-16 items-center justify-center rounded-full bg-neon-green text-deep-charcoal">
            <Icon name="check" size={32} />
          </span>
          <h2 className="text-h4 text-deep-charcoal md:text-h3">{tx(locale, d, "title")}</h2>
          <p className="text-body-m text-text-secondary">{tx(locale, d, "body")}</p>
          <ol className="flex flex-col gap-3 rounded-lg bg-tile p-5">
            {d.timeline.map((s, i) => (
              <li key={s.text_ar} className="flex items-center gap-3">
                {i === 0 ? (
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-neon-green text-deep-charcoal">
                    <Icon name="check" size={14} />
                  </span>
                ) : (
                  <span className="size-[22px] shrink-0 rounded-full border border-border-default bg-white" />
                )}
                <span className={i === 0 ? "text-label-m text-deep-charcoal" : "text-body-s text-text-secondary"}>{tx(locale, s, "text")}</span>
              </li>
            ))}
          </ol>
          {/* الموبايل: الزرين بعرض الكارت */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Link href={routes.home} className={actionClass("primary")}>
              {tx(locale, d, "home")}
              <Icon name="home" size={16} />
            </Link>
            <Link href={routes.affiliates} className={actionClass("outline")}>
              {tx(locale, d, "back")}
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
