import type { Service } from "./types";

// المصدر: W2-25 «كل الخدمات» + أسماء الخدمات في الهيرو والفوتر
// الترتيب نفس ترتيب الفيجما (من اليمين في العربي)
export const services: Service[] = [
  {
    slug: "wash",
    name_ar: "الغسيل",
    name_en: "Car wash",
    chip_ar: "غسيل",
    chip_en: "Wash",
    description_ar: "غسيل خارجي وداخلي في مغاسل معتمدة قريبة منك.",
    description_en: "Exterior and interior washing at certified car washes near you.",
    featured_providers: ["bareeq", "nanoshield", "crystal"],
  },
  {
    slug: "ppf",
    name_ar: "حماية PPF",
    name_en: "PPF protection",
    chip_ar: "حماية PPF",
    chip_en: "PPF",
    description_ar: "أفلام حماية شفافة للطلاء من الخدوش والحصى.",
    description_en: "Clear protection film that shields the paint from scratches and stone chips.",
    // الفيجما بيعرض السطر «3M • XPEL • لومار» ولومار في أول السطر (يمين)؛ الترتيب ده بيطلع نفس الشكل في المتصفح
    featured_providers: ["llumar", "3m", "xpel"],
  },
  {
    slug: "tint",
    name_ar: "التظليل",
    name_en: "Window tinting",
    chip_ar: "تظليل",
    chip_en: "Tinting",
    description_ar: "عزل حراري وتظليل للزجاج بأفلام معتمدة.",
    description_en: "Heat insulation and window tinting with certified films.",
    featured_providers: ["nukhba", "xpel", "llumar"],
  },
  {
    slug: "polish",
    name_ar: "التلميع",
    name_en: "Polishing",
    chip_ar: "تلميع",
    chip_en: "Polishing",
    description_ar: "تلميع الطلاء وإزالة الخدوش الخفيفة واستعادة اللمعان.",
    description_en: "Paint polishing that removes light scratches and restores the shine.",
    featured_providers: ["lamaa", "johnson", "autoshabo"],
  },
  {
    slug: "nano-ceramic",
    name_ar: "نانو سيراميك",
    name_en: "Nano ceramic",
    chip_ar: "نانو سيراميك",
    chip_en: "Nano ceramic",
    description_ar: "طبقة حماية سيراميك تحفظ لمعة الطلاء لسنوات.",
    description_en: "A ceramic coating that keeps the paint glossy for years.",
    featured_providers: ["johnson", "feynlab", "nanox"],
  },
  // تغيير اللون — جديدة في التصميم المعدّل (الهيرو والخدمات والفوتر)؛ الوصف من W2-25 وكارت الهوم «ثري إم • إكسبل • ثري سفن»
  {
    slug: "color-change",
    name_ar: "تغيير اللون",
    name_en: "Color change",
    chip_ar: "تغيير اللون",
    chip_en: "Color change",
    description_ar: "تغليف السيارة بلون جديد بأفلام قابلة للإزالة، يحافظ على الطلاء الأصلي.",
    description_en: "Wrap your car in a new color with removable films that protect the original paint.",
    featured_providers: ["3m", "xpel", "3seven"],
  },
];
