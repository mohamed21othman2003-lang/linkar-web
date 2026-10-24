import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviders, getServices } from "@/lib/server/content";
import { getProvidersListing, getSearchOptions } from "@/lib/server/search";
import { routes } from "@/lib/routes";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProvidersListing } from "@/components/search/ProvidersListing";

type Params = { searchParams: Promise<{ view?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getProvidersListing();
  return { title: tx(locale, p.title, "text"), description: tx(locale, p.description, "text") };
}

// W2-26 · كل مقدّمي الخدمة · قائمة — و W2-26m · خريطة (?view=map)
export default async function ProvidersPage({ searchParams }: Params) {
  const [locale, sp] = await Promise.all([getLocale(), searchParams]);
  const [page, providers, services, options] = await Promise.all([getProvidersListing(), getProviders(), getServices(), getSearchOptions()]);
  const c = getCommon(locale);
  // «الأقرب إليك»: ترتيب الفيجما أولاً، وبعده الباقي حسب المسافة
  const ordered = [
    ...page.order.map((slug) => providers.find((p) => p.slug === slug)).filter((p): p is (typeof providers)[number] => !!p),
    ...providers.filter((p) => !page.order.includes(p.slug)).sort((a, b) => a.distance_km - b.distance_km),
  ];
  return (
    <>
      <PageHeader
        crumbs={[{ label: c.home, href: routes.home }, { label: tx(locale, page.crumb, "text") }]}
        title={tx(locale, page.title, "text")}
        description={tx(locale, page.description, "text")}
        className="pb-7!" // W2-26: Page head p-bottom 28 (218px)
      />
      <ProvidersListing
        locale={locale}
        view={sp.view === "map" ? "map" : "list"}
        providers={ordered}
        services={services}
        total={Math.max(page.total, ordered.length)}
        pageSize={page.page_size}
        pins={page.pins}
        me={page.me}
        mapSelected={page.map_selected}
        location={tx(locale, options.location, "label")}
        sortOptions={options.sortOptions}
        toasts={options.toasts}
      />
    </>
  );
}
