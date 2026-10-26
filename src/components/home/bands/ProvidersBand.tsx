import Link from "next/link";
import type { CSSProperties } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { getHomeDict } from "@/i18n/dict/home";
import { ProviderCard } from "@/components/cards/ProviderCard";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, MobileLink, RText, SectionHead } from "../bits";
import { Rail } from "../Rail";

// V2-01 · Band · Providers (85:30026 · تابلت 85:34399 · موبايل 85:33731) — كحلي: العنوان، 4 بطاقات اعتماد، فلاتر، 4 كروت
// (جدار الشعارات اتشال في التصميم المعدّل). تحت xl: البطاقات 2×2 بترتيب معكوس، والكروت شريط أفقي يبدأ بـڤي كول.
export function ProvidersBand({ locale, content, providers, services }: { locale: Locale; content: HomeContent; providers: Provider[]; services: Service[] }) {
  const b = content.providersBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  const featured = b.featured
    .map((f) => ({ provider: providers.find((p) => p.slug === f.provider), tag: f.tag ? s(f.tag) : null, ai: f.ai }))
    .filter((f): f is { provider: Provider; tag: string | null; ai: boolean } => !!f.provider);
  const n = b.certs.length;
  const chip = (on: boolean) =>
    `inline-flex h-[31px] shrink-0 items-center rounded-full px-3 text-[12px] font-medium transition-colors md:h-control-sm md:px-3.5 md:text-label-m ${
      on ? "bg-white text-deep-charcoal max-xl:bg-solid-black max-xl:text-white" : "border border-white/12 bg-white/6 text-white hover:bg-white/12"
    }`;
  return (
    <section className="bg-deep-charcoal py-9 md:py-16 xl:py-[104px]">
      <Container className="flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:gap-9">
        <SectionHead
          tone="dark"
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={<RText d={s(b.head.description)} t={s(b.head.description_t)} />}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <ul className="grid grid-cols-2 gap-2 md:gap-3 xl:flex xl:gap-4">
          {b.certs.map((c, i) => (
            <li
              key={c.title.text_ar}
              style={{ "--o": n - 1 - i } as CSSProperties}
              className="flex items-center gap-2 rounded-[14px] border border-white/12 bg-white/7 px-3 py-2.5 max-xl:order-(--o) md:gap-3 md:rounded-[18px] md:border-0 md:bg-white md:p-4 xl:h-[100px] xl:flex-1 xl:gap-3.5 xl:rounded-xl xl:border xl:border-white/24 xl:bg-white/12 xl:p-[18px]"
            >
              <FigmaIcon name={c.icon} size={44} className="max-xl:hidden" />
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-neon-green text-deep-charcoal md:size-[42px] md:rounded-md xl:hidden">
                <Icon name={c.glyph} size={16} className="md:size-[22px]" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[13px]/[20px] font-medium whitespace-nowrap text-white md:text-[16px]/[24px] md:whitespace-normal md:font-bold md:text-deep-charcoal xl:text-label-l xl:text-white">
                  <RText d={s(c.title)} m={c.title_m && s(c.title_m)} />
                </p>
                <p className="text-[13px]/[20px] font-light text-state-gray max-md:hidden xl:text-caption xl:text-cool-gray">
                  <RText d={s(c.body)} t={c.body_t && s(c.body_t)} />
                </p>
              </div>
            </li>
          ))}
        </ul>
        {/* الفلاتر (Chip) بتودّي لصفحة كل مقدّمي الخدمة (W2-26) */}
        <div role="toolbar" aria-label={d.filter} className="-me-5 flex h-9 items-center gap-2 overflow-x-auto pe-5 [scrollbar-width:none] md:m-0 md:gap-2.5 md:p-0 [&::-webkit-scrollbar]:hidden">
          <span aria-current="true" className={chip(true)}>
            {s(b.all)}
          </span>
          {services.map((sv) => (
            <Link key={sv.slug} href={routes.providers()} className={chip(false)}>
              {tx(locale, sv, "name")}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-[18px] md:gap-7">
          <Rail
            reverse
            dots="dark"
            dotsClass="xl:hidden"
            trackClass="-me-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pe-5 md:-me-10 md:gap-4 md:pe-10 xl:m-0 xl:grid xl:grid-cols-4 xl:gap-[25px] xl:overflow-visible xl:p-0"
            itemClass="w-[259px] shrink-0 snap-start md:w-[301px] xl:w-auto"
          >
            {featured.map(({ provider, tag, ai }) => (
              // موبايل: نفس الكارت متصغّر (259×390 = 301×453 × 0.86)
              <div key={provider.slug} className="h-full max-md:w-[301px] max-md:[zoom:0.86]">
                <ProviderCard locale={locale} provider={provider} services={services} tagLabel={tag} aiLabel={ai} className="h-full" />
              </div>
            ))}
          </Rail>
          <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} tone="dark" />
        </div>
      </Container>
    </section>
  );
}
