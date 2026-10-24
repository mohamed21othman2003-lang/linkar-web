import { routes } from "@/lib/routes";

// «10 · النوافذ المنبثقة» (833:19395)
// P-21 · مساعد لينكار (956:21) — من الهوم وتواصل معنا · زر المساعد العائم
// P-22 · تواصل عبر واتساب (956:62) — من الهوم وتواصل معنا · زر واتساب العائم وأيقونات واتساب
// العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة). العناصر المعلّمة «صياغتنا» مش في الفيجما.

export const assistantPopup = {
  title_ar: "مساعد لينكار",
  title_en: "Linkar assistant",
  status_ar: "متاح الآن · يرد فوراً",
  status_en: "Available now · replies instantly",
  // {name} = الاسم الأول للعميل المسجّل
  greeting_ar: "أهلاً {name}، أنا مساعد لينكار. أقدر أساعدك في حجوزاتك والقسيمة والبحث عن خدمة.",
  greeting_en: "Hi {name}, I'm the Linkar assistant. I can help with your bookings, vouchers and finding a service.",
  // صياغتنا: نفس الترحيب للزائر بدون اسم
  greeting_guest_ar: "أهلاً، أنا مساعد لينكار. أقدر أساعدك في حجوزاتك والقسيمة والبحث عن خدمة.",
  greeting_guest_en: "Hi, I'm the Linkar assistant. I can help with your bookings, vouchers and finding a service.",
  prompt_ar: "اختر سؤالاً أو اكتب سؤالك",
  prompt_en: "Pick a question or type your own",
  // الحجز في الفيجما BK-21452 (للعميل المسجّل فقط)
  demo_booking: "BK-21452",
  quick: [
    { key: "track", label_ar: "تتبّع حجزي {booking}", label_en: "Track my booking {booking}", href: routes.booking("BK-21452"), userOnly: true },
    { key: "voucher", label_ar: "كيف أستخدم القسيمة؟", label_en: "How do I use the voucher?", href: routes.helpArticle("use-voucher") },
    // الفيجما: يفتح W2-29 (لوحة البحث في الهيدر) → أقرب صفحة: البحث
    { key: "search", label_ar: "ابحث عن خدمة", label_en: "Find a service", href: routes.search() },
    // الفيجما: NAVIGATE → W2-96 تواصل معنا
    { key: "team", label_ar: "تحدّث مع فريق لينكار", label_en: "Talk to the Linkar team", href: routes.contact },
  ],
  input_placeholder_ar: "اكتب سؤالك…",
  input_placeholder_en: "Type your question…",
  send_ar: "إرسال",
  send_en: "Send",
  note_ar: "يجيب المساعد من سياسات لينكار وبيانات حجوزاتك.",
  note_en: "The assistant answers from Linkar's policies and your booking data.",
  // صياغتنا — رد مؤقت لحد ما يتربط المساعد الحقيقي
  pending_reply_ar: "شكراً على سؤالك. المساعد قيد التجهيز حالياً — اطّلع على مركز المساعدة أو تحدّث مع فريق لينكار.",
  pending_reply_en: "Thanks for your question. The assistant is still being set up — check the help center or talk to the Linkar team.",
  close_ar: "إغلاق",
  close_en: "Close",
};

export const whatsappPopup = {
  title_ar: "راسل فريق لينكار على واتساب",
  title_en: "Message the Linkar team on WhatsApp",
  body_ar: "نرد على استفسارات الحجز والقسيمة والشكاوى. رقم واتساب لينكار: [يُضاف عند الإطلاق].",
  body_en: "We answer questions about bookings, vouchers and complaints. Linkar WhatsApp number: [added at launch].",
  open_ar: "فتح واتساب",
  open_en: "Open WhatsApp",
  close_ar: "إغلاق",
  close_en: "Close",
  // رقم واتساب لينكار: [يُضاف عند الإطلاق]
  href: "https://wa.me/",
};
