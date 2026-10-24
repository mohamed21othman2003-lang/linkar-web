import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref, packageHref } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "../bits";
import { PackagesCarousel, type PackageView } from "./PackagesCarousel";

// V2-01 · Band · Packages (557:183) — كروت الباقات (v2 · Offer card · Logo) في شريط متحرك
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
  // ترتيب الفيجما: الشريط معروض من آخره، فالباقة الأولى (XPEL) على الطرف
  items.reverse();
  return (
    <section className="relative overflow-hidden bg-cool-gray/35 py-16 lg:py-[104px]">
      {/* زخرفة: Brand icon · chevron · Outline بشفافية 18% */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/home/icons/brand-chevron-outline.svg"
        alt=""
        width={320}
        height={326}
        className="pointer-events-none absolute end-[60px] top-[700px] hidden w-80 opacity-18 lg:block"
      />
      <Container className="relative flex flex-col gap-8">
        <SectionHead
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={s(b.head.description)}
          descBold
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
      </Container>
    </section>
  );
}
