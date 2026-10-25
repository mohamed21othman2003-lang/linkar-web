import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { OfferCard } from "@/components/cards/OfferCard";
import { OfferFeaturedCard } from "@/components/cards/OfferFeaturedCard";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "../bits";

// V2-01 · Band · Offers (557:149) — العرض المميّز (LLumar) + كارتين عروض
export function OffersBand({ locale, content, providers, endsAt }: { locale: Locale; content: HomeContent; providers: Provider[]; endsAt: string }) {
  const b = content.offersBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const fp = providers.find((p) => p.slug === b.featured.provider);
  return (
    <section className="bg-white py-16 lg:py-[104px]">
      <Container className="flex flex-col gap-9">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={s(b.head.description)}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        {/* الصف الواحد (611 + 313 + 313) محتاج 1277px — بيتساوى بالظبط مع محتوى الـ1440؛ تحت كده الكارت المميّز
            بياخد صف لوحده والكارتين تحته (نفس شكل التابلت) بدل ما الصف يطلع برّه الشاشة */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 min-[1440px]:flex min-[1440px]:items-start min-[1440px]:gap-0">
          {fp && (
            <div className="flex justify-center md:col-span-2 min-[1440px]:-ms-[7px] min-[1440px]:w-[621px] min-[1440px]:shrink-0 min-[1440px]:p-[5px] sm:max-md:[zoom:0.9]">
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
          {b.cards.map((o, i) => {
            const p = providers.find((x) => x.slug === o.provider);
            if (!p) return null;
            return (
              <div key={o.provider} className={`min-[1440px]:w-[313px] min-[1440px]:shrink-0 ${i === 0 ? "min-[1440px]:ms-[17px]" : "min-[1440px]:ms-5"}`}>
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
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
