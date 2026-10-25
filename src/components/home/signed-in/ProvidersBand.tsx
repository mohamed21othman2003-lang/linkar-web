import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { getHomeDict } from "@/i18n/dict/home";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile, SectionHead } from "../bits";
import { ProviderGrid } from "./ProviderGrid";

// V2-01 · Band · Providers (557:105) — كحلي: العنوان، 4 بطاقات اعتماد، فلاتر، 4 كروت، جدار شعارات
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
  const b = content.providersBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  const featured = b.featured
    .map((f) => ({ provider: providers.find((p) => p.slug === f.provider), tag: f.tag ? s(f.tag) : null, ai: f.ai }))
    .filter((f): f is { provider: Provider; tag: string | null; ai: boolean } => !!f.provider);
  return (
    <section className="bg-deep-charcoal py-16 lg:py-[104px]">
      <Container className="flex flex-col gap-9">
        <SectionHead
          tone="dark"
          overline={s(b.head.overline)}
          title={s(b.head.title)}
          description={s(b.head.description)}
          link={{ label: s(b.head.link), href: homeHref(b.head.link.href_key) }}
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 100 ثابت زي الفيجما من 1440 (النص بيطلع شوية برّه الصندوق هناك)، وأقل من كده الصندوق بيكبر مع النص */}
          {b.certs.map((c) => (
            <li key={c.title.text_ar} className="flex min-h-[100px] items-center gap-3.5 rounded-xl border border-white/24 bg-white/12 p-[18px] min-[1440px]:h-[100px]">
              <FigmaIcon name={c.icon} size={44} />
              <div className="flex flex-col gap-0.5">
                <p className="text-label-l text-white">{s(c.title)}</p>
                <p className="text-caption text-cool-gray">{s(c.body)}</p>
              </div>
            </li>
          ))}
        </ul>
        <ProviderGrid
          locale={locale}
          services={services}
          featured={featured}
          allLabel={s(b.all)}
          filterLabel={d.filter}
        />
        <div className="flex flex-col gap-4">
          <p className="text-label-l text-white/75">{s(b.more)}</p>
          <div className="flex flex-wrap gap-3">
            {b.logo_wall.map((slug) => {
              const p = providers.find((x) => x.slug === slug);
              const name = p ? tx(locale, p, "name") : (logos.find((l) => l.slug === slug)?.name ?? slug);
              return <LogoTile key={slug} slug={slug} alt={name} size={64} href={p ? routes.provider(slug) : undefined} />;
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
