import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref, packageHref } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { MobileLink, RText, SectionHead } from "../bits";
import { ListingCard } from "./ListingCard";
import { listingViews } from "./OffersBand";
import { PackagesCarousel } from "./PackagesCarousel";

// V2-01 · Band · Packages (37:27460) — خلفية رمادي فاتح بتدرّج أبيض فوق + شيفرونين باهتين، فلاتر وأسهم، 5 كروت باقات (Listing card) ونقاط
export function PackagesBand({ locale, content, providers }: { locale: Locale; content: HomeContent; providers: Provider[] }) {
  const b = content.packagesBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  const cards = listingViews(locale, content, providers, content.packagesV3.cards, (slug) => ({
    label: s(content.listingCopy.book_package),
    href: packageHref(slug),
    details: packageHref(slug),
  }));
  return (
    <section className="relative overflow-hidden bg-[#f2f3f2] py-9 md:py-16 xl:py-[104px]">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-linear-to-b from-white/90 to-white/0" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[1440px] -translate-x-1/2 xl:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/home/offers/chevron-top.svg" alt="" aria-hidden width={192} height={258} className="pointer-events-none absolute top-0 left-[1248px] max-w-none" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma/home/icons/brand-chevron-outline.svg"
          alt=""
          aria-hidden
          width={373}
          height={380}
          className="pointer-events-none absolute top-[700px] left-0 hidden max-w-none opacity-18 xl:block"
        />
      </div>
      <Container className="relative flex flex-col gap-[18px] md:gap-7 xl:gap-8">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          descBold
          description={<RText d={s(b.head.description)} t={s(b.head.description_t)} m={s(b.head.description_m)} />}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <PackagesCarousel
          rtl={locale === "ar"}
          categories={b.categories.map((c) => s(c))}
          allLabel={s(b.all)}
          prevLabel={d.previous}
          nextLabel={d.next}
          slideLabel={d.slide}
        >
          {cards.map((v) => (
            <ListingCard key={v.key} locale={locale} v={{ ...v, spacer: true }} />
          ))}
        </PackagesCarousel>
        <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} />
      </Container>
    </section>
  );
}
