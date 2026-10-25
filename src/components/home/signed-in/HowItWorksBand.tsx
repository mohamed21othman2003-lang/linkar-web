import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { formatPrice } from "@/lib/format";
import { Icon } from "@/components/icons/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile, SectionLink } from "../bits";
import { PulseTag } from "../motion";

// V2-01 · Band · How it works (557:18) — لوحة الرحلة (ابحث/قارن/اطلب/قيّم) + الخطوات على خط زمني
export function HowItWorksBand({ locale, content, providers }: { locale: Locale; content: HomeContent; providers: Provider[] }) {
  const h = content.howItWorks;
  const j = h.journey;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const markers = [
    <FigmaIcon key="1" name="brand-search-outline" size={32} />,
    <Icon key="2" name="tag" size={32} className="text-deep-charcoal" />,
    <Icon key="3" name="card" size={32} className="text-deep-charcoal" />,
    <FigmaIcon key="4" name="feature-points-neon" size={40} />,
  ];
  const card = "flex flex-col items-start gap-2 rounded-lg bg-tile p-3.5";
  const stepHead = (n: number) => (
    <p className="flex items-center gap-2 text-label-l text-deep-charcoal">
      <span className="flex size-6 items-center justify-center rounded-full bg-neon-green text-caption">{n}</span>
      {s(h.steps[n - 1].title)}
    </p>
  );

  return (
    <section className="bg-cool-gray/35 py-16 lg:py-[72px]">
      {/* جنب بعض من xl — في 1024 الرسمة (520px ثابتة) كانت بتضيّق الخطوات */}
      <Container className="flex flex-col gap-12 xl:flex-row xl:items-center xl:gap-[72px]">
        {/* Steps column */}
        <div className="flex flex-col gap-9 lg:w-[688px]">
          <div className="flex flex-col gap-2.5">
            <p className="text-overline text-green-dark">{s(h.overline)}</p>
            <h2 className="text-[26px]/[40px] font-medium text-deep-charcoal md:text-[32px] md:leading-[61px]">{s(h.title)}</h2>
            <p className="text-[18px] leading-[34px] font-medium text-state-gray">{s(h.description)}</p>
          </div>
          <ol className="relative flex flex-col gap-[22px]">
            <span className="absolute start-[27px] top-7 bottom-7 w-0.5 bg-nature-green/50" aria-hidden />
            {h.steps.map((step, i) => {
              const last = i === h.steps.length - 1;
              return (
                <li key={i} className="relative flex items-start gap-[18px]">
                  <span
                    className={`relative flex size-14 shrink-0 items-center justify-center rounded-full shadow-elevation-1 ${
                      last ? "bg-neon-green" : "border-[1.5px] border-nature-green bg-white"
                    }`}
                  >
                    {markers[i]}
                    <span
                      className={`absolute -start-1 -top-1 flex size-[22px] items-center justify-center rounded-full bg-deep-charcoal text-label-m ${
                        last ? "text-neon-green" : "text-white"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-h5 text-deep-charcoal">{s(step.title)}</h3>
                    <p className="text-body-m text-state-gray">{s(step.body)}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href={homeHref("search")} size="lg">
              {s(h.start)}
              <Icon name="chevron-left" size={20} flip />
            </ButtonLink>
            <SectionLink label={s(h.protect_link)} href={homeHref("warranty")} />
          </div>
        </div>

        {/* Responses visual */}
        <div className="relative mx-auto w-full max-w-[520px] pt-5 pb-5 xl:h-[560px] xl:w-[520px] xl:shrink-0 xl:py-0" aria-hidden>
          <div className="mx-auto flex max-w-[440px] flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_24px_#0b0d0a33] sm:p-6 lg:mt-2.5">
            <div className={card}>
              {stepHead(1)}
              <div className="flex h-[42px] items-center gap-1.5 rounded-md border border-cool-gray bg-white px-2.5">
                <Icon name="search" size={14} className="text-state-gray" />
                {[...j.chips].reverse().map((c) => (
                  <span key={c.text_ar} className="rounded-full bg-neon-green px-2 py-[3px] text-caption text-deep-charcoal">
                    {s(c)}
                  </span>
                ))}
              </div>
            </div>
            <div className={`${card} items-stretch`}>
              {stepHead(2)}
              {j.compare.map((row) => {
                const p = providers.find((x) => x.slug === row.provider);
                if (!p) return null;
                return (
                  <div key={row.provider} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-body-s text-deep-charcoal">
                      <LogoTile slug={p.slug} alt="" size={26} radius="rounded-full" />
                      {tx(locale, p, "short_name")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-label-m text-deep-charcoal">{formatPrice(locale, row.price)}</span>
                      {row.best && <span className="rounded-full bg-deep-charcoal px-2 py-0.5 text-caption text-neon-green">{s(j.best_price)}</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={card}>
              {stepHead(3)}
              <p className="flex items-center gap-1.5 text-caption text-green-active">
                <Icon name="check" size={14} className="text-nature-green" />
                {s(j.paid)}
              </p>
            </div>
            <div className={card}>
              {stepHead(4)}
              <p className="flex items-center gap-2 text-caption text-state-gray">
                {s(j.rate)}
                <span className="flex gap-[3px] text-v3-rating-star">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <Icon key={k} name="star-filled" size={16} />
                  ))}
                </span>
              </p>
            </div>
          </div>
          {j.tags.map((tag, i) => (
            <span
              key={tag.text_ar}
              className={`absolute start-1/2 hidden -translate-x-1/2 sm:block rtl:translate-x-1/2 ${["top-0", "top-[261px]", "top-[467px]"][i]}`}
            >
              {/* Tag (557:60/62/64): نبضة في دورة الـ9 ثواني */}
              <PulseTag
                index={i}
                className="block rounded-full bg-deep-charcoal px-3.5 py-2 text-label-m whitespace-nowrap text-neon-green shadow-[0_8px_24px_#0b0d0a24]"
              >
                {s(tag)}
              </PulseTag>
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
