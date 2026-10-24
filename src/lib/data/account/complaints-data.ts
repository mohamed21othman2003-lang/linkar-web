import type { Localized } from "@/i18n/config";

// W2-69 · الشكاوى والمقترحات (752:9099) + تبويبات (1132:34722) + W2-69-0 (1071:911)
// W2-69b شكوى أو اقتراح جديد (752:9483) + W2-69c اقتراح لتحسين لينكار (853:311951)

export const complaintsPage = {
  title_ar: "الشكاوى والمقترحات",
  title_en: "Complaints and suggestions",
  description_ar: "كل شكوى مرتبطة بحجز، ويرد فريق لينكار خلال 24 ساعة ويتابع مع مقدّم الخدمة حتى الحل.",
  description_en: "Every complaint is linked to a booking, and the Linkar team replies within 24 hours and follows up with the provider until it’s resolved.",
  new_cta_ar: "شكوى أو اقتراح جديد",
  new_cta_en: "New complaint or suggestion",
  tab_all_ar: "الكل",
  tab_all_en: "All",
  tab_open_ar: "مفتوحة",
  tab_open_en: "Open",
  tab_closed_ar: "مغلقة",
  tab_closed_en: "Closed",
  tab_suggestions_ar: "مقترحات",
  tab_suggestions_en: "Suggestions",
  suggestion_label_ar: "اقتراح",
  suggestion_label_en: "Suggestion",
  decision_title_ar: "هل يناسبك الحل الذي اقترحه المركز؟",
  decision_title_en: "Does the center’s proposed solution work for you?",
  decision_other_ar: "أفضّل حلاً آخر",
  decision_other_en: "I’d prefer another solution",
  reply_placeholder_ar: "اكتب رداً لفريق لينكار…",
  reply_placeholder_en: "Write a reply to the Linkar team…",
  // رسائل سريعة P-10i · P-10j
  toast_accepted_ar: "تم قبول الحل، وسنُبلغ مركز لمعة",
  toast_accepted_en: "Solution accepted — we’ll let Lamaa know",
  toast_reply_ar: "تم إرسال ردك إلى فريق لينكار",
  toast_reply_en: "Your reply was sent to the Linkar team",
  // الحالة الفارغة
  empty_title_ar: "لا توجد شكاوى أو مقترحات",
  empty_title_en: "No complaints or suggestions",
  empty_text_ar: "إذا واجهت مشكلة في حجز مكتمل أو لديك فكرة لتحسين لينكار، نحن نسمعك ونرد خلال 24 ساعة.",
  empty_text_en: "If you had a problem with a completed booking or have an idea to improve Linkar, we’re listening and reply within 24 hours.",
  empty_cta_ar: "اقتراح جديد",
  empty_cta_en: "New suggestion",
};

export type ComplaintTab = "all" | "open" | "closed" | "suggestions";

export type ThreadMessage = Localized<"author"> &
  Localized<"time"> &
  Localized<"text"> & {
    from: "you" | "linkar" | "provider";
    photos?: number; // عدد الصور المرفقة (الصور نفسها مش موجودة في الفيجما — مربعات كاميرا)
  };

export type Complaint = Localized<"title"> &
  Localized<"meta"> &
  Localized<"status"> & {
    id: string;
    kind: "complaint" | "suggestion";
    state: "open" | "closed" | "received";
    provider?: string; // slug للشعار
    summary?: Localized<"text">;
    thread?: ThreadMessage[];
    decision?: Localized<"accept">;
  };

export const complaints: Complaint[] = [
  {
    id: "CM-3340",
    kind: "complaint",
    state: "open",
    provider: "lamaa",
    status_ar: "مفتوحة · بانتظار ردك",
    status_en: "Open · awaiting your reply",
    title_ar: "آثار تلميع على حواف المصابيح الأمامية",
    title_en: "Polish residue on the headlight edges",
    meta_ar: "الحجز BK-21388 · تلميع ثلاث مراحل · مركز لمعة للتلميع · فُتحت الجمعة 9 أكتوبر",
    meta_en: "Booking BK-21388 · 3-stage polish · Lamaa Polishing Center · opened Fri 9 Oct",
    thread: [
      {
        from: "you",
        author_ar: "أنت",
        author_en: "You",
        time_ar: "الجمعة 9 أكتوبر · 11:20 ص",
        time_en: "Fri 9 Oct · 11:20 AM",
        text_ar: "بعد استلام السيارة لاحظت آثار تلميع بيضاء على حواف المصابيح الأمامية. أرفقت صورتين.",
        text_en: "After picking up the car I noticed white polish residue on the edges of the headlights. I attached two photos.",
        photos: 2,
      },
      {
        from: "linkar",
        author_ar: "فريق لينكار",
        author_en: "Linkar team",
        time_ar: "الجمعة 9 أكتوبر · 1:05 م",
        time_en: "Fri 9 Oct · 1:05 PM",
        text_ar: "شكراً لك يا محمد. تواصلنا مع المركز وطلبنا فحص الصور، وسنعود إليك قبل السبت 1:00 م.",
        text_en: "Thank you, Mohammed. We contacted the center and asked them to review the photos, and we’ll get back to you before Sat 1:00 PM.",
      },
      {
        from: "provider",
        author_ar: "مركز لمعة للتلميع",
        author_en: "Lamaa Polishing Center",
        time_ar: "السبت 10 أكتوبر · 10:40 ص",
        time_en: "Sat 10 Oct · 10:40 AM",
        text_ar: "نعتذر عن ذلك. نستقبل السيارة لإزالة الآثار مجاناً الثلاثاء 13 أكتوبر 4:00 م، والتسليم في نفس اليوم.",
        text_en: "We apologize. We’ll take the car in to remove the residue for free on Tue 13 Oct at 4:00 PM, with same-day delivery.",
      },
    ],
    decision: { accept_ar: "أقبل الحل · الثلاثاء 13 أكتوبر 4:00 م", accept_en: "Accept · Tue 13 Oct 4:00 PM" },
  },
  {
    id: "CM-3311",
    kind: "complaint",
    state: "closed",
    provider: "bareeq",
    status_ar: "مغلقة · تم الحل",
    status_en: "Closed · resolved",
    title_ar: "بقع ماء على الزجاج بعد الغسيل",
    title_en: "Water spots on the glass after the wash",
    meta_ar: "الحجز BK-21302 · غسيل خارجي وداخلي · مغاسل بريق",
    meta_en: "Booking BK-21302 · exterior & interior wash · Bareeq Car Wash",
    summary: {
      text_ar: "أُغلقت: أعاد المركز الغسيل مجاناً الأربعاء 30 سبتمبر — وقيّمت الحل «ممتاز».",
      text_en: "Closed: the center redid the wash for free on Wed 30 Sep — and you rated the solution “Excellent”.",
    },
  },
  {
    id: "SG-1",
    kind: "suggestion",
    state: "received",
    status_ar: "وصل للفريق",
    status_en: "Received by the team",
    title_ar: "إضافة خدمة الغسيل في موقع العميل",
    title_en: "Add an at-home car wash service",
    meta_ar: "أُرسل الاثنين 5 أكتوبر",
    meta_en: "Sent Mon 5 Oct",
    summary: {
      text_ar: "رد فريق لينكار: «شكراً لك — أضفنا اقتراحك إلى خطة الخدمات القادمة، وسنبلغك عند إطلاقها».",
      text_en: "Linkar team replied: “Thank you — we’ve added your suggestion to our upcoming services plan and will let you know when it launches.”",
    },
  },
];

// ---------- W2-69b / W2-69c ----------
export const complaintForm = {
  title_ar: "شكوى أو اقتراح جديد",
  title_en: "New complaint or suggestion",
  description_ar: "اختر الحجز واشرح المشكلة — يرد فريق لينكار خلال 24 ساعة.",
  description_en: "Pick the booking and describe the problem — the Linkar team replies within 24 hours.",
  suggestion_description_ar: "شاركنا فكرتك لتحسين لينكار — نقرأ كل اقتراح.",
  suggestion_description_en: "Share your idea to improve Linkar — we read every suggestion.",
  tab_complaint_ar: "شكوى على حجز",
  tab_complaint_en: "Complaint about a booking",
  tab_suggestion_ar: "اقتراح لتحسين لينكار",
  tab_suggestion_en: "Suggestion to improve Linkar",
  step1_title_ar: "1. على أي حجز؟",
  step1_title_en: "1. Which booking?",
  step1_text_ar: "تُفتح الشكوى خلال 7 أيام من اكتمال الحجز، أو خلال مدة الضمان لما يشمله الضمان.",
  step1_text_en: "Complaints can be opened within 7 days of the booking being completed, or during the warranty period for anything the warranty covers.",
  other_booking_ar: "حجز آخر؟ ابحث برقم الحجز أو اسم مقدّم الخدمة",
  other_booking_en: "Another booking? Search by booking number or provider name",
  bookings_note_ar: "تظهر آخر 3 حجوزات مكتملة، وباقي حجوزاتك من القائمة.",
  bookings_note_en: "Your last 3 completed bookings are shown; pick any other booking from the list.",
  step2_title_ar: "2. نوع المشكلة",
  step2_title_en: "2. Type of problem",
  step3_title_ar: "3. اشرح ما حدث",
  step3_title_en: "3. Describe what happened",
  step3_text_ar: "كلما كان الوصف أوضح ومعه صور، كان الحل أسرع.",
  step3_text_en: "The clearer the description and the more photos, the faster the solution.",
  step4_title_ar: "4. الحل الذي تفضّله",
  step4_title_en: "4. Your preferred solution",
  step4_text_ar: "يقترح فريق لينكار الحل النهائي بعد التواصل مع مقدّم الخدمة.",
  step4_text_en: "The Linkar team proposes the final solution after talking to the provider.",
  submit_ar: "إرسال الشكوى",
  submit_en: "Send complaint",
  footer_note_ar: "يصلك رقم الشكوى برسالة، ويرد فريق لينكار خلال 24 ساعة.",
  footer_note_en: "You’ll get the complaint number by text message, and the Linkar team replies within 24 hours.",
  // W2-69c
  suggestion_step_title_ar: "1. اكتب اقتراحك",
  suggestion_step_title_en: "1. Write your suggestion",
  suggestion_step_text_ar: "ما الذي تريد أن نضيفه أو نحسّنه في لينكار؟ يمكنك إرفاق صور توضيحية.",
  suggestion_step_text_en: "What would you like us to add or improve in Linkar? You can attach screenshots or photos.",
  suggestion_submit_ar: "إرسال الاقتراح",
  suggestion_submit_en: "Send suggestion",
  suggestion_footer_ar: "يصلك رد فريق لينكار برسالة خلال 24 ساعة.",
  suggestion_footer_en: "You’ll get the Linkar team’s reply by text message within 24 hours.",
  // P-10n / P-10r
  toast_photo_added_ar: "أُرفقت الصورة",
  toast_photo_added_en: "Photo attached",
  toast_photo_removed_ar: "تم حذف الملف",
  toast_photo_removed_en: "File deleted",
  max_length: 500,
  // النص الظاهر في الفيجما داخل خانة الوصف (W2-69b و W2-69c بنفس النص)
  draft_ar: "بعد استلام السيارة لاحظت آثار تلميع بيضاء على حواف المصابيح الأمامية، وتظهر بوضوح في الشمس.",
  draft_en: "After picking up the car I noticed white polish residue on the edges of the headlights, clearly visible in the sun.",
};

export type PickerBooking = Localized<"title"> &
  Localized<"meta"> & {
    id: string;
    provider: string;
    // ملاحظة تحت الحجز (أخضر = متاح بشرط، رمادي = غير متاح)
    note?: Localized<"text">;
    disabled?: boolean;
  };

export const pickerBookings: PickerBooking[] = [
  {
    id: "BK-21388",
    provider: "lamaa",
    title_ar: "تلميع ثلاث مراحل · مركز لمعة للتلميع",
    title_en: "3-stage polish · Lamaa Polishing Center",
    meta_ar: "‏BK-21388 · اكتمل الخميس 8 أكتوبر · لكزس ES 2022",
    meta_en: "BK-21388 · completed Thu 8 Oct · Lexus ES 2022",
  },
  {
    id: "BK-21302",
    provider: "bareeq",
    title_ar: "غسيل خارجي وداخلي · مغاسل بريق",
    title_en: "Exterior & interior wash · Bareeq Car Wash",
    meta_ar: "‏BK-21302 · اكتمل الاثنين 28 سبتمبر · تويوتا كامري 2023",
    meta_en: "BK-21302 · completed Mon 28 Sep · Toyota Camry 2023",
    note: { text_ar: "مضى أكثر من 7 أيام — متاح لمشكلات الضمان فقط", text_en: "More than 7 days ago — warranty issues only" },
  },
  {
    id: "BK-21431",
    provider: "xpel",
    title_ar: "باقة السيارة الجديدة · XPEL السعودية",
    title_en: "New Car Package · XPEL Saudi Arabia",
    meta_ar: "‏BK-21431 · في الخدمة الآن",
    meta_en: "BK-21431 · in service now",
    note: { text_ar: "متاح بعد اكتمال الحجز", text_en: "Available once the booking is completed" },
    disabled: true,
  },
];

// بترتيب الفيجما من بداية السطر
export const problemTypes: (Localized<"label"> & { key: string })[] = [
  { key: "quality", label_ar: "جودة التنفيذ", label_en: "Workmanship" },
  { key: "delay", label_ar: "تأخير عن الموعد", label_en: "Delay" },
  { key: "price", label_ar: "السعر مختلف", label_en: "Different price" },
  { key: "treatment", label_ar: "التعامل", label_en: "Staff conduct" },
  { key: "damage", label_ar: "ضرر بالسيارة", label_en: "Damage to the car" },
  { key: "other", label_ar: "أخرى", label_en: "Other" },
];

export const resolutions: (Localized<"label"> & { key: string })[] = [
  { key: "redo", label_ar: "إعادة الخدمة مجاناً", label_en: "Redo the service for free" },
  { key: "partial", label_ar: "استرداد جزئي", label_en: "Partial refund" },
  { key: "full", label_ar: "استرداد كامل", label_en: "Full refund" },
  { key: "apology", label_ar: "اعتذار وتوضيح فقط", label_en: "Apology and explanation only" },
];
