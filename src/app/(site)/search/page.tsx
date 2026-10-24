import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getSearchDict } from "@/i18n/dict/search";
import { getProviders, getServices } from "@/lib/server/content";
import { getSearchOptions, getSearchScenario, parseServices } from "@/lib/server/search";
import { routes } from "@/lib/routes";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchHead } from "@/components/search/SearchHead";
import { SearchResults } from "@/components/search/SearchResults";

type Params = { searchParams: Promise<{ services?: string | string[]; view?: string }> };

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const [locale, sp] = await Promise.all([getLocale(), searchParams]);
  const s = await getSearchScenario(parseServices(sp.services));
  return { title: tx(locale, s.title, "text"), description: tx(locale, s.description, "text") || undefined };
}

// W2-30 نتيجة البحث · خدمتان (الافتراضي) · W2-30a خدمة واحدة · W2-30m عرض الخريطة (?view=map)
export default async function SearchPage({ searchParams }: Params) {
  const [locale, sp] = await Promise.all([getLocale(), searchParams]);
  const selected = parseServices(sp.services);
  const view = sp.view === "map" ? "map" : "list";
  const [scenario, services, providers, options] = await Promise.all([getSearchScenario(selected), getServices(), getProviders(), getSearchOptions()]);
  const c = getCommon(locale);
  const t = getSearchDict(locale);
  const providerMap = Object.fromEntries(providers.map((p) => [p.slug, p]));

  return (
    <>
      {/* Search strip */}
      <div className="bg-cool-gray/25 py-4">
        <Container>
          <SearchBar
            key={selected.join(",")}
            locale={locale}
            services={services}
            selected={selected}
            carSizes={options.carSizes}
            location={tx(locale, options.location, "label")}
            view={view === "map" ? "map" : undefined}
          />
        </Container>
      </div>
      <SearchHead
        crumbs={[
          { label: c.home, href: routes.home },
          { label: t.crumbServices, href: routes.services },
          { label: tx(locale, scenario.crumb, "text") },
        ]}
        title={tx(locale, scenario.title, "text")}
        description={tx(locale, scenario.description, "text")}
        tile={scenario.tile}
        facts={scenario.facts.map((f) => ({ icon: f.icon, label: tx(locale, f, "label"), value: tx(locale, f, "value") }))}
      />
      <SearchResults key={selected.join(",")} locale={locale} scenario={scenario} providers={providerMap} view={view} options={options} />
    </>
  );
}
