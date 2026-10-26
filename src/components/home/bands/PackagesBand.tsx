import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref, packageHref } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { MobileLink, RText, SectionHead } from "../bits";
import { PackagesCarousel, type PackageView } from "./PackagesCarousel";

// V2-01 · Band · Packages (85:30076 · تابلت 85:34467 · موبايل 85:33788) — كروت الباقات (v2 · Offer card · Logo) في شريط متحرك
export function PackagesBand({ locale, content, providers }: { locale: Locale; content: HomeContent; providers: Provider[] }) {
  const b = content.packagesBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  const items: PackageView[] = b.cards.flatMap((c, i) => {
    const provider = providers.find((p) => p.slug === c.provider);
    if (!provider) return [];
    return [
      {
        key: `${c.provider}-${i}`,
        provider,
        discount: c.discount,
        title: [s(c.title[0]), s(c.title[1])] as [string, string],
        features: c.features.map((f) => ({ icon: f.icon, label: s(f.label) })),
        price: c.price,
        oldPrice: c.old_price,
        href: packageHref("package_slug" in c ? c.package_slug : undefined),
        categories: c.categories,
      },
    ];
  });
  return (
    <section className="relative overflow-hidden bg-tile py-9 md:py-16 xl:bg-surface-soft xl:py-[104px]">
      {/* زخرفة: Brand icon · chevron · Outline بشفافية 18% */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/home/icons/brand-chevron-outline.svg"
        alt=""
        width={320}
        height={326}
        className="pointer-events-none absolute end-[60px] top-[700px] hidden w-80 opacity-18 xl:block"
      />
      <Container className="relative flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:gap-8">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={<RText d={s(b.head.description)} t={s(b.head.description_t)} m={s(b.head.description_m)} />}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <PackagesCarousel
          locale={locale}
          items={items}
          categories={b.categories.map((c) => ({ slug: c.slug, label: s(c) }))}
          allLabel={s(b.all)}
          prevLabel={d.previous}
          nextLabel={d.next}
          slideLabel={d.slide}
        />
        <MobileLink label={s(b.head.link)} href={homeHref(b.head.link.href_key)} />
      </Container>
    </section>
  );
}
