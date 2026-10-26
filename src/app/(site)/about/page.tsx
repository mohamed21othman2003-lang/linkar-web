import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx, type Locale } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getAboutPage } from "@/lib/server/about";
import { getProvidersBySlugs, getServices } from "@/lib/server/content";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/icons/Icon";
import { HomeServiceCard } from "@/components/home/HomeServiceCard";
import { BandHead, GlyphTile, GridPattern } from "@/components/business/Bands";
import type { AboutCard } from "@/lib/data/about/about";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getAboutPage();
  return { title: tx(locale, p, "title"), description: tx(locale, p, "description") };
}

const chipShadow = "shadow-[0_12px_16px_rgba(13,26,33,0.16)]";

// رابط نصّي بسهم (15 Medium) — «تصفّح كل الخدمات» · «عرض كل مقدّمي الخدمة» · «اقرأ سياسة الضمان»
function TextLink({ href, children, tone = "green", bold = false }: { href: string; children: React.ReactNode; tone?: "green" | "neon" | "active"; bold?: boolean }) {
  const color = tone === "neon" ? "text-neon-green" : tone === "active" ? "text-green-active" : "text-green-dark";
  return (
    <Link href={href} className={`flex shrink-0 items-center gap-1.5 self-start text-[15px]/[24px] hover:underline ${bold ? "font-bold" : "font-medium"} ${color}`}>
      {children}
      <Icon name="chevron-left" size={16} flip className={tone === "neon" ? "text-neon-green" : "text-nature-green"} />
    </Link>
  );
}

function MissionCard({ locale, c, dark }: { locale: Locale; c: AboutCard; dark?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2.5 rounded-xl p-[22px] min-[1440px]:w-[290px] min-[1440px]:flex-none ${dark ? "bg-deep-charcoal" : "border border-hairline bg-white"}`}>
      <GlyphTile icon={c.icon} tone={dark ? "neon" : "dark"} />
      <h3 className={`text-h5 ${dark ? "text-white" : "text-deep-charcoal"}`}>{tx(locale, c, "title")}</h3>
      <p className={`text-body-s ${dark ? "text-v3-card-stroke" : "text-state-gray"}`}>{tx(locale, c, "body")}</p>
    </div>
  );
}

const tierTone = {
  platinum: { bg: "bg-[linear-gradient(to_right,#b8c3cb,#f4f7f9)]", ink: "text-deep-charcoal" },
  gold: { bg: "bg-[linear-gradient(to_right,#d9a520,#fbe7a8)]", ink: "text-[#3d2c00]" },
  silver: { bg: "bg-[linear-gradient(to_right,#a9b2b8,#f1f3f4)]", ink: "text-deep-charcoal" },
} as const;

// W2-95 · من نحن (85:46926) — قصتنا · رحلتك مع لينكار · كيف نختار مقدّمي الخدمة · ضمان مزدوج · ثقتك أولاً · شركاؤنا · لينكار لمن
// #vision (طموحنا ورسالتنا) و#how-it-works (رحلتك مع لينكار) مربوطين من قائمة «من نحن» والفوتر
export default async function AboutPage() {
  const locale = await getLocale();
  const t = getCommon(locale);
  const [p, services] = await Promise.all([getAboutPage(), getServices()]);
  const serviceItems = await Promise.all(services.map(async (service) => ({ service, providers: await getProvidersBySlugs(service.featured_providers) })));
  const { story, journey, selection, warranty, trust, partners, audiences } = p;
  const audienceHref = { services: routes.services, providers: routes.forProviders, corporate: routes.corporate };

  return (
    <>
      <PageHeader tone="dark" crumbs={[{ label: t.home, href: routes.home }, { label: tx(locale, p, "title") }]} title={tx(locale, p, "title")} description={tx(locale, p, "description")} />

      {/* Band · قصتنا (85:46935) + ماذا نقدّم */}
      <section className="relative overflow-hidden bg-white">
        <GridPattern />
        <Container className="relative flex flex-col gap-14 py-12 md:py-16 lg:gap-[72px] lg:py-[104px]">
          <div className="flex flex-col gap-10 xl:h-[520px] xl:flex-row xl:items-center xl:gap-16">
            <div className="flex flex-col gap-[18px] xl:min-w-0 xl:flex-1">
              <p className="text-overline text-green-dark">{tx(locale, story, "overline")}</p>
              <h2 className="text-[30px]/[46px] font-bold text-deep-charcoal md:text-[40px]/[60px]">{tx(locale, story, "title")}</h2>
              <p className="text-body-m text-state-gray md:text-[18px]/[32px]">{tx(locale, story, "body")}</p>
              <div id="vision" className="flex scroll-mt-28 flex-col gap-5 sm:flex-row sm:items-start">
                <MissionCard locale={locale} c={story.mission} dark />
                <MissionCard locale={locale} c={story.vision} />
              </div>
            </div>
            {/* Collage 616×520 — على الشاشات الأصغر بيتصغّر كله بـzoom */}
            <div className="mx-auto shrink-0 [zoom:0.53] min-[390px]:[zoom:0.58] sm:[zoom:0.98] md:[zoom:1] xl:mx-0">
              <div className="relative h-[520px] w-[616px]">
                <div className="absolute start-0 top-2.5 h-[500px] w-[360px] overflow-hidden rounded-[28px]">
                  <Image src={story.photo_main} alt="" fill sizes="360px" className="object-cover" />
                </div>
                <div className="absolute -end-2 top-[242px] h-[256px] w-[336px] overflow-hidden rounded-[32px] border-8 border-white">
                  <Image src={story.photo_small} alt="" fill sizes="320px" className="object-cover" />
                </div>
                <span className={`absolute end-[380px] top-9 flex items-center gap-2.5 rounded-full bg-white py-3 ps-[18px] pe-3.5 text-[15px]/[24px] font-medium whitespace-nowrap text-deep-charcoal ${chipShadow}`}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-cash-tint text-nature-green">
                    <Icon name="qr" size={16} />
                  </span>
                  {tx(locale, story.chips, "qr")}
                </span>
                <span className={`absolute end-10 top-[110px] flex items-center gap-2.5 rounded-full bg-white py-3 ps-[18px] pe-3.5 text-[15px]/[24px] font-medium whitespace-nowrap text-deep-charcoal ${chipShadow}`}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-cash-tint text-nature-green">
                    <Icon name="check" size={16} />
                  </span>
                  {tx(locale, story.chips, "confirmed")}
                </span>
                <span className={`absolute end-[300px] top-[452px] flex items-center gap-2.5 rounded-full bg-neon-green py-3 ps-[18px] pe-3.5 text-[15px]/[24px] font-medium whitespace-nowrap text-deep-charcoal ${chipShadow}`}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-deep-charcoal text-neon-green">
                    <Icon name="gift" size={16} />
                  </span>
                  {tx(locale, story.chips, "warranty")}
                </span>
              </div>
            </div>
          </div>

          {/* ماذا نقدّم — 6 كروت خدمة (206 مربع) في صف واحد بيتقص من الآخر زي الفيجما */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-1.5">
                <p className="text-overline text-green-dark">{tx(locale, p.services, "overline")}</p>
                <h2 className="text-[24px]/[36px] font-bold text-deep-charcoal md:text-[28px]/[42px]">{tx(locale, p.services, "title")}</h2>
              </div>
              <TextLink href={routes.services}>{tx(locale, p.services, "link")}</TextLink>
            </div>
            <div className="-mx-4 flex gap-[10.4px] overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 min-[1440px]:overflow-hidden [&::-webkit-scrollbar]:hidden">
              {serviceItems.map(({ service, providers }) => (
                <div key={service.slug} className="size-[206px] shrink-0 p-[4.33px]">
                  <HomeServiceCard locale={locale} service={service} providers={providers} />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Band · رحلتك مع لينكار (85:46986) */}
      <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden bg-deep-charcoal">
        <Image src={journey.photo} alt="" fill sizes="100vw" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgb(21_41_53/0.72),rgb(21_41_53/0.96))]" />
        <Container className="relative flex flex-col gap-10 py-14 lg:gap-14 lg:py-[104px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <BandHead tone="dark" overline={tx(locale, journey, "overline")} title={tx(locale, journey, "title")} body={tx(locale, journey, "body")} className="md:max-w-[760px]" />
            <Link href={routes.services} className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-neon-green ps-6 pe-5 text-label-l font-bold text-deep-charcoal transition-colors hover:bg-bg-brand-hover md:self-auto">
              {tx(locale, journey, "cta")}
              <Icon name="chevron-left" size={16} flip />
            </Link>
          </div>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {journey.steps.map((s, i) => (
              <li key={s.title_ar} className="flex flex-col gap-3 rounded-xl border border-white/12 bg-white/6 px-[22px] pt-6 pb-[26px]">
                <div className="flex h-12 items-center justify-between">
                  <GlyphTile icon={s.icon} size={48} glyph={24} radius={14} />
                  <span className="text-[28px]/[36px] font-bold text-neon-green/35">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-h5 text-white">{tx(locale, s, "title")}</h3>
                <p className="text-body-s text-v3-card-stroke">{tx(locale, s, "body")}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Band · كيف نختار مقدّمي الخدمة (85:47038) */}
      <section className="relative overflow-hidden bg-white">
        <GridPattern />
        <Container className="relative flex flex-col gap-10 py-14 lg:gap-14 lg:py-[104px]">
          <BandHead overline={tx(locale, selection, "overline")} title={tx(locale, selection, "title")} body={tx(locale, selection, "body")} />
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <ol className="flex flex-col lg:min-w-0 lg:flex-[0_1_640px]">
              {selection.stages.map((s, i) => {
                const last = i === selection.stages.length - 1;
                return (
                  <li key={s.title_ar} className="flex gap-4 md:gap-5">
                    <div className="flex w-[52px] shrink-0 flex-col items-center">
                      <span
                        className={`flex size-[52px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-deep-charcoal ${i === 0 ? "bg-deep-charcoal text-neon-green" : "bg-white text-deep-charcoal"}`}
                      >
                        <Icon name={s.icon} size={22} />
                      </span>
                      {!last && <span aria-hidden className="w-0.5 flex-1 bg-[#cfd6d2]" />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-2.5 pb-7">
                      <h3 className="text-[18px]/[28px] font-bold text-deep-charcoal md:text-[20px]/[30px]">{tx(locale, s, "title")}</h3>
                      <p className="text-[15px]/[26px] font-light text-state-gray">{tx(locale, s, "body")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-[0_1_600px]">
              <h3 className="text-h5 text-deep-charcoal">{tx(locale, selection, "tiers_title")}</h3>
              {selection.tiers.map((tier) => (
                <div key={tier.key} className={`flex items-center justify-between gap-3 rounded-[18px] px-[22px] py-[18px] shadow-[0_12px_16px_rgba(13,26,33,0.08)] ${tierTone[tier.key].bg} ${tierTone[tier.key].ink}`}>
                  <div className="flex items-center gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/70 text-[18px]/[26px] font-bold">{tier.letter}</span>
                    <div className="flex flex-col">
                      <p className="text-[20px]/[30px] font-bold">{tx(locale, tier, "name")}</p>
                      <p className="text-[13px]/[20px] font-light">{tx(locale, selection, "tier_caption")}</p>
                    </div>
                  </div>
                  <span dir="ltr" className="text-[22px]/[34px] font-bold whitespace-nowrap md:text-[26px]/[34px]">
                    {tier.range}
                  </span>
                </div>
              ))}
              <div className="flex flex-col gap-3 rounded-xl bg-deep-charcoal px-6 py-[22px]">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#e5484d] text-white">
                    <Icon name="alert" size={18} />
                  </span>
                  <h3 className="text-h5 text-white">{tx(locale, selection.zero, "title")}</h3>
                </div>
                <p className="text-[15px]/[26px] font-light text-v3-card-stroke">{tx(locale, selection.zero, "body")}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Band · ضمان مزدوج (85:47111) */}
      <section className="relative overflow-hidden bg-deep-charcoal">
        <Image src={warranty.photo} alt="" fill sizes="100vw" className="object-cover" />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgb(13_27_35/0.35),rgb(13_27_35/0.7)_45%,rgb(13_27_35/0.96))]" />
        <Container className="relative flex flex-col gap-10 py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-[110px]">
          <div className="flex flex-col gap-3 lg:max-w-[520px] lg:min-w-0 lg:flex-1">
            <p className="text-overline text-neon-green">{tx(locale, warranty, "overline")}</p>
            <h2 className="text-[30px]/[46px] font-bold text-white md:text-[40px]/[60px]">{tx(locale, warranty, "title")}</h2>
            <p className="text-body-m text-dot md:text-body-l">{tx(locale, warranty, "body")}</p>
            <TextLink href={routes.warranty} tone="neon">
              {tx(locale, warranty, "link")}
            </TextLink>
          </div>
          <div className="flex flex-col gap-4 lg:max-w-[520px] lg:min-w-0 lg:flex-1">
            {warranty.cards.map((c) => (
              <article key={c.title_ar} className="flex items-start gap-4 rounded-xl border border-white/18 bg-white/8 p-[22px] backdrop-blur-[12px]">
                <GlyphTile icon={c.icon} size={48} glyph={24} radius={14} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h3 className="text-[20px]/[30px] font-bold text-white">{tx(locale, c, "title")}</h3>
                  <p className="text-[15px]/[26px] font-light text-dot">{tx(locale, c, "body")}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Band · ثقتك أولاً (85:47139) — Bento */}
      <section className="bg-white">
        <Container className="flex flex-col gap-8 py-14 md:gap-12 lg:py-[104px]">
          <BandHead overline={tx(locale, trust, "overline")} title={tx(locale, trust, "title")} />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:min-w-0 lg:flex-[0_1_640px] min-[1440px]:grid-rows-[188px_228px]">
              <TrustTile locale={locale} c={trust.price} />
              <TrustTile locale={locale} c={trust.reviews} dark />
              <TrustTile locale={locale} c={trust.payment}>
                <ul className="flex flex-wrap gap-1.5">
                  {trust.methods.map((m) => (
                    <li key={m} className="rounded-[6px] border border-[#dfe3e1] bg-white px-2 py-[3px] text-[11px]/[16px] font-medium text-deep-charcoal">
                      {m}
                    </li>
                  ))}
                </ul>
              </TrustTile>
              <TrustTile locale={locale} c={trust.booking} />
            </div>
            <div className="relative flex min-h-[360px] flex-col justify-end gap-2 overflow-hidden rounded-2xl p-6 md:p-7 lg:h-[436px] lg:min-w-0 lg:flex-[0_1_620px]">
              <Image src={trust.photo.src} alt="" fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(13_27_35/0),rgb(13_27_35/0.92))]" />
              <span className="relative self-start rounded-full bg-neon-green px-3 py-1.5 text-[13px]/[20px] font-bold text-deep-charcoal">{tx(locale, trust.photo, "tag")}</span>
              <h3 className="relative text-[22px]/[34px] font-bold text-white md:text-[24px]/[36px]">{tx(locale, trust.photo, "title")}</h3>
              <p className="relative max-w-[540px] text-[15px]/[26px] font-light text-[#d5dbd8]">{tx(locale, trust.photo, "body")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Band · علامات تعرفها (85:47184) */}
      <section className="bg-deep-charcoal">
        <Container className="flex flex-col gap-8 py-14 lg:gap-11 lg:py-[104px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <BandHead tone="dark" overline={tx(locale, partners, "overline")} title={tx(locale, partners, "title")} body={tx(locale, partners, "body")} className="md:max-w-[760px]" />
            <TextLink href={routes.providers()} tone="neon">
              {tx(locale, partners, "link")}
            </TextLink>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {partners.rows.flat().map((l) => (
              <li key={l.slug} className="relative h-[128px] overflow-hidden rounded-[18px] bg-white">
                {/* الصندوق 200×128 في الفيجما — الشعار بنفس مكانه بالنسبة للنص */}
                <span className="absolute top-0 left-1/2 h-[128px] w-[200px] -translate-x-1/2">
                  <Image
                    src={`/figma/about/logos/${l.slug}.png`}
                    alt={l.alt}
                    width={Math.round(l.box[2] * 2)}
                    height={Math.round(l.box[3] * 2)}
                    className={`absolute max-w-none ${l.fit === "cover" ? "object-cover" : "object-contain"}`}
                    style={{ left: l.box[0], top: l.box[1], width: l.box[2], height: l.box[3] }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Band · لينكار لمن؟ (85:47222) */}
      <section className="bg-white">
        <Container className="flex flex-col gap-8 pt-14 pb-16 lg:gap-11 lg:pt-[104px] lg:pb-28">
          <BandHead overline={tx(locale, audiences, "overline")} title={tx(locale, audiences, "title")} />
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {audiences.items.map((a) => (
              <li key={a.title_ar} className="flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white">
                <div className="relative h-[220px] shrink-0">
                  <Image src={a.photo} alt="" fill sizes="(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 px-6 pt-6 pb-[26px]">
                  <GlyphTile icon={a.icon} tone="dark" />
                  <h3 className="text-[20px]/[30px] font-bold text-deep-charcoal">{tx(locale, a, "title")}</h3>
                  <p className="text-[15px]/[26px] font-light text-state-gray">{tx(locale, a, "body")}</p>
                  <div className="mt-auto">
                    <TextLink href={audienceHref[a.href_key]} tone="active" bold>
                      {tx(locale, a, "cta")}
                    </TextLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

function TrustTile({ locale, c, dark, children }: { locale: Locale; c: AboutCard; dark?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-2.5 rounded-2xl p-6 ${dark ? "bg-deep-charcoal" : "bg-tile"}`}>
      <GlyphTile icon={c.icon} tone={dark ? "neon" : "dark"} />
      <h3 className={`text-h5 ${dark ? "text-white" : "text-deep-charcoal"}`}>{tx(locale, c, "title")}</h3>
      <p className={`text-body-s ${dark ? "text-v3-card-stroke" : "text-state-gray"}`}>{tx(locale, c, "body")}</p>
      {children}
    </div>
  );
}
