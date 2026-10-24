// W2-93 · برامج الشركات (1100:29770)
import type { Card, PageHead } from "./types";

export const corporatePage = {
  head: {
    crumb_ar: "برامج الشركات",
    crumb_en: "Corporate programs",
    title_ar: "برامج الشركات",
    title_en: "Corporate programs",
    description_ar:
      "عناية مخصّصة لسيارات شركتك وأسطولها لدى مقدّمي خدمة معتمدين. أرسل بيانات شركتك، ويتواصل معك فريق لينكار للأعمال خلال يوم عمل.",
    description_en:
      "Dedicated care for your company cars and fleet at certified providers. Send your company details and the Linkar for business team will contact you within one business day.",
  } satisfies PageHead,
  benefits: [
    {
      icon: "check",
      title_ar: "مقدّمو خدمة معتمدون",
      title_en: "Certified providers",
      body_ar: "لسيارات شركتك لدى مراكز معتمدة وقريبة من مواقع عملكم.",
      body_en: "For your company cars at certified centers close to your work sites.",
    },
    {
      icon: "tag",
      title_ar: "قسيمة رقمية لكل زيارة",
      title_en: "A digital voucher for every visit",
      body_ar: "يستلم السائق القسيمة على جواله ويعرضها في الفرع.",
      body_en: "The driver receives the voucher on their phone and shows it at the branch.",
    },
    {
      icon: "calendar",
      title_ar: "متابعة من مكان واحد",
      title_en: "Follow everything in one place",
      body_ar: "تتابعون حالة كل حجز حتى الاستلام، مع فاتورة ضريبية لكل خدمة.",
      body_en: "Track every booking until pickup, with a tax invoice for each service.",
    },
  ] satisfies Card[],
  partners: {
    icon: "package",
    title_ar: "مقدّمو الخدمة والوكالات",
    title_en: "Providers and dealerships",
    body_ar: "للانضمام أو الاستفسار عن الشراكات.",
    body_en: "To join or ask about partnerships.",
  } satisfies Card,
  partners_link_ar: "لينكار للأعمال",
  partners_link_en: "Linkar for business",

  form_title_ar: "اطلب عرضاً لشركتك",
  form_title_en: "Request an offer for your company",
  contact_ar: "اسم المسؤول",
  contact_en: "Contact person",
  contact_ph_ar: "الاسم الكامل",
  contact_ph_en: "Full name",
  phone_ar: "رقم الجوال",
  phone_en: "Mobile number",
  company_ar: "اسم الشركة",
  company_en: "Company name",
  company_ph_ar: "اسم الشركة كما في السجل التجاري",
  company_ph_en: "Company name as in the commercial registration",
  cars_ar: "عدد السيارات (تقريباً)",
  cars_en: "Number of cars (approx.)",
  cars_ph_ar: "مثال: 25",
  cars_ph_en: "e.g. 25",
  needs_ar: "احتياج شركتك",
  needs_en: "Your company’s needs",
  needs_ph_ar: "الخدمات التي تحتاجها شركتك، والمدن التي تعمل فيها سياراتها...",
  needs_ph_en: "The services your company needs, and the cities its cars operate in...",
  submit_ar: "إرسال الطلب",
  submit_en: "Send request",
};
