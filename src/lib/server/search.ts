// طبقة بيانات البحث ومقدّمي الخدمة — نفس أسلوب lib/server/content.ts.
// دلوقتي من lib/data/search، وبعدين من Django API.
import { getProviders, getServices } from "@/lib/server/content";
import { scenarios, defaultSearchServices } from "@/lib/data/search/scenarios";
import { providersPage } from "@/lib/data/search/listing";
import {
  carSizes,
  compareMax,
  filterGroups,
  namedServices,
  popularServices,
  recentSearches,
  searchDisplayNames,
  searchLocation,
  sortOptions,
  toasts,
} from "@/lib/data/search/options";
import type { Provider, Service, ServiceSlug } from "@/lib/data/types";
import type { MapPoint, ResultPill, SearchResult, SearchScenario } from "@/lib/data/search/types";

const SLUGS: ServiceSlug[] = ["wash", "ppf", "tint", "polish", "nano-ceramic"];
const T = (ar: string, en: string) => ({ text_ar: ar, text_en: en });

// يقرأ ?services=a,b ويرجّع slugs صالحة بدون تكرار (فاضي = البحث الافتراضي: خدمتان)
export function parseServices(raw: string | string[] | undefined): ServiceSlug[] {
  const value = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  const list = value
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ServiceSlug => (SLUGS as string[]).includes(s));
  const unique = [...new Set(list)];
  return unique.length ? unique : [...defaultSearchServices];
}

const keyOf = (services: ServiceSlug[]) => [...services].sort().join("+");

// أماكن احتياطية على الخريطة لمقدّمي الخدمة اللي مالهمش دبوس في الفيجما
const fallbackPins: MapPoint[] = [
  { x: 520, y: 470 },
  { x: 300, y: 330 },
  { x: 640, y: 680 },
  { x: 230, y: 650 },
  { x: 470, y: 600 },
  { x: 700, y: 420 },
  { x: 380, y: 260 },
  { x: 560, y: 160 },
];

// نتيجة مبنية من providers.ts لتوليفة خدمات مالهاش فريم في الفيجما
function genericScenario(services: ServiceSlug[], allServices: Service[], providers: Provider[]): SearchScenario {
  const picked = services.map((s) => allServices.find((x) => x.slug === s)!).filter(Boolean);
  const namesAr = picked.map((s) => s.name_ar).join(" + ");
  const namesEn = picked.map((s) => s.name_en).join(" + ");
  const two = picked.length === 2;
  const matches = providers
    .filter((p) => services.some((s) => p.services.includes(s)))
    .map((p) => ({ p, covers: services.filter((s) => p.services.includes(s)) }))
    .sort((a, b) => b.covers.length - a.covers.length || a.p.distance_km - b.p.distance_km);
  const both = matches.filter((m) => m.covers.length === services.length).length;
  const results: SearchResult[] = matches.map(({ p, covers }, i) => {
    const coverAll = covers.length === services.length;
    const pills: ResultPill[] =
      two && coverAll ? [{ label_ar: "يقدّم الخدمتين", label_en: "Offers both", tone: "green", icon: "check" }] : [];
    const coveredServices = covers.map((s) => allServices.find((x) => x.slug === s)!);
    const chipLine = p.services.map((s) => allServices.find((x) => x.slug === s)!).filter(Boolean);
    return {
      provider: p.slug,
      tier: p.tier,
      show_certified: p.certified,
      rating: p.rating,
      reviews: null,
      distance_km: p.distance_km,
      branch: null,
      branches: p.branches,
      services_line: T(chipLine.map((s) => s.chip_ar).join(" · "), chipLine.map((s) => s.chip_en).join(" · ")),
      covers,
      pills,
      title: picked.length === 1 ? T(picked[0].name_ar, picked[0].name_en) : undefined,
      description: picked.length === 1 ? T(picked[0].description_ar, picked[0].description_en) : undefined,
      lines: coveredServices.map((s) => ({ name_ar: s.name_ar, name_en: s.name_en, service: s.slug, price: undefined })),
      specs: [],
      price: p.starting_price,
      similar: [],
      duration_hours: 0,
      duration: T("—", "—"),
      warranty_years: 0,
      warranty: T("—", "—"),
      offer: p.tag && p.tag.label_ar.includes("عروض") ? T(p.tag.label_ar, p.tag.label_en) : null,
      has_offer: !!p.tag && p.tag.label_ar.includes("عروض"),
      has_package: false,
      map: providersPage.pins[p.slug] ?? fallbackPins[i % fallbackPins.length],
      map_title: T(coveredServices.map((s) => s.name_ar).join(" + "), coveredServices.map((s) => s.name_en).join(" + ")),
      map_note: coverAll && two ? T("يقدّم الخدمتين معاً", "Offers both services") : T(p.short_name_ar, p.short_name_en),
      map_note_tone: coverAll && two ? "green" : "gray",
      map_price_label: T("يبدأ من", "From"),
    };
  });
  const min = results.length ? Math.min(...results.map((r) => r.price)) : 0;
  const fmt = new Intl.NumberFormat("en-US").format(min);
  return {
    services,
    generic: true,
    title: T(`${namesAr} في جدة`, `${namesEn} in Jeddah`),
    crumb: picked.length === 1 ? T(picked[0].name_ar, picked[0].name_en) : T("نتيجة البحث", "Search results"),
    description: picked.length === 1 ? T(picked[0].description_ar, picked[0].description_en) : two ? scenarios["nano-ceramic+polish"].description : T("", ""),
    tile: picked.length === 1 ? picked[0].slug : null,
    facts: results.length ? [{ icon: "price", label_ar: "الأسعار", label_en: "Prices", value_ar: `من ${fmt} ر.س`, value_en: `From SAR ${fmt}` }] : [],
    count: picked.length === 1 ? T(`${results.length} مقدّمي خدمة`, `${results.length} providers`) : T(`${results.length} نتائج`, `${results.length} results`),
    ai: null,
    results_title:
      picked.length === 1
        ? T(`مقدّمو خدمة ${picked[0].name_ar} قريباً منك`, `${picked[0].name_en} providers near you`)
        : two
          ? scenarios["nano-ceramic+polish"].results_title
          : T("", ""),
    size_hint: true,
    list: results.map((r) => r.provider),
    results,
    more_count: 0,
    alternatives: null,
    offers: null,
    compare_label: T(namesAr, namesEn),
    compare_label_map: T(namesAr, namesEn),
    compare_initial: [],
    map: {
      total: results.length,
      both,
      legend: scenarios["nano-ceramic"].map.legend,
      cluster: "",
      cluster_at: { x: 750, y: 150 },
      me: { x: 649, y: 369 },
      selected: results[0]?.provider ?? "",
      popup_at: { x: 190, y: 166 },
    },
  };
}

export async function getSearchScenario(services: ServiceSlug[]): Promise<SearchScenario> {
  const found = scenarios[keyOf(services)];
  if (found) return found;
  const [allServices, providers] = await Promise.all([getServices(), getProviders()]);
  return genericScenario(services, allServices, providers);
}

export async function getProvidersListing() {
  return providersPage;
}

export async function getSearchOptions() {
  return { sortOptions, filterGroups, compareMax, toasts, carSizes, location: searchLocation };
}

// بيانات لوحة البحث (W2-29) + أسماء العرض
export async function getSearchPanelData() {
  const [services, providers] = await Promise.all([getServices(), getProviders()]);
  return {
    services,
    providers: providers.map((p) => ({ ...p, ...(searchDisplayNames[p.slug] ?? {}) })),
    named: namedServices,
    recent: recentSearches,
    popular: popularServices,
    carSizes,
    location: searchLocation,
  };
}

export async function getSearchDisplayName(slug: string) {
  return searchDisplayNames[slug];
}
