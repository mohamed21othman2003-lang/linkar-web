import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, RText } from "../bits";

type S = (x: { text_ar: string; text_en: string }) => string;
type Card = HomeContent["dealerBand"]["front_card"] | HomeContent["dealerBand"]["back_card"];

// Gift card (Status=Ready / محجوزة) — كحلي r24 p20
function GiftCard({ s, d, card, ready, className, style }: { s: S; d: HomeContent["dealerBand"]; card: Card; ready: boolean; className: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex w-[360px] flex-col gap-3.5 rounded-2xl bg-deep-charcoal p-5 ${className}`} style={style}>
      <div className="flex flex-col items-start gap-2.5">
        <span
          className={`inline-flex h-6 items-center rounded-full px-2.5 text-label-m ${ready ? "bg-neon-green text-solid-black" : "bg-slate-blue text-[#b9c0dc]"}`}
        >
          {s(card.status)}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#23421f] text-label-m text-neon-green">{s(d.dealer_initial)}</span>
          <span className="flex flex-col">
            <span className="text-caption text-[#a9b2ae]">{s(d.gift_from)}</span>
            <span className="text-label-m text-white">{s(d.dealer_name)}</span>
          </span>
        </div>
      </div>
      <p className="min-h-16 text-[22px] leading-[32px] font-bold text-white">{s(card.title)}</p>
      <p className="min-h-11 text-caption text-cool-gray">{s(card.details)}</p>
      <p className="text-caption text-[#a9b2ae]">{s(card.validity)}</p>
      {"cta" in card && (
        <span className="flex h-control-lg items-center justify-center rounded-md bg-neon-green text-label-l font-bold text-deep-charcoal">{s(card.cta)}</span>
      )}
    </div>
  );
}

// V2-01 · Band · Dealer gifts (37:28172 — رئيسية المسجّل) — لوحة متدرّجة ليموني→أخضر وفيها رسم بطاقتين + الخطوات و«اعرض باقاتك»،
// وتحتها بلاطات لوجوهات الوكالات. النصوص «باقات» زي باقي الموقع (85:30520) مش «هدايا».
// تابلت (85:34816): ببطاقة واحدة · موبايل (85:34130): من غير لوحة، البطاقة بين الوصف والخطوات
export function DealerBand({ locale, content }: { locale: Locale; content: HomeContent }) {
  const d = content.dealerBand;
  const s: S = (x) => tx(locale, x, "text");
  return (
    <section className="bg-tile py-9 md:py-16 xl:bg-white xl:py-[104px]">
      <Container className="max-md:px-5">
        <div className="relative flex flex-col gap-[18px] overflow-hidden md:flex-row md:items-center md:gap-6 md:rounded-[28px] md:bg-linear-to-r md:from-neon-green md:to-nature-green md:p-8 xl:gap-12 xl:rounded-[32px] xl:ps-14 xl:pe-12 xl:py-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/figma/home/icons/brand-chevron-outline.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -end-[9px] top-[208px] hidden h-[565px] w-[612px] xl:block"
          />
          <div className="contents md:relative md:flex md:min-w-0 md:flex-1 md:flex-col md:items-start md:gap-3.5 xl:gap-[18px]">
            <div className="flex flex-col items-start gap-[18px] md:gap-3.5 xl:gap-[18px]">
              <span className="inline-flex h-[26px] items-center rounded-full bg-deep-charcoal px-2.5 text-[12px] leading-[18px] font-medium text-neon-green xl:h-6 xl:text-body-s xl:text-white">
                {s(d.badge)}
              </span>
              <h2 className="text-[22px]/[34px] font-bold text-deep-charcoal md:text-[26px]/[38px] xl:text-h2 xl:text-hero-ink">
                {s(d.title_1)}
                <br className="max-xl:hidden" /> {s(d.title_2)}
              </h2>
              <p className="text-[14px]/[23px] font-light text-state-gray md:text-[15px]/[26px] xl:text-body-l xl:text-hero-ink">
                <RText d={s(d.body)} t={s(d.body_t)} m={s(d.body_m)} />
              </p>
            </div>
            <ol className="grid w-full grid-cols-1 gap-2 max-md:order-2 md:gap-3.5 xl:grid-cols-3 xl:gap-3">
              {d.steps.map((st, i) => (
                <li
                  key={st.title.text_ar}
                  className="flex h-[50px] items-center gap-2.5 rounded-[14px] bg-white px-3 py-2.5 md:h-[30px] md:bg-transparent md:p-0 xl:h-auto xl:self-stretch xl:rounded-lg xl:bg-white xl:p-3.5"
                >
                  <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-deep-charcoal text-neon-green xl:size-9">
                    <Icon name={(["message", "phone", "store"] as const)[i]} size={16} className="xl:hidden" />
                    <FigmaIcon name={st.icon} size={36} className="max-xl:hidden" />
                  </span>
                  <span className="flex flex-1 items-center gap-2.5 xl:flex-col xl:items-start xl:gap-0">
                    <span className="text-[14px]/[22px] font-medium text-deep-charcoal xl:order-2 xl:text-label-m">{s(st.title)}</span>
                    <span className="text-[12px]/[18px] font-light text-state-gray xl:order-1 xl:text-caption xl:text-v3-text-meta">
                      {s(d.step_label).replace("{n}", String(i + 1))}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-4 max-md:order-3">
              <ButtonLink
                href={homeHref("dealerPackages")}
                variant="dark"
                size="lg"
                className="max-md:h-[50px]! max-md:w-full max-md:rounded-[14px]! max-xl:text-[15px]! max-xl:font-semibold! md:max-xl:h-[50px]! md:max-xl:rounded-full! md:max-xl:ps-[22px]! md:max-xl:pe-[18px]!"
              >
                {s(d.cta)}
                <Icon name="chevron-left" size={20} flip className="max-xl:size-4" />
              </ButtonLink>
              <Link href={homeHref("dealerHelp")} className="flex items-center gap-1 text-body-m text-hero-ink hover:underline max-xl:hidden">
                {s(d.how)}
                <Icon name="chevron-left" size={18} flip />
              </Link>
            </div>
            <p className="flex w-full items-center gap-2 rounded-md bg-white/55 px-3.5 py-2.5 text-caption text-hero-ink max-xl:hidden">
              <FigmaIcon name="brand-shield-outline" size={32} />
              {s(d.note)}
            </p>
          </div>

          {/* Visual (ديسكتوب) — بطاقتين مايلين + شريحة «تظهر بعد التحقق من رقمك» */}
          <div className="relative hidden h-[440px] w-[500px] shrink-0 xl:block" aria-hidden>
            <GiftCard s={s} d={d} card={d.back_card} ready={false} className="absolute end-[102px] top-[30px] rotate-7 opacity-95" />
            <GiftCard s={s} d={d} card={d.front_card} ready className="absolute end-[42px] top-[67px] -rotate-4" />
            <span className="absolute end-[98px] top-[452px] flex h-14 rotate-3 items-center gap-2 rounded-full bg-white ps-3.5 pe-4 text-label-m whitespace-nowrap text-deep-charcoal shadow-[0_12px_24px_#0b0d0a33]">
              <FigmaIcon name="brand-phone-outline" size={36} />
              {s(d.lock)}
            </span>
          </div>
          {/* تابلت/موبايل: بطاقة «محجوزة» بس، مايلة (288×331 · 223×257 = 360×414 × 0.8 · 0.62) */}
          <div className="flex justify-center max-md:order-1 md:w-[300px] md:shrink-0 xl:hidden" aria-hidden>
            <div className="w-[360px] rotate-7 [zoom:0.62] md:[zoom:0.8]">
              <GiftCard s={s} d={d} card={d.back_card} ready={false} className="h-[414px]" />
            </div>
          </div>
        </div>
        {/* Partners (37:28236) — 5 بلاطات 243×88 بيضا r16 بحد cool-gray/60، اللوجو 78% */}
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5 xl:mt-8 xl:gap-4">
          {d.dealers.map((l) => (
            <li key={l.name} className="flex h-[72px] items-center justify-center rounded-2xl border border-cool-gray/60 bg-white px-3 max-sm:last:col-span-2 xl:h-[88px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/figma/home/dealers/${l.src}`} alt={l.name} width={l.w} height={l.h} className="h-auto max-w-[80%] opacity-78" style={{ width: l.w }} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
