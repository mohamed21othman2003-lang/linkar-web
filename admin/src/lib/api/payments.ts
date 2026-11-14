// المدفوعات والاستردادات (المرحلة 2 · Figma «v5 · 15 · المدفوعات والاستردادات» 3114:47244):
// كل ما يدفعه العملاء لِلينكار (CON5-15) والاستردادات (CON5-15 · الاستردادات) + درج كل عملية (CON5-15D).
// النصوص والأرقام حرفياً من الإطارات. «عرض الإيصال» يفتح الفاتورة (CON5-16V) و«عرض الإشعار الدائن» يفتح الإشعار.
import { ApiError, delay } from "./errors";

export type PayTab = "payments" | "refunds";
export type PayTone = "success" | "warning";

export interface PaymentRow {
  id: string;
  kind: "payment" | "refund";
  booking: string;
  customer: string;
  /** «1,699 ر.س» شامل الضريبة */
  amount: number;
  method: string;
  /** «14 أكتوبر 2026» */
  date: string;
  status: string;
  tone: PayTone;
}

export interface PaymentDetail extends PaymentRow {
  title: string;
  subtitle: string;
  hero: { title: string; lines: string[] };
  /** «التفاصيل» (+ «الخط الزمني» في RF-2026-0190) */
  tiles: { title: string; rows: [string, string][] }[];
  /** نمط البطاقات: «card» = عنوان 13 SemiBold رمادي (حشو 14·16 · مسافة 4) · «tile» = عنوان 14 SemiBold (حشو 14 · مسافة 6) */
  tileStyle: "card" | "tile";
  /** المستند اللي يفتحه الزر الرئيسي (فاتورة أو إشعار دائن) */
  doc: string;
  footer: "receipt" | "credit" | "refund-live";
}

const P = (id: string, booking: string, customer: string, amount: number, method: string, date: string): PaymentRow => ({ id, kind: "payment", booking, customer, amount, method, date, status: "مكتمل", tone: "success" });
const R = (id: string, booking: string, customer: string, amount: number, method: string, date: string, live = false): PaymentRow => ({
  id,
  kind: "refund",
  booking,
  customer,
  amount,
  method,
  date,
  status: live ? "قيد التنفيذ" : "نُفّذ",
  tone: live ? "warning" : "success",
});

const ROWS: PaymentRow[] = [
  P("PAY-2026-10-48812", "BK-21474", "عبدالعزيز ف.", 1699, "مدى", "14 أكتوبر 2026"),
  P("PAY-2026-10-48807", "BK-21475", "ريم س.", 1899, "تابي · 4 دفعات", "14 أكتوبر 2026"),
  P("PAY-2026-10-48803", "BK-21473", "منيرة ح.", 3299, "Apple Pay", "14 أكتوبر 2026"),
  P("PAY-2026-10-48796", "BK-21472", "سارة م.", 1599, "تمارا", "14 أكتوبر 2026"),
  P("PAY-2026-10-48781", "BK-21470", "يوسف ع.", 8999, "بطاقة ائتمانية", "13 أكتوبر 2026"),
  R("RF-2026-0189", "BK-21471", "ماجد ك.", 1299, "تمارا", "13 أكتوبر 2026"),
  R("RF-2026-0190", "BK-21457", "حمد ش.", 8999, "بطاقة ائتمانية", "14 أكتوبر 2026", true),
  R("RF-2026-0186", "BK-21357", "سلمان د.", 1899, "Apple Pay", "28 سبتمبر 2026"),
];

type Extra = Omit<PaymentDetail, keyof PaymentRow>;
const card = (rows: [string, string][]) => [{ title: "التفاصيل", rows }];

const DETAILS: Record<string, Extra> = {
  "PAY-2026-10-48812": {
    title: "دفع BK-21474",
    subtitle: "عبدالعزيز ف. · جونسون الحمراء",
    hero: { title: "1,699 ر.س · مدى", lines: ["14 أكتوبر 2026 9:42 ص · بوابة الدفع"] },
    tileStyle: "card",
    tiles: card([
      ["الحجز", "BK-21474 · باقة العناية الكاملة · SUV متوسط"],
      ["الفاتورة", "INV-L-2026-10-08812"],
      ["سعر المزوّد المتفق عليه · شامل الضريبة", "1,400 · سعر التكلفة"],
      ["هامش لينكار", "299"],
    ]),
    doc: "INV-L-2026-10-08812",
    footer: "receipt",
  },
  "PAY-2026-10-48807": {
    title: "دفع BK-21475",
    subtitle: "ريم س. · جونسون الزهراء",
    hero: { title: "1,899 ر.س · تابي 4 دفعات", lines: ["14 أكتوبر 2026 · تتحمل تابي الأقساط · يصل المبلغ كاملاً للينكار"] },
    tileStyle: "card",
    tiles: card([
      ["الحجز", "BK-21475 · Johnson Ceramic Pro · لدى لينكار (تعذّر)"],
      ["الفاتورة", "INV-L-2026-10-08807"],
      ["سعر المزوّد · شامل الضريبة", "1,520 · سعر التكلفة"],
      ["حالة الحجز", "قرار REQ-0417 قيد النظر"],
    ]),
    doc: "INV-L-2026-10-08807",
    footer: "receipt",
  },
  "PAY-2026-10-48803": {
    title: "دفع BK-21473",
    subtitle: "منيرة ح. · جونسون المحمدية",
    hero: { title: "3,299 ر.س · Apple Pay", lines: ["13 أكتوبر 2026"] },
    tileStyle: "card",
    tiles: card([
      ["الحجز", "BK-21473 · PPF للواجهة + نانو · سيدان"],
      ["الفاتورة", "INV-L-2026-10-08805"],
      ["سعر المزوّد · شامل الضريبة", "2,780 · سعر التكلفة"],
      ["هامش لينكار", "519"],
    ]),
    doc: "INV-L-2026-10-08805",
    footer: "receipt",
  },
  "PAY-2026-10-48796": {
    title: "دفع BK-21472",
    subtitle: "سارة م. · لومار الروضة",
    hero: { title: "1,599 ر.س · تمارا", lines: ["13 أكتوبر 2026 · تقسيط تمارا"] },
    tileStyle: "card",
    tiles: card([
      ["الحجز", "BK-21472 · تظليل كامل · سيدان"],
      ["الفاتورة", "INV-L-2026-10-08803"],
      ["سعر المزوّد · شامل الضريبة", "1,300 · سعر التكلفة"],
      ["هامش لينكار", "299"],
    ]),
    doc: "INV-L-2026-10-08803",
    footer: "receipt",
  },
  "PAY-2026-10-48781": {
    title: "دفع BK-21470",
    subtitle: "يوسف ع. · XPEL العليا",
    hero: { title: "8,999 ر.س · بطاقة ائتمانية", lines: ["12 أكتوبر 2026"] },
    tileStyle: "card",
    tiles: card([
      ["الحجز", "BK-21470 · PPF كامل · SUV كبير"],
      ["الفاتورة", "INV-L-2026-10-08799"],
      ["سعر المزوّد · شامل الضريبة", "7,400 · سعر التكلفة"],
      ["ملاحظة", "فرع العليا عليه طلب إيقاف REQ-0414"],
    ]),
    doc: "INV-L-2026-10-08799",
    footer: "receipt",
  },
  "RF-2026-0190": {
    title: "استرداد RF-2026-0190",
    subtitle: "BK-21457 · حمد ش. · XPEL · فرع العليا",
    hero: {
      title: "8,999 ر.س إلى بطاقة ائتمانية",
      lines: ["السبب: إيقاف خدمة PPF في فرع العليا (REQ-2026-0414) ورفض العميل التحويل لفرع الروضة.", "اعتمدته: هند م. · 14 أكتوبر 2026 11:20 ص"],
    },
    tileStyle: "tile",
    tiles: [
      {
        title: "التفاصيل",
        rows: [
          ["الحجز", "BK-21457 · PPF كامل للسيارة · SUV كبير"],
          ["الدفع الأصلي", "PAY-2026-10-48420 · بطاقة •••• 1093"],
          ["الإشعار الدائن", "CN-L-2026-10-00412"],
          ["أثره على المزوّد", "لا يُضاف لمستحقات XPEL · لم تُنفَّذ الخدمة"],
        ],
      },
      {
        title: "الخط الزمني",
        rows: [
          ["طلب العميل", "14 أكتوبر 2026 10:05 ص"],
          ["اعتماد الاسترداد", "14 أكتوبر 2026 11:20 ص"],
          ["إرسال للبوابة", "14 أكتوبر 2026 11:21 ص"],
          ["الوصول المتوقع", "حتى 21 أكتوبر 2026"],
        ],
      },
    ],
    doc: "CN-L-2026-10-00412",
    footer: "refund-live",
  },
  "RF-2026-0189": {
    title: "استرداد RF-2026-0189",
    subtitle: "BK-21471 · ماجد ك. · جونسون الحمراء",
    hero: { title: "1,299 ر.س إلى تمارا", lines: ["السبب: إلغاء العميل قبل الزيارة · اعتمدته هند م. 13 أكتوبر 2026"] },
    tileStyle: "card",
    tiles: card([
      ["الإشعار الدائن", "CN-L-2026-10-00409"],
      ["أثره على المزوّد", "لا يُضاف لمستحقات المزوّد · لم تُنفَّذ الخدمة"],
      ["وصل للعميل", "13 أكتوبر 2026 · خلال يوم"],
    ]),
    doc: "CN-L-2026-10-00409",
    footer: "credit",
  },
  "RF-2026-0186": {
    title: "استرداد RF-2026-0186",
    subtitle: "BK-21357 · سلمان د. · جونسون الزهراء",
    hero: { title: "1,899 ر.س إلى Apple Pay", lines: ["السبب: تعذّر قبول الخدمة ولم يقبل العميل التحويل · قرار REQ-2026-0377"] },
    tileStyle: "card",
    tiles: card([
      ["الإشعار الدائن", "CN-L-2026-09-00371"],
      ["أثره على المزوّد", "لا يُضاف لمستحقات المزوّد · لم تُنفَّذ الخدمة"],
      ["وصل للعميل", "28 سبتمبر 2026"],
    ]),
    doc: "CN-L-2026-09-00371",
    footer: "credit",
  },
};

/** بطاقات الأرقام (CON5-15) — الخادم يحسبها من كل العمليات، مش من الصفوف الظاهرة بس */
export interface PaymentsKpis {
  payments: { value: string; hint: string };
  refunds: { value: string; hint: string };
  dues: { value: string; hint: string };
  margin: { value: string; hint: string };
}
const KPIS: PaymentsKpis = {
  payments: { value: "4.86 مليون", hint: "4,212 عملية حتى اليوم" },
  refunds: { value: "62,410 ر.س", hint: "1.3% من المدفوعات" },
  dues: { value: "2.14 مليون", hint: "عن 1,862 حجزاً منفّذاً · تُحوَّل 1 نوفمبر 2026" },
  margin: { value: "941,200 ر.س", hint: "19.4% من مبيعات الشهر" },
};
/** عدد العمليات في كل تبويب (كل الشهر) — الجدول يعرض أحدثها */
const COUNTS: Record<PayTab, number> = { payments: 4212, refunds: 73 };

const sent: { id: string; at: string }[] = [];

export const paymentsApi = {
  kpis: async () => delay(KPIS, 200),
  list: async ({ tab }: { tab: PayTab }) => {
    const items = ROWS.filter((r) => (tab === "refunds" ? r.kind === "refund" : r.kind === "payment"));
    return delay({ items, total: COUNTS[tab], counts: COUNTS });
  },
  get: async (id: string): Promise<PaymentDetail> => {
    const row = ROWS.find((r) => r.id === id);
    const extra = DETAILS[id];
    if (!row || !extra) throw new ApiError(404, "العملية غير موجودة");
    return delay({ ...row, ...extra }, 200);
  },
  /** «إرسال الإيصال» / «إرسال الإيصال للعميل» — رسالة للعميل بالإيصال (الخادم يسجّلها) */
  sendReceipt: async (id: string) => {
    sent.push({ id, at: new Date().toISOString() });
    return delay({ ok: true }, 400);
  },
};
