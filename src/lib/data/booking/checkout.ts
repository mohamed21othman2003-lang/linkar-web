import type { Car, CompletedBooking, Confirmation, PaymentMethod } from "./types";

// سيارات العميل التجريبي (محمد سالم) — W2-34b · P-15
export const userCars: Car[] = [
  {
    id: "camry-2023",
    make_ar: "تويوتا",
    make_en: "Toyota",
    model_ar: "كامري",
    model_en: "Camry",
    year: 2023,
    size: "sedan",
    color_ar: "أبيض",
    color_en: "White",
    plate_ar: "ر س ح 1234",
    plate_en: "RSH 1234",
    is_default: true,
  },
  {
    id: "lexus-es-2022",
    make_ar: "لكزس",
    make_en: "Lexus",
    model_ar: "ES",
    model_en: "ES",
    year: 2022,
    size: "sedan",
    color_ar: "رمادي",
    color_en: "Grey",
    plate_ar: "5678 ب ن د",
    plate_en: "5678 BND",
  },
];

// سيارة العميل في حجز رابط المسوّق (W2-35s / W2-36s · «هوندا أكورد 2024 · ناصر ع.»)
export const referralCar: Car = {
  id: "accord-2024",
  make_ar: "هوندا",
  make_en: "Honda",
  model_ar: "أكورد",
  model_en: "Accord",
  year: 2024,
  size: "sedan",
  color_ar: "",
  color_en: "",
  plate_ar: "",
  plate_en: "",
};

// طرق الدفع — W2-35 (الترتيب من الفيجما). الدفع تجريبي بالكامل (بدون بوابة حقيقية).
export const paymentMethods: PaymentMethod[] = [
  { id: "apple", name_ar: "Apple Pay", name_en: "Apple Pay", description_ar: "الأسرع على أجهزة Apple", description_en: "Fastest on Apple devices", badge: "Apple Pay", flow: "direct" },
  { id: "mada", name_ar: "مدى", name_en: "mada", description_ar: "بطاقة مدى البنكية", description_en: "mada bank card", badge: "مدى", badge_en: "mada", flow: "verify" },
  { id: "stc", name_ar: "STC Pay", name_en: "STC Pay", description_ar: "محفظة STC Pay", description_en: "STC Pay wallet", badge: "STC Pay", flow: "verify" },
  { id: "tabby", name_ar: "تابي", name_en: "tabby", description_ar: "قسّمها على 4 دفعات بدون فوائد · {amount} اليوم", description_en: "Split into 4 interest-free payments · {amount} today", badge: "tabby", flow: "redirect" },
  { id: "tamara", name_ar: "تمارا", name_en: "tamara", description_ar: "قسّمها على دفعات شهرية بدون فوائد", description_en: "Split into interest-free monthly payments", badge: "tamara", flow: "redirect" },
  { id: "card", name_ar: "بطاقة ائتمانية", name_en: "Credit card", description_ar: "Visa · Mastercard", description_en: "Visa · Mastercard", badge: "VISA · MC", flow: "verify" },
];

// البطاقة/المحفظة المعروضة في نافذة التحقق (P-09 «mada •••• 4821» · P-09b «STC Pay · 055 123 4567»)
// VISA •••• 9034 من P-05 (حذف بطاقة VISA •••• 9034؟)
export const savedInstruments: Record<"mada" | "card" | "stc", string> = {
  mada: "mada •••• 4821",
  card: "VISA •••• 9034",
  stc: "STC Pay · ‎055 123 4567‎",
};

// نقاط لينكار: «كل 100 نقطة = 2 ر.س · حتى 30% من قيمة الحجز»
export const pointsRule = { sar_per_100: 2, max_share: 0.3 };

// كود المسوّق: من lib/data/provider-details/marketers.ts (SM123 · رصيد 300 · حد أدنى 1,000)

// تأكيد الحجز — W2-36 (BK-21452) و W2-36s (رابط المسوّق · BK-21417)
export const confirmations: { standard: Confirmation; referral: Confirmation } = {
  standard: {
    booking_id: "BK-21452",
    voucher_code: "LK-9F3K-7QPD",
    share_host: "linkarksa.com",
    valid_until_ar: "الأحد 25 أكتوبر 2026",
    valid_until_en: "Sunday 25 October 2026",
    booked_on_ar: "",
    booked_on_en: "",
    customer_ar: "",
    customer_en: "",
  },
  referral: {
    booking_id: "BK-21417",
    voucher_code: "LK-4N8Q-2TJV",
    share_host: "linkarksa.com",
    valid_until_ar: "الخميس 22 أكتوبر 2026",
    valid_until_en: "Thursday 22 October 2026",
    booked_on_ar: "الخميس 8 أكتوبر 2026",
    booked_on_en: "Thursday 8 October 2026",
    customer_ar: "ناصر ع.",
    customer_en: "Nasser A.",
  },
};

// W2-39 · تقييم الخدمة بعد اكتمالها (BK-21388 · مركز لمعة للتلميع)
export const completedBookings: CompletedBooking[] = [
  {
    id: "BK-21388",
    provider: "lamaa",
    service_ar: "تلميع ثلاث مراحل",
    service_en: "Three-stage polishing",
    completed_on_ar: "اكتمل الخميس 8 أكتوبر",
    completed_on_en: "Completed Thursday 8 October",
    customer_display_ar: "محمد س.",
    customer_display_en: "Mohammed S.",
    overall: 4,
    criteria: [
      { key: "quality", label_ar: "جودة العمل", label_en: "Quality of work", value: 4 },
      { key: "care", label_ar: "العناية بالسيارة ونظافتها", label_en: "Care and cleanliness of the car", value: 5 },
      { key: "communication", label_ar: "التعامل والتواصل", label_en: "Service and communication", value: 5 },
      { key: "value", label_ar: "القيمة مقابل السعر", label_en: "Value for money", value: 4 },
      { key: "scratches", label_ar: "إزالة الخدوش والدوائر", label_en: "Scratch and swirl removal", value: 4 },
    ],
    comment_ar: "نتيجة التلميع ممتازة واللمعان واضح، وبقيت آثار بسيطة على حواف المصابيح فتحت بخصوصها شكوى.",
    comment_en: "The polish result is excellent and the shine is clear; a few light marks remain on the headlight edges, and I opened a complaint about them.",
    points_reward: 50,
  },
];

// خيارات قوائم «أضف سيارتك» (P-24) — من السيارات الموجودة في الفيجما
export const carCatalog: {
  makes: { key: string; ar: string; en: string; models: { ar: string; en: string; size: Car["size"] }[] }[];
  colors: { ar: string; en: string }[];
} = {
  makes: [
    { key: "toyota", ar: "تويوتا", en: "Toyota", models: [{ ar: "كامري", en: "Camry", size: "sedan" }] },
    { key: "honda", ar: "هوندا", en: "Honda", models: [{ ar: "أكورد", en: "Accord", size: "sedan" }] },
    { key: "lexus", ar: "لكزس", en: "Lexus", models: [{ ar: "ES", en: "ES", size: "sedan" }] },
  ],
  colors: [
    { ar: "أبيض", en: "White" },
    { ar: "رمادي", en: "Grey" },
  ],
};

// W2-34a: الرقم المعبّأ في حالة «أرسلنا الرمز إلى 0551234567»
export const loginDemo = { phone: "55 123 4567", typed: "74" }; // typed: الأرقام المكتوبة في حالة W2-34a
