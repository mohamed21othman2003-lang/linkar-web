import { routes } from "@/lib/routes";
import type { UiGlyph } from "@/components/icons/Icon";

// W2-96 · تواصل معنا (760:13644) — العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).

export type ContactChannel = {
  key: "help" | "complaints" | "email" | "business" | "follow";
  icon: UiGlyph;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  cta?: { label_ar: string; label_en: string; href: string };
};

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "snapchat" | "x" | "youtube" | "whatsapp";

export const contactPage = {
  title_ar: "تواصل معنا",
  title_en: "Contact us",
  description_ar: "نرد على رسالتك خلال يوم عمل. لمشكلة في حجز، افتح شكوى من حسابك ليتابعها الفريق مع مقدّم الخدمة.",
  description_en: "We reply to your message within one business day. For a problem with a booking, open a complaint from your account so the team can follow it up with the provider.",

  channels: [
    {
      key: "help",
      icon: "info",
      title_ar: "مركز المساعدة",
      title_en: "Help center",
      body_ar: "إجابات عن الحجز والدفع والقسيمة والنقاط.",
      body_en: "Answers about booking, payment, vouchers and points.",
      cta: { label_ar: "افتح مركز المساعدة", label_en: "Open the help center", href: routes.help },
    },
    {
      key: "complaints",
      icon: "message",
      title_ar: "مشكلة في حجز؟",
      title_en: "A problem with a booking?",
      body_ar: "افتح شكوى من «حسابي ← الشكاوى والمقترحات» ونرد خلال 24 ساعة.",
      body_en: "Open a complaint from “My account → Complaints and suggestions” and we'll reply within 24 hours.",
      cta: { label_ar: "الشكاوى والمقترحات", label_en: "Complaints and suggestions", href: routes.complaints() },
    },
    {
      key: "email",
      icon: "mail",
      title_ar: "البريد الإلكتروني",
      title_en: "Email",
      body_ar: "info@linkarksa.com",
      body_en: "info@linkarksa.com",
    },
    {
      key: "business",
      icon: "package",
      title_ar: "مقدّمو الخدمة والوكالات",
      title_en: "Providers and dealerships",
      body_ar: "للانضمام أو الاستفسار عن الشراكات.",
      body_en: "To join or ask about partnerships.",
      cta: { label_ar: "لينكار للأعمال", label_en: "Linkar for business", href: routes.forProviders },
    },
    {
      key: "follow",
      icon: "share",
      title_ar: "تابعنا",
      title_en: "Follow us",
      body_ar: "آخر العروض والنصائح على حسابات لينكار الرسمية.",
      body_en: "The latest offers and tips on Linkar's official accounts.",
    },
  ] satisfies ContactChannel[],

  handle: "@linkarksa",
  // v2 · Social icon — Light (1076:27437). الروابط من site.footer.social، وواتساب يفتح P-22.
  social: ["facebook", "instagram", "tiktok", "snapchat", "x", "youtube", "whatsapp"] satisfies SocialPlatform[],

  // Form
  form_title_ar: "أرسل رسالتك",
  form_title_en: "Send us a message",
  name_label_ar: "الاسم",
  name_label_en: "Name",
  phone_label_ar: "رقم الجوال",
  phone_label_en: "Mobile number",
  phone_placeholder: "05X XXX XXXX",
  topic_label_ar: "نوع الاستفسار",
  topic_label_en: "Inquiry type",
  // الفيجما فيها «الدفع والفواتير» بس — باقي الخيارات صياغتنا (للمراجعة)
  topics: [
    { value: "billing", label_ar: "الدفع والفواتير", label_en: "Payment and invoices" },
    { value: "booking", label_ar: "الحجز والقسيمة", label_en: "Booking and voucher" },
    { value: "account", label_ar: "الحساب", label_en: "Account" },
    { value: "business", label_ar: "الشراكات ولينكار للأعمال", label_en: "Partnerships and Linkar for business" },
    { value: "other", label_ar: "أخرى", label_en: "Other" },
  ],
  booking_label_ar: "رقم الحجز (اختياري)",
  booking_label_en: "Booking number (optional)",
  booking_placeholder: "BK-21452",
  // حالة الفيجما المعبّاة (للمقارنة فقط: ?demo=figma)
  demo_name_ar: "محمد سالم",
  demo_name_en: "Mohammed Salem",
  message_label_ar: "رسالتك",
  message_label_en: "Your message",
  message_placeholder_ar: "اكتب رسالتك هنا…",
  message_placeholder_en: "Write your message here…",
  submit_ar: "إرسال الرسالة",
  submit_en: "Send message",
  // P-10f
  sent_toast_ar: "وصلتنا رسالتك، وسنرد عليك قريباً",
  sent_toast_en: "We got your message and will reply soon",
};
