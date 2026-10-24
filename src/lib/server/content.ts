// طبقة البيانات الموحّدة — كل الصفحات بتقرا من هنا (أو من ملفات lib/server/<area>.ts بنفس الأسلوب).
// دلوقتي بترجع بيانات تجريبية من lib/data، وفي المرحلة 3 الدوال دي بس هي اللي هتتغيّر
// عشان تجيب من Django API (fetch + revalidate tags).
import { services } from "@/lib/data/services";
import { providers, partnerLogos } from "@/lib/data/providers";
import { site } from "@/lib/data/site";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";

export async function getSite() {
  return site;
}

export async function getServices(): Promise<Service[]> {
  return services;
}

export async function getService(slug: string): Promise<Service | undefined> {
  return services.find((s) => s.slug === slug);
}

export async function getProviders(filter: { services?: ServiceSlug[] } = {}): Promise<Provider[]> {
  if (!filter.services?.length) return providers;
  return providers.filter((p) => filter.services!.every((s) => p.services.includes(s)));
}

export async function getProvider(slug: string): Promise<Provider | undefined> {
  return providers.find((p) => p.slug === slug);
}

export async function getProvidersBySlugs(slugs: string[]): Promise<Provider[]> {
  return slugs.map((s) => providers.find((p) => p.slug === s)).filter((p): p is Provider => !!p);
}

export async function getPartnerLogos() {
  return partnerLogos;
}
