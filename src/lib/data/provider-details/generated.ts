import type { Provider, Service } from "@/lib/data/types";
import type { ProviderDetail, ProviderService } from "./types";

// ⚠⚠ محتوى مؤقت (placeholder) — الفيجما فيها صفحة مقدّم خدمة لجونسون بس.
// باقي مقدّمي الخدمة بياخدوا نفس التخطيط ببياناتهم من providers.ts (الاسم/الشعار/الخدمات/«يبدأ من»)،
// وكل اللي مش معروف (الفروع، الباقات، التقييمات، النبذة، تقييم Google، المواعيد) بيتساب فاضي والتبويب بيختفي.
// الحاجات المولّدة هنا (generated: true):
//  - خدمة واحدة لكل صنف في provider.services، اسمها ووصفها من services.ts
//  - السعر = starting_price للصنف الأول، ولكل صنف بعده +20% (تقريبي) — وأسعار SUV ×1.15 / ×1.3
//  - صورة الغلاف/الخدمة: صور مؤقتة من صفحة جونسون

const P = "/figma/provider";

// صور مؤقتة للكروت والغلاف (من نفس صفحات الفيجما)
const cardPhotos: Record<string, string> = {
  nukhba: `${P}/similar-nukhba.png`,
  bareeq: `${P}/similar-bareeq.png`,
  lamaa: `${P}/similar-lamaa.png`,
  xpel: `${P}/similar-xpel.png`,
  nanoshield: `${P}/offer-nanoshield.png`,
};
const fallbackPhotos = [`${P}/svc-ceramic-pro.png`, `${P}/gallery-wash.png`, `${P}/svc-ppf-front.png`, `${P}/svc-interior.png`];

export function cardPhotoFor(slug: string, index = 0): string {
  return cardPhotos[slug] ?? fallbackPhotos[index % fallbackPhotos.length];
}

const round = (n: number) => Math.max(1, Math.round(n / 50) * 50 - 1);

export function generateDetail(provider: Provider, services: Service[], index: number): ProviderDetail {
  const photo = cardPhotoFor(provider.slug, index);
  const cats = [...provider.services, ...(provider.more_services ?? [])];
  const items: ProviderService[] = cats.map((cat, i) => {
    const s = services.find((x) => x.slug === cat)!;
    const sedan = i === 0 ? provider.starting_price : round(provider.starting_price * (1 + 0.2 * i));
    return {
      slug: cat,
      category: cat,
      group: cat,
      icon: cat,
      photo: i === 0 ? photo : fallbackPhotos[(index + i) % fallbackPhotos.length],
      popular: i === 0,
      name_ar: s.name_ar,
      name_en: s.name_en,
      description_ar: s.description_ar,
      description_en: s.description_en,
      duration_ar: "",
      duration_en: "",
      prices: { sedan, suv: round(sedan * 1.15), large: round(sedan * 1.3) },
      duration_hours: 0,
      warranty_years: null,
      warranty_label: null,
      compare: { type_ar: s.name_ar, type_en: s.name_en, warranty_ar: "—", warranty_en: "—", package: null },
      addons: cats.filter((c) => c !== cat),
      detail: null,
    };
  });
  return {
    slug: provider.slug,
    generated: true,
    cover: photo,
    card_photo: photo,
    tagline_ar: items.map((s) => s.name_ar).join(" · "),
    tagline_en: items.map((s) => s.name_en).join(" · "),
    hours_ar: "",
    hours_en: "",
    city_ar: "جدة",
    city_en: "Jeddah",
    nearest_branch_km: provider.distance_km,
    google: null,
    linkar: { rating: provider.rating, count: 0 },
    trust: [],
    groups: items.map((s) => ({ key: s.group, name_ar: s.name_ar, name_en: s.name_en, icon: s.icon })),
    services: items,
    default_selection: items.length ? [items[0].slug] : [],
    compare_default: items.slice(0, 3).map((s) => s.slug),
    packages: [],
    branches: [],
    reviews: null,
    about: null,
    similar: null,
    carousel: null,
  };
}
