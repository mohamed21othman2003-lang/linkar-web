// التقييم الميداني والتصنيف (المرحلة 2 · Figma «v5 · 17 · التقييم الميداني» 3114:62126).
// جزءين: (1) الزيارات الميدانية CON5-17 (المجدولة · بانتظار القرار · المكتملة) وأدراجها CON5-17D «زيارة · …» ونوافذ
// الجدولة/إعادة الجدولة/الإلغاء CON5-17M · (2) تصنيف المراكز والاعتماد CON5-17C + أدراج المراكز CON5-17D + التقييم العملي CON5-17P
// ونوافذ منح الشارة/القرار/المنح المباشر/التقييم الدوري. النصوص حرفياً من الإطارات (اليوم التجريبي = MOCK_NOW 14 أكتوبر 2026).
import { ApiError, delay } from "./errors";

const clone = <T,>(v: T): T => structuredClone(v);

// ───────────── الزيارات الميدانية (CON5-17 3114:62127) ─────────────

export type VisitTab = "scheduled" | "pending" | "done";
export type VisitTone = "info" | "warning" | "success";
export const VISIT_TABS: { key: VisitTab; label: string }[] = [
  { key: "scheduled", label: "المجدولة" },
  { key: "pending", label: "بانتظار القرار" },
  { key: "done", label: "المكتملة" },
];

export interface VisitRow {
  id: string;
  tab: VisitTab;
  /** «فرع أبحر الشمالية» */
  branch: string;
  /** «جونسون · فرع جديد LK-JN-AB-004» */
  reason: string;
  templates: string;
  /** «14 أكتوبر 2026 · 10 ص» */
  at: string;
  assessor: string;
  pill: { label: string; tone: VisitTone };
}

export interface VisitDetail extends VisitRow {
  title: string;
  subtitle: string;
  heroTitle: string;
  /** شارة الرأس لو مختلفة عن شارة الصف («مقبول» في السامر) */
  heroPill?: string;
  heroLines: [string, string];
  cards: { title: string; rows: [string, string][] }[];
  note?: string;
  /** بيانات نافذة إعادة الجدولة (CON5-17M 3114:64161) */
  rescheduleSub?: string;
  slot?: string;
  assessorKey?: string;
  /** القرار اللي بيصدر من «اعتماد القرار» (CON5-17T · صدر قرار النسيم 3114:63992) */
  decision?: { toast: string; donePill: string };
  branchCode?: string;
}

/** المقيّمون (حقل «المقيّم») — نفس فريق «الجودة والزيارات» في shared.ts */
export const ASSESSORS = [
  { value: "u-2", label: "لينا الحربي · الجودة", short: "لينا الحربي", she: true },
  { value: "u-6", label: "ماجد ف. · الجودة", short: "ماجد ف.", she: false },
];
/** المواعيد المتاحة (حقل «الموعد») */
export const SLOTS = ["14 أكتوبر 2026 · 10:00 ص", "20 أكتوبر 2026 · 9:00 ص", "22 أكتوبر 2026 · 9:00 ص", "22 أكتوبر 2026 · 11:00 ص", "28 أكتوبر 2026 · 10:00 ص"].map((v) => ({ value: v, label: v }));
/** «14 أكتوبر 2026 · 10:00 ص» → «14 أكتوبر 2026 · 10 ص» (عمود الموعد ورسائل التأكيد) */
export const shortSlot = (s: string) => s.replace(":00", "");
/** أسباب الزيارة (شرائح «سبب الزيارة») */
export const VISIT_REASONS = ["فرع جديد", "خدمة جديدة", "منشأة جديدة", "تقييم دوري", "زيارة مفاجئة"] as const;

/** المنشآت والفروع اللي ممكن تتجدول لها زيارة (حقلي «المنشأة» و«الفرع») + القوالب التلقائية حسب خدمات الفرع */
export const SCHEDULE_TARGETS: { provider: string; providerLabel: string; branches: { code: string; name: string; label: string; templates: string[] }[] }[] = [
  {
    provider: "lk-jn-001",
    providerLabel: "جونسون Johnson · LK-JN-001",
    branches: [
      { code: "LK-JN-AB-004", name: "فرع أبحر الشمالية", label: "فرع أبحر الشمالية · LK-JN-AB-004", templates: ["الجودة الأساسية · 12", "نانو سيراميك · 9", "التلميع · 9", "الغسيل · 8"] },
      { code: "LK-JN-SL-005", name: "فرع السلامة", label: "فرع السلامة · LK-JN-SL-005", templates: ["الجودة الأساسية · 16", "نانو سيراميك · 15", "التظليل · 14"] },
    ],
  },
  {
    provider: "lk-dr-001",
    providerLabel: "مركز درع للحماية · LK-DR-001",
    branches: [{ code: "LK-DR-NS-003", name: "فرع النسيم", label: "فرع النسيم · LK-DR-NS-003", templates: ["الجودة الأساسية · 16", "حماية PPF · 14"] }],
  },
];

let visits: VisitDetail[] = [
  {
    id: "V-JN-AB-004",
    tab: "scheduled",
    branch: "فرع أبحر الشمالية",
    reason: "جونسون · فرع جديد LK-JN-AB-004",
    templates: "الجودة الأساسية · نانو · التلميع · الغسيل",
    at: "14 أكتوبر 2026 · 10 ص",
    assessor: "لينا الحربي",
    pill: { label: "مجدولة", tone: "info" },
    // TODO(Figma): ما فيش درج «زيارة · فرع أبحر الشمالية» في القسم — المحتوى من الصف ونافذة الجدولة (3114:64092)
    title: "زيارة · فرع أبحر الشمالية",
    subtitle: "جونسون Johnson · فرع جديد LK-JN-AB-004",
    heroTitle: "جونسون · فرع جديد",
    heroLines: ["14 أكتوبر 2026 · 10:00 ص · المقيّمة لينا الحربي", "الفرع غير مفعّل حتى القبول · LK-JN-AB-004"],
    cards: [
      {
        title: "الزيارة",
        rows: [
          ["القوالب", "الجودة الأساسية (12) + نانو سيراميك (9) + التلميع (9) + الغسيل (8)"],
          ["الفرع", "فرع أبحر الشمالية · LK-JN-AB-004"],
          ["المنشأة", "جونسون Johnson · LK-JN-001"],
        ],
      },
    ],
    rescheduleSub: "جونسون · فرع أبحر الشمالية · فرع جديد",
    slot: "14 أكتوبر 2026 · 10:00 ص",
    assessorKey: "u-2",
    branchCode: "LK-JN-AB-004",
  },
  {
    id: "V-JN-TINT",
    tab: "scheduled",
    branch: "الزهراء والحمراء",
    reason: "جونسون · موديول التظليل · خدمة «عزل حراري للزجاج» (مسودة لينكار)",
    templates: "التظليل",
    at: "20 أكتوبر 2026 · 9 ص",
    assessor: "لينا الحربي",
    pill: { label: "مجدولة", tone: "info" },
    title: "زيارة · الزهراء والحمراء",
    subtitle: "جونسون Johnson · موديول التظليل · مسودة لينكار «عزل حراري للزجاج»",
    heroTitle: "عزل حراري للزجاج · التظليل",
    heroLines: ["20 أكتوبر 2026 · 9:00 ص · المقيّمة لينا الحربي", "أُبلغ المزوّد 13 أكتوبر 2026 · لا تُنشر الخدمة قبل القبول"],
    cards: [
      {
        title: "الزيارة",
        rows: [
          ["الفرعان", "الزهراء LK-JN-ZH-001 · الحمراء LK-JN-HM-002"],
          ["القالب", "التظليل · 14 معياراً"],
          ["المنتج المطلوب", "‏Johnson IR Ceramic · شهادة سارية"],
        ],
      },
    ],
    note: "النتيجة تُحسب تلقائياً لكل فرع على حدة؛ الخدمة تُفعَّل في الفرع المقبول فقط.",
    rescheduleSub: "جونسون · الزهراء والحمراء · موديول التظليل · مسودة لينكار",
    slot: "20 أكتوبر 2026 · 9:00 ص",
    assessorKey: "u-2",
  },
  {
    id: "V-ND-SF-001",
    tab: "scheduled",
    branch: "فرع الصفا",
    reason: "مغسلة الندى · منشأة جديدة",
    templates: "الجودة الأساسية · الغسيل",
    at: "22 أكتوبر 2026 · 9 ص",
    assessor: "ماجد ف.",
    pill: { label: "مجدولة", tone: "info" },
    title: "زيارة · فرع الصفا",
    subtitle: "مغسلة الندى · منشأة جديدة JR-0210",
    heroTitle: "مغسلة الندى · فرع واحد",
    heroLines: ["22 أكتوبر 2026 · 9:00 ص · المقيّم ماجد ف.", "المنشأة غير مفعّلة حتى القبول · LK-ND-001"],
    cards: [
      {
        title: "الزيارة",
        rows: [
          ["القوالب", "الجودة الأساسية (16) + الغسيل (19)"],
          ["بيانات المغسلة", "يدوي وآلي · 3 فتحات غسيل · 2 تنشيف · 6 مواقف"],
          ["مسؤول التواصل", "عادل السبيعي · 050 771 3390"],
        ],
      },
    ],
    rescheduleSub: "مغسلة الندى · فرع الصفا · منشأة جديدة",
    slot: "22 أكتوبر 2026 · 9:00 ص",
    assessorKey: "u-6",
  },
  {
    id: "V-DR-NS-003",
    tab: "pending",
    branch: "فرع النسيم",
    reason: "درع · فرع جديد",
    templates: "الجودة الأساسية · PPF",
    at: "12 أكتوبر 2026",
    assessor: "ماجد ف.",
    pill: { label: "بانتظار القرار", tone: "warning" },
    title: "زيارة · فرع النسيم",
    subtitle: "مركز درع للحماية · فرع جديد",
    heroTitle: "النتيجة المحسوبة: 84 · ذهبي",
    heroLines: ["12 أكتوبر 2026 · المقيّم ماجد ف.", "القرار المقترح تلقائياً: قبول"],
    cards: [
      {
        title: "النتيجة حسب القالب",
        rows: [
          ["الجودة الأساسية", "86%"],
          ["حماية PPF", "82%"],
          ["المتوسط والفئة", "84 · ذهبي (80–89)"],
        ],
      },
      {
        title: "بعد الاعتماد",
        rows: [
          ["كود الفرع", "LK-DR-NS-003"],
          ["الظهور للعملاء", "فور الاعتماد · خدمات PPF ونانو"],
        ],
      },
    ],
    decision: { toast: "صدر القرار: فرع النسيم مقبول · ذهبي 84 · الكود LK-DR-NS-003 · أُبلغ المزوّد", donePill: "مكتملة · ذهبي 84" },
    branchCode: "LK-DR-NS-003",
    assessorKey: "u-6",
  },
  {
    id: "V-RM-SM-001",
    tab: "done",
    branch: "فرع السامر",
    reason: "مركز الريم · منشأة جديدة JR-0209",
    templates: "الجودة الأساسية · نانو",
    at: "5 أكتوبر 2026",
    assessor: "لينا الحربي",
    pill: { label: "مكتملة · فضي 79", tone: "success" },
    title: "زيارة · فرع السامر",
    subtitle: "مركز الريم · منشأة جديدة · JR-0209",
    heroTitle: "النتيجة: 79 · فضي",
    heroPill: "مقبول",
    heroLines: ["5 أكتوبر 2026 · المقيّمة لينا الحربي", "اعتُمد القرار 6 أكتوبر 2026 · بانتظار تسعير أول خدمة"],
    cards: [
      {
        title: "النتيجة حسب القالب",
        rows: [
          ["الجودة الأساسية", "81%"],
          ["الغسيل", "77%"],
          ["التلميع", "79%"],
          ["المتوسط والفئة", "79 · فضي (70–79)"],
          ["ملاحظات التحسين", "فصل المناشف والأدوات · مظلة لانتظار العملاء"],
        ],
      },
    ],
  },
  {
    id: "V-LM-OL-SURPRISE",
    tab: "done",
    branch: "فرع العليا",
    reason: "لومار · زيارة مفاجئة",
    templates: "تطبيق المعايير",
    at: "4 أكتوبر 2026",
    assessor: "ماجد ف.",
    pill: { label: "مكتملة · مطابق", tone: "success" },
    title: "زيارة مفاجئة · فرع العليا",
    subtitle: "لومار LLumar · زيارة مفاجئة",
    heroTitle: "تطبيق المعايير: مطابق",
    heroLines: ["4 أكتوبر 2026 · المقيّم ماجد ف. · دون إبلاغ مسبق", "الفئة باقية: بلاتيني 93"],
    cards: [
      {
        title: "ما فُحص",
        rows: [
          ["المنتج المستخدم", "‏LLumar IRX · مطابق للشهادة"],
          ["غرفة التطبيق", "نظيفة ومعزولة"],
          ["مدة التنفيذ", "ضمن الرينج المعلن (4–5 ساعات)"],
        ],
      },
    ],
  },
];
// الزيارات المكتملة قبل اللي في القائمة (عدّاد «المكتملة» 212 = 210 + السامر + العليا)
const DONE_BEFORE = 210;

const visitRow = (v: VisitDetail): VisitRow => ({ id: v.id, tab: v.tab, branch: v.branch, reason: v.reason, templates: v.templates, at: v.at, assessor: v.assessor, pill: v.pill });
const findVisit = (id: string) => {
  const v = visits.find((x) => x.id === id);
  if (!v) throw new ApiError(404, "الزيارة غير موجودة");
  return v;
};
const visitCounts = () => ({
  scheduled: visits.filter((v) => v.tab === "scheduled").length,
  pending: visits.filter((v) => v.tab === "pending").length,
  done: DONE_BEFORE + visits.filter((v) => v.tab === "done").length,
});

export interface ScheduleInput {
  provider: string;
  branch: string;
  reason: (typeof VISIT_REASONS)[number];
  assessor: string;
  slot: string;
  notify: boolean;
}

export const fieldVisitsApi = {
  /** GET /field-visits?tab= → { items, total, counts } */
  list: async ({ tab = "scheduled" }: { tab?: VisitTab } = {}) => {
    const items = visits.filter((v) => v.tab === tab).map(visitRow);
    return delay({ items: clone(items), total: items.length, counts: visitCounts() });
  },
  /** بطاقات الأرقام أعلى الصفحة (CON5-17) */
  kpis: async () => {
    const pending = visits.filter((v) => v.tab === "pending");
    const scheduled = visits.filter((v) => v.tab === "scheduled");
    return delay(
      {
        avgScore: 84,
        avgTier: "ذهبي في المتوسط",
        acceptRate: "86%",
        visitsYear: `${DONE_BEFORE + 2} زيارة`,
        pending: pending.length,
        // «درع · النسيم»
        pendingHint: pending.map((v) => `${v.reason.split(" · ")[0]} · ${v.branch.replace("فرع ", "")}`).join(" · "),
        upcoming: scheduled.length,
        // «14 · 20 · 22 أكتوبر 2026»
        upcomingHint: scheduled.length ? `${scheduled.map((v) => v.at.split(" ")[0]).join(" · ")} أكتوبر 2026` : "",
      },
      200,
    );
  },
  get: async (id: string) => delay(clone(findVisit(id)), 200),
  /** «جدولة الزيارة» (CON5-17M 3114:64092) → CON5-17T «جُدولت الزيارة» 3114:63842 */
  schedule: async (v: ScheduleInput) => {
    const t = SCHEDULE_TARGETS.find((p) => p.provider === v.provider);
    const b = t?.branches.find((x) => x.code === v.branch);
    if (!t || !b) throw new ApiError(422, "تحقق من الحقول", { branch: "اختر الفرع" });
    if (!v.slot) throw new ApiError(422, "تحقق من الحقول", { slot: "اختر الموعد" });
    const a = ASSESSORS.find((x) => x.value === v.assessor) ?? ASSESSORS[0];
    const provider = t.providerLabel.split(" · ")[0];
    const existing = visits.find((x) => x.tab === "scheduled" && x.branchCode === b.code);
    const base: VisitDetail = existing ?? {
      id: `V-${b.code.slice(3)}-${visits.length + 1}`,
      tab: "scheduled",
      branch: b.name,
      reason: "",
      templates: "",
      at: "",
      assessor: "",
      pill: { label: "مجدولة", tone: "info" },
      title: `زيارة · ${b.name}`,
      subtitle: "",
      heroTitle: "",
      heroLines: ["", ""],
      cards: [],
      branchCode: b.code,
    };
    Object.assign(base, {
      reason: `${provider.split(" ")[0]} · ${v.reason} ${b.code}`,
      templates: b.templates.map((x) => x.split(" · ")[0]).join(" · "),
      at: shortSlot(v.slot),
      slot: v.slot,
      assessor: a.short,
      assessorKey: a.value,
      subtitle: `${provider} · ${v.reason} ${b.code}`,
      heroTitle: `${provider.split(" ")[0]} · ${v.reason}`,
      heroLines: [`${v.slot} · ${a.she ? "المقيّمة" : "المقيّم"} ${a.short}`, v.notify ? `أُبلغ المزوّد 14 أكتوبر 2026 · ${b.code}` : `زيارة دون إبلاغ مسبق · ${b.code}`],
      cards: [{ title: "الزيارة", rows: [["القوالب", b.templates.map((x) => x.replace(" · ", " (") + ")").join(" + ")], ["الفرع", b.label], ["المنشأة", t.providerLabel]] }],
      rescheduleSub: `${provider.split(" ")[0]} · ${b.name} · ${v.reason}`,
    });
    if (!existing) visits = [...visits.filter((x) => x.tab === "scheduled"), base, ...visits.filter((x) => x.tab !== "scheduled")];
    return delay({ id: base.id, branch: b.name, slot: v.slot }, 450);
  },
  /** «حفظ الموعد» (CON5-17M 3114:64161) → «أُعيدت جدولة زيارة الزهراء والحمراء إلى 22 أكتوبر 2026 · 11 ص وأُبلغ المزوّد» */
  reschedule: async (id: string, v: { assessor: string; slot: string; reason: string }) => {
    if (!v.reason.trim()) throw new ApiError(422, "تحقق من الحقول", { reason: "اكتب السبب" });
    const x = findVisit(id);
    const a = ASSESSORS.find((o) => o.value === v.assessor) ?? ASSESSORS[0];
    Object.assign(x, { slot: v.slot, at: shortSlot(v.slot), assessor: a.short, assessorKey: a.value });
    x.heroLines = [`${v.slot} · ${a.she ? "المقيّمة" : "المقيّم"} ${a.short}`, x.heroLines[1]];
    return delay({ toast: `أُعيدت جدولة زيارة ${x.branch} إلى ${shortSlot(v.slot)} وأُبلغ المزوّد` }, 450);
  },
  /** «إلغاء الزيارة» (CON5-17M 3114:64191) → الطلب يرجع «بانتظار الزيارة» (بيختفي من المجدولة) */
  cancel: async (id: string, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "تحقق من الحقول", { reason: "اكتب سبب الإلغاء" });
    findVisit(id);
    visits = visits.filter((x) => x.id !== id);
    return delay({ toast: "أُلغيت الزيارة وأُبلغ المزوّد بالسبب · يبقى الطلب «بانتظار الزيارة»" }, 450);
  },
  /** «اعتماد القرار» في درج «بانتظار القرار» → CON5-17T «صدر قرار النسيم» */
  decide: async (id: string) => {
    const x = findVisit(id);
    if (x.tab !== "pending" || !x.decision) throw new ApiError(409, "لا يوجد قرار معلّق");
    const toast = x.decision.toast;
    Object.assign(x, { tab: "done", heroPill: "مقبول", pill: { label: x.decision.donePill, tone: "success" } });
    x.heroLines = [x.heroLines[0], "اعتُمد القرار 14 أكتوبر 2026"];
    return delay({ toast }, 450);
  },
  /** «تقرير الزيارة PDF» → CON5-17T 3114:64042 (الخادم يرجّع رابط مؤقت) */
  report: async (id: string) => {
    findVisit(id);
    return delay({ url: `/files/visits/${id}.pdf`, toast: "جاري تنزيل تقرير الزيارة (PDF) · يتضمن المعايير والصور والنتيجة" }, 300);
  },
};

// ───────────── تصنيف المراكز والاعتماد (CON5-17C 3114:62451) ─────────────

export type CenterTab = "all" | "trial" | "pending" | "drafts" | "rejected";
export const CENTER_TABS: { key: CenterTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "trial", label: "تحت التجربة" },
  { key: "pending", label: "ينتظر القرار" },
  { key: "drafts", label: "مسودات" },
  { key: "rejected", label: "غير مقبول" },
];
/** سطر أسفل الجدول لكل تبويب (Figma) */
export const CENTER_FOOT: Record<Exclude<CenterTab, "all">, string> = {
  trial: "مركزان تحت التجربة · التجربة 90 يوماً من تاريخ التفعيل",
  pending: "انتهت فترة التجربة · القرار: منح الشارة أو تمديد 30 يوماً أو إيقاف",
  drafts: "تقييمات لم تكتمل",
  rejected: "أقل من 70 في أي موديول · لا ينضم للمنصة",
};
/** تبويب «المعايير ↗» = قائمة معايير التقييم في البيانات المرجعية */
export const CRITERIA_COUNT = 91;

export type Tier = "silver" | "gold" | "platinum";
export const TIERS: Record<Tier, { label: string; letter: string; range: string }> = {
  silver: { label: "فضي", letter: "S", range: "70–79" },
  gold: { label: "ذهبي", letter: "G", range: "80–89" },
  platinum: { label: "بلاتيني", letter: "P", range: "90–100" },
};
/** ألوان الشارات: neutral #EEF1EF/كحلي · pending #FBF3E4/#B7791F · trial #E7F0F8/#2B5F8E · success · danger · navy (معتمد LINKAR ✓) · tier (#FBF1D6/#9A6B00) */
export type CenterTone = "neutral" | "pending" | "trial" | "success" | "danger" | "navy" | "tier";
export type CenterAction = "continue" | "decision" | "direct" | "periodic";
export const CENTER_ACTION_LABEL: Record<CenterAction, { row: string; drawer: string }> = {
  continue: { row: "متابعة التقييم", drawer: "متابعة التقييم" },
  decision: { row: "قرار الاعتماد", drawer: "قرار الاعتماد" },
  direct: { row: "منح مباشر", drawer: "منح مباشر" },
  periodic: { row: "تقييم دوري", drawer: "جدولة تقييم دوري" },
};

export interface CenterRow {
  id: string;
  tab: Exclude<CenterTab, "all"> | "accepted";
  name: string;
  /** «الرياض · فرع واحد» */
  cityLine: string;
  city: string;
  services: string;
  score: number | null;
  scoreBad?: boolean;
  tier: Tier | null;
  status: { label: string; tone: CenterTone; sub?: string } | null;
  accreditation: { label: string; tone: CenterTone; sub?: string } | null;
  date: string;
  dateSub: string;
  action: CenterAction | null;
}

export interface CenterDetail extends CenterRow {
  drawerSub: string;
  hero: { pills: { label: string; tone: CenterTone }[]; value: string };
  tiles: { title: string; rows: [string, string, ("success" | "danger")?][] }[];
  note?: { tone: "pending" | "info" | "danger"; text: string };
  /** نافذة القرار/المنح (CON5-17M) */
  modal?: { practical?: string; practicalBad?: boolean; extendUntil?: string; reason?: string; periodicDate?: string };
}

let centers: CenterDetail[] = [
  {
    id: "lk-wa-001",
    tab: "drafts",
    name: "مركز الواحة للعناية",
    cityLine: "الرياض · فرع واحد",
    city: "الرياض",
    services: "الغسيل · التلميع",
    score: null,
    tier: null,
    status: { label: "مسودة", tone: "neutral", sub: "2 من 2 موديول قيد التعبئة" },
    accreditation: null,
    date: "14 أكتوبر 2026",
    dateSub: "أولي · نوف القحطاني",
    action: "continue",
    drawerSub: "الرياض · فرع النرجس · أولي",
    hero: { pills: [{ label: "مسودة", tone: "neutral" }], value: "مسودة" },
    tiles: [
      { title: "الموديولات", rows: [["الجودة الأساسية", "قيد التعبئة · 79 حتى الآن"], ["الغسيل", "قيد التعبئة · 83 حتى الآن"]] },
      { title: "التقييم", rows: [["المُقيّم", "نوف القحطاني"], ["التاريخ", "14 أكتوبر 2026"]] },
    ],
  },
  {
    id: "lk-dr-001",
    tab: "pending",
    name: "مركز درع للحماية",
    cityLine: "جدة · فرعان",
    city: "جدة",
    services: "حماية PPF · نانو سيراميك",
    score: 84,
    tier: "gold",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "ينتظر القرار", tone: "pending", sub: "النتيجة العملية 89 · انتهت 10 أكتوبر 2026" },
    date: "10 يوليو 2026",
    dateSub: "أولي",
    action: "decision",
    drawerSub: "جدة · فرعان",
    hero: { pills: [{ label: "ينتظر القرار", tone: "pending" }, { label: "ذهبي", tone: "tier" }], value: "84%" },
    tiles: [
      { title: "الموديولات", rows: [["الجودة الأساسية", "85"], ["حماية PPF", "81 · قص إلكتروني +3"], ["نانو سيراميك", "86"]] },
      { title: "التجربة", rows: [["من", "12 يوليو 2026"], ["إلى", "10 أكتوبر 2026 · انتهت"], ["النتيجة العملية", "89 · جاهز للاعتماد", "success"]] },
    ],
    modal: { practical: "89%" },
  },
  {
    id: "lk-lq-001",
    tab: "pending",
    name: "مغاسل اللؤلؤة",
    cityLine: "الدمام · 3 فروع",
    city: "الدمام",
    services: "الغسيل",
    score: 76,
    tier: "silver",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "ينتظر القرار", tone: "pending", sub: "النتيجة العملية 76 · أقل من 80%" },
    date: "12 يوليو 2026",
    dateSub: "أولي",
    action: "decision",
    drawerSub: "الدمام · 3 فروع",
    hero: { pills: [{ label: "ينتظر القرار", tone: "pending" }, { label: "فضي", tone: "tier" }], value: "76%" },
    tiles: [
      { title: "الموديولات", rows: [["الجودة الأساسية", "74"], ["الغسيل", "78"]] },
      { title: "التجربة", rows: [["انتهت", "12 أكتوبر 2026"], ["النتيجة العملية", "76 · أقل من 80%", "danger"], ["أضعف معيار", "التنفيذ في يوم الموعد 88%"]] },
    ],
    note: { tone: "pending", text: "النتيجة العملية أقل من 80%: تمديد التجربة 30 يوماً أو إيقاف المركز." },
    modal: { practical: "76% · أقل من 80%", practicalBad: true, extendUntil: "حتى 11 نوفمبر 2026", reason: "تحسّن آخر شهر · مهلة لرفع نسبة التنفيذ في يوم الموعد" },
  },
  {
    id: "lk-cs-001",
    tab: "trial",
    name: "كار سبا",
    cityLine: "الرياض · 3 فروع",
    city: "الرياض",
    services: "الغسيل · التلميع",
    score: 81,
    tier: "gold",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "تحت التجربة", tone: "trial", sub: "باقي 4 أيام · العملية 83 حتى الآن" },
    date: "18 يوليو 2026",
    dateSub: "أولي",
    action: "direct",
    drawerSub: "الرياض · 3 فروع",
    hero: { pills: [{ label: "تحت التجربة", tone: "trial" }, { label: "ذهبي", tone: "tier" }], value: "81%" },
    tiles: [{ title: "التجربة", rows: [["تنتهي", "18 أكتوبر 2026 · باقي 4 أيام"], ["النتيجة العملية حتى الآن", "83"]] }],
    note: { tone: "info", text: "للمراكز المعروفة: يمكن منح الشارة مباشرة دون انتظار نهاية التجربة، بشرط كتابة السبب." },
    modal: { reason: "سلسلة معروفة بثلاثة فروع ونتيجة عملية 83 حتى الآن" },
  },
  {
    id: "lk-sf-001",
    tab: "trial",
    name: "مركز الصفوة للعناية",
    cityLine: "جدة · فرعان",
    city: "جدة",
    services: "الغسيل · التلميع · نانو",
    score: 78,
    tier: "silver",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "تحت التجربة", tone: "trial", sub: "باقي 29 يوماً" },
    date: "14 أغسطس 2026",
    dateSub: "أولي",
    action: null,
    drawerSub: "جدة · فرعان",
    hero: { pills: [{ label: "تحت التجربة", tone: "trial" }, { label: "فضي", tone: "tier" }], value: "78%" },
    tiles: [{ title: "التجربة", rows: [["تنتهي", "12 نوفمبر 2026 · باقي 29 يوماً"], ["النتيجة العملية حتى الآن", "80"]] }],
  },
  {
    id: "lk-jn-001",
    tab: "accepted",
    name: "جونسون Johnson",
    cityLine: "جدة · 3 فروع",
    city: "جدة",
    services: "نانو · PPF · تلميع · غسيل",
    score: 89,
    tier: "gold",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "معتمد LINKAR ✓", tone: "navy", sub: "منذ 5 أبريل 2026" },
    date: "30 ديسمبر 2025",
    dateSub: "الدوري يستحق 30 ديسمبر 2026",
    action: "periodic",
    drawerSub: "جدة · 3 فروع",
    hero: { pills: [{ label: "معتمد LINKAR ✓", tone: "navy" }, { label: "ذهبي", tone: "tier" }], value: "89%" },
    tiles: [
      { title: "الموديولات", rows: [["الجودة الأساسية", "88"], ["نانو سيراميك", "92"], ["حماية PPF", "86"]] },
      { title: "الاعتماد", rows: [["التقييم الأولي", "30 ديسمبر 2025"], ["معتمد LINKAR منذ", "5 أبريل 2026 · العملية 91"], ["التقييم الدوري القادم", "30 ديسمبر 2026"]] },
    ],
    modal: { periodicDate: "30 ديسمبر 2026" },
  },
  {
    id: "lk-xp-001",
    tab: "accepted",
    name: "‏XPEL السعودية",
    cityLine: "الرياض · 6 فروع",
    city: "الرياض",
    services: "‏PPF · تظليل · نانو",
    score: 94,
    tier: "platinum",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "معتمد LINKAR ✓", tone: "navy", sub: "منح مباشر · وكيل معروف" },
    date: "12 فبراير 2026",
    dateSub: "أولي",
    action: "periodic",
    drawerSub: "الرياض · 6 فروع",
    hero: { pills: [{ label: "معتمد LINKAR ✓", tone: "navy" }, { label: "بلاتيني", tone: "tier" }], value: "94%" },
    tiles: [{ title: "الاعتماد", rows: [["منح مباشر", "12 فبراير 2026"], ["السبب", "وكيل معروف وموثوق للعلامة في المملكة"], ["التقييم الدوري القادم", "12 فبراير 2027"]] }],
    modal: { periodicDate: "12 فبراير 2027" },
  },
  {
    id: "lk-rm-001",
    tab: "accepted",
    name: "مركز الريم",
    cityLine: "الرياض · أول فرع قيد الاعتماد",
    city: "الرياض",
    services: "التلميع · الغسيل",
    score: 79,
    tier: "silver",
    status: { label: "مقبول", tone: "success" },
    accreditation: { label: "بانتظار التفعيل", tone: "neutral", sub: "تبدأ التجربة عند تفعيل أول فرع" },
    date: "2 أكتوبر 2026",
    dateSub: "أولي",
    action: null,
    drawerSub: "الرياض · أول فرع قيد الاعتماد",
    hero: { pills: [{ label: "بانتظار التفعيل", tone: "neutral" }, { label: "فضي", tone: "tier" }], value: "79%" },
    tiles: [{ title: "الحالة", rows: [["مقبول", "5 أكتوبر 2026"], ["التجربة", "تبدأ مع أول حجز منفّذ"]] }],
  },
  {
    id: "lk-fr-001",
    tab: "rejected",
    name: "مغسلة الفارس",
    cityLine: "جدة · فرع واحد",
    city: "جدة",
    services: "الغسيل",
    score: 64,
    scoreBad: true,
    tier: null,
    status: { label: "غير مقبول", tone: "danger", sub: "الجودة الأساسية أقل من 70" },
    accreditation: null,
    date: "2 أكتوبر 2026",
    dateSub: "أولي",
    action: null,
    drawerSub: "جدة · فرع واحد",
    hero: { pills: [{ label: "غير مقبول", tone: "danger" }], value: "64%" },
    tiles: [{ title: "النتيجة", rows: [["الجودة الأساسية", "64 · أقل من 70", "danger"], ["الغسيل", "71"], ["غير متحقق", "طرق غسيل آمنة على الطلاء", "danger"]] }],
    note: { tone: "danger", text: "المركز غير مقبول في التقييم الميداني، فما يقدر ينضم للمنصة ولا ياخذ اعتماد. يمكن طلب تقييم جديد بعد معالجة الملاحظات." },
  },
];

// باقي المراكز المقيّمة (صفحتين 2 و3 من «عرض 1 – 9 من 28») — مقبولة ومعتمدة، بأسماء المراكز اللي في المنصة + مراكز تجريبية
const MORE: [string, string, string, string, number, Tier, string][] = [
  ["lk-lm-001", "لومار LLumar", "الرياض · 4 فروع", "‏PPF · تظليل", 93, "platinum", "3 يناير 2026"],
  ["lk-ns-001", "نانو شيلد", "جدة · فرعان", "نانو · تلميع", 88, "gold", "20 يناير 2026"],
  ["lk-la-001", "مركز لمعة للتلميع", "جدة · 3 فروع", "التلميع · الغسيل", 86, "gold", "8 فبراير 2026"],
  ["lk-ry-001", "مغسلة الريان", "الرياض · فرع واحد", "الغسيل", 77, "silver", "1 مارس 2026"],
  ["lk-x-005", "مركز النخبة للعناية", "الرياض · فرعان", "نانو · تلميع · غسيل", 91, "platinum", "15 مارس 2026"],
  ["lk-x-006", "ستار كار كير", "جدة · فرعان", "التظليل · نانو", 84, "gold", "29 مارس 2026"],
  ["lk-x-007", "مغاسل الندى الذهبية", "الدمام · فرعان", "الغسيل", 75, "silver", "10 أبريل 2026"],
  ["lk-x-008", "مركز الماسة للتلميع", "الرياض · 3 فروع", "التلميع · نانو", 87, "gold", "22 أبريل 2026"],
  ["lk-x-009", "بروتكت برو", "جدة · فرع واحد", "‏PPF · نانو", 92, "platinum", "5 مايو 2026"],
  ["lk-x-010", "مغسلة الأفق", "الرياض · فرع واحد", "الغسيل · التلميع", 78, "silver", "18 مايو 2026"],
  ["lk-x-011", "مركز الضياء", "الدمام · فرعان", "التلميع · الغسيل", 82, "gold", "30 مايو 2026"],
  ["lk-x-012", "تينت هاوس", "الرياض · فرعان", "التظليل", 85, "gold", "9 يونيو 2026"],
  ["lk-x-013", "مركز السحاب", "جدة · فرع واحد", "نانو · تلميع", 90, "platinum", "21 يونيو 2026"],
  ["lk-x-014", "مغسلة البحر", "جدة · فرع واحد", "الغسيل", 74, "silver", "28 يونيو 2026"],
  ["lk-x-015", "كريستال كار", "الرياض · 3 فروع", "نانو · PPF", 89, "gold", "2 يوليو 2026"],
  ["lk-x-016", "مركز الهدى", "الدمام · فرع واحد", "التلميع", 80, "gold", "6 يوليو 2026"],
  ["lk-x-017", "شاين بوكس", "الرياض · فرعان", "الغسيل · التلميع", 83, "gold", "19 أغسطس 2026"],
  ["lk-x-018", "مركز الأصالة", "جدة · فرعان", "التظليل · نانو", 95, "platinum", "2 سبتمبر 2026"],
  ["lk-x-019", "مغسلة النسيم", "الرياض · فرع واحد", "الغسيل", 71, "silver", "16 سبتمبر 2026"],
];
centers = [
  ...centers,
  ...MORE.map(([id, name, cityLine, services, score, tier, date], i): CenterDetail => ({
    id,
    tab: "accepted",
    name,
    cityLine,
    city: cityLine.split(" · ")[0],
    services,
    score,
    tier,
    status: { label: "مقبول", tone: "success" },
    accreditation: i < 19 ? { label: "معتمد LINKAR ✓", tone: "navy", sub: "بعد 3 شهور تقييم عملي" } : { label: "تحت التجربة", tone: "trial", sub: "التجربة 90 يوماً" },
    date,
    dateSub: "أولي",
    action: i < 19 ? "periodic" : null,
    drawerSub: cityLine,
    hero: { pills: [i < 19 ? { label: "معتمد LINKAR ✓", tone: "navy" } : { label: "مقبول", tone: "success" }, { label: TIERS[tier].label, tone: "tier" }], value: `${score}%` },
    tiles: [{ title: "الاعتماد", rows: [["التقييم الأولي", date], ["التقييم الدوري القادم", date.replace("2026", "2027")]] }],
    modal: { periodicDate: date.replace("2026", "2027") },
  })),
];

const PAGE_SIZE = 9;
const findCenter = (id: string) => {
  const c = centers.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "المركز غير موجود");
  return c;
};
const centerRow = (c: CenterDetail): CenterRow => ({
  id: c.id,
  tab: c.tab,
  name: c.name,
  cityLine: c.cityLine,
  city: c.city,
  services: c.services,
  score: c.score,
  scoreBad: c.scoreBad,
  tier: c.tier,
  status: c.status,
  accreditation: c.accreditation,
  date: c.date,
  dateSub: c.dateSub,
  action: c.action,
});

export interface CenterFilters {
  tab?: CenterTab;
  city?: string;
  service?: string;
  tier?: string;
  search?: string;
  page?: number;
}
/** خيارات الفلاتر (المدينة · الخدمة · التصنيف) */
export const CENTER_CITIES = ["الرياض", "جدة", "الدمام"];
export const CENTER_SERVICES = ["الغسيل", "التلميع", "نانو", "PPF", "التظليل"];

export const centersApi = {
  /** GET /centers?tab=&city=&service=&tier=&search=&page= → { items, total, counts, page, pages } */
  list: async ({ tab = "all", city, service, tier, search, page = 1 }: CenterFilters = {}) => {
    const q = search?.trim();
    const filtered = centers.filter(
      (c) =>
        (!city || c.city === city) &&
        (!service || c.services.includes(service)) &&
        (!tier || c.tier === tier) &&
        (!q || c.name.includes(q) || c.cityLine.includes(q) || c.id.includes(q.toLowerCase())),
    );
    const inTab = filtered.filter((c) => tab === "all" || c.tab === tab);
    const pages = Math.max(1, Math.ceil(inTab.length / PAGE_SIZE));
    const p = Math.min(Math.max(1, page), pages);
    const items = inTab.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE).map(centerRow);
    const counts = Object.fromEntries(CENTER_TABS.map((t) => [t.key, centers.filter((c) => t.key === "all" || c.tab === t.key).length])) as Record<CenterTab, number>;
    return delay({ items: clone(items), total: inTab.length, counts, page: p, pages, from: inTab.length ? (p - 1) * PAGE_SIZE + 1 : 0, to: (p - 1) * PAGE_SIZE + items.length });
  },
  /** بطاقات الأرقام + صف التصنيفات (CON5-17C) */
  summary: async () => {
    const evaluated = centers;
    const accepted = centers.filter((c) => c.status?.tone === "success");
    return delay(
      {
        evaluated: evaluated.length,
        accepted: accepted.length,
        trial: centers.filter((c) => c.tab === "trial").length,
        pending: centers.filter((c) => c.tab === "pending").length,
        accredited: centers.filter((c) => c.accreditation?.tone === "navy").length,
        rejected: centers.filter((c) => c.tab === "rejected").length,
        verifyAvg: "84.6%",
        tiers: { silver: 7, gold: 13, platinum: 6 } as Record<Tier, number>,
        upcomingVisits: visits.filter((v) => v.tab === "scheduled").length,
      },
      200,
    );
  },
  get: async (id: string) => delay(clone(findCenter(id)), 200),
  /** «منح الشارة» (CON5-17M منح الشارة 3114:63260 / منح مباشر 3114:63316) → CON5-T1702 */
  grantBadge: async (id: string, reason?: string) => {
    const c = findCenter(id);
    if (c.action === "direct" && !reason?.trim()) throw new ApiError(422, "تحقق من الحقول", { reason: "اكتب سبب القرار" });
    Object.assign(c, {
      tab: "accepted",
      action: "periodic",
      accreditation: { label: "معتمد LINKAR ✓", tone: "navy", sub: c.action === "direct" ? "منح مباشر · 14 أكتوبر 2026" : "منذ 14 أكتوبر 2026" },
    });
    c.hero.pills = [{ label: "معتمد LINKAR ✓", tone: "navy" }, ...c.hero.pills.filter((p) => p.tone === "tier")];
    c.note = undefined;
    return delay({ toast: "مُنحت شارة «معتمد LINKAR» وأُبلغ المركز" }, 450);
  },
  /** «تسجيل القرار» (CON5-17M قرار 3114:63284 · CON5-17P): تمديد 30 يوماً → CON5-T1703 · إيقاف المركز */
  decide: async (id: string, v: { option: "badge" | "extend" | "stop"; reason: string }) => {
    const c = findCenter(id);
    if (!v.reason.trim()) throw new ApiError(422, "تحقق من الحقول", { reason: "اكتب سبب القرار" });
    if (v.option === "badge") return centersApi.grantBadge(id);
    if (v.option === "extend") {
      const until = (c.modal?.extendUntil ?? "حتى 9 نوفمبر 2026").replace("حتى ", "");
      Object.assign(c, { tab: "trial", action: "direct", accreditation: { label: "تحت التجربة", tone: "trial", sub: `مُددت حتى ${until}` } });
      c.hero.pills = [{ label: "تحت التجربة", tone: "trial" }, ...c.hero.pills.filter((p) => p.tone === "tier")];
      return delay({ toast: "مُددت التجربة 30 يوماً وأُبلغ المركز" }, 450);
    }
    Object.assign(c, { tab: "accepted", action: null, accreditation: { label: "موقوف", tone: "danger", sub: "يُخفى المركز عن العملاء" } });
    c.hero.pills = [{ label: "موقوف", tone: "danger" }, ...c.hero.pills.filter((p) => p.tone === "tier")];
    return delay({ toast: "أُوقف المركز وأُبلغ · يُخفى عن العملاء" }, 450);
  },
  /** «جدولة» (CON5-17M تقييم دوري 3114:63336 / 63364) → CON5-T1704 */
  schedulePeriodic: async (id: string, v: { date: string; assessor: string; kind: string }) => {
    const c = findCenter(id);
    if (!v.date) throw new ApiError(422, "تحقق من الحقول", { date: "اختر التاريخ" });
    c.dateSub = `${v.kind === "مفاجئ" ? "المفاجئ" : "الدوري"} مجدول ${v.date}`;
    return delay({ toast: "جُدول التقييم الدوري وأُبلغ المركز" }, 450);
  },
  /** «متابعة التقييم» (مسودة) — النموذج نفسه بيتعبّى من جهاز المقيّم؛ من اللوحة بيتحفظ كمسودة → CON5-T1701 */
  saveDraft: async (id: string) => {
    findCenter(id);
    return delay({ toast: "انحفظ التقييم كمسودة" }, 400);
  },
};

// ───────────── التقييم العملي (CON5-17P 3114:62593) ─────────────

export interface PracticalCriterion {
  n: number;
  title: string;
  value?: string;
  score: number;
  /** «من أرقام المنصة» (المعايير 1–5 تنحسب تلقائياً) أو «يقيّمه فريق لينكار» */
  auto: boolean;
  critical?: boolean;
}
export interface Practical {
  centerId: string;
  name: string;
  sub: string;
  overall: number;
  ready: string;
  threshold: string;
  extendUntil: string;
  reason: string;
  nextVisit: string;
  criteria: PracticalCriterion[];
}

const practicals: Record<string, Practical> = {
  "lk-dr-001": {
    centerId: "lk-dr-001",
    name: "مركز درع للحماية",
    sub: "التجربة من 12 يوليو 2026 إلى 10 أكتوبر 2026 · انتهت · التقييم الميداني 84 · ذهبي",
    overall: 89,
    ready: "جاهز للاعتماد",
    threshold: "80 فأعلى",
    extendUntil: "حتى 9 نوفمبر 2026",
    reason: "أداء ثابت خلال التجربة، ولا شكاوى مثبتة مفتوحة.",
    nextVisit: "يُعاد التقييم الميداني كل سنة · القادم: 10 يوليو 2027.",
    criteria: [
      { n: 1, title: "تقييم العملاء على المنصة", value: "4.8 من 5", score: 5, auto: true },
      { n: 2, title: "نسبة إتمام الحجوزات بدون تعذّر من المزوّد", value: "97%", score: 4, auto: true },
      { n: 3, title: "التنفيذ في يوم الموعد (بديل الالتزام بالمواعيد)", value: "96% · من تاريخ مسح القسيمة", score: 4, auto: true },
      { n: 4, title: "معدل الشكاوى المثبتة لكل 100 حجز", value: "0.6", score: 4, auto: true },
      { n: 5, title: "الرد على الشكاوى خلال المهلة (بديل سرعة الرد)", value: "100% خلال 24 ساعة", score: 5, auto: true },
      { n: 6, title: "تطبيق المعايير على أرض الواقع (زيارة مفاجئة)", value: "زيارة 22 سبتمبر 2026", score: 4, auto: false, critical: true },
      { n: 7, title: "الالتزام بالأسعار المعلنة وسياسات لينكار", score: 5, auto: false, critical: true },
      { n: 8, title: "عدم تحويل العملاء خارج المنصة", score: 5, auto: false, critical: true },
      { n: 9, title: "تسليم الضمان الورقي للعميل وشرح بنوده", score: 4, auto: false },
      { n: 10, title: "حل الشكاوى والتعامل مع العملاء", score: 4, auto: false },
      { n: 11, title: "التعاون مع فريق لينكار", score: 5, auto: false },
    ],
  },
};

export const practicalApi = {
  /** GET /centers/:id/practical */
  get: async (id: string) => {
    const p = practicals[id];
    if (!p) throw new ApiError(404, "لا يوجد تقييم عملي لهذا المركز");
    return delay(clone(p), 250);
  },
  /** تعديل درجة معيار يقيّمه فريق لينكار (المعايير 6–11) — النتيجة العملية تتحسب من جديد */
  setScore: async (id: string, n: number, score: number) => {
    const p = practicals[id];
    const c = p?.criteria.find((x) => x.n === n);
    if (!p || !c || c.auto) throw new ApiError(422, "المعيار يُحسب من أرقام المنصة");
    c.score = score;
    // النتيجة = متوسط الدرجات من 5 كنسبة مئوية (89 = 49/55 تقريباً)
    p.overall = Math.round((p.criteria.reduce((s, x) => s + x.score, 0) / (p.criteria.length * 5)) * 100);
    p.ready = p.overall >= 80 ? "جاهز للاعتماد" : "أقل من 80%";
    return delay(clone(p), 200);
  },
};
