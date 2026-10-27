import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { MobileLink, SectionHead } from "../bits";
import { ServiceDots, ServiceSlides } from "./ServiceSlides";

// V2-01 · Band · Services (37:26829) — 6 كروت صور (Service slider card) 410×340 في صفّين، كل كارت شريط صور بيتحرك (9 ثواني)
// فوق شبكة خطوط باهتة وتوهّج ليموني في الركن
export function ServicesBand({ locale, content, services }: { locale: Locale; content: HomeContent; services: Service[] }) {
  const b = content.servicesV3;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="relative overflow-hidden bg-white py-16 xl:pt-[104px] xl:pb-24">
      {/* Grid pattern — خطوط #152935/5 بتختفي لفوق */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[91px] h-[760px] [mask-image:linear-gradient(to_top,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(21 41 53 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(21 41 53 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "37px 0",
        }}
      />
      {/* Glow (37:26833) — شمال فوق */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/home/services-glow.webp" loading="lazy" alt="" aria-hidden className="pointer-events-none absolute top-[-355px] left-[-330px] h-[987px] w-[1041px] max-w-none object-cover" />
      <Container className="relative flex flex-col gap-10">
        <SectionHead
          overline={s(b.overline)}
          title={s(b.title)}
          description={s(b.description)}
          descBold
          link={{ label: s(b.link), href: homeHref(b.link.href_key) }}
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {b.cards.map((c) => {
            const sv = services.find((x) => x.slug === c.slug);
            if (!sv) return null;
            const name = tx(locale, sv, "name");
            return (
              <li key={c.slug}>
                <Link
                  href={routes.search({ services: [c.slug] })}
                  aria-label={name}
                  className="group relative block h-[300px] overflow-hidden rounded-2xl bg-hero-ink text-white xl:h-[340px]"
                >
                  <ServiceSlides slides={c.slides} />
                  <span className="absolute inset-0 bg-linear-to-b from-deep-charcoal/0 to-deep-charcoal/88" />
                  <span className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-1.5 pe-16">
                    <span className="block h-8 truncate text-h4">{name}</span>
                    <span className="block truncate text-body-s text-text-on-image-muted">{s(c.at)}</span>
                  </span>
                  <ServiceDots />
                  <span className="absolute top-5 end-5 flex size-10 items-center justify-center rounded-full border border-white/25 bg-deep-charcoal/55 transition-colors group-hover:bg-deep-charcoal/80">
                    <Icon name="chevron-left" size={18} flip />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <MobileLink label={s(b.link)} href={homeHref(b.link.href_key)} />
      </Container>
    </section>
  );
}
