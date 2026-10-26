// محتوى الصفحة الرئيسية — V2-01 من نسخة العميل (AVbWFtRb0aHpm34oqkI5ot: 85:29739 ديسكتوب · 85:34229 تابلت · 85:33626 موبايل)
// للزائر والعميل المسجّل (V2-02 اتشالت) + الهيرو الإنجليزي (85:31790) + حالة الخطأ V2-01e ونافذة P-01e
// + نافذة الموقع أول زيارة (85:31445) + قائمة نوع السيارة P-17 (1443:392248).
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا (ما عدا الهيرو: من الفريم الإنجليزي).
import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";

export type Text = Localized<"text">;
// description_t / description_m: نسخ أقصر للتابلت والموبايل (V2-01t · V2-01m)
type Head = { overline: Text; title: Text; description?: Text; description_t?: Text; description_m?: Text; link?: Text & { href_key: LinkKey } };

// مفاتيح الروابط — بتتحوّل لمسارات من routes.ts في lib/server/home.ts
export type LinkKey =
  | "services"
  | "providers"
  | "offers"
  | "packages"
  | "search"
  | "warranty"
  | "dealerPackages"
  | "dealerHelp"
  | "privacy";

const t = (ar: string, en: string): Text => ({ text_ar: ar, text_en: en });

// ---------------------------------------------------------------- الهيرو
export const hero = {
  title_lead: t("عناية بسيارتك ", "Car care that "),
  title_highlight: t("تستحق الثقة", "deserves your trust"),
  subtitle: t("اختر خدماتك وقارن بين مقدمي الخدمة المعتمدين", "Choose your services and compare certified providers"),
  subtitle_t: t("اختر خدماتك وقارن بين مقدّمي الخدمة المعتمدين", "Choose your services and compare certified providers"), // تابلت/موبايل (بالشدّة)
  // أسماء الخدمات في مربعات الهيرو (الإنجليزي من 1315:343728)
  tiles: {
    wash: t("الغسيل", "Wash"),
    ppf: t("حماية PPF", "PPF Protection"),
    tint: t("التظليل", "Tinting"),
    polish: t("التلميع", "Polishing"),
    "nano-ceramic": t("نانو سيراميك", "Nano Ceramic"),
    "color-change": t("تغيير اللون", "Color Change"),
  } satisfies Record<ServiceSlug, Text>,
  // الحالة الافتراضية في الفيجما: التلميع + نانو سيراميك مختارين
  default_services: ["polish", "nano-ceramic"] as ServiceSlug[],
  // حقل الموقع: «المدينة» للعميل المسجّل (557:2)، «الموقع أو الفرع» للزائر (600:2964) وفي الإنجليزي
  location_user: t("المدينة", "Location or branch"),
  location_guest: t("الموقع أو الفرع", "Location or branch"),
  car_placeholder: t("اختر نوع السيارة", "Select car type"),
  search: t("ابحث", "Search"),
  trust: [t("حجز مؤكد فور الدفع", "Booking confirmed on payment"), t("ضمان مزدوج", "Double warranty")],
  app_label: t("حمّل تطبيق لينكار الآن", "Download the Linkar app now"),
  discover: t("اكتشف المزيد من لينكار", "Discover more about Linkar"),
  // V2-01e · «ابحث» بخانات ناقصة — كل الخانات إلزامية (الخدمة والمدينة ونوع السيارة)
  // ⚠ الفيجما فيها رسالة الخانتين معاً بس؛ رسالة المدينة لوحدها أو السيارة لوحدها مشتقة من سطور P-01e
  errors: {
    services: t("اختر خدمة واحدة على الأقل", "Choose at least one service"),
    city_car: t("اختر المدينة ونوع السيارة لعرض الأسعار المناسبة لسيارتك", "Choose your city and car type to see the right prices for your car"),
    city: t("اختر المدينة لعرض مقدّمي الخدمة القريبين منك", "Choose your city to see the providers near you"),
    car: t("اختر نوع السيارة لعرض الأسعار المناسبة لسيارتك", "Choose your car type to see the right prices for your car"),
  },
  // P-01e · أكمل خيارات البحث (85:49277)
  incomplete: {
    badge: t("تنبيه", "Heads up"),
    title: t("أكمل خيارات البحث", "Complete your search options"),
    body: t(
      "نحتاج هذه الاختيارات لنعرض لك مقدّمي الخدمة القريبين منك وأسعارهم لسيارتك.",
      "We need these choices to show you the providers near you and their prices for your car.",
    ),
    service: { label: t("الخدمة:", "Service:"), text: t("اختر خدمة واحدة على الأقل", "Choose at least one service") },
    city: { label: t("المدينة:", "City:"), text: t("حدّد مدينتك أو استخدم موقعك الحالي", "Set your city or use your current location") },
    car: { label: t("نوع السيارة:", "Car type:"), text: t("اختر نوع سيارتك لعرض السعر المناسب لها", "Choose your car type to see the right price for it") },
    ok: t("حسناً، أكمل الاختيارات", "OK, complete my choices"),
  },
};

// ---------------------------------------------------------------- الهيرو الجديد (صفحة 0:1): العميل 37:26639 · الزائر 37:28372
export const heroV3 = {
  // العميل المسجّل
  user: {
    trust: t("مقدّمو خدمة معتمدون فقط · أسعار واضحة لسيارتك · حجز يتأكد فوراً", "Certified providers only · Clear prices for your car · Instantly confirmed booking"),
    title_1: t("عناية بسيارتك", "Car care that"),
    title_2: t("تستحق الثقة", "deserves your trust"),
    subtitle: t(
      "اختر الخدمة، وقارن مقدّمي الخدمة المعتمدين بالسعر لسيارتك والضمان والتقييمات، ثم اطلب وادفع مباشرة — يتأكد حجزك فوراً.",
      "Choose the service, compare certified providers by price for your car, warranty and ratings, then order and pay directly — your booking is confirmed instantly.",
    ),
    car_placeholder: t("اختر النوع", "Select type"),
  },
  // الزائر
  guest: {
    eyebrow: t("منصة سعودية للعناية بالسيارات", "A Saudi car care platform"),
    title: t("رابطك الموثوق للعناية بسيارتك", "Your trusted link to car care"),
    subtitle: t(
      "اكتشف خدمات العناية بالسيارات لدى مقدّمي خدمة معتمدين، واطّلع على الأسعار والتقييمات، ثم احجز وادفع في مكان واحد.",
      "Discover car care services at certified providers, check prices and ratings, then book and pay in one place.",
    ),
    car_placeholder: t("اختر نوع السيارة", "Select car type"),
    popular_label: t("الأكثر طلباً", "Most requested"),
    // الترتيب من بداية السطر
    popular: ["tint", "ppf", "nano-ceramic", "wash"] as ServiceSlug[],
  },
  search: {
    provider: t("مقدّم الخدمة", "Provider"),
    all: t("الكل", "All"),
    services: t("الخدمة أو الخدمات", "Service or services"),
    add: t("أضف", "Add"),
    remove: t("إزالة {name}", "Remove {name}"),
    location: t("الموقع أو الفرع", "Location or branch"),
    car: t("نوع السيارة", "Car type"),
    search: t("ابحث", "Search"),
  },
  // الخدمات المختارة في الفيجما: نانو سيراميك + التلميع
  default_services: ["nano-ceramic", "polish"] as ServiceSlug[],
  app: {
    overline: t("تطبيق لينكار", "Linkar app"),
    title: t("امسح الرمز وحمّل التطبيق", "Scan the code and get the app"),
    link: t("تعرّف على التطبيق", "Learn about the app"),
  },
};

// Partner strip (37:26701) — تحت هيرو العميل المسجّل؛ الترتيب من بداية السطر
export const partnerStrip = {
  overline: t("مقدّمو خدمة معتمدون على لينكار", "Certified providers on Linkar"),
  title: t("علامات تعرفها وتثق بها", "Brands you know and trust"),
  link: { ...t("كل مقدّمي الخدمة", "All providers"), href_key: "providers" as LinkKey },
  // inset = مكان الشعار جوه صندوق 108×36 (Partner logo · L من الفيجما) [top, end, bottom, start] %
  partners: [
    { slug: "xpel", name: t("XPEL السعودية", "XPEL Saudi Arabia"), inset: [23.21, 16.31, 23.21, 16.31] },
    { slug: "3m", name: t("3M السعودية", "3M Saudi Arabia"), inset: [10.89, 26.85, 11.07, 26.9] },
    { slug: "stek", name: t("ستيك STEK", "STEK"), inset: [18.39, 21.49, 18.21, 21.55] },
    { slug: "llumar", name: t("لومار LLumar", "LLumar"), inset: [26.07, 12.44, 25.89, 12.38] },
    { slug: "v-kool", name: t("في-كول V-KOOL", "V-KOOL"), inset: [26.43, 11.85, 26.25, 11.79] },
    { slug: "johnson", name: t("جونسون Johnson", "Johnson"), inset: [14.82, 12.8, 14.82, 12.8] },
  ] as { slug: string; name: Text; inset: [number, number, number, number] }[],
};

// P-17 · قائمة نوع السيارة (1443:392232)
export const carTypes: (Text & { slug: string })[] = [
  { slug: "large", ...t("كبيرة (SUV كبيرة · بيك أب)", "Large (large SUV · pickup)") },
  { slug: "mid-suv", ...t("SUV متوسطة", "Mid-size SUV") },
  { slug: "sedan", ...t("سيدان", "Sedan") },
];

// Home · Location permission · first visit (658:2075)
export const locationModal = {
  title: t("اعرض مقدّمي الخدمة الأقرب إليك", "See the providers closest to you"),
  body: t(
    "نستخدم موقعك لترتيب مقدّمي الخدمة حسب المسافة منك فقط، ويمكنك تغييره في أي وقت.",
    "We only use your location to sort providers by distance from you, and you can change it at any time.",
  ),
  use_current: t("استخدم موقعي الحالي", "Use my current location"),
  or: t("أو حدّد موقعاً آخر", "Or choose another location"),
  search_placeholder: t("ابحث عن مدينة أو حي أو عنوان", "Search for a city, district or address"),
  hint: t(
    "تظهر الاقتراحات أثناء الكتابة، ويمكنك حفظ أكثر من عنوان بعد تسجيل الدخول.",
    "Suggestions appear as you type, and you can save more than one address after signing in.",
  ),
  not_now: t("ليس الآن", "Not now"),
  browser_note: t("سيطلب منك المتصفح تأكيد الإذن", "Your browser will ask you to confirm"),
  privacy: t("سياسة الخصوصية", "Privacy policy"),
};

// الموقع التجريبي اللي ظاهر في الفيجما
export const demoLocation = t("حي الروضة، جدة", "Al Rawdah, Jeddah");

// ---------------------------------------------------------------- V2-01 · اخترناها لك (85:29829)
export type PickItem = {
  provider: string;
  // returning = «لأنك حجزت…» (للعميل العائد فقط — ملاحظة 585:1601)، location = حسب الموقع، ai = ترشيح الذكاء الاصطناعي
  kind: "returning" | "location" | "ai";
  reason: Text;
  note: Text;
};
export const forYou = {
  overline: t("ترشيحات لينكار الذكية", "Linkar smart picks"),
  title: t("اخترناها لك حسب موقعك وتجاربك", "Picked for you by your location and history"),
  // الزائر والعميل الجديد: مافيش تجارب لسه — الترشيح حسب الموقع بس (ملاحظة 85:30647)
  title_guest: t("اخترناها لك حسب موقعك", "Picked for you by your location"),
  near: t("قريب من:", "Near:"),
  change: t("تغيير", "Change"),
  hint: t("تتغير الترشيحات بعد كل حجز وتقييم بما يناسب تجربتك", "Picks change after every booking and review to fit your experience"),
  // الترتيب من بداية السطر (يمين في العربي)
  picks: [
    {
      provider: "3m",
      kind: "returning",
      reason: t("لأنك حجزت خدمة التلميع من قبل", "Because you booked polishing before"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Excellent rating from customers with cars like yours"),
    },
    {
      provider: "xpel",
      kind: "returning",
      reason: t("لأنك حجزت خدمة التلميع من قبل", "Because you booked polishing before"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Excellent rating from customers with cars like yours"),
    },
    {
      provider: "llumar",
      kind: "location",
      reason: t("الأقرب إليك", "Closest to you"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Excellent rating from customers with cars like yours"),
    },
    {
      provider: "v-kool",
      kind: "ai",
      reason: t("الأنسب لسيارتك، ضمان 10 سنوات", "Best fit for your car, 10-year warranty"),
      note: t("الأنسب لسيارتك، ضمان 10 سنوات", "Best fit for your car, 10-year warranty"),
    },
  ] satisfies PickItem[],
  // الزائر/العميل الجديد يرى مكان «لأنك حجزت…» ترشيحات حسب موقعه (ملاحظة 85:30647):
  // أقرب مقدّمي خدمة لموقعه (من بيانات المقدّمين الحقيقية) — الأقرب، ثم الأعلى تقييماً بالقرب منه
  location_reasons: [t("الأقرب إليك", "Closest to you"), t("الأعلى تقييماً بالقرب منك", "Top rated near you")],
  location_note: t("قريب منك · {km} كم", "Near you · {km} km"),
};

// ---------------------------------------------------------------- V2-01 · اخترنا لك (37:26726، صفحة 0:1)
// كروت بلوجو صغير: الترتيب من بداية السطر؛ kind: returning = للعميل العائد بس (ملاحظة 37:28368)
export const forYouV3 = {
  overline: t("ترشيحات لينكار الذكية", "Linkar smart picks"),
  title: t("اخترنا لك حسب موقعك وتجاربك", "Picked for you by your location and history"),
  title_new: t("اخترنا لك حسب موقعك", "Picked for you by your location"),
  near: t("قريب من:", "Near:"),
  change: t("تغيير", "Change"),
  hint: t("تتحسّن الترشيحات مع كل حجز وتقييم", "Picks get better with every booking and review"),
  ai_label: t("ترشيح الذكاء الاصطناعي", "AI pick"),
  view: t("عرض", "View"),
  picks: [
    {
      provider: "johnson",
      kind: "returning",
      tag: t("حان موعد صيانة النانو", "Time for your nano maintenance"),
      note: t("مرّت 6 أشهر على النانو سيراميك — الصيانة تحافظ على الضمان.", "It’s been 6 months since your nano ceramic — maintenance keeps your warranty valid."),
      services: ["nano-ceramic", "polish"],
    },
    {
      provider: "lamaa",
      kind: "returning",
      tag: t("لأنك حجزت التلميع من قبل", "Because you booked polishing before"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك.", "Excellent rating from customers with cars like yours."),
      services: ["polish"],
    },
    { provider: "bareeq", kind: "location", tag: t("الأقرب إليك", "Closest to you"), note: null, services: ["wash"] },
    {
      provider: "xpel",
      kind: "ai",
      tag: null,
      note: t("الأنسب لسيارتك: ضمان 10 سنوات، قريب منك وضمن ميزانيتك.", "Best fit for your car: 10-year warranty, close to you and within your budget."),
      services: [],
    },
  ] as { provider: string; kind: "returning" | "location" | "ai"; tag: Text | null; note: Text | null; services: ServiceSlug[] }[],
  // العميل الجديد: مكان كروت «returning» ترشيحات حسب موقعه (من بيانات المقدّمين الحقيقية)
  location_reasons: [t("الأعلى تقييماً بالقرب منك", "Top rated near you"), t("قريب منك · {km} كم", "Near you · {km} km")],
  location_note: t("تقييم ممتاز من عملاء في منطقتك.", "Excellent rating from customers in your area."),
};

// ---------------------------------------------------------------- V2-01 · الخدمات (37:26829، صفحة 0:1) — كروت صور بشريط متحرك
export const servicesV3 = {
  overline: t("خدماتنا", "Our services"),
  title: t("كل ما تحتاجه سيارتك في مكان واحد", "Everything your car needs in one place"),
  description: t(
    "لكل خدمة مقدّمو خدمة معتمدون تقارن بينهم بالسعر لسيارتك والضمان والتقييمات.",
    "Every service has certified providers you can compare by price for your car, warranty and ratings.",
  ),
  link: { ...t("كل الخدمات", "All services"), href_key: "services" as LinkKey },
  // الترتيب من بداية السطر (صفّين × 3)؛ slides = صور الشريط (الأولى هي الظاهرة في الفيجما)
  cards: [
    { slug: "tint", at: t("لدى النخبة · XPEL · 3M · لومار وغيرهم", "At Al Nukhba · XPEL · 3M · LLumar and more"), slides: ["tint-1", "tint-2", "tint-3"] },
    { slug: "nano-ceramic", at: t("لدى جونسون · فاينلاب · نانو إكس · كار برو", "At Johnson · Feynlab · NanoX · CarPro"), slides: ["nano-ceramic-1", "nano-ceramic-2", "nano-ceramic-3"] },
    { slug: "ppf", at: t("لدى XPEL · 3M · ستيك · لومار وغيرهم", "At XPEL · 3M · STEK · LLumar and more"), slides: ["ppf-1", "ppf-2", "ppf-3"] },
    { slug: "polish", at: t("لدى لمعة · جونسون · أوتوشابو وغيرهم", "At Lamaa · Johnson · Autoshabo and more"), slides: ["polish-1", "polish-2", "polish-3"] },
    { slug: "wash", at: t("لدى بريق · نانو شيلد · كريستال وغيرهم", "At Bareeq · NanoShield · Crystal and more"), slides: ["wash-1", "wash-2", "wash-3"] },
    // ⚠ الفيجما بتعيد صورتين من كارت PPF في شريط «تغيير اللون»
    { slug: "color-change", at: t("لدى لومار · راب-تك", "At LLumar · Wraptek"), slides: ["color-change-1", "ppf-2", "ppf-3"] },
  ] as { slug: ServiceSlug; at: Text; slides: [string, string, string] }[],
};

// ---------------------------------------------------------------- V2-01 · مقدّمو الخدمة (37:27049، صفحة 0:1) — كروت صور + جدار شعارات
export const providersV3 = {
  head: {
    overline: t("قريبون منك · حي الروضة، جدة", "Near you · Al Rawdah, Jeddah"),
    title: t("مقدّمو خدمة معتمدون قريبون منك", "Certified providers near you"),
    description: t(
      "مرتّبون حسب المسافة من موقعك. كل مقدّم خدمة على لينكار اجتاز الاعتماد، وتقييماته من حجوزات مكتملة فقط.",
      "Sorted by distance from you. Every provider on Linkar passed certification, and their ratings come from completed bookings only.",
    ),
    link: { ...t("عرض كل مقدّمي الخدمة", "View all providers"), href_key: "providers" as LinkKey },
  },
  // الترتيب من بداية السطر
  certs: [
    { icon: "brand-shield-neon", title: t("ضمان الجودة واختبار المنتجات", "Quality assurance and product testing"), body: t("نختبر المنتجات المستخدمة ونتأكد من مطابقتها للمواصفات", "We test the products used and make sure they meet the specs") },
    { icon: "brand-car-neon", title: t("زيارة ميدانية", "On-site visit"), body: t("فريق لينكار يزور كل مقدّم خدمة", "The Linkar team visits every provider") },
    { icon: "brand-heart-neon", title: t("تقييمات حقيقية", "Real reviews"), body: t("من حجوزات مكتملة فقط", "From completed bookings only") },
    { icon: "brand-shield-neon", title: t("ضمان موثّق", "Recorded warranty"), body: t("مسجّل برقم قسيمة الحجز", "Registered under the booking voucher number") },
  ],
  all: t("الكل", "All"),
  chips: ["tint", "nano-ceramic", "polish", "wash", "ppf"] as ServiceSlug[],
  // 8 كروت (صفّين × 4) — الترتيب من بداية السطر؛ badge = الشارة البيضا فوق الصورة
  // ⚠ الفيجما فيها «ستيك STEK» ومش موجود في بيانات المقدّمين — مكانه في-كول (V-KOOL)
  cards: [
    { provider: "bareeq", badge: t("الأقرب إليك", "Closest to you") },
    { provider: "xpel", badge: t("ضمان 10 سنوات", "10-year warranty") },
    { provider: "nukhba", badge: t("أفضل قيمة للتظليل", "Best value for tinting") },
    { provider: "3m", badge: t("أفلام 3M الأصلية", "Genuine 3M films") },
    { provider: "lamaa", badge: t("تقييم ممتاز", "Excellent rating") },
    { provider: "llumar", badge: t("ضمان حتى 5 سنوات", "Up to 5-year warranty") },
    { provider: "v-kool", badge: t("متخصص في PPF", "PPF specialist") },
    { provider: "johnson", badge: t("الأعلى تقييماً", "Top rated") },
  ],
  more: t("ومقدّمو خدمة معتمدون آخرون على لينكار", "And more certified providers on Linkar"),
  // جدار الشعارات (Logo wall) — الترتيب من بداية السطر
  logo_wall: [
    "v-kool", "johnson", "nanoshield", "golden-wash", "crystal", "3seven", "autoshabo", "autoplus", "zipart",
    "carpro", "viper", "suntek", "feynlab", "wraptek", "armor", "nanox", "dir",
  ],
};

// ---------------------------------------------------------------- كيف تعمل لينكار (85:29850)
export const howItWorks = {
  overline: t("كيف يعمل لينكار", "How Linkar works"),
  title: t("ابحث، قارن، اطلب، ثم قيّم", "Search, compare, order, then rate"),
  description: t(
    "ابحث عن خدماتك، وقارن بين مقدّمي الخدمة، واطلب وادفع في دقيقة، ثم قيّم تجربتك.",
    "Search for your services, compare providers, order and pay in a minute, then rate your experience.",
  ),
  steps: [
    {
      title: t("ابحث", "Search"),
      // تابلت/موبايل (V2-01t/V2-01m): نسخة أقصر
      body_short: t("اكتب الخدمة أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.", "Type the service or a provider’s name, and we show you the closest to you."),
      body: t(
        "اكتب الخدمة أو الخدمات التي تحتاجها، أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.",
        "Type the service or services you need, or a provider’s name, and we show you the closest to your location.",
      ),
    },
    {
      title: t("قارن", "Compare"),
      body_short: t("قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات.", "Compare prices for your car type, warranties and ratings."),
      body: t(
        "قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات، بين مقدّمي الخدمة أو بين خدماتهم.",
        "Compare prices for your car type, warranties and ratings, across providers or across their services.",
      ),
    },
    {
      title: t("اطلب", "Order"),
      body_short: t("اختر الفرع وادفع إلكترونياً، وتصلك قسيمتك فوراً.", "Choose the branch and pay online, and your voucher arrives instantly."),
      body: t(
        "اختر الفرع وادفع إلكترونياً — مدى أو Apple Pay أو STC Pay أو البطاقة — وتصلك قسيمتك فوراً.",
        "Choose the branch and pay online — mada, Apple Pay, STC Pay or card — and your voucher arrives instantly.",
      ),
    },
    {
      title: t("قيّم", "Rate"),
      body_short: t("بعد اكتمال الخدمة قيّم تجربتك، ونتابع أي ملاحظة حتى الحل.", "Once the service is done, rate your experience and we follow up any issue until it’s resolved."),
      body: t(
        "بعد اكتمال الخدمة قيّم تجربتك، وتابع أي ملاحظة مع فريق لينكار حتى الحل.",
        "Once the service is done, rate your experience and follow up any issue with the Linkar team until it’s resolved.",
      ),
    },
  ],
  // لوحة الرحلة (Responses visual) في V2-01
  journey: {
    chips: [t("التلميع", "Polishing"), t("نانو سيراميك", "Nano ceramic")],
    best_price: t("الأفضل سعراً", "Best price"),
    compare: [
      { provider: "nanoshield", price: 1248, best: true },
      { provider: "johnson", price: 1899, best: false },
    ],
    paid: t("تم الدفع · BK-21452 · قسيمة صالحة 14 يوماً", "Paid · BK-21452 · voucher valid for 14 days"),
    rate: t("قيّم واكسب 50 نقطة", "Rate and earn 50 points"),
    tags: [
      t("حجز مؤكد فور الدفع", "Booking confirmed on payment"),
      t("أسعار حسب نوع سيارتك", "Prices for your car type"),
      t("أكثر من خدمة في زيارة واحدة", "Several services in one visit"),
    ],
  },
  protect_link: t("كيف نحمي حقك؟", "How do we protect you?"),
  start: t("ابدأ الآن", "Start now"),
  guarantees: [t("حجز مؤكد فور الدفع", "Booking confirmed on payment"), t("ضمان موثّق في قسيمتك", "Warranty recorded in your voucher")],
};

// ---------------------------------------------------------------- V2-01 · الخدمات (85:30008)
export const servicesBand = {
  overline: t("خدماتنا", "Our services"),
  title: t("كل ما تحتاجه سيارتك في منصة واحدة", "Everything your car needs on one platform"),
  description: t(
    "لكل خدمة مراكز معتمدة تقارن بينها بالسعر لسيارتك والضمان والتقييمات.",
    "Every service has certified centers you can compare by price for your car, warranty and ratings.",
  ),
  description_t: t("لكل خدمة مراكز معتمدة تقارن بينها بالسعر والضمان والتقييمات.", "Every service has certified centers you can compare by price, warranty and ratings."),
  description_m: t("لكل خدمة مراكز معتمدة تقارن بينها بالسعر والضمان.", "Every service has certified centers you can compare by price and warranty."),
  link: { ...t("كل الخدمات", "All services"), href_key: "services" as LinkKey },
};

// ---------------------------------------------------------------- V2-01 · مقدّمو الخدمة (85:30026)
export const providersBand = {
  head: {
    overline: t("قريبون منك · حي الروضة، جدة", "Near you · Al Rawdah, Jeddah"),
    title: t("مقدّمو خدمة معتمدون قريبون منك", "Certified providers near you"),
    description: t(
      "مرتّبون حسب المسافة من موقعك. كل مقدّم خدمة على لينكار اجتاز الاعتماد، وتقييماته من حجوزات مكتملة فقط.",
      "Sorted by distance from you. Every provider on Linkar passed certification, and their ratings come from completed bookings only.",
    ),
    // تابلت/موبايل
    description_t: t("مرتّبون حسب المسافة من موقعك، وتقييماتهم من حجوزات مكتملة فقط.", "Sorted by distance from you, with ratings from completed bookings only."),
    link: { ...t("عرض كل مقدّمي الخدمة", "View all providers"), href_key: "providers" },
  } satisfies Head,
  // icon = ديسكتوب (Brand icon) · glyph = تابلت/موبايل (UI icon على مربع ليموني) — وترتيبهم هناك معكوس
  certs: [
    {
      icon: "brand-shield-neon",
      glyph: "package",
      title: t("ضمان الجودة واختبار المنتجات", "Quality assurance and product testing"),
      title_m: t("اختبار المنتجات", "Product testing"),
      body: t("نختبر المنتجات المستخدمة ونتأكد من مطابقتها للمواصفات", "We test the products used and make sure they meet the specs"),
      body_t: t("نختبر المنتجات ونتأكد من مطابقتها", "We test the products and make sure they match"),
    },
    {
      icon: "brand-car-neon",
      glyph: "check",
      title: t("تقييم ميداني وتصنيف", "On-site review and grading"),
      body: t("فريق لينكار يقيّم كل مركز ويصنّفه", "The Linkar team reviews and grades every center"),
    },
    {
      icon: "brand-heart-neon",
      glyph: "star",
      title: t("تقييمات حقيقية", "Real reviews"),
      body: t("من حجوزات مكتملة فقط", "From completed bookings only"),
    },
    {
      icon: "brand-shield-neon",
      glyph: "gift",
      title: t("ضمان موثّق", "Recorded warranty"),
      body: t("مسجّل برقم قسيمة الحجز", "Registered under the booking voucher number"),
    },
  ] as { icon: string; glyph: "package" | "check" | "star" | "gift"; title: Text; title_m?: Text; body: Text; body_t?: Text }[],
  all: t("الكل", "All"),
  // الكروت الأربعة في الفيجما (الترتيب من بداية السطر) — والشارة فوق الاسم لكل كارت
  featured: [
    { provider: "3m", tag: t("الأقرب إليك", "Closest to you"), ai: false },
    { provider: "xpel", tag: t("ضمان 10 سنوات", "10-year warranty"), ai: false },
    { provider: "llumar", tag: t("أفضل قيمة للتظليل", "Best value for tinting"), ai: false },
    { provider: "v-kool", tag: null, ai: true },
  ],
};

// ---------------------------------------------------------------- V2-01 · العروض (85:30070)
export type OfferItem = {
  provider: string;
  discount: number;
  title: [Text, Text];
  features: { icon: "clock" | "warranty" | "calendar"; label: Text }[];
  price: number;
  old_price: number;
  package_slug?: string;
};
export const offersBand = {
  head: {
    overline: t("عروض مقدّمي الخدمة", "Provider offers"),
    title: t("عروض حصرية لفترة محدودة", "Exclusive offers for a limited time"),
    description: t(
      "خصومات يقدّمها مقدّمو الخدمة مباشرة — السعر بعد الخصم واضح قبل أن تحجز.",
      "Discounts offered directly by providers — the price after discount is clear before you book.",
    ),
    description_t: t("خصومات يقدّمها مقدّمو الخدمة مباشرة، والسعر بعد الخصم واضح قبل أن تحجز.", "Discounts offered directly by providers, and the price after discount is clear before you book."),
    description_m: t("السعر بعد الخصم واضح قبل أن تحجز.", "The price after discount is clear before you book."),
    link: { ...t("كل العروض", "All offers"), href_key: "offers" },
  } satisfies Head,
  featured: {
    provider: "llumar",
    discount: 15,
    title: t("حماية PPF للواجهة مع نانو سيراميك", "Front PPF protection with nano ceramic"),
    price: 5950,
    old_price: 7000,
    // العدّاد في الفيجما: 02 يوم · 14 ساعة · 36 دقيقة
    ends_in_minutes: 2 * 1440 + 14 * 60 + 36,
  },
  cards: [
    {
      provider: "3m",
      discount: 15,
      title: [t("نانو سيراميك", "Nano ceramic"), t("مع تظليل شامل", "with full tinting")],
      features: [
        { icon: "clock", label: t("6 ساعات", "6 hours") },
        { icon: "warranty", label: t("ضمان 3 سنوات", "3-year warranty") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 2199,
      old_price: 3500,
    },
    {
      provider: "xpel",
      discount: 15,
      title: [t("تظليل كامل للسيارة", "Full car tinting"), t("مع غسيل مجاني لمدة شهر", "with a free wash for a month")],
      features: [
        { icon: "clock", label: t("4 ساعات", "4 hours") },
        { icon: "warranty", label: t("ضمان 5 سنوات", "5-year warranty") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 1399,
      old_price: 2500,
    },
  ] satisfies OfferItem[],
};

// ---------------------------------------------------------------- V2-01 · الباقات (85:30076)
export type PackageCategory = "protection" | "wash" | "polish" | "new-car";
export const packagesBand = {
  head: {
    overline: t("باقات مقدّمي الخدمة", "Provider packages"),
    title: t("باقات تجمع أكثر من خدمة بسعر أوفر", "Packages that bundle several services for less"),
    description: t(
      "كل مقدّم خدمة يصمّم باقاته بنفسه — قارن محتوى الباقة وسعرها بسعر الخدمات منفردة وتقييم مقدّم الخدمة، ثم اطلبها بدفعة واحدة.",
      "Each provider designs its own packages — compare what’s inside and the price with the services on their own and the provider’s rating, then order it in one payment.",
    ),
    description_t: t("كل مقدّم خدمة يصمّم باقاته بنفسه، وتُدفع مرة واحدة.", "Each provider designs its own packages, paid in one go."),
    description_m: t("كل باقة يصمّمها مقدّم الخدمة بنفسه، وتُدفع مرة واحدة.", "Every package is designed by the provider and paid in one go."),
    link: { ...t("كل الباقات", "All packages"), href_key: "packages" },
  } satisfies Head,
  all: t("كل الباقات", "All packages"),
  // الفلاتر — الترتيب من بداية السطر
  categories: [
    { slug: "protection", ...t("حماية وتظليل", "Protection & tinting") },
    { slug: "wash", ...t("غسيل وعناية", "Wash & care") },
    { slug: "polish", ...t("تلميع وتجديد", "Polish & restore") },
    { slug: "new-car", ...t("للسيارات الجديدة", "For new cars") },
  ] as (Text & { slug: PackageCategory })[],
  prev: t("السابق", "Previous"),
  next: t("التالي", "Next"),
  // ⚠ تصنيف كل باقة تحت الفلاتر من عندنا (الفيجما مافيهاش ربط) — للمراجعة
  cards: [
    {
      provider: "xpel",
      discount: 14,
      title: [t("باقة السيارة الجديدة", "New car package"), t("PPF + نانو + تظليل", "PPF + nano + tinting")],
      features: [
        { icon: "clock", label: t("يومان", "2 days") },
        { icon: "warranty", label: t("3 خدمات", "3 services") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 7800,
      old_price: 9100,
      categories: ["new-car", "protection"],
    },
    {
      provider: "johnson",
      discount: 16,
      title: [t("باقة Johnson Ceramic Pro", "Johnson Ceramic Pro package"), t("مع تلميع مجاني", "with free polishing")],
      features: [
        { icon: "clock", label: t("يوم واحد", "1 day") },
        { icon: "warranty", label: t("خدمتان", "2 services") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 1899,
      old_price: 2250,
      package_slug: "johnson-ceramic-pro",
      categories: ["polish", "new-car"],
    },
    {
      provider: "llumar",
      discount: 15,
      title: [t("باقة الحماية والتظليل", "Protection & tinting package"), t("PPF + تظليل كامل", "PPF + full tinting")],
      features: [
        { icon: "clock", label: t("يومان", "2 days") },
        { icon: "warranty", label: t("خدمتان", "2 services") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 4950,
      old_price: 5850,
      categories: ["protection"],
    },
    {
      provider: "nanoshield",
      discount: 18,
      title: [t("باقة العناية الشهرية", "Monthly care package"), t("غسيل وتلميع ونانو سيراميك", "Wash, polish and nano ceramic")],
      features: [
        { icon: "clock", label: t("يوم واحد", "1 day") },
        { icon: "warranty", label: t("3 خدمات", "3 services") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 1690,
      old_price: 2070,
      categories: ["wash", "polish"],
    },
    {
      provider: "johnson",
      discount: 14,
      title: [t("باقة العناية الكاملة", "Complete care package"), t("طاردة للماء + تلميع + تفصيل", "Water repellent + polish + detailing")],
      features: [
        { icon: "clock", label: t("8 ساعات", "8 hours") },
        { icon: "warranty", label: t("3 خدمات", "3 services") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 1499,
      old_price: 1748,
      categories: ["wash", "polish"],
    },
  ] satisfies (OfferItem & { categories: PackageCategory[] })[],
};

// ---------------------------------------------------------------- V2-01 · العروض والباقات (صفحة 0:1: 37:27328 · 37:27460)
// Listing card (37:27333) — نفس الكارت للعروض والباقات
export type ListingSpec = { icon: "clock" | "shield" | "calendar" | "package"; label: Text };
export type ListingItem = {
  provider: string;
  media: string;
  discount: number;
  chip: Text;
  category: { icon: "polish" | "tint" | "package"; label: Text };
  title: Text;
  specs: ListingSpec[];
  price: number;
  old_price: number;
  package_slug?: string;
};
const instant: ListingSpec = { icon: "calendar", label: t("حجز فوري", "Instant booking") };
export const listingCopy = {
  distance: t("{km} كم منك", "{km} km from you"),
  save: t("وفّر {n} ر.س", "Save SAR {n}"),
  note: t("شامل الضريبة · سيدان", "VAT included · Sedan"),
  book_package: t("احجز الباقة", "Book package"),
};
export const offersV3 = {
  // العرض المميّز (37:27429) — كارت ليموني متدرّج
  featured: {
    provider: "xpel",
    discount: 15,
    badge: t("عرض الأسبوع", "Offer of the week"),
    title: t("حماية PPF للواجهة مع نانو سيراميك", "Front PPF protection with nano ceramic"),
    price: 5950,
    old_price: 7000,
  },
  cards: [
    {
      provider: "lamaa",
      media: "lamaa",
      discount: 20,
      chip: t("ينتهي خلال أسبوع", "Ends in a week"),
      category: { icon: "polish", label: t("التلميع · ثلاث مراحل", "Polishing · three stages") },
      title: t("تلميع ثلاث مراحل + حماية سيراميك", "Three-stage polish + ceramic protection"),
      specs: [
        { icon: "clock", label: t("4 ساعات", "4 hours") },
        { icon: "shield", label: t("ضمان 6 أشهر", "6-month warranty") },
        instant,
      ],
      price: 720,
      old_price: 900,
    },
    {
      provider: "llumar",
      media: "llumar",
      discount: 15,
      chip: t("ينتهي خلال 3 أيام", "Ends in 3 days"),
      category: { icon: "tint", label: t("التظليل · كامل السيارة", "Tinting · full car") },
      title: t("تظليل لومار سيراميك لكامل السيارة", "LLumar ceramic tint for the full car"),
      specs: [
        { icon: "clock", label: t("4 ساعات", "4 hours") },
        { icon: "shield", label: t("ضمان 5 سنوات", "5-year warranty") },
        instant,
      ],
      price: 1400,
      old_price: 1650,
    },
  ] satisfies ListingItem[],
};
const svc = (n: 2 | 3) => (n === 3 ? t("3 خدمات", "3 services") : t("خدمتان", "2 services"));
const pkgChip = (n: 2 | 3) => (n === 3 ? t("باقة · 3 خدمات", "Package · 3 services") : t("باقة · خدمتان", "Package · 2 services"));
export const packagesV3 = {
  // الترتيب من بداية الشريط في الفيجما (XPEL على الطرف)
  cards: [
    {
      provider: "xpel",
      media: "pkg-new-car",
      discount: 14,
      chip: pkgChip(3),
      category: { icon: "package", label: t("باقة · PPF + نانو + تظليل", "Package · PPF + nano + tint") },
      title: t("باقة السيارة الجديدة", "New car package"),
      specs: [{ icon: "package", label: svc(3) }, { icon: "clock", label: t("يومان", "2 days") }, instant],
      price: 7800,
      old_price: 9100,
      categories: ["new-car", "protection"],
    },
    {
      provider: "johnson",
      media: "pkg-ceramic-pro",
      discount: 16,
      chip: pkgChip(2),
      category: { icon: "package", label: t("باقة · نانو سيراميك + تلميع", "Package · nano ceramic + polish") },
      title: t("باقة Johnson Ceramic Pro", "Johnson Ceramic Pro package"),
      specs: [{ icon: "package", label: svc(2) }, { icon: "clock", label: t("يوم واحد", "1 day") }, instant],
      price: 1899,
      old_price: 2250,
      package_slug: "johnson-ceramic-pro",
      categories: ["polish", "new-car"],
    },
    {
      provider: "llumar",
      media: "pkg-protection",
      discount: 15,
      chip: pkgChip(2),
      category: { icon: "package", label: t("باقة · PPF + تظليل", "Package · PPF + tint") },
      title: t("باقة الحماية والتظليل", "Protection & tinting package"),
      specs: [{ icon: "package", label: svc(2) }, { icon: "clock", label: t("يومان", "2 days") }, instant],
      price: 4950,
      old_price: 5850,
      categories: ["protection"],
    },
    {
      provider: "nanoshield",
      media: "pkg-monthly",
      discount: 18,
      chip: pkgChip(3),
      category: { icon: "package", label: t("باقة · غسيل + تلميع + نانو", "Package · wash + polish + nano") },
      title: t("باقة العناية الشهرية", "Monthly care package"),
      specs: [{ icon: "package", label: svc(3) }, { icon: "clock", label: t("يوم واحد", "1 day") }, instant],
      price: 1690,
      old_price: 2070,
      categories: ["wash", "polish"],
    },
    {
      provider: "johnson",
      media: "pkg-ceramic-pro",
      discount: 14,
      chip: pkgChip(3),
      category: { icon: "package", label: t("باقة · حماية + تلميع + تفصيل", "Package · protection + polish + detailing") },
      title: t("باقة العناية الكاملة", "Complete care package"),
      specs: [{ icon: "package", label: svc(3) }, { icon: "clock", label: t("8 ساعات", "8 hours") }, instant],
      price: 1499,
      old_price: 1748,
      categories: ["wash", "polish"],
    },
  ] satisfies (ListingItem & { categories: PackageCategory[] })[],
};

// ---------------------------------------------------------------- V2-01 · التطبيق (85:30107)
export const appBand = {
  overline: t("تطبيق لينكار", "Linkar app"),
  // V2-01
  title_1: t("لينكار في جيبك", "Linkar in your pocket"),
  title_2: t("احجز، ادفع، وتابع", "Book, pay and follow"),
  description: t(
    "احجز من جوالك في دقائق: قارن مقدّمي الخدمة، ادفع بلمسة، وتابع سيارتك حتى الاستلام — مع قسائمك وضماناتك في مكان واحد.",
    "Book from your phone in minutes: compare providers, pay with a tap and follow your car until pickup — with your vouchers and warranties in one place.",
  ),
  description_t: t("احجز من جوالك في دقائق: قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً.", "Book from your phone in minutes: compare providers, pay with a tap and get your voucher instantly."),
  description_m: t(
    "قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً، مع قسائمك وضماناتك في مكان واحد.",
    "Compare providers, pay with a tap and get your voucher instantly, with your vouchers and warranties in one place.",
  ),
  // الترتيب من بداية السطر (صفّين) — glyph = أيقونة التابلت/الموبايل (UI icon على مربع ليموني)
  features: [
    { icon: "brand-calendar-neon", glyph: "check" as const, title: t("تأكيد فوري للحجز", "Instant booking confirmation"), body: t("يتأكد حجزك لحظة الدفع", "Your booking is confirmed the moment you pay") },
    { icon: "feature-payment-neon", glyph: "card" as const, title: t("ادفع خلال ثوانٍ", "Pay in seconds"), body: t("مدى وApple Pay وSTC Pay والبطاقات", "mada, Apple Pay, STC Pay and cards") },
    { icon: "brand-car-neon", glyph: "car" as const, title: t("تتبّع حالة سيارتك", "Track your car’s status"), body: t("وصلت · بدأ العمل · جاهزة", "Arrived · work started · ready") },
    { icon: "feature-gift-neon", glyph: "gift" as const, title: t("هداياك وضماناتك", "Your gifts and warranties"), body: t("كل القسائم والضمانات في مكان واحد", "All vouchers and warranties in one place") },
  ],
  chips: {
    accepted: t("تم تأكيد حجزك — قسيمتك جاهزة", "Your booking is confirmed — your voucher is ready"),
    gift: t("هديتك من الوكالة وصلت", "Your dealer gift has arrived"),
    tracking: t("بدأ العمل على سيارتك · 3:10 م", "Work on your car has started · 3:10 PM"),
  },
  scan: t("امسح للتحميل", "Scan to download"),
  platforms: t("آيفون وأندرويد", "iPhone and Android"),
  phones_alt: t("شاشات تطبيق لينكار: الرئيسية وقسيمة الحجز", "Linkar app screens: home and booking voucher"),
};

// ---------------------------------------------------------------- V2-01 · آراء العملاء (85:30340)
export const reviewsBand = {
  head: {
    overline: t("آراء العملاء", "Customer reviews"),
    title: t("تجارب حقيقية من حجوزات مكتملة", "Real experiences from completed bookings"),
    description: t(
      "لا يستطيع أحد التقييم إلا بعد استلام سيارته من مقدّم الخدمة — لذلك تثق بما تقرأ.",
      "No one can leave a review until they’ve picked up their car from the provider — so you can trust what you read.",
    ),
  } satisfies Head,
  summary: t("تقييمات موثّقة من عملاء حقيقيين", "Verified reviews from real customers"),
  summary_note: t("بعد حجوزات مكتملة فقط", "After completed bookings only"),
  of5: t("من 5", "of 5"),
  // الترتيب من بداية السطر؛ الكارت الغامق هو التاني
  items: [
    {
      rating: 5,
      text: t("خدمة ممتازة والتزام بالموعد. الفيلم نظيف بدون فقاعات، والتعامل راقٍ جداً. أنصح به.", "Excellent service and right on time. The film is clean with no bubbles and the staff were very professional. Recommended."),
      name: t("عبدالله ع.", "Abdullah A."),
      initial: t("ع", "A"),
      service: t("تظليل · لومار LLumar", "Tinting · LLumar"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل 3 أيام", "3 days ago"),
    },
    {
      rating: 5,
      text: t("شفت السعر لسيارتي قبل الدفع بدون مفاجآت، واستلمت السيارة في الموعد بالضبط.", "I saw the price for my car before paying, no surprises, and got the car back exactly on time."),
      name: t("نورة س.", "Noura S."),
      initial: t("ن", "N"),
      service: t("تلميع · مركز لمعة للتلميع", "Polishing · Lamaa Polishing Center"),
      car: t("هيونداي توسان 2024", "Hyundai Tucson 2024"),
      date: t("قبل أسبوع", "1 week ago"),
    },
    {
      rating: 4,
      text: t(
        "قارنت بين أكثر من مقدّم خدمة لنفس الخدمة، واخترت الأنسب لسعري وسيارتي. الحجز تأكد مباشرة بعد الدفع.",
        "I compared several providers for the same service and picked the best fit for my budget and car. The booking was confirmed right after payment.",
      ),
      name: t("فهد م.", "Fahad M."),
      initial: t("ف", "F"),
      service: t("نانو سيراميك · جونسون Johnson", "Nano ceramic · Johnson"),
      car: t("لكزس ES 2022", "Lexus ES 2022"),
      date: t("قبل أسبوعين", "2 weeks ago"),
    },
    {
      rating: 4,
      text: t("الشغل نظيف والتزموا بالموعد بالضبط. السعر اللي شفته في لينكار هو نفسه اللي دفعته.", "Clean work and exactly on time. The price I saw on Linkar is exactly what I paid."),
      name: t("سلطان ع.", "Sultan A."),
      initial: t("س", "S"),
      service: t("نانو سيراميك · جونسون Johnson", "Nano ceramic · Johnson"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل 3 أيام", "3 days ago"),
    },
    {
      rating: 4,
      text: t("المقاعد رجعت كأنها جديدة، والفريق شرح لي طريقة العناية بعد الخدمة.", "The seats look brand new, and the team explained how to care for them afterwards."),
      name: t("هند م.", "Hind M."),
      initial: t("ه", "H"),
      service: t("تفصيل داخلي كامل · جونسون Johnson", "Full interior detailing · Johnson"),
      car: t("لكزس ES 2022", "Lexus ES 2022"),
      date: t("قبل أسبوع", "1 week ago"),
    },
    {
      rating: 4,
      text: t("غسيل ممتاز وسريع، والتزموا بالموعد تماماً. الداخلية نظيفة جداً.", "Excellent, quick wash and fully on time. The interior is spotless."),
      name: t("محمد س.", "Mohammed S."),
      initial: t("م", "M"),
      service: t("غسيل خارجي وداخلي · مغاسل بريق", "Exterior & interior wash · Bareeq"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل أسبوعين", "2 weeks ago"),
    },
  ],
};

// ---------------------------------------------------------------- V2-01 · باقات الوكالات (85:30520)
export const dealerBand = {
  badge: t("باقات وكالات السيارات", "Car dealer packages"),
  title_1: t("اشتريت سيارة جديدة؟", "Bought a new car?"),
  title_2: t("قد تكون باقتك بانتظارك", "Your package may be waiting"),
  body: t(
    "تبيع وكالات السيارات لعملائها باقات عناية من مقدّمي خدمة معتمدين عبر لينكار. سجّل دخولك برقم الجوال المسجّل لدى الوكالة، وستجد باقتك في حسابك مع قسيمتها والفرع المحدد — ثم زر الفرع واعرض القسيمة.",
    "Car dealers sell their customers care packages from certified providers through Linkar. Sign in with the mobile number registered with the dealer and you’ll find your package in your account with its voucher and branch — then visit the branch and show the voucher.",
  ),
  body_t: t(
    "سجّل دخولك برقم الجوال المسجّل لدى الوكالة، وستجد باقتك في حسابك مع قسيمتها والفرع المحدد، ثم زر الفرع واعرض القسيمة.",
    "Sign in with the mobile number registered with the dealer and you’ll find your package in your account with its voucher and branch, then visit the branch and show the voucher.",
  ),
  body_m: t(
    "سجّل دخولك برقم الجوال المسجّل لدى الوكالة، وستجد باقتك في حسابك مع قسيمتها والفرع المحدد.",
    "Sign in with the mobile number registered with the dealer and you’ll find your package in your account with its voucher and branch.",
  ),
  step_label: t("الخطوة {n}", "Step {n}"),
  // الترتيب من بداية السطر
  steps: [
    { icon: "brand-mail-outline", title: t("تصلك رسالة من الوكالة", "You get a message from the dealer") },
    { icon: "brand-phone-outline", title: t("سجّل دخولك برقم جوالك", "Sign in with your mobile number") },
    { icon: "brand-calendar-outline", title: t("اختر مقدّم الخدمة والفرع", "Choose the provider and branch") },
  ],
  cta: t("اعرض باقاتك", "View your packages"),
  how: t("كيف تعمل باقات الوكالات؟", "How do dealer packages work?"),
  note: t("لا تُستخدم أي قسيمة إلا بعد التحقق من رقم الجوال المسجّل فى الوكالة.", "A voucher can only be used after the mobile number registered with the dealer is verified."),
  // بطاقات الهدايا في الرسم
  gift_from: t("باقة من", "Package from"),
  dealer_name: t("وكالة شريكة", "Partner dealer"),
  dealer_initial: t("ر", "P"),
  back_card: {
    status: t("محجوزة · الاثنين 12 أكتوبر", "Booked · Mon 12 Oct"),
    title: t("نانو سيراميك مجاني للهيكل", "Free body nano ceramic"),
    details: t("باقة عناية مع سيارتك الجديدة", "A care package with your new car"),
    validity: t("صالحة حتى 30 ديسمبر 2026", "Valid until 30 Dec 2026"),
  },
  front_card: {
    status: t("جاهزة للاستخدام", "Ready to use"),
    title: t("عزل حراري مجاني للزجاج كامل", "Free full-glass heat insulation"),
    details: t("باقة عناية مع سيارتك الجديدة", "A care package with your new car"),
    validity: t("صالحة 90 يوماً · لدى مقدّمي الخدمة المعتمدين", "Valid for 90 days · at certified providers"),
    cta: t("عرض القسيمة", "View voucher"),
  },
  lock: t("تظهر بعد التحقق من رقمك", "Shown after your number is verified"),
  // Partners (37:28236) — بلاطات لوجوهات الوكالات تحت اللوحة؛ الترتيب من بداية السطر؛ w/h = مقاس اللوجو جوه البلاطة (243×88)
  dealers: [
    { name: "Abdul Latif Jameel", src: "abdul-latif-jameel.png", w: 140, h: 33 },
    { name: "Petromin", src: "petromin.svg", w: 55, h: 54 },
    { name: "Toyota", src: "toyota.svg", w: 140, h: 23 },
    { name: "Hyundai", src: "hyundai.svg", w: 140, h: 18 },
    { name: "Nissan", src: "nissan.svg", w: 120, h: 27 },
  ],
};

// ---------------------------------------------------------------- عناوين الأقسام المستخدمة كمراجع (#)
export const anchors = { forYou: "for-you", services: "services-explorer", app: "app" };
