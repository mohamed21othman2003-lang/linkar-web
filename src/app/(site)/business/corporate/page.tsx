import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getBusinessDict } from "@/i18n/dict/business";
import { getCorporatePage } from "@/lib/server/business";
import { site } from "@/lib/data/site";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { CorporateForm } from "@/components/business/forms/CorporateForm";
import { BandHead, GlyphTile, GridPattern, pillClass } from "@/components/business/Bands";
import { FaqCards } from "@/components/business/FaqCards";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getCorporatePage();
  return { title: getBusinessDict(locale).meta.corporate, description: tx(locale, p.head, "description") };
}

const FORM_ID = "offer-form";

// W2-93 · برامج الشركات (85:46285) — مقدمة · البرامج · الخطوات · المزايا · لمن · اطلب عرضاً · أسئلة
// «اطلب عرضاً لشركتك» SCROLL_TO النموذج، «تواصل مع فريق الأعمال» → W2-96، الإرسال → P-10f (توست)
export default async function CorporatePage() {
  const locale = await getLocale();
  const p = await getCorporatePage();
  const t = getCommon(locale);
  const { intro, programs, how, why, audience, offer, faq } = p;

  return (
    <>
      <PageHeader
        tone="dark"
        crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p.head, "crumb") }]}
        title={tx(locale, p.head, "title")}
        description={tx(locale, p.head, "description")}
      />

      {/* Band · مقدمة (85:46297) */}
      <section className="relative overflow-hidden bg-white">
        <GridPattern />
        <Container className="relative flex flex-col gap-10 py-12 md:py-16 lg:pt-24 lg:pb-[104px] xl:flex-row xl:items-center xl:gap-16">
          <div className="flex flex-col gap-[18px] xl:min-w-0 xl:flex-1">
            <p className="text-overline text-green-dark">{tx(locale, intro, "overline")}</p>
            <h2 className="text-[30px]/[46px] font-bold text-deep-charcoal md:text-[40px]/[60px]">{tx(locale, intro, "title")}</h2>
            <p className="text-body-m text-state-gray md:text-[18px]/[32px]">{tx(locale, intro, "body")}</p>
            <div className="flex flex-wrap gap-3">
              <a href={`#${FORM_ID}`} className={pillClass.primary}>
                {tx(locale, intro, "cta_offer")}
                <Icon name="chevron-left" size={16} flip />
              </a>
              <Link href={routes.contact} className={pillClass.outline}>
                {tx(locale, intro, "cta_contact")}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[616px] md:h-[470px] xl:mx-0 xl:w-[616px] xl:shrink-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] md:absolute md:start-0 md:top-0 md:aspect-auto md:h-[420px] md:w-[560px]">
              <Image src={intro.photo} alt="" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" priority />
            </div>
            <span className="absolute start-4 top-4 flex items-center gap-2.5 rounded-full bg-neon-green py-3 ps-[18px] pe-3.5 text-[15px]/[24px] font-medium whitespace-nowrap text-deep-charcoal shadow-[0_12px_16px_rgba(13,26,33,0.16)] md:start-[26px] md:top-[30px]">
              <span className="flex size-7 items-center justify-center rounded-full bg-deep-charcoal text-neon-green">
                <Icon name="qr" size={16} />
              </span>
              {tx(locale, intro, "chip")}
            </span>
            <div className="relative mt-4 flex w-full flex-col gap-3 rounded-xl bg-white p-5 shadow-[0_12px_16px_rgba(13,26,33,0.18)] md:absolute md:end-0 md:top-[196px] md:mt-0 md:w-[330px]">
              <div className="flex items-center justify-between">
                <p className="text-[16px]/[24px] font-bold text-deep-charcoal">{tx(locale, intro.card, "title")}</p>
                <span className="rounded-full bg-cash-tint px-2.5 py-1 text-[12px]/[18px] font-medium text-green-active">{tx(locale, intro.card, "pill")}</span>
              </div>
              {intro.card.rows.map((r) => (
                <div key={r.service} className="flex items-center gap-2.5 rounded-md bg-tile px-3 py-2.5">
                  <ServiceGlyph name={r.service} size={28} className="shrink-0 text-deep-charcoal" />
                  <span className="min-w-0 flex-1 text-label-m text-deep-charcoal">{tx(locale, r, "text")}</span>
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-neon-green text-deep-charcoal">
                    <Icon name="check" size={12} />
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                <span className="text-[13px]/[20px] font-light text-state-gray">{tx(locale, intro.card, "note")}</span>
                <span className="text-[16px]/[24px] font-bold text-deep-charcoal">{tx(locale, intro.card, "total")}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Band · البرامج (85:46341) */}
      <section className="bg-deep-charcoal">
        <Container className="flex flex-col gap-8 py-14 md:gap-12 lg:py-[104px]">
          <BandHead tone="dark" overline={tx(locale, programs, "overline")} title={tx(locale, programs, "title")} body={tx(locale, programs, "body")} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programs.items.map((c) => (
              <article key={c.title_ar} className="flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/5">
                <div className="relative h-[180px] shrink-0">
                  <Image src={c.photo} alt="" fill sizes="(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(20_41_54/0),rgb(20_41_54/0.9))]" />
                </div>
                <div className="flex flex-col gap-3 px-[26px] pt-6 pb-7">
                  <GlyphTile icon={c.icon ?? "check"} size={48} glyph={24} radius={14} />
                  <h3 className="text-h4 leading-[32px] text-white">{tx(locale, c, "title")}</h3>
                  <p className="text-[15px]/[26px] font-light text-v3-card-stroke">{tx(locale, c, "body")}</p>
                  <ul className="flex flex-col gap-2 pt-1.5">
                    {c.points.map((pt) => (
                      <li key={pt.text_ar} className="flex items-center gap-2 text-label-m text-white">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neon-green/18 text-neon-green">
                          <Icon name="check" size={12} />
                        </span>
                        {tx(locale, pt, "text")}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Band · كيف يعمل (85:46409) */}
      <section className="relative overflow-hidden bg-white">
        <GridPattern />
        <Container className="relative flex flex-col gap-10 py-14 md:gap-14 lg:py-[104px]">
          <BandHead overline={tx(locale, how, "overline")} title={tx(locale, how, "title")} body={tx(locale, how, "body")} />
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {how.steps.map((s, i) => (
              <li key={s.title_ar} className="flex flex-col gap-3.5">
                <div className="flex h-16 items-center justify-between">
                  <GlyphTile icon={s.icon ?? "check"} tone={i === 0 ? "neon" : "dark"} size={64} glyph={28} radius={20} />
                  <span className="text-[44px]/[56px] font-bold text-hairline">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-[20px]/[30px] font-bold text-deep-charcoal">{tx(locale, s, "title")}</h3>
                <p className="text-[15px]/[26px] font-light text-state-gray">{tx(locale, s, "body")}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Band · لماذا لينكار للأعمال (85:46446) — صورة + تدرّج كحلي أغمق ناحية النص */}
      <section className="relative overflow-hidden bg-deep-charcoal">
        <Image src={why.photo} alt="" fill sizes="100vw" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgb(13_27_35/0.6),rgb(13_27_35/0.88)_50%,rgb(13_27_35/0.97))]" />
        <Container className="relative flex flex-col gap-8 py-14 md:gap-12 lg:py-[104px]">
          <BandHead tone="dark" overline={tx(locale, why, "overline")} title={tx(locale, why, "title")} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {why.items.map((c) => (
              <article key={c.title_ar} className="flex items-start gap-4 rounded-xl border border-white/16 bg-white/7 p-[22px] backdrop-blur-[10px]">
                <GlyphTile icon={c.icon ?? "check"} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="text-h5 text-white">{tx(locale, c, "title")}</h3>
                  <p className="text-body-s text-dot">{tx(locale, c, "body")}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Band · لمن البرنامج (85:46489) */}
      <section className="bg-white">
        <Container className="flex flex-col gap-8 py-14 md:gap-10 lg:py-[104px]">
          <BandHead overline={tx(locale, audience, "overline")} title={tx(locale, audience, "title")} />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {audience.items.map((c) => (
              <li key={c.title_ar} className="flex flex-col gap-2.5 rounded-xl bg-tile px-5 py-[22px] xl:min-h-[240px]">
                <GlyphTile icon={c.icon ?? "check"} tone="dark" />
                <h3 className="text-[17px]/[26px] font-bold text-deep-charcoal">{tx(locale, c, "title")}</h3>
                <p className="text-body-s text-state-gray">{tx(locale, c, "body")}</p>
                {"link" in c && c.link && (
                  <Link href={routes.forDealers} className="flex items-center gap-1.5 self-start text-label-m font-bold text-green-active hover:underline">
                    {tx(locale, c.link, "text")}
                    <Icon name="chevron-left" size={14} flip className="text-nature-green" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Band · اطلب عرضاً (85:46522) — «بعد الإرسال» يمين والنموذج شمال */}
      <section className="bg-deep-charcoal">
        <Container className="flex flex-col gap-10 py-14 lg:py-[104px] xl:flex-row xl:items-start xl:gap-12">
          <div className="flex flex-col gap-5 xl:w-[400px] xl:shrink-0">
            <p className="text-overline text-neon-green">{tx(locale, offer, "overline")}</p>
            <h2 className="text-[26px]/[40px] font-bold text-white md:text-h2">{tx(locale, offer, "title")}</h2>
            <ol className="flex flex-col gap-3.5">
              {offer.steps.map((s, i) => (
                <li key={s.title_ar} className="flex items-start gap-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neon-green text-[14px]/[20px] font-bold text-deep-charcoal">{i + 1}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-[17px]/[26px] font-bold text-white">{tx(locale, s, "title")}</p>
                    <p className="text-[14px]/[22px] font-light text-v3-card-stroke">{tx(locale, s, "body")}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a
              href={`mailto:${site.email}`}
              className="flex flex-wrap items-center gap-2 self-start rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px]/[22px] hover:bg-white/10"
            >
              <Icon name="mail" size={18} className="text-neon-green" />
              <span className="font-light text-v3-card-stroke">{tx(locale, offer, "mail_label")}</span>
              <span dir="ltr" className="font-medium text-white">
                {site.email}
              </span>
            </a>
          </div>
          <CorporateForm locale={locale} d={p} id={FORM_ID} className="scroll-mt-28 xl:min-w-0 xl:flex-1" />
        </Container>
      </section>

      {/* Band · أسئلة (85:46597) */}
      <section className="bg-white">
        <Container className="flex flex-col gap-8 pt-14 pb-16 lg:pt-24 lg:pb-28">
          <BandHead overline={tx(locale, faq, "overline")} title={tx(locale, faq, "title")} />
          <FaqCards idPrefix="corp-faq" items={faq.items.map((f) => ({ q: tx(locale, f, "q"), a: tx(locale, f, "a") }))} />
        </Container>
      </section>
    </>
  );
}
