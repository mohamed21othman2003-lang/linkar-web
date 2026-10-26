import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { OfferCard } from "@/components/cards/OfferCard";
import { OfferFeaturedCard } from "@/components/cards/OfferFeaturedCard";
import { Container } from "@/components/ui/Container";
import { MobileLink, RText, SectionHead } from "../bits";
import { Rail } from "../Rail";

// V2-01 · Band · Offers (85:30070 · تابلت 85:34454 · موبايل 85:33777) — العرض المميّز (LLumar) + كارتين عروض
// تحت xl مافيش العرض المميّز: الكروت في شريط أفقي يبدأ بـXPEL
export function OffersBand({ locale, content, providers, endsAt }: { locale: Locale; content: HomeContent; providers: Provider[]; endsAt: string }) {
  const b = content.offersBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const fp = providers.find((p) => p.slug === b.featured.provider);
  const cards = b.cards.flatMap((o) => {
    const p = providers.find((x) => x.slug === o.provider);
    return p ? [{ o, p }] : [];
  });
  const card = ({ o, p }: (typeof cards)[number]) => (
    <OfferCard
      locale={locale}
      provider={p}
      discount={o.discount}
      title={[s(o.title[0]), s(o.title[1])]}
      features={o.features.map((f) => ({ icon: f.icon, label: s(f.label) }))}
      price={o.price}
      oldPrice={o.old_price}
      detailsHref={homeHref("offers")}
      bookHref={routes.provider(p.slug)}
    />
  );
  return (
    <section className="bg-white py-9 md:py-16 xl:py-[104px]">
      <Container className="flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:gap-9">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={<RText d={s(b.head.description)} t={s(b.head.description_t)} m={s(b.head.description_m)} />}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        {/* ديسكتوب: الصف (611 + 313 + 313) = محتوى الـ1440 بالظبط — من 1280 لـ1439 بيتصغّر عشان مايطلعش برّه */}
        <div className="hidden xl:flex xl:items-start xl:max-[1439px]:[zoom:0.875]">
          {fp && (
            <div className="-ms-[7px] w-[621px] shrink-0 p-[5px]">
              <OfferFeaturedCard
                locale={locale}
                provider={fp}
                discount={b.featured.discount}
                title={s(b.featured.title)}
                price={b.featured.price}
                oldPrice={b.featured.old_price}
                endsAt={endsAt}
                bookHref={routes.provider(fp.slug)}
              />
            </div>
          )}
          {cards.map((c, i) => (
            <div key={c.o.provider} className={`w-[313px] shrink-0 ${i === 0 ? "ms-[17px]" : "ms-5"}`}>
              {card(c)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-[18px] xl:hidden">
          <Rail
            reverse
            trackClass="-me-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pe-5 md:-me-10 md:gap-4 md:pe-10"
            itemClass="w-[257px] shrink-0 snap-start md:w-[313px]"
          >
            {cards.map((c) => (
              // موبايل: 257×503 = 313×614 × 0.82
              <div key={c.o.provider} className="max-md:w-[313px] max-md:[zoom:0.821]">
                {card(c)}
              </div>
            ))}
          </Rail>
          <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} />
        </div>
      </Container>
    </section>
  );
}
