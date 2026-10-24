import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getAboutDict } from "@/i18n/dict/about";
import { getContactPage } from "@/lib/server/about";
import { getHelpPopupsCopy } from "@/lib/server/help";
import { getSite } from "@/lib/server/content";
import { getSession } from "@/lib/server/session";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { Fabs } from "@/components/layout/Fabs";
import { ContactForm } from "@/components/about/ContactForm";
import { HelpPopupButton } from "@/components/help/HelpPopupButton";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getContactPage();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

const social = "flex size-10 items-center justify-center rounded-[20px] border border-border-default bg-white transition-colors hover:bg-tile";

// W2-96 · تواصل معنا (760:13644) — النموذج من بداية السطر وقنوات التواصل في آخره، والأزرار العائمة ظاهرة
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "figma";
  const [locale, p, site, user, popups] = await Promise.all([getLocale(), getContactPage(), getSite(), getSession(), getHelpPopupsCopy()]);
  const t = getCommon(locale);
  const d = getAboutDict(locale);
  const links = new Map(site.footer.social.map((s) => [s.platform, s]));

  return (
    <>
      <PageHeader crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "title") }]} title={tx(locale, p, "title")} description={tx(locale, p, "description")} />
      <Container className="flex flex-col gap-8 pt-12 pb-24 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ContactForm
            defaultName={user ? tx(locale, user, "name") : ""}
            demo={demo ? { name: tx(locale, p, "demo_name"), booking: p.booking_placeholder } : undefined}
            copy={{
              title: tx(locale, p, "form_title"),
              name: tx(locale, p, "name_label"),
              phone: tx(locale, p, "phone_label"),
              phonePlaceholder: p.phone_placeholder,
              topic: tx(locale, p, "topic_label"),
              topics: p.topics.map((o) => ({ value: o.value, label: tx(locale, o, "label") })),
              booking: tx(locale, p, "booking_label"),
              bookingPlaceholder: p.booking_placeholder,
              message: tx(locale, p, "message_label"),
              messagePlaceholder: tx(locale, p, "message_placeholder"),
              submit: tx(locale, p, "submit"),
              sent: tx(locale, p, "sent_toast"),
              required: d.required,
              phoneInvalid: d.phoneInvalid,
            }}
          />
        </div>

        <ul className="flex flex-col gap-3 lg:w-[420px] lg:shrink-0">
          {p.channels.map((c) => (
            <li key={c.key} className="flex items-start gap-1.5 rounded-xl border border-border-default bg-white p-5">
              <span className="flex shrink-0 rounded-md bg-neon-green p-2.5">
                <Icon name={c.icon} size={20} className="text-deep-charcoal" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <h2 className="text-label-l text-deep-charcoal">{tx(locale, c, "title")}</h2>
                {c.key === "email" ? (
                  <a href={`mailto:${site.email}`} className="text-body-s text-text-secondary hover:text-deep-charcoal">
                    {site.email}
                  </a>
                ) : (
                  <p className="text-body-s text-text-secondary">{tx(locale, c, "body")}</p>
                )}
                {c.cta && (
                  <Link href={c.cta.href} className="flex items-center gap-1.5 py-0.5 text-label-m text-green-active hover:underline">
                    {tx(locale, c.cta, "label")}
                    <Icon name="chevron-left" size={16} flip className="text-nature-green" />
                  </Link>
                )}
                {c.key === "follow" && (
                  <>
                    <p className="text-label-m text-deep-charcoal" dir="ltr">
                      {p.handle}
                    </p>
                    <div className="flex flex-wrap gap-2" aria-label={d.socialLabel}>
                      {p.social.map((s) => {
                        const icon = <Image src={`/figma/about/social-light-${s}.svg`} alt="" width={18} height={18} unoptimized />;
                        if (s === "whatsapp")
                          return (
                            <HelpPopupButton key={s} popup="whatsapp" copy={popups} aria-label={d.whatsapp} title={d.whatsapp} className={social}>
                              {icon}
                            </HelpPopupButton>
                          );
                        const l = links.get(s)!;
                        return (
                          <a key={s} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className={social}>
                            {icon}
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
      <Fabs />
    </>
  );
}
