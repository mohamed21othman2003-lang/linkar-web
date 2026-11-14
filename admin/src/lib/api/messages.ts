// المرحلة 2 · الرسائل CON5-19 (Figma «v5 · 19 · الرسائل» 3114:1327): ما يصل من الموقع والتطبيق —
// «تواصل معنا» (MSG-…) · مقترحات العملاء (SG-…) · طلبات برامج الشركات (CORP-…).
// النصوص حرفياً من الإطارات (الأدراج CON5-19D · النوافذ CON5-19M · الرسائل CON5-T1901…1903).
import { ApiError, delay } from "./errors";

export type MsgTab = "contact" | "suggestions" | "corp";
export type MsgStatus = "new" | "answered" | "review" | "contacted";

export const MSG_STATUS_LABEL: Record<MsgStatus, string> = { new: "جديد", answered: "تم الرد", review: "قيد الدراسة", contacted: "تم التواصل" };

export interface ChatLine {
  at: string;
  from: string;
  text: string;
  /** رد من فريق لينكار (فقاعة خضراء) */
  staff?: boolean;
}

interface Base {
  id: string;
  tab: MsgTab;
  status: MsgStatus;
  /** تاريخ العرض «14 أكتوبر 2026» */
  date: string;
  /** للترتيب */
  sort: number;
  /** السطر تحت الحالة في الجدول (منذ 3 ساعات · نوف القحطاني · خلال ساعتين …) */
  statusNote?: string;
  chat: ChatLine[];
}

export interface ContactMessage extends Base {
  tab: "contact";
  name: string;
  phone: string;
  type: string;
  subject: string;
  /** السطر تحت الموضوع (BK-21452 · جونسون) */
  subjectNote?: string;
  booking?: { id: string; label: string };
}

export interface Suggestion extends Base {
  tab: "suggestions";
  name: string;
  text: string;
}

export interface CorpRequest extends Base {
  tab: "corp";
  company: string;
  contact: string;
  phone: string;
  email?: string;
  cars: number;
  carsLabel: string;
  cities: string[];
  need: string;
  needQuote: string;
  /** يظهر في الشارة «13 أكتوبر 2026» تحت الحالة */
  nominated?: { name: string; services: string }[];
  /** السطر الفرعي للدرج «من صفحة «برامج الشركات» · 13 أكتوبر 2026» */
  serviceHint: string;
}

export type Message = ContactMessage | Suggestion | CorpRequest;

/** «قالب الرد» (CON5-DD 3114:67432) — نصوص القوالب من نوافذ CON5-19M */
export const REPLY_TEMPLATES: { value: string; label: string; text: string }[] = [
  { value: "billing", label: "الدفع والفواتير", text: "تصدر لينكار الفاتورة الضريبية لكل حجز. أصدرنا فاتورتك باسم شركتك وأرسلناها على بريدك." },
  { value: "service", label: "استفسار عن خدمة", text: "لا يوجد حالياً مركز تظليل معتمد في الخبر. أقرب مركز: مركز النخبة للتظليل في الدمام. سنبلغك عند انضمام مركز في الخبر." },
  { value: "account", label: "الحساب والدخول", text: "تأكدنا من وصول رموز التحقق لرقمك الآن. جرّبي مرة أخرى، وإن استمرت المشكلة ردّي على هذه الرسالة." },
  { value: "booking", label: "الحجز والقسيمة", text: "افتح الحجز من «حجوزاتي» واضغط «مشاركة القسيمة»، وتصل للسائق برسالة نصية." },
  { value: "partners", label: "الشراكات", text: "يسعدنا انضمامك. قدّمي الطلب من «انضم كمقدّم خدمة» مع المستندات، ونراجعه خلال يومي عمل." },
  { value: "thanks", label: "شكر على اقتراح", text: "شكراً لاقتراحك، أضفناه لخطة التذكيرات القادمة وسنبلغك عند إطلاقها." },
];

/** «إلى» في «تحويل لموظف» (CON5-DD 3114:67448) */
export const STAFF = [
  "نوف القحطاني · مديرة النظام",
  "هند المطيري · الحجوزات",
  "عبدالرحمن ح. · المالية",
  "لينا الحربي · الجودة",
  "ماجد الفيفي · الجودة",
  "سلطان العنزي · التسعير والكتالوج",
  "ريم الشهري · خدمة العملاء",
  "عبدالعزيز المالكي · الشراكات والفوترة",
].map((v) => ({ value: v, label: v }));

/** الموظف المقترح للتحويل حسب نوع الرسالة (CON5-19M · تحويل لموظف) */
const TRANSFER_DEFAULT: Record<string, string> = { "الدفع والفواتير": "عبدالرحمن ح. · المالية", الشراكات: "عبدالعزيز المالكي · الشراكات والفوترة" };
export const transferDefault = (m: ContactMessage) => TRANSFER_DEFAULT[m.type] ?? "ريم الشهري · خدمة العملاء";
export const templateFor = (m: ContactMessage) => REPLY_TEMPLATES.find((t) => t.label === m.type) ?? REPLY_TEMPLATES[1];

export const CONTACT_TYPES = ["الدفع والفواتير", "استفسار عن خدمة", "الحساب والدخول", "الحجز والقسيمة", "الشراكات"];
export const CITIES = ["جدة", "الرياض", "الدمام", "مكة المكرمة", "الخبر"];
/** «الحالة» في رد المقترح (CON5-19M · رد · SG-0033) */
export const SUGGESTION_STATUSES = [
  { value: "review", label: "قيد الدراسة" },
  { value: "answered", label: "تم الرد" },
] as const;

/** ردود المقترحات الافتراضية (CON5-19M · رد · SG-0033 / SG-0032) */
const SUGGESTION_DRAFT: Record<string, string> = {
  "SG-0032": "الطائف ضمن خطة التوسّع. سنبلغك عند انضمام أول مركز معتمد فيها.",
};
export const suggestionDraft = (id: string) => SUGGESTION_DRAFT[id] ?? REPLY_TEMPLATES[5].text;

/** مراكز الترشيح (CON5-19M · ترشيح مراكز · CORP-0012) */
export const NOMINEES = [
  { id: "carspa", name: "كار سبا", sub: "الرياض · الغسيل · التلميع · ★ 4.6", services: "الغسيل · التلميع" },
  { id: "safwa", name: "مركز الصفوة للعناية", sub: "جدة · الغسيل · نانو سيراميك · ★ 4.7", services: "الغسيل · نانو سيراميك" },
  { id: "lk-jn-001", name: "جونسون Johnson", sub: "جدة · نانو سيراميك · ★ 4.9", services: "نانو سيراميك" },
  { id: "lk-xp-001", name: "XPEL السعودية", sub: "الرياض · نانو سيراميك · ★ 4.8", services: "نانو سيراميك" },
];
export const NOMINEE_DEFAULT = ["carspa", "safwa", "lk-jn-001"];

const AGO: Record<string, string> = { "MSG-0418": "منذ 3 ساعات", "MSG-0417": "منذ يوم", "MSG-0416": "منذ يوم" };

let contact: ContactMessage[] = [
  {
    id: "MSG-0418",
    tab: "contact",
    status: "new",
    date: "14 أكتوبر 2026",
    sort: 418,
    name: "محمد سالم",
    phone: "055 123 4567",
    type: "الدفع والفواتير",
    subject: "«أحتاج فاتورة ضريبية باسم شركتي للحجز BK-21452»",
    subjectNote: "BK-21452 · جونسون",
    booking: { id: "BK-21452", label: "BK-21452 · جونسون · فرع الزهراء" },
    chat: [{ at: "14 أكتوبر 2026 · 10:40 ص", from: "محمد سالم", text: "أحتاج فاتورة ضريبية باسم شركتي للحجز BK-21452. اسم الشركة: مؤسسة سالم للتجارة، الرقم الضريبي 310551234500003." }],
  },
  {
    id: "MSG-0417",
    tab: "contact",
    status: "new",
    date: "13 أكتوبر 2026",
    sort: 417,
    name: "خالد العنزي",
    phone: "050 822 6109",
    type: "استفسار عن خدمة",
    subject: "«هل تتوفر خدمة التظليل في الخبر؟»",
    chat: [{ at: "13 أكتوبر 2026 · 8:15 م", from: "خالد العنزي", text: "هل تتوفر خدمة التظليل في الخبر؟" }],
  },
  {
    id: "MSG-0416",
    tab: "contact",
    status: "new",
    date: "13 أكتوبر 2026",
    sort: 416,
    name: "منيرة س.",
    phone: "053 117 4480",
    type: "الحساب والدخول",
    subject: "«لا يصلني رمز التحقق على جوالي»",
    chat: [{ at: "13 أكتوبر 2026 · 2:02 م", from: "منيرة س.", text: "لا يصلني رمز التحقق على جوالي منذ أمس." }],
  },
  {
    id: "MSG-0415",
    tab: "contact",
    status: "answered",
    statusNote: "نوف القحطاني · خلال ساعتين",
    date: "12 أكتوبر 2026",
    sort: 415,
    name: "عبدالرحمن ك.",
    phone: "054 993 0021",
    type: "الحجز والقسيمة",
    subject: "«كيف أشارك القسيمة مع السائق؟»",
    subjectNote: "BK-21437",
    booking: { id: "BK-21437", label: "BK-21437" },
    chat: [
      { at: "12 أكتوبر 2026 · 9:00 ص", from: "عبدالرحمن ك.", text: "كيف أشارك القسيمة مع السائق الذي سيسلّم السيارة؟" },
      { at: "12 أكتوبر 2026 · 11:02 ص", from: "نوف القحطاني · لينكار", text: "افتح الحجز من «حجوزاتي» واضغط «مشاركة القسيمة»، وتصل للسائق برسالة نصية.", staff: true },
    ],
  },
  {
    id: "MSG-0413",
    tab: "contact",
    status: "answered",
    statusNote: "أُرسل رابط نموذج الانضمام",
    date: "11 أكتوبر 2026",
    sort: 413,
    name: "مها د.",
    phone: "056 200 3394",
    type: "الشراكات",
    subject: "«أملك مغسلة في مكة وأرغب بالانضمام»",
    chat: [
      { at: "11 أكتوبر 2026 · 4:30 م", from: "مها د.", text: "أملك مغسلة في مكة وأرغب بالانضمام إلى لينكار." },
      { at: "11 أكتوبر 2026 · 6:10 م", from: "عبدالعزيز المالكي · لينكار", text: "يسعدنا انضمامك. قدّمي الطلب من «انضم كمقدّم خدمة» مع المستندات، ونراجعه خلال يومي عمل.", staff: true },
    ],
  },
  {
    id: "MSG-0412",
    tab: "contact",
    status: "answered",
    statusNote: "وضّحنا: تعيده بوابة الدفع تلقائياً",
    date: "10 أكتوبر 2026",
    sort: 412,
    name: "فيصل ع.",
    phone: "055 761 8803",
    type: "الدفع والفواتير",
    subject: "«خُصم المبلغ مرتين على بطاقتي»",
    subjectNote: "BK-21420 · نانو شيلد",
    booking: { id: "BK-21420", label: "BK-21420 · نانو شيلد" },
    chat: [
      { at: "10 أكتوبر 2026 · 1:12 م", from: "فيصل ع.", text: "خُصم المبلغ مرتين على بطاقتي للحجز BK-21420." },
      { at: "10 أكتوبر 2026 · 3:40 م", from: "نوف القحطاني · لينكار", text: "الحجز مدفوع مرة واحدة. العملية الثانية حجز مؤقت من البنك تعيده بوابة الدفع تلقائياً خلال 3 – 5 أيام عمل.", staff: true },
    ],
  },
  // بقية رسائل أكتوبر (الصفحتان 2 و 3 — «عرض 1 – 6 من 14 هذا الشهر»)
  ...(
    [
      ["MSG-0411", "9 أكتوبر 2026", "سلمان ر.", "055 410 7731", "الحجز والقسيمة", "«هل أستطيع تغيير موعد الحجز؟»", "نعم، من «حجوزاتي» قبل الموعد بيوم."],
      ["MSG-0410", "8 أكتوبر 2026", "أمل ف.", "050 993 1182", "استفسار عن خدمة", "«ما الفرق بين النانو والـPPF؟»", "أرسلنا مقارنة الخدمتين."],
      ["MSG-0409", "7 أكتوبر 2026", "تركي م.", "054 220 6610", "الدفع والفواتير", "«هل يتوفر الدفع بالتقسيط؟»", "متاح عبر تابي وتمارا عند الدفع."],
      ["MSG-0408", "6 أكتوبر 2026", "ريم ع.", "056 781 4402", "الحساب والدخول", "«أرغب بتغيير رقم الجوال في حسابي»", "غُيّر الرقم بعد التحقق."],
      ["MSG-0407", "5 أكتوبر 2026", "ماجد ب.", "053 640 2219", "الشراكات", "«نملك سلسلة مغاسل في الرياض»", "أُرسل رابط نموذج الانضمام"],
      ["MSG-0406", "4 أكتوبر 2026", "هيفاء ج.", "055 302 8817", "الحجز والقسيمة", "«لم تصلني القسيمة بعد الدفع»", "أُعيد إرسال القسيمة."],
      ["MSG-0405", "2 أكتوبر 2026", "بندر ش.", "050 117 3390", "استفسار عن خدمة", "«هل تشمل الخدمة تنظيف المحرك؟»", "وضّحنا تفاصيل الباقة."],
      ["MSG-0404", "1 أكتوبر 2026", "دانة ك.", "054 880 1264", "الدفع والفواتير", "«أحتاج نسخة من الفاتورة»", "أُرسلت الفاتورة على البريد."],
    ] as const
  ).map(
    ([id, date, name, phone, type, subject, note]): ContactMessage => ({
      id,
      tab: "contact",
      status: "answered",
      statusNote: note,
      date,
      sort: Number(id.slice(4)),
      name,
      phone,
      type,
      subject,
      chat: [
        { at: `${date} · 10:00 ص`, from: name, text: subject.replace(/[«»]/g, "") },
        { at: `${date} · 1:00 م`, from: "فريق لينكار", text: note, staff: true },
      ],
    }),
  ),
];

let suggestions: Suggestion[] = [
  { id: "SG-0033", tab: "suggestions", status: "new", date: "12 أكتوبر 2026", sort: 33, name: "لمى ح.", text: "«تذكير بموعد إعادة تطبيق النانو بعد سنة من الخدمة»", chat: [{ at: "12 أكتوبر 2026", from: "لمى ح.", text: "تذكير بموعد إعادة تطبيق النانو بعد سنة من الخدمة." }] },
  { id: "SG-0032", tab: "suggestions", status: "review", statusNote: "مرتبط بخطة التوسّع", date: "8 أكتوبر 2026", sort: 32, name: "عبدالله ن.", text: "«إضافة مدينة الطائف»", chat: [{ at: "8 أكتوبر 2026", from: "عبدالله ن.", text: "إضافة مدينة الطائف." }] },
  {
    id: "SG-0031",
    tab: "suggestions",
    status: "answered",
    statusNote: "أُضيف لخطة الخدمات القادمة",
    date: "5 أكتوبر 2026",
    sort: 31,
    name: "محمد سالم",
    text: "«إضافة خدمة الغسيل في موقع العميل»",
    chat: [
      { at: "5 أكتوبر 2026", from: "محمد سالم", text: "إضافة خدمة الغسيل في موقع العميل." },
      { at: "6 أكتوبر 2026", from: "فريق لينكار", text: "شكراً لك — أضفنا اقتراحك إلى خطة الخدمات القادمة، وسنبلغك عند إطلاقها.", staff: true },
    ],
  },
  {
    id: "SG-0030",
    tab: "suggestions",
    status: "answered",
    date: "3 أكتوبر 2026",
    sort: 30,
    name: "نوال ق.",
    text: "«فلتر للمراكز التي تستقبل السيارات الفاخرة»",
    chat: [
      { at: "3 أكتوبر 2026", from: "نوال ق.", text: "فلتر للمراكز التي تستقبل السيارات الفاخرة." },
      { at: "4 أكتوبر 2026", from: "فريق لينكار", text: "شكراً لك، الفلتر ضمن تحديثات البحث القادمة.", staff: true },
    ],
  },
];

let corp: CorpRequest[] = [
  {
    id: "CORP-0012",
    tab: "corp",
    status: "new",
    statusNote: "13 أكتوبر 2026",
    date: "13 أكتوبر 2026",
    sort: 12,
    company: "شركة النقل الذكي",
    contact: "فهد الدوسري",
    phone: "050 640 1177",
    email: "fahad@smarttransport.sa",
    cars: 40,
    carsLabel: "40 تقريباً",
    cities: ["الرياض", "جدة"],
    need: "غسيل شهري للأسطول ونانو للسيارات الجديدة",
    needQuote: "«غسيل شهري للأسطول، ونانو سيراميك للسيارات الجديدة عند استلامها.»",
    serviceHint: "مراكز معتمدة تقدّم الغسيل ونانو سيراميك في الرياض وجدة",
    chat: [],
  },
  {
    id: "CORP-0011",
    tab: "corp",
    status: "contacted",
    statusNote: "رُشّحت 3 مراكز · 7 أكتوبر 2026",
    date: "7 أكتوبر 2026",
    sort: 11,
    company: "مجموعة الفيصلية",
    contact: "نورة الفيصل",
    phone: "055 302 9940",
    cars: 25,
    carsLabel: "25",
    cities: ["الرياض"],
    need: "تظليل وحماية للسيارات التنفيذية",
    needQuote: "«تظليل وحماية للسيارات التنفيذية.»",
    serviceHint: "مراكز معتمدة تقدّم التظليل وحماية PPF في الرياض",
    nominated: [
      { name: "لومار LLumar", services: "تظليل · حماية PPF" },
      { name: "XPEL السعودية", services: "حماية PPF" },
      { name: "مركز درع للحماية", services: "حماية PPF" },
    ],
    chat: [],
  },
];

export const PAGE_SIZE = 6;

export interface MessageQuery {
  tab: MsgTab;
  status?: string;
  type?: string;
  city?: string;
  q?: string;
  page?: number;
}

const norm = (s: string) => s.replace(/\s/g, "").toLowerCase();

function counts() {
  return {
    contact: contact.filter((m) => m.status === "new").length,
    suggestions: suggestions.filter((m) => m.status === "new").length,
    corp: corp.filter((m) => m.status === "new").length,
  };
}

export const messagesApi = {
  kpis: async () =>
    delay(
      {
        corp: { value: corp.length, hint: `${corp.filter((c) => c.status === "new").length} جديد · ${corp.reduce((s, c) => s + c.cars, 0)} سيارة إجمالاً` },
        suggestions: { value: suggestions.length, hint: `${suggestions.filter((s) => s.status === "new").length} جديد · ${suggestions.filter((s) => s.status === "review").length} قيد الدراسة` },
        responseTime: { value: "5 ساعات", hint: "رسائل أكتوبر" },
        newMessages: { value: contact.filter((m) => m.status === "new").length, hint: "الرد خلال يوم عمل" },
      },
      200,
    ),

  list: async (q: MessageQuery) => {
    const s = q.q ? norm(q.q) : "";
    let items: Message[] = q.tab === "contact" ? contact : q.tab === "suggestions" ? suggestions : corp;
    if (q.status && q.status !== "all") items = items.filter((m) => m.status === q.status);
    if (q.tab === "contact" && q.type && q.type !== "all") items = items.filter((m) => (m as ContactMessage).type === q.type);
    if (q.tab === "corp" && q.city && q.city !== "all") items = items.filter((m) => (m as CorpRequest).cities.includes(q.city!));
    if (s)
      items = items.filter((m) => {
        const hay = m.tab === "contact" ? [m.id, m.name, m.phone, m.subject, m.booking?.id ?? ""] : m.tab === "suggestions" ? [m.id, m.name, m.text] : [m.id, m.company, m.contact];
        return hay.some((h) => norm(h).includes(s));
      });
    items = [...items].sort((a, b) => b.sort - a.sort);
    const total = items.length;
    const page = Math.max(1, q.page ?? 1);
    const paged = q.tab === "contact" ? items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : items;
    return delay({ items: paged.map((m) => ({ ...m, statusNote: m.status === "new" && AGO[m.id] ? AGO[m.id] : m.statusNote })), total, counts: counts() });
  },

  get: async (id: string) => {
    const m = [...contact, ...suggestions, ...corp].find((x) => x.id === id);
    if (!m) throw new ApiError(404, "الرسالة غير موجودة");
    return delay({ ...m } as Message, 150);
  },

  /** CON5-19M · رد → CON5-T1901 «أُرسل الرد للمرسل» */
  reply: async (id: string, v: { text: string; status?: "review" | "answered" }) => {
    if (!v.text.trim()) throw new ApiError(422, "تحقق من الحقول", { text: "اكتب الرد" });
    const line: ChatLine = { at: "14 أكتوبر 2026 · الآن", from: "نوف القحطاني · لينكار", text: v.text.trim(), staff: true };
    const c = contact.find((m) => m.id === id);
    if (c) contact = contact.map((m) => (m.id === id ? { ...m, status: "answered", statusNote: "نوف القحطاني · الآن", chat: [...m.chat, line] } : m));
    const sg = suggestions.find((m) => m.id === id);
    if (sg) suggestions = suggestions.map((m) => (m.id === id ? { ...m, status: v.status ?? "answered", statusNote: undefined, chat: [...m.chat, line] } : m));
    if (!c && !sg) throw new ApiError(404, "الرسالة غير موجودة");
    return delay({ ok: true, toast: "أُرسل الرد للمرسل" }, 500);
  },

  /** CON5-19M · تحويل لموظف → CON5-T1902 «حُوّلت الرسالة للموظف» */
  transfer: async (id: string, v: { to: string; note: string }) => {
    if (!v.to) throw new ApiError(422, "تحقق من الحقول", { to: "اختر الموظف" });
    contact = contact.map((m) => (m.id === id ? { ...m, statusNote: `حُوّلت إلى ${v.to.split(" · ")[0]}` } : m));
    return delay({ ok: true, toast: "حُوّلت الرسالة للموظف" }, 500);
  },

  /** CON5-19M · ترشيح مراكز → CON5-T1903 «أُرسل طلب الشركة للمراكز المرشّحة» */
  nominate: async (id: string, v: { centers: string[]; message: string }) => {
    if (!v.centers.length) throw new ApiError(422, "تحقق من الحقول", { centers: "اختر مركزاً واحداً على الأقل" });
    const picked = NOMINEES.filter((n) => v.centers.includes(n.id));
    corp = corp.map((c) => (c.id === id ? { ...c, status: "contacted", statusNote: `رُشّحت ${picked.length} مراكز · 14 أكتوبر 2026`, nominated: picked.map((p) => ({ name: p.name, services: p.services })) } : c));
    return delay({ ok: true, toast: "أُرسل طلب الشركة للمراكز المرشّحة" }, 500);
  },

  newCount: async () => delay(counts().contact, 100),
};
