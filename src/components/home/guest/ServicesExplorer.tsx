import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import type { GuestHomeContent as HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "../bits";
import { ExplorerClient, type ExplorerItem } from "./ExplorerClient";

// V2-02 · Services (37:28436) — قائمة الخدمات + لوحة تفاصيل الخدمة المختارة
export function ServicesExplorer({
  id,
  locale,
  content,
  providers,
  services,
}: {
  id: string;
  locale: Locale;
  content: HomeContent;
  providers: Provider[];
  services: Service[];
}) {
  const e = content.servicesExplorer;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const items: ExplorerItem[] = e.items.flatMap((it) => {
    const service = services.find((x) => x.slug === it.slug);
    if (!service) return [];
    const name = tx(locale, service, "name");
    const det = e.details[it.slug];
    // الشعارات: من الفيجما للتظليل، ولباقي الخدمات مقدّمو الخدمة اللي بيقدّموها (الأعلى تقييماً)
    const logoSlugs =
      det?.logos ??
      providers
        .filter((p) => p.services.includes(it.slug))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6)
        .map((p) => p.slug);
    return [
      {
        slug: it.slug,
        name,
        sub: s(it.sub),
        price: formatPrice(locale, it.price),
        description: det ? s(det.description) : tx(locale, service, "description"),
        popular: det?.popular ? s(det.popular) : null,
        benefits: (det?.benefits ?? []).map((b) => ({ icon: b.icon, text: s(b.text) })),
        logos: logoSlugs.flatMap((slug) => {
          const p = providers.find((x) => x.slug === slug);
          return p ? [{ slug, name: tx(locale, p, "name"), href: routes.provider(slug) }] : [];
        }),
        ctaProviders: s(e.cta_providers).replace("{name}", name),
        ctaAbout: s(e.cta_about).replace("{name}", name),
        providersHref: routes.search({ services: [it.slug] }),
        // ⚠ مفيش صفحة خدمة مفردة في الفيجما — «عن خدمة …» بتودّي لصفحة كل الخدمات
        aboutHref: routes.services,
      },
    ];
  });
  return (
    <section id={id} className="scroll-mt-20 bg-white py-16 lg:pt-24 lg:pb-[104px]">
      <Container className="flex flex-col gap-10">
        <SectionHead
          tone="guest"
          textClass="max-w-[595px]"
          overline={s(e.head.overline)}
          title={s(e.head.title)}
          description={s(e.head.description)}
          link={{ label: s(e.head.link), href: homeHref(e.head.link.href_key) }}
        />
        <ExplorerClient items={items} initial={e.default} startsFrom={s(e.starts_from)} availableAt={s(e.available_at)} />
      </Container>
    </section>
  );
}
