import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider, Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/format";
import { Icon, ServiceGlyph } from "@/components/icons/Icon";
import { ProviderBadges } from "@/components/ui/Badges";
import { Container } from "@/components/ui/Container";
import { LogoTile, SectionHead } from "../bits";

// كارت مقدّم الخدمة بصورة (V2-02 · Providers 618:1904) — أبيض r24: صورة 180، شعار عائم، الشارات، التقييم، الخدمات، ميزة، السعر و«عرض»
function ProviderPhotoCard({ locale, provider, photo, highlight, view }: { locale: Locale; provider: Provider; photo: string; highlight: string; view: string }) {
  const t = getCommon(locale);
  const name = tx(locale, provider, "name");
  const href = routes.provider(provider.slug);
  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-cool-gray bg-white">
      <Link href={href} aria-label={name} className="absolute inset-0 z-0" />
      <div className="relative h-[180px]">
        <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 300px" className="object-cover" />
      </div>
      <LogoTile slug={provider.slug} alt="" size={64} className="absolute start-5 top-[148px] z-10 shadow-[0_6px_14px_#1429362e]" />
      <div className="pointer-events-none relative flex flex-1 flex-col items-start gap-2.5 px-5 pt-3.5 pb-5">
        <h3 className="ps-[76px] text-h5 text-deep-charcoal">{name}</h3>
        <ProviderBadges locale={locale} tier={provider.tier} certified={provider.certified} surface="light" />
        <p className="flex items-center gap-1.5 text-caption text-state-gray">
          <Icon name="star-filled" size={14} className="text-nature-green" />
          <span className="text-label-l text-deep-charcoal">{provider.rating.toFixed(1)}</span>
          <Icon name="map-pin" size={14} className="text-state-gray" />
          <span>
            {provider.distance_km.toFixed(1)} {t.km}
          </span>
          <span>·</span>
          <span>{t.branches(provider.branches)}</span>
        </p>
        <ul className="flex gap-1.5">
          {provider.services.map((svc) => (
            <li key={svc} className="flex size-[34px] items-center justify-center rounded-[10px] bg-cool-gray/35">
              <ServiceGlyph name={svc} size={14} className="text-state-gray" />
            </li>
          ))}
        </ul>
        <span className="rounded-full border border-nature-green px-3 py-1 text-caption text-green-active">{highlight}</span>
        <span className="mt-auto h-px w-full bg-cool-gray" />
        <div className="flex w-full items-center justify-between">
          <p className="flex items-baseline gap-1.5">
            <span className="text-caption text-state-gray">{t.startsFrom}</span>
            <span className="text-h5 text-deep-charcoal">{formatPrice(locale, provider.starting_price)}</span>
          </p>
          <span className="flex items-center gap-1 text-label-l text-green-active">
            {view}
            <Icon name="chevron-left" size={16} flip className="text-nature-green" />
          </span>
        </div>
      </div>
    </article>
  );
}

// V2-02 · Providers (618:1894) — 4 كروت بالصور + شبكة شعارات 3×7
export function ProvidersGuestBand({
  locale,
  content,
  providers,
  logos,
}: {
  locale: Locale;
  content: HomeContent;
  providers: Provider[];
  services: Service[];
  logos: { slug: string; name: string }[];
}) {
  const b = content.providersGuest;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container className="flex flex-col gap-9">
        <SectionHead
          tone="guest"
          textClass="max-w-[720px]"
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={s(b.head.description)}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {b.cards.map((c) => {
            const p = providers.find((x) => x.slug === c.provider);
            return p ? <ProviderPhotoCard key={c.provider} locale={locale} provider={p} photo={c.photo} highlight={s(c.highlight)} view={s(b.view)} /> : null;
          })}
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-label-l text-state-gray">{s(b.more)}</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {b.logo_grid.map((slug) => {
              const p = providers.find((x) => x.slug === slug);
              const name = p ? tx(locale, p, "name") : (logos.find((l) => l.slug === slug)?.name ?? slug);
              return <LogoTile key={slug} slug={slug} alt={name} size={64} width={169} radius="rounded-md" href={p ? routes.provider(slug) : undefined} />;
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
