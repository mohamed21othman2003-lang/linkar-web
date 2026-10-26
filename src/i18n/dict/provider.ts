import type { Locale } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";

// نصوص واجهة صفحة مقدّم الخدمة (W2-21) والخدمة عند المزوّد (W2-32) ونوافذها (W2-22، P-07، P-08b، P-10a/b/c، P-14، P-15، P-19).
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا (للمراجعة).

// «ل» + الاسم: «لجونسون» · «للنخبة» · «لـXPEL»
const lam = (name: string) => (/^[A-Za-z0-9]/.test(name) ? `لـ${name}` : name.startsWith("ال") ? `لل${name.slice(2)}` : `ل${name}`);

// «خدمة واحدة» · «خدمتان» · «3 خدمات» · «11 خدمة»
const servicesCountAr = (n: number) => (n === 1 ? "خدمة واحدة" : n === 2 ? "خدمتان" : n <= 10 ? `${n} خدمات` : `${n} خدمة`);

const ar = {
  services: "الخدمات",
  // الصنف بأداة التعريف داخل الجملة: «مقدّمو خدمة آخرون يقدّمون النانو سيراميك»
  categoryDefinite: {
    wash: "الغسيل",
    ppf: "حماية PPF",
    tint: "التظليل",
    polish: "التلميع",
    "nano-ceramic": "النانو سيراميك",
    "color-change": "تغيير اللون",
  } as Record<ServiceSlug, string>,
  sizes: { sedan: "سيدان", suv: "SUV متوسط", large: "SUV كبير" },

  // W2-21 · الرأس
  share: "مشاركة",
  save: "حفظ",
  googleRating: "تقييم Google",
  linkarRating: "تقييم لينكار",
  ratingsCount: (n: number) => `${n} تقييماً`,
  linkarRatingsCount: (n: number) => `${n} تقييماً من حجوزات مكتملة`,
  branchesMeta: (branches: string, km: string) => `${branches} · أقرب فرع ${km} كم`,
  coverAlt: (name: string) => `صورة غلاف ${name}`,

  // W2-21 · التبويبات
  tabs: {
    services: (n: number) => `الخدمات (${n})`,
    packages: (n: number) => `الباقات والعروض (${n})`,
    branches: (n: number, city: string) => `الفروع (${n} في ${city})`,
    reviews: (n: number) => `التقييمات (${n})`,
    about: "نبذة",
  },

  // تبويب الخدمات + كارت الحجز
  chooseServices: "اختر خدماتك",
  chooseServicesSub: "تُحجز كلها في زيارة واحدة وبدفع واحد · الأسعار شاملة الضريبة",
  pricePerCar: "السعر لسيارة:",
  forCar: (size: string) => `لسيارة ${size}`,
  popular: "الأكثر طلباً",
  added: "مضافة",
  addToBooking: "أضف للحجز",
  compareServices: "قارن الخدمات",
  compareHint: "محتار بين خدمتين؟ قارن السعر والمدة والضمان وما تشمله كل خدمة.",
  bookingAt: "حجزك لدى",
  selectedServices: (n: number) => `الخدمات المختارة (${n})`,
  total: "الإجمالي",
  inclTax: (size: string) => `شامل الضريبة · سيارة ${size}`,
  oneVisitBranchPay: "زيارة واحدة · فرع واحد · دفع واحد",
  continue: "متابعة",
  compareSelected: "قارن الخدمات المختارة",
  voucherNote: "قسيمة صالحة 14 يوماً من الدفع",
  remove: "إزالة",
  removeItem: (name: string) => `إزالة ${name}`,
  // ⚠ غير موجود في الفيجما (حالة كارت الحجز الفاضي)
  emptySelection: "اختر خدمة واحدة على الأقل للمتابعة.",

  // تبويب الباقات
  packagesTitle: "الباقات والعروض",
  packagesSub: (name: string) => `باقات يصمّمها ${name} بسعر أقل من مجموع خدماتها، وتُحجز كأي خدمة.`,
  discount: (n: number) => `خصم ${n}%`,
  saveAmount: (amount: string) => `وفّر ${amount}`,

  // تبويب الفروع
  branchesTitle: (city: string) => `الفروع في ${city}`,
  branchesSub: "اختر الفرع الأنسب لك عند الحجز.",
  directions: "الاتجاهات",
  kmAway: (km: string) => `${km} كم`,
  mapLabel: "خريطة الفروع",
  youAreHere: "موقعك",

  // تبويب التقييمات
  reviewsTitle: "التقييمات",
  reviewsSub: "تقييمات من عملاء أكملوا حجوزاتهم عبر لينكار فقط.",
  outOf5: "من 5",
  allReviews: "كل التقييمات",
  stars: (n: number) => `${n} من 5 نجوم`,

  // تبويب النبذة
  aboutTitle: (name: string) => `نبذة عن ${name}`,
  policies: "سياسات الحجز",

  // مقدّمو خدمة مشابهون
  similarTitle: (name: string) => `مقدّمو خدمة مشابهون ${lam(name)}`,
  similarSub: "يقدّمون الخدمات نفسها أو ما يشبهها بالقرب منك — افتح صفحة أي منهم لترى خدماته وأسعاره.",
  similarFilters: { similar: (name: string) => `مشابهون ${lam(name)}`, nearest: "الأقرب لك", same: "يقدّمون نفس خدماتك" },
  viewDetails: "اعرض التفاصيل",
  compare: "قارن",
  carouselPage: (n: number) => `الصفحة ${n}`,

  // W2-22 · نافذة المقارنة
  compareTitle: (name: string) => `قارن خدمات ${name}`,
  compareSub: (size: string) => `الأسعار لسيارة ${size} وشاملة الضريبة · أبرزنا الأفضل في كل بند`,
  addService: "أضف خدمة",
  rows: { type: "النوع", offers: "ما تقدّمه", price: "السعر لسيارتك", duration: "المدة", warranty: "الضمان", asPackage: "متاحة كباقة" },
  best: "الأفضل",
  addedToBooking: "مضافة لحجزك",
  compareNote: (short: string) => `يمكنك مقارنة حتى 3 خدمات من ${short}. ما تضيفه يُحجز معاً في زيارة واحدة وبدفع واحد.`,

  // W2-32 · الخدمة عند المزوّد
  serviceAt: (service: string, provider: string) => `‏${service} لدى ${provider}`,
  providerPage: "صفحة مقدّم الخدمة",
  serviceReviewsCount: (n: number) => `(${n} تقييماً للخدمة)`,
  bookAsPackage: "احجزها كباقة",
  packageBannerSub: (name: string, price: string, old: string) => `${name} · ${price} بدلاً من ${old}`,
  morePhotos: (n: number) => `+${n} صور`,
  serviceTabs: { overview: "نظرة عامة", specs: "المواصفات التقنية", warranty: "الضمان", photos: "الصور", reviews: (n: number) => `التقييمات (${n})` },
  facts: { duration: "مدة التنفيذ", warranty: "الضمان", suitable: "مناسبة لـ" },
  includesTitle: "ما تشمله الخدمة",
  serviceReviewsTitle: "تقييمات الخدمة",
  serviceReviewsSub: (rating: string, n: number, short: string) => `${rating} من 5 · ${n} تقييماً من حجوزات مكتملة لهذه الخدمة لدى ${short}`,
  yourCar: "سيارتك",
  change: "تغيير",
  priceByCar: "السعر محسوب حسب نوع سيارتك.",
  selectedService: "الخدمة المختارة",
  addMore: (short: string) => `أضف خدمات أخرى من ${short} (اختياري)`,
  addMoreSub: "كل خدمة مستقلة بسعرها وضمانها، وتُنفَّذ معاً في نفس الزيارة وبدفع واحد.",
  totalCount: (n: number) => `الإجمالي · ${servicesCountAr(n)}`,
  oneVisitPay: "زيارة واحدة · دفع واحد",
  marketerCredit: (code: string) => `رصيد المسوّق (${code}) عند الدفع`,
  otherProvidersTitle: (category: string) => `مقدّمو خدمة آخرون يقدّمون ${category}`,
  otherProvidersSub: "قارن هذه الخدمة مع نفس الخدمة لدى مقدّمي خدمة قريبين منك.",
  allProvidersOf: (category: string) => `كل مقدّمي ${category}`,
  inCompare: "في المقارنة",
  compareNow: (n: number) => `قارن الآن (${n})`,
  compareSummary: (items: string[]) => `اخترت ${items.join(" و ")} للمقارنة`,
  compareItem: (service: string, provider: string) => `${service} لدى ${provider}`,
  otherServicesTitle: (short: string) => `خدمات أخرى لدى ${short}`,
  otherServicesSub: "أضفها لنفس الزيارة واحصل عليها في حجز واحد.",
  add: "أضف",

  // W2-32s · رابط المسوّق
  affiliateTitle: (name: string, code: string, amount: string) => `وصلت عبر رابط المسوّق ${name} (${code}) · رصيد ${amount} يُطبَّق عند الدفع`,
  affiliateSub: (min: string) => `يُطبَّق الرصيد تلقائياً على الحجوزات المؤهلة من ${min}، وكود واحد لكل حجز.`,
  hide: "إخفاء",

  // P-07 · تواصل مع الفرع
  contactTitle: "تواصل مع الفرع",
  contactWith: (provider: string, branch: string) => `${provider} · ${branch}`,
  call: "اتصال بالفرع",
  callSub: "مكالمة مباشرة مع موظف الفرع",
  whatsapp: "واتساب",
  whatsappSub: "محادثة مع الفرع على واتساب",
  directionsSub: "افتح موقع الفرع على الخريطة",
  bookingRefNote: (no: string) => `اذكر رقم حجزك ${no} عند التواصل مع الفرع.`,

  // P-08b · مشاركة الصفحة
  shareTitle: (short: string) => `مشاركة صفحة ${short}`,
  shareSub: "أرسل صفحة مقدّم الخدمة لمن تريد.",
  copy: "نسخ",
  email: "البريد",
  sms: "رسالة نصية",
  copyLink: "نسخ الرابط",

  // P-10 · رسائل سريعة
  linkCopied: "تم نسخ الرابط",
  addedToFavorites: "أُضيفت إلى المفضلة",
  view: "عرض",
  addedToCompare: (n: number) => `أُضيف إلى المقارنة · ${n} من 3`,
  compareNowShort: "قارن الآن",

  // P-14 · عارض الصور
  prevPhoto: "الصورة السابقة",
  nextPhoto: "الصورة التالية",
  photoOf: (i: number, n: number) => `${i} / ${n}`,
  morePhotosShort: (n: number) => `+${n}`,
  photoAlt: (name: string, i: number) => `${name} · صورة ${i}`,

  // P-15 · اختر سيارتك
  chooseCar: "اختر سيارتك",
  chooseCarSub: "السعر يتغيّر حسب نوع السيارة وحجمها.",
  defaultCar: "الافتراضية",
  confirm: "تأكيد",
  addCar: "أضف سيارة",

  // P-19 · اختر الفرع
  chooseBranch: "اختر الفرع",
  chooseBranchSub: (name: string, city: string) => `فروع ${name} الأقرب لموقعك في ${city}.`,
  nearestToYou: "الأقرب لك",

  // العميل المعدّل (AVbWFtRb0aHpm34oqkI5ot): توفّر الخدمة في الفروع (W2-21) + الفرع في كارت الحجز (W2-32) + «السعر» في كروت المقدّمين
  availableAllBranches: (n: number) => `متاحة في كل الفروع (${n})`,
  availableOnlyAt: (branch: string) => `متاحة في ${branch} فقط`,
  branchDistance: (km: string) => `على بُعد ${km} كم من موقعك`,
  nearestSuffix: "الأقرب إليك",
  price: "السعر",
};

const servicesCountEn = (n: number) => (n === 1 ? "1 service" : `${n} services`);

const en: typeof ar = {
  services: "Services",
  categoryDefinite: { wash: "car wash", ppf: "PPF protection", tint: "window tinting", polish: "polishing", "nano-ceramic": "nano ceramic", "color-change": "color change" },
  sizes: { sedan: "Sedan", suv: "Mid-size SUV", large: "Large SUV" },

  share: "Share",
  save: "Save",
  googleRating: "Google rating",
  linkarRating: "Linkar rating",
  ratingsCount: (n) => `${n} reviews`,
  linkarRatingsCount: (n) => `${n} reviews from completed bookings`,
  branchesMeta: (branches, km) => `${branches} · nearest ${km} km`,
  coverAlt: (name) => `${name} cover photo`,

  tabs: {
    services: (n) => `Services (${n})`,
    packages: (n) => `Packages & offers (${n})`,
    branches: (n, city) => `Branches (${n} in ${city})`,
    reviews: (n) => `Reviews (${n})`,
    about: "About",
  },

  chooseServices: "Choose your services",
  chooseServicesSub: "All booked in one visit with one payment · prices include VAT",
  pricePerCar: "Price for:",
  forCar: (size) => `For a ${size.toLowerCase()}`,
  popular: "Most popular",
  added: "Added",
  addToBooking: "Add to booking",
  compareServices: "Compare services",
  compareHint: "Torn between two services? Compare price, duration, warranty and what each one includes.",
  bookingAt: "Booking at",
  selectedServices: (n) => `Selected services (${n})`,
  total: "Total",
  inclTax: (size) => `Incl. VAT · ${size.toLowerCase()}`,
  oneVisitBranchPay: "One visit · one branch · one payment",
  continue: "Continue",
  compareSelected: "Compare selected services",
  voucherNote: "Voucher valid for 14 days from payment",
  remove: "Remove",
  removeItem: (name) => `Remove ${name}`,
  emptySelection: "Choose at least one service to continue.",

  packagesTitle: "Packages & offers",
  packagesSub: (name) => `Packages designed by ${name} for less than their services combined, booked like any service.`,
  discount: (n) => `${n}% off`,
  saveAmount: (amount) => `Save ${amount}`,

  branchesTitle: (city) => `Branches in ${city}`,
  branchesSub: "Choose the branch that suits you when you book.",
  directions: "Directions",
  kmAway: (km) => `${km} km`,
  mapLabel: "Branches map",
  youAreHere: "Your location",

  reviewsTitle: "Reviews",
  reviewsSub: "Reviews only from customers who completed their booking through Linkar.",
  outOf5: "out of 5",
  allReviews: "All reviews",
  stars: (n) => `${n} out of 5 stars`,

  aboutTitle: (name) => `About ${name}`,
  policies: "Booking policies",

  similarTitle: (name) => `Providers similar to ${name}`,
  similarSub: "They offer the same or similar services near you — open any of them to see their services and prices.",
  similarFilters: { similar: (name) => `Similar to ${name}`, nearest: "Closest to you", same: "Offer your services" },
  viewDetails: "View details",
  compare: "Compare",
  carouselPage: (n) => `Page ${n}`,

  compareTitle: (name) => `Compare ${name} services`,
  compareSub: (size) => `Prices for a ${size.toLowerCase()}, VAT included · best in each row highlighted`,
  addService: "Add service",
  rows: { type: "Type", offers: "What it does", price: "Price for your car", duration: "Duration", warranty: "Warranty", asPackage: "Available as a package" },
  best: "Best",
  addedToBooking: "Added to booking",
  compareNote: (short) => `You can compare up to 3 ${short} services. Whatever you add is booked together in one visit with one payment.`,

  serviceAt: (service, provider) => `${service} at ${provider}`,
  providerPage: "Provider page",
  serviceReviewsCount: (n) => `(${n} reviews for this service)`,
  bookAsPackage: "Book as a package",
  packageBannerSub: (name, price, old) => `${name} · ${price} instead of ${old}`,
  morePhotos: (n) => `+${n} photos`,
  serviceTabs: { overview: "Overview", specs: "Technical specs", warranty: "Warranty", photos: "Photos", reviews: (n) => `Reviews (${n})` },
  facts: { duration: "Duration", warranty: "Warranty", suitable: "Best for" },
  includesTitle: "What the service includes",
  serviceReviewsTitle: "Service reviews",
  serviceReviewsSub: (rating, n, short) => `${rating} out of 5 · ${n} reviews from completed bookings of this service at ${short}`,
  yourCar: "Your car",
  change: "Change",
  priceByCar: "Price is calculated for your car type.",
  selectedService: "Selected service",
  addMore: (short) => `Add more services from ${short} (optional)`,
  addMoreSub: "Each service has its own price and warranty, done together in the same visit with one payment.",
  totalCount: (n) => `Total · ${servicesCountEn(n)}`,
  oneVisitPay: "One visit · one payment",
  marketerCredit: (code) => `Marketer credit (${code}) at checkout`,
  otherProvidersTitle: (category) => `Other providers offering ${category}`,
  otherProvidersSub: "Compare this service with the same service at providers near you.",
  allProvidersOf: (category) => `All ${category} providers`,
  inCompare: "In comparison",
  compareNow: (n) => `Compare now (${n})`,
  compareSummary: (items) => `You picked ${items.join(" and ")} to compare`,
  compareItem: (service, provider) => `${service} at ${provider}`,
  otherServicesTitle: (short) => `More services at ${short}`,
  otherServicesSub: "Add them to the same visit and get them in one booking.",
  add: "Add",

  affiliateTitle: (name, code, amount) => `You came through marketer ${name}'s link (${code}) · ${amount} credit applied at checkout`,
  affiliateSub: (min) => `The credit applies automatically to eligible bookings from ${min}, one code per booking.`,
  hide: "Hide",

  contactTitle: "Contact the branch",
  contactWith: (provider, branch) => `${provider} · ${branch}`,
  call: "Call the branch",
  callSub: "Talk directly to branch staff",
  whatsapp: "WhatsApp",
  whatsappSub: "Chat with the branch on WhatsApp",
  directionsSub: "Open the branch location on the map",
  bookingRefNote: (no) => `Mention your booking number ${no} when contacting the branch.`,

  shareTitle: (short) => `Share ${short}'s page`,
  shareSub: "Send the provider page to anyone you like.",
  copy: "Copy",
  email: "Email",
  sms: "Text message",
  copyLink: "Copy link",

  linkCopied: "Link copied",
  addedToFavorites: "Added to favorites",
  view: "View",
  addedToCompare: (n) => `Added to comparison · ${n} of 3`,
  compareNowShort: "Compare now",

  prevPhoto: "Previous photo",
  nextPhoto: "Next photo",
  photoOf: (i, n) => `${i} / ${n}`,
  morePhotosShort: (n) => `+${n}`,
  photoAlt: (name, i) => `${name} · photo ${i}`,

  chooseCar: "Choose your car",
  chooseCarSub: "The price depends on the car type and size.",
  defaultCar: "Default",
  confirm: "Confirm",
  addCar: "Add a car",

  chooseBranch: "Choose a branch",
  chooseBranchSub: (name, city) => `${name} branches closest to you in ${city}.`,
  nearestToYou: "Closest to you",

  availableAllBranches: (n) => `Available at all branches (${n})`,
  availableOnlyAt: (branch) => `Available at ${branch} only`,
  branchDistance: (km) => `${km} km from your location`,
  nearestSuffix: "Closest to you",
  price: "Price",
};

export const getProviderDict = (locale: Locale) => (locale === "en" ? en : ar);
export type ProviderDict = typeof ar;
