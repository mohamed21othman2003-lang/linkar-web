// القيم الافتراضية لنوافذ الإرسال الجماعي حسب الجمهور — حرفياً من إطارات Figma CON5-05M
// (رسالة نصية 3114-20831 … · إشعار التطبيق 3114-20883 … · كوبون أو هدية 3114-21489 … · نقاط هدية 3114-22835 … · خدمة هدية 3114-22902 …)
import type { CustomerQuery } from "@/lib/api/customers";
import { num } from "@/lib/format";

export type PresetKey = "selected" | "active" | "vouchers" | "center" | "branch" | "service" | "generic";

export function presetKey(a: { kind: "selected" } | { kind: "view"; query: CustomerQuery }): PresetKey {
  if (a.kind === "selected") return "selected";
  const q = a.query;
  if (q.branch) return q.branch === "LK-JN-ZH-001" ? "branch" : "generic";
  if (q.center) return q.center === "جونسون" ? "center" : "generic";
  if (q.service) return q.service === "نانو سيراميك" ? "service" : "generic";
  if (q.segment === "active") return "active";
  if (q.segment === "vouchers") return "vouchers";
  return "generic";
}

// قوائم CON5-DD (3114:65602 · 65616 · 65626 · 65710 · 65726 · 65594 · 65816)
export const OFFERS = ["عرض الشتاء · خصم 10% نانو سيراميك · 1 نوفمبر – 31 ديسمبر 2026", "عرض الشتاء · خصم 10% نانو سيراميك · جونسون", "باقة العناية الكاملة · جونسون", "باقة النانو والتلميع", "بلا عرض مرتبط · تذكير بالقسيمة"];
export const SEND_TIMES = ["الآن", "15 أكتوبر 2026 · 7:00 م", "جدولة وقت آخر…"];
export const OPEN_TARGETS = ["صفحة العرض · عرض الشتاء", "صفحة الباقة · باقة العناية الكاملة", "قسائمي", "الرئيسية", "صفحة الخدمة"];
export const APPLIES_TO = ["كل الخدمات · كل المراكز", "الباقات فقط · كل المراكز", "نانو سيراميك · كل المراكز", "خدمات جونسون · كل الفروع", "جونسون · فرع الزهراء فقط", "الحجز التالي بعد استخدام القسيمة"];
export const USAGE = ["مرة واحدة لكل عميل", "مرتان لكل عميل", "بلا حد"];
export const GIFT_REASONS = ["هدية ولاء", "تعويض شكوى", "مكافأة دعوة"];
export const GIFT_SERVICES = ["تلميع خارجي سريع · سيدان", "غسيل داخلي وخارجي · سيدان", "تلميع خارجي سريع · SUV"];
export const GIFT_CENTERS = ["مركز لمعة للتلميع · كل الفروع", "جونسون · كل الفروع", "مغسلة الندى · كل الفروع"];
export const VALIDITY = ["حتى 30 نوفمبر 2026", "حتى 31 ديسمبر 2026", "حتى 31 يناير 2027"];
export const MSG_TYPES = ["تذكير", "كود خصم", "ترويج"] as const;
export type MsgType = (typeof MSG_TYPES)[number];

type Sms = { type: MsgType; offer: string; text: string; count?: string; note: (n: number) => string };
const WINTER = OFFERS[0];
const WINTER_JN = OFFERS[1];
/** تمييز العدد: 104 عملاء · 212 عميلاً */
export const customersWord = (n: number) => (n % 100 >= 3 && n % 100 <= 10 ? "عملاء" : "عميلاً");
const smsNote = (excluded: number, total: number, word = "الرسائل التسويقية") => `يُستبعد تلقائياً ${num(excluded)} ${customersWord(excluded)} ألغوا الاشتراك في ${word} · تُرسل ${num(total - excluded)} رسالة.`;

export const SMS: Record<PresetKey, Sms> = {
  selected: { type: "ترويج", offer: WINTER, text: "لينكار: عرض الشتاء خصم 10% على نانو سيراميك من 1 نوفمبر 2026 حتى 31 ديسمبر 2026. احجز من linkar.sa", count: "88 حرفاً", note: () => "لا أحد من المحددين ألغى الاشتراك في الرسائل التسويقية." },
  active: { type: "ترويج", offer: WINTER, text: "لينكار: عرض الشتاء خصم 10% على نانو سيراميك من 1 نوفمبر 2026 حتى 31 ديسمبر 2026. احجز من linkar.sa", count: "88 حرفاً", note: (n) => smsNote(212, n) },
  vouchers: { type: "تذكير", offer: OFFERS[4], text: "لينكار: قسيمة حجزك صالحة حتى تاريخ انتهائها. تواصل مع المركز لترتيب موعد زيارتك قبل انتهائها.", count: "93 حرفاً", note: (n) => smsNote(18, n, "الرسائل") },
  center: { type: "ترويج", offer: WINTER_JN, text: "لينكار: عرض الشتاء لدى جونسون خصم 10% على نانو سيراميك من 1 نوفمبر 2026. احجز من linkar.sa", count: "85 حرفاً", note: (n) => smsNote(260, n) },
  branch: { type: "ترويج", offer: WINTER_JN, text: "لينكار: عرض الشتاء في جونسون فرع الزهراء خصم 10% على نانو سيراميك من 1 نوفمبر 2026. احجز من linkar.sa", count: "96 حرفاً", note: (n) => smsNote(104, n) },
  service: { type: "تذكير", offer: WINTER, text: "لينكار: حان موعد صيانة طبقة النانو لسيارتك. عرض الشتاء خصم 10% على نانو سيراميك من 1 نوفمبر 2026. linkar.sa", count: "102 حرفاً", note: (n) => smsNote(150, n) },
  generic: { type: "ترويج", offer: WINTER, text: "لينكار: عرض الشتاء خصم 10% على نانو سيراميك من 1 نوفمبر 2026 حتى 31 ديسمبر 2026. احجز من linkar.sa", note: (n) => smsNote(Math.round(n * 0.05), n) },
};

type Push = { title: string; body: string; target: string; note: (n: number) => string };
const pushNote = (on: number, n: number) => `الإشعارات مفعّلة لدى ${num(on)} من ${num(n)} · البقية يرونه في «الإشعارات» عند الدخول.`;
export const PUSH: Record<PresetKey, Push> = {
  selected: { title: "عرض الشتاء على نانو سيراميك", body: "خصم 10% على نانو سيراميك لدى جونسون ونانو شيلد من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: () => "يصل للمحددين الثلاثة، فالإشعارات مفعّلة لديهم." },
  active: { title: "عرض الشتاء على نانو سيراميك", body: "خصم 10% على نانو سيراميك لدى جونسون ونانو شيلد من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: (n) => pushNote(2960, n) },
  vouchers: { title: "قسيمتك بانتظارك", body: "قسيمة حجزك صالحة حتى تاريخ انتهائها. رتّب موعد زيارتك مع المركز.", target: OPEN_TARGETS[2], note: (n) => pushNote(610, n) },
  center: { title: "عرض الشتاء لدى جونسون", body: "خصم 10% على نانو سيراميك في كل فروع جونسون من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: (n) => pushNote(3640, n) },
  branch: { title: "عرض الشتاء في فرع الزهراء", body: "خصم 10% على نانو سيراميك في جونسون فرع الزهراء من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: (n) => pushNote(1510, n) },
  service: { title: "حان موعد صيانة طبقة النانو", body: "احجز صيانة نانو سيراميك بخصم 10% ضمن عرض الشتاء من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: (n) => pushNote(2100, n) },
  generic: { title: "عرض الشتاء على نانو سيراميك", body: "خصم 10% على نانو سيراميك لدى جونسون ونانو شيلد من 1 نوفمبر 2026.", target: OPEN_TARGETS[0], note: (n) => pushNote(Math.round(n * 0.76), n) },
};

type Coupon = { value: string; max: string; applies: string; code: string };
export const COUPON: Record<PresetKey, Coupon> = {
  selected: { value: "100 ر.س", max: "—", applies: APPLIES_TO[0], code: "VIP100" },
  active: { value: "10%", max: "200 ر.س", applies: APPLIES_TO[0], code: "OFFER10" },
  vouchers: { value: "50 ر.س", max: "—", applies: APPLIES_TO[5], code: "VISIT50" },
  center: { value: "10%", max: "200 ر.س", applies: APPLIES_TO[3], code: "JN10" },
  branch: { value: "10%", max: "200 ر.س", applies: APPLIES_TO[4], code: "ZH10" },
  service: { value: "10%", max: "200 ر.س", applies: APPLIES_TO[2], code: "NANO10" },
  generic: { value: "10%", max: "200 ر.س", applies: APPLIES_TO[0], code: "OFFER10" },
};

/** «88 حرفاً · رسالتان لكل عميل (الرسالة العربية 70 حرفاً)» */
export function smsCount(text: string, preset?: string) {
  const n = text.length;
  const parts = Math.max(1, Math.ceil(n / 70));
  const per = parts === 1 ? "رسالة واحدة" : parts === 2 ? "رسالتان" : `${num(parts)} رسائل`;
  return `${preset ?? `${num(n)} حرفاً`} · ${per} لكل عميل (الرسالة العربية 70 حرفاً)`;
}
