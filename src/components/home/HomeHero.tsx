import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import type { Provider, Service } from "@/lib/data/types";
import { Header } from "@/components/layout/Header";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Icon } from "@/components/icons/Icon";
import { FigmaIcon } from "./bits";
import { GuestServiceIcon } from "./guest/ServiceIcon";
import { HeroSearchBar } from "./HeroSearchBar";
import { ScrollLink } from "./motion";

type S = (x: { text_ar: string; text_en: string }) => string;

// App download · QR والمتاجر (37:26687) — كارت زجاجي: QR 55 · الشارتين · فاصل · «تطبيق لينكار / امسح الرمز…/ تعرّف على التطبيق»
function AppCard({ s, content, appAnchor }: { s: S; content: HomeContent; appAnchor: string }) {
  const a = content.heroV3.app;
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-white/20 bg-white/8 px-3 py-2.5 backdrop-blur-[8px]">
      <div className="flex flex-col items-start gap-0.5 whitespace-nowrap">
        <p className="text-label-m text-neon-green">{s(a.overline)}</p>
        <p className="text-label-l text-white">{s(a.title)}</p>
        <ScrollLink to={appAnchor} className="flex items-center gap-1 text-label-m text-neon-green hover:underline">
          {s(a.link)}
          <Icon name="chevron-down" size={14} />
        </ScrollLink>
      </div>
      <span aria-hidden className="h-14 w-px shrink-0 bg-white/20" />
      <StoreBadges height={34.58} className="flex-col-reverse gap-1.5!" />
      <span className="flex shrink-0 items-center justify-center rounded-md bg-white p-[5px] max-sm:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/home/qr-55.svg" alt="" width={55} height={55} className="size-[55px]" />
      </span>
    </div>
  );
}

// Partner strip (37:26701) — كارت أبيض r24 فوق نهاية هيرو العميل: العنوان · 6 شعارات · «كل مقدّمي الخدمة»
function PartnerStrip({ s, content }: { s: S; content: HomeContent }) {
  const b = content.partnerStrip;
  return (
    <div className="relative z-10 mx-auto -mt-14 max-w-[1440px] px-4 md:px-10 xl:px-20">
      <div className="flex flex-col gap-5 rounded-2xl bg-white px-5 py-[18px] shadow-[0_24px_48px_-12px_#0b0d0a33] lg:h-[100px] lg:flex-row lg:items-center lg:gap-7 lg:px-8">
        <div className="flex shrink-0 flex-col items-start gap-1 whitespace-nowrap">
          <p className="text-label-m text-green-active">{s(b.overline)}</p>
          <p className="text-h4 text-hero-ink">{s(b.title)}</p>
        </div>
        <span aria-hidden className="hidden h-14 w-px shrink-0 bg-cool-gray lg:block" />
        <ul className="grid min-w-0 flex-1 grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-6 lg:flex lg:items-center lg:justify-between lg:gap-2">
          {b.partners.map((p) => (
            <li key={p.slug} className="flex flex-col items-center gap-1.5">
              <span className="relative h-9 w-[108px] max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/figma/home/partners/${p.slug}.png`}
                  alt=""
                  className="absolute object-contain"
                  style={{ top: `${p.inset[0]}%`, right: `${p.inset[1]}%`, bottom: `${p.inset[2]}%`, left: `${p.inset[3]}%`, width: `${100 - p.inset[1] - p.inset[3]}%`, height: `${100 - p.inset[0] - p.inset[2]}%` }}
                />
              </span>
              <span className="text-center text-label-m whitespace-nowrap text-deep-charcoal">{s(p.name)}</span>
            </li>
          ))}
        </ul>
        <Link href={homeHref(b.link.href_key)} className="flex shrink-0 items-center gap-1 self-start text-[15px] leading-[22px] font-bold text-green-dark hover:underline lg:self-auto">
          {s(b.link)}
          <Icon name="chevron-left" size={18} flip className="text-nature-green" />
        </Link>
      </div>
    </div>
  );
}

// الهيرو الجديد (صفحة 0:1 في نسخة العميل) — العميل المسجّل 37:26639 (+ Partner strip) · الزائر 37:28372
// الصورة والتدرّج كحلي ناحية النص، والبحث «Search bar · unified» بخاناته الأربعة + «ابحث»
export function HomeHero({
  locale,
  content,
  variant,
  services,
  providers,
  appAnchor,
}: {
  locale: Locale;
  content: HomeContent;
  variant: "user" | "guest";
  services: Service[];
  providers: Provider[];
  appAnchor: string;
}) {
  const h = content.heroV3;
  const c = getCommon(locale);
  const s: S = (x) => tx(locale, x, "text");
  const user = variant === "user";
  const i = content.hero.incomplete;
  const e = content.hero.errors;
  const ar = locale === "ar";
  // Overlay (37:26640) — غامق ناحية النص (يمين في العربي)
  const userShade = `linear-gradient(${ar ? 90 : 270}deg, rgba(21,41,53,0.35) 0%, rgba(21,41,53,0.82) 55%, rgba(21,41,53,0.96) 100%)`;
  const guestShade = `linear-gradient(180deg, rgba(21,41,53,0.55) 0%, rgba(21,41,53,0) 35%, rgba(21,41,53,0.6) 100%), linear-gradient(${ar ? 90 : 270}deg, rgba(21,41,53,0.15) 0%, rgba(21,41,53,0.55) 45%, rgba(21,41,53,0.9) 100%)`;

  const search = (
    <HeroSearchBar
      services={services.map((sv) => ({ slug: sv.slug, label: tx(locale, sv, "name") }))}
      providers={providers.map((p) => ({ slug: p.slug, label: tx(locale, p, "name") }))}
      defaultSelected={h.default_services}
      location={s(content.demoLocation)}
      carTypes={content.carTypes.map((t) => ({ slug: t.slug, label: s(t) }))}
      copy={{
        provider: s(h.search.provider),
        all: s(h.search.all),
        services: s(h.search.services),
        add: s(h.search.add),
        location: s(h.search.location),
        car: s(h.search.car),
        carPlaceholder: s(user ? h.user.car_placeholder : h.guest.car_placeholder),
        search: s(h.search.search),
        remove: s(h.search.remove),
      }}
      errors={{ services: s(e.services), cityCar: s(e.city_car), city: s(e.city), car: s(e.car) }}
      popup={{
        badge: s(i.badge),
        title: s(i.title),
        body: s(i.body),
        service: [s(i.service.label), s(i.service.text)],
        city: [s(i.city.label), s(i.city.text)],
        car: [s(i.car.label), s(i.car.text)],
        ok: s(i.ok),
        close: c.close,
      }}
    />
  );

  return (
    <>
      <section className={`relative overflow-hidden bg-deep-charcoal text-white ${user ? "xl:h-[880px]" : "xl:h-[765px]"}`}>
        <Image
          src={user ? "/figma/home/hero-user.jpg" : "/figma/home/hero-guest.jpg"}
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundImage: user ? userShade : guestShade }} />
        {user && (
          // Glow (37:26641) — توهّج ليموني تحت يسار الهيرو
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/figma/home/hero-glow.svg" alt="" aria-hidden className="pointer-events-none absolute top-[220px] -end-[360px] size-[1020px] max-w-none" />
        )}
        <Header variant="hero" />

        <div
          className={`relative mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-4 pb-14 md:px-10 xl:px-20 ${
            user ? "pt-[130px] md:pt-[150px] xl:pt-[210px] xl:pb-10" : "pt-[130px] md:pt-[150px] xl:pt-[168px] xl:pb-20"
          }`}
        >
          {user ? (
            <>
              <p className="flex max-w-full items-center gap-2 rounded-full border border-white/24 bg-white/12 py-2 ps-3.5 pe-3.5 text-label-m text-white">
                <FigmaIcon name="brand-shield-outline" size={36} className="max-sm:hidden" />
                <span className="min-w-0">{s(h.user.trust)}</span>
              </p>
              <h1 className="text-[38px]/[56px] font-bold md:text-[52px]/[78px] xl:text-display-xl">
                {s(h.user.title_1)}
                <br />
                <span className="text-neon-green">{s(h.user.title_2)}</span>
              </h1>
              <p className="max-w-[600px] text-body-l text-text-on-image-muted">{s(h.user.subtitle)}</p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-3.5 py-1.5 text-label-m text-white backdrop-blur-[8px]">
                <span className="size-2 rounded-full bg-neon-green" />
                {s(h.guest.eyebrow)}
              </p>
              <h1 className="text-[32px]/[48px] font-bold md:text-display-l md:whitespace-nowrap">{s(h.guest.title)}</h1>
              <p className="max-w-[640px] text-body-l text-white/78">{s(h.guest.subtitle)}</p>
            </>
          )}
          {search}
          {!user && (
            <div className="flex flex-wrap items-center gap-2 xl:mt-0">
              <span className="text-label-m text-white/70">{s(h.guest.popular_label)}</span>
              {h.guest.popular.map((slug) => {
                const sv = services.find((x) => x.slug === slug);
                if (!sv) return null;
                return (
                  <Link
                    key={slug}
                    href={routes.search({ services: [slug] })}
                    className="flex items-center gap-1.5 rounded-full border border-white/22 bg-white/12 py-1.5 ps-3 pe-1.5 text-label-m text-white backdrop-blur-[8px] hover:bg-white/20"
                  >
                    <GuestServiceIcon slug={slug} variant="dark" size={24} />
                    {tx(locale, sv, "name")}
                  </Link>
                );
              })}
            </div>
          )}
          <div className={!user ? "xl:mt-3" : ""}>
            <AppCard s={s} content={content} appAnchor={appAnchor} />
          </div>
        </div>
      </section>
      {user && <PartnerStrip s={s} content={content} />}
    </>
  );
}
