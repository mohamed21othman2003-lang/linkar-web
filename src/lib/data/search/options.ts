// قوائم البحث التفاعلية: P-11 الترتيب · P-12 كل الفلاتر · P-17 حجم السيارة + لوحة البحث W2-29
import type { ServiceSlug } from "@/lib/data/types";

const L = (ar: string, en: string) => ({ label_ar: ar, label_en: en });

export type SortKey = "nearest" | "price" | "rating" | "warranty" | "duration";
// P-11 · Sort (1443:26437)
export const sortOptions: ({ key: SortKey } & ReturnType<typeof L>)[] = [
  { key: "nearest", ...L("الأقرب إليك", "Nearest to you") },
  { key: "price", ...L("الأقل سعراً", "Lowest price") },
  { key: "rating", ...L("الأعلى تقييماً", "Highest rated") },
  { key: "warranty", ...L("أطول ضمان", "Longest warranty") },
  { key: "duration", ...L("الأقصر مدة", "Shortest duration") },
];

// P-12 · كل الفلاتر (835:21) — الترتيب من بداية السطر
export const filterGroups = {
  price: L("السعر الإجمالي لسيارتك", "Total price for your car"),
  noMax: L("بلا حد أعلى", "No upper limit"),
  rating: {
    ...L("تقييم مقدّم الخدمة", "Provider rating"),
    options: [
      { value: 0, ...L("الكل", "All") },
      { value: 4.5, ...L("4.5 فأكثر", "4.5+") },
      { value: 4, ...L("4 فأكثر", "4+") },
    ],
  },
  warranty: {
    ...L("الضمان", "Warranty"),
    options: [
      { value: 0, ...L("الكل", "All") },
      { value: 1, ...L("سنة فأكثر", "1 year+") },
      { value: 3, ...L("3 سنوات فأكثر", "3 years+") },
      { value: 5, ...L("5 سنوات فأكثر", "5 years+") },
    ],
  },
  duration: {
    ...L("مدة التنفيذ", "Duration"),
    options: [
      { value: 0, ...L("الكل", "All") },
      { value: 4, ...L("4 ساعات أو أقل", "4 hours or less") },
      { value: 24, ...L("يوم واحد أو أقل", "1 day or less") },
    ],
  },
  offers: {
    ...L("العروض والباقات", "Offers & packages"),
    hasOffer: L("لديه عروض", "Has offers"),
    hasPackage: L("باقة متاحة", "Package available"),
  },
  distance: {
    ...L("المسافة من موقعك", "Distance from you"),
    options: [
      { value: 0, ...L("أي مسافة", "Any distance") },
      { value: 5, ...L("حتى 5 كم", "Up to 5 km") },
      { value: 10, ...L("حتى 10 كم", "Up to 10 km") },
      { value: 25, ...L("حتى 25 كم", "Up to 25 km") },
    ],
  },
  title: L("كل الفلاتر", "All filters"),
  apply: L("عرض النتائج", "Show results"),
  clearAll: L("مسح الكل", "Clear all"),
  // اختصار في شريط الأدوات
  warranty5: L("ضمان 5 سنوات فأكثر", "5-year warranty or more"),
};

// P-13 · وصلت للحد الأقصى للمقارنة (835:91)
export const compareMax = {
  title: L("وصلت للحد الأقصى للمقارنة", "You've reached the comparison limit"),
  // {name} = مقدّم الخدمة اللي بتحاول تضيفه
  body: L("يمكنك مقارنة 3 مقدّمي خدمة في المرة الواحدة. أزل أحدهم لإضافة {name}.", "You can compare 3 providers at a time. Remove one to add {name}."),
  open: L("فتح المقارنة", "Open comparison"),
  ok: L("حسناً", "OK"),
};

// P-10 · رسائل التأكيد (Toasts)
export const toasts = {
  added: L("أُضيف إلى المقارنة · {n} من 3", "Added to comparison · {n} of 3"), // P-10c
  filtersCleared: L("تم مسح كل الفلاتر", "All filters cleared"), // P-10o
  areaUpdated: L("تم تحديث النتائج لهذه المنطقة", "Results updated for this area"), // P-10p
  listAll: L("تعرض القائمة كل مقدّمي الخدمة في منطقتك", "The list shows every provider in your area"), // P-10q
  filtersApplied: L("تم تطبيق الفلاتر", "Filters applied"), // P-10s
};

// P-17 · حجم السيارة (1443:392232) — بالترتيب في الفيجما
export const carSizes = [
  { key: "large", ...L("كبيرة (SUV كبيرة · بيك أب)", "Large (large SUV · pickup)") },
  { key: "suv", ...L("SUV متوسطة", "Mid-size SUV") },
  { key: "sedan", ...L("سيدان", "Sedan") },
];

// موقع البحث الافتراضي (شريط البحث + W2-26)
export const searchLocation = { ...L("حي الروضة، جدة", "Al Rawdah, Jeddah"), city_ar: "جدة", city_en: "Jeddah" };

// W2-29 · لوحة البحث (769:16533)
export type RecentSearch = ReturnType<typeof L> &
  ({ kind: "provider"; provider: string } | { kind: "providerService"; provider: string; service: ServiceSlug } | { kind: "search"; services: ServiceSlug[] });

export const recentSearches: RecentSearch[] = [
  { kind: "search", services: ["nano-ceramic"], ...L("نانو سيراميك · حي الروضة", "Nano ceramic · Al Rawdah") },
  { kind: "providerService", provider: "xpel", service: "tint", ...L("تظليل Prime XR", "Prime XR tinting") },
  { kind: "provider", provider: "xpel", ...L("‏XPEL السعودية", "XPEL Saudi Arabia") },
];

// «الأكثر طلباً» — بالترتيب من بداية السطر
export const popularServices: ServiceSlug[] = ["wash", "ppf", "tint", "polish", "nano-ceramic"];

// خدمات بأسماء تجارية عند مقدّمي الخدمة — بتظهر في اقتراحات لوحة البحث
// (من كروت W2-30/W2-30a) — Johnson Ceramic Pro مذكورة في W2-29 نفسها
export const namedServices: (ReturnType<typeof L> & { service: ServiceSlug; provider: string })[] = [
  { ...L("‏Johnson Ceramic Pro", "Johnson Ceramic Pro"), service: "nano-ceramic", provider: "johnson" },
  { ...L("XPEL Fusion Plus", "XPEL Fusion Plus"), service: "nano-ceramic", provider: "xpel" },
  { ...L("تظليل Prime XR", "Prime XR tinting"), service: "tint", provider: "xpel" },
  { ...L("نانو سيراميك 9H", "Nano Ceramic 9H"), service: "nano-ceramic", provider: "nanoshield" },
  { ...L("نانو سيراميك برو", "Nano Ceramic Pro"), service: "nano-ceramic", provider: "autoshabo" },
];

// أسماء العرض في البحث لو مختلفة عن providers.ts (الفيجما: «جونسون Johnson»)
export const searchDisplayNames: Record<string, { name_ar: string; name_en: string }> = {
  johnson: { name_ar: "جونسون Johnson", name_en: "Johnson" },
};
