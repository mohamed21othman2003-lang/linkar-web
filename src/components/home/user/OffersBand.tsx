import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { Provider } from "@/lib/data/types";
import { formatNumber, formatPrice } from "@/lib/format";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { LogoTile, MobileLink, RText, SectionHead } from "../bits";
import { Rail } from "../Rail";
import { ListingCard, type ListingView } from "./ListingCard";
import { TileCountdown } from "./TileCountdown";

type S = (x: { text_ar: string; text_en: string }) => string;

// كروت العروض والباقات (Listing card) من بيانات الرئيسية
export function listingViews(
  locale: Locale,
  content: HomeContent,
  providers: Provider[],
  items: HomeContent["offersV3"]["cards"] | HomeContent["packagesV3"]["cards"],
  book: (slug?: string) => { label: string; href: string; details: string },
): ListingView[] {
  const s: S = (x) => tx(locale, x, "text");
  const c = content.listingCopy;
  return items.flatMap((o, i) => {
    const provider = providers.find((p) => p.slug === o.provider);
    if (!provider) return [];
    const b = book("package_slug" in o ? o.package_slug : undefined);
    return [
      {
        key: `${o.provider}-${i}`,
        provider,
        media: `/figma/home/offers/${o.media}.jpg`,
        discount: o.discount,
        chip: { icon: o.category.icon === "package" ? "package" : "clock", label: s(o.chip) },
        category: { icon: o.category.icon, label: s(o.category.label) },
        title: s(o.title),
        specs: o.specs.map((x) => ({ icon: x.icon, label: s(x.label) })),
        price: o.price,
        oldPrice: o.old_price,
        distance: s(c.distance).replace("{km}", formatNumber(provider.distance_km)),
        note: s(c.note),
        save: s(c.save).replace("{n}", formatNumber(o.old_price - o.price)),
        detailsHref: b.details,
        bookHref: b.href,
        bookLabel: b.label,
      },
    ];
  });
}

// Featured offer (37:27429) — 628×610 ليموني متدرّج: صورة 220×396 + خصم، «عرض الأسبوع»، العنوان، مقدّم الخدمة ولوحة شعاره،
// السعر قبل/بعد، العدّاد و«احجز العرض» الغامق. تحت md الصورة بتبقى فوق
function FeaturedOffer({ locale, s, content, provider, endsAt }: { locale: Locale; s: S; content: HomeContent; provider: Provider; endsAt: string }) {
  const t = getCommon(locale);
  const f = content.offersV3.featured;
  const name = tx(locale, provider, "name");
  return (
    <article className="flex flex-col gap-5 overflow-hidden rounded-[32px] bg-linear-to-r from-[#abf907] to-[#3bb34b] p-5 md:flex-row md:items-center md:gap-6 md:p-8 xl:h-[610px]">
      <div className="relative h-[220px] shrink-0 overflow-hidden rounded-[24px] md:order-last md:h-[396px] md:w-[220px]">
        <Image src="/figma/home/offers/featured.jpg" alt="" fill sizes="(min-width: 768px) 220px, 90vw" className="object-cover" />
        <span className="absolute end-3.5 top-3.5 flex h-10 items-center rounded-full bg-neon-green px-4 text-[16px] leading-6 font-bold text-deep-charcoal drop-shadow-[0_4px_6px_#0000002e]">
          {t.discount(f.discount)}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3.5 text-[#0b0d0a]">
        <span className="flex h-6 items-center rounded-full bg-[#0b0d0a] px-2.5 text-label-m text-white">{s(f.badge)}</span>
        <h3 className="text-[24px] leading-9 font-bold md:text-h2">{s(f.title)}</h3>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start gap-0.5">
            <p className="text-label-l">{name}</p>
            <p className="flex items-center gap-2 whitespace-nowrap">
              <Icon name="star-filled" size={14} className="text-[#0b0d0a]" />
              <span className="text-label-m">{provider.rating.toFixed(1)}</span>
              <span className="text-caption">· {s(content.listingCopy.distance).replace("{km}", formatNumber(provider.distance_km))}</span>
            </p>
          </div>
          <LogoTile slug={provider.slug} alt="" size={57} width={150} radius="rounded-sm" className="order-first w-[150px]" fit={[104, 28]} />
        </div>
        <p className="flex flex-wrap items-baseline gap-x-2.5 whitespace-nowrap">
          <span className="text-h2">{formatPrice(locale, f.price)}</span>
          <s className="text-[18px] leading-[30px] font-light text-deep-charcoal/75">{formatPrice(locale, f.old_price)}</s>
        </p>
        <TileCountdown endsAt={endsAt} label={t.endsIn} units={[t.day, t.hour, t.minute]} />
        <Link
          href={routes.provider(provider.slug)}
          className="flex h-[52px] items-center gap-2 rounded-md bg-[#0b0d0a] px-6 text-[16px] leading-6 font-bold text-neon-green transition-colors hover:bg-deep-charcoal"
        >
          {t.bookOffer}
          <Icon name="chevron-left" size={20} flip />
        </Link>
      </div>
    </article>
  );
}

// V2-01 · Band · Offers (37:27328) — العرض المميّز + كارتين (لمعة · لومار) وزخرفة «%» باهتة
export function OffersBand({ locale, content, providers, endsAt }: { locale: Locale; content: HomeContent; providers: Provider[]; endsAt: string }) {
  const b = content.offersBand;
  const s: S = (x) => tx(locale, x, "text");
  const t = getCommon(locale);
  const fp = providers.find((p) => p.slug === content.offersV3.featured.provider);
  const cards = listingViews(locale, content, providers, content.offersV3.cards, () => ({
    label: t.bookOffer,
    href: homeHref("offers"),
    details: homeHref("offers"),
  }));
  return (
    <section className="relative overflow-hidden bg-white py-9 md:py-16 xl:py-[104px]">
      {/* Decor «%» ×2 — خط #3bb34b بسماكة 2 وشفافية 12–14% */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1440px] -translate-x-1/2 xl:block">
        <span className="absolute top-[434px] left-[22px] flex size-[340px] items-center justify-center">
          <span className="rotate-[-12deg] text-[420px] leading-none font-bold text-transparent opacity-12 [-webkit-text-stroke:2px_#3bb34b]">%</span>
        </span>
        <span className="absolute top-[86px] left-[1197px] flex h-[181px] w-[155px] items-center justify-center">
          <span className="rotate-10 text-[220px] leading-none font-bold text-transparent opacity-14 [-webkit-text-stroke:2px_#3bb34b]">%</span>
        </span>
      </div>
      <Container className="relative flex flex-col gap-[18px] md:gap-7 xl:gap-9">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={<RText d={s(b.head.description)} t={s(b.head.description_t)} m={s(b.head.description_m)} />}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        {/* ديسكتوب: 628 + 302 + 302 بمسافة 24 = 1280 — من 1280 لـ1439 بيتصغّر */}
        <div className="hidden xl:flex xl:gap-6 xl:max-[1439px]:[zoom:0.875]">
          {fp && (
            <div className="w-[628px] shrink-0">
              <FeaturedOffer locale={locale} s={s} content={content} provider={fp} endsAt={endsAt} />
            </div>
          )}
          {[...cards].reverse().map((v) => (
            <div key={v.key} className="w-[302px] shrink-0">
              <ListingCard locale={locale} v={v} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[18px] md:gap-7 xl:hidden">
          {fp && <FeaturedOffer locale={locale} s={s} content={content} provider={fp} endsAt={endsAt} />}
          <Rail
            trackClass="-me-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-4 md:-me-10 md:pe-10"
            itemClass="w-[290px] shrink-0 snap-start md:w-[302px]"
            dots="light"
          >
            {cards.map((v) => (
              <ListingCard key={v.key} locale={locale} v={v} />
            ))}
          </Rail>
          <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} />
        </div>
      </Container>
    </section>
  );
}
