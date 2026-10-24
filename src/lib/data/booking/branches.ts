import type { Branch } from "./types";

// فروع جونسون في جدة — W2-33 / W2-33b / W2-33c (الأسماء والعناوين والمسافات والمواعيد من الفيجما).
// map = مكان الدبوس على الخريطة التوضيحية (تقريبي من W2-33c).
// باقي مقدّمي الخدمة مالهمش فروع في فيجما الحجز ← lib/server/booking.ts بيرجّع «فرع رئيسي» مؤقت (placeholder).
export const branches: Branch[] = [
  {
    id: "johnson-zahraa",
    provider: "johnson",
    name_ar: "فرع الزهراء",
    name_en: "Al Zahraa branch",
    street_ar: "شارع الأمير سلطان",
    street_en: "Prince Sultan St",
    district_ar: "حي الزهراء",
    district_en: "Al Zahraa",
    city_ar: "جدة",
    city_en: "Jeddah",
    hours_ar: "مفتوح الآن · 9 ص – 11 م",
    hours_en: "Open now · 9 AM – 11 PM",
    distance_km: 5.6,
    map: { x: 47.1, y: 23.8 },
    phone: "",
  },
  {
    id: "johnson-hamra",
    provider: "johnson",
    name_ar: "فرع الحمراء",
    name_en: "Al Hamra branch",
    street_ar: "طريق الكورنيش",
    street_en: "Corniche Rd",
    district_ar: "حي الحمراء",
    district_en: "Al Hamra",
    city_ar: "جدة",
    city_en: "Jeddah",
    hours_ar: "مفتوح الآن · 9 ص – 11 م",
    hours_en: "Open now · 9 AM – 11 PM",
    distance_km: 7.2,
    map: { x: 17.4, y: 52.4 },
    phone: "",
  },
  {
    id: "johnson-mohammadiya",
    provider: "johnson",
    name_ar: "فرع المحمدية",
    name_en: "Al Mohammadiya branch",
    street_ar: "طريق الملك",
    street_en: "King Rd",
    district_ar: "حي المحمدية",
    district_en: "Al Mohammadiya",
    city_ar: "جدة",
    city_en: "Jeddah",
    hours_ar: "مفتوح الآن · 9 ص – 11 م",
    hours_en: "Open now · 9 AM – 11 PM",
    distance_km: 8.9,
    map: { x: 76.9, y: 14.3 },
    phone: "",
  },
];

// مقدّمو خدمة آخرون على الخريطة بسعر نفس الطلب (W2-33c: «نانو شيلد · 1,248» · «أوتوشابو · 1,918»)
export const mapAlternatives: { provider: string; price: number; map: { x: number; y: number } }[] = [
  { provider: "nanoshield", price: 1248, map: { x: 58.3, y: 59.5 } },
  { provider: "autoshabo", price: 1918, map: { x: 79.4, y: 78.6 } },
];

// موقع العميل على الخريطة (النقطة؛ «موقعك» تحتها) — كل الإحداثيات = الركن العلوي-الأيسر للدبوس في Map 806×420
export const mapMe = { x: 58.3, y: 40.5 };
