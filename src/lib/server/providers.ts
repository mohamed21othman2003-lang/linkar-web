// طبقة بيانات صفحة مقدّم الخدمة (W2-21) والخدمة عند المزوّد (W2-32).
// دلوقتي من lib/data/provider-details؛ في المرحلة 3 الدوال دي بس هي اللي هتجيب من الـAPI.
import { providers } from "@/lib/data/providers";
import { services } from "@/lib/data/services";
import type { Provider, ServiceSlug } from "@/lib/data/types";
import { providerDetails, marketers, generateDetail, cardPhotoFor } from "@/lib/data/provider-details";
import type { Marketer, ProviderDetail, ProviderService, SimilarItem } from "@/lib/data/provider-details";
import type { Localized } from "@/i18n/config";

export type { ProviderDetail, ProviderService, Marketer };

export type SimilarCard = {
  provider: Provider;
  tag: Localized<"tag"> | null;
  services: ServiceSlug[];
  photo: string;
};

export type SimilarSets = { similar: SimilarCard[]; nearest: SimilarCard[]; same: SimilarCard[] };

function detailFor(provider: Provider): ProviderDetail {
  return providerDetails[provider.slug] ?? generateDetail(provider, services, providers.indexOf(provider));
}

export async function getProviderSlugs(): Promise<string[]> {
  return providers.map((p) => p.slug);
}

export async function getProviderServiceParams(): Promise<{ slug: string; service: string }[]> {
  // المسار الأساسي لكل خدمة + مسار بديل باسم الصنف (البحث بيبني الروابط بالصنف) بيتحوّل للأساسي
  return providers.flatMap((p) => {
    const list = detailFor(p).services;
    const own = list.map((s) => ({ slug: p.slug, service: s.slug }));
    const aliases = [...new Set(list.map((s) => s.category))]
      .filter((cat) => !list.some((s) => s.slug === cat))
      .map((cat) => ({ slug: p.slug, service: cat }));
    return [...own, ...aliases];
  });
}

export async function getProviderDetail(slug: string): Promise<{ provider: Provider; detail: ProviderDetail } | undefined> {
  const provider = providers.find((p) => p.slug === slug);
  if (!provider) return undefined;
  return { provider, detail: detailFor(provider) };
}

export async function getProviderService(slug: string, serviceSlug: string) {
  const found = await getProviderDetail(slug);
  const list = found?.detail.services ?? [];
  // بالـslug الأساسي، وإلا أول خدمة من نفس الصنف (مسار بديل)
  const service = list.find((s) => s.slug === serviceSlug) ?? list.find((s) => s.category === serviceSlug);
  if (!found || !service) return undefined;
  return { ...found, service };
}

const toCard = (p: Provider, i: number, item?: SimilarItem): SimilarCard => ({
  provider: p,
  tag: item ? { tag_ar: item.tag_ar, tag_en: item.tag_en } : p.tag ? { tag_ar: p.tag.label_ar, tag_en: p.tag.label_en } : null,
  services: item?.services ?? p.services,
  photo: cardPhotoFor(p.slug, i),
});

// «مقدّمو خدمة مشابهون»: 3 فلاتر (مشابهون لـ… · الأقرب لك · يقدّمون نفس خدماتك) × 4 كروت
export async function getSimilarProviders(slug: string): Promise<SimilarSets> {
  const self = providers.find((p) => p.slug === slug)!;
  const others = providers.filter((p) => p.slug !== slug);
  const overlap = (p: Provider) => p.services.filter((s) => self.services.includes(s)).length;
  const detail = detailFor(self);
  const similar = detail.similar
    ? detail.similar.map((it, i) => toCard(providers.find((p) => p.slug === it.provider)!, i, it))
    : [...others]
        .sort((a, b) => overlap(b) - overlap(a) || b.rating - a.rating)
        .slice(0, 4)
        .map((p, i) => toCard(p, i));
  const nearest = [...others].sort((a, b) => a.distance_km - b.distance_km).slice(0, 4).map((p, i) => toCard(p, i));
  const same = others
    .filter((p) => p.services.includes(self.services[0]))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
    .map((p, i) => toCard(p, i));
  return { similar, nearest, same: same.length ? same : similar };
}

// الكاروسيل (موبايل) — من الفيجما لجونسون، وإلا من نفس كروت «مشابهون»
export async function getCarouselItems(slug: string) {
  const found = await getProviderDetail(slug);
  if (!found) return [];
  const { detail } = found;
  if (detail.carousel) {
    return detail.carousel.map((c) => ({ ...c, provider: providers.find((p) => p.slug === c.provider)! }));
  }
  const sets = await getSimilarProviders(slug);
  return sets.similar.map((c) => ({
    provider: c.provider,
    reviews_count: undefined,
    services_ar: c.services.map((s) => services.find((x) => x.slug === s)!.chip_ar).join(" · "),
    services_en: c.services.map((s) => services.find((x) => x.slug === s)!.chip_en).join(" · "),
    highlight_ar: c.tag?.tag_ar ?? "",
    highlight_en: c.tag?.tag_en ?? "",
  }));
}

// «مقدّمو خدمة آخرون يقدّمون …» في W2-32 — من الفيجما لو موجودة، وإلا أقرب 3 مقدّمين لنفس الصنف (⚠ مولّد)
export async function getOtherOffers(slug: string, service: ProviderService) {
  if (service.detail?.other_offers.length) {
    return service.detail.other_offers.map((o) => ({ ...o, provider: providers.find((p) => p.slug === o.provider)! }));
  }
  const cat = services.find((s) => s.slug === service.category)!;
  return providers
    .filter((p) => p.slug !== slug && p.services.includes(service.category))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 3)
    .map((p, i) => ({
      provider: p,
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      warranty_ar: "",
      warranty_en: "",
      price: p.starting_price,
      photo: cardPhotoFor(p.slug, i),
      in_compare: false,
    }));
}

export async function getMarketer(code: string | undefined): Promise<Marketer | undefined> {
  if (!code) return undefined;
  return marketers.find((m) => m.code.toLowerCase() === code.toLowerCase());
}

export async function getCategory(slug: ServiceSlug) {
  return services.find((s) => s.slug === slug)!;
}
