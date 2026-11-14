// المرحلة 2 · السياسات CON5-21 (Figma «v5 · 21 · السياسات» 3114:64405).
// كل سياسة ليها نسخ: النشر يُنشئ نسخة جديدة ويُحفظ من نشرها ومتى (CON5-21M · سجل النسخ).
// النصوص حرفياً من الإطارات (الصفحة 3114:64406 · الأدراج CON5-21D · قوائم CON5-DD 3114:69321…69483).
import { ApiError, delay } from "./errors";

export interface PolicyField {
  key: string;
  label: string;
  value: string;
  /** قائمة منسدلة — من غيرها: قيمة ثابتة بأيقونة المستخدمين («من يملك تنفيذ الاسترداد») */
  options?: string[];
}

export interface PolicyVersion {
  version: number;
  by: string;
  date: string;
  change: string;
}

export interface Policy {
  id: string;
  /** عنوان البطاقة «الإلغاء والاسترداد» */
  title: string;
  /** عنوان الدرج «سياسة الإلغاء والاسترداد» */
  fullTitle: string;
  version: number;
  /** تاريخ النسخة على البطاقة */
  date: string;
  /** «آخر نشر … · …» في الدرج */
  publishedAt: string;
  publishedBy: string;
  appearsIn: string;
  bullets: string[];
  fields: PolicyField[];
  history: PolicyVersion[];
  draft?: boolean;
}

const D = ["3 أيام", "7 أيام", "14 يوماً", "30 يوماً", "90 يوماً"];
const OTHER = "خيار آخر من القائمة المرجعية…";

let policies: Policy[] = [
  {
    id: "cancellation",
    title: "الإلغاء والاسترداد",
    fullTitle: "سياسة الإلغاء والاسترداد",
    version: 4,
    date: "1 أكتوبر 2026",
    publishedAt: "1 أكتوبر 2026",
    publishedBy: "نوف القحطاني",
    appearsIn: "الموقع · التطبيق · إدارة الحجز · لوحة المزوّد",
    bullets: [
      "قبل استخدام القسيمة وخلال صلاحيتها: استرداد كامل للوسيلة الأصلية خلال 5 أيام عمل.",
      "بعد استخدام القسيمة: لا إلغاء؛ تُعالج كشكوى.",
      "قسيمة منتهية دون استخدام: تمديد مرة واحدة 14 يوماً بطلب العميل.",
      "«تعذّر قبول الخدمة»: تحويل أو تأجيل أو استرداد كامل دون رسوم.",
      "الإلغاء والاسترداد للينكار والمالية فقط.",
    ],
    fields: [
      { key: "before", label: "قبل استخدام القسيمة", value: "استرداد كامل · خلال 5 أيام عمل", options: ["استرداد كامل · خلال 5 أيام عمل", ...D] },
      { key: "expired", label: "قسيمة منتهية دون استخدام", value: "تمديد مرة واحدة 14 يوماً", options: ["تمديد مرة واحدة 14 يوماً", ...D] },
      { key: "unable", label: "تعذّر من المزوّد", value: "تحويل · تأجيل · استرداد كامل بلا رسوم", options: ["تحويل · تأجيل · استرداد كامل بلا رسوم", OTHER] },
      { key: "owner", label: "من يملك تنفيذ الاسترداد", value: "لينكار · المالية" },
    ],
    history: [
      { version: 4, by: "نوف القحطاني", date: "1 أكتوبر 2026", change: "إضافة «تعذّر من المزوّد»" },
      { version: 3, by: "سلطان العنزي", date: "1 سبتمبر 2026", change: "مدة الاسترداد 5 أيام عمل" },
      { version: 2, by: "نوف القحطاني", date: "1 أغسطس 2026", change: "تمديد القسيمة المنتهية" },
      { version: 1, by: "نوف القحطاني", date: "4 يناير 2026", change: "الإطلاق" },
    ],
  },
  {
    id: "warranty",
    title: "الضمان",
    fullTitle: "سياسة الضمان",
    version: 3,
    date: "30 أكتوبر 2026",
    publishedAt: "18 أكتوبر 2026",
    publishedBy: "سلطان العنزي",
    appearsIn: "صفحة الخدمة · القسيمة",
    bullets: [
      "الضمان ورقي يسلّمه المركز للعميل عند التسليم، وتعرض لينكار مدته وبنوده في صفحة الخدمة والقسيمة.",
      "الضمان يتبع السيارة ويسري في كل فروع المزوّد نفسه.",
      "أي مشكلة خلال مدة الضمان يرفعها العميل لِلينكار كشكوى «مشكلة خلال فترة الضمان»، وتتابعها مع المركز خلال 3 أيام.",
    ],
    fields: [
      { key: "duration", label: "مدة الضمان", value: "حسب المنتج المعتمد · من سنتين إلى 9 سنوات", options: ["حسب المنتج المعتمد · من سنتين إلى 9 سنوات", OTHER] },
      {
        key: "certificate",
        label: "إصدار الشهادة",
        value: "ضمان ورقي يسلّمه الفرع عند التسليم · تعرض لينكار بنوده فقط",
        options: ["ضمان ورقي يسلّمه الفرع عند التسليم · تعرض لينكار بنوده فقط", "يصدرها الفرع خلال 24 ساعة من التنفيذ وتظهر في «ضماناتي»", "8 ساعات", "24 ساعة", "48 ساعة"],
      },
      { key: "issue", label: "مشكلة خلال فترة الضمان", value: "يُنفّذ خلال 3 أيام عمل وإلا يتحول لشكوى", options: ["يُنفّذ خلال 3 أيام عمل وإلا يتحول لشكوى", ...D] },
      { key: "exceptions", label: "من يعتمد الاستثناءات", value: "الجودة والزيارات" },
    ],
    history: [
      { version: 3, by: "سلطان العنزي", date: "18 أكتوبر 2026", change: "الضمان ورقي يسلّمه الفرع" },
      { version: 2, by: "نوف القحطاني", date: "1 يوليو 2026", change: "متابعة المشكلة خلال 3 أيام" },
      { version: 1, by: "نوف القحطاني", date: "4 يناير 2026", change: "الإطلاق" },
    ],
  },
  {
    id: "provider-agreement",
    title: "اتفاقية مقدّمي الخدمة",
    fullTitle: "اتفاقية مقدّمي الخدمة",
    version: 1,
    date: "4 يناير 2026",
    publishedAt: "4 يناير 2026",
    publishedBy: "نوف القحطاني",
    appearsIn: "لوحة المزوّد · الاتفاقيات",
    bullets: [
      "تتفق لينكار مع المزوّد على سعر تكلفة لكل خدمة وحجم (وفرع عند الحاجة)، وتحوّل مستحقاته عن الحجوزات المنفّذة كل 15 يوماً (يوم 1 و16) متى بلغت الحد الأدنى الذي تحدده لينكار للمزوّد، مجمّعةً أو لكل فرع، وتكلفته شاملة الضريبة إن كان مسجّلاً.",
      "أي تعديل على الخدمات والأسعار والفروع يتم بطلب ولا يُنشر قبل قرار لينكار.",
      "لا فرع ولا خدمة جديدة على فرع دون زيارة ميدانية.",
    ],
    fields: [
      { key: "purchase", label: "الشراء", value: "سعر تكلفة متفق عليه لكل خدمة وحجم", options: ["سعر تكلفة متفق عليه لكل خدمة وحجم", OTHER] },
      { key: "price", label: "سعر العميل", value: "تحدده لينكار · يراه المزوّد داخل «طلب التعديل» فقط", options: ["تحدده لينكار · يراه المزوّد داخل «طلب التعديل» فقط", "تحدده لينكار ولا يظهر للمزوّد", OTHER] },
      { key: "changes", label: "التغييرات", value: "أي إيقاف أو حذف أو تعديل أو عرض أو باقة بطلب مع سبب", options: ["أي إيقاف أو حذف أو تعديل أو عرض أو باقة بطلب مع سبب", OTHER] },
      { key: "quality", label: "الجودة", value: "لا فرع بلا زيارة ميدانية · فئة لكل فرع" },
    ],
    history: [{ version: 1, by: "نوف القحطاني", date: "4 يناير 2026", change: "الإطلاق" }],
  },
  {
    id: "customer-terms",
    title: "الشروط والأحكام للعملاء",
    fullTitle: "الشروط والأحكام للعملاء",
    version: 5,
    date: "1 أكتوبر 2026",
    publishedAt: "1 أكتوبر 2026",
    publishedBy: "نوف القحطاني",
    appearsIn: "الموقع · التطبيق",
    bullets: ["الحجز بتاريخ فقط، والقسيمة صالحة 14 يوماً (90 لقسائم الوكالات)."],
    fields: [
      { key: "booking", label: "الحجز", value: "بتاريخ فقط · القسيمة 14 يوماً (90 يوماً لقسائم الوكالات)", options: ["بتاريخ فقط · القسيمة 14 يوماً (90 يوماً لقسائم الوكالات)", ...D] },
      { key: "payment", label: "الدفع", value: "لِلينكار عند الحجز · تصدر لينكار الفاتورة", options: ["لِلينكار عند الحجز · تصدر لينكار الفاتورة", OTHER] },
      { key: "cancel", label: "الإلغاء", value: "حسب «سياسة الإلغاء والاسترداد»", options: ["حسب «سياسة الإلغاء والاسترداد»", OTHER] },
      { key: "contact", label: "التواصل", value: "لسياسات الحجز والإلغاء تواصل مع لينكار" },
    ],
    history: [
      { version: 5, by: "نوف القحطاني", date: "1 أكتوبر 2026", change: "قسائم الوكالات 90 يوماً" },
      { version: 4, by: "نوف القحطاني", date: "1 أغسطس 2026", change: "الحجز بتاريخ فقط" },
      { version: 3, by: "سلطان العنزي", date: "1 مايو 2026", change: "الفاتورة من لينكار" },
      { version: 2, by: "نوف القحطاني", date: "1 مارس 2026", change: "صلاحية القسيمة 14 يوماً" },
      { version: 1, by: "نوف القحطاني", date: "4 يناير 2026", change: "الإطلاق" },
    ],
  },
  {
    id: "marketers",
    title: "المسوّقون",
    fullTitle: "سياسة المسوّقين",
    version: 3,
    date: "1 سبتمبر 2026",
    publishedAt: "1 سبتمبر 2026",
    publishedBy: "سلطان العنزي",
    appearsIn: "بوابة المسوّقين",
    bullets: ["عمولة 5% من سعر لينكار تُصرف شهرياً، من هامش لينكار."],
    fields: [
      { key: "commission", label: "العمولة", value: "5% من سعر لينكار · من هامش لينكار", options: ["5% من سعر لينكار · من هامش لينكار", "3%", "5%", "10%", "15%", "20%"] },
      { key: "payout", label: "الصرف", value: "شهرياً بعد اكتمال الحجز وانتهاء مدة الإلغاء", options: ["شهرياً بعد اكتمال الحجز وانتهاء مدة الإلغاء", OTHER] },
      { key: "codes", label: "الأكواد", value: "كود شخصي لكل مسوّق · خصم للعميل حسب الحملة", options: ["كود شخصي لكل مسوّق · خصم للعميل حسب الحملة", OTHER] },
      { key: "suspend", label: "الإيقاف", value: "عند مخالفة السياسة أو إساءة الأكواد" },
    ],
    history: [
      { version: 3, by: "سلطان العنزي", date: "1 سبتمبر 2026", change: "العمولة من هامش لينكار" },
      { version: 2, by: "نوف القحطاني", date: "1 يونيو 2026", change: "الصرف بعد انتهاء مدة الإلغاء" },
      { version: 1, by: "نوف القحطاني", date: "4 يناير 2026", change: "الإطلاق" },
    ],
  },
];

/** «تظهر في» (CON5-DD 3114:69361) */
export const APPEARS_IN = ["لوحة المزوّد · الاتفاقيات", "الموقع · التطبيق", "الموقع · التطبيق · إدارة الحجز · لوحة المزوّد", "صفحة الخدمة · القسيمة", "بوابة المسوّقين"];

const TODAY = "14 أكتوبر 2026";
const ME = "نوف القحطاني";

export const policiesApi = {
  list: async () => delay(policies.map((p) => ({ ...p })), 250),
  get: async (id: string) => {
    const p = policies.find((x) => x.id === id);
    if (!p) throw new ApiError(404, "السياسة غير موجودة");
    return delay({ ...p, fields: p.fields.map((f) => ({ ...f })) }, 150);
  },
  /** «نشر النسخة N» → CON5-21T «نُشرت سياسة الإلغاء والاسترداد · نسخة 5» */
  publish: async (id: string, values: Record<string, string>) => {
    const p = policies.find((x) => x.id === id);
    if (!p) throw new ApiError(404, "السياسة غير موجودة");
    const changed = p.fields.filter((f) => values[f.key] != null && values[f.key] !== f.value);
    const version = p.version + 1;
    const next: Policy = {
      ...p,
      version,
      date: TODAY,
      publishedAt: TODAY,
      publishedBy: ME,
      draft: false,
      fields: p.fields.map((f) => ({ ...f, value: values[f.key] ?? f.value })),
      history: [{ version, by: ME, date: TODAY, change: changed.length ? changed.map((f) => f.label).join(" · ") : "إعادة نشر" }, ...p.history],
    };
    policies = policies.map((x) => (x.id === id ? next : x));
    return delay({ ok: true, toast: `نُشرت ${p.fullTitle} · نسخة ${version}` }, 500);
  },
  /** «استعادة النسخة N» → CON5-21T «استُعيدت النسخة كمسودة جديدة · راجعها ثم انشرها» */
  restore: async (id: string, version: number) => {
    const p = policies.find((x) => x.id === id);
    if (!p || !p.history.some((h) => h.version === version)) throw new ApiError(404, "النسخة غير موجودة");
    policies = policies.map((x) => (x.id === id ? { ...x, draft: true } : x));
    return delay({ ok: true, toast: "استُعيدت النسخة كمسودة جديدة · راجعها ثم انشرها" }, 500);
  },
  /** CON5-21M · سياسة جديدة: «حفظ ونشر» → CON5-21T «نُشرت النسخة الجديدة…» · «حفظ كمسودة» */
  create: async (v: { name: string; appearsIn: string; text: string; publish: boolean }) => {
    const fields: Record<string, string> = {};
    if (!v.name.trim()) fields.name = "اكتب اسم السياسة";
    if (!v.text.trim()) fields.text = "اكتب نص السياسة";
    if (Object.keys(fields).length) throw new ApiError(422, "تحقق من الحقول", fields);
    const name = v.name.trim();
    const bullets = v.text
      .split("\n")
      .map((l) => l.replace(/^[•\s]+/, "").trim())
      .filter(Boolean);
    policies = [
      ...policies,
      {
        id: `p-${policies.length + 1}`,
        title: name,
        fullTitle: name,
        version: 1,
        date: TODAY,
        publishedAt: TODAY,
        publishedBy: ME,
        appearsIn: v.appearsIn,
        bullets,
        fields: [],
        history: v.publish ? [{ version: 1, by: ME, date: TODAY, change: "الإطلاق" }] : [],
        draft: !v.publish,
      },
    ];
    return delay({ ok: true, toast: v.publish ? "نُشرت النسخة الجديدة وظهرت في الأماكن المحددة · أُبلغ المزوّدون بالتغيير" : "حُفظت السياسة كمسودة" }, 500);
  },
};
