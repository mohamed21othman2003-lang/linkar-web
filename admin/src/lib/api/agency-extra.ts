// الوكالات · الجزء الثاني (Figma 3114:2149): بطاقة «بانتظار قرار لينكار» = طلبات الانضمام (DR · CON5-09D) وطلبات الوكالات
// (DQ · CON5-09Q) ونوافذ قرارها، وأدراج القسائم (CON5-09V) ونوافذها، وصفحة «ملف الوكالة» (CON5-09P).
import { ApiError, delay } from "./errors";
import { agenciesApi } from "./agencies";
import { registerDocs } from "./shared";

export interface PendingRow {
  id: string;
  kind: "join" | "dq";
  title: string;
  sub: string;
  pill: string;
  agencyId?: string;
}

/** حالة كل طلب: open = في البطاقة · approved / rejected / waiting (طلب استكمال) = خرج منها */
export type Decision = "open" | "approved" | "rejected" | "waiting";

const pending: (PendingRow & { decision: Decision })[] = [
  { id: "DR-0034", kind: "join", title: "معارض الوسام · DR-0034", sub: "طلب انضمام · 12 أكتوبر 2026 · ائتمان شهري", pill: "بانتظار المراجعة", decision: "open" },
  { id: "DR-0033", kind: "join", title: "شركة المسار لتأجير السيارات · DR-0033", sub: "طلب انضمام · 8 أكتوبر 2026 · رصيد مسبق", pill: "بانتظار المراجعة", decision: "open" },
  { id: "DQ-2026-0012", kind: "dq", title: "‏DQ-2026-0012 · الريادة للسيارات", sub: "رفع حد الائتمان من 300,000 إلى 400,000 ر.س · اليوم", pill: "بانتظار القرار", agencyId: "DL-014", decision: "open" },
  { id: "DQ-2026-0013", kind: "dq", title: "‏DQ-2026-0013 · الريادة للسيارات", sub: "تعديل العنوان · اليوم", pill: "بانتظار القرار", agencyId: "DL-014", decision: "open" },
  { id: "DQ-2026-0014", kind: "dq", title: "‏DQ-2026-0014 · الريادة للسيارات", sub: "تغيير عميل القسيمة · BK-21414 · اليوم", pill: "بانتظار القرار", agencyId: "DL-014", decision: "open" },
  { id: "DQ-2026-0015", kind: "dq", title: "‏DQ-2026-0015 · الريادة للسيارات", sub: "إلغاء قسيمة · BK-21411 · اليوم", pill: "بانتظار القرار", agencyId: "DL-014", decision: "open" },
];

export const setDecision = (id: string, d: Decision) => {
  const p = pending.find((x) => x.id === id);
  if (!p) throw new ApiError(404);
  p.decision = d;
};

export const agencyExtraApi = {
  pending: async () => {
    const items: PendingRow[] = pending.filter((p) => p.decision === "open").map((p) => ({ id: p.id, kind: p.kind, title: p.title, sub: p.sub, pill: p.pill, agencyId: p.agencyId }));
    return delay({ items, total: items.length });
  },
};

// ───────────── طلبات الانضمام DR (CON5-09D · 3114:3920 / 4015) ─────────────
export interface JoinDoc {
  title: string;
  file?: string;
}
export interface JoinRequest {
  id: string;
  name: string;
  /** «شركة المسار» في نافذة الرفض والاستكمال */
  short: string;
  date: string;
  heroLine: string;
  city: string;
  cr: string;
  vat: string;
  contacts: string;
  pay: "ائتمان شهري" | "رصيد مسبق";
  docs: JoinDoc[];
  waitSince?: string;
  amount: string;
  completeNote: string;
}
const joins: JoinRequest[] = [
  {
    id: "DR-0034",
    name: "معارض الوسام",
    short: "معارض الوسام",
    date: "12 أكتوبر 2026",
    heroLine: "جدة · المدن: جدة، مكة المكرمة · 40 – 60 باقة شهرياً",
    city: "جدة",
    cr: "4030612877",
    vat: "311455120900003",
    contacts: "فيصل الوسام · مدير المبيعات · 055 •••• 2210 · الجوال موثّق",
    pay: "ائتمان شهري",
    docs: [
      { title: "السجل التجاري", file: "CR-4030612877.pdf" },
      { title: "شهادة ضريبة القيمة المضافة", file: "VAT-311455120900003.pdf" },
    ],
    amount: "60,000",
    completeNote: "نسخة السجل التجاري غير واضحة. ارفع نسخة أوضح خلال 7 أيام.",
  },
  {
    id: "DR-0033",
    name: "شركة المسار لتأجير السيارات",
    short: "شركة المسار",
    date: "8 أكتوبر 2026",
    heroLine: "الرياض · المدن: الرياض · 10 – 20 باقة شهرياً",
    city: "الرياض",
    cr: "1010498823",
    vat: "300218845500003",
    contacts: "نواف المسار · مدير الأسطول · 050 •••• 7781 · الجوال موثّق",
    pay: "رصيد مسبق",
    docs: [{ title: "السجل التجاري", file: "CR-1010498823.pdf" }, { title: "شهادة ضريبة القيمة المضافة" }],
    waitSince: "منذ 6 أيام",
    amount: "25,000",
    completeNote: "ارفع شهادة ضريبة القيمة المضافة خلال 7 أيام.",
  },
];

// ───────────── طلبات الوكالات DQ (CON5-09Q · 3114:6393 / 6494 / 9913 / 9972) ─────────────
export interface AgencyRequest {
  id: string;
  agencyId: string;
  agency: string;
  type: string;
  icon: "card" | "edit";
  heroTitle: string;
  heroSub: string;
  rows: { k: string; v: string }[];
  history?: { k: string; v: string }[];
  approveLabel: string;
  /** اعتماد مباشر (من غير نافذة) → التوست */
  approveToast?: string;
  rejectTitle: string;
  rejectRef: string;
  rejectReason: string;
  /** رفع الحد: الحد المطلوب */
  newLimit?: number;
}
const RYADA = { agencyId: "DL-014", agency: "الريادة للسيارات", heroSub: "الريادة للسيارات · DL-014", icon: "edit" as const };
const dqs: AgencyRequest[] = [
  {
    id: "DQ-2026-0012",
    ...RYADA,
    type: "رفع حد الائتمان",
    icon: "card",
    heroTitle: "‏400,000 ر.س",
    heroSub: "الحد المطلوب · الحالي 300,000 ر.س",
    rows: [
      { k: "قدّمه", v: "سامي الغامدي · مدير الحساب" },
      { k: "الحد الحالي", v: "‏300,000 ر.س" },
      { k: "الحد المطلوب", v: "‏400,000 ر.س" },
      { k: "السبب", v: "زيادة طلبات الربع الأخير" },
    ],
    history: [
      { k: "المستخدم الآن", v: "‏200,850 ر.س · 67%" },
      { k: "طلبات آخر 3 أشهر", v: "‏317,950 ر.س · من أغسطس حتى اليوم" },
      { k: "آخر سداد", v: "‏117,100 · INV-2026-09-0151 · 28 سبتمبر 2026" },
      { k: "المتأخرات", v: "لا يوجد" },
    ],
    approveLabel: "اعتماد الحد",
    rejectTitle: "رفض طلب رفع الحد",
    rejectRef: "‏DQ-2026-0012 · رفع الحد إلى 400,000 ر.س",
    rejectReason: "نراجع الحد بعد سداد كشف سبتمبر",
    newLimit: 400000,
  },
  {
    id: "DQ-2026-0013",
    ...RYADA,
    type: "تعديل العنوان",
    heroTitle: "تعديل العنوان",
    rows: [
      { k: "قدّمه", v: "سامي الغامدي · مدير الحساب" },
      { k: "البيان", v: "العنوان" },
      { k: "الحالي", v: "شارع التحلية، حي الأندلس، جدة" },
      { k: "الجديد", v: "طريق الملك، حي الشاطئ، جدة" },
    ],
    approveLabel: "اعتماد التعديل",
    approveToast: "اعتُمد تعديل العنوان وتحدّثت بيانات الوكالة",
    rejectTitle: "رفض طلب التعديل",
    rejectRef: "‏DQ-2026-0013 · تعديل العنوان",
    rejectReason: "أرفقوا السجل التجاري بالعنوان الجديد",
  },
  {
    id: "DQ-2026-0014",
    ...RYADA,
    type: "تغيير عميل القسيمة",
    heroTitle: "تغيير عميل القسيمة",
    rows: [
      { k: "قدّمه", v: "فيصل الشهري · مندوب مبيعات · جدة · التحلية" },
      { k: "القسيمة", v: "BK-21414 · LK-3R7D-9KWA · Johnson Ceramic Pro" },
      { k: "الحالي", v: "محمد سالم · 055 ••• 4567" },
      { k: "الجديد", v: "يزن الحربي · 055 771 3360" },
    ],
    approveLabel: "اعتماد التغيير",
    approveToast: "تغيّر العميل وأُرسلت القسيمة إلى العميل الجديد",
    rejectTitle: "رفض طلب التعديل",
    rejectRef: "‏DQ-2026-0014 · تغيير عميل القسيمة",
    rejectReason: "رقم جوال العميل الجديد غير صحيح",
  },
  {
    id: "DQ-2026-0015",
    ...RYADA,
    type: "إلغاء قسيمة",
    heroTitle: "إلغاء قسيمة",
    rows: [
      { k: "قدّمه", v: "فيصل الشهري · مندوب مبيعات · جدة · التحلية" },
      { k: "القسيمة", v: "BK-21411 · LK-8WHM-4BRT · تلميع خارجي + طبقة طاردة للماء · SUV متوسط" },
      { k: "العميل", v: "إبراهيم القرشي · 054 ••• 2208" },
      { k: "المبلغ · شامل الضريبة", v: "1,300 ر.س · إشعار دائن في كشف الوكالة" },
    ],
    approveLabel: "اعتماد الإلغاء",
    approveToast: "أُلغيت القسيمة وصدر إشعار دائن بقيمتها في كشف الوكالة",
    rejectTitle: "رفض طلب التعديل",
    rejectRef: "‏DQ-2026-0015 · إلغاء قسيمة",
    rejectReason: "القسيمة محجوزة لموعد في الفرع",
  },
];

/** CON5-DD · سبب الرفض (طلبات الانضمام) */
export const JOIN_REJECT_REASONS = ["مستندات غير مكتملة", "النشاط لا يناسب برنامج الوكالات", "بيانات غير صحيحة", "طلب مكرر"];
const REJECT_TOAST = "رُفض الطلب وأُبلغت الوكالة بالسبب";
const decisionOf = (id: string) => pending.find((p) => p.id === id)?.decision ?? "open";

export const agencyRequestsApi = {
  join: async (id: string) => {
    const j = joins.find((x) => x.id === id);
    if (!j) throw new ApiError(404);
    return delay({ ...j, decision: decisionOf(id) }, 200);
  },
  dq: async (id: string) => {
    const q = dqs.find((x) => x.id === id);
    if (!q) throw new ApiError(404);
    return delay({ ...q, decision: decisionOf(id) }, 200);
  },
  /** CON5-09M · اعتماد · DR → تتفعّل الوكالة برقم DL-… */
  approveJoin: async (id: string, arrangement: "credit" | "prepaid", amount: number) => {
    const j = joins.find((x) => x.id === id);
    if (!j) throw new ApiError(404);
    if (!(amount > 0)) throw new ApiError(422, "", { amount: "أدخل المبلغ" });
    const r = await agenciesApi.create({ name: j.name, city: j.city, branches: 1, contact: j.contacts.split(" · ")[0], phone: "0550000000", arrangement, limit: amount, alertAt: Math.round(amount / 5) });
    setDecision(id, "approved");
    return { toast: `اعتُمدت ${j.name} ${r.id} وتفعّلت · أُرسل رابط البوابة` };
  },
  rejectJoin: async (id: string) => {
    setDecision(id, "rejected");
    return delay({ toast: REJECT_TOAST });
  },
  completeJoin: async (id: string, items: string[]) => {
    if (!items.length) throw new ApiError(422, "", { items: "اختر المطلوب استكماله" });
    setDecision(id, "waiting");
    return delay({ toast: "أُرسل طلب الاستكمال للجهة" });
  },
  /** اعتماد DQ: رفع الحد عبر نافذة (T0927) أو اعتماد مباشر (T0928 · T0921 · T0922) */
  approveDq: async (id: string, limit?: number) => {
    const q = dqs.find((x) => x.id === id);
    if (!q) throw new ApiError(404);
    if (q.newLimit) {
      const l = limit ?? q.newLimit;
      await agenciesApi.updateLimit(q.agencyId, l, q.type);
      setDecision(id, "approved");
      return { toast: `اعتُمد الحد الجديد ${l.toLocaleString("en-US")} ر.س وأُبلغت الوكالة` };
    }
    setDecision(id, "approved");
    return delay({ toast: q.approveToast ?? "اعتُمد الطلب" });
  },
  rejectDq: async (id: string, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "", { reason: "اكتب سبب الرفض" });
    setDecision(id, "rejected");
    return delay({ toast: REJECT_TOAST });
  },
};

// مستندات طلبات الانضمام في «معاينة مستند» المشتركة (CON5-M00 · ?modal=m00-preview&doc=…)
const crDoc = (no: string, name: string, city: string) => ({
  id: `CR-${no}`,
  kind: "السجل التجاري",
  file: `CR-${no}.pdf`,
  page: 1,
  pages: 2,
  authority: "وزارة التجارة · المملكة العربية السعودية",
  title: "شهادة السجل التجاري",
  fields: [
    ["رقم السجل", no],
    ["اسم المنشأة", name],
    ["المدينة", city],
    ["تاريخ الانتهاء", "18 مارس 2028"],
    ["النشاط", "بيع وتأجير السيارات"],
  ] as [string, string][],
});
registerDocs([
  crDoc("4030612877", "معارض الوسام", "جدة"),
  crDoc("1010498823", "شركة المسار لتأجير السيارات", "الرياض"),
  {
    id: "VAT-311455120900003",
    kind: "شهادة ضريبة القيمة المضافة",
    file: "VAT-311455120900003.pdf",
    page: 1,
    pages: 1,
    authority: "هيئة الزكاة والضريبة والجمارك",
    title: "شهادة التسجيل في ضريبة القيمة المضافة",
    fields: [
      ["الرقم الضريبي", "311455120900003"],
      ["اسم المكلف", "معارض الوسام"],
      ["تاريخ التسجيل", "4 يناير 2021"],
    ],
  },
]);
