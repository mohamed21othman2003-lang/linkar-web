// المرحلة 2 · الميزات المدفوعة «ظهورك على لينكار» CON5-22 (Figma «v5 · 22 · الميزات المدفوعة» 3114:64758).
// لكل مقدّم خدمة شهر مجاني ثم اشتراك. النصوص حرفياً من الإطارات (الصفحة 3114:64759 · النوافذ CON5-22M · الرسائل CON5-22T).
import { ApiError, delay } from "./errors";

export type SubStatus = "trial" | "monthly" | "yearly" | "expired" | "not-started" | "stopped";

export const SUB_STATUS: Record<SubStatus, { label: string; tone: string }> = {
  trial: { label: "تجربة مجانية", tone: "bg-[#fdf3e1] text-warning" },
  monthly: { label: "مفعّلة · شهري", tone: "bg-success-tint text-success" },
  yearly: { label: "مفعّلة · سنوي", tone: "bg-success-tint text-success" },
  expired: { label: "انتهت · طلب تواصل", tone: "bg-[#fbeaea] text-danger" },
  "not-started": { label: "لم تبدأ", tone: "bg-surface-2 text-[#4a5550]" },
  stopped: { label: "موقوفة", tone: "bg-surface-2 text-[#4a5550]" },
};

export interface Subscription {
  providerId: string;
  name: string;
  code: string;
  status: SubStatus;
  start: string;
  /** «النهاية · التجديد» */
  end: string;
  /** «الاستخدام · سبتمبر» */
  views: number | null;
  /** «إدارة الاشتراك» (CON5-22M · لومار / XPEL) */
  since?: string;
  renewal?: string;
  phone?: string;
}

let subs: Subscription[] = [
  { providerId: "lk-jn-001", name: "جونسون", code: "LK-JN-001", status: "trial", start: "1 أكتوبر 2026", end: "31 أكتوبر 2026", views: 12480 },
  { providerId: "lk-lm-001", name: "لومار", code: "LK-LM-001", status: "monthly", start: "1 سبتمبر 2026", end: "يتجدد 1 نوفمبر 2026", views: 9210, since: "1 سبتمبر 2026", renewal: "التجديد القادم 1 نوفمبر 2026 · 1,500" },
  { providerId: "lk-xp-001", name: "XPEL السعودية", code: "LK-XP-001", status: "yearly", start: "1 يناير 2026", end: "31 ديسمبر 2026", views: 18600, since: "1 أكتوبر 2026", renewal: "التجديد القادم 1 نوفمبر 2026 · 1,500" },
  { providerId: "lk-ns-001", name: "نانو شيلد", code: "LK-NS-001", status: "expired", start: "14 أغسطس 2026", end: "13 سبتمبر 2026", views: null, phone: "0553402211" },
  { providerId: "lk-rm-001", name: "مركز الريم", code: "LK-RM-001", status: "not-started", start: "مع أول حجز", end: "—", views: null },
];

/** «الخطة» (CON5-DD 3114:69491) */
export const PLANS = ["شهرية · 1,500 ر.س", "ربع سنوية · 4,050 ر.س", "سنوية · 15,000 ر.س"];
/** «التجربة المجانية» (CON5-DD 3114:69509) */
export const TRIALS = ["3 أيام", "7 أيام", "14 يوماً", "30 يوماً", "90 يوماً"];
/** «الدفع» في إعدادات الخطة (CON5-DD 3114:69523) */
export const PAYMENTS = ["خصم من مستحقات المزوّد الشهرية", "تحويل بنكي مباشر", "بطاقة ائتمانية"];
/** ما تشمله الخطة (CON5-22M · إعدادات الخطة 3114:64951) — [في التجربة, بعد الاشتراك] */
export const PLAN_FEATURES: [string, boolean, boolean][] = [
  ["مشاهدات الخدمات والبروفايل", true, true],
  ["الظهور في البحث والكلمات", true, true],
  ["المقارنات ومن فضّل غيره", true, true],
  ["أكثر الأيام والأسابيع نشاطاً", true, true],
  ["أفكار لزيادة الحجوزات", false, true],
];

let plan = { price: 1500, trial: "30 يوماً", payment: PAYMENTS[0] };

export const paidFeaturesApi = {
  list: async () => {
    const active = subs.filter((s) => s.status === "monthly" || s.status === "yearly");
    return delay(
      {
        items: subs.map((s) => ({ ...s })),
        total: subs.length,
        kpis: {
          trial: { value: 14, hint: "تنتهي 4 هذا الأسبوع" },
          active: { value: active.length + 3, hint: "4 شهرية تُخصم من المستحقات · XPEL سنوية" },
          expired: { value: 3, hint: "طلب تواصل واحد جديد" },
          revenue: { value: 7250, hint: "أكتوبر" },
        },
      },
      300,
    );
  },
  get: async (providerId: string) => {
    const s = subs.find((x) => x.providerId === providerId);
    if (!s) throw new ApiError(404, "المزوّد غير موجود");
    return delay({ ...s }, 120);
  },
  plan: async () => delay({ ...plan }, 150),
  /** CON5-22M · إعدادات الخطة → CON5-22T «حُفظت إعدادات خطة «ظهورك على لينكار» وتسري على الاشتراكات الجديدة» */
  savePlan: async (v: { price: number; trial: string; payment: string }) => {
    if (!(v.price > 0)) throw new ApiError(422, "تحقق من الحقول", { price: "اكتب السعر الشهري" });
    plan = { ...v };
    return delay({ ok: true, toast: "حُفظت إعدادات خطة «ظهورك على لينكار» وتسري على الاشتراكات الجديدة" }, 500);
  },
  /** CON5-22M · تفعيل الميزة → CON5-22T «فُعّل «ظهورك على لينكار» لجونسون من 1 نوفمبر 2026» */
  activate: async (providerId: string, v: { plan: string; start: string; payment: string }) => {
    const s = subs.find((x) => x.providerId === providerId);
    if (!s) throw new ApiError(404, "المزوّد غير موجود");
    const yearly = v.plan.startsWith("سنوية");
    subs = subs.map((x) => (x.providerId === providerId ? { ...x, status: yearly ? "yearly" : "monthly", start: v.start, end: `يتجدد ${v.start}`, since: v.start, renewal: `التجديد القادم ${v.start} · ${v.plan.split(" · ")[1]?.replace(" ر.س", "") ?? ""}` } : x));
    return delay({ ok: true, toast: `فُعّل «ظهورك على لينكار» ل${s.name} من ${v.start}` }, 500);
  },
  /** «تمديد التجربة 14 يوماً» → CON5-22T «مُددت تجربة جونسون 14 يوماً حتى 14 نوفمبر 2026» */
  extendTrial: async (providerId: string) => {
    const s = subs.find((x) => x.providerId === providerId);
    if (!s) throw new ApiError(404, "المزوّد غير موجود");
    const until = "14 نوفمبر 2026";
    subs = subs.map((x) => (x.providerId === providerId ? { ...x, end: until } : x));
    return delay({ ok: true, toast: `مُددت تجربة ${s.name} 14 يوماً حتى ${until}` }, 500);
  },
  /** CON5-22M · إدارة الاشتراك «حفظ» → CON5-22T «حُفظ تعديل الاشتراك وأُبلغ المزوّد» */
  saveSubscription: async (providerId: string) => {
    if (!subs.some((x) => x.providerId === providerId)) throw new ApiError(404, "المزوّد غير موجود");
    return delay({ ok: true, toast: "حُفظ تعديل الاشتراك وأُبلغ المزوّد" }, 400);
  },
  /** «إيقاف الاشتراك» — لا توجد رسالة في Figma */
  stopSubscription: async (providerId: string) => {
    const s = subs.find((x) => x.providerId === providerId);
    if (!s) throw new ApiError(404, "المزوّد غير موجود");
    subs = subs.map((x) => (x.providerId === providerId ? { ...x, status: "stopped", end: "أُوقف 14 أكتوبر 2026" } : x));
    return delay({ ok: true, toast: `أُوقف اشتراك ${s.name} وأُبلغ المزوّد` }, 400);
  },
};
