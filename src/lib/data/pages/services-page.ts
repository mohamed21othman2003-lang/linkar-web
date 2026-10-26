// W2-25 · كل الخدمات (779:17880)
export const servicesPage = {
  title_ar: "خدمات العناية بالسيارات",
  title_en: "Car care services",
  description_ar: "اختر خدمة أو أكثر لترى مقدّمي الخدمة الذين يقدّمونها قريباً منك، وأسعارهم حسب نوع سيارتك.",
  description_en: "Choose one or more services to see the providers near you who offer them, with prices for your car type.",
  crumb_ar: "الخدمات",
  crumb_en: "Services",
  // شريط الاختيار (Selection bar)
  selected_one_ar: "اخترت خدمة: {a}",
  selected_one_en: "You chose one service: {a}",
  selected_two_ar: "اخترت خدمتين: {a} + {b}",
  selected_two_en: "You chose two services: {a} + {b}",
  selected_many_ar: "اخترت {n} خدمات: {list}",
  selected_many_en: "You chose {n} services: {list}",
  together_ar: "تُحجزان معاً في زيارة واحدة وبدفع واحد",
  together_en: "Booked together in one visit with one payment",
  cta_one_ar: "اعرض مقدّمي الخدمة",
  cta_one_en: "Show providers",
  cta_two_ar: "اعرض مقدّمي الخدمتين",
  cta_two_en: "Show providers for both",
  cta_many_ar: "اعرض مقدّمي الخدمات",
  cta_many_en: "Show providers for all",
  // الحالة الافتراضية للاختيار في الفيجما + الأسماء بأداة التعريف في جملة الشريط
  default_selected: ["nano-ceramic", "polish"] as const,
  definite_ar: { "nano-ceramic": "النانو سيراميك" } as Record<string, string>,
  definite_en: {} as Record<string, string>,
  hint_ar: "اضغط على خدمة لإضافتها، أو «احجز» لعرض مقدّميها مباشرة.",
  hint_en: "Tap a service to add it, or “Book” to see its providers right away.",
};

// W2-25 في تصميم العميل المعدّل (AVbWFtRb0aHpm34oqkI5ot · 85:37060): كارت كبير لكل خدمة —
// وصف أطول، شيبس (المدة + الضمان)، «أعلى مقدّمي الخدمة تقييماً قربك» (3 مراكز)، و«يبدأ من».
// الإنجليزي ترجمتنا. ترتيب الشيبس في الفيجما: المدة أولاً (يمين) ثم الضمان.
type Chip = { text_ar: string; text_en: string };
const chip = (ar: string, en: string): Chip => ({ text_ar: ar, text_en: en });
export type ServicePageCard = {
  description_ar: string;
  description_en: string;
  chips: Chip[];
  top_providers: string[];
  starting_price: number;
};
export const serviceCards: Record<string, ServicePageCard> = {
  wash: {
    description_ar: "غسيل خارجي وداخلي بمواد آمنة على الطلاء، مع تنظيف المقصورة والزجاج.",
    description_en: "Exterior and interior wash with paint-safe products, plus cabin and glass cleaning.",
    chips: [chip("ساعة تقريباً", "About 1 hour")],
    top_providers: ["nanoshield", "crystal", "bareeq"],
    starting_price: 45,
  },
  ppf: {
    description_ar: "فيلم شفاف يحمي الطلاء من الخدوش والحصى وبهتان اللون، للسيارة كاملة أو لأجزاء منها.",
    description_en: "A clear film that protects the paint from scratches, stone chips and fading, on the whole car or selected parts.",
    chips: [chip("يومان إلى 3 أيام", "2 to 3 days"), chip("ضمان حتى 10 سنوات", "Up to 10-year warranty")],
    top_providers: ["xpel", "3m", "llumar"],
    starting_price: 1299,
  },
  tint: {
    description_ar: "أفلام عزل حراري تخفف الحرارة والأشعة فوق البنفسجية، بدرجات تظليل مسموحة نظاماً.",
    description_en: "Heat-insulating films that cut heat and UV rays, in legally permitted tint levels.",
    chips: [chip("3 ساعات تقريباً", "About 3 hours"), chip("ضمان حتى 10 سنوات", "Up to 10-year warranty")],
    top_providers: ["nukhba", "v-kool", "llumar"],
    starting_price: 549,
  },
  polish: {
    description_ar: "إزالة الخدوش الخفيفة والدوائر وإعادة لمعة الطلاء على مراحل.",
    description_en: "Removes light scratches and swirl marks and restores the paint's shine in stages.",
    chips: [chip("4 ساعات تقريباً", "About 4 hours")],
    top_providers: ["johnson", "lamaa", "autoshabo"],
    starting_price: 349,
  },
  "nano-ceramic": {
    description_ar: "طبقة حماية لامعة طاردة للماء تحافظ على الطلاء لسنوات وتسهّل تنظيفه.",
    description_en: "A glossy, water-repellent coating that protects the paint for years and makes it easier to clean.",
    chips: [chip("يوم واحد تقريباً", "About 1 day"), chip("ضمان حتى 9 سنوات", "Up to 9-year warranty")],
    top_providers: ["johnson", "autoshabo", "nanoshield"],
    starting_price: 899,
  },
  "color-change": {
    description_ar: "تغليف السيارة بلون جديد بأفلام قابلة للإزالة، يحافظ على الطلاء الأصلي.",
    description_en: "Wrap your car in a new color with removable films that protect the original paint.",
    chips: [chip("3 إلى 5 أيام", "3 to 5 days"), chip("ضمان حتى 5 سنوات", "Up to 5-year warranty")],
    top_providers: ["xpel", "3m", "3seven"],
    starting_price: 4500,
  },
};
export const serviceCardsCopy = {
  top_label_ar: "أعلى مقدّمي الخدمة تقييماً قربك",
  top_label_en: "Top-rated providers near you",
};
