// المرحلة 2 · البيانات المرجعية CON5-20 (Figma «v5 · 20 · البيانات المرجعية (قائمة جانبية · 1 نوفمبر)» 3114:74880).
// قائمة جانبية داخلية + صفحة لكل قائمة. النصوص حرفياً من الإطارات.
import { ApiError, delay } from "./errors";

// ───────── القائمة الجانبية (Figma «Ref nav») ─────────
export type RefSlug = "service-categories" | "car-sizes" | "accreditation" | "complaint-reasons" | "rating-aspects" | "warranty-certificate" | "numbering-codes";
export const REF_NAV: { group: string; items: { slug: RefSlug; label: string }[] }[] = [
  { group: "الخدمات والكتالوج", items: [{ slug: "service-categories", label: "تصنيفات الخدمات" }, { slug: "car-sizes", label: "أحجام السيارات" }] },
  { group: "الشبكة والمنشآت", items: [{ slug: "accreditation", label: "معايير اعتماد الفروع والخدمات" }] },
  {
    group: "الجودة والتقييم",
    items: [
      { slug: "complaint-reasons", label: "أسباب الشكاوى" },
      { slug: "rating-aspects", label: "جوانب تقييم العميل" },
      { slug: "warranty-certificate", label: "شهادة الضمان" },
    ],
  },
  { group: "التشغيل والنظام", items: [{ slug: "numbering-codes", label: "أكواد الترقيم" }] },
];
export const REF_SLUGS = REF_NAV.flatMap((g) => g.items.map((i) => i.slug));

// ───────── القوائم القابلة للتعديل (CON5-20 · أحجام السيارات 3114:75328 …) ─────────
export type ListKey = "car-sizes" | "complaint-reasons" | "rating-aspects" | "numbering-codes" | "branch-tiers";
export interface RefColumn {
  label: string;
  width: number;
  /** عمود ثابت يُعرض كنص داخل الخلية (مدة الرد في أسباب الشكاوى) */
  suffixOf?: number;
}
export interface RefRow {
  id: string;
  enabled: boolean;
  cells: string[];
  /** مستخدمة في خدمات أو حجوزات → الحذف يعطّلها */
  used?: boolean;
}
export interface RefList {
  key: ListKey;
  title: string;
  sub?: string;
  /** من اليمين */
  columns: RefColumn[];
  rows: RefRow[];
  addLabel: string;
}

const rows = (prefix: string, data: string[][], used = true): RefRow[] => data.map((cells, i) => ({ id: `${prefix}-${i + 1}`, enabled: true, cells, used }));

let lists: Record<ListKey, RefList> = {
  "car-sizes": {
    key: "car-sizes",
    title: "أحجام السيارات",
    sub: "الأحجام التي تُسعَّر بها كل خدمة (التكلفة وسعر البيع).",
    columns: [
      { label: "الحجم", width: 360 },
      { label: "الرمز", width: 90 },
      { label: "أمثلة", width: 260 },
    ],
    rows: rows("cs", [
      ["سيدان", "S1", "كامري · أكورد · إلنترا"],
      ["SUV متوسط", "S2", "راف فور · توسان · سبورتاج"],
      ["SUV كبير", "S4", "لاندكروزر · يوكن · تاهو"],
    ]),
    addLabel: "+ أضف قيمة جديدة واضغط Enter",
  },
  "complaint-reasons": {
    key: "complaint-reasons",
    title: "أسباب الشكاوى",
    sub: "يختارها العميل أو فريق لينكار عند فتح شكوى.",
    columns: [{ label: "السبب", width: 726 }, { label: "مهلة الرد", width: 0, suffixOf: 0 }],
    rows: rows("cr", [
      ["جودة التنفيذ", "24 ساعة"],
      ["تأخير عن الموعد", "24 ساعة"],
      ["السعر مختلف عن المعروض", "24 ساعة"],
      ["التعامل", "24 ساعة"],
      ["ضرر بالسيارة", "12 ساعة"],
      ["مشكلة خلال فترة الضمان", "48 ساعة"],
      ["أخرى", "24 ساعة"],
    ]),
    addLabel: "+ أضف قيمة جديدة واضغط Enter",
  },
  "rating-aspects": {
    key: "rating-aspects",
    title: "جوانب تقييم العميل",
    sub: "يقيّمها العميل بعد التنفيذ، أو فريق لينكار بالنيابة عنه بعد اتصال.",
    columns: [
      { label: "الجانب", width: 418 },
      { label: "السؤال للعميل", width: 300 },
    ],
    rows: rows("ra", [
      ["جودة العمل", "كيف كانت جودة الخدمة؟"],
      ["التعامل والتواصل", "كيف كان تعامل الفريق وتواصله معك؟"],
      ["القيمة مقابل السعر", "هل السعر مناسب لما حصلت عليه؟"],
      ["العناية بالسيارة ونظافتها", "هل استلمت سيارتك نظيفة ودون أضرار؟"],
    ]),
    addLabel: "+ أضف قيمة جديدة واضغط Enter",
  },
  "numbering-codes": {
    key: "numbering-codes",
    title: "أكواد الترقيم",
    sub: "صيغ الأرقام في كل المنصات.",
    columns: [
      { label: "الكيان", width: 290 },
      { label: "الصيغة", width: 220 },
      { label: "مثال", width: 200 },
    ],
    rows: rows("nc", [
      ["مقدّم خدمة", "LK + حرفان + 3 أرقام", "LK-JN-001"],
      ["فرع", "كود المزوّد + حرفان + رقم", "LK-JN-ZH-001"],
      ["حجز", "BK + 5 أرقام", "BK-21474"],
      ["طلب مقدّم خدمة معتمد من لوحته (تعديل، شهادة، تعذّر، إعادة جدولة)", "REQ + السنة + 4 أرقام", "REQ-2026-0418"],
      ["تحويل مستحقات", "TRF + السنة والشهر + 4 أرقام", "TRF-2026-10-0062"],
      ["فاتورة عميل", "INV-L + السنة والشهر + 5 أرقام", "INV-L-2026-10-08812"],
      ["فاتورة فوترة ذاتية", "SB + السنة والشهر + 4 أرقام", "SB-2026-10-0062"],
      ["شكوى", "CM + 4 أرقام", "CM-3352"],
      ["طلب انضمام مقدّم خدمة (من الموقع)", "JR + 4 أرقام", "JR-0212"],
      ["طلب انضمام مسوّق", "AR + 4 أرقام", "AR-0058"],
      ["طلب انضمام وكالة", "DR + 4 أرقام", "DR-0034"],
    ]),
    addLabel: "+ أضف قيمة جديدة واضغط Enter",
  },
  "branch-tiers": {
    key: "branch-tiers",
    title: "معايير اعتماد الفروع والخدمات",
    columns: [
      { label: "الفئة", width: 442 },
      { label: "نطاق النتيجة", width: 120 },
      { label: "التقييم", width: 140 },
    ],
    rows: rows("bt", [
      ["بلاتيني", "90% – 100%", "★ 4.7"],
      ["ذهبي", "80% – 89%", "★ 4.5"],
      ["فضي", "70% – 79%", "★ 4.0"],
    ]),
    addLabel: "+ إضافة فئة",
  },
};

// ───────── تصنيفات الخدمات والمنتجات المعتمدة (3114:80128 + صفحات «تصنيف · …») ─────────
export interface Product {
  id: string;
  name: string;
  specs: string;
  warranty: string;
  options: string;
  providers: number;
  duration?: string;
  description?: string;
}
export interface Category {
  slug: string;
  name: string;
  /** أيقونة sprite الخدمات (public/icons/service.svg) */
  icon?: "nano-ceramic" | "ppf" | "polish" | "tint" | "wash" | "color-change";
  criteria: string;
  products: Product[];
  draft?: boolean;
}

const prods = (slug: string, l: [string, string, string, string, number][]): Product[] => l.map(([name, specs, warranty, options, providers], i) => ({ id: `${slug}-${i + 1}`, name, specs, warranty, options, providers }));

let categories: Category[] = [
  {
    slug: "ppf",
    name: "حماية PPF",
    icon: "ppf",
    criteria: "معايير الاعتماد: حماية PPF · 16 معياراً",
    products: prods("ppf", [
      ["PPF اقتصادي", "أقل من 7 ميل · TPU · التئام ذاتي", "3 – 5 سنوات · المركز", "التغطية · التشطيب", 0],
      ["PPF 1", "7 ميل فأكثر · TPU · التئام ذاتي", "5 – 9 سنوات · المركز", "التغطية · التشطيب", 1],
      ["PPF 2", "7.5 إلى أقل من 8.5 ميل · TPU · التئام ذاتي", "10 سنوات · الشركة المصنّعة", "التغطية · التشطيب", 0],
      ["PPF 3", "8.5 ميل فأكثر · TPU · التئام ذاتي", "10 سنوات · الشركة المصنّعة", "التغطية · التشطيب", 0],
    ]),
  },
  {
    slug: "nano-ceramic",
    name: "نانو سيراميك",
    icon: "nano-ceramic",
    criteria: "معايير الاعتماد: نانو سيراميك · 15 معياراً",
    products: prods("nano", [
      ["نانو سيراميك أساسي", "طبقة واحدة · 9H · تلميع مرحلة واحدة", "سنة إلى سنتين · المركز", "الأسطح الإضافية · التشطيب", 1],
      ["نانو سيراميك متقدم", "طبقة واحدة أو أكثر · 9H · تلميع مرحلة واحدة", "3 سنوات · المركز", "الأسطح الإضافية · التشطيب", 0],
      ["نانو سيراميك بريميوم", "طبقتان أو أكثر · 9H · تصحيح مرحلتين", "4 إلى 6 سنوات · الشركة المصنّعة", "الأسطح الإضافية · التشطيب", 1],
      ["نانو سيراميك بريميوم بلس", "3 طبقات أو أكثر · 9H · تصحيح مرحلتين أو ثلاث", "7 سنوات فأكثر · الشركة المصنّعة", "الأسطح الإضافية · التشطيب", 1],
      ["نانو جرافين", "مدعّم بالجرافين · 3 طبقات · 9H · تصحيح ثلاث مراحل", "سنتان إلى 5 سنوات · المركز", "الأسطح الإضافية · التشطيب", 0],
    ]),
  },
  {
    slug: "polish",
    name: "التلميع",
    icon: "polish",
    criteria: "معايير الاعتماد: التلميع · 10 معايير",
    products: prods("polish", [
      ["تلميع مرحلة واحدة", "مرحلة واحدة · بوليش متوسط · واكس أو سيلانت", "بدون ضمان", "مكان التنفيذ · الإضافات", 0],
      ["تصحيح مرحلتين", "مرحلتان · كمباوند ثم بوليش · قياس سماكة الطلاء", "بدون ضمان", "الإضافات", 1],
      ["تصحيح ثلاث مراحل", "3 مراحل فأكثر · قياس سماكة الطلاء · رقعة اختبار", "بدون ضمان", "الإضافات", 1],
      ["تلميع داخلي", "المقصورة · تنظيف وتلميع داخلي", "بدون ضمان", "مكان التنفيذ", 0],
    ]),
  },
  {
    slug: "tint",
    name: "التظليل",
    icon: "tint",
    criteria: "معايير الاعتماد: التظليل · 14 معياراً",
    products: prods("tint", [
      ["تظليل أساسي", "مصبوغ أو معدني أو هجين أو كربون · رفض الأشعة تحت الحمراء أقل من 40%", "حتى 10 سنوات · المركز", "درجة القتامة · التغطية", 0],
      ["تظليل سيراميك", "نانو سيراميك غير معدني · رفض الأشعة تحت الحمراء 40 – 57%", "5 – 10 سنوات · المركز", "درجة القتامة · التغطية", 0],
      ["تظليل سيراميك IR", "نانو سيراميك موجّه · رفض الأشعة تحت الحمراء 58 – 65%", "10 سنوات · الشركة المصنّعة", "درجة القتامة · التغطية", 0],
      ["تظليل فائق", "ثنائي الطبقة أو متعدد الطبقات · رفض الأشعة تحت الحمراء 66% فأكثر", "10 سنوات · الشركة المصنّعة", "درجة القتامة · التغطية", 0],
    ]),
  },
  {
    slug: "color-change",
    name: "تغيير اللون",
    icon: "color-change",
    criteria: "معايير الاعتماد: لم تُعرَّف بعد",
    products: prods("color", [
      ["تغليف فينيل", "فينيل PVC مصبوب · نحو 3.5 ميل", "3 سنوات فأكثر · المركز", "التشطيب · اللون", 0],
      ["PPF ملوّن", "TPU ملوّن · 7.5 ميل فأكثر · التئام ذاتي", "5 – 9 سنوات · المركز", "التشطيب · اللون", 0],
      ["PPF ملوّن فاخر", "TPU ملوّن · 7.5 ميل فأكثر · التئام ذاتي", "10 سنوات · الشركة المصنّعة", "التشطيب · اللون", 0],
    ]),
  },
  {
    slug: "wash",
    name: "الغسيل والتنظيف",
    icon: "wash",
    criteria: "معايير الاعتماد: الغسيل · 19 معياراً",
    products: prods("wash", [
      ["غسيل خارجي", "خارجي · الهيكل والجنوط والزجاج", "بدون ضمان", "الموقع · الطريقة", 1],
      ["غسيل داخلي وخارجي", "داخلي وخارجي · شفط ومسح الطبلون", "بدون ضمان", "الموقع · الطريقة", 0],
      ["تنظيف داخلي عميق", "المقصورة · بخار أو استخلاص · تعقيم", "بدون ضمان", "الموقع · الطريقة", 1],
      ["تنظيف المحرك", "منطقة المحرك", "بدون ضمان", "الموقع · الطريقة", 0],
      ["غسيل شامل", "داخلي عميق وخارجي · طبقة واكس", "بدون ضمان", "الموقع · الطريقة", 0],
    ]),
  },
];

// ───────── قوالب معايير الاعتماد (3114:80275) ─────────
export interface Template {
  id: string;
  name: string;
  category: string;
  method: string;
  count: string;
  critical: string;
  threshold: string;
}
let templates: Template[] = [
  { id: "t-basic", name: "الجودة الأساسية", category: "عام", method: "مطابق · مطابق جزئياً · غير مطابق", count: "16", critical: "7", threshold: "70%" },
  { id: "t-nano", name: "نانو سيراميك", category: "نانو سيراميك", method: "نجوم (1–5)", count: "15", critical: "12", threshold: "70%" },
  { id: "t-ppf", name: "حماية PPF", category: "حماية PPF", method: "نجوم (1–5)", count: "16", critical: "12", threshold: "70%" },
  { id: "t-tint", name: "التظليل", category: "التظليل", method: "تقييم من 10", count: "14", critical: "9", threshold: "70%" },
  { id: "t-polish", name: "التلميع", category: "التلميع", method: "تقييم من 10", count: "10", critical: "2", threshold: "70%" },
  { id: "t-wash", name: "الغسيل", category: "الغسيل والتنظيف", method: "مطابق · مطابق جزئياً · غير مطابق", count: "19", critical: "6", threshold: "70%" },
  { id: "t-color", name: "تغيير اللون", category: "تغيير اللون", method: "—", count: "—", critical: "—", threshold: "—" },
];
export const TEST_METHODS = ["نجوم (1–5)", "تقييم من 10", "مطابق · مطابق جزئياً · غير مطابق"];

let warranty = { auto: true, manual: true };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const referenceApi = {
  // القوائم
  list: async (key: ListKey) => delay(clone(lists[key]), 200),
  /** «حفظ التغييرات» → CON5-20T «حُفظت التغييرات» */
  saveList: async (key: ListKey, rows: RefRow[]) => {
    const bad = rows.findIndex((r) => !r.cells[0]?.trim());
    if (bad >= 0) throw new ApiError(422, "تحقق من الحقول", { [`row-${bad}`]: "اكتب القيمة" });
    lists = { ...lists, [key]: { ...lists[key], rows: clone(rows) } };
    return delay({ ok: true, toast: "حُفظت التغييرات" }, 400);
  },
  /** CON5-20M · حذف قيمة: المستخدمة تُعطَّل → CON5-20T «عُطّلت القيمة …» · غير المستخدمة تُحذف */
  deleteValue: async (key: ListKey, id: string) => {
    const l = lists[key];
    const r = l.rows.find((x) => x.id === id);
    if (!r) throw new ApiError(404, "القيمة غير موجودة");
    const disabled = !!r.used;
    lists = { ...lists, [key]: { ...l, rows: disabled ? l.rows.map((x) => (x.id === id ? { ...x, enabled: false } : x)) : l.rows.filter((x) => x.id !== id) } };
    return delay({ ok: true, disabled, toast: disabled ? "عُطّلت القيمة · تبقى في الخدمات والحجوزات القائمة ولا تظهر في الإضافة الجديدة" : "حُذفت القيمة" }, 400);
  },

  // التصنيفات
  categories: async () => delay(clone(categories), 200),
  category: async (slug: string) => {
    const c = categories.find((x) => x.slug === slug);
    if (!c) throw new ApiError(404, "التصنيف غير موجود");
    return delay(clone(c), 150);
  },
  /** CON5-20M · تصنيف جديد → CON5-20T «أُنشئ التصنيف كمسودة · أكمل قالبه ثم فعّله ليظهر في «إضافة خدمة»» */
  createCategory: async (name: string) => {
    if (!name.trim()) throw new ApiError(422, "تحقق من الحقول", { name: "اكتب اسم التصنيف" });
    categories = [...categories, { slug: `c-${Date.now()}`, name: name.trim(), criteria: "معايير الاعتماد: لم تُعرَّف بعد", products: [], draft: true }];
    return delay({ ok: true, toast: "أُنشئ التصنيف كمسودة · أكمل قالبه ثم فعّله ليظهر في «إضافة خدمة»" }, 500);
  },
  /** CON5-20M · تعديل التصنيف → CON5-20T «حُفظت التغييرات» */
  updateCategory: async (slug: string, name: string) => {
    if (!name.trim()) throw new ApiError(422, "تحقق من الحقول", { name: "اكتب اسم التصنيف" });
    categories = categories.map((c) => (c.slug === slug ? { ...c, name: name.trim() } : c));
    return delay({ ok: true, toast: "حُفظت التغييرات" }, 400);
  },
  /** CON7 · حذف التصنيف → CON5-20T «حُذف التصنيف» */
  deleteCategory: async (slug: string) => {
    categories = categories.filter((c) => c.slug !== slug);
    return delay({ ok: true, toast: "حُذف التصنيف" }, 400);
  },
  /** CON5-20M · إضافة / تعديل منتج معتمد → CON5-20T «أُضيف المنتج المعتمد» / «حُفظت التغييرات» */
  saveProduct: async (slug: string, p: Omit<Product, "id" | "providers"> & { id?: string }) => {
    if (!p.name.trim()) throw new ApiError(422, "تحقق من الحقول", { name: "اكتب اسم المنتج المعتمد" });
    categories = categories.map((c) =>
      c.slug !== slug
        ? c
        : {
            ...c,
            products: p.id ? c.products.map((x) => (x.id === p.id ? { ...x, ...p, id: x.id } : x)) : [...c.products, { ...p, id: `${slug}-${Date.now()}`, providers: 0 }],
          },
    );
    return delay({ ok: true, toast: p.id ? "حُفظت التغييرات" : "أُضيف المنتج المعتمد" }, 500);
  },
  /** CON5-20M · حذف منتج معتمد → CON5-20T «حُذف المنتج المعتمد» */
  deleteProduct: async (slug: string, id: string) => {
    categories = categories.map((c) => (c.slug === slug ? { ...c, products: c.products.filter((x) => x.id !== id) } : c));
    return delay({ ok: true, toast: "حُذف المنتج المعتمد" }, 400);
  },

  // القوالب
  templates: async () => delay(clone(templates), 200),
  /** CON5-20M · إضافة قالب جديد / تعديل القالب → «أُضيف القالب» / «حُفظت التغييرات» */
  saveTemplate: async (t: Omit<Template, "id" | "critical"> & { id?: string }) => {
    const f: Record<string, string> = {};
    if (!t.name.trim()) f.name = "أدخل اسم القالب";
    if (!t.category) f.category = "اختر التصنيف";
    if (!t.method) f.method = "اختر طريقة الاختبار";
    if (Object.keys(f).length) throw new ApiError(422, "تحقق من الحقول", f);
    templates = t.id ? templates.map((x) => (x.id === t.id ? { ...x, ...t, id: x.id } : x)) : [...templates, { ...t, id: `t-${Date.now()}`, critical: "0" }];
    return delay({ ok: true, toast: t.id ? "حُفظت التغييرات" : "أُضيف القالب" }, 500);
  },
  deleteTemplate: async (id: string) => {
    templates = templates.filter((t) => t.id !== id);
    return delay({ ok: true, toast: "حُذف القالب" }, 400);
  },

  // شهادة الضمان
  warranty: async () => delay({ ...warranty }, 150),
  saveWarranty: async (v: { auto: boolean; manual: boolean }) => {
    warranty = { ...v };
    return delay({ ok: true, toast: "حُفظت التغييرات" }, 400);
  },
};
