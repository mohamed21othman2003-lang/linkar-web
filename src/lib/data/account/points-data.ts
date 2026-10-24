import type { Localized } from "@/i18n/config";

// W2-65 · النقاط (749:8301) + W2-65-0 حالة فارغة (1071:268)

export const pointsPage = {
  title_ar: "نقاطي",
  title_en: "My points",
  description_ar: "اكسب نقاطاً مع كل حجز مكتمل وكل تقييم، واستخدمها عند الدفع.",
  description_en: "Earn points with every completed booking and every review, and use them at checkout.",
  balance_label_ar: "رصيدك الحالي",
  balance_label_en: "Your current balance",
  // {sar} = قيمة الرصيد بالريال
  worth_ar: "تساوي {sar} ر.س عند الدفع",
  worth_en: "Worth SAR {sar} at checkout",
  referral_title_ar: "ادعُ صديقاً واكسب 500 نقطة",
  referral_title_en: "Invite a friend and earn 500 points",
  referral_text_ar: "يحصل صديقك على خصم 30 ر.س على أول حجز بقيمة 200 ر.س أو أكثر، وتصلك 500 نقطة بعد اكتمال حجزه.",
  referral_text_en: "Your friend gets SAR 30 off their first booking of SAR 200 or more, and you get 500 points once their booking is completed.",
  referral_note_ar: "حتى 10 دعوات في الشهر · لا يُجمع خصم الدعوة مع كود خصم آخر.",
  referral_note_en: "Up to 10 invites a month · The invite discount can’t be combined with another promo code.",
  earn_title_ar: "كيف تكسب النقاط",
  earn_title_en: "How to earn points",
  rule_ar: "عند الدفع: كل 100 نقطة = 2 ر.س، ويمكن الدفع بالنقاط حتى 30% من قيمة الحجز. تنتهي النقاط بعد 12 شهراً من إضافتها، وتُستخدم الأقدم أولاً.",
  rule_en: "At checkout: every 100 points = SAR 2, and points can cover up to 30% of the booking. Points expire 12 months after they’re added, and the oldest are used first.",
  history_title_ar: "سجل النقاط",
  history_title_en: "Points history",
  empty_title_ar: "لا يوجد سجل نقاط بعد",
  empty_title_en: "No points history yet",
  empty_text_ar: "تحصل على نقطة لكل 1 ر.س عند اكتمال الخدمة، و100 نقطة مكافأة لأول حجز مكتمل.",
  empty_text_en: "You get 1 point for every SAR 1 when the service is completed, plus 100 bonus points for your first completed booking.",
  empty_cta_ar: "احجز أول خدمة",
  empty_cta_en: "Book your first service",
};

// المعادلة من قاعدة الاستخدام: كل 100 نقطة = 2 ر.س
export const POINTS_PER_SAR = 50;

export type PointsSummary = Localized<"expiry"> &
  Localized<"pending"> & {
    referral_code: string;
  };

export const pointsSummary: PointsSummary = {
  referral_code: "MOHD7Q",
  expiry_ar: "أقرب انتهاء: 256 نقطة في 14 يونيو 2027",
  expiry_en: "Next expiry: 256 points on 14 Jun 2027",
  pending_ar: "بانتظار الإضافة: 10,123 نقطة بعد اكتمال حجزيك الحاليين",
  pending_en: "Pending: 10,123 points after your 2 current bookings are completed",
};

export type EarnRule = Localized<"title"> & Localized<"text"> & { points: number };

// بترتيب الفيجما من بداية السطر
export const earnRules: EarnRule[] = [
  { points: 1, title_ar: "لكل 1 ر.س تدفعه", title_en: "For every SAR 1 you pay", text_ar: "تُضاف عند اكتمال الخدمة، لا عند الدفع.", text_en: "Added when the service is completed, not at payment." },
  { points: 100, title_ar: "أول حجز مكتمل", title_en: "First completed booking", text_ar: "مكافأة ترحيب لمرة واحدة.", text_en: "A one-time welcome bonus." },
  { points: 50, title_ar: "كل تقييم موثّق", title_en: "Every verified review", text_ar: "خلال 30 يوماً من اكتمال الحجز.", text_en: "Within 30 days of the booking being completed." },
  { points: 500, title_ar: "دعوة صديق", title_en: "Invite a friend", text_ar: "بعد اكتمال أول حجز لصديقك.", text_en: "Once your friend’s first booking is completed." },
];

export type PointsEntry = Localized<"operation"> & {
  id: string;
  date: string; // ISO
  points: number; // موجب = إضافة، سالب = استخدام
  balance: number;
};

export const pointsHistory: PointsEntry[] = [
  { id: "p8", date: "2026-10-11", operation_ar: "استخدام عند الدفع · BK-21452 · خصم 25 ر.س", operation_en: "Used at checkout · BK-21452 · SAR 25 off", points: -1250, balance: 1250 },
  { id: "p7", date: "2026-10-08", operation_ar: "حجز مكتمل · BK-21388 · مركز لمعة للتلميع", operation_en: "Completed booking · BK-21388 · Lamaa Polishing Center", points: 349, balance: 2500 },
  { id: "p6", date: "2026-09-29", operation_ar: "تقييم موثّق · BK-21302 · مغاسل بريق", operation_en: "Verified review · BK-21302 · Bareeq Car Wash", points: 50, balance: 2151 },
  { id: "p5", date: "2026-09-28", operation_ar: "حجز مكتمل · BK-21302 · مغاسل بريق", operation_en: "Completed booking · BK-21302 · Bareeq Car Wash", points: 45, balance: 2101 },
  { id: "p4", date: "2026-08-02", operation_ar: "دعوة صديق · اكتمل أول حجز لصديقك", operation_en: "Friend invite · your friend’s first booking was completed", points: 500, balance: 2056 },
  { id: "p3", date: "2026-06-15", operation_ar: "تقييم موثّق · BK-19520 · مركز النخبة للتظليل", operation_en: "Verified review · BK-19520 · Al Nukhba Tinting Center", points: 50, balance: 1556 },
  { id: "p2", date: "2026-06-14", operation_ar: "حجز مكتمل · BK-19520 · مركز النخبة للتظليل", operation_en: "Completed booking · BK-19520 · Al Nukhba Tinting Center", points: 1406, balance: 1506 },
  { id: "p1", date: "2026-06-14", operation_ar: "مكافأة أول حجز", operation_en: "First booking bonus", points: 100, balance: 100 },
];

// فلتر الفترة (P-18 · Popup «آخر 6 أشهر») — months: عدد الشهور، 0 = هذه السنة، null = كل الفترات
export type PeriodOption = Localized<"label"> & { key: string; months: number | null };

export const periodOptions: PeriodOption[] = [
  { key: "3m", months: 3, label_ar: "آخر 3 أشهر", label_en: "Last 3 months" },
  { key: "6m", months: 6, label_ar: "آخر 6 أشهر", label_en: "Last 6 months" },
  { key: "year", months: 0, label_ar: "هذه السنة", label_en: "This year" },
  { key: "all", months: null, label_ar: "كل الفترات", label_en: "All time" },
];

// P-08c · مشاركة كود الدعوة
export const shareInvite = {
  title_ar: "مشاركة كود الدعوة",
  title_en: "Share invite code",
  text_ar: "يحصل صديقك على خصم 30 ر.س على أول حجز بقيمة 200 ر.س أو أكثر، وتصلك 500 نقطة بعد اكتمال حجزه.",
  text_en: "Your friend gets SAR 30 off their first booking of SAR 200 or more, and you get 500 points once their booking is completed.",
  link: "linkarksa.com/r/MOHD7Q",
  // رسالة المشاركة اللي بتتبعت مع الرابط — placeholder: مش موجودة في الفيجما
  message_ar: "ادعُ صديقاً واكسب 500 نقطة",
  message_en: "Invite a friend and earn 500 points",
  options: [
    { key: "copy", label_ar: "نسخ الرابط", label_en: "Copy link" },
    { key: "whatsapp", label_ar: "واتساب", label_en: "WhatsApp" },
    { key: "sms", label_ar: "رسالة نصية", label_en: "Text message" },
    { key: "email", label_ar: "البريد", label_en: "Email" },
  ],
  // P-10a
  toast_copied_ar: "تم نسخ الرابط",
  toast_copied_en: "Link copied",
};
