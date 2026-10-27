import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service } from "@/lib/data/types";
import { currency, formatNumber } from "@/lib/format";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { getHomeDict } from "@/i18n/dict/home";
import { FavoriteButton } from "@/components/cards/FavoriteButton";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile, MobileLink, SectionHead } from "../bits";
import { Rail } from "../Rail";

type S = (x: { text_ar: string; text_en: string }) => string;

// Provider card (37:27091…) — 302×453: صورة 200 + شارة بيضا + قلب، لوحة الشعار 160×61 فوق حافة الصورة،
// الاسم 22، المسافة والفروع · التقييم ★، شيبس الخدمات (2 + «+N»)، و«احجز» + «يبدأ من … ر.س»
function ProviderPhotoCard({ locale, provider, badge, services }: { locale: Locale; provider: Provider; badge: string; services: Service[] }) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  const chips = provider.services.map((slug) => services.find((x) => x.slug === slug)).filter((x): x is Service => !!x);
  const shown = chips.slice(0, 2);
  const extra = chips.length - shown.length;
  return (
    <article className="relative flex h-[453px] flex-col overflow-hidden rounded-xl border border-white/6 bg-white/6">
      <Link href={routes.provider(provider.slug)} aria-label={name} className="absolute inset-0 z-0" />
      <div className="pointer-events-none relative h-[200px] shrink-0">
        <Image src={`/figma/home/providers/${provider.slug}.jpg`} alt="" fill sizes="302px" className="object-cover" />
        <span className="absolute start-2.5 top-3 flex h-6 items-center gap-1.5 rounded-full bg-white px-2 text-label-m text-deep-charcoal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src="/figma/home/providers/badge.svg" alt="" width={14} height={14} />
          {badge}
        </span>
      </div>
      <FavoriteButton label={t.favorite} className="absolute end-3 top-3 z-10 size-9! rounded-full! bg-white/92! text-nature-green!" />
      <div className="pointer-events-none absolute start-[15px] top-[171px] z-10 shadow-[0_8px_18px_#14293638]">
        <LogoTile slug={provider.slug} alt="" size={61} width={160} radius="rounded-md" fit={[124, 42]} className="w-[160px]" />
      </div>
      <div className="pointer-events-none relative flex flex-1 flex-col items-start gap-2.5 px-4 pt-10 pb-4">
        <h3 className="text-h4 text-white">{name}</h3>
        <p className="flex items-center gap-2 whitespace-nowrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src="/figma/home/providers/star.svg" alt="" width={14} height={14} />
          <span className="text-label-l text-white">{provider.rating.toFixed(1)}</span>
          <span className="size-[3px] rounded-full bg-white/40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" src="/figma/home/providers/pin.svg" alt="" width={16} height={16} />
          <span className="text-body-s text-cool-gray">
            {formatNumber(provider.distance_km)} {t.km} · {t.branches(provider.branches)}
          </span>
        </p>
        <ul className="flex gap-1.5">
          {shown.map((c) => (
            <li key={c.slug} className="flex h-6 items-center rounded-full bg-white/10 px-2.5 text-label-m text-cool-gray">
              {tx(locale, c, "name")}
            </li>
          ))}
          {extra > 0 && <li className="flex h-6 items-center rounded-full bg-white/10 px-2.5 text-label-m text-cool-gray">+{extra}</li>}
        </ul>
        <span className="h-px w-full bg-white/6" />
        {/* Footer بعد الفاصل بـ10 زي باقي العناصر (مش لازق في آخر الكارت) */}
        <div className="flex w-full items-center gap-2">
          <p className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-body-s text-cool-gray">{t.startsFrom}</span>
            <span className="text-h5 text-white">{formatNumber(provider.starting_price)}</span>
            <span className="text-body-s text-cool-gray">{currency(locale)}</span>
          </p>
          <span className="ms-auto flex h-11 items-center rounded-md bg-neon-green px-5 text-[15px] leading-[22px] font-bold text-deep-charcoal">{t.book}</span>
        </div>
      </div>
    </article>
  );
}

// V2-01 · Band · Providers (37:27049) — كحلي بتوهّجين ونقش شيفرون: العنوان، 4 بطاقات اعتماد، فلاتر، 8 كروت صور، جدار شعارات
export function ProvidersBand({
  locale,
  content,
  providers,
  services,
  logos,
}: {
  locale: Locale;
  content: HomeContent;
  providers: Provider[];
  services: Service[];
  logos: { slug: string; name: string }[];
}) {
  const b = content.providersV3;
  const s: S = (x) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  const cards = b.cards.flatMap((c) => {
    const provider = providers.find((p) => p.slug === c.provider);
    return provider ? [{ provider, badge: s(c.badge) }] : [];
  });
  const chip = (on: boolean) =>
    `inline-flex h-control-sm shrink-0 items-center rounded-full px-3.5 text-label-m transition-colors ${
      on ? "bg-white text-deep-charcoal" : "border border-white/12 bg-white/6 text-white hover:bg-white/12"
    }`;
  return (
    <section className="relative overflow-hidden bg-deep-charcoal py-16 xl:py-[104px]">
      {/* Glow ×2 + Chevron pattern (37:27050–27052) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/home/providers/glow1.webp" loading="lazy" alt="" aria-hidden className="pointer-events-none absolute top-[390px] left-[730px] h-[960px] w-[1100px] max-w-none object-cover" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/home/providers/glow2.webp" loading="lazy" alt="" aria-hidden className="pointer-events-none absolute top-[-280px] left-[-320px] max-w-none object-cover" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[400px] overflow-hidden [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src="/figma/home/providers/chevrons.svg" alt="" className="absolute top-[-1.5px] left-[-1.5px] h-[475px] w-[1489px] max-w-none" />
      </div>
      <Container className="relative flex flex-col gap-9">
        <SectionHead
          tone="dark"
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={s(b.head.description)}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {b.certs.map((c) => (
            <li key={c.title.text_ar} className="flex min-h-[100px] items-center gap-3.5 rounded-xl border border-white/24 bg-white/12 p-[18px] xl:h-[100px]">
              <FigmaIcon name={c.icon} size={44} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-label-l text-white">{s(c.title)}</p>
                <p className="text-caption text-cool-gray">{s(c.body)}</p>
              </div>
            </li>
          ))}
        </ul>
        {/* الفلاتر بتودّي لصفحة كل مقدّمي الخدمة (W2-26) */}
        <div role="toolbar" aria-label={d.filter} className="-me-4 flex gap-2.5 overflow-x-auto pe-4 [scrollbar-width:none] md:m-0 md:flex-wrap md:p-0 [&::-webkit-scrollbar]:hidden">
          <span aria-current="true" className={chip(true)}>
            {s(b.all)}
          </span>
          {b.chips.map((slug) => {
            const sv = services.find((x) => x.slug === slug);
            return sv ? (
              <Link key={slug} href={routes.providers()} className={chip(false)}>
                {tx(locale, sv, "name")}
              </Link>
            ) : null;
          })}
        </div>
        <Rail
          trackClass="-me-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-4 md:-me-10 md:pe-10 xl:m-0 xl:grid xl:grid-cols-4 xl:gap-6 xl:overflow-visible xl:p-0"
          itemClass="w-[290px] shrink-0 snap-start md:w-[302px] xl:w-auto"
          dots="dark"
          dotsClass="xl:hidden"
        >
          {cards.map((c) => (
            <ProviderPhotoCard key={c.provider.slug} locale={locale} provider={c.provider} badge={c.badge} services={services} />
          ))}
        </Rail>
        <div className="flex flex-col items-start gap-4">
          <p className="text-label-l text-white/75">{s(b.more)}</p>
          <div className="flex flex-wrap gap-3">
            {b.logo_wall.map((slug) => {
              const p = providers.find((x) => x.slug === slug);
              const name = p ? tx(locale, p, "name") : (logos.find((l) => l.slug === slug)?.name ?? slug);
              return <LogoTile key={slug} slug={slug} alt={name} size={64} href={p ? routes.provider(slug) : routes.providers()} />;
            })}
          </div>
        </div>
        <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} tone="dark" />
      </Container>
    </section>
  );
}
