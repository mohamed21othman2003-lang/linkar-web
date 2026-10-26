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

// V2-01 · Band · How it works (37:26888، صفحة 0:1؛ التابلت/الموبايل من V2-01t/m 85:34299/85:33680) — لوحة الرحلة + الخطوات
// ديسكتوب: خط زمني · تابلت: مربعات أيقونات جنب لوحة الرحلة متصغّرة · موبايل: الخطوات في كارت كحلي من غير اللوحة
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

  // Journey panel (85:29895) — 440 عرض، p24 r24؛ على التابلت نفس اللوحة بـzoom 0.78 (343)
  const panel = (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-[0_12px_24px_-12px_#0b0d0a33]">
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
                <span className="flex gap-[3px] text-nature-green">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <Icon key={k} name="star-filled" size={16} />
                  ))}
                </span>
              </p>
            </div>
    </div>
  );
  const tags = (
    <>
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
    </>
  );

  return (
    // خلفية ليموني باهت (11% → 3% من فوق لتحت) + نقش شيفرون بماسك دائري على الشمال (37:26889)
    <section className="relative overflow-hidden bg-linear-to-b from-[#f6fee4] to-[#fdfff8] py-9 md:py-16 xl:py-[72px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/home/chevron-pattern.png" alt="" aria-hidden width={640} height={700} className="pointer-events-none absolute top-0 left-0 hidden xl:block" />
      <Container className="relative flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:flex-row xl:items-center xl:gap-[72px]">
        {/* Steps column */}
        <div className="flex flex-col gap-[18px] md:gap-7 xl:flex-1 xl:gap-9">
          <div className="flex flex-col gap-1.5 md:gap-2 xl:gap-2.5">
            <p className="text-[13px]/[20px] font-medium text-green-dark md:text-overline">{s(h.overline)}</p>
            <h2 className="text-[22px]/[34px] font-bold text-deep-charcoal md:text-[28px]/[42px] xl:text-[32px] xl:leading-[61px] xl:font-medium">{s(h.title)}</h2>
            <p className="text-[16px]/[27px] font-light text-state-gray max-md:hidden xl:text-[18px] xl:leading-[34px] xl:font-medium">{s(h.description)}</p>
          </div>
          {/* تابلت/موبايل: «1 · ابحث» + مربع أيقونة — كارت كحلي على الموبايل */}
          <div className="flex flex-col gap-[18px] md:flex-row md:items-start md:gap-7 xl:hidden">
            <ol className="flex flex-col rounded-[22px] bg-deep-charcoal px-[18px] py-2 md:flex-1 md:gap-[18px] md:rounded-none md:bg-transparent md:p-0">
              {h.steps.map((step, i) => (
                <li key={i} className={`flex items-start gap-3 border-white/10 py-3.5 md:gap-3.5 md:border-0 md:py-0 ${i < h.steps.length - 1 ? "border-b" : ""}`}>
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-md md:size-11 md:rounded-[14px] ${
                      i === 0 ? "bg-neon-green text-deep-charcoal" : "bg-neon-green text-deep-charcoal md:bg-deep-charcoal md:text-neon-green"
                    }`}
                  >
                    <Icon name={(["search", "chart", "card", "star"] as const)[i]} size={20} className="md:size-[22px]" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[16px]/[24px] font-bold text-white md:text-h5 md:text-deep-charcoal">
                      {i + 1} · {s(step.title)}
                    </h3>
                    <p className="text-[13px]/[21px] font-light text-v3-card-stroke md:text-[14px]/[23px] md:text-state-gray">{s(step.body_short)}</p>
                  </div>
                </li>
              ))}
              <li className="max-md:hidden">
                <ButtonLink href={homeHref("search")} className="h-12! rounded-full! ps-[22px]! pe-[18px]! text-[15px]! leading-[24px]! font-semibold!">
                  {s(h.start)}
                  <Icon name="chevron-left" size={14} flip />
                </ButtonLink>
              </li>
            </ol>
            <div className="hidden w-[343px] shrink-0 md:block" aria-hidden>
              <div className="[zoom:0.78]">{panel}</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2.5 md:hidden">
            <ButtonLink href={homeHref("search")} className="h-[46px]! rounded-full! ps-5! pe-4! text-label-m! font-semibold!">
              {s(h.start)}
              <Icon name="chevron-left" size={14} flip />
            </ButtonLink>
            <SectionLink label={s(h.protect_link)} href={homeHref("warranty")} />
          </div>
          <ol className="relative flex flex-col gap-[22px] max-xl:hidden">
            <span className="absolute start-[27px] top-7 bottom-7 w-0.5 bg-nature-green/50" aria-hidden />
            {h.steps.map((step, i) => {
              const last = i === h.steps.length - 1;
              return (
                <li key={i} className="relative flex items-center gap-[18px]">
                  <span
                    className={`relative flex size-14 shrink-0 items-center justify-center rounded-full shadow-elevation-1 ${
                      last ? "bg-neon-green" : "border-[1.5px] border-nature-green bg-white"
                    }`}
                  >
                    {markers[i]}
                    <span
                      className={`absolute flex size-[22px] items-center justify-center rounded-full bg-deep-charcoal text-label-m ${
                        last ? "-start-1 -top-1 text-neon-green" : "-start-[2.5px] -top-[5.5px] text-white"
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
          <div className="flex flex-wrap items-center gap-4 max-xl:hidden">
            <ButtonLink href={homeHref("search")} size="lg">
              {s(h.start)}
              <Icon name="chevron-left" size={20} flip />
            </ButtonLink>
            <SectionLink label={s(h.protect_link)} href={homeHref("warranty")} />
          </div>
        </div>

        {/* Responses visual */}
        <div className="relative hidden h-[560px] w-[520px] shrink-0 xl:block" aria-hidden>
          <div className="mx-auto mt-2.5 w-[440px]">{panel}</div>
          {tags}
        </div>
      </Container>
    </section>
  );
}
