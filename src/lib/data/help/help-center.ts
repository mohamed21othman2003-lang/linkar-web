import { routes } from "@/lib/routes";
import type { UiGlyph } from "@/components/icons/Icon";
import type { FaqTabKey } from "./faq";

// W2-97 · مركز المساعدة (761:13678) + W2-97b · مقال مساعدة (761:14200)
// العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
//
// الفيجما فيها مقال واحد كامل بس: «كيف أستخدم قسيمتي عند الزيارة؟» (use-voucher).
// باقي المقالات عناوينها من W2-97 (والقائمة الجانبية في W2-97b) وبتفتح نفس قالب المقال،
// والمحتوى بتاعها **مؤقت** (placeholder: true):
//   - summary = إجابة نفس السؤال (أو أقرب سؤال له) من W2-98 الأسئلة الشائعة، لو موجود — المصدر مكتوب جنب كل مقال.
//   - body = غير موجود → الصفحة بتعرض «محتوى المقال قيد الإعداد».

export type HelpTopicKey = "booking" | "voucher" | "points" | "account" | "warranty" | "business";

export type HelpTopic = {
  key: HelpTopicKey;
  icon: UiGlyph;
  title_ar: string;
  title_en: string;
  // «كل المقالات»: مفيش صفحة موضوع في الفيجما → أقرب صفحة حقيقية (تبويب الأسئلة الشائعة للموضوع)
  faqTab?: FaqTabKey;
  allHref: string;
  articles: string[]; // slugs — الثلاثة المعروضة في كارت الموضوع
};

export type HelpStep = { title_ar: string; title_en: string; body_ar: string; body_en: string };

export type HelpArticle = {
  slug: string;
  topic: HelpTopicKey;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  placeholder?: boolean;
  intro_ar?: string;
  intro_en?: string;
  steps?: HelpStep[];
  note_ar?: string;
  note_en?: string;
  related: string[];
};

export const helpPage = {
  title_ar: "مركز المساعدة",
  title_en: "Help center",
  description_ar: "إجابات سريعة عن الحجز والدفع والقسيمة والنقاط والهدايا.",
  description_en: "Quick answers about booking, payment, vouchers, points and gifts.",
  search_placeholder_ar: "ابحث في مركز المساعدة… مثال: القسيمة",
  search_placeholder_en: "Search the help center… e.g. voucher",
  related_title_ar: "مقالات ذات صلة",
  related_title_en: "Related articles",
  // P-10h
  feedback_toast_ar: "شكراً، سيساعدنا رأيك في تحسين المقال",
  feedback_toast_en: "Thanks — your feedback helps us improve this article",
};

// شريط «لم تجد إجابتك؟» (W2-97 · W2-97b · W2-98)
export const contactBand = {
  title_ar: "لم تجد إجابتك؟",
  title_en: "Didn't find your answer?",
  body_ar: "لمشكلة في حجز افتح شكوى من حسابك، ولغير ذلك راسلنا ونرد خلال يوم عمل.",
  body_en: "For a problem with a booking, open a complaint from your account; for anything else, message us and we'll reply within one business day.",
  complaint_ar: "افتح شكوى",
  complaint_en: "Open a complaint",
  complaint_href: routes.complaintNew,
  contact_ar: "تواصل معنا",
  contact_en: "Contact us",
  contact_href: routes.contact,
};

// ترتيب القراءة: الصف الأول ثم الثاني
export const helpTopics: HelpTopic[] = [
  {
    key: "booking",
    icon: "calendar",
    title_ar: "الحجز والدفع",
    title_en: "Booking and payment",
    faqTab: "booking",
    allHref: routes.faq("booking"),
    articles: ["book-multiple-services", "payment-methods", "price-by-car"],
  },
  {
    key: "voucher",
    icon: "clock",
    title_ar: "القسيمة والزيارة",
    title_en: "Voucher and visit",
    faqTab: "voucher",
    allHref: routes.faq("voucher"),
    articles: ["use-voucher", "voucher-validity", "share-voucher"],
  },
  {
    key: "points",
    icon: "gift",
    title_ar: "النقاط والهدايا",
    title_en: "Points and gifts",
    faqTab: "points",
    allHref: routes.faq("points"),
    articles: ["earn-points", "dealer-gift", "points-expiry"],
  },
  {
    key: "account",
    icon: "user",
    title_ar: "الحساب والسيارات",
    title_en: "Account and cars",
    faqTab: "account",
    allHref: routes.faq("account"),
    articles: ["change-phone", "manage-cars", "delete-account"],
  },
  {
    key: "warranty",
    icon: "alert",
    title_ar: "الضمان والشكاوى",
    title_en: "Warranty and complaints",
    faqTab: "warranty",
    allHref: routes.faq("warranty"),
    articles: ["when-to-complain", "provider-warranty", "track-complaint"],
  },
  {
    key: "business",
    icon: "package",
    title_ar: "لمقدّمي الخدمة والوكالات",
    title_en: "For providers and dealerships",
    // مفيش تبويب لهم في الأسئلة الشائعة → صفحة لينكار لمقدّمي الخدمة
    allHref: routes.forProviders,
    articles: ["join-as-provider", "dealer-gift-program", "payouts"],
  },
];

const TBD = { placeholder: true as const };

export const helpArticles: HelpArticle[] = [
  // ---------- W2-97b — المقال الوحيد الكامل في الفيجما ----------
  {
    slug: "use-voucher",
    topic: "voucher",
    title_ar: "كيف أستخدم قسيمتي عند الزيارة؟",
    title_en: "How do I use my voucher at the visit?",
    summary_ar: "تصلك قسيمة QR بعد الدفع مباشرة، صالحة 14 يوماً، وتعرضها عند زيارتك للفرع الذي اخترته.",
    summary_en: "You get a QR voucher right after payment, valid for 14 days, and you show it when you visit the branch you chose.",
    intro_ar: "القسيمة إثبات حجزك المدفوع، ولا تحتاج أي دفع إضافي عند الزيارة.",
    intro_en: "The voucher is proof of your paid booking — you don't need to pay anything extra at the visit.",
    steps: [
      {
        title_ar: "افتح القسيمة",
        title_en: "Open the voucher",
        body_ar: "من «حسابي ← حجوزاتي» اختر الحجز، أو من رابط القسيمة الذي وصلك برسالة.",
        body_en: "From “My account → My bookings” pick the booking, or use the voucher link you received by SMS.",
      },
      {
        title_ar: "توجّه إلى الفرع",
        title_en: "Head to the branch",
        body_ar: "الفرع الذي اخترته عند الحجز — زر «الاتجاهات» في صفحة الحجز.",
        body_en: "The branch you chose when booking — use the “Directions” button on the booking page.",
      },
      {
        title_ar: "اعرض رمز QR",
        title_en: "Show the QR code",
        body_ar: "يمسح الفرع الرمز ويستلم سيارتك — لا تحتاج أي دفع إضافي.",
        body_en: "The branch scans the code and receives your car — no extra payment needed.",
      },
      {
        title_ar: "تابع حالة سيارتك",
        title_en: "Follow your car's status",
        body_ar: "تتغيّر الحالة إلى «في الخدمة» ثم «مكتمل»، وتصلك رسالة عند كل خطوة.",
        body_en: "The status changes to “In service” and then “Completed”, and you get a message at every step.",
      },
    ],
    note_ar: "القسيمة صالحة 14 يوماً من الدفع، ويمكنك مشاركتها مع من يسلّم السيارة.",
    note_en: "The voucher is valid for 14 days from payment, and you can share it with whoever drops off the car.",
    related: ["voucher-validity", "share-voucher", "complaint-on-booking", "lost-voucher"],
  },

  // ---------- مقالات مؤقتة (عناوين من الفيجما، المحتوى بانتظار الكتابة) ----------
  // الحجز والدفع
  {
    ...TBD,
    slug: "book-multiple-services",
    topic: "booking",
    title_ar: "كيف أحجز أكثر من خدمة في زيارة واحدة؟",
    title_en: "How do I book more than one service in a single visit?",
    // W2-98 · «هل يمكنني حجز أكثر من خدمة في زيارة واحدة؟»
    summary_ar: "نعم. أضف أكثر من خدمة من نفس مقدّم الخدمة، فتُنفَّذ معاً في زيارة واحدة وبدفعة واحدة.",
    summary_en: "Yes. Add more than one service from the same provider, and they're done together in one visit with one payment.",
    related: ["payment-methods", "price-by-car", "use-voucher"],
  },
  {
    ...TBD,
    slug: "payment-methods",
    topic: "booking",
    title_ar: "ما وسائل الدفع المتاحة؟",
    title_en: "Which payment methods are available?",
    // W2-98 · نفس السؤال
    summary_ar: "مدى، Apple Pay، STC Pay، والبطاقات الائتمانية Visa وMastercard. الدفع إلكتروني فقط.",
    summary_en: "mada, Apple Pay, STC Pay, and Visa and Mastercard credit cards. Payment is online only.",
    related: ["book-multiple-services", "price-by-car", "use-voucher"],
  },
  {
    ...TBD,
    slug: "price-by-car",
    topic: "booking",
    title_ar: "لماذا يختلف السعر حسب سيارتي؟",
    title_en: "Why does the price depend on my car?",
    // W2-98 · نفس السؤال
    summary_ar: "لأن أسعار التظليل والنانو سيراميك والتلميع تختلف حسب حجم السيارة؛ نحدد الحجم تلقائياً من الموديل، وتظهر لك الأسعار لسيارتك.",
    summary_en: "Because tinting, nano ceramic and polishing prices vary with the car's size; we detect the size from the model automatically and show you the prices for your car.",
    related: ["book-multiple-services", "payment-methods", "manage-cars"],
  },
  // القسيمة والزيارة
  {
    ...TBD,
    slug: "voucher-validity",
    topic: "voucher",
    title_ar: "كم مدة صلاحية القسيمة؟",
    title_en: "How long is the voucher valid?",
    // W2-98-t2 · نفس السؤال
    summary_ar: "14 يوماً من تاريخ الدفع، ويظهر تاريخ انتهائها في «حجوزاتي» وفي القسيمة نفسها.",
    summary_en: "14 days from the payment date; the expiry date shows in “My bookings” and on the voucher itself.",
    related: ["use-voucher", "share-voucher", "lost-voucher"],
  },
  {
    ...TBD,
    slug: "share-voucher",
    topic: "voucher",
    title_ar: "كيف أشارك القسيمة مع من يسلّم السيارة؟",
    title_en: "How do I share the voucher with whoever drops off the car?",
    // W2-98-t2 · «هل يمكنني مشاركة القسيمة مع شخص آخر؟»
    summary_ar: "نعم، من «مشاركة» في صفحة القسيمة. من يحمل الرابط يستطيع عرضها واستخدامها في الفرع.",
    summary_en: "Yes, from “Share” on the voucher page. Anyone with the link can show it and use it at the branch.",
    related: ["use-voucher", "voucher-validity", "lost-voucher"],
  },
  {
    ...TBD,
    slug: "lost-voucher",
    topic: "voucher",
    title_ar: "ماذا أفعل إذا فقدت رسالة القسيمة؟",
    title_en: "What if I lose the voucher message?",
    // W2-98-t2 · «ماذا أفعل إذا فقدت القسيمة؟»
    summary_ar: "تجدها دائماً في «حجوزاتي»، كما تصلك نسخة منها برسالة نصية.",
    summary_en: "You can always find it in “My bookings”, and a copy is also sent to you by SMS.",
    related: ["use-voucher", "voucher-validity", "share-voucher"],
  },
  // النقاط والهدايا
  {
    ...TBD,
    slug: "earn-points",
    topic: "points",
    title_ar: "كيف أكسب النقاط وأستخدمها؟",
    title_en: "How do I earn and use points?",
    // W2-98-t3 · «كيف أكسب النقاط؟»
    summary_ar: "نقطة لكل 1 ر.س تدفعه عند اكتمال الخدمة، و50 نقطة لكل تقييم موثّق، و100 نقطة لأول حجز مكتمل، و500 نقطة لكل صديق يكمل أول حجز بدعوتك.",
    summary_en: "One point for every SAR 1 you pay when the service is completed, 50 points per verified review, 100 points for your first completed booking, and 500 points for every friend who completes a first booking with your invite.",
    related: ["points-expiry", "dealer-gift", "payment-methods"],
  },
  {
    ...TBD,
    slug: "dealer-gift",
    topic: "points",
    title_ar: "كيف أستخدم هدية الوكالة؟",
    title_en: "How do I use a dealership gift?",
    // W2-98-t3 · نفس السؤال
    summary_ar: "افتح رابط الرسالة أو «الهدايا» في حسابك، وتحقّق من رقم جوالك، ثم اختر مقدّم الخدمة والفرع؛ فيتأكد الحجز وتصلك القسيمة.",
    summary_en: "Open the link in the message or “Gifts” in your account, verify your mobile number, then choose the provider and branch; the booking is confirmed and your voucher arrives.",
    related: ["earn-points", "points-expiry", "use-voucher"],
  },
  {
    ...TBD,
    slug: "points-expiry",
    topic: "points",
    title_ar: "متى تنتهي صلاحية النقاط؟",
    title_en: "When do points expire?",
    // W2-98-t3 · «متى تنتهي النقاط؟»
    summary_ar: "بعد 12 شهراً من إضافتها، وتُستخدم الأقدم أولاً.",
    summary_en: "12 months after they're added, and the oldest are used first.",
    related: ["earn-points", "dealer-gift"],
  },
  // الحساب والسيارات
  {
    ...TBD,
    slug: "change-phone",
    topic: "account",
    title_ar: "كيف أغيّر رقم جوالي؟",
    title_en: "How do I change my mobile number?",
    // W2-98-t4 · نفس السؤال
    summary_ar: "من «الإعدادات» ← «تغيير»، ونرسل رمز تحقق إلى الرقم الجديد. تبقى هداياك مرتبطة بالرقم المسجّل لدى الوكالة.",
    summary_en: "From “Settings” → “Change”, and we send a verification code to the new number. Your gifts stay linked to the number registered with the dealership.",
    related: ["manage-cars", "delete-account"],
  },
  {
    ...TBD,
    slug: "manage-cars",
    topic: "account",
    title_ar: "كيف أضيف سيارة أو أحذفها؟",
    title_en: "How do I add or remove a car?",
    // W2-98-t4 · «هل يمكنني إضافة أكثر من سيارة؟»
    summary_ar: "نعم، من «سياراتي». نحدد حجم السيارة تلقائياً من الموديل، ويمكنك اختيار سيارتك الافتراضية.",
    summary_en: "Yes, from “My cars”. We detect the car's size from the model automatically, and you can choose your default car.",
    related: ["change-phone", "delete-account", "price-by-car"],
  },
  {
    ...TBD,
    slug: "delete-account",
    topic: "account",
    title_ar: "كيف أحذف حسابي؟",
    title_en: "How do I delete my account?",
    // W2-98-t4 · نفس السؤال
    summary_ar: "من «الإعدادات» ← «حذف الحساب نهائياً» بعد اكتمال حجوزاتك المدفوعة. تُحذف النقاط والهدايا غير المستخدمة، ونحتفظ بالفواتير كما يلزم النظام.",
    summary_en: "From “Settings” → “Delete account permanently” once your paid bookings are completed. Unused points and gifts are deleted, and we keep invoices as the law requires.",
    related: ["change-phone", "manage-cars"],
  },
  // الضمان والشكاوى
  {
    ...TBD,
    slug: "when-to-complain",
    topic: "warranty",
    title_ar: "متى أفتح شكوى؟",
    title_en: "When should I open a complaint?",
    // W2-98-t5 · «متى يمكنني فتح شكوى؟»
    summary_ar: "خلال 7 أيام من اكتمال الحجز لأي مشكلة في التنفيذ، أو خلال مدة الضمان للمشكلات التي يشملها.",
    summary_en: "Within 7 days of the booking being completed for any problem with the work, or within the warranty period for issues it covers.",
    related: ["complaint-on-booking", "track-complaint", "provider-warranty"],
  },
  {
    ...TBD,
    slug: "provider-warranty",
    topic: "warranty",
    title_ar: "ماذا يشمل ضمان مقدّم الخدمة؟",
    title_en: "What does the provider's warranty cover?",
    // W2-98-t5 · «كيف يُوثّق ضمان الخدمة؟»
    summary_ar: "يُسجَّل ضمان مقدّم الخدمة برقم القسيمة وباسمك، ويظهر في تفاصيل الحجز طوال مدته.",
    summary_en: "The provider's warranty is registered with the voucher number and your name, and shows in the booking details for its whole duration.",
    related: ["when-to-complain", "track-complaint"],
  },
  {
    ...TBD,
    slug: "track-complaint",
    topic: "warranty",
    title_ar: "كيف أتابع شكواي؟",
    title_en: "How do I follow up on my complaint?",
    // W2-98-t5 · «متى يصلني الرد على الشكوى؟»
    summary_ar: "يرد فريق لينكار خلال 24 ساعة، ويتواصل مع مقدّم الخدمة ويقترح حلاً، وتتابع كل خطوة في صفحة الشكوى.",
    summary_en: "The Linkar team replies within 24 hours, contacts the provider and proposes a solution, and you follow every step on the complaint page.",
    related: ["when-to-complain", "complaint-on-booking"],
  },
  {
    ...TBD,
    slug: "complaint-on-booking",
    topic: "warranty",
    title_ar: "كيف أفتح شكوى على حجز؟",
    title_en: "How do I open a complaint about a booking?",
    // W2-98-t5 · «كيف أفتح شكوى؟»
    summary_ar: "من «حسابي» ← «الشكاوى والمقترحات»: اختر الحجز ونوع المشكلة، واكتب الوصف وأرفق الصور، واختر الحل الذي تفضّله.",
    summary_en: "From “My account” → “Complaints and suggestions”: choose the booking and the type of problem, write a description, attach photos and pick the solution you prefer.",
    related: ["when-to-complain", "track-complaint", "provider-warranty"],
  },
  // لمقدّمي الخدمة والوكالات — مفيش أي محتوى ليهم في الفيجما
  {
    ...TBD,
    slug: "join-as-provider",
    topic: "business",
    title_ar: "كيف أنضم كمقدّم خدمة؟",
    title_en: "How do I join as a service provider?",
    summary_ar: "[ملخص المقال يُضاف لاحقاً]",
    summary_en: "[Article summary to be added]",
    related: ["dealer-gift-program", "payouts"],
  },
  {
    ...TBD,
    slug: "dealer-gift-program",
    topic: "business",
    title_ar: "كيف يعمل برنامج هدايا الوكالات؟",
    title_en: "How does the dealer gift program work?",
    summary_ar: "[ملخص المقال يُضاف لاحقاً]",
    summary_en: "[Article summary to be added]",
    related: ["join-as-provider", "payouts"],
  },
  {
    ...TBD,
    slug: "payouts",
    topic: "business",
    title_ar: "متى تُحوَّل المستحقات؟",
    title_en: "When are payouts transferred?",
    summary_ar: "[ملخص المقال يُضاف لاحقاً]",
    summary_en: "[Article summary to be added]",
    related: ["join-as-provider", "dealer-gift-program"],
  },
];
