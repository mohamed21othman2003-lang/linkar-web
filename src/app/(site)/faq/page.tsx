import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getHelpDict } from "@/i18n/dict/help";
import { getFaq, isFaqTab } from "@/lib/server/help";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { ContactBand } from "@/components/help/ContactBand";

type Props = { searchParams: Promise<{ tab?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { page } = await getFaq();
  return { title: tx(locale, page, "title"), description: tx(locale, page, "description") };
}

// W2-98 · الأسئلة الشائعة (761:14645) + W2-98-t2…t5 — التبويب في ?tab= (booking · voucher · points · account · warranty)
export default async function FaqPage({ searchParams }: Props) {
  const [{ tab }, locale, { page, tabs, band }] = await Promise.all([searchParams, getLocale(), getFaq()]);
  const t = getCommon(locale);
  const d = getHelpDict(locale);
  const active = tabs.find((x) => x.key === (isFaqTab(tab) ? tab : "booking"))!;

  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, page, "title") }]} title={tx(locale, page, "title")} description={tx(locale, page, "description")} />
      <Container className="flex flex-col gap-10 pt-10 pb-24">
        <nav aria-label={d.faqTopics} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex w-max gap-1 rounded-full bg-surface-soft p-1">
            {tabs.map((x) => {
              const on = x.key === active.key;
              return (
                <li key={x.key}>
                  <Link
                    href={routes.faq(x.key)}
                    scroll={false}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-[38px] items-center rounded-full px-4 text-label-m whitespace-nowrap transition-colors ${
                      on ? "bg-deep-charcoal text-neon-green" : "text-deep-charcoal hover:bg-white/70"
                    }`}
                  >
                    {tx(locale, x, "label")}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <FaqAccordion key={active.key} items={active.items.map((it) => ({ q: tx(locale, it, "q"), a: tx(locale, it, "a") }))} />
        <ContactBand
          title={tx(locale, band, "title")}
          body={tx(locale, band, "body")}
          primary={{ label: tx(locale, band, "complaint"), href: band.complaint_href }}
          secondary={{ label: tx(locale, band, "contact"), href: band.contact_href }}
        />
      </Container>
    </>
  );
}
