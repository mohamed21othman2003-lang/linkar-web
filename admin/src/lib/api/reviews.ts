// التقييمات والشكاوى (المرحلة 2 · Figma «v5 · 18 · التقييمات والشكاوى» 3114:413).
// تبويب «الشكاوى» (CON5-18 3114:414) + «التقييمات» (3114:1248) · أدراج CON5-18D (CM-… / RV-…) · نوافذ CON5-18M · رسائل CON5-T1801–1808.
// نفس الأكواد المستخدمة في باقي اللوحة: CM-3352 (الحمراء) و CM-3349 (المحمدية) في branches.ts · CM-3340 في customers.ts · RV-88402/88391 في bookings.ts.
import { ApiError, delay } from "./errors";

const clone = <T,>(v: T): T => structuredClone(v);

export type QualityTone = "pending" | "danger" | "trial" | "success" | "neutral";
export type ComplaintStage = "center" | "linkar" | "customer" | "closed";

export interface ComplaintRow {
  id: string;
  customer: string;
  booking: string;
  center: string;
  branch: string;
  category: string;
  openedAt: string;
  stage: ComplaintStage;
  status: { label: string; tone: QualityTone; sub: string };
}
export interface Message {
  author: string;
  kind: "customer" | "system" | "linkar" | "center";
  at: string;
  text: string;
}
export interface ComplaintDetail extends ComplaintRow {
  title: string;
  subtitle: string;
  hero: { pill: string; tone: QualityTone; title: string; sub: string };
  booking_: [string, string][];
  complaint?: { text: string; preferred: string };
  result?: [string, string][];
  messages: Message[];
  note?: string;
  /** نافذة «مراسلة المركز» (CON5-18M 3114:1131) و«رسالة للعميل» (3114:1159) */
  centerContact?: string;
  centerMsg?: string;
  customerTo?: string;
  customerMsg?: string;
}

const CLOSED_NOTE = "لا يمكن إعادة فتح الشكوى المغلقة. إن تكررت المشكلة يفتح العميل شكوى جديدة.";
const closed = (o: { id: string; customer: string; booking: string; center: string; branch: string; category: string; openedAt: string; done: string; days: string; rating: string; row: string }): ComplaintDetail => ({
  id: o.id,
  customer: o.customer,
  booking: o.booking,
  center: o.center,
  branch: o.branch,
  category: o.category,
  openedAt: o.openedAt,
  stage: "closed",
  status: { label: "مغلقة", tone: "success", sub: o.row },
  title: `‏${o.id} · شكوى مغلقة`,
  subtitle: `${o.customer} · ${o.center.replace("‏", "")} · ${o.branch}`,
  hero: { pill: o.category, tone: "success", title: "مغلقة · تم الحل", sub: o.done },
  booking_: [],
  result: [
    ["ما نُفّذ", o.done],
    ["المنفّذ", "المركز"],
    ["مدة الحل", o.days || "3 أيام"],
    ["تقييم العميل للحل", o.rating],
  ],
  messages: [],
  note: CLOSED_NOTE,
});

const complaints: ComplaintDetail[] = [
  {
    id: "CM-3352",
    customer: "فهد م.",
    booking: "BK-21438",
    center: "جونسون Johnson",
    branch: "فرع الحمراء",
    category: "جودة التنفيذ",
    openedAt: "14 أكتوبر 2026",
    stage: "center",
    status: { label: "بانتظار رد المركز", tone: "pending", sub: "تتبقى 18 ساعة" },
    title: "‏CM-3352 · شكوى على حجز",
    subtitle: "فهد م. · جونسون Johnson · فرع الحمراء",
    hero: { pill: "جودة التنفيذ", tone: "pending", title: "بانتظار رد المركز", sub: "" },
    booking_: [
      ["رقم الحجز", "BK-21438"],
      ["الخدمة", "تفصيل داخلي كامل"],
      ["الزيارة", "10 أكتوبر 2026 · فرع الحمراء"],
      ["المبلغ · شامل الضريبة", "449 ر.س"],
    ],
    complaint: { text: "«بعد التفصيل الداخلي لقيت بقعة واضحة على المقعد الخلفي ما انشالت، وفيه غبار في فتحات التكييف.»", preferred: "إعادة تنظيف المقصورة" },
    messages: [
      { author: "فهد م.", kind: "customer", at: "14 أكتوبر 2026 · 9:20 ص", text: "فتح الشكوى من حسابه وأرفق صورة الفاتورة." },
      { author: "النظام", kind: "system", at: "14 أكتوبر 2026 · 9:21 ص", text: "أُبلغ المركز · تنتقل الشكوى لفريق لينكار إن لم يرد حتى 15 أكتوبر 2026." },
    ],
  },
  {
    id: "CM-3349",
    customer: "أحمد ز.",
    booking: "BK-21426",
    center: "جونسون Johnson",
    branch: "فرع المحمدية",
    category: "جودة التنفيذ",
    openedAt: "10 أكتوبر 2026",
    stage: "linkar",
    status: { label: "لدى لينكار", tone: "danger", sub: "صُعّدت 11 أكتوبر 2026" },
    title: "‏CM-3349 · شكوى على حجز",
    subtitle: "أحمد ز. · جونسون Johnson · فرع المحمدية",
    hero: { pill: "جودة التنفيذ", tone: "danger", title: "لدى لينكار", sub: "صُعّدت تلقائياً 11 أكتوبر 2026 · المتابعة: لينا الحربي" },
    booking_: [
      ["رقم الحجز", "BK-21426"],
      ["الخدمة", "‏Johnson Ceramic Pro · SUV كبيرة"],
      ["اكتملت", "4 أكتوبر 2026 · فرع المحمدية"],
      ["المبلغ · شامل الضريبة", "2,499 ر.س"],
    ],
    complaint: { text: "«ظهرت بقع وتموجات في طبقة النانو على غطاء المحرك بعد أسبوع من الاستلام.» · 3 صور مرفقة", preferred: "إعادة الخدمة مجاناً" },
    messages: [
      { author: "أحمد ز.", kind: "customer", at: "10 أكتوبر 2026 · 6:10 م", text: "فتح الشكوى وأرفق 3 صور." },
      { author: "النظام", kind: "system", at: "11 أكتوبر 2026 · 6:10 م", text: "لم يرد المركز خلال 24 ساعة · انتقلت الشكوى لفريق لينكار." },
      { author: "لينا الحربي · لينكار", kind: "linkar", at: "11 أكتوبر 2026 · 7:30 م", text: "تواصلنا مع المركز وطلبنا فحص الطبقة، وسنعود إليك خلال 24 ساعة." },
      { author: "جونسون · فرع المحمدية", kind: "center", at: "12 أكتوبر 2026 · 11:05 ص", text: "نعتذر. نستقبل السيارة 15 أكتوبر 2026 لإعادة الطبقة على الغطاء مجاناً." },
    ],
    note: "ينفّذ المركز الحل في الخدمة، وأي استرداد تنفّذه لينكار عبر لينكار. تُغلق الشكوى بعد تأكيد العميل.",
    centerContact: "خالد الزهراني · مسؤول التواصل · جونسون",
    centerMsg: "نرجو تأكيد موعد إعادة الطبقة 15 أكتوبر 2026 وإرفاق صورة بعد التنفيذ.",
    customerTo: "أحمد ز. · إشعار في التطبيق + رسالة نصية",
    customerMsg: "حدد المركز 15 أكتوبر 2026 لإعادة الطبقة مجاناً. هل يناسبك الموعد؟",
  },
  {
    id: "CM-3340",
    customer: "محمد سالم",
    booking: "BK-21388",
    center: "مركز لمعة للتلميع",
    branch: "فرع السلامة",
    category: "جودة التنفيذ",
    openedAt: "9 أكتوبر 2026",
    stage: "customer",
    status: { label: "بانتظار رد العميل", tone: "trial", sub: "اقترح المركز إعادة التلميع 17 أكتوبر 2026" },
    title: "‏CM-3340 · شكوى على حجز",
    subtitle: "محمد سالم · مركز لمعة للتلميع · فرع السلامة",
    hero: { pill: "جودة التنفيذ", tone: "trial", title: "بانتظار رد العميل", sub: "اقترح المركز إعادة التلميع مجاناً 17 أكتوبر 2026" },
    booking_: [
      ["رقم الحجز", "BK-21388"],
      ["الخدمة", "تلميع ثلاث مراحل · لكزس ES 2022"],
      ["اكتملت", "8 أكتوبر 2026"],
    ],
    messages: [
      { author: "محمد سالم", kind: "customer", at: "9 أكتوبر 2026", text: "بعد استلام السيارة لاحظت آثار تلميع بيضاء على حواف المصابيح الأمامية. أرفقت صورتين." },
      { author: "فريق لينكار", kind: "linkar", at: "9 أكتوبر 2026 · 1:05 م", text: "تواصلنا مع المركز وطلبنا فحص الصور، وسنعود إليك قبل 20 أكتوبر 2026." },
      { author: "مركز لمعة للتلميع", kind: "center", at: "13 أكتوبر 2026", text: "نعتذر عن ذلك. نستقبل السيارة لإزالة الآثار مجاناً 17 أكتوبر 2026 4:00 م." },
      { author: "النظام", kind: "system", at: "13 أكتوبر 2026 · 10:41 ص", text: "أُرسل الحل المقترح للعميل · بانتظار رده." },
    ],
  },
  closed({ id: "CM-3351", customer: "هيفاء ر.", booking: "BK-21430", center: "كار سبا", branch: "فرع العليا", category: "السعر مختلف", openedAt: "13 أكتوبر 2026", done: "اعتذار وتوضيح: الفرق بسبب حجم السيارة المسجّل", days: "6 ساعات", rating: "جيد", row: "اعتذار وتوضيح · خلال 6 ساعات" }),
  closed({ id: "CM-3348", customer: "بدر ق.", booking: "BK-21423", center: "‏XPEL السعودية", branch: "فرع الملقا", category: "تأخير عن الموعد", openedAt: "11 أكتوبر 2026", done: "اعتذار وتوضيح من المركز", days: "يوم", rating: "جيد", row: "اعتذار وتوضيح · خلال يوم" }),
  closed({ id: "CM-3347", customer: "سلطان ح.", booking: "BK-21377", center: "نانو شيلد", branch: "فرع السلامة", category: "جودة التنفيذ", openedAt: "8 أكتوبر 2026", done: "أعاد المركز الخدمة مجاناً", days: "يومان", rating: "ممتاز", row: "أُعيدت الخدمة مجاناً · خلال يومين" }),
  closed({ id: "CM-3345", customer: "ريم ع.", booking: "BK-21352", center: "لومار LLumar", branch: "فرع النخيل", category: "ضرر بالسيارة", openedAt: "5 أكتوبر 2026", done: "أصلح المركز الضرر على حسابه", days: "", rating: "ممتاز", row: "أصلح المركز الضرر على حسابه" }),
  // الصفحة 2 من «عرض 1 – 7 من 9 هذا الشهر» (ما لهاش إطارات)
  closed({ id: "CM-3343", customer: "نواف ش.", booking: "BK-21341", center: "مركز لمعة للتلميع", branch: "فرع الروضة", category: "تأخير عن الموعد", openedAt: "3 أكتوبر 2026", done: "اعتذار وتوضيح من المركز", days: "يوم", rating: "جيد", row: "اعتذار وتوضيح · خلال يوم" }),
  closed({ id: "CM-3341", customer: "دانة م.", booking: "BK-21329", center: "مغسلة الريان", branch: "الفرع الرئيسي", category: "جودة التنفيذ", openedAt: "1 أكتوبر 2026", done: "أعاد المركز الخدمة مجاناً", days: "يومان", rating: "ممتاز", row: "أُعيدت الخدمة مجاناً · خلال يومين" }),
];

/** خيارات «ما النتيجة التي نُفّذت؟» (CON5-18M إغلاق بنتيجة 3114:1049) */
export const CLOSE_OUTCOMES = ["أعاد المركز الخدمة مجاناً", "أصلح المركز الضرر على حسابه", "اعتمدت لينكار استرداداً للعميل عبر لينكار", "اعتذار وتوضيح", "رُفضت الشكوى (غير مستحقة)"];
/** القائمة المرجعية «أسباب إخفاء التقييم» (CON5-18M إخفاء) */
export const HIDE_REASONS = ["معلومات شخصية", "إعلان أو رابط", "محتوى مسيء", "تقييم لا يخص الخدمة"];
/** «قوالب الردود» → سبب إعادة رد المركز (CON5-18M 3114:1300) */
export const RETURN_REASONS = ["يذكر وعداً لا تضمنه لينكار", "يحتوي بيانات تواصل خارج المنصة", "لا يعالج ملاحظة العميل", "أسلوب غير لائق"];
/** فلاتر الشكاوى */
export const COMPLAINT_CATEGORIES = ["جودة التنفيذ", "السعر مختلف", "تأخير عن الموعد", "ضرر بالسيارة"];
export const COMPLAINT_STAGES: { value: ComplaintStage; label: string }[] = [
  { value: "center", label: "بانتظار رد المركز" },
  { value: "linkar", label: "لدى لينكار" },
  { value: "customer", label: "بانتظار رد العميل" },
  { value: "closed", label: "مغلقة" },
];

// ───────────── التقييمات (CON5-18 · التقييمات 3114:1248) ─────────────

export type ReviewState = "flagged" | "published" | "hidden";
export interface ReviewRow {
  id: string;
  stars: number;
  text: string;
  textSub?: string;
  customer: string;
  booking: string;
  center: string;
  date: string;
  state: ReviewState;
  status: { label: string; tone: QualityTone; sub?: string };
}
export interface ReviewDetail extends ReviewRow {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSub: string;
  heroPill?: string;
  fullText: string;
  reply?: { text: string; pending: boolean };
  aspects?: [string, number][];
  hideReason?: string;
}

const aspects = (a: number, b: number, c: number, d: number): [string, number][] => [
  ["جودة العمل", a],
  ["التعامل والتواصل", b],
  ["القيمة مقابل السعر", c],
  ["العناية بالسيارة ونظافتها", d],
];

const reviews: ReviewDetail[] = [
  {
    id: "RV-88407",
    stars: 2,
    text: "«الموظف أعطاني رقمه الخاص لأحجز خارج التطبيق بسعر أقل…»",
    textSub: "يحتوي رقم جوال",
    customer: "ناصر ف.",
    booking: "BK-21444",
    center: "كار سبا",
    date: "13 أكتوبر 2026",
    state: "flagged",
    status: { label: "بلاغ · معلومات شخصية", tone: "danger", sub: "من النظام" },
    title: "‏RV-88407 · بلاغ على تقييم",
    subtitle: "كار سبا · ناصر ف. · BK-21435",
    heroTitle: "★★ · كار سبا",
    heroSub: "بلاغ: معلومات شخصية · من النظام",
    heroPill: "بلاغ",
    fullText: "«الموظف أعطاني رقمه الخاص لأحجز خارج التطبيق بسعر أقل، والتلميع لم يكن بالمستوى.»",
    hideReason: "معلومات شخصية",
  },
  {
    id: "RV-88395",
    stars: 1,
    text: "«خدمة سيئة، جرّبوا مغسلتنا الجديدة على الرابط…»",
    textSub: "يحتوي رابطاً خارجياً",
    customer: "حساب جديد",
    booking: "BK-21402",
    center: "مغاسل اللؤلؤة",
    date: "11 أكتوبر 2026",
    state: "flagged",
    status: { label: "بلاغ · إعلان أو رابط", tone: "danger", sub: "من المركز" },
    title: "‏RV-88395 · بلاغ على تقييم",
    subtitle: "مغاسل اللؤلؤة · حساب جديد · BK-21402",
    heroTitle: "★ · مغاسل اللؤلؤة",
    heroSub: "بلاغ: إعلان أو رابط · من المركز",
    heroPill: "بلاغ",
    fullText: "«خدمة سيئة، جرّبوا مغسلتنا الجديدة على الرابط linkwash.co»",
    hideReason: "إعلان أو رابط",
  },
  {
    id: "RV-88402",
    stars: 3,
    text: "«التنظيف الداخلي مقبول، لكن بقيت آثار طين على الدواسات والسقف ما تنظّف كويس.»",
    customer: "سعود ب.",
    booking: "BK-21459",
    center: "جونسون Johnson",
    date: "13 أكتوبر 2026",
    state: "published",
    status: { label: "منشور", tone: "success", sub: "رد المركز بانتظار الاعتماد" },
    title: "‏RV-88402 · تقييم",
    subtitle: "جونسون Johnson · فرع المحمدية · سعود ب. · BK-21459",
    heroTitle: "★★★ · جونسون Johnson · فرع المحمدية",
    heroSub: "منشور · رد المركز بانتظار اعتماد لينكار",
    fullText: "«التنظيف الداخلي مقبول، لكن بقيت آثار طين على الدواسات والسقف ما تنظّف كويس.»",
    reply: {
      text: "«نعتذر عن هذه الملاحظة يا سعود. تواصل معك مدير فرع المحمدية لترتيب زيارة لإعادة تنظيف الدواسات والسقف دون أي تكلفة.» — ياسر العمري (مدير الفرع) · 14 أكتوبر 2026",
      pending: true,
    },
    aspects: aspects(3, 4, 3, 2),
  },
  {
    id: "RV-88399",
    stars: 5,
    text: "«تظليل ممتاز والتسليم في الموعد»",
    customer: "خالد ر.",
    booking: "BK-21399",
    center: "لومار LLumar",
    date: "12 أكتوبر 2026",
    state: "published",
    status: { label: "منشور", tone: "success", sub: "ردّ المركز" },
    title: "‏RV-88399 · تقييم",
    subtitle: "لومار LLumar · خالد ر. · BK-21399",
    heroTitle: "★★★★★ · لومار LLumar",
    heroSub: "منشور · ردّ المركز",
    fullText: "«تظليل ممتاز والتسليم في الموعد.»",
    aspects: aspects(5, 5, 4, 5),
  },
  {
    id: "RV-88391",
    stars: 5,
    text: "«النانو سيراميك ممتاز والتعامل راقٍ»",
    customer: "ريم س.",
    booking: "BK-21396",
    center: "جونسون Johnson",
    date: "11 أكتوبر 2026",
    state: "published",
    status: { label: "منشور", tone: "success" },
    title: "‏RV-88391 · تقييم",
    subtitle: "جونسون Johnson · لمى ع. · BK-21447",
    heroTitle: "★★★★★ · جونسون Johnson",
    heroSub: "منشور",
    fullText: "«النانو سيراميك ممتاز والتعامل راقٍ.»",
    aspects: aspects(5, 5, 4, 5),
  },
  {
    id: "RV-88377",
    stars: 1,
    text: "«[نص مخفي]»",
    textSub: "ألفاظ مسيئة",
    customer: "م. ع.",
    booking: "BK-21361",
    center: "مركز الصفوة للعناية",
    date: "9 أكتوبر 2026",
    state: "hidden",
    status: { label: "مخفي", tone: "neutral", sub: "لينا الحربي · محتوى مسيء" },
    title: "‏RV-88377 · تقييم",
    subtitle: "مركز الصفوة للعناية · م. ع. · BK-21361",
    heroTitle: "★ · مركز الصفوة للعناية",
    heroSub: "مخفي · محتوى مسيء · لينا الحربي",
    fullText: "«[نص مخفي]»",
    aspects: aspects(2, 1, 1, 1),
  },
];
/** إجمالي تقييمات الشهر (Figma «412») — الصفحات بعد الأولى بتتولّد من عيّنة تقييمات منشورة */
const REVIEWS_TOTAL = 412;
const POOL: [string, string, number, string][] = [
  ["«شغل نظيف والتسليم في الموعد»", "جونسون Johnson", 5, "عبدالله ن."],
  ["«التلميع ممتاز لكن الانتظار طويل شوي»", "مركز لمعة للتلميع", 4, "منى ح."],
  ["«الغسيل سريع والتعامل لطيف»", "مغسلة الريان", 5, "سامي ق."],
  ["«النتيجة جيدة والسعر مناسب»", "نانو شيلد", 4, "هند ع."],
  ["«تظليل ممتاز ونصحوني بالدرجة المناسبة»", "‏XPEL السعودية", 5, "فيصل م."],
  ["«الخدمة طيبة بس تأخروا نص ساعة»", "كار سبا", 3, "رنا ك."],
];

const reviewRow = (r: ReviewDetail): ReviewRow => ({ id: r.id, stars: r.stars, text: r.text, textSub: r.textSub, customer: r.customer, booking: r.booking, center: r.center, date: r.date, state: r.state, status: r.status });
const complaintRow = (c: ComplaintDetail): ComplaintRow => ({ id: c.id, customer: c.customer, booking: c.booking, center: c.center, branch: c.branch, category: c.category, openedAt: c.openedAt, stage: c.stage, status: c.status });
const findC = (id: string) => {
  const c = complaints.find((x) => x.id === id);
  if (!c) throw new ApiError(404, "الشكوى غير موجودة");
  return c;
};
const findR = (id: string) => {
  const r = reviews.find((x) => x.id === id);
  if (!r) throw new ApiError(404, "التقييم غير موجود");
  return r;
};
const C_PAGE = 7;
const R_PAGE = 6;

export interface QualityFilters {
  center?: string;
  category?: string;
  stage?: string;
  stars?: string;
  state?: string;
  search?: string;
  page?: number;
}
/** المراكز في فلتر «المركز» */
export const QUALITY_CENTERS = ["جونسون Johnson", "مركز لمعة للتلميع", "كار سبا", "‏XPEL السعودية", "نانو شيلد", "لومار LLumar", "مغاسل اللؤلؤة", "مركز الصفوة للعناية", "مغسلة الريان"];

export const qualityApi = {
  /** بطاقات الأرقام أعلى الصفحة (CON5-18) */
  kpis: async () => {
    const open = complaints.filter((c) => c.stage !== "closed");
    const flagged = reviews.filter((r) => r.state === "flagged").length;
    const pendingReply = reviews.filter((r) => r.reply?.pending).map((r) => r.id);
    return delay(
      {
        flagged,
        flaggedHint: `بانتظار قرار الإخفاء أو الإبقاء${pendingReply.length ? ` · وردّ مركز واحد بانتظار الاعتماد (${pendingReply.join("، ")})` : ""}`,
        per100: "0.7",
        per100Hint: `${complaints.length} شكاوى من 1,288 حجزاً`,
        resolve: "1.7 يوم",
        open: open.length,
        openHint: `${open.filter((c) => c.stage === "linkar").length} لدى لينكار · ${open.filter((c) => c.stage === "center").length} لدى المركز · ${open.filter((c) => c.stage === "customer").length} لدى العميل`,
        counts: { complaints: complaints.length, reviews: REVIEWS_TOTAL },
      },
      200,
    );
  },
  /** GET /complaints?center=&category=&stage=&search=&page= */
  complaints: async ({ center, category, stage, search, page = 1 }: QualityFilters = {}) => {
    const q = search?.trim().toLowerCase();
    const list = complaints.filter(
      (c) => (!center || c.center === center) && (!category || c.category === category) && (!stage || c.stage === stage) && (!q || c.id.toLowerCase().includes(q) || c.booking.toLowerCase().includes(q) || c.center.includes(q) || c.customer.includes(q)),
    );
    const pages = Math.max(1, Math.ceil(list.length / C_PAGE));
    const p = Math.min(Math.max(1, page), pages);
    const items = list.slice((p - 1) * C_PAGE, p * C_PAGE).map(complaintRow);
    return delay({ items: clone(items), total: list.length, page: p, pages, from: list.length ? (p - 1) * C_PAGE + 1 : 0, to: (p - 1) * C_PAGE + items.length, counts: { complaints: complaints.length } });
  },
  complaint: async (id: string) => delay(clone(findC(id)), 200),
  /** GET /reviews?center=&stars=&state=&search=&page= */
  reviews: async ({ center, stars, state, search, page = 1 }: QualityFilters = {}) => {
    const q = search?.trim();
    const filtered = !!(center || stars || state || q);
    const list = reviews.filter((r) => (!center || r.center === center) && (!stars || r.stars === Number(stars)) && (!state || r.state === state) && (!q || r.text.includes(q) || r.center.includes(q) || r.id.includes(q.toUpperCase())));
    const total = filtered ? list.length : REVIEWS_TOTAL;
    const pages = Math.max(1, Math.ceil(total / R_PAGE));
    const p = Math.min(Math.max(1, page), pages);
    let items: ReviewRow[];
    if (filtered || p === 1) items = list.slice((p - 1) * R_PAGE, p * R_PAGE).map(reviewRow);
    else
      items = Array.from({ length: Math.min(R_PAGE, total - (p - 1) * R_PAGE) }, (_, i) => {
        const n = (p - 1) * R_PAGE + i;
        const [text, center, stars, customer] = POOL[n % POOL.length];
        return { id: `RV-${88376 - n}`, stars, text, customer, booking: `BK-${21360 - n}`, center, date: `${Math.max(1, 9 - Math.floor(n / 60))} أكتوبر 2026`, state: "published" as const, status: { label: "منشور", tone: "success" as const } };
      });
    return delay({ items: clone(items), total, page: p, pages, from: total ? (p - 1) * R_PAGE + 1 : 0, to: (p - 1) * R_PAGE + items.length, counts: { reviews: REVIEWS_TOTAL } });
  },
  review: async (id: string) => delay(clone(findR(id)), 200),

  /** «تذكير المركز» → CON5-T1801 */
  remindCenter: async (id: string) => {
    findC(id);
    return delay({ toast: "أُرسل التذكير لمسؤول التواصل في المركز" }, 350);
  },
  /** «تذكير العميل» → CON5-T1806 */
  remindCustomer: async (id: string) => {
    findC(id);
    return delay({ toast: "أُرسل تذكير تأكيد الحل للعميل" }, 350);
  },
  /** «إغلاق الشكوى» (CON5-18M 3114:1049) → CON5-T1802 */
  close: async (id: string, v: { outcome: string; message: string; askRating: boolean }) => {
    if (!v.message.trim()) throw new ApiError(422, "تحقق من الحقول", { message: "اكتب رسالة للعميل" });
    const c = findC(id);
    Object.assign(c, {
      stage: "closed",
      status: { label: "مغلقة", tone: "success", sub: v.outcome },
      title: `‏${c.id} · شكوى مغلقة`,
      hero: { pill: c.category, tone: "success", title: "مغلقة · تم الحل", sub: v.outcome },
      result: [
        ["ما نُفّذ", v.outcome],
        ["المنفّذ", v.outcome.includes("لينكار") ? "لينكار" : "المركز"],
        ["مدة الحل", "4 أيام"],
        ["تقييم العميل للحل", v.askRating ? "بانتظار تقييم العميل" : "—"],
      ],
      note: CLOSED_NOTE,
    });
    return delay({ toast: "أُغلقت الشكوى وأُبلغ العميل والمركز" }, 450);
  },
  /** «مراسلة المركز» / «رسالة للعميل» (CON5-18M) → CON5-T1803 */
  message: async (id: string, to: "center" | "customer", text: string) => {
    if (!text.trim()) throw new ApiError(422, "تحقق من الحقول", { message: "اكتب الرسالة" });
    const c = findC(id);
    c.messages = [...c.messages, { author: "نوف القحطاني · لينكار", kind: "linkar", at: "14 أكتوبر 2026", text: `${to === "center" ? "إلى المركز" : "إلى العميل"}: ${text.trim()}` }];
    return delay({ toast: "أُرسلت الرسالة" }, 400);
  },
  /** «إخفاء التقييم» (CON5-18M إخفاء) → CON5-T1804 */
  hide: async (id: string, reason: string) => {
    const r = findR(id);
    Object.assign(r, { state: "hidden", status: { label: "مخفي", tone: "neutral", sub: `نوف القحطاني · ${reason}` }, heroSub: `مخفي · ${reason} · نوف القحطاني`, heroPill: undefined });
    return delay({ toast: "أُخفي التقييم وأُبلغ العميل" }, 400);
  },
  /** «إبقاء» → CON5-T1805 */
  keep: async (id: string) => {
    const r = findR(id);
    Object.assign(r, { state: "published", status: { label: "منشور", tone: "success", sub: "أُبقي بعد البلاغ" }, heroSub: "منشور · أُبقي بعد البلاغ", heroPill: undefined, title: `‏${r.id} · تقييم` });
    return delay({ toast: "أُبقي التقييم وأُغلق البلاغ" }, 400);
  },
  /** «اعتماد ونشر الرد» → CON5-T1807 */
  approveReply: async (id: string) => {
    const r = findR(id);
    if (!r.reply) throw new ApiError(409, "لا يوجد رد");
    r.reply.pending = false;
    Object.assign(r, { status: { ...r.status, sub: "ردّ المركز" }, heroSub: "منشور · ردّ المركز" });
    return delay({ toast: `اعتُمد رد ${r.center.split(" ")[0]} على ${r.id} ونُشر للعميل وفي صفحة الفرع` }, 400);
  },
  /** «إعادة للمركز» (CON5-18M 3114:1300) → CON5-T1808 */
  returnReply: async (id: string, v: { reason: string; note: string }) => {
    if (!v.note.trim()) throw new ApiError(422, "تحقق من الحقول", { note: "اكتب ملاحظة للمركز" });
    const r = findR(id);
    if (!r.reply) throw new ApiError(409, "لا يوجد رد");
    r.reply = undefined;
    Object.assign(r, { status: { ...r.status, sub: "أُعيد الرد للمركز" }, heroSub: "منشور · أُعيد الرد للمركز للتعديل" });
    return delay({ toast: `أُعيد الرد ل${r.center.split(" ")[0]} مع ملاحظة لينكار · يظهر في لوحته «يحتاج تعديل»` }, 400);
  },
};
