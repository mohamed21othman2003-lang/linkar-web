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
  title: t("اخترناها لك حسب موقعك وتجاربك", "Picked for you"),
  // الزائر والعميل الجديد: مافيش تجارب لسه — الترشيح حسب الموقع بس (ملاحظة 85:30647)
  title_guest: t("اخترناها لك حسب موقعك", "Picked for you by your location"),
  near: t("قريب من:", "Near:"),
  change: t("تغيير", "Change"),
  hint: t("تتغير الترشيحات بعد كل حجز وتقييم بما يناسب تجربتك", "Picks update after every booking and review to match your experience"),
  // الترتيب من بداية السطر (يمين في العربي)
  picks: [
    {
      provider: "3m",
      kind: "returning",
      reason: t("لأنك حجزت خدمة التلميع من قبل", "You booked polishing before"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Top-rated by owners of cars like yours"),
    },
    {
      provider: "xpel",
      kind: "returning",
      reason: t("لأنك حجزت خدمة التلميع من قبل", "You booked polishing before"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Top-rated by owners of cars like yours"),
    },
    {
      provider: "llumar",
      kind: "location",
      reason: t("الأقرب إليك", "Nearest to you"),
      note: t("تقييم ممتاز من عملاء بسيارات مثل سيارتك", "Top-rated by owners of cars like yours"),
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
  location_reasons: [t("الأقرب إليك", "Nearest to you"), t("الأعلى تقييماً بالقرب منك", "Top rated near you")],
  location_note: t("قريب منك · {km} كم", "Near you · {km} km"),
};

// ---------------------------------------------------------------- كيف تعمل لينكار (85:29850)
export const howItWorks = {
  overline: t("كيف تعمل لينكار", "How Linkar works"),
  title: t("ابحث، قارن، اطلب، ثم قيّم", "Search, compare, book, then rate"),
  description: t(
    "ابحث عن خدماتك، وقارن بين مقدّمي الخدمة، واطلب وادفع في دقيقة، ثم قيّم تجربتك.",
    "Find your services, compare providers, book and pay in a minute, then rate your experience.",
  ),
  steps: [
    {
      title: t("ابحث", "Search"),
      // تابلت/موبايل (V2-01t/V2-01m): نسخة أقصر
      body_short: t("اكتب الخدمة أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.", "Type the service or a provider’s name, and we show you the closest to you."),
      body: t(
        "اكتب الخدمة أو الخدمات التي تحتاجها، أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.",
        "Type the services you need or a provider's name, and we show the nearest to you.",
      ),
    },
    {
      title: t("قارن", "Compare"),
      body_short: t("قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات.", "Compare prices for your car type, warranties and ratings."),
      body: t(
        "قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات، بين مقدّمي الخدمة أو بين خدماتهم.",
        "Compare prices for your car, warranties and reviews across providers or their services.",
      ),
    },
    {
      title: t("اطلب", "Book"),
      body_short: t("اختر الفرع وادفع إلكترونياً، وتصلك قسيمتك فوراً.", "Choose the branch and pay online, and your voucher arrives instantly."),
      body: t(
        "اختر الفرع وادفع إلكترونياً — مدى أو Apple Pay أو STC Pay أو البطاقة — وتصلك قسيمتك فوراً.",
        "Pick a branch and pay online — mada, Apple Pay, STC Pay or card — and get your voucher instantly.",
      ),
    },
    {
      title: t("قيّم", "Rate"),
      body_short: t("بعد اكتمال الخدمة قيّم تجربتك، ونتابع أي ملاحظة حتى الحل.", "Once the service is done, rate your experience and we follow up any issue until it’s resolved."),
      body: t(
        "بعد اكتمال الخدمة قيّم تجربتك، وتابع أي ملاحظة مع فريق لينكار حتى الحل.",
        "After the service, rate your experience and follow up any issue with the Linkar team until it is solved.",
      ),
    },
  ],
  // لوحة الرحلة (Responses visual) في V2-01
  journey: {
    chips: [t("التلميع", "Polishing"), t("نانو سيراميك", "Nano Ceramic")], // V2-EN
    best_price: t("الأفضل سعراً", "Best price"),
    compare: [
      { provider: "nanoshield", price: 1248, best: true },
      { provider: "johnson", price: 1899, best: false },
    ],
    paid: t("تم الدفع · BK-21452 · قسيمة صالحة 14 يوماً", "Paid · BK-21452 · voucher valid 14 days"),
    rate: t("قيّم واكسب 50 نقطة", "Rate and earn 50 points"),
    tags: [
      t("حجز مؤكد فور الدفع", "Confirmed as soon as you pay"),
      t("أسعار حسب نوع سيارتك", "Prices for your car type"),
      t("أكثر من خدمة في زيارة واحدة", "Several services in one visit"),
    ],
  },
  protect_link: t("كيف نحمي حقك؟", "How we protect you"),
  start: t("ابدأ الآن", "Start now"),
  guarantees: [t("حجز مؤكد فور الدفع", "Booking confirmed on payment"), t("ضمان موثّق في قسيمتك", "Warranty recorded in your voucher")],
};

// ---------------------------------------------------------------- V2-01 · الخدمات (85:30008)
export const servicesBand = {
  overline: t("خدماتنا", "Our services"),
  title: t("كل ما تحتاجه سيارتك في منصة واحدة", "Everything your car needs on one platform"),
  description: t(
    "لكل خدمة مراكز معتمدة تقارن بينها بالسعر لسيارتك والضمان والتقييمات.",
    "Every service has certified centers to compare by price for your car, warranty and reviews.",
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
      "Sorted by distance. Every provider on Linkar passed accreditation, and reviews come from completed bookings only.",
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
      title: t("ضمان الجودة واختبار المنتجات", "Quality assurance & product testing"),
      title_m: t("اختبار المنتجات", "Product testing"),
      body: t("نختبر المنتجات المستخدمة ونتأكد من مطابقتها للمواصفات", "We test the products used and verify they meet specs"),
      body_t: t("نختبر المنتجات ونتأكد من مطابقتها", "We test the products and make sure they match"),
    },
    {
      icon: "brand-car-neon",
      glyph: "check",
      title: t("تقييم ميداني وتصنيف", "Field evaluation & tier"),
      body: t("فريق لينكار يقيّم كل مركز ويصنّفه", "The Linkar team evaluates and tiers every center"),
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
      title: t("ضمان موثّق", "Documented warranty"),
      body: t("مسجّل برقم قسيمة الحجز", "Registered with your voucher number"),
    },
  ] as { icon: string; glyph: "package" | "check" | "star" | "gift"; title: Text; title_m?: Text; body: Text; body_t?: Text }[],
  all: t("الكل", "All"),
  // الكروت الأربعة في الفيجما (الترتيب من بداية السطر) — والشارة فوق الاسم لكل كارت
  featured: [
    { provider: "3m", tag: t("الأقرب إليك", "Nearest to you"), ai: false },
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
  // «احجز العرض/احجز» بيبدأ خطوة الحجز بخدمات العرض (L-0045) زي صفحة العروض
  services?: ServiceSlug[];
};
export const offersBand = {
  head: {
    overline: t("عروض مقدّمي الخدمة", "Provider offers"),
    title: t("عروض حصرية لفترة محدودة", "Exclusive limited-time offers"),
    description: t(
      "خصومات يقدّمها مقدّمو الخدمة مباشرة — السعر بعد الخصم واضح قبل أن تحجز.",
      "Discounts offered directly by providers — the final price is clear before you book.",
    ),
    description_t: t("خصومات يقدّمها مقدّمو الخدمة مباشرة، والسعر بعد الخصم واضح قبل أن تحجز.", "Discounts offered directly by providers, and the price after discount is clear before you book."),
    description_m: t("السعر بعد الخصم واضح قبل أن تحجز.", "The price after discount is clear before you book."),
    link: { ...t("كل العروض", "All offers"), href_key: "offers" },
  } satisfies Head,
  featured: {
    provider: "llumar",
    discount: 15,
    title: t("حماية PPF للواجهة مع نانو سيراميك", "Front PPF with nano ceramic"),
    services: ["ppf", "nano-ceramic"] as ServiceSlug[],
    price: 5950,
    old_price: 7000,
    // العدّاد في الفيجما: 02 يوم · 14 ساعة · 36 دقيقة
    ends_in_minutes: 2 * 1440 + 14 * 60 + 36,
  },
  cards: [
    {
      provider: "3m",
      discount: 15,
      title: [t("نانو سيراميك", "Nano Ceramic"), t("مع تظليل شامل", "With full tint")],
      features: [
        { icon: "clock", label: t("6 ساعات", "6 hours") },
        { icon: "warranty", label: t("ضمان 3 سنوات", "3-year warranty") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 2199,
      old_price: 3500,
      services: ["nano-ceramic", "tint"],
    },
    {
      provider: "xpel",
      discount: 15,
      title: [t("تظليل كامل للسيارة", "Full car tint"), t("مع غسيل مجاني لمدة شهر", "With a free wash for a month")],
      features: [
        { icon: "clock", label: t("4 ساعات", "4 hours") },
        { icon: "warranty", label: t("ضمان 5 سنوات", "5-year warranty") },
        { icon: "calendar", label: t("حجز فوري", "Instant booking") },
      ],
      price: 1399,
      old_price: 2500,
      services: ["tint"],
    },
  ] satisfies OfferItem[],
};

// ---------------------------------------------------------------- V2-01 · الباقات (85:30076)
export type PackageCategory = "protection" | "wash" | "polish" | "new-car";
export const packagesBand = {
  head: {
    overline: t("باقات مقدّمي الخدمة", "Provider packages"),
    title: t("باقات تجمع أكثر من خدمة بسعر أوفر", "Packages that bundle services for less"),
    description: t(
      "كل مقدّم خدمة يصمّم باقاته بنفسه — قارن محتوى الباقة وسعرها بسعر الخدمات منفردة وتقييم مقدّم الخدمة، ثم اطلبها بدفعة واحدة.",
      "Each provider designs its own packages — compare what is included and the price against single services and the provider's rating, then book in one payment.",
    ),
    description_t: t("كل مقدّم خدمة يصمّم باقاته بنفسه، وتُدفع مرة واحدة.", "Each provider designs its own packages, paid in one go."),
    description_m: t("كل باقة يصمّمها مقدّم الخدمة بنفسه، وتُدفع مرة واحدة.", "Every package is designed by the provider and paid in one go."),
    link: { ...t("كل الباقات", "All packages"), href_key: "packages" },
  } satisfies Head,
  all: t("كل الباقات", "All packages"),
  // الفلاتر — الترتيب من بداية السطر
  categories: [
    { slug: "protection", ...t("حماية وتظليل", "Protection & tint") },
    { slug: "wash", ...t("غسيل وعناية", "Wash & care") },
    { slug: "polish", ...t("تلميع وتجديد", "Polish & refresh") },
    { slug: "new-car", ...t("للسيارات الجديدة", "New cars") },
  ] as (Text & { slug: PackageCategory })[],
  prev: t("السابق", "Previous"),
  next: t("التالي", "Next"),
  // ⚠ تصنيف كل باقة تحت الفلاتر من عندنا (الفيجما مافيهاش ربط) — للمراجعة
  cards: [
    {
      provider: "xpel",
      discount: 14,
      title: [t("باقة السيارة الجديدة", "New Car Package"), t("PPF + نانو + تظليل", "PPF + Nano + Tint")],
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
      title: [t("باقة Johnson Ceramic Pro", "Nano Ceramic & Polish Package"), t("مع تلميع مجاني", "With free polishing")],
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
      title: [t("باقة الحماية والتظليل", "Protection & Tint Package"), t("PPF + تظليل كامل", "PPF + full tint")],
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
      title: [t("باقة العناية الشهرية", "Monthly Care Package"), t("غسيل وتلميع ونانو سيراميك", "Wash, polish & nano ceramic")],
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
      title: [t("باقة العناية الكاملة", "Full Care Package"), t("طاردة للماء + تلميع + تفصيل", "Water-repellent + polish + detailing")],
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

// ---------------------------------------------------------------- V2-01 · التطبيق (202:7679)
export const appBand = {
  overline: t("تطبيق لينكار", "Linkar app"),
  title_1: t("لينكار في جيبك", "Linkar in your pocket"),
  title_2: t("احجز، ادفع، وتابع", "Book, pay and follow up"),
  description: t(
    "احجز من جوالك في دقائق: قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً — مع قسائمك وضماناتك في مكان واحد.",
    "Book from your phone in minutes: compare providers, pay with a tap and get your voucher instantly — with all your vouchers and warranties in one place.",
  ),
  description_t: t("احجز من جوالك في دقائق: قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً.", "Book from your phone in minutes: compare providers, pay with a tap and get your voucher instantly."),
  description_m: t(
    "قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً، مع قسائمك وضماناتك في مكان واحد.",
    "Compare providers, pay with a tap and get your voucher instantly, with your vouchers and warranties in one place.",
  ),
  // الترتيب من بداية السطر (صفّين) — glyph = أيقونة التابلت/الموبايل (UI icon على مربع ليموني)
  features: [
    { icon: "brand-calendar-neon", glyph: "check" as const, title: t("تأكيد فوري للحجز", "Instant confirmation"), body: t("يتأكد حجزك لحظة الدفع", "Your booking is confirmed the moment you pay") },
    { icon: "feature-payment-neon", glyph: "card" as const, title: t("ادفع خلال ثوانٍ", "Pay in seconds"), body: t("مدى، Apple Pay، STC Pay والبطاقات", "mada, Apple Pay, STC Pay and cards") },
    { icon: "brand-car-neon", glyph: "qr" as const, title: t("قسيمتك على جوالك", "Your voucher on your phone"), body: t("صالحة 14 يوماً · تعرضها في الفرع", "Valid 14 days · show it at the branch") },
    { icon: "feature-gift-neon", glyph: "gift" as const, title: t("باقاتك وضماناتك", "Your packages & warranties"), body: t("كل القسائم والضمانات في مكان واحد", "All vouchers and warranties in one place") },
  ],
  chips: {
    accepted: t("تم تأكيد حجزك — قسيمتك جاهزة", "Booking confirmed — your voucher is ready"),
    gift: t("باقتك من الوكالة وصلت", "Your dealer package has arrived"),
    tracking: t("تم تأكيد حجزك وإرسال القسيمة", "Booking confirmed and voucher sent"),
  },
  scan: t("امسح للتحميل", "Scan to download"),
  phones_alt: t("شاشات تطبيق لينكار: الرئيسية وقسيمة الحجز", "Linkar app screens: home and booking voucher"),
};

// ---------------------------------------------------------------- V2-01 · آراء العملاء (202:7912)
export const reviewsBand = {
  head: {
    overline: t("آراء العملاء", "Customer reviews"),
    title: t("تجارب حقيقية من حجوزات مكتملة", "Real experiences from completed bookings"),
    description: t(
      "لا يمكنك التقييم إلا بعد استلام سيارتك من مقدم الخدمة.",
      "You can only review after collecting your car from the provider.",
    ),
    // تابلت/موبايل (V2-01t/V2-01m): «مقدّم» بالشدّة
    description_t: t("لا يمكنك التقييم إلا بعد استلام سيارتك من مقدّم الخدمة.", "You can only review after collecting your car from the provider."),
  } satisfies Head,
  summary: t("تقييمات موثّقة من عملاء حقيقيين", "Verified reviews from real customers"),
  of5: t("من 5", "of 5"),
  // الترتيب من بداية السطر؛ الكارت الغامق هو التاني
  items: [
    {
      rating: 5,
      text: t("خدمة ممتازة ودقيقة. الفيلم نظيف بدون فقاعات، والتعامل راقٍ جداً. أنصح به.", "Excellent, precise work. Clean film with no bubbles and very professional staff. Recommended."),
      name: t("عبدالله ع.", "Abdullah A."),
      initial: t("ع", "A"),
      service: t("تظليل · لومار LLumar", "Tinting · LLumar"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل 3 أيام", "3 days ago"),
    },
    {
      rating: 5,
      text: t("شفت السعر لسيارتي قبل الدفع بدون مفاجآت، ودفعت نفس المبلغ بالضبط.", "I saw my car's price before paying — no surprises, I paid exactly that amount."),
      name: t("نورة س.", "Noura S."),
      initial: t("ن", "N"),
      service: t("تلميع · مركز لمعة للتلميع", "Polishing · Lamaa Center"),
      car: t("هيونداي توسان 2024", "Hyundai Tucson 2024"),
      date: t("قبل أسبوع", "1 week ago"),
    },
    {
      rating: 4,
      text: t(
        "قارنت بين أكثر من مقدّم خدمة لنفس الخدمة، واخترت الأنسب لسعري وسيارتي. الحجز تأكد مباشرة بعد الدفع.",
        "I compared several providers for the same service and picked the best for my budget and car. The booking was confirmed right after payment.",
      ),
      name: t("فهد م.", "Fahad M."),
      initial: t("ف", "F"),
      service: t("نانو سيراميك · جونسون Johnson", "Nano ceramic · Johnson"),
      car: t("لكزس ES 2022", "Lexus ES 2022"),
      date: t("قبل أسبوعين", "2 weeks ago"),
    },
    {
      rating: 4,
      text: t("الشغل نظيف ومرتب، والسعر اللي شفته في لينكار هو نفسه اللي دفعته.", "Clean, tidy work — and the price I saw on Linkar is exactly what I paid."),
      name: t("سلطان ع.", "Sultan A."),
      initial: t("س", "S"),
      service: t("نانو سيراميك · جونسون Johnson", "Nano ceramic · Johnson"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل 3 أيام", "3 days ago"),
    },
    {
      rating: 4,
      text: t("المقاعد رجعت كأنها جديدة، والفريق شرح لي طريقة العناية بعد الخدمة.", "The seats look brand new, and the team explained aftercare to me."),
      name: t("هند م.", "Hind M."),
      initial: t("ه", "H"),
      service: t("تنظيف داخلي عميق · جونسون Johnson", "Full interior detailing · Johnson"),
      car: t("لكزس ES 2022", "Lexus ES 2022"),
      date: t("قبل أسبوع", "1 week ago"),
    },
    {
      rating: 4,
      text: t("غسيل ممتاز ودقيق، والداخلية نظيفة جداً.", "Excellent, thorough wash — the interior is spotless."),
      name: t("محمد س.", "Mohammed S."),
      initial: t("م", "M"),
      service: t("غسيل شامل · خارجي وداخلي · مغاسل بريق", "Exterior & interior wash · Bareeq"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل أسبوعين", "2 weeks ago"),
    },
  ],
};

// ---------------------------------------------------------------- V2-01 · باقات الوكالات (202:8092)
export const dealerBand = {
  badge: t("باقات وكالات السيارات", "Car dealer packages"),
  title_1: t("اشتريت سيارة جديدة؟", "Bought a new car?"),
  title_2: t("قد تكون باقتك بانتظارك", "Your package may be waiting"),
  body: t(
    "تبيع وكالات السيارات لعملائها باقات عناية من مقدّمي خدمة معتمدين عبر لينكار. سجّل دخولك برقم الجوال المسجّل لدى الوكالة، وستجد باقتك في حسابك مع قسيمتها والفرع المحدد — ثم زر الفرع واعرض القسيمة.",
    "Car dealers sell their customers care packages from certified providers through Linkar. Sign in with the mobile number registered at the dealer to find your package, voucher and branch — then visit and show the voucher.",
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
    { icon: "brand-mail-outline", title: t("تصلك رسالة من الوكالة", "Get a message from the dealer") },
    { icon: "brand-phone-outline", title: t("سجّل دخولك برقم جوالك", "Sign in with your mobile") },
    { icon: "brand-calendar-outline", title: t("اختر مقدّم الخدمة والفرع", "Choose provider and branch") },
  ],
  cta: t("اعرض باقاتك", "View your packages"),
  how: t("كيف تعمل باقات الوكالات؟", "How do dealer packages work?"),
  note: t("لا تُستخدم أي قسيمة إلا بعد التحقق من رقم الجوال المسجّل فى الوكالة.", "No voucher can be used before verifying the mobile number registered at the dealer."),
  // بطاقات الهدايا في الرسم
  gift_from: t("باقة من", "Package from"),
  dealer_name: t("وكالة شريكة", "Partner dealer"),
  dealer_initial: t("ر", "R"),
  back_card: {
    status: t("محجوزة · الاثنين 12 أكتوبر", "Booked · Mon 12 Oct"),
    title: t("نانو سيراميك مجاني للهيكل", "Free body nano ceramic"),
    details: t("باقة عناية مع سيارتك الجديدة", "Care package with your new car"),
    validity: t("صالحة حتى 30 ديسمبر 2026", "Valid until 30 Dec 2026"),
  },
  front_card: {
    status: t("جاهزة للاستخدام", "Ready to use"),
    title: t("عزل حراري مجاني للزجاج كامل", "Free full-glass heat insulation"),
    details: t("باقة عناية مع سيارتك الجديدة", "Care package with your new car"),
    validity: t("صالحة 90 يوماً · لدى مقدّمي الخدمة المعتمدين", "Valid 90 days · at certified providers"),
    cta: t("عرض القسيمة", "View voucher"),
  },
  lock: t("تظهر بعد التحقق من رقمك", "Appears after verifying your number"),
};

// ---------------------------------------------------------------- عناوين الأقسام المستخدمة كمراجع (#)
export const anchors = { forYou: "for-you", services: "services-explorer", app: "app" };
