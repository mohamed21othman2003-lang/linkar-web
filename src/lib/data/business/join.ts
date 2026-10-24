// W2-92 · طلب الانضمام · تم الإرسال (759:13693) + خيارات مشتركة لنماذج الانضمام
import type { Option, PageHead } from "./types";
import type { Localized } from "@/i18n/config";

export const joinSent = {
  head: {
    crumb_ar: "طلب الانضمام",
    crumb_en: "Application",
    title_ar: "تم استلام طلبك",
    title_en: "We received your application",
    description_ar: "شكراً لاهتمامك بالانضمام إلى لينكار.",
    description_en: "Thank you for your interest in joining Linkar.",
  } satisfies PageHead,
  // رقم الطلب التجريبي الظاهر في الفيجما
  request_no: "JR-2026-0418",
  title_ar: "وصلنا طلبك — رقم الطلب",
  title_en: "We got your application — request no.",
  body_ar: "أرسلنا نسخة من الطلب إلى جوالك وبريدك. يتواصل معك فريق الشراكات خلال يومي عمل من رقم لينكار الرسمي.",
  body_en: "We sent a copy of the application to your mobile and email. The partnerships team will contact you within two business days from Linkar’s official number.",
  timeline: [
    { done: true, label_ar: "استلام الطلب", label_en: "Application received", when_ar: "تم · الأحد 11 أكتوبر", when_en: "Done · Sunday 11 October" },
    { done: false, label_ar: "مكالمة فريق الشراكات", label_en: "Partnerships team call", when_ar: "خلال يومي عمل", when_en: "Within two business days" },
    { done: false, label_ar: "التقييم الميداني والعقد", label_en: "Site assessment and contract", when_ar: "بعد المكالمة", when_en: "After the call" },
    { done: false, label_ar: "تفعيل صفحتك", label_en: "Your page goes live", when_ar: "بعد توقيع العقد", when_en: "After signing the contract" },
  ] satisfies (Localized<"label"> & Localized<"when"> & { done: boolean })[],
  home_ar: "الصفحة الرئيسية",
  home_en: "Home page",
  back_ar: "العودة إلى لينكار للأعمال",
  back_en: "Back to Linkar for business",
};

// [placeholder] قوائم الاختيار مش موجودة في الفيجما (بيظهر بس «جدة» و«اختر العدد»)
export const cities: Option[] = [
  { value: "riyadh", label_ar: "الرياض", label_en: "Riyadh" },
  { value: "jeddah", label_ar: "جدة", label_en: "Jeddah" },
  { value: "makkah", label_ar: "مكة المكرمة", label_en: "Makkah" },
  { value: "madinah", label_ar: "المدينة المنورة", label_en: "Madinah" },
  { value: "dammam", label_ar: "الدمام", label_en: "Dammam" },
  { value: "khobar", label_ar: "الخبر", label_en: "Al Khobar" },
];

export const branchCounts: Option[] = [
  { value: "1", label_ar: "فرع واحد", label_en: "1 branch" },
  { value: "2-5", label_ar: "2 – 5 فروع", label_en: "2 – 5 branches" },
  { value: "6-10", label_ar: "6 – 10 فروع", label_en: "6 – 10 branches" },
  { value: "gt10", label_ar: "أكثر من 10 فروع", label_en: "More than 10 branches" },
];
