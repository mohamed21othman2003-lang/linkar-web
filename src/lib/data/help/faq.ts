// W2-98 · الأسئلة الشائعة (761:14645) + تبويبات W2-98-t2…t5 (853:312849 · 853:312965 · 853:313081 · 853:313196)
// عنصر السؤال = «v2 · FAQ item» (927:310559): Closed / Open. العربي من الفيجما بالحرف (بما فيها
// إجابات الأسئلة المقفولة من خاصية Answer في كل instance)، الإنجليزي ترجمتنا (للمراجعة).

export type FaqTabKey = "booking" | "voucher" | "points" | "account" | "warranty";

export type FaqItem = { q_ar: string; q_en: string; a_ar: string; a_en: string };

export type FaqTab = { key: FaqTabKey; label_ar: string; label_en: string; items: FaqItem[] };

export const faqPage = {
  title_ar: "الأسئلة الشائعة",
  title_en: "Frequently asked questions",
  description_ar: "أكثر ما يسأل عنه العملاء — ولكل موضوع تفاصيل أكثر في مركز المساعدة.",
  description_en: "What customers ask most — with more detail on every topic in the help center.",
};

export const faqTabs: FaqTab[] = [
  {
    key: "booking",
    label_ar: "الحجز والدفع",
    label_en: "Booking and payment",
    items: [
      {
        q_ar: "هل يتأكد حجزي فوراً؟",
        q_en: "Is my booking confirmed instantly?",
        a_ar: "نعم. تختار الخدمات والفرع وتدفع، فيتأكد الحجز وتصلك القسيمة برسالة.",
        a_en: "Yes. You choose the services and the branch and pay, and the booking is confirmed and your voucher arrives by SMS.",
      },
      {
        q_ar: "ما وسائل الدفع المتاحة؟",
        q_en: "Which payment methods are available?",
        a_ar: "مدى، Apple Pay، STC Pay، والبطاقات الائتمانية Visa وMastercard. الدفع إلكتروني فقط.",
        a_en: "mada, Apple Pay, STC Pay, and Visa and Mastercard credit cards. Payment is online only.",
      },
      {
        q_ar: "هل يمكنني حجز أكثر من خدمة في زيارة واحدة؟",
        q_en: "Can I book more than one service in a single visit?",
        a_ar: "نعم. أضف أكثر من خدمة من نفس مقدّم الخدمة، فتُنفَّذ معاً في زيارة واحدة وبدفعة واحدة.",
        a_en: "Yes. Add more than one service from the same provider, and they're done together in one visit with one payment.",
      },
      {
        q_ar: "لماذا يختلف السعر حسب سيارتي؟",
        q_en: "Why does the price depend on my car?",
        a_ar: "لأن أسعار التظليل والنانو سيراميك والتلميع تختلف حسب حجم السيارة؛ نحدد الحجم تلقائياً من الموديل، وتظهر لك الأسعار لسيارتك.",
        a_en: "Because tinting, nano ceramic and polishing prices vary with the car's size; we detect the size from the model automatically and show you the prices for your car.",
      },
      {
        q_ar: "هل يمكنني الدفع عند الوصول؟",
        q_en: "Can I pay when I arrive?",
        a_ar: "لا. الدفع إلكتروني عند الحجز، وتصلك القسيمة فوراً لتظهرها في الفرع.",
        a_en: "No. Payment is online when you book, and your voucher arrives instantly so you can show it at the branch.",
      },
      {
        q_ar: "هل الأسعار شاملة الضريبة؟",
        q_en: "Do prices include VAT?",
        a_ar: "نعم. كل الأسعار المعروضة شاملة ضريبة القيمة المضافة، وتصلك فاتورة ضريبية بعد الدفع.",
        a_en: "Yes. All displayed prices include VAT, and you receive a tax invoice after payment.",
      },
    ],
  },
  {
    key: "voucher",
    label_ar: "القسيمة والزيارة",
    label_en: "Voucher and visit",
    items: [
      {
        q_ar: "كيف أستخدم القسيمة في الفرع؟",
        q_en: "How do I use the voucher at the branch?",
        a_ar: "أظهر رمز QR أو رقم القسيمة لموظف الفرع عند وصولك، فيتحقق منها ويبدأ تنفيذ الخدمة.",
        a_en: "Show the QR code or the voucher number to the branch staff when you arrive; they verify it and start the service.",
      },
      {
        q_ar: "كم مدة صلاحية القسيمة؟",
        q_en: "How long is the voucher valid?",
        a_ar: "14 يوماً من تاريخ الدفع، ويظهر تاريخ انتهائها في «حجوزاتي» وفي القسيمة نفسها.",
        a_en: "14 days from the payment date; the expiry date shows in “My bookings” and on the voucher itself.",
      },
      {
        q_ar: "هل يمكنني مشاركة القسيمة مع شخص آخر؟",
        q_en: "Can I share the voucher with someone else?",
        a_ar: "نعم، من «مشاركة» في صفحة القسيمة. من يحمل الرابط يستطيع عرضها واستخدامها في الفرع.",
        a_en: "Yes, from “Share” on the voucher page. Anyone with the link can show it and use it at the branch.",
      },
      {
        q_ar: "ماذا أفعل إذا فقدت القسيمة؟",
        q_en: "What if I lose the voucher?",
        a_ar: "تجدها دائماً في «حجوزاتي»، كما تصلك نسخة منها برسالة نصية.",
        a_en: "You can always find it in “My bookings”, and a copy is also sent to you by SMS.",
      },
      {
        q_ar: "كيف أتابع حالة سيارتي أثناء الخدمة؟",
        q_en: "How do I follow my car's status during the service?",
        a_ar: "من «حجوزاتي» ← «تتبّع»: تتحدّث الحالة عند استخدام القسيمة وبدء الخدمة واكتمالها، ويصلك إشعار بكل خطوة.",
        a_en: "From “My bookings” → “Track”: the status updates when the voucher is used and when the service starts and finishes, and you get a notification at every step.",
      },
    ],
  },
  {
    key: "points",
    label_ar: "النقاط والهدايا",
    label_en: "Points and gifts",
    items: [
      {
        q_ar: "كيف أكسب النقاط؟",
        q_en: "How do I earn points?",
        a_ar: "نقطة لكل 1 ر.س تدفعه عند اكتمال الخدمة، و50 نقطة لكل تقييم موثّق، و100 نقطة لأول حجز مكتمل، و500 نقطة لكل صديق يكمل أول حجز بدعوتك.",
        a_en: "One point for every SAR 1 you pay when the service is completed, 50 points per verified review, 100 points for your first completed booking, and 500 points for every friend who completes a first booking with your invite.",
      },
      {
        q_ar: "كم تساوي النقاط عند الدفع؟",
        q_en: "What are points worth at checkout?",
        a_ar: "كل 100 نقطة = 2 ر.س عند الدفع، ويمكن الدفع بالنقاط حتى 30% من قيمة الحجز.",
        a_en: "Every 100 points = SAR 2 at checkout, and you can pay up to 30% of the booking value with points.",
      },
      {
        q_ar: "متى تنتهي النقاط؟",
        q_en: "When do points expire?",
        a_ar: "بعد 12 شهراً من إضافتها، وتُستخدم الأقدم أولاً.",
        a_en: "12 months after they're added, and the oldest are used first.",
      },
      {
        q_ar: "ما هدايا الوكالات؟",
        q_en: "What are dealership gifts?",
        a_ar: "خدمات تهديها وكالة السيارات لعملائها، تحجزها لدى مقدّمي الخدمة المشاركين بدون أي دفع.",
        a_en: "Services a car dealership gifts to its customers, which you book with participating providers without paying anything.",
      },
      {
        q_ar: "كيف أستخدم هدية الوكالة؟",
        q_en: "How do I use a dealership gift?",
        a_ar: "افتح رابط الرسالة أو «الهدايا» في حسابك، وتحقّق من رقم جوالك، ثم اختر مقدّم الخدمة والفرع؛ فيتأكد الحجز وتصلك القسيمة.",
        a_en: "Open the link in the message or “Gifts” in your account, verify your mobile number, then choose the provider and branch; the booking is confirmed and your voucher arrives.",
      },
    ],
  },
  {
    key: "account",
    label_ar: "الحساب",
    label_en: "Account",
    items: [
      {
        q_ar: "هل أحتاج كلمة مرور للدخول؟",
        q_en: "Do I need a password to sign in?",
        a_ar: "لا. تدخل برقم جوالك ورمز تحقق من 4 أرقام يصلك برسالة نصية.",
        a_en: "No. You sign in with your mobile number and a 4-digit verification code sent by SMS.",
      },
      {
        q_ar: "كيف أغيّر رقم جوالي؟",
        q_en: "How do I change my mobile number?",
        a_ar: "من «الإعدادات» ← «تغيير»، ونرسل رمز تحقق إلى الرقم الجديد. تبقى هداياك مرتبطة بالرقم المسجّل لدى الوكالة.",
        a_en: "From “Settings” → “Change”, and we send a verification code to the new number. Your gifts stay linked to the number registered with the dealership.",
      },
      {
        q_ar: "هل يمكنني إضافة أكثر من سيارة؟",
        q_en: "Can I add more than one car?",
        a_ar: "نعم، من «سياراتي». نحدد حجم السيارة تلقائياً من الموديل، ويمكنك اختيار سيارتك الافتراضية.",
        a_en: "Yes, from “My cars”. We detect the car's size from the model automatically, and you can choose your default car.",
      },
      {
        q_ar: "كيف أحذف حسابي؟",
        q_en: "How do I delete my account?",
        a_ar: "من «الإعدادات» ← «حذف الحساب نهائياً» بعد اكتمال حجوزاتك المدفوعة. تُحذف النقاط والهدايا غير المستخدمة، ونحتفظ بالفواتير كما يلزم النظام.",
        a_en: "From “Settings” → “Delete account permanently” once your paid bookings are completed. Unused points and gifts are deleted, and we keep invoices as the law requires.",
      },
    ],
  },
  {
    key: "warranty",
    label_ar: "الضمان والشكاوى",
    label_en: "Warranty and complaints",
    items: [
      {
        q_ar: "كيف يُوثّق ضمان الخدمة؟",
        q_en: "How is the service warranty documented?",
        a_ar: "يُسجَّل ضمان مقدّم الخدمة برقم القسيمة وباسمك، ويظهر في تفاصيل الحجز طوال مدته.",
        a_en: "The provider's warranty is registered with the voucher number and your name, and shows in the booking details for its whole duration.",
      },
      {
        q_ar: "متى يمكنني فتح شكوى؟",
        q_en: "When can I open a complaint?",
        a_ar: "خلال 7 أيام من اكتمال الحجز لأي مشكلة في التنفيذ، أو خلال مدة الضمان للمشكلات التي يشملها.",
        a_en: "Within 7 days of the booking being completed for any problem with the work, or within the warranty period for issues it covers.",
      },
      {
        q_ar: "كيف أفتح شكوى؟",
        q_en: "How do I open a complaint?",
        a_ar: "من «حسابي» ← «الشكاوى والمقترحات»: اختر الحجز ونوع المشكلة، واكتب الوصف وأرفق الصور، واختر الحل الذي تفضّله.",
        a_en: "From “My account” → “Complaints and suggestions”: choose the booking and the type of problem, write a description, attach photos and pick the solution you prefer.",
      },
      {
        q_ar: "متى يصلني الرد على الشكوى؟",
        q_en: "When will I get a reply to my complaint?",
        a_ar: "يرد فريق لينكار خلال 24 ساعة، ويتواصل مع مقدّم الخدمة ويقترح حلاً، وتتابع كل خطوة في صفحة الشكوى.",
        a_en: "The Linkar team replies within 24 hours, contacts the provider and proposes a solution, and you follow every step on the complaint page.",
      },
      {
        q_ar: "ما الذي لا يشمله الضمان؟",
        q_en: "What isn't covered by the warranty?",
        a_ar: "الأضرار الناتجة عن حادث أو سوء استخدام، أو تعديل الخدمة لدى جهة أخرى بعد التنفيذ.",
        a_en: "Damage caused by an accident or misuse, or the work being altered elsewhere after it was done.",
      },
    ],
  },
];
