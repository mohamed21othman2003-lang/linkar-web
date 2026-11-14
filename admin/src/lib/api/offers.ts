// العروض والباقات (القسم 11) — جوه تبويب «الخدمات والأسعار» في ملف المزوّد.
// المصدر: Figma CON5-07a العروض والباقات 3127:3263 · الباقات 3312:213706 · عرض جديد 3260:207383 · باقة جديدة 3260:207985
// · تفاصيل العرض 3312:197286 · تفاصيل الباقة 3312:213599. الأسعار من خدمات المزوّد نفسها (src/lib/api/services.ts) لكل فرع.
import { ApiError, delay } from "./errors";
import { providersApi } from "./providers";
import { branchesOf } from "./profile";
import { servicesApi, type BranchPrice, type Service, type SpecKey, type Tri } from "./services";
import { MOCK_NOW } from "./users";

// ───────────── القوائم (القسم 17) ─────────────
export const DISCOUNT_TYPES = [
  { value: "pct", label: "نسبة من سعر البيع" },
  { value: "fixed", label: "مبلغ ثابت" },
  { value: "free", label: "خدمة مجانية" },
] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number]["value"];
export const USAGE_LIMITS = ["حجز واحد لكل عميل", "حجز واحد لكل سيارة", "بدون حد"] as const;
/** «يظهر في» — الأول من التصميم والباقي من القائمة المرجعية */
export const APPEARS_IN = ["الموقع · التطبيق · صفحة العروض", "الموقع · التطبيق", "صفحة العروض فقط"] as const;
export const CUSTOM_PERIOD = "custom";

export type Funding = "linkar" | "provider";
export type OfferStatus = "scheduled" | "active" | "draft" | "paused" | "stopped";
export type Channels = { customers: boolean; b2b: boolean; marketers: boolean };

export interface Offer {
  id: string;
  providerId: string;
  /** اسم العرض للعملاء */
  name: string;
  discountType: DiscountType;
  /** النسبة أو المبلغ (0 للخدمة المجانية) */
  value: number;
  appearsIn: string;
  usageLimit: string;
  /** ISO yyyy-mm-dd */
  from: string;
  to: string;
  channels: Channels;
  funding: Funding;
  /** [] = كل الفروع المعتمدة */
  branchIds: string[];
  serviceIds: string[];
  status: OfferStatus;
  bookings: number;
  createdAt: string;
}
export type OfferInput = Omit<Offer, "id" | "providerId" | "status" | "bookings" | "createdAt">;

export interface PackageItem {
  serviceId: string;
  productId: string;
}
export interface Package {
  id: string;
  providerId: string;
  name: string;
  description: string;
  usageLimit: string;
  from: string;
  /** null = دائم */
  to: string | null;
  branchIds: string[];
  channels: Channels;
  items: PackageItem[];
  /** صيانة ومواصفات خاصة بالباقة (اختيارية — وإلا من الخدمات المشمولة) */
  reminder?: string;
  specs?: Partial<Record<SpecKey, string>>;
  /** سعر الباقة لكل فرع: تكلفة المزوّد وسعر البيع وسعر الوكالات (سيدان · متوسط · كبير) */
  prices: Record<string, BranchPrice>;
  status: OfferStatus;
  bookings: number;
  createdAt: string;
}
export type PackageInput = Omit<Package, "id" | "providerId" | "status" | "bookings" | "createdAt">;

/** صف في جدول «العروض والباقات» */
export interface OfferRow {
  id: string;
  kind: "offer" | "package";
  title: string;
  /** السطر الرمادي تحت العنوان: «لينكار · من هامش لينكار» / «باقة · …» */
  sub: string;
  branchLabel: string;
  period: string;
  bookings: number;
  status: OfferStatus;
}

/** عنصر من كتالوج الخدمات للنوافذ: المنتج الأول لكل خدمة + أسعاره لكل فرع */
export interface CatalogItem {
  serviceId: string;
  productId: string;
  serviceName: string;
  tier?: string;
  productName: string;
  category: string;
  /** «Johnson Ceramic Pro · بريميوم» */
  short: string;
  prices: Record<string, BranchPrice>;
  branchIds: string[];
}

// ───────────── حسابات ─────────────
/** الهامش بنسبة عشرية واحدة: «18%» · «17.5%» */
export const pctText = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
export const pctOf = (value: number, base: number) => (base ? Math.round((value / base) * 1000) / 10 : 0);

export function discounted(sale: number, type: DiscountType, value: number) {
  if (type === "free") return 0;
  if (type === "fixed") return Math.max(0, sale - value);
  return Math.round(sale * (1 - value / 100));
}
/** بعد العرض: سعر البيع الجديد والتكلفة (تنقص لو التمويل من المزوّد) وهامش لينكار */
export function afterOffer(price: { sale: number; cost: number }, o: Pick<Offer, "discountType" | "value" | "funding">) {
  const sale = discounted(price.sale, o.discountType, o.value);
  const off = price.sale - sale;
  const cost = o.funding === "provider" ? Math.max(0, price.cost - off) : price.cost;
  const margin = sale - cost;
  return { sale, cost, margin, pct: pctOf(margin, sale) };
}
export const discountText = (type: DiscountType, value: number) => (type === "free" ? "خدمة مجانية" : type === "fixed" ? `خصم ${value.toLocaleString("en-US")} ر.س` : `خصم ${value}%`);

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const dmy = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}/${m}/${y}`;
};
const parts = (iso: string) => iso.split("-").map(Number) as [number, number, number];
/** «1/11/2026 – 31/12/2026» (الجدول والدرج) */
export const offerPeriod = (from: string, to: string) => `${dmy(from)} – ${dmy(to)}`;
/** «1 – 31 ديسمبر 2026» (حقل الفترة في النافذة) */
export function periodLabel(from: string, to: string) {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  if (y1 === y2 && m1 === m2) return `${d1} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
  if (y1 === y2) return `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
  return `${d1} ${MONTHS[m1 - 1]} ${y1} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
}
export const longDate = (iso: string) => {
  const [y, m, d] = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
/** الباقة: «دائم» · «حتى 20 أكتوبر 2026» (الجدول) */
export const packagePeriod = (to: string | null) => (to ? `حتى ${longDate(to)}` : "دائم");
/** «من 1 نوفمبر 2026 · دائم» (حقل الفترة في نافذة الباقة) */
export const packagePeriodLabel = (from: string, to: string | null) => (to ? `${longDate(from)} – ${longDate(to)}` : `من ${longDate(from)} · دائم`);

/** «لينكار · من هامش لينكار» · «لينكار · للوكالات» · «باتفاق مع جونسون · سعر تكلفة أقل» */
export function sourceLine(o: Pick<Offer, "funding" | "channels">, short: string) {
  if (o.funding === "provider") return `باتفاق مع ${short} · سعر تكلفة أقل`;
  if (o.channels.b2b && !o.channels.customers && !o.channels.marketers) return "لينكار · للوكالات";
  return "لينكار · من هامش لينكار";
}
export const channelsLine = (c: Channels) => [c.customers && "العملاء", c.b2b && "الوكالات", c.marketers && "المسوّقون"].filter(Boolean).join(" · ") || "—";

// ───────────── البيانات التجريبية ─────────────
const JN_CH = { customers: true, b2b: false, marketers: true };
const OFFERS: Offer[] = [
  {
    id: "jn-o1",
    providerId: "lk-jn-001",
    name: "عرض الشتاء · خصم 10% نانو سيراميك",
    discountType: "pct",
    value: 10,
    appearsIn: APPEARS_IN[0],
    usageLimit: USAGE_LIMITS[0],
    from: "2026-11-01",
    to: "2026-12-31",
    channels: { ...JN_CH },
    funding: "linkar",
    branchIds: [],
    serviceIds: ["jn-s1"],
    status: "scheduled",
    bookings: 0,
    createdAt: "2026-10-10",
  },
  {
    id: "jn-o2",
    providerId: "lk-jn-001",
    name: "خصم 5% للوكالات · Johnson Ceramic Pro",
    discountType: "pct",
    value: 5,
    appearsIn: APPEARS_IN[1],
    usageLimit: USAGE_LIMITS[2],
    from: "2026-10-01",
    to: "2026-12-31",
    channels: { customers: false, b2b: true, marketers: false },
    funding: "linkar",
    branchIds: [],
    serviceIds: ["jn-s1"],
    status: "active",
    bookings: 1,
    createdAt: "2026-09-28",
  },
  {
    id: "jn-o3",
    providerId: "lk-jn-001",
    name: "خصم 10% تفصيل داخلي كامل",
    discountType: "pct",
    value: 10,
    appearsIn: APPEARS_IN[0],
    usageLimit: USAGE_LIMITS[0],
    from: "2026-10-15",
    to: "2026-10-31",
    channels: { ...JN_CH },
    funding: "provider",
    branchIds: [],
    serviceIds: ["jn-s4"],
    status: "scheduled",
    bookings: 0,
    createdAt: "2026-10-09",
  },
  {
    id: "jn-o4",
    providerId: "lk-jn-001",
    name: "عرض اليوم الوطني · خصم 20% PPF",
    discountType: "pct",
    value: 20,
    appearsIn: APPEARS_IN[0],
    usageLimit: USAGE_LIMITS[0],
    from: "2026-09-16",
    to: "2026-09-30",
    channels: { customers: true, b2b: true, marketers: true },
    funding: "linkar",
    branchIds: [],
    serviceIds: ["jn-s2"],
    status: "active",
    bookings: 78,
    createdAt: "2026-09-01",
  },
];
const tri = (a: number, b: number, c: number): Tri => [a, b, c];
const JN_BRANCHES = ["lk-jn-zh-001", "lk-jn-hm-002", "lk-jn-mh-003"];
const samePrice = (p: BranchPrice) => Object.fromEntries(JN_BRANCHES.map((b) => [b, structuredClone(p)]));
const PACKAGES: Package[] = [
  {
    id: "jn-pk1",
    providerId: "lk-jn-001",
    name: "باقة النانو والتلميع",
    description: "نانو سيراميك بريميوم مع تلميع ثلاث مراحل في زيارة واحدة",
    usageLimit: USAGE_LIMITS[1],
    from: "2026-09-01",
    to: null,
    branchIds: [],
    channels: { customers: true, b2b: true, marketers: false },
    items: [
      { serviceId: "jn-s1", productId: "jn-s1-p1" },
      { serviceId: "jn-s5", productId: "jn-s5-p1" },
    ],
    prices: samePrice({ cost: tri(1700, 1980, 2240), sale: tri(2099, 2449, 2799), b2b: tri(1920, 2240, 2560) }),
    status: "active",
    bookings: 1,
    createdAt: "2026-08-28",
  },
  {
    id: "jn-pk2",
    providerId: "lk-jn-001",
    name: "باقة العناية الكاملة",
    description: "طبقة طاردة للماء مع تلميع وتفصيل داخلي كامل في زيارة واحدة",
    usageLimit: USAGE_LIMITS[0],
    from: "2026-09-20",
    to: "2026-10-20",
    branchIds: [],
    channels: JN_CH,
    items: [
      { serviceId: "jn-s3", productId: "jn-s3-p1" },
      { serviceId: "jn-s4", productId: "jn-s4-p1" },
    ],
    reminder: "كل 12 شهراً · قبل الموعد بأسبوع",
    specs: { finish: "لامع", prep: "تصحيح خفيف" },
    prices: samePrice({ cost: tri(1240, 1400, 1560), sale: tri(1499, 1699, 1899), b2b: tri(1370, 1550, 1730) }),
    status: "active",
    bookings: 2,
    createdAt: "2026-09-15",
  },
];

let offers: Offer[] = structuredClone(OFFERS);
let packages: Package[] = structuredClone(PACKAGES);
const clone = <T>(v: T): T => structuredClone(v);
const today = () => MOCK_NOW.toISOString().slice(0, 10);

async function approvedBranches(providerId: string) {
  const p = await providersApi.get(providerId);
  return { p, approved: branchesOf(p).filter((b) => b.status === "approved") };
}
function branchLabel(ids: string[], approved: { id: string; name: string }[]) {
  if (!ids.length || ids.length >= approved.length) return "كل الفروع";
  return ids.map((id) => `فرع ${approved.find((b) => b.id === id)?.name ?? id}`).join(" · ");
}

/** كل خدمات المزوّد (كل الفروع) — من نفس مخزن الخدمات */
async function allServices(providerId: string): Promise<Service[]> {
  const { approved } = await approvedBranches(providerId);
  const lists = await Promise.all((approved.length ? approved : [{ id: "" }]).map((b) => servicesApi.list(providerId, { branch: b.id })));
  const seen = new Map<string, Service>();
  for (const l of lists) for (const s of l.items) if (!seen.has(s.id)) seen.set(s.id, s);
  return [...seen.values()];
}
const toCatalog = (s: Service): CatalogItem => {
  const p = s.products[0];
  return {
    serviceId: s.id,
    productId: p?.id ?? "",
    serviceName: s.name,
    tier: p?.tier,
    productName: p?.name ?? "",
    category: s.category,
    short: `${s.name}${p?.tier ? ` · ${p.tier}` : ""}`,
    prices: p?.prices ?? {},
    branchIds: s.branchIds,
  };
};

/** عدد العملاء المهتمين حسب تصنيف الخدمة (إشعار العملاء) */
const AUDIENCE: Record<string, [string, number]> = {
  "حماية PPF": ["المهتمون بالحماية", 3912],
  "نانو سيراميك": ["المهتمون بالحماية", 3912],
  التظليل: ["المهتمون بالتظليل", 2140],
  التلميع: ["المهتمون بالتلميع", 2685],
  "الغسيل والتنظيف": ["المهتمون بالغسيل", 5230],
  "تغيير اللون": ["المهتمون بتغيير اللون", 860],
};

function find<T extends { id: string }>(list: T[], id: string) {
  const x = list.find((o) => o.id === id);
  if (!x) throw new ApiError(404, "not found");
  return x;
}

export const offersApi = {
  /** GET /providers/:id/offers?kind=offers|packages — صفوف الجدول */
  list: async (providerId: string, kind: "offers" | "packages") => {
    const { p, approved } = await approvedBranches(providerId);
    const short = p.short ?? p.name;
    const svcs = kind === "packages" ? await allServices(providerId) : [];
    const name = (id: string) => {
      const s = svcs.find((x) => x.id === id);
      return s ? `${s.name}${s.products[0]?.tier ? ` · ${s.products[0].tier}` : ""}` : "";
    };
    const items: OfferRow[] =
      kind === "offers"
        ? offers
            .filter((o) => o.providerId === providerId)
            .map((o) => ({
              id: o.id,
              kind: "offer" as const,
              title: o.name,
              sub: sourceLine(o, short),
              branchLabel: branchLabel(o.branchIds, approved),
              period: offerPeriod(o.from, o.to),
              bookings: o.bookings,
              status: o.status,
            }))
        : packages
            .filter((x) => x.providerId === providerId)
            .map((x) => ({
              id: x.id,
              kind: "package" as const,
              title: x.name,
              sub: `باقة · ${x.items.map((i) => name(i.serviceId)).filter(Boolean).join(" + ")}`,
              branchLabel: branchLabel(x.branchIds, approved),
              period: packagePeriod(x.to),
              bookings: x.bookings,
              status: x.status,
            }));
    return delay({ items: clone(items), total: items.length, counts: { offers: offers.filter((o) => o.providerId === providerId).length, packages: packages.filter((x) => x.providerId === providerId).length } });
  },
  /** كتالوج خدمات المزوّد للنوافذ (المنتج الأول لكل خدمة بأسعار كل فرع) */
  catalog: async (providerId: string) => delay((await allServices(providerId)).filter((s) => s.status !== "draft").map(toCatalog), 120),
  audience: async (serviceIds: string[], services: CatalogItem[]) => {
    const cats = serviceIds.map((id) => services.find((s) => s.serviceId === id)?.category).filter(Boolean) as string[];
    const a = AUDIENCE[cats[0] ?? ""];
    return delay(a ? { label: a[0], count: a[1] } : null, 60);
  },
  getOffer: async (id: string) => delay(clone(find(offers, id)), 150),
  getPackage: async (id: string) => delay(clone(find(packages, id)), 150),
  /** POST /providers/:id/offers — «جدولة العرض» (scheduled) أو «حفظ كمسودة» (draft).
   *  لو هامش لينكار بعد العرض أقل من 15% النشر محتاج صلاحية حساسة (428 → رمز التحقق). */
  createOffer: async (providerId: string, v: OfferInput, schedule: boolean, opts: { lowMargin?: boolean; otp?: string } = {}) => {
    if (schedule && opts.lowMargin && !opts.otp) throw new ApiError(428, "otp required");
    if (opts.otp && opts.otp !== "482913") throw new ApiError(422, "", { otp: "الرمز غير صحيح" });
    const o: Offer = { ...clone(v), id: `${providerId}-o${Date.now().toString(36)}`, providerId, status: schedule ? "scheduled" : "draft", bookings: 0, createdAt: today() };
    offers = [o, ...offers];
    return delay({ id: o.id, name: o.name });
  },
  updateOffer: async (id: string, v: OfferInput, opts: { lowMargin?: boolean; otp?: string } = {}) => {
    const o = find(offers, id);
    if (opts.lowMargin && o.status !== "draft" && !opts.otp) throw new ApiError(428, "otp required");
    if (opts.otp && opts.otp !== "482913") throw new ApiError(422, "", { otp: "الرمز غير صحيح" });
    Object.assign(o, clone(v));
    return delay({ ok: true, name: o.name });
  },
  createPackage: async (providerId: string, v: PackageInput, schedule: boolean) => {
    const x: Package = { ...clone(v), id: `${providerId}-pk${Date.now().toString(36)}`, providerId, status: schedule ? "scheduled" : "draft", bookings: 0, createdAt: today() };
    packages = [x, ...packages];
    return delay({ id: x.id, name: x.name });
  },
  updatePackage: async (id: string, v: PackageInput) => {
    const x = find(packages, id);
    Object.assign(x, clone(v));
    return delay({ ok: true, name: x.name });
  },
  /** إيقاف مؤقت ↔ إعادة تفعيل */
  setPaused: async (kind: "offer" | "package", id: string, paused: boolean) => {
    const x = kind === "offer" ? find(offers, id) : find(packages, id);
    x.status = paused ? "paused" : x.from > today() ? "scheduled" : "active";
    return delay({ ok: true, name: x.name });
  },
  /** إيقاف دائم للعرض — يختفي من الموقع والتطبيق ويبقى في السجل */
  stopOffer: async (id: string) => {
    const o = find(offers, id);
    o.status = "stopped";
    return delay({ ok: true, name: o.name });
  },
  removePackage: async (id: string) => {
    const x = find(packages, id);
    packages = packages.filter((p) => p.id !== id);
    return delay({ ok: true, name: x.name });
  },
};
