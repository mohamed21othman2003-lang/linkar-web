import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getServices } from "@/lib/server/content";
import { getCarouselItems, getProviderDetail, getProviderSlugs, getSimilarProviders } from "@/lib/server/providers";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/PageHeader";
import { ProviderHero } from "@/components/provider/ProviderHero";
import { ProviderTabs } from "@/components/provider/ProviderTabs";
import { availableTabs, type ProviderTab } from "@/components/provider/tabs";
import { SimilarProviders } from "@/components/provider/SimilarProviders";
import { ToastRoot } from "@/components/provider/ToastRoot";
import { routes } from "@/lib/routes";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// صفحة لكل مقدّم خدمة في providers.ts — أي slug تاني = 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProviderSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const found = await getProviderDetail(slug);
  if (!found) return {};
  return { title: tx(locale, found.provider, "name"), description: tx(locale, found.detail, "tagline") };
}

// W2-21 · صفحة مقدّم الخدمة (جونسون 697:2853) — التبويبات بـ ?tab= ورابط المسوّق بـ ?ref=
export default async function ProviderPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const found = await getProviderDetail(slug);
  if (!found) notFound();
  const { provider, detail } = found;
  const locale = await getLocale();
  const c = getCommon(locale);
  const tabs = availableTabs(detail);
  const requested = typeof sp.tab === "string" ? (sp.tab as ProviderTab) : "services";
  const initialTab = tabs.includes(requested) ? requested : "services";
  const refCode = typeof sp.ref === "string" ? sp.ref : undefined;
  const [sets, carousel, services] = await Promise.all([getSimilarProviders(slug), getCarouselItems(slug), getServices()]);
  return (
    <ToastRoot>
      <Container className="pt-6 pb-4">
        <Breadcrumb items={[{ label: c.home, href: routes.home }, { label: tx(locale, provider, "name") }]} />
      </Container>
      <ProviderHero locale={locale} provider={provider} detail={detail} />
      <ProviderTabs locale={locale} provider={provider} detail={detail} initialTab={initialTab} refCode={refCode} />
      <SimilarProviders locale={locale} shortName={tx(locale, provider, "short_name")} sets={sets} carousel={carousel} services={services} />
      <div className="h-16" />
    </ToastRoot>
  );
}
