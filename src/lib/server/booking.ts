// طبقة بيانات الحجز (W2-33 … W2-39). بتحوّل الـquery string المشترك لحجز كامل:
// مقدّم الخدمة + البنود والأسعار + الفروع + السيارة + كود المسوّق + النقاط.
import { bookingItems, providerDisplay } from "@/lib/data/booking/catalog";
import { branches as allBranches, mapAlternatives, mapMe } from "@/lib/data/booking/branches";
import {
  carCatalog,
  completedBookings,
  confirmations,
  loginDemo,
  paymentMethods,
  pointsRule,
  referralCar,
  savedInstruments,
  userCars,
} from "@/lib/data/booking/checkout";
import type { Branch, Car, CarSize, Marketer, ProviderDisplay } from "@/lib/data/booking/types";
import { marketers } from "@/lib/data/provider-details";
import { offers } from "@/lib/data/offers/offers";
import { packages } from "@/lib/data/packages/packages";
import type { DemoUser, Provider, ServiceSlug } from "@/lib/data/types";
import { notFound, redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { getProvider, getServices } from "@/lib/server/content";
import { getProviderDetail } from "@/lib/server/providers";
import type { BookingQuery } from "@/components/booking/query";
import { computeTotals, pointsValue } from "@/components/booking/pricing";

// الحجز التجريبي في الفيجما لما الصفحة تتفتح من غير بارامترات
export const DEMO_QUERY: BookingQuery = { provider: "johnson", services: ["interior-detailing"], packages: ["johnson-ceramic-pro"] };

const SERVICE_SLUGS: ServiceSlug[] = ["wash", "ppf", "tint", "polish", "nano-ceramic"];

export function withDisplay(provider: Provider, display?: ProviderDisplay): Provider {
  const d = { ...providerDisplay[provider.slug], ...display };
  return {
    ...provider,
    name_ar: d.name_ar ?? provider.name_ar,
    name_en: d.name_en ?? provider.name_en,
    rating: d.rating ?? provider.rating,
    distance_km: d.distance_km ?? provider.distance_km,
    branches: d.branches ?? provider.branches,
  };
}

export type BookingLine = {
  key: string;
  name_ar: string;
  name_en: string;
  chip_ar: string;
  chip_en: string;
  service: ServiceSlug;
  price: number;
};

export type ResolvedBooking = {
  query: BookingQuery; // بعد التطبيع (provider + branch + car)
  provider: Provider; // باسم العرض في الحجز («جونسون Johnson»)
  lines: BookingLine[];
  subtotal: number;
  size: CarSize; // حجم السيارة اللي الأسعار محسوبة عليه
  branches: Branch[];
  branch: Branch;
  cars: Car[];
  car: Car | null;
  marketer: (Marketer & { eligible: boolean }) | null;
  pointsAvailable: number; // نقاط العميل
  pointsSar: number; // قيمتها بالريال على هذا الحجز
  serviceSlugs: ServiceSlug[];
};

function placeholderBranch(p: Provider): Branch {
  return {
    id: `${p.slug}-main`,
    provider: p.slug,
    name_ar: "[الفرع الرئيسي]",
    name_en: "[Main branch]",
    street_ar: "[العنوان]",
    street_en: "[Address]",
    district_ar: "",
    district_en: "",
    city_ar: "جدة",
    city_en: "Jeddah",
    hours_ar: "",
    hours_en: "",
    distance_km: p.distance_km,
    map: { x: 58, y: 38 },
    phone: "",
    placeholder: true,
  };
}

export async function getBranches(provider: Provider): Promise<Branch[]> {
  const list = allBranches.filter((b) => b.provider === provider.slug).sort((a, b) => a.distance_km - b.distance_km);
  return list.length ? list : [placeholderBranch(provider)];
}

export async function getCars(user: DemoUser | null, ref?: string): Promise<Car[]> {
  const cars = user && !user.is_new ? [...userCars] : [];
  if (ref) cars.push(referralCar);
  return cars;
}

// سيارة مضافة من «أضف سيارة أخرى» (P-24) قبل ما تتحفظ في الحساب: car=custom~الشركة~الموديل~السنة~الحجم
function parseCustomCar(id?: string): Car | null {
  if (!id?.startsWith("custom~")) return null;
  const [, make, model, year, size] = id.split("~");
  const sz = (["sedan", "suv", "large"] as const).find((x) => x === size) ?? "sedan";
  return { id, make_ar: make, make_en: make, model_ar: model, model_en: model, year: Number(year) || 0, size: sz, color_ar: "", color_en: "", plate_ar: "", plate_en: "" };
}

export async function resolveBooking(input: BookingQuery, user: DemoUser | null): Promise<ResolvedBooking | null> {
  const empty = !input.provider && !input.packages?.length && !input.offer;
  const q: BookingQuery = empty ? { ...DEMO_QUERY, ref: input.ref, size: input.size, branch: input.branch, car: input.car } : { ...input };

  const pkgs = (q.packages ?? []).map((slug) => packages.find((p) => p.slug === slug)).filter((p): p is (typeof packages)[number] => !!p);
  const offer = q.offer ? offers.find((o) => o.id === q.offer) : undefined;
  const providerSlug = q.provider ?? pkgs[0]?.provider ?? offer?.provider;
  if (!providerSlug) return null;
  const base = await getProvider(providerSlug);
  if (!base) return null;
  const provider = withDisplay(base);
  q.provider = provider.slug;

  // السيارة أولاً لأن السعر حسب حجمها (&car=… ثم &size=… ثم السيارة الافتراضية)
  const cars = await getCars(user, q.ref);
  const custom = parseCustomCar(q.car);
  if (custom) cars.push(custom);
  const picked = cars.find((c) => c.id === q.car);
  const car = picked ?? (q.ref && !user ? referralCar : undefined) ?? cars.find((c) => c.is_default) ?? cars[0] ?? null;
  const size: CarSize = picked?.size ?? (q.size as CarSize | undefined) ?? car?.size ?? "sedan";

  const services = await getServices();
  const detail = (await getProviderDetail(provider.slug))?.detail;
  const categoryChip = (slug: ServiceSlug) => services.find((s) => s.slug === slug);
  const lines: BookingLine[] = [];
  for (const pkg of pkgs.filter((p) => p.provider === provider.slug)) {
    const svc = categoryChip(pkg.main_service);
    lines.push({
      key: `package:${pkg.slug}`,
      name_ar: pkg.line_name_ar,
      name_en: pkg.line_name_en,
      chip_ar: svc?.name_ar ?? "",
      chip_en: svc?.name_en ?? "",
      service: pkg.main_service,
      price: pkg.price,
    });
  }
  if (offer && offer.provider === provider.slug) {
    const svc = categoryChip(offer.services[0]);
    lines.push({
      key: `offer:${offer.id}`,
      name_ar: [offer.title_line1_ar, offer.title_line2_ar].filter(Boolean).join(" "),
      name_en: [offer.title_line1_en, offer.title_line2_en].filter(Boolean).join(" "),
      chip_ar: svc?.name_ar ?? "",
      chip_en: svc?.name_en ?? "",
      service: offer.services[0],
      price: offer.price,
    });
  }
  for (const token of q.services ?? []) {
    // خدمة مضمّنة في باقة مختارة (johnson-ceramic-pro خدمة وباقة في نفس الوقت) ← ما تتحسبش مرتين
    if (pkgs.some((p) => p.slug === token)) continue;
    // أسعار المزوّد من بيانات صفحة المزوّد (W2-21 / W2-32) حسب حجم السيارة
    const ps = detail?.services.find((s) => s.slug === token) ?? (SERVICE_SLUGS.includes(token as ServiceSlug) ? detail?.services.find((s) => s.category === token) : undefined);
    const override = bookingItems.find((i) => i.provider === provider.slug && (i.id === token || i.id === ps?.slug));
    if (ps) {
      const svc = categoryChip(ps.category);
      lines.push({
        key: ps.slug,
        name_ar: ps.name_ar,
        name_en: ps.name_en,
        chip_ar: override?.chip_ar ?? svc?.name_ar ?? "",
        chip_en: override?.chip_en ?? svc?.name_en ?? "",
        service: ps.category,
        price: ps.prices[size],
      });
      continue;
    }
    if (override) {
      lines.push({ key: override.id, name_ar: override.name_ar, name_en: override.name_en, chip_ar: override.chip_ar, chip_en: override.chip_en, service: override.service, price: override.price });
      continue;
    }
    const svc = categoryChip(token as ServiceSlug);
    // خدمة عامة من غير سعر عند المزوّد ← «يبدأ من» سعر المركز (placeholder). أي slug غير معروف بيتجاهل.
    if (svc) lines.push({ key: svc.slug, name_ar: svc.name_ar, name_en: svc.name_en, chip_ar: svc.chip_ar, chip_en: svc.chip_en, service: svc.slug, price: provider.starting_price });
  }
  const unique = lines.filter((l, i) => lines.findIndex((x) => x.key === l.key) === i);
  if (!unique.length) return null;
  const subtotal = unique.reduce((s, l) => s + l.price, 0);

  const branches = await getBranches(provider);
  const branch = branches.find((b) => b.id === q.branch) ?? branches[0];

  // كود المسوّق: &ref=SM123 أو SM123-300 (بيانات المسوّقين من lib/data/provider-details)
  const ref = q.ref?.toLowerCase();
  const m = ref ? marketers.find((x) => x.code.toLowerCase() === ref || x.voucher_code.toLowerCase() === ref) : undefined;
  const marketer = m ? { code: m.voucher_code, name_ar: m.name_ar, name_en: m.name_en, credit: m.credit, min_total: m.min_total, eligible: subtotal >= m.min_total } : null;
  const pointsAvailable = user?.points ?? 0;

  return {
    query: q,
    provider,
    lines: unique,
    subtotal,
    size,
    branches,
    branch,
    cars,
    car,
    marketer,
    pointsAvailable,
    pointsSar: pointsValue(pointsAvailable, subtotal, pointsRule),
    serviceSlugs: [...new Set(unique.map((l) => l.service))],
  };
}

export function bookingTotals(b: ResolvedBooking, usePoints: boolean) {
  return computeTotals({
    subtotal: b.subtotal,
    points: usePoints ? b.pointsSar : 0,
    marketerCredit: b.marketer?.eligible ? b.marketer.credit : 0,
  });
}

export async function getMapData() {
  const alts = [];
  for (const a of mapAlternatives) {
    const p = await getProvider(a.provider);
    if (p) alts.push({ ...a, provider: p });
  }
  return { me: mapMe, alternatives: alts };
}

export async function getPaymentMethods() {
  return paymentMethods;
}

export async function getCheckoutConfig() {
  return {
    pointsRule,
    savedInstruments,
    carCatalog,
    loginDemo,
    marketers: marketers.map<Marketer>((m) => ({ code: m.voucher_code, name_ar: m.name_ar, name_en: m.name_en, credit: m.credit, min_total: m.min_total })),
  };
}

export async function getConfirmation(referral: boolean) {
  return referral ? confirmations.referral : confirmations.standard;
}

export async function getCompletedBooking(id?: string) {
  const b = completedBookings.find((x) => x.id === id) ?? completedBookings[0];
  const provider = await getProvider(b.provider);
  return provider ? { booking: b, provider } : null;
}

// سيارات «سيارتك» في كارت الحجز (W2-42 · P-15): سيارات العميل، والزائر يشوف السيارة الافتراضية من الفيجما
export async function getDisplayCars(user: DemoUser | null): Promise<Car[]> {
  const own = await getCars(user);
  return own.length ? own : userCars.filter((c) => c.is_default);
}

// حجز ناقص/غير معروف (slug خدمة غلط مثلاً): يرجع لصفحة المزوّد لو موجود، وإلا 404 — من غير ما الفلو يقع
export async function missingBooking(q: BookingQuery): Promise<never> {
  const p = q.provider ? await getProvider(q.provider) : undefined;
  if (p) redirect(routes.provider(p.slug));
  notFound();
}
