// الخدمات والأسعار (القسم 10) — خدمات المزوّد بمنتجاتها وأسعارها لكل فرع.
// المصدر: Figma CON5-07a الخدمات والأسعار 3114:50957 (والفروع 3400:231034 / 3400:231438) · CON5-07D تفاصيل الخدمة 3260:251028
// · CON5-07M إضافة خدمة 3260:206684 · تعديل الخدمة 3260:243268 · إيقاف 3260:250488 · إخفاء 3114:49824 · حذف 3260:250535.
// قواعد التسعير (القسم 2.4): الهامش = البيع − التكلفة · النسبة = round(الهامش/البيع×100, 1) · قبل الضريبة = round(السعر/1.15, 2).
// الخادم هو المرجع في الحساب — الدوال هنا بنفس القاعدة للعرض الفوري.
import { ApiError, delay } from "./errors";
import { branchesOf, usersOf } from "./profile";
import { providersApi } from "./providers";

// ───────────── القوائم (القسم 17) ─────────────
export const SERVICE_SORTS = [
  { value: "popular", label: "الأكثر طلباً" },
  { value: "newest", label: "الأحدث" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "price-asc", label: "السعر: من الأقل" },
] as const;
export const SERVICE_STATUS_FILTERS = [
  { value: "", label: "منشورة وموقوفة" },
  { value: "published", label: "منشورة" },
  { value: "paused", label: "موقوفة" },
] as const;
export const WARRANTY_FILTERS = [
  { value: "", label: "الكل" },
  { value: "none", label: "بدون ضمان" },
  { value: "upto2", label: "حتى سنتين" },
  { value: "3-5", label: "‏3 – 5 سنوات" },
  { value: "gt5", label: "أكثر من 5 سنوات" },
] as const;
export const CHANNEL_FILTERS = [
  { value: "", label: "الكل" },
  { value: "customers", label: "العملاء · الموقع والتطبيق" },
  { value: "b2b", label: "الوكالات" },
  { value: "marketers", label: "المسوّقون" },
] as const;
export const PRICE_FILTERS = [
  { value: "", label: "الكل" },
  { value: "lt500", label: "أقل من 500 ر.س" },
  { value: "500-1500", label: "‏500 – 1,500 ر.س" },
  { value: "gt1500", label: "أكثر من 1,500 ر.س" },
] as const;

export const DURATIONS = ["يوم واحد · 6 – 8 ساعات", "يومان · 12 – 14 ساعة عمل"] as const;
export const WARRANTY_YEARS = [2, 5, 9, 10] as const;
export const WARRANTY_BY = ["المركز · ضمان ورقي", "الشركة المصنّعة · ضمان ورقي"] as const;
export const REMINDERS = ["بدون تذكير", "كل 6 أشهر · قبل الموعد بأسبوع", "كل 12 شهراً · قبل الموعد بأسبوع"] as const;
export const HIDE_REASONS = ["مخالفة معايير الخدمة", "مستندات منتهية", "شكاوى متكررة", "طلب المنشأة", "متأخرات مالية"] as const;
export const SERVICE_PAUSE_REASONS = ["نفاد المنتج المعتمد", "مستندات منتهية", "شكاوى متكررة", "طلب المنشأة", "متأخرات مالية"] as const;

/** الوسوم الجاهزة في النموذج بنفس ترتيب Figma (من اليمين) — والمستخدم يقدر يضيف وسم جديد */
export const TAGS = {
  features: ["لمعان عالٍ", "طارد للماء والأتربة", "مقاوم للخدوش الخفيفة", "حماية من الأشعة فوق البنفسجية", "سهولة الغسيل", "مقاوم للمواد الكيميائية"],
  includes: ["غسيل وإزالة ملوثات", "تصحيح خفيف", "تصحيح طلاء مرحلتين", "طبقتان على الهيكل", "3 طبقات على الهيكل", "طبقة للجنوط", "طبقة للزجاج الأمامي", "فحص بالإضاءة"],
  covers: ["تقشّر الطبقة", "فقدان اللمعان", "الاصفرار والبهتان", "بقع الماء الدائمة"],
  terms: ["صيانة كل 12 شهراً في نفس المركز", "صيانة كل 6 أشهر في نفس المركز"],
} as const;

/** المنتجات المعتمدة (القائمة 17 «المنتج المعتمد») ومواصفاتها — المواصفات تتعبّى تلقائياً من المنتج */
export type SpecKey = "layers" | "company" | "approved" | "finish" | "thickness" | "hardness" | "prep" | "cure";
export const SPEC_LABELS: Record<SpecKey, string> = {
  layers: "عدد الطبقات على الهيكل",
  company: "الشركة · المنشأ",
  approved: "المنتج المعتمد",
  finish: "نوع التشطيب",
  thickness: "سماكة الطبقة (ميكرون)",
  hardness: "الصلابة",
  prep: "التحضير",
  cure: "المعالجة قبل أول غسيل",
};
export const APPROVED_PRODUCTS: {
  name: string;
  company: string;
  cert: string;
  specs: Partial<Record<SpecKey, string>>;
}[] = [
  {
    name: "Ceramic Pro 9H",
    company: "‏Ceramic Pro · الولايات المتحدة",
    cert: "شهادة اعتماد المنتج CP-SA-2026-114 · سارية حتى ديسمبر 2027",
    specs: { finish: "لامع", hardness: "9H", cure: "7 أيام" },
  },
  {
    name: "GYEON Q² Mohs",
    company: "‏GYEON · كوريا الجنوبية",
    cert: "شهادة اعتماد المنتج GY-SA-2026-087 · سارية حتى يونيو 2027",
    specs: { finish: "لامع", hardness: "9H", cure: "7 أيام" },
  },
  {
    name: "Nano Shield 9H",
    company: "‏Nano Shield · ألمانيا",
    cert: "شهادة اعتماد المنتج NS-SA-2026-052 · سارية حتى مارس 2027",
    specs: { finish: "لامع", hardness: "9H", cure: "5 أيام" },
  },
];

// ───────────── الأنواع ─────────────
/** سيدان · SUV متوسط · SUV كبير */
export type Tri = [number, number, number];
export type BranchPrice = { cost: Tri; sale: Tri; b2b: Tri };
export const SIZE_LABELS = ["سيدان", "‏SUV متوسط", "‏SUV كبير"] as const;

export interface ServiceProduct {
  id: string;
  /** المنتج المعتمد («Ceramic Pro 9H») */
  name: string;
  /** الفئة داخل الخدمة («بريميوم» · «أساسي») */
  tier?: string;
  description: string;
  features: string[];
  includes: string[];
  photos: number;
  specs: Record<SpecKey, string>;
  extraSpecs: { label: string; value: string }[];
  showAllSpecs: boolean;
  warrantyBy: string;
  /** 0 = بدون ضمان */
  warrantyYears: number;
  covers: string[];
  terms: string[];
  notCovered: string;
  linkarCert: boolean;
  consent: boolean;
  reminder: string;
  /** السعر لكل فرع (مفتاحه id الفرع) */
  prices: Record<string, BranchPrice>;
}

export type ServiceStatus = "published" | "paused" | "hidden" | "draft";

export interface Service {
  id: string;
  providerId: string;
  /** S1 · S2 … */
  code: string;
  name: string;
  category: string;
  status: ServiceStatus;
  branchIds: string[];
  products: ServiceProduct[];
  duration: string;
  channels: {
    customers: boolean;
    b2b: boolean;
    marketers: boolean;
    marketerPct: number;
  };
  /** ظهور الأسعار لمستخدمي مقدّم الخدمة */
  visibility: Record<string, { sale: boolean; cost: boolean }>;
  /** «الفروع» تحت ظهور الأسعار */
  visibilityBranchIds: string[];
  popularity: number;
  createdAt: string;
  pausedUntil?: string;
}

export type ServiceInput = Omit<Service, "id" | "providerId" | "code" | "status" | "popularity" | "createdAt" | "pausedUntil">;

/** صف الجدول: الأسعار والهامش للفرع المختار من المنتج الأول */
export interface ServiceRow extends Service {
  cost: Tri | null;
  sale: Tri | null;
  marginPct: number | null;
  warrantyLabel: string;
  durationShort: string;
  typeLabel: string;
}

export type ServiceQuery = {
  branch?: string;
  price?: string;
  status?: string;
  warranty?: string;
  channel?: string;
  sort?: string;
  view?: "all" | "services" | "paused";
};

// ───────────── التسعير (القسم 2.4) ─────────────
export const marginOf = (sale: number, cost: number) => ({
  value: sale - cost,
  pct: sale ? Math.round(((sale - cost) / sale) * 1000) / 10 : 0,
});
export const beforeVatOf = (price: number) => Math.round((price / 1.15) * 100) / 100;
/** «2 سنوات» → «سنتان» · 0 → «—» */
export const warrantyLabel = (y: number) => (!y ? "—" : y === 1 ? "سنة" : y === 2 ? "سنتان" : y <= 10 ? `${y} سنوات` : `${y} سنة`);

// ───────────── البيانات (جونسون · CON5-07a 3114:50957) ─────────────
const JN = ["lk-jn-zh-001", "lk-jn-hm-002", "lk-jn-mh-003"];
const same = (p: BranchPrice, ids = JN) => Object.fromEntries(ids.map((id) => [id, structuredClone(p)]));
const NANO_DESC = "طلاء نانو سيراميك 9H بطبقتين وطبقة طاردة للماء، يحمي الطلاء ويمنح لمعاناً يدوم.";
const NOT_COVERED = "الحوادث والصدمات، والغسيل بمواد كاشطة أو فرش آلية، وعدم الالتزام بموعد الصيانة.";
const ALL_ON = (users: string[], off: Record<string, Partial<{ sale: boolean; cost: boolean }>> = {}) => Object.fromEntries(users.map((u) => [u, { sale: true, cost: true, ...(off[u] ?? {}) }]));
const JN_USERS = ["u-fahd", "u-khalid", "u-abdullah", "u-yasser", "u-majed", "u-faisal", "u-sultan"];
const JN_VIS = ALL_ON(JN_USERS, {
  "u-majed": { cost: false },
  "u-faisal": { cost: false },
  "u-sultan": { sale: false, cost: false },
});

const product = (p: Partial<ServiceProduct> & Pick<ServiceProduct, "id" | "name" | "prices">): ServiceProduct => ({
  description: "",
  features: [],
  includes: [],
  photos: 0,
  specs: {
    layers: "",
    company: "",
    approved: p.name,
    finish: "",
    thickness: "",
    hardness: "",
    prep: "",
    cure: "",
  },
  extraSpecs: [],
  showAllSpecs: true,
  warrantyBy: WARRANTY_BY[0],
  warrantyYears: 0,
  covers: [],
  terms: [],
  notCovered: "",
  linkarCert: false,
  consent: false,
  reminder: REMINDERS[0],
  ...p,
});
const nanoSpecs = (layers: string, thickness: string, prep: string): Record<SpecKey, string> => ({
  layers,
  company: "‏Ceramic Pro · الولايات المتحدة",
  approved: "Ceramic Pro 9H",
  finish: "لامع",
  thickness,
  hardness: "9H",
  prep,
  cure: "7 أيام",
});
const simple = (id: string, name: string, cost: Tri, sale: Tri, b2b: Tri, warrantyYears: number, extra: Partial<ServiceProduct> = {}) =>
  product({
    id,
    name,
    warrantyYears,
    prices: same({ cost, sale, b2b }),
    ...extra,
  });
const svc = (s: Partial<Service> & Pick<Service, "id" | "code" | "name" | "category" | "products" | "duration" | "popularity" | "createdAt">): Service => ({
  providerId: "lk-jn-001",
  status: "published",
  branchIds: [...JN],
  channels: { customers: true, b2b: true, marketers: true, marketerPct: 5 },
  visibility: structuredClone(JN_VIS),
  visibilityBranchIds: [...JN],
  ...s,
});

const SEED: Service[] = [
  svc({
    id: "jn-s1",
    code: "S1",
    name: "Johnson Ceramic Pro",
    category: "نانو سيراميك",
    duration: DURATIONS[0],
    popularity: 412,
    createdAt: "2026-02-12",
    products: [
      product({
        id: "jn-s1-p1",
        name: "Ceramic Pro 9H",
        tier: "بريميوم",
        description: NANO_DESC,
        features: [...TAGS.features.slice(0, 5)],
        includes: ["غسيل وإزالة ملوثات", "تصحيح خفيف", "طبقتان على الهيكل", "فحص بالإضاءة"],
        photos: 4,
        specs: nanoSpecs("2", "2 – 3", "تصحيح خفيف"),
        warrantyYears: 9,
        covers: [...TAGS.covers],
        terms: ["صيانة كل 12 شهراً في نفس المركز"],
        notCovered: NOT_COVERED,
        linkarCert: true,
        consent: true,
        reminder: REMINDERS[2],
        prices: same({
          cost: [1520, 1760, 1990],
          sale: [1899, 2199, 2499],
          b2b: [1650, 1900, 2150],
        }),
      }),
      product({
        id: "jn-s1-p2",
        name: "Ceramic Pro 9H",
        tier: "أساسي",
        description: "طبقة نانو سيراميك 9H واحدة على الهيكل تمنح لمعاناً وحماية أساسية.",
        features: TAGS.features.slice(0, 3),
        includes: ["غسيل وإزالة ملوثات", "فحص بالإضاءة"],
        photos: 2,
        specs: nanoSpecs("1", "1 – 2", "بدون تصحيح"),
        warrantyYears: 3,
        covers: TAGS.covers.slice(0, 2),
        terms: ["صيانة كل 12 شهراً في نفس المركز"],
        notCovered: NOT_COVERED,
        linkarCert: true,
        consent: true,
        reminder: REMINDERS[2],
        prices: same({
          cost: [1040, 1200, 1360],
          sale: [1299, 1499, 1699],
          b2b: [1130, 1300, 1480],
        }),
      }),
      product({
        id: "jn-s1-p3",
        name: "Ceramic Pro 9H",
        tier: "بريميوم بلس",
        description: "ثلاث طبقات نانو سيراميك 9H على الهيكل وطبقة للجنوط والزجاج الأمامي.",
        features: [...TAGS.features],
        includes: ["غسيل وإزالة ملوثات", "تصحيح طلاء مرحلتين", "3 طبقات على الهيكل", "طبقة للجنوط", "طبقة للزجاج الأمامي", "فحص بالإضاءة"],
        photos: 4,
        specs: nanoSpecs("3", "3 – 4", "تصحيح مرحلتين"),
        warrantyYears: 10,
        covers: [...TAGS.covers],
        terms: ["صيانة كل 12 شهراً في نفس المركز"],
        notCovered: NOT_COVERED,
        linkarCert: true,
        consent: true,
        reminder: REMINDERS[2],
        prices: same({
          cost: [1920, 2210, 2510],
          sale: [2399, 2759, 3129],
          b2b: [2090, 2400, 2720],
        }),
      }),
    ],
  }),
  svc({
    id: "jn-s2",
    code: "S2",
    name: "‏PPF للواجهة + نانو سيراميك",
    category: "حماية PPF",
    duration: "يومان",
    popularity: 268,
    createdAt: "2026-03-04",
    products: [
      simple("jn-s2-p1", "XPEL Ultimate Plus", [2780, 3200, 3620], [3299, 3799, 4299], [2990, 3440, 3890], 5, {
        description: "فيلم حماية PPF للواجهة الأمامية مع طبقة نانو سيراميك فوقه.",
      }),
    ],
  }),
  svc({
    id: "jn-s3",
    code: "S3",
    name: "طبقة طاردة للماء + تلميع",
    category: "التلميع",
    duration: "6 ساعات",
    popularity: 231,
    createdAt: "2026-03-20",
    products: [simple("jn-s3-p1", "Koch Chemie", [1080, 1240, 1400], [1299, 1499, 1699], [1170, 1350, 1530], 2)],
  }),
  svc({
    id: "jn-s4",
    code: "S4",
    name: "تفصيل داخلي كامل",
    category: "الغسيل والتنظيف",
    duration: "4 ساعات",
    popularity: 190,
    createdAt: "2026-04-02",
    products: [simple("jn-s4-p1", "Meguiar's", [360, 440, 520], [449, 549, 649], [400, 490, 580], 0)],
  }),
  svc({
    id: "jn-s5",
    code: "S5",
    name: "تلميع ثلاث مراحل",
    category: "التلميع",
    duration: "يوم واحد",
    popularity: 174,
    createdAt: "2026-05-11",
    products: [simple("jn-s5-p1", "Menzerna", [280, 320, 360], [351, 401, 451], [310, 355, 400], 0)],
  }),
  svc({
    id: "jn-s6",
    code: "S6",
    name: "غسيل وتلميع سريع",
    category: "الغسيل والتنظيف",
    duration: "45 – 60 دقيقة",
    popularity: 160,
    createdAt: "2026-06-01",
    products: [simple("jn-s6-p1", "Sonax", [120, 145, 160], [149, 179, 199], [135, 160, 180], 0)],
  }),
];

/** نوع الخدمة كما في عمود «النوع» (CON5-07a: «الغسيل» بدل «الغسيل والتنظيف») */
const TYPE_SHORT: Record<string, string> = { "الغسيل والتنظيف": "الغسيل" };

let services: Service[] = structuredClone(SEED);
const seeded = new Set<string>(["lk-jn-001"]);

/** باقي المنشآت المعتمدة: خدمات تجريبية بعدد «services» من القائمة، بنفس أسعار جونسون لكل فروعها */
async function ensure(providerId: string) {
  if (seeded.has(providerId)) return;
  seeded.add(providerId);
  const p = await providersApi.get(providerId);
  const n = p.services ?? 0;
  if (!n) return;
  const branchIds = branchesOf(p)
    .filter((b) => b.status === "approved")
    .map((b) => b.id);
  const users = usersOf(p).map((u) => u.id);
  for (let i = 0; i < n; i++) {
    const base = SEED[i % SEED.length];
    const s = structuredClone(base);
    s.id = `${providerId}-s${i + 1}`;
    s.providerId = providerId;
    s.code = `S${i + 1}`;
    s.branchIds = branchIds;
    s.visibilityBranchIds = branchIds;
    s.visibility = ALL_ON(users);
    s.products = s.products.map((pr, k) => ({
      ...pr,
      id: `${s.id}-p${k + 1}`,
      prices: Object.fromEntries(branchIds.map((b) => [b, structuredClone(Object.values(pr.prices)[0])])),
    }));
    if (i >= SEED.length) s.name = `${base.name} ${Math.floor(i / SEED.length) + 1}`;
    services.push(s);
  }
}

const clone = <T>(v: T): T => structuredClone(v);
const find = (id: string) => {
  const s = services.find((x) => x.id === id);
  if (!s) throw new ApiError(404, "not found");
  return s;
};

function toRow(s: Service, branch: string): ServiceRow {
  const pr = s.products[0]?.prices[branch];
  const m = pr ? marginOf(pr.sale[0], pr.cost[0]) : null;
  const n = s.products.length;
  return {
    ...s,
    cost: pr?.cost ?? null,
    sale: pr?.sale ?? null,
    marginPct: m?.pct ?? null,
    warrantyLabel: warrantyLabel(s.products[0]?.warrantyYears ?? 0),
    durationShort: s.duration.split(" · ")[0],
    typeLabel: `${TYPE_SHORT[s.category] ?? s.category}${n > 1 ? ` · ${n} منتجات` : ""}`,
  };
}

const matchPrice = (r: ServiceRow, f?: string) => !f || (r.sale != null && (f === "lt500" ? r.sale[0] < 500 : f === "gt1500" ? r.sale[0] > 1500 : r.sale[0] >= 500 && r.sale[0] <= 1500));
const matchWarranty = (s: Service, f?: string) => {
  if (!f) return true;
  const y = s.products[0]?.warrantyYears ?? 0;
  return f === "none" ? y === 0 : f === "upto2" ? y > 0 && y <= 2 : f === "3-5" ? y >= 3 && y <= 5 : y > 5;
};
const matchChannel = (s: Service, f?: string) => !f || s.channels[f as "customers" | "b2b" | "marketers"];
const matchStatus = (s: Service, f?: string) => (f === "published" ? s.status === "published" : f === "paused" ? s.status === "paused" || s.status === "hidden" : true);

export const servicesApi = {
  /** GET /providers/:id/services?branch=&price=&status=&warranty=&channel=&sort= */
  list: async (providerId: string, q: ServiceQuery = {}) => {
    await ensure(providerId);
    const p = await providersApi.get(providerId);
    const branch = q.branch || branchesOf(p).find((b) => b.status === "approved")?.id || "";
    const own = services.filter((s) => s.providerId === providerId);
    const inBranch = own.filter((s) => s.branchIds.includes(branch));
    const base = q.view === "paused" ? inBranch.filter((s) => s.status === "paused" || s.status === "hidden") : inBranch;
    const rows = base
      .map((s) => toRow(s, branch))
      .filter((r) => matchStatus(r, q.status) && matchWarranty(r, q.warranty) && matchChannel(r, q.channel) && matchPrice(r, q.price))
      .sort((a, b) =>
        q.sort === "newest"
          ? b.createdAt.localeCompare(a.createdAt)
          : q.sort === "price-desc"
            ? (b.sale?.[0] ?? 0) - (a.sale?.[0] ?? 0)
            : q.sort === "price-asc"
              ? (a.sale?.[0] ?? 0) - (b.sale?.[0] ?? 0)
              : b.popularity - a.popularity,
      );
    return delay({
      items: clone(rows),
      total: rows.length,
      branch,
      counts: {
        all: own.length,
        paused: own.filter((s) => s.status === "paused" || s.status === "hidden").length,
      },
    });
  },
  /** عدد خدمات المزوّد لتبويب «الخدمات والأسعار» */
  count: async (providerId: string) => {
    await ensure(providerId);
    return delay(services.filter((s) => s.providerId === providerId).length, 100);
  },
  get: async (id: string) => delay(clone(find(id)), 150),
  create: async (providerId: string, v: ServiceInput, publish: boolean) => {
    await ensure(providerId);
    const own = services.filter((s) => s.providerId === providerId);
    const n = Math.max(0, ...own.map((s) => +s.code.slice(1) || 0)) + 1;
    const s: Service = {
      ...clone(v),
      id: `${providerId}-s${Date.now().toString(36)}`,
      providerId,
      code: `S${n}`,
      status: publish ? "published" : "draft",
      popularity: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    services = [...services, s];
    return delay({ id: s.id, name: s.name });
  },
  update: async (id: string, v: ServiceInput) => {
    const s = find(id);
    Object.assign(s, clone(v));
    return delay({ ok: true, name: s.name });
  },
  pause: async (
    id: string,
    v: {
      scope: "all" | "some";
      branchIds: string[];
      reason: string;
      until: string;
      message: string;
    },
  ) => {
    const s = find(id);
    if (v.scope === "all" || v.branchIds.length >= s.branchIds.length) s.status = "paused";
    s.pausedUntil = v.until;
    return delay({ ok: true, name: s.name });
  },
  resume: async (id: string) => {
    const s = find(id);
    s.status = "published";
    s.pausedUntil = undefined;
    return delay({ ok: true, name: s.name });
  },
  hide: async (id: string, v: { reason: string; message: string }) => {
    void v; // يُرسل للمركز ويُسجّل في سجل التدقيق على الخادم
    const s = find(id);
    s.status = "hidden";
    return delay({ ok: true, name: s.name });
  },
  remove: async (id: string, v: { scope: "all" | "some"; branchIds: string[] }) => {
    const s = find(id);
    if (v.scope === "some" && v.branchIds.length && v.branchIds.length < s.branchIds.length) {
      s.branchIds = s.branchIds.filter((b) => !v.branchIds.includes(b));
      for (const pr of s.products) for (const b of v.branchIds) delete pr.prices[b];
    } else services = services.filter((x) => x.id !== id);
    return delay({ ok: true, name: s.name });
  },
};
