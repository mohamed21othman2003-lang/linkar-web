// الطلبات (المرحلة 2 · Figma «v5 · 03 · الطلبات» 3114:29232): طلبات مقدّمي الخدمة المعتمدين للينكار وقراراتها.
// كل طلب = صف في الجدول (CON5-03) + درج قرار (CON5-03D) بيرجع من الخادم كبلوكات بالترتيب زي Figma بالظبط.
// نوعين من الأدراج في Figma: «new» (رأس كحلي r16 · بطاقات 14 SemiBold · خيارات قرار · زر تنفيذ أخضر) و«old»
// (رأس كحلي r18 بأيقونة · قبل/بعد · مرفقات · رفض / طلب استكمال / اعتماد بنوافذ CON5-03M).
// نفس الطلبات اللي ظاهرة في لوحة المزوّد: REQ-2026-0427 و0435 (bank.ts) · REQ-2026-0429 (provider-users.ts) · 0414/0421 (branches.ts).
import { ApiError, delay } from "./errors";
import { resolveAccountRequest } from "./bank";
import { registerDocs } from "./shared";

export type ReqTab = "prices" | "services" | "reschedule" | "data";
/** new/review/waiting = «لم يُبتّ فيها» · waiting = أُرسل طلب استكمال ولسه المزوّد ما ردّش */
export type ReqStatus = "new" | "review" | "waiting" | "approved" | "rejected";
export type StatusFilter = "open" | "approved" | "rejected";
export type TypeTone = "danger" | "warning" | "info" | "neutral";
export type HeroTone = "review" | "neon" | "info" | "approved" | "pending" | "rejected";

export const REQ_TABS: { key: "all" | ReqTab; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "prices", label: "تعديل الأسعار" },
  { key: "services", label: "إضافة خدمات" },
  { key: "reschedule", label: "تعذّر وإعادة جدولة" },
  { key: "data", label: "البيانات والحسابات" },
];
export const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "open", label: "لم يُبتّ فيها" },
  { key: "approved", label: "معتمدة" },
  { key: "rejected", label: "مرفوضة" },
];
/** القائمة المرجعية «أسباب رفض الطلبات» (CON5-DD · سبب الرفض) */
export const REJECT_REASONS = ["مستندات غير مكتملة", "المنتج غير معتمد لدى لينكار", "سعر أعلى من الاتفاقية", "لم تجتز الزيارة الميدانية"];
/** CON5-DD · المهلة */
export const DEADLINES = ["3 أيام", "7 أيام", "14 يوماً", "30 يوماً", "90 يوماً"];
/** «المطلوب» في طلب الاستكمال (CON5-03M 3114:30292) */
export const COMPLETE_ITEMS = ["مستند ناقص", "صور", "توضيح السعر", "بيانات الفرع"];

export interface RequestRow {
  id: string;
  tab: ReqTab;
  /** «تعديل سعر» — شارة النوع في الجدول */
  type: string;
  tone: TypeTone;
  provider: string;
  providerId?: string;
  /** «كل الفروع» · «الزهراء» · «المنشأة» */
  scope: string;
  subject: string;
  sub: string;
  /** ISO */
  sentAt: string;
  status: ReqStatus;
  /** false = له درج بس مش في قائمة الطلبات (بيتفتح من ملف المزوّد بالرابط) */
  listed: boolean;
}

export type Act =
  | { kind: "call"; phone: string }
  | { kind: "href"; href: string }
  | { kind: "preview"; doc: string }
  | { kind: "complete" }
  | { kind: "reject" }
  | { kind: "approve" }
  | { kind: "decide" }
  | { kind: "close" };

export interface DecisionOption {
  key: string;
  title: string;
  sub?: string;
  /** حقل جوه الخيار لما يتختار (CON5-03D 0417: «صالحة حتى») */
  field?: { label: string; date: string };
  /** approve/other = ينفّذ ويرجع رسالة · reject = نافذة الرفض · counter = يرجع للمزوّد (بانتظار الرد) */
  effect: "approve" | "other" | "counter" | "reject";
  toast?: string;
}
export interface ProposalRow {
  size: string;
  cost: number;
  newCost: number;
  sale: number;
  newSale: number;
}

export type Block =
  | { kind: "kv"; title: string; rows: [string, string][]; dense?: boolean; hint?: string }
  | { kind: "proposal"; title: string; rows: ProposalRow[] }
  | { kind: "decision"; tile: boolean; options: DecisionOption[] }
  | { kind: "field"; label: string; value: string }
  | { kind: "toggle"; label: string }
  | { kind: "link"; label: string; act: Act }
  // الدرج القديم
  | { kind: "oldKv"; title: string; rows: [string, string][] }
  | { kind: "beforeAfter"; title: string; current: string; requested: string }
  | { kind: "docs"; docs: { name: string; file: string }[] };

export interface FooterBtn {
  label: string;
  icon?: "phone" | "check";
  act: Act;
}
export interface RequestDrawerSpec {
  style: "new" | "old";
  title: string;
  subtitle?: string;
  hero: { pill: { label: string; tone: HeroTone }; title: string; lines: string[]; icon?: "tag" | "edit" };
  blocks: Block[];
  /** الدرج الجديد: زر ثانوي يمين + زر أخضر شمال */
  footer?: { secondary?: FooterBtn; primary?: FooterBtn };
  /** الدرج القديم: رفض · طلب استكمال · اعتماد … (نوافذ CON5-03M) */
  old?: {
    approveLabel: string;
    approveTitle: string;
    approveBullets: string[];
    rejectSub: string;
    completeSub: string;
    completeItem: string;
  };
}
export interface RequestDetail extends RequestRow {
  drawer: RequestDrawerSpec;
  /** رسالة زر الاعتماد المباشر (القسم «T» في Figma) */
  approveToast?: string;
  /** سطر تحت عنوان نافذة الرفض للطلبات الجديدة */
  rejectSub?: string;
  decidedAt?: string;
}

// ───────────── البيانات (MOCK_NOW = 14 أكتوبر 2026) ─────────────
const OCT = (d: number) => `2026-10-${String(d).padStart(2, "0")}`;
const JN = { provider: "جونسون", providerId: "lk-jn-001" };
const FAHD = "0554102290";
const CALL_FAHD: Act = { kind: "call", phone: FAHD };
const NOTIFY_BOTH = "إشعار العميل برسالة وإشعار المزوّد";
const TO_JN_REQUESTS = "/providers/lk-jn-001";

const REQUESTS: RequestDetail[] = [
  // ── CON5-03D · REQ-2026-0437 · طلب خدمة جديدة (3312:210636)
  {
    id: "REQ-2026-0437", tab: "services", type: "طلب خدمة جديدة", tone: "danger", ...JN, scope: "كل الفروع",
    subject: "التظليل · ‏Johnson Window Films", sub: "الزهراء · الحمراء · المحمدية", sentAt: OCT(14), status: "review", listed: true,
    rejectSub: "جونسون · طلب خدمة جديدة",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0437 · طلب خدمة جديدة",
      subtitle: "جونسون · كل الفروع · أُرسل 14 أكتوبر 2026",
      hero: { pill: { label: "قيد النظر", tone: "review" }, title: "التظليل · ‏Johnson Window Films", lines: ["الفروع: الزهراء · الحمراء · المحمدية"] },
      blocks: [
        { kind: "kv", title: "الخدمة المطلوبة", rows: [["التصنيف", "التظليل"], ["المنتج", "‏Johnson Window Films"], ["الفروع", "الزهراء · الحمراء · المحمدية"], ["شهادة اعتماد المنتج", "مرفوعة · PDF"], ["", ""]] },
        {
          kind: "decision", tile: true,
          options: [
            { key: "publish", title: "اعتماد ونشر", effect: "approve", toast: "اعتُمد الطلب ونُشر وأُبلغ المزوّد" },
            { key: "counter", title: "تعديل وإرسال اقتراح للمزوّد", effect: "counter" },
            { key: "reject", title: "رفض مع ذكر السبب", effect: "reject" },
          ],
        },
        { kind: "toggle", label: "إشعار المزوّد" },
      ],
      footer: { secondary: { label: "اتصال بالمزوّد", icon: "phone", act: CALL_FAHD }, primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0438 · إعادة جدولة زيارة (3312:210571)
  {
    id: "REQ-2026-0438", tab: "reschedule", type: "إعادة جدولة زيارة", tone: "danger", ...JN, scope: "الزهراء",
    subject: "‏BK-21392 · بندر ع.", sub: "15 ← 18 أكتوبر 2026 · امتلاء الطاقة", sentAt: OCT(14), status: "review", listed: true,
    rejectSub: "جونسون · ‏BK-21392 · بندر ع.",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0438 · إعادة جدولة زيارة",
      subtitle: "جونسون · فرع الزهراء · أُرسل 14 أكتوبر 2026",
      hero: { pill: { label: "قيد النظر", tone: "review" }, title: "الحجز BK-21392 · بندر ع.", lines: ["الموعد المطلوب: 15 ← 18 أكتوبر 2026 · امتلاء الطاقة الاستيعابية للفرع"] },
      blocks: [
        { kind: "kv", title: "الحجز", rows: [["العميل", "بندر ع. · ‎055 887 2034"], ["الخدمة", "‏Johnson Ceramic Pro · SUV كبير"], ["سعر البيع · شامل الضريبة", "2,499 ر.س"], ["سعر التكلفة · شامل الضريبة", "1,990 ر.س"], ["القسيمة", "صالحة حتى 15 أكتوبر 2026"]] },
        {
          kind: "decision", tile: true,
          options: [
            { key: "approve", title: "اعتماد الموعد الجديد", effect: "approve", toast: "اعتُمد الموعد الجديد 18 أكتوبر 2026 · أُشعر العميل وجونسون" },
            { key: "counter", title: "اقتراح موعد آخر", effect: "counter" },
            { key: "reject", title: "رفض", effect: "reject" },
          ],
        },
        { kind: "toggle", label: NOTIFY_BOTH },
      ],
      footer: { secondary: { label: "اتصال بالعميل", icon: "phone", act: { kind: "call", phone: "0558872034" } }, primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0436 · إعادة جدولة زيارة (3260:193238)
  {
    id: "REQ-2026-0436", tab: "reschedule", type: "إعادة جدولة زيارة", tone: "danger", provider: "لومار", providerId: "lk-lm-001", scope: "الروضة",
    subject: "‏BK-21472 · سارة م.", sub: "20 ← 22 أكتوبر 2026 · امتلاء الطاقة", sentAt: OCT(14), status: "review", listed: true,
    rejectSub: "لومار · ‏BK-21472 · سارة م.",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0436 · إعادة جدولة زيارة",
      subtitle: "لومار · فرع الروضة · أُرسل 14 أكتوبر 2026",
      hero: { pill: { label: "قيد النظر", tone: "review" }, title: "الحجز BK-21472 · سارة م.", lines: ["الموعد المطلوب: 20 ← 22 أكتوبر 2026 · امتلاء الطاقة"] },
      blocks: [
        { kind: "kv", title: "الحجز", rows: [["العميل", "سارة م. · ‎050 664 2097"], ["الخدمة", "تظليل كامل · سيدان"], ["سعر البيع · شامل الضريبة", "1,599 ر.س · مدى"], ["سعر التكلفة · شامل الضريبة", "1,300 ر.س"], ["القسيمة", "LK-3HD8-W1QZ · صالحة حتى 28 أكتوبر 2026"]] },
        {
          kind: "decision", tile: true,
          options: [
            { key: "approve", title: "اعتماد الموعد الجديد", effect: "approve", toast: "اعتُمد الموعد الجديد 22 أكتوبر 2026 · أُشعر العميل ولومار" },
            { key: "counter", title: "اقتراح موعد آخر", effect: "counter" },
            { key: "reject", title: "رفض", effect: "reject" },
          ],
        },
        { kind: "toggle", label: NOTIFY_BOTH },
      ],
      footer: { secondary: { label: "اتصال بالعميل", icon: "phone", act: { kind: "call", phone: "0506642097" } }, primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0435 · إضافة حساب استلام (3114:32515)
  {
    id: "REQ-2026-0435", tab: "data", type: "إضافة حساب استلام", tone: "warning", ...JN, scope: "المحمدية",
    subject: "محفظة STC Pay أعمال", sub: "مخصّصة لمستحقات فرع المحمدية", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمدت محفظة STC Pay أعمال لفرع المحمدية · تبدأ التحويلات عليها من أول دفعة بعد الاعتماد",
    rejectSub: "جونسون · محفظة STC Pay أعمال",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0435 · إضافة حساب استلام",
      subtitle: "جونسون · فرع المحمدية · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "محفظة STC Pay أعمال · لفرع المحمدية", lines: [] },
      blocks: [
        { kind: "kv", title: "الحساب المطلوب", rows: [["نوع الحساب", "محفظة إلكترونية · STC Pay أعمال"], ["الرقم المرتبط", "055 410 2290"], ["باسم", "شركة جونسون للعناية بالسيارات"], ["المستند", "شهادة تسجيل محفظة الأعمال · PDF"], ["الحساب الافتراضي الحالي", "مصرف الراجحي •••• 4471 · كل الفروع"]] },
      ],
      footer: { secondary: { label: "طلب استكمال", act: { kind: "complete" } }, primary: { label: "اعتماد الحساب", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0434 · تعديل باقة (3114:32373)
  {
    id: "REQ-2026-0434", tab: "prices", type: "تعديل باقة", tone: "info", ...JN, scope: "كل الفروع",
    subject: "باقة العناية الكاملة", sub: "تكلفة 1,240 ← 1,280 · بيع مقترح 1,499 ← 1,549 (سيدان)", sentAt: OCT(14), status: "new", listed: true,
    rejectSub: "جونسون · باقة العناية الكاملة",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0434 · تعديل باقة",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: {
        pill: { label: "جديد", tone: "info" },
        title: "باقة العناية الكاملة",
        lines: ["المكوّنات: طبقة طاردة للماء + تلميع + تفصيل داخلي كامل · بدون تغيير", "السبب: ارتفاع تكلفة الطبقة الطاردة (مع REQ-0418) · يسري من 1 نوفمبر 2026"],
      },
      blocks: [
        { kind: "kv", title: "الخدمات والمنتجات في الباقة", dense: true, rows: [["طبقة طاردة للماء + تلميع", "‏Menzerna · ألمانيا · مرحلتان · سنتان (للطبقة الطاردة)"], ["تفصيل داخلي كامل", "‏Koch Chemie · ألمانيا · تعقيم بخار 150° م · بدون ضمان"], ["الفروع", "الزهراء · الحمراء · المحمدية"]] },
        {
          kind: "proposal", title: "اقتراح المزوّد · لكل حجم · شامل الضريبة",
          rows: [
            { size: "سيدان", cost: 1240, newCost: 1280, sale: 1499, newSale: 1549 },
            { size: "‏SUV متوسط", cost: 1400, newCost: 1440, sale: 1699, newSale: 1749 },
            { size: "‏SUV كبير", cost: 1600, newCost: 1640, sale: 1949, newSale: 1999 },
          ],
        },
        {
          kind: "decision", tile: false,
          options: [
            { key: "publish", title: "اعتماد ونشر", effect: "approve", toast: "اعتُمد REQ-2026-0434 · أُعيد نشر «باقة العناية الكاملة» بالأسعار الجديدة من 1 نوفمبر 2026 · أُشعر جونسون" },
            { key: "counter", title: "تعديل وإرسال اقتراح للمزوّد", effect: "counter" },
            { key: "reject", title: "رفض مع ذكر السبب", effect: "reject" },
          ],
        },
        { kind: "link", label: "اتصال بالمزوّد · فهد العتيبي · 055 410 2290", act: CALL_FAHD },
      ],
      footer: { primary: { label: "إرسال", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0433 · بيانات التشغيل (3114:32172)
  {
    id: "REQ-2026-0433", tab: "data", type: "بيانات التشغيل", tone: "neutral", ...JN, scope: "الزهراء",
    subject: "عدد الفنيين 14 ← 16", sub: "انضم فنيّان لقسم PPF من 1 نوفمبر 2026", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد تحديث عدد الفنيين في الزهراء إلى 16 · تُراجع الطاقة في الزيارة القادمة",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0433 · بيانات التشغيل",
      subtitle: "جونسون · فرع الزهراء · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "عدد الفنيين · فرع الزهراء", lines: ["14 فنياً ← 16 فنياً"] },
      blocks: [{ kind: "kv", title: "التحديث", rows: [["البيان", "عدد الفنيين"], ["الحالي", "14 فنياً"], ["الجديد", "16 فنياً"], ["ملاحظة المزوّد", "انضم فنيّان جديدان لقسم PPF من 1 نوفمبر 2026"]] }],
      footer: { primary: { label: "اعتماد التحديث", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0432 · ساعات العمل (3114:32120)
  {
    id: "REQ-2026-0432", tab: "data", type: "ساعات العمل", tone: "neutral", ...JN, scope: "الزهراء",
    subject: "ساعات الجمعة", sub: "4 م – 11 م ← 2 م – 11 م", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمدت ساعات الجمعة لفرع الزهراء (2 م – 11 م) · تظهر للعملاء",
    rejectSub: "جونسون · ساعات الجمعة · فرع الزهراء",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0432 · ساعات العمل",
      subtitle: "جونسون · فرع الزهراء · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "ساعات الجمعة · فرع الزهراء", lines: ["من 4 م – 11 م إلى 2 م – 11 م"] },
      blocks: [{ kind: "kv", title: "الساعات", rows: [["السبت – الخميس", "9 ص – 11 م · بدون تغيير"], ["الجمعة الحالية", "4 م – 11 م"], ["الجمعة المطلوبة", "2 م – 11 م"], ["يسري من", "23 أكتوبر 2026 بعد الاعتماد"]] }],
      footer: { secondary: { label: "رفض الطلب", act: { kind: "reject" } }, primary: { label: "اعتماد الساعات", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0431 · تعديل بيانات الفرع (3114:32058)
  {
    id: "REQ-2026-0431", tab: "data", type: "تعديل بيانات الفرع", tone: "neutral", ...JN, scope: "الزهراء",
    subject: "العنوان والموقع", sub: "مجمع الزهراء التجاري · عقد إيجار مرفوع", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد تعديل عنوان فرع الزهراء · يظهر للعملاء في صفحة الفرع",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0431 · تعديل بيانات الفرع",
      subtitle: "جونسون · فرع الزهراء · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "العنوان والموقع · فرع الزهراء", lines: [] },
      blocks: [
        { kind: "kv", title: "التعديل المطلوب", rows: [["الحالي", "شارع الأمير سلطان، حي الزهراء، جدة"], ["الجديد", "طريق الأمير سلطان، مجمع الزهراء التجاري، جدة"], ["الموقع", "21.5612, 39.1347 · يبعد 400 م"], ["المستند", "عقد الإيجار · PDF"]] },
        { kind: "link", label: "معاينة عقد الإيجار", act: { kind: "preview", doc: "LEASE-JN-ZH-2026" } },
      ],
      footer: { primary: { label: "اعتماد التعديل", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0430 · إيقاف فرع مؤقت (3114:31999)
  {
    id: "REQ-2026-0430", tab: "data", type: "إيقاف فرع مؤقت", tone: "neutral", ...JN, scope: "الزهراء",
    subject: "1 – 7 نوفمبر 2026", sub: "صيانة منطقة العمل · 6 قسائم في الفترة", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد إيقاف فرع الزهراء من 1 إلى 7 نوفمبر 2026 · أُسند التواصل مع 6 عملاء للينكار",
    rejectSub: "جونسون · إيقاف فرع الزهراء",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0430 · إيقاف فرع مؤقت",
      subtitle: "جونسون · فرع الزهراء · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "إيقاف فرع الزهراء · 1 – 7 نوفمبر 2026", lines: ["السبب: صيانة منطقة العمل وتجديد لوحات الفرع"] },
      blocks: [
        { kind: "kv", title: "الأثر على الحجوزات", rows: [["قسائم صالحة في الفترة", "6 قسائم · أقربها 1 نوفمبر 2026"], ["الإجراء مع العملاء", "تمديد الصلاحية أو التحويل للحمراء أو المحمدية"], ["الحجوزات الجديدة", "تتوقف في الزهراء من 1 إلى 7 نوفمبر 2026"], ["العودة", "تلقائياً 8 نوفمبر 2026"]] },
        { kind: "link", label: "قسائم الزهراء في الفترة · الحجوزات", act: { kind: "href", href: "/bookings?branch=lk-jn-zh-001" } },
      ],
      footer: { secondary: { label: "رفض الطلب", act: { kind: "reject" } }, primary: { label: "اعتماد الإيقاف", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0429 · تحديث جوال المالك (3114:31947) — الاعتماد من نافذة «تحديث جوال المالك» في ملف جونسون (CON5-07M 3114-54351)
  {
    id: "REQ-2026-0429", tab: "data", type: "حساب المالك", tone: "warning", ...JN, scope: "كل الفروع",
    subject: "تحديث جوال الدخول", sub: "فهد العتيبي · المالك", sentAt: OCT(14), status: "new", listed: true,
    rejectSub: "جونسون · تحديث جوال المالك",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0429 · تحديث جوال المالك",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "تحديث جوال دخول المالك", lines: ["فهد العتيبي · 055 410 2290 ← 055 410 7781"] },
      blocks: [
        { kind: "kv", title: "التعديل المطلوب", rows: [["الاسم", "فهد العتيبي · المالك"], ["الجوال الجديد", "055 410 7781"], ["الجوال الحالي", "055 410 2290"]] },
        { kind: "link", label: "مستخدمو جونسون الحاليون (7) · يديرهم المالك", act: { kind: "href", href: `${TO_JN_REQUESTS}?tab=users` } },
      ],
      footer: {
        secondary: { label: "رفض الطلب", act: { kind: "reject" } },
        primary: { label: "تحديث الجوال وإرسال الرمز", icon: "check", act: { kind: "href", href: `${TO_JN_REQUESTS}?tab=users&modal=pu-phone&u=u-fahd` } },
      },
    },
  },
  // ── CON5-03D · REQ-2026-0428 · تعديل بيانات المنشأة (3114:31888)
  {
    id: "REQ-2026-0428", tab: "data", type: "تعديل بيانات المنشأة", tone: "neutral", ...JN, scope: "المنشأة",
    subject: "العنوان الوطني", sub: "‏JDHA 2457، حي الزهراء · مستند مرفوع", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد تعديل العنوان الوطني لجونسون · يظهر في الكشوف والفواتير القادمة",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0428 · تعديل بيانات المنشأة",
      subtitle: "جونسون · المنشأة · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "العنوان الوطني للمنشأة", lines: [] },
      blocks: [
        { kind: "kv", title: "التعديل المطلوب", rows: [["البيان", "العنوان الوطني"], ["الحالي", "‏JDHA 1183، حي الروضة، جدة 23435"], ["الجديد", "‏JDHA 2457، حي الزهراء، جدة 23425"], ["المستند", "‏National-Address.pdf · 180 ك.ب"]] },
        { kind: "link", label: "معاينة المستند", act: { kind: "preview", doc: "NA-JN-2457" } },
      ],
      footer: { secondary: { label: "طلب استكمال", act: { kind: "complete" } }, primary: { label: "اعتماد التعديل", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0427 · تغيير الحساب البنكي (3114:31812)
  {
    id: "REQ-2026-0427", tab: "data", type: "تغيير الحساب الافتراضي", tone: "warning", ...JN, scope: "المنشأة",
    subject: "الراجحي •••• 4471 ← الأهلي •••• 3456", sub: "شهادة الآيبان مرفوعة · قبل دفعة 1 نوفمبر 2026", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد الحساب الجديد لجونسون (الأهلي •••• 3456) · يبدأ التحويل عليه من أول دفعة · أُشعر المزوّد",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0427 · تغيير الحساب البنكي",
      subtitle: "جونسون · المنشأة · 14 أكتوبر 2026 · من فهد العتيبي (المالك)",
      hero: { pill: { label: "جديد", tone: "info" }, title: "من الراجحي إلى البنك الأهلي", lines: [] },
      blocks: [
        { kind: "kv", title: "الحساب الحالي", rows: [["البنك", "مصرف الراجحي"], ["الآيبان", "SA03 8000 •••• •••• •••• 4471"], ["صاحب الحساب", "شركة جونسون للعناية بالسيارات"]] },
        { kind: "kv", title: "الحساب الجديد", rows: [["البنك", "البنك الأهلي السعودي"], ["الآيبان", "SA31 1000 0001 4000 0012 3456"], ["صاحب الحساب", "شركة جونسون للعناية بالسيارات"]] },
        { kind: "link", label: "عرض الحسابات في ملف جونسون", act: { kind: "href", href: `${TO_JN_REQUESTS}?tab=bank` } },
        { kind: "link", label: "اتصال بالمالك", act: CALL_FAHD },
      ],
      footer: { secondary: { label: "طلب استكمال", act: { kind: "complete" } }, primary: { label: "اعتماد الحساب الجديد", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0422 · تعديل خدمة (3114:30462)
  {
    id: "REQ-2026-0422", tab: "data", type: "تعديل خدمة", tone: "info", provider: "نانو شيلد", providerId: "lk-ns-001", scope: "كل الفروع",
    subject: "نانو سيراميك ثلاث طبقات", sub: "إضافة تلميع خفيف · المدة يوم ونصف", sentAt: OCT(14), status: "new", listed: true,
    rejectSub: "نانو شيلد · نانو سيراميك ثلاث طبقات",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0422 · تعديل خدمة",
      subtitle: "نانو شيلد · كل الفروع · 14 أكتوبر 2026",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "نانو سيراميك ثلاث طبقات", lines: ["المطلوب: إضافة «تلميع خفيف قبل التطبيق» لما يشمله، وتعديل المدة من يوم إلى يوم ونصف."] },
      blocks: [
        { kind: "kv", title: "بيانات المنتج", dense: true, rows: [["المنتج", "‏Nano Shield 9H · Nano Shield · الإمارات"], ["عدد الطبقات", "‏3"], ["الضمان", "‏5 سنوات"], ["شهادة المنتج", "منتهية 10 أكتوبر 2026"]] },
        { kind: "kv", title: "التعديل المطلوب", dense: true, rows: [["يشمل", "إضافة «تلميع خفيف قبل التطبيق»"], ["المدة", "يوم واحد ← يوم ونصف"]] },
        { kind: "kv", title: "أثر التعديل", rows: [["قسائم قائمة تُنفَّذ بالتعريف الجديد", "12 قسيمة"], ["السعر · شامل الضريبة", "لا يتغير السعر"]] },
        {
          kind: "decision", tile: true,
          options: [
            { key: "publish", title: "اعتماد ونشر", effect: "approve", toast: "نُشر تعديل تعريف «نانو سيراميك ثلاث طبقات» · أُبلغ نانو شيلد" },
            { key: "counter", title: "تعديل وإرسال اقتراح للمزوّد", effect: "counter" },
            { key: "reject", title: "رفض مع ذكر السبب", effect: "reject" },
          ],
        },
        { kind: "field", label: "يسري من", value: "فور الاعتماد" },
      ],
      footer: { primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0421 · إيقاف خدمة مؤقتاً في فرع (3114:32469)
  {
    id: "REQ-2026-0421", tab: "data", type: "إيقاف خدمة في فرع", tone: "neutral", ...JN, scope: "الزهراء",
    subject: "Johnson Ceramic Pro", sub: "حتى 31 أكتوبر 2026 · ضغط الطاقة في الزهراء", sentAt: OCT(14), status: "new", listed: true,
    approveToast: "اعتُمد إيقاف Johnson Ceramic Pro في الزهراء حتى 31 أكتوبر 2026 · أُشعر جونسون وأصحاب القسائم الأربع",
    rejectSub: "جونسون · ‏Johnson Ceramic Pro · فرع الزهراء",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0421 · إيقاف خدمة مؤقتاً في فرع",
      subtitle: "جونسون · فرع الزهراء · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "جديد", tone: "info" }, title: "‏Johnson Ceramic Pro · فرع الزهراء", lines: ["حتى 31 أكتوبر 2026 · السبب: ضغط الطاقة في الزهراء", "الخدمة تبقى متاحة في الحمراء والمحمدية"] },
      blocks: [
        { kind: "kv", title: "الأثر", rows: [["قسائم صالحة في الفترة", "4 قسائم · تُنفَّذ كما هي أو تُحوَّل للحمراء"], ["الحجوزات الجديدة", "تتوقف في الزهراء حتى 31 أكتوبر 2026"], ["العروض والباقات المتأثرة", "باقة النانو والتلميع في الزهراء · تُخفى في الفترة"], ["العودة", "تلقائياً 1 نوفمبر 2026"]] },
      ],
      footer: { secondary: { label: "رفض الطلب", act: { kind: "reject" } }, primary: { label: "اعتماد الإيقاف", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0420 · حذف خدمة (3114:30405)
  {
    id: "REQ-2026-0420", tab: "data", type: "حذف خدمة", tone: "info", ...JN, scope: "كل الفروع",
    subject: "غسيل وتلميع سريع", sub: "من 1 نوفمبر 2026 · 3 قسائم قائمة تُنفَّذ", sentAt: OCT(14), status: "new", listed: true,
    rejectSub: "جونسون · حذف «غسيل وتلميع سريع»",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0420 · حذف خدمة",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "غسيل وتلميع سريع", lines: ["السبب من المزوّد: إيقاف الخدمة نهائياً لتركيز الفنيين على خدمات الحماية."] },
      blocks: [
        { kind: "kv", title: "الحجوزات المتأثرة", rows: [["قسائم سارية في الزهراء والمحمدية", "3 قسائم"], ["أقرب انتهاء", "25 أكتوبر 2026 · BK-21453"]], hint: "اختر ما يحدث للقسائم القائمة:" },
        {
          kind: "decision", tile: true,
          options: [
            { key: "after", title: "اعتماد الحذف بعد تنفيذ القسائم القائمة", sub: "تختفي الخدمة من الموقع والتطبيق فوراً وتُنفَّذ القسائم الثلاث", effect: "approve", toast: "اعتُمد حذف «غسيل وتلميع سريع» من 1 نوفمبر 2026 · تُنفَّذ القسائم الثلاث القائمة" },
            { key: "convert", title: "اعتماد الحذف وتحويل القسائم لـ«تفصيل داخلي كامل» بنفس سعر العميل", effect: "approve", toast: "اعتُمد حذف «غسيل وتلميع سريع» من 1 نوفمبر 2026 · حُوّلت القسائم الثلاث لـ«تفصيل داخلي كامل»" },
            { key: "reject", title: "رفض الحذف مع ذكر السبب", effect: "reject" },
          ],
        },
        { kind: "field", label: "يسري من", value: "1 نوفمبر 2026" },
      ],
      footer: { primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0418 · تعديل سعر (اقتراح التكلفة والبيع) (3114:32277)
  {
    id: "REQ-2026-0418", tab: "prices", type: "تعديل سعر", tone: "info", ...JN, scope: "كل الفروع",
    subject: "طبقة طاردة للماء + تلميع", sub: "تكلفة 1,080 ← 1,120 · بيع مقترح 1,299 ← 1,349 (سيدان)", sentAt: OCT(14), status: "review", listed: true,
    rejectSub: "جونسون · طبقة طاردة للماء + تلميع",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0418 · تعديل سعر",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · من فهد العتيبي",
      hero: { pill: { label: "قيد النظر", tone: "review" }, title: "طبقة طاردة للماء + تلميع", lines: ["السبب: ارتفاع سعر المادة · يسري من 1 نوفمبر 2026", "نوع الطلب: دائم"] },
      blocks: [
        { kind: "kv", title: "المنتج", dense: true, rows: [["المنتج المعتمد", "‏Menzerna · ألمانيا"], ["عدد المراحل", "‏2"], ["طبقة الحماية بعد التلميع", "طبقة بوليمر طاردة للماء"], ["الماكينة", "‏Dual Action"], ["المدة · الضمان", "‏6 ساعات · سنتان (للطبقة الطاردة)"], ["الفروع", "الزهراء · الحمراء · المحمدية"]] },
        {
          kind: "proposal", title: "اقتراح المزوّد · لكل حجم · شامل الضريبة",
          rows: [
            { size: "سيدان", cost: 1080, newCost: 1120, sale: 1299, newSale: 1349 },
            { size: "‏SUV متوسط", cost: 1240, newCost: 1290, sale: 1499, newSale: 1549 },
            { size: "‏SUV كبير", cost: 1400, newCost: 1450, sale: 1699, newSale: 1749 },
          ],
        },
        {
          kind: "decision", tile: false,
          options: [
            { key: "publish", title: "اعتماد ونشر", effect: "approve", toast: "اعتُمد REQ-2026-0418 بأسعار المزوّد المقترحة · يُعاد نشر الخدمة بالسعر الجديد من 1 نوفمبر 2026 · أُشعر جونسون" },
            { key: "counter", title: "تعديل وإرسال اقتراح للمزوّد", effect: "counter" },
            { key: "reject", title: "رفض مع ذكر السبب", effect: "reject" },
          ],
        },
        { kind: "link", label: "اتصال بالمزوّد · فهد العتيبي · 055 410 2290", act: CALL_FAHD },
      ],
      footer: { primary: { label: "إرسال", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0417 · تعذّر قبول الخدمة (3114:30051)
  {
    id: "REQ-2026-0417", tab: "reschedule", type: "تعذّر قبول الخدمة", tone: "danger", ...JN, scope: "الزهراء",
    subject: "‏BK-21475 · ريم س.", sub: "نفاد المادة المطلوبة", sentAt: OCT(14), status: "review", listed: true,
    drawer: {
      style: "new",
      title: "‏REQ-2026-0417 · تعذّر قبول الخدمة",
      subtitle: "جونسون · فرع الزهراء · أُرسل 14 أكتوبر 2026",
      hero: { pill: { label: "قيد النظر", tone: "review" }, title: "الحجز BK-21475 · ريم س.", lines: ["السبب: نفاد المادة المطلوبة", "«المادة المطلوبة غير متوفرة حالياً، وتصل الأسبوع القادم.» — خالد الزهراني، مدير فرع الزهراء"] },
      blocks: [
        {
          kind: "kv", title: "الحجز",
          rows: [["رقم الحجز", "‏BK-21475"], ["العميل", "ريم س. · ‎055 124 7830"], ["السيارة", "تويوتا كورولا 2024 · سيدان"], ["الخدمة", "Johnson Ceramic Pro · سيدان"], ["الفرع", "جونسون · فرع الزهراء"], ["سعر البيع · شامل الضريبة", "1,899 ر.س · تابي"], ["سعر التكلفة · شامل الضريبة", "1,520 ر.س"], ["القسيمة", "LK-8P3V-6JRC · صالحة حتى 28 أكتوبر 2026"], ["تاريخ الحجز والدفع", "14 أكتوبر 2026"]],
        },
        { kind: "kv", title: "المنتج", dense: true, rows: [["المنتج", "‏Ceramic Pro 9H · بريميوم"], ["الشركة · المنشأ", "‏Ceramic Pro · الولايات المتحدة"], ["عدد الطبقات على الهيكل", "‏2"], ["الصلابة", "‏9H"], ["المدة · الضمان", "يوم واحد · 9 سنوات"]] },
        {
          kind: "decision", tile: true,
          options: [
            { key: "extend", title: "تأجيل وتمديد صلاحية القسيمة", sub: "المادة تصل الأسبوع القادم", field: { label: "صالحة حتى", date: "2026-11-04" }, effect: "other", toast: "مُدّدت القسيمة حتى {date} · أُشعر العميل وجونسون" },
            { key: "transfer", title: "تحويل لفرع أو مقدّم خدمة آخر", sub: "جونسون · الحمراء أو نانو شيلد · الروضة", effect: "other", toast: "حُوّل الحجز BK-21475 · أُشعر العميل وجونسون" },
            { key: "refund", title: "إلغاء واسترداد كامل للعميل", sub: "1,899 ر.س إلى تابي", effect: "other", toast: "أُلغي الحجز BK-21475 واسترُدّ 1,899 ر.س إلى تابي · أُشعر العميل وجونسون" },
            { key: "other", title: "أخرى", sub: "اكتب القرار", effect: "other", toast: "نُفّذ القرار · أُشعر العميل وجونسون" },
          ],
        },
        { kind: "toggle", label: NOTIFY_BOTH },
      ],
      footer: { secondary: { label: "اتصال بالعميل", icon: "phone", act: { kind: "call", phone: "0551247830" } }, primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0414 · إيقاف مؤقت (3114:30210)
  {
    id: "REQ-2026-0414", tab: "data", type: "إيقاف مؤقت", tone: "neutral", provider: "XPEL", providerId: "lk-xp-001", scope: "العليا",
    subject: "‏PPF كامل للسيارة", sub: "صيانة فتحة العمل حتى 31 أكتوبر 2026", sentAt: OCT(13), status: "new", listed: true,
    rejectSub: "‏XPEL · إيقاف PPF في العليا",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0414 · إيقاف مؤقت",
      subtitle: "‏XPEL · فرع العليا · 13 أكتوبر 2026",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "‏PPF كامل للسيارة", lines: ["السبب: صيانة فتحة العمل الوحيدة لـ PPF حتى 31 أكتوبر 2026.", "الخدمة متاحة في فرعَي XPEL الآخرين."] },
      blocks: [
        { kind: "kv", title: "الحجوزات المتأثرة", rows: [["قسائم سارية في فرع العليا", "6 قسائم"], ["أقرب انتهاء", "23 أكتوبر 2026 · BK-21457"]], hint: "اختر ما يحدث للحجوزات القائمة:" },
        {
          kind: "decision", tile: true,
          options: [
            { key: "transfer", title: "اعتماد الإيقاف وتحويل الحجوزات لفرع الروضة", sub: "بنفس سعر العميل · تصل رسالة لكل عميل", effect: "approve", toast: "أُوقفت PPF في العليا حتى 31 أكتوبر 2026 · حُوّلت 6 حجوزات للروضة" },
            { key: "extend", title: "اعتماد الإيقاف وتمديد صلاحية القسائم حتى بعد الصيانة", effect: "approve", toast: "أُوقفت PPF في العليا حتى 31 أكتوبر 2026 · مُدّدت صلاحية 6 قسائم" },
            { key: "reject", title: "رفض الإيقاف", effect: "reject" },
          ],
        },
        { kind: "field", label: "مدة الإيقاف", value: "من 14 حتى 31 أكتوبر 2026" },
      ],
      footer: { primary: { label: "تنفيذ", icon: "check", act: { kind: "decide" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0410 · XPEL السعودية (3114:32799) — الدرج القديم
  {
    id: "REQ-2026-0410", tab: "data", type: "تغيير الشعار", tone: "neutral", provider: "‏XPEL السعودية", providerId: "lk-xp-001", scope: "المنشأة",
    subject: "شعار جديد للمنشأة", sub: "ملف PNG 1024×1024 · معاينة في التفاصيل", sentAt: OCT(13), status: "review", listed: true,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0410 · تعديل بيانات",
      hero: { pill: { label: "قيد النظر", tone: "pending" }, title: "‏XPEL السعودية", lines: ["تغيير الشعار"], icon: "edit" },
      blocks: [
        { kind: "beforeAfter", title: "التعديل المطلوب", current: "شعار XPEL الحالي", requested: "شعار XPEL 2026 · PNG 1024×1024" },
        { kind: "docs", docs: [{ name: "الشعار الجديد", file: "XPEL-logo-2026.png" }] },
      ],
      old: { approveLabel: "اعتماد التعديل", approveTitle: "اعتماد شعار XPEL الجديد", approveBullets: ["يظهر الشعار الجديد في الموقع والتطبيق وبوابة الوكالات"], rejectSub: "‏XPEL · تغيير الشعار", completeSub: "‏XPEL السعودية", completeItem: "ملف الشعار بخلفية شفافة" },
    },
  },
  // ── CON5-03D · REQ-2026-0408 · مركز النخبة للتظليل (3114:32853)
  {
    id: "REQ-2026-0408", tab: "data", type: "تعديل الاسم التجاري", tone: "neutral", provider: "مركز النخبة للتظليل", scope: "المنشأة",
    subject: "النخبة لحماية السيارات", sub: "مرفق السجل التجاري المحدّث", sentAt: OCT(12), status: "review", listed: true,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0408 · تعديل بيانات",
      hero: { pill: { label: "قيد النظر", tone: "pending" }, title: "مركز النخبة للتظليل", lines: ["الاسم التجاري"], icon: "edit" },
      blocks: [
        { kind: "beforeAfter", title: "التعديل المطلوب", current: "مركز النخبة للتظليل", requested: "النخبة لحماية السيارات" },
        { kind: "docs", docs: [{ name: "السجل التجاري المحدّث", file: "CR-4030301122-2026.pdf" }] },
      ],
      old: { approveLabel: "اعتماد التعديل", approveTitle: "اعتماد الاسم التجاري الجديد", approveBullets: ["«مركز النخبة للتظليل» ← «النخبة لحماية السيارات»", "تبقى القسائم الصادرة بالاسم القديم صالحة"], rejectSub: "النخبة · الاسم التجاري", completeSub: "النخبة", completeItem: "السجل التجاري المحدّث" },
    },
  },
  // ── CON5-03D · REQ-2026-0407 · مركز لمعة للتلميع (3114:32907)
  {
    id: "REQ-2026-0407", tab: "data", type: "تعديل بيانات الفرع", tone: "neutral", provider: "مركز لمعة للتلميع", providerId: "lk-la-001", scope: "الروضة",
    subject: "العنوان الوطني", sub: "RRAD 4521 ← RRAD 7710", sentAt: OCT(11), status: "review", listed: true,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0407 · تعديل بيانات",
      hero: { pill: { label: "قيد النظر", tone: "pending" }, title: "مركز لمعة للتلميع", lines: ["العنوان الوطني · فرع الروضة"], icon: "edit" },
      blocks: [
        { kind: "beforeAfter", title: "التعديل المطلوب", current: "RRAD 4521", requested: "RRAD 7710" },
        { kind: "docs", docs: [{ name: "إثبات العنوان الوطني", file: "National-Address.pdf" }] },
      ],
      old: { approveLabel: "اعتماد التعديل", approveTitle: "اعتماد العنوان الوطني · لمعة", approveBullets: ["يتحدّث موقع فرع الروضة على الخريطة"], rejectSub: "لمعة · العنوان الوطني", completeSub: "لمعة", completeItem: "إثبات العنوان الوطني" },
    },
  },
  // ── CON5-03D · REQ-2026-0406 · نانو شيلد NanoShield (3114:32961)
  {
    id: "REQ-2026-0406", tab: "data", type: "تعديل بيانات المنشأة", tone: "neutral", provider: "نانو شيلد", providerId: "lk-ns-001", scope: "المنشأة",
    subject: "مسؤول التواصل مع لينكار", sub: "سامي القحطاني ← فيصل العنزي", sentAt: OCT(10), status: "review", listed: true,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0406 · تعديل بيانات",
      hero: { pill: { label: "قيد النظر", tone: "pending" }, title: "نانو شيلد", lines: ["مسؤول التواصل مع لينكار"], icon: "edit" },
      blocks: [{ kind: "beforeAfter", title: "التعديل المطلوب", current: "سامي القحطاني · 050 330 1188", requested: "فيصل العنزي · 055 671 2208" }],
      old: { approveLabel: "اعتماد التعديل", approveTitle: "اعتماد مسؤول التواصل · نانو شيلد", approveBullets: ["فيصل العنزي يستقبل رسائل لينكار بدلاً من سامي القحطاني"], rejectSub: "نانو شيلد · مسؤول التواصل", completeSub: "نانو شيلد", completeItem: "تفويض من المالك" },
    },
  },
  // ── CON5-03D · REQ-2026-0402 · تعديل سعر (معتمد) (3114:32223)
  {
    id: "REQ-2026-0402", tab: "prices", type: "تعديل سعر", tone: "info", ...JN, scope: "كل الفروع",
    subject: "حماية PPF للواجهة + نانو", sub: "+6% على كل الأحجام · يسري من 1 نوفمبر 2026", sentAt: OCT(5), status: "approved", listed: true, decidedAt: OCT(6),
    drawer: {
      style: "new",
      title: "‏REQ-2026-0402 · تعديل سعر",
      subtitle: "جونسون · كل الفروع · 5 أكتوبر 2026 · اعتُمد 6 أكتوبر 2026",
      hero: { pill: { label: "معتمد", tone: "approved" }, title: "حماية PPF للواجهة + نانو · سعر جديد", lines: ["+6% على كل الأحجام · يسري من 1 نوفمبر 2026", "قرّره: سلطان العنزي · التسعير"] },
      blocks: [
        { kind: "kv", title: "سعر التكلفة (للمزوّد) · شامل الضريبة", rows: [["سيدان", "2,780 ← 2,947"], ["‏SUV متوسط", "3,200 ← 3,392"], ["‏SUV كبير", "3,620 ← 3,837"]] },
        { kind: "kv", title: "سعر البيع للعملاء (لينكار) · شامل الضريبة", rows: [["سيدان", "3,299 ← 3,499 · هامش 552 (15.8%)"], ["‏SUV متوسط", "3,799 ← 3,999 · هامش 607 (15.2%)"], ["‏SUV كبير", "4,299 ← 4,549 · هامش 712 (15.7%)"]] },
        { kind: "link", label: "سجل تعديلات الأسعار", act: { kind: "href", href: `${TO_JN_REQUESTS}?tab=services` } },
      ],
      footer: { primary: { label: "إغلاق", act: { kind: "close" } } },
    },
  },

  // ───── طلبات لها درج بس مش في القائمة (تتفتح من ملف المزوّد) ─────
  // ── CON5-03D · REQ-2026-0424 · تجديد مستند (3114:31589)
  {
    id: "REQ-2026-0424", tab: "data", type: "تجديد مستند", tone: "neutral", ...JN, scope: "كل الفروع",
    subject: "تفويض الموزّع المعتمد · Johnson Window Films", sub: "الحالي JWF-KSA-0192 ينتهي 31 ديسمبر 2026", sentAt: OCT(14), status: "new", listed: false,
    approveToast: "اعتُمد تفويض الموزّع الجديد · حُدّث ملف جونسون",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0424 · تجديد مستند",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · الجودة",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "تجديد مستند", lines: ["تفويض الموزّع المعتمد · Johnson Window Films", "الحالي JWF-KSA-0192 ينتهي 31 ديسمبر 2026"] },
      blocks: [{ kind: "kv", title: "المستند الجديد", dense: true, rows: [["الرقم", "JWF-KSA-0251"], ["ينتهي", "31 ديسمبر 2027"], ["المرفق", "‏JWF-KSA-0251.pdf · 420 ك.ب"]] }],
      footer: { secondary: { label: "طلب استكمال", act: { kind: "complete" } }, primary: { label: "اعتماد المستند", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0425 · تجديد الاتفاقية (3114:31633)
  {
    id: "REQ-2026-0425", tab: "data", type: "تجديد الاتفاقية", tone: "neutral", ...JN, scope: "كل الفروع",
    subject: "تجديد الاتفاقية", sub: "‏AGR-2025-0117 · تنتهي 31 ديسمبر 2026", sentAt: OCT(14), status: "new", listed: false,
    approveToast: "جُدّدت اتفاقية جونسون حتى 31 ديسمبر 2027",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0425 · تجديد الاتفاقية",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · المالية",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "تجديد الاتفاقية", lines: ["‏AGR-2025-0117", "تنتهي 31 ديسمبر 2026"] },
      blocks: [{ kind: "kv", title: "طلب المزوّد", dense: true, rows: [["الخيار", "تجديد بنفس الشروط"], ["المدة", "سنة تبدأ 1 يناير 2027"], ["الأسعار المتفق عليها", "تستمر بشروطها"]] }],
      footer: { secondary: { label: "اتصال بالمزوّد", act: CALL_FAHD }, primary: { label: "اعتماد التجديد", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0426 · اشتراك ميزة مدفوعة (3114:31677)
  {
    id: "REQ-2026-0426", tab: "data", type: "اشتراك ميزة مدفوعة", tone: "neutral", ...JN, scope: "كل الفروع",
    subject: "«ظهورك على لينكار»", sub: "الخطة المطلوبة: شهرية · 1,500 ر.س", sentAt: OCT(14), status: "new", listed: false,
    approveToast: "اعتُمد الطلب وأُبلغت الجهة",
    drawer: {
      style: "new",
      title: "‏REQ-2026-0426 · اشتراك ميزة مدفوعة",
      subtitle: "جونسون · كل الفروع · 14 أكتوبر 2026 · التسعير",
      hero: { pill: { label: "جديد", tone: "neon" }, title: "اشتراك ميزة مدفوعة", lines: ["«ظهورك على لينكار» · التجربة حتى 31 أكتوبر 2026", "الخطة المطلوبة: شهرية · 1,500 ر.س"] },
      blocks: [{ kind: "kv", title: "التفاصيل", dense: true, rows: [["يبدأ", "1 نوفمبر 2026"], ["الدفع", "خصم من مستحقات جونسون الشهرية"], ["الاستخدام في سبتمبر", "12,480 مشاهدة لخدماته"]] }],
      footer: { secondary: { label: "اتصال بالمزوّد", act: CALL_FAHD }, primary: { label: "تفعيل الاشتراك", icon: "check", act: { kind: "approve" } } },
    },
  },
  // ── CON5-03D · REQ-2026-0439 · مركز الريم (3114:32577) — شهادة منتج (الدرج القديم)
  {
    id: "REQ-2026-0439", tab: "services", type: "شهادة منتج", tone: "neutral", provider: "مركز الريم", providerId: "lk-rm-001", scope: "كل الفروع",
    subject: "مركز الريم · تلميع مرحلتين", sub: "Menzerna Heavy Cut + Finish", sentAt: OCT(13), status: "new", listed: false,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0439 · شهادة منتج",
      subtitle: "من بوابة المزوّد · نموذج الخدمة",
      hero: { pill: { label: "بانتظار المراجعة", tone: "pending" }, title: "مركز الريم · تلميع مرحلتين", lines: ["التلميع · يُسعَّر بعد الاعتماد باتفاق مع لينكار"], icon: "tag" },
      blocks: [
        { kind: "oldKv", title: "المنتج والشهادة", rows: [["المنتج", "Menzerna Heavy Cut + Finish"], ["رقم الشهادة", "MZ-SA-2026-0412"], ["الجهة المصدرة", "الوكيل المعتمد Menzerna السعودية"], ["الصلاحية", "حتى مارس 2028"]] },
        { kind: "docs", docs: [{ name: "شهادة اعتماد المنتج", file: "MZ-SA-2026-0412.pdf" }, { name: "فاتورة شراء المنتج", file: "آخر شحنة · سبتمبر 2026" }] },
      ],
      old: { approveLabel: "اعتماد الشهادة", approveTitle: "اعتماد شهادة Menzerna · مركز الريم", approveBullets: ["تحصل خدمة «تلميع مرحلتين» على شارة «موثّق»", "تنبيه آلي للمركز قبل انتهاء الشهادة في مارس 2028"], rejectSub: "مركز الريم · شهادة Menzerna", completeSub: "مركز الريم", completeItem: "فاتورة شراء المنتج" },
    },
  },
  // ── CON5-03D · REQ-2026-0440 · لومار LLumar (3114:32650)
  {
    id: "REQ-2026-0440", tab: "services", type: "شهادة منتج", tone: "neutral", provider: "لومار", providerId: "lk-lm-001", scope: "كل الفروع",
    subject: "لومار LLumar · تظليل كامل", sub: "‏LLumar IRX · نانو سيراميك للنوافذ", sentAt: OCT(13), status: "new", listed: false,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0440 · شهادة منتج",
      subtitle: "من بوابة المزوّد · نموذج الخدمة",
      hero: { pill: { label: "بانتظار المراجعة", tone: "pending" }, title: "لومار LLumar · تظليل كامل", lines: ["التظليل · يُسعَّر بعد الاعتماد باتفاق مع لينكار"], icon: "tag" },
      blocks: [
        { kind: "oldKv", title: "المنتج والشهادة", rows: [["المنتج", "‏LLumar IRX · نانو سيراميك للنوافذ"], ["رقم الشهادة", "LL-IRX-55-0931"], ["الجهة المصدرة", "‏Eastman · وكيل لومار"], ["الصلاحية", "حتى يناير 2028"]] },
        { kind: "docs", docs: [{ name: "شهادة اعتماد المنتج", file: "LL-IRX-55-0931.pdf" }, { name: "فاتورة شراء المنتج", file: "آخر شحنة · سبتمبر 2026" }] },
      ],
      old: { approveLabel: "اعتماد الشهادة", approveTitle: "اعتماد شهادة LLumar IRX · لومار", approveBullets: ["تحصل خدمة «تظليل كامل» على شارة «موثّق»", "تنبيه آلي للمركز قبل انتهاء الشهادة في يناير 2028"], rejectSub: "لومار · شهادة LLumar IRX", completeSub: "لومار", completeItem: "شهادة الوكيل سارية" },
    },
  },
  // ── CON5-03D · REQ-2026-0441 · نانو شيلد (3114:32723)
  {
    id: "REQ-2026-0441", tab: "services", type: "شهادة منتج", tone: "neutral", provider: "نانو شيلد", providerId: "lk-ns-001", scope: "كل الفروع",
    subject: "نانو شيلد · نانو سيراميك 9H", sub: "Nano Shield 9H", sentAt: OCT(13), status: "new", listed: false,
    drawer: {
      style: "old",
      title: "‏REQ-2026-0441 · شهادة منتج",
      subtitle: "من بوابة المزوّد · نموذج الخدمة",
      hero: { pill: { label: "بانتظار المراجعة", tone: "pending" }, title: "نانو شيلد · نانو سيراميك 9H", lines: ["نانو سيراميك · يُسعَّر بعد الاعتماد باتفاق مع لينكار"], icon: "tag" },
      blocks: [
        { kind: "oldKv", title: "المنتج والشهادة", rows: [["المنتج", "Nano Shield 9H"], ["رقم الشهادة", "NS-9H-2026-204"], ["الجهة المصدرة", "Nano Shield Europe"], ["الصلاحية", "حتى 30 سبتمبر 2028"]] },
        { kind: "docs", docs: [{ name: "شهادة اعتماد المنتج", file: "NS-9H-2026-204.pdf" }, { name: "فاتورة شراء المنتج", file: "آخر شحنة · سبتمبر 2026" }] },
      ],
      old: { approveLabel: "اعتماد الشهادة", approveTitle: "اعتماد تجديد Nano Shield 9H", approveBullets: ["تعود خدمة «نانو سيراميك 9H» للظهور بشارة «موثّق»", "تُغلق ملاحظة «شهادة منتهية» في ملف نانو شيلد"], rejectSub: "نانو شيلد · تجديد Nano Shield 9H", completeSub: "نانو شيلد", completeItem: "فاتورة شراء المنتج" },
    },
  },
];

// مستندات المعاينة (CON5-M00 · معاينة مستند) اللي بتتفتح من الأدراج
registerDocs([
  {
    id: "NA-JN-2457", kind: "العنوان الوطني", file: "National-Address.pdf", page: 1, pages: 1, authority: "العنوان الوطني · سبل", title: "إثبات العنوان الوطني",
    fields: [["اسم المنشأة", "شركة جونسون للعناية بالسيارات"], ["الرمز المختصر", "JDHA 2457"], ["الحي", "حي الزهراء"], ["المدينة", "جدة 23425"]],
  },
  {
    id: "LEASE-JN-ZH-2026", kind: "عقد الإيجار", file: "Lease-Zahraa-2026.pdf", page: 1, pages: 3, authority: "منصة إيجار · المملكة العربية السعودية", title: "عقد إيجار تجاري",
    fields: [["المستأجر", "شركة جونسون للعناية بالسيارات"], ["العقار", "مجمع الزهراء التجاري · طريق الأمير سلطان"], ["المدينة", "جدة"], ["مدة العقد", "3 سنوات"]],
  },
]);

// مرفقات الدرج القديم («عرض» → معاينة مستند) — نفس اسم الملف هو المعرّف
registerDocs(
  REQUESTS.flatMap((r) =>
    r.drawer.blocks.flatMap((b) =>
      b.kind === "docs"
        ? b.docs.map((d) => ({ id: d.file, kind: d.name, file: d.file, page: 1, pages: 1, authority: r.provider.replace(/^‏/, ""), title: d.name, fields: [["رقم الطلب", r.id], ["مقدّم الخدمة", r.provider.replace(/^‏/, "")], ["الملف", d.file]] as [string, string][] }))
        : [],
    ),
  ),
);

const store: RequestDetail[] = structuredClone(REQUESTS);
const clone = <T,>(v: T): T => structuredClone(v);
const OPEN: ReqStatus[] = ["new", "review", "waiting"];
const inStatus = (r: RequestRow, s: StatusFilter) => (s === "open" ? OPEN.includes(r.status) : r.status === s);
const find = (id: string) => {
  const r = store.find((x) => x.id === id);
  if (!r) throw new ApiError(404, "الطلب غير موجود");
  return r;
};
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const arDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const ROW_KEYS = ["id", "tab", "type", "tone", "provider", "providerId", "scope", "subject", "sub", "sentAt", "status", "listed"] as const;
const row = (r: RequestDetail): RequestRow => Object.fromEntries(ROW_KEYS.filter((k) => k in r).map((k) => [k, r[k]])) as unknown as RequestRow;
const decide = (r: RequestDetail, status: ReqStatus) => {
  r.status = status;
  if (status === "approved" || status === "rejected") r.decidedAt = "2026-10-14";
  if (r.id === "REQ-2026-0427" || r.id === "REQ-2026-0435") resolveAccountRequest(r.id, status === "approved");
};

export type DecisionInput = { option: string; date?: string; prices?: { newCost: number; newSale: number }[]; notify?: boolean };

export const requestsApi = {
  /** GET /requests?tab=&status= → { items, total, counts: { tabs, status } } — الأعداد على الطلبات الظاهرة في القائمة بس */
  list: async ({ tab = "all", status = "open" }: { tab?: "all" | ReqTab; status?: StatusFilter } = {}) => {
    const listed = store.filter((r) => r.listed);
    const inTab = listed.filter((r) => tab === "all" || r.tab === tab);
    const items = inTab.filter((r) => inStatus(r, status)).map(row);
    const tabs = Object.fromEntries(REQ_TABS.map((t) => [t.key, listed.filter((r) => t.key === "all" || r.tab === t.key).length])) as Record<"all" | ReqTab, number>;
    const counts = Object.fromEntries(STATUS_CHIPS.map((c) => [c.key, inTab.filter((r) => inStatus(r, c.key)).length])) as Record<StatusFilter, number>;
    return delay({ items: clone(items), total: items.length, counts: { tabs, status: counts } });
  },
  /** عدد الطلبات المفتوحة (شارة «الطلبات» في القائمة الجانبية) */
  openCount: async () => delay(store.filter((r) => r.listed && OPEN.includes(r.status)).length, 120),
  get: async (id: string) => delay(clone(find(id)), 200),
  /** «وضع قيد النظر» من قائمة ⋯ (CON5-03T · أصبح الطلب قيد النظر 3260:188182) */
  markReview: async (id: string) => {
    const r = find(id);
    if (r.status === "new") r.status = "review";
    return delay({ toast: "أصبح الطلب «قيد النظر»" });
  },
  /** زر الاعتماد المباشر في الدرج الجديد / نافذة «اعتماد» في الدرج القديم */
  approve: async (id: string) => {
    const r = find(id);
    decide(r, "approved");
    return delay({ toast: r.approveToast ?? "اعتُمد الطلب وأُبلغت الجهة" }, 450);
  },
  /** تنفيذ خيار القرار المختار في الدرج */
  decide: async (id: string, v: DecisionInput) => {
    const r = find(id);
    const block = r.drawer.blocks.find((b) => b.kind === "decision");
    const opt = block?.kind === "decision" ? block.options.find((o) => o.key === v.option) : undefined;
    if (!opt) throw new ApiError(422, "اختر القرار");
    if (opt.effect === "counter") {
      decide(r, "waiting");
      return delay({ toast: `أُرسل الاقتراح للمزوّد · يظهر له في «طلباتي لِلينكار»` }, 450);
    }
    // اعتماد سعر بعد تعديل لينكار للأرقام → «اعتُمد سعر جونسون الجديد · سعر البيع …» (CON5-03T 3114:30047)
    const prop = r.drawer.blocks.find((b) => b.kind === "proposal");
    if (opt.effect === "approve" && prop?.kind === "proposal" && v.prices?.some((p, i) => p.newCost !== prop.rows[i].newCost || p.newSale !== prop.rows[i].newSale)) {
      prop.rows.forEach((x, i) => Object.assign(x, v.prices![i]));
      decide(r, "approved");
      return delay({ toast: `اعتُمد سعر ${r.provider} الجديد · سعر البيع ${v.prices[0].newSale.toLocaleString("en-US")} من 1 نوفمبر 2026` }, 450);
    }
    decide(r, "approved");
    return delay({ toast: (opt.toast ?? "اعتُمد الطلب وأُبلغت الجهة").replace("{date}", v.date ? arDay(v.date) : "") }, 450);
  },
  /** نافذة الرفض (CON5-03M · رفض) */
  reject: async (id: string, v: { reason: string; message: string }) => {
    if (!v.reason) throw new ApiError(422, "", { reason: "اختر سبب الرفض" });
    if (!v.message.trim()) throw new ApiError(422, "", { message: "اكتب رسالة للجهة" });
    const r = find(id);
    decide(r, "rejected");
    const toast = r.drawer.style === "old" ? "رُفض الطلب وأُبلغت الجهة" : r.id === "REQ-2026-0437" ? "رُفض الطلب وأُبلغ المزوّد بالسبب" : "رُفض الطلب وأُبلغ المزوّد بالسبب في «طلباتي لِلينكار»";
    return delay({ toast }, 450);
  },
  /** طلب استكمال (CON5-03M 3114:30292 للدرج الجديد · CON5-03M طلب استكمال · REQ للدرج القديم) */
  complete: async (id: string, v: { items: string[]; note: string; deadline?: string }) => {
    if (!v.items.length) throw new ApiError(422, "", { items: "اختر المطلوب" });
    if (!v.note.trim()) throw new ApiError(422, "", { note: "اكتب التفاصيل للمزوّد" });
    const r = find(id);
    decide(r, "waiting");
    const toast = r.drawer.style === "old" ? "أُرسل طلب الاستكمال برسالة نصية وبريد" : `أُرسل طلب الاستكمال · يظهر للمزوّد في «طلباتي لِلينكار» بمهلة ${v.deadline ?? "7 أيام"}`;
    return delay({ toast }, 450);
  },
};

// ───────────── CON5-12D · عروض لينكار باتفاق مع المزوّد (3114:30133 · 3114:30328) ─────────────
export interface LinkarOffer {
  id: string;
  title: string;
  subtitle: string;
  pill: { label: string; tone: "neon" | "approved" };
  heroTitle: string;
  lines: string[];
  /** [الحجم, التكلفة الحالية, التكلفة في العرض, سعر البيع الآن, سعر البيع في العرض] */
  rows: [string, number, number, number, number][];
  marginLine: string;
  action: { label: string; toast: string; next: "scheduled" | "stopped" };
  status: "draft" | "scheduled" | "stopped";
}
const OFFERS: LinkarOffer[] = [
  {
    id: "OF-LM-15", title: "خصم 15% تظليل كامل · لومار", subtitle: "لينكار · باتفاق مع لومار · فرع الروضة · مسودة",
    pill: { label: "مسودة", tone: "neon" }, heroTitle: "خصم 15% على تظليل كامل · باتفاق مع لومار",
    lines: ["المدة: 1 – 30 نوفمبر 2026 · الفرع: الروضة · بانتظار توقيع لومار على سعر العرض", "قاعدة العرض: سعر المزوّد في العرض لا يتجاوز سعره المتفق عليه، ولينكار تحدد سعر البيع."],
    rows: [["سيدان", 1300, 1105, 1599, 1399], ["‏SUV متوسط", 1450, 1233, 1799, 1549], ["‏SUV كبير", 1600, 1360, 1999, 1699]],
    marginLine: "هامش لينكار في العرض: 294 · 316 · 339 (21% · 20% · 20%)",
    action: { label: "إرسال للتوقيع", toast: "أُرسل سعر العرض (1,105 · 1,233 · 1,360) لومار للتوقيع · يُجدول تلقائياً بعد التوقيع", next: "scheduled" },
    status: "draft",
  },
  {
    id: "OF-JN-10", title: "خصم 10% تفصيل داخلي كامل · جونسون", subtitle: "لينكار · باتفاق مع جونسون · كل الفروع · سلطان ع.",
    pill: { label: "مجدول", tone: "approved" }, heroTitle: "خصم 10% على تفصيل داخلي كامل",
    lines: ["المدة: 15 – 31 أكتوبر 2026 · اتفاق مكتوب مع فهد العتيبي 11 أكتوبر 2026", "قاعدة العرض: سعر المزوّد في العرض لا يتجاوز سعره المتفق عليه، ولينكار تحدد سعر البيع."],
    rows: [["سيدان", 360, 320, 449, 404], ["‏SUV متوسط", 440, 400, 549, 494], ["‏SUV كبير", 520, 470, 649, 584]],
    marginLine: "هامش لينكار في العرض: 84 · 94 · 114 (21% · 19% · 20%)",
    action: { label: "إيقاف العرض", toast: "أُوقف العرض «خصم 10% تفصيل داخلي كامل» · القسائم المباعة سارية", next: "stopped" },
    status: "scheduled",
  },
];
const offers = structuredClone(OFFERS);
export const linkarOffersApi = {
  get: async (id: string) => {
    const o = offers.find((x) => x.id === id);
    if (!o) throw new ApiError(404, "العرض غير موجود");
    return delay(clone(o), 200);
  },
  act: async (id: string) => {
    const o = offers.find((x) => x.id === id);
    if (!o) throw new ApiError(404, "العرض غير موجود");
    o.status = o.action.next;
    return delay({ toast: o.action.toast }, 450);
  },
};
