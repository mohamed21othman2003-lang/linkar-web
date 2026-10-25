import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FigmaIcon } from "../bits";

type S = (x: { text_ar: string; text_en: string }) => string;
type Card = HomeContent["dealerBand"]["front_card"] | HomeContent["dealerBand"]["back_card"];

// Gift card (Status=Ready / محجوزة) — كحلي r24 p20
function GiftCard({ s, d, card, ready, className, style }: { s: S; d: HomeContent["dealerBand"]; card: Card; ready: boolean; className: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute flex w-[360px] flex-col gap-3.5 rounded-2xl bg-deep-charcoal p-5 ${className}`} style={style}>
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

// V2-01 · Band · Dealer gifts (557:305) — لوحة متدرّجة: رسم بطاقتين + الخطوات و«اعرض باقاتك»
export function DealerBand({ locale, content }: { locale: Locale; content: HomeContent }) {
  const d = content.dealerBand;
  const s: S = (x) => tx(locale, x, "text");
  return (
    <section className="bg-white py-16 lg:py-[104px]">
      <Container>
        {/* النص جنب البطاقات من xl — في 1024 عمود النص كان بيضيق لـ290px وكروت الخطوات تتكسّر */}
        <div className="relative flex flex-col-reverse gap-10 overflow-hidden rounded-3xl bg-linear-to-r from-neon-green to-nature-green px-5 py-10 sm:px-12 xl:flex-row-reverse xl:items-center xl:gap-12 lg:ps-14 lg:pe-12 lg:py-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/figma/home/icons/brand-chevron-outline.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -end-[143px] top-[27px] hidden w-[720px] rotate-12 opacity-7 lg:block"
          />
          {/* Visual — بطاقتين مايلين + شريحة «تظهر بعد التحقق من رقمك» */}
          {/* max-xl:mb-10: لما البطاقات تنزل تحت النص، شريحة «تظهر بعد التحقق» (top 452) كانت بتتقصّ عند حافة الصندوق */}
          <div className="relative mx-auto h-[440px] w-[500px] max-w-full shrink-0 max-sm:h-[330px] max-sm:w-[375px] max-xl:mb-10" aria-hidden>
            <div className="absolute start-0 top-0 h-[440px] w-[500px] max-sm:scale-75 ltr:origin-top-left rtl:origin-top-right">
              <GiftCard s={s} d={d} card={d.back_card} ready={false} className="end-[102px] top-[30px] rotate-7 opacity-95" />
              <GiftCard s={s} d={d} card={d.front_card} ready className="end-[42px] top-[67px] -rotate-4" />
              <span className="absolute end-[98px] top-[452px] flex h-14 rotate-3 items-center gap-2 rounded-full bg-white ps-3.5 pe-4 text-label-m whitespace-nowrap text-deep-charcoal shadow-[0_12px_24px_#0b0d0a33]">
                <FigmaIcon name="brand-phone-outline" size={36} />
                {s(d.lock)}
              </span>
            </div>
          </div>

          <div className="relative flex flex-col items-start gap-[18px] lg:w-[628px]">
            <span className="inline-flex h-6 items-center rounded-full bg-deep-charcoal px-2.5 text-body-s text-white">{s(d.badge)}</span>
            <h2 className="text-[26px]/[40px] font-bold text-solid-black md:text-h2">
              {s(d.title_1)}
              <br />
              {s(d.title_2)}
            </h2>
            <p className="text-body-l text-solid-black">{s(d.body)}</p>
            <ol className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {d.steps.map((st, i) => (
                <li key={st.title.text_ar} className="flex items-start gap-2.5 rounded-lg bg-white p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-charcoal">
                    <FigmaIcon name={st.icon} size={36} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-caption text-v3-text-meta">{s(d.step_label).replace("{n}", String(i + 1))}</span>
                    <span className="text-label-m text-deep-charcoal">{s(st.title)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href={homeHref("dealerPackages")} variant="dark" size="lg">
                {s(d.cta)}
                <Icon name="chevron-left" size={20} flip />
              </ButtonLink>
              <Link href={homeHref("dealerHelp")} className="flex items-center gap-1 text-body-m text-solid-black hover:underline">
                {s(d.how)}
                <Icon name="chevron-left" size={18} flip />
              </Link>
            </div>
            <p className="flex w-full items-center gap-2 rounded-md bg-white/55 px-3.5 py-2.5 text-caption text-solid-black">
              <FigmaIcon name="brand-shield-outline" size={32} />
              {s(d.note)}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
