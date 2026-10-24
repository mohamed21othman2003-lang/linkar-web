// محتوى الصفحة الرئيسية — V2-01 (557:2، العميل المسجّل) و V2-02 (600:2964، الزائر)
// + الهيرو «v2 · Hero · Linkar» (1314:898) والهيرو الإنجليزي (1315:343728)
// + نافذة الموقع أول زيارة (658:2075) + قائمة نوع السيارة P-17 (1443:392248).
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا (ما عدا الهيرو: من الفريم الإنجليزي).
import type { Localized } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/data/types";

export type Text = Localized<"text">;
type Head = { overline: Text; title: Text; description?: Text; link?: Text & { href_key: LinkKey } };

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
  // أسماء الخدمات في مربعات الهيرو (الإنجليزي من 1315:343728)
  tiles: {
    wash: t("الغسيل", "Wash"),
    ppf: t("حماية PPF", "PPF Protection"),
    tint: t("التظليل", "Tinting"),
    polish: t("التلميع", "Polishing"),
    "nano-ceramic": t("نانو سيراميك", "Nano Ceramic"),
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

// ---------------------------------------------------------------- V2-01 · اخترنا لك (597:2899)
export type PickItem = {
  provider: string;
  // returning = «لأنك حجزت…» (للعميل العائد فقط — ملاحظة 585:1601)، location = حسب الموقع، ai = ترشيح الذكاء الاصطناعي
  kind: "returning" | "location" | "ai";
  reason: Text;
  note: Text;
};
export const forYou = {
  overline: t("ترشيحات لينكار الذكية", "Linkar smart picks"),
  title: t("اخترنا لك حسب موقعك وتجاربك", "Picked for you by your location and history"),
  near: t("قريب من:", "Near:"),
  change: t("تغيير", "Change"),
  hint: t("تتحسّن الترشيحات مع كل حجز وتقييم", "Picks get better with every booking and review"),
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
  // الزائر/العميل الجديد يرى مكان «لأنك حجزت…» ترشيحاً حسب موقعه (585:1601)
  location_reason: t("الأقرب إليك", "Closest to you"),
};

// ---------------------------------------------------------------- كيف يعمل لينكار (V2-01 557:18 · V2-02 619:2045)
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
      body: t(
        "اكتب الخدمة أو الخدمات التي تحتاجها، أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.",
        "Type the service or services you need, or a provider’s name, and we show you the closest to your location.",
      ),
    },
    {
      title: t("قارن", "Compare"),
      body: t(
        "قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات، بين مقدّمي الخدمة أو بين خدماتهم.",
        "Compare prices for your car type, warranties and ratings, across providers or across their services.",
      ),
    },
    {
      title: t("اطلب", "Order"),
      body: t(
        "اختر الفرع وادفع إلكترونياً — مدى أو Apple Pay أو STC Pay أو البطاقة — وتصلك قسيمتك فوراً.",
        "Choose the branch and pay online — mada, Apple Pay, STC Pay or card — and your voucher arrives instantly.",
      ),
    },
    {
      title: t("قيّم", "Rate"),
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

// ---------------------------------------------------------------- V2-01 · الخدمات (557:3)
export const servicesBand: Head = {
  overline: t("خدماتنا", "Our services"),
  title: t("كل ما تحتاجه سيارتك في مكان واحد", "Everything your car needs in one place"),
  description: t(
    "لكل خدمة مقدّمو خدمة معتمدون تقارن بينهم بالسعر لسيارتك والضمان والتقييمات.",
    "Every service has certified providers you can compare by price for your car, warranty and ratings.",
  ),
  link: { ...t("كل الخدمات", "All services"), href_key: "services" },
};

// ---------------------------------------------------------------- V2-01 · مقدّمو الخدمة (557:105)
export const providersBand = {
  head: {
    overline: t("قريبون منك · حي الروضة، جدة", "Near you · Al Rawdah, Jeddah"),
    title: t("مقدّمو خدمة معتمدون قريبون منك", "Certified providers near you"),
    description: t(
      "مرتّبون حسب المسافة من موقعك. كل مقدّم خدمة على لينكار اجتاز الاعتماد، وتقييماته من حجوزات مكتملة فقط.",
      "Sorted by distance from you. Every provider on Linkar passed certification, and their ratings come from completed bookings only.",
    ),
    link: { ...t("عرض كل مقدّمي الخدمة", "View all providers"), href_key: "providers" },
  } satisfies Head,
  certs: [
    {
      icon: "brand-shield-neon",
      title: t("ضمان الجودة واختبار المنتجات", "Quality assurance and product testing"),
      body: t("نختبر المنتجات المستخدمة ونتأكد من مطابقتها للمواصفات", "We test the products used and make sure they meet the specs"),
    },
    {
      icon: "brand-car-neon",
      title: t("تقييم ميداني وتصنيف", "On-site review and grading"),
      body: t("فريق لينكار يقيّم كل مركز ويصنّفه", "The Linkar team reviews and grades every center"),
    },
    {
      icon: "brand-heart-neon",
      title: t("تقييمات حقيقية", "Real reviews"),
      body: t("من حجوزات مكتملة فقط", "From completed bookings only"),
    },
    {
      icon: "brand-shield-neon",
      title: t("ضمان موثّق", "Recorded warranty"),
      body: t("مسجّل برقم قسيمة الحجز", "Registered under the booking voucher number"),
    },
  ],
  all: t("الكل", "All"),
  // الكروت الأربعة في الفيجما (الترتيب من بداية السطر) — والشارة فوق الاسم لكل كارت
  featured: [
    { provider: "3m", tag: t("الأقرب إليك", "Closest to you"), ai: false },
    { provider: "xpel", tag: t("ضمان 10 سنوات", "10-year warranty"), ai: false },
    { provider: "llumar", tag: t("أفضل قيمة للتظليل", "Best value for tinting"), ai: false },
    { provider: "v-kool", tag: null, ai: true },
  ],
  more: t("ومقدّمو خدمة معتمدون آخرون على لينكار", "And more certified providers on Linkar"),
  // جدار الشعارات (Logo wall) — الترتيب من بداية السطر
  logo_wall: [
    "v-kool", "johnson", "nanoshield", "golden-wash", "crystal", "3seven", "autoshabo", "autoplus", "zipart",
    "carpro", "viper", "suntek", "feynlab", "wraptek", "armor", "nanox", "dir",
  ],
};

// ---------------------------------------------------------------- V2-01 · العروض (557:149)
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

// ---------------------------------------------------------------- V2-01 · الباقات (557:183)
export type PackageCategory = "protection" | "wash" | "polish" | "new-car";
export const packagesBand = {
  head: {
    overline: t("باقات مقدّمي الخدمة", "Provider packages"),
    title: t("باقات تجمع أكثر من خدمة بسعر أوفر", "Packages that bundle several services for less"),
    description: t(
      "كل مقدّم خدمة يصمّم باقاته بنفسه — قارن محتوى الباقة وسعرها بسعر الخدمات منفردة وتقييم مقدّم الخدمة، ثم اطلبها بدفعة واحدة.",
      "Each provider designs its own packages — compare what’s inside and the price with the services on their own and the provider’s rating, then order it in one payment.",
    ),
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

// ---------------------------------------------------------------- قسم التطبيق (V2-01 557:210 · V2-02 619:2123)
export const appBand = {
  overline: t("تطبيق لينكار", "Linkar app"),
  // V2-01
  title_1: t("لينكار في جيبك", "Linkar in your pocket"),
  title_2: t("احجز، ادفع، وتابع", "Book, pay and follow"),
  description: t(
    "احجز من جوالك في دقائق: قارن مقدّمي الخدمة، ادفع بلمسة، واستلم قسيمتك فوراً — مع قسائمك وضماناتك في مكان واحد.",
    "Book from your phone in minutes: compare providers, pay with a tap and get your voucher instantly — with your vouchers and warranties in one place.",
  ),
  // الترتيب من بداية السطر (صفّين)
  features: [
    { icon: "brand-calendar-neon", title: t("تأكيد فوري للحجز", "Instant booking confirmation"), body: t("يتأكد حجزك لحظة الدفع", "Your booking is confirmed the moment you pay") },
    { icon: "feature-payment-neon", title: t("ادفع خلال ثوانٍ", "Pay in seconds"), body: t("مدى، Apple Pay، STC Pay والبطاقات", "mada, Apple Pay, STC Pay and cards") },
    { icon: "brand-car-neon", title: t("قسيمتك على جوالك", "Your voucher on your phone"), body: t("صالحة 14 يوماً · تعرضها في الفرع", "Valid for 14 days · show it at the branch") },
    { icon: "feature-gift-neon", title: t("باقاتك وضماناتك", "Your packages and warranties"), body: t("كل القسائم والضمانات في مكان واحد", "All vouchers and warranties in one place") },
  ],
  chips: {
    accepted: t("تم تأكيد حجزك — قسيمتك جاهزة", "Your booking is confirmed — your voucher is ready"),
    gift: t("باقتك من الوكالة وصلت", "Your dealer package has arrived"),
    tracking: t("تم تأكيد حجزك وإرسال القسيمة", "Booking confirmed and voucher sent"),
  },
  scan: t("امسح للتحميل", "Scan to download"),
  platforms: t("آيفون وأندرويد", "iPhone and Android"),
  phones_alt: t("شاشات تطبيق لينكار: الرئيسية وقسيمة الحجز", "Linkar app screens: home and booking voucher"),
  // V2-02
  guest_description: t("احجز وادفع، واحتفظ بقسائمك وضماناتك في مكان واحد.", "Book and pay, and keep your vouchers and warranties in one place."),
  guest_points: [
    { icon: "brand-calendar-dark", text: t("حجز مؤكد فوراً من جوالك", "Instant confirmed booking from your phone") },
    { icon: "brand-car-dark", text: t("قسيمتك على جوالك فور الدفع", "Your voucher on your phone right after payment") },
    { icon: "brand-shield-dark", text: t("قسائمك وضماناتك في مكان واحد", "Your vouchers and warranties in one place") },
  ],
};

// ---------------------------------------------------------------- V2-01 · آراء العملاء (557:286)
export const reviewsBand = {
  head: {
    overline: t("آراء العملاء", "Customer reviews"),
    title: t("تجارب حقيقية من حجوزات مكتملة", "Real experiences from completed bookings"),
    description: t("لا يمكنك التقييم إلا بعد استلام سيارتك من مقدم الخدمة.", "You can only leave a review after picking up your car from the provider."),
  } satisfies Head,
  summary: t("تقييمات موثّقة من عملاء حقيقيين", "Verified reviews from real customers"),
  of5: t("من 5", "of 5"),
  // الترتيب من بداية السطر؛ الكارت الغامق هو التاني
  items: [
    {
      rating: 5,
      text: t("خدمة ممتازة ودقيقة. الفيلم نظيف بدون فقاعات، والتعامل راقٍ جداً. أنصح به.", "Excellent, precise work. The film is clean with no bubbles and the staff were very professional. Recommended."),
      name: t("عبدالله ع.", "Abdullah A."),
      initial: t("ع", "A"),
      service: t("تظليل · لومار LLumar", "Tinting · LLumar"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل 3 أيام", "3 days ago"),
    },
    {
      rating: 5,
      text: t("شفت السعر لسيارتي قبل الدفع بدون مفاجآت، ودفعت نفس المبلغ بالضبط.", "I saw the price for my car before paying, no surprises, and paid exactly that amount."),
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
      text: t("الشغل نظيف ومرتب، والسعر اللي شفته في لينكار هو نفسه اللي دفعته.", "Clean, tidy work, and the price I saw on Linkar is exactly what I paid."),
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
      text: t("غسيل ممتاز ودقيق، والداخلية نظيفة جداً.", "Excellent, thorough wash, and the interior is spotless."),
      name: t("محمد س.", "Mohammed S."),
      initial: t("م", "M"),
      service: t("غسيل خارجي وداخلي · مغاسل بريق", "Exterior & interior wash · Bareeq"),
      car: t("تويوتا كامري 2023", "Toyota Camry 2023"),
      date: t("قبل أسبوعين", "2 weeks ago"),
    },
  ],
};

// ---------------------------------------------------------------- V2-01 · باقات الوكالات (557:305)
export const dealerBand = {
  badge: t("باقات وكالات السيارات", "Car dealer packages"),
  title_1: t("اشتريت سيارة جديدة؟", "Bought a new car?"),
  title_2: t("قد تكون باقتك بانتظارك", "Your package may be waiting"),
  body: t(
    "تبيع وكالات السيارات لعملائها باقات عناية من مقدّمي خدمة معتمدين عبر لينكار. سجّل دخولك برقم الجوال المسجّل لدى الوكالة، وستجد باقتك في حسابك مع قسيمتها والفرع المحدد — ثم زر الفرع واعرض القسيمة.",
    "Car dealers sell their customers care packages from certified providers through Linkar. Sign in with the mobile number registered with the dealer and you’ll find your package in your account with its voucher and branch — then visit the branch and show the voucher.",
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
};

// ---------------------------------------------------------------- V2-02 · مستكشف الخدمات (617:2027)
export const servicesExplorer = {
  head: {
    overline: t("خدماتنا", "Our services"),
    title: t("خدمات العناية بسيارتك، في مكان واحد", "Care services for your car, in one place"),
    description: t("اختر الخدمة لتعرف ما تقدّمه لسيارتك، ومن يقدّمها، وبكم تبدأ.", "Pick a service to see what it does for your car, who offers it and its starting price."),
    link: { ...t("كل الخدمات", "All services"), href_key: "services" },
  } satisfies Head,
  starts_from: t("يبدأ من", "From"),
  available_at: t("متوفرة لدى مقدّمي خدمة معتمدين", "Available at certified providers"),
  cta_providers: t("اعرض مقدّمي {name}", "Show {name} providers"),
  cta_about: t("عن خدمة {name}", "About {name}"),
  default: "tint" as ServiceSlug,
  // الخدمة المختارة في الفيجما (التظليل) هي الوحيدة اللي ليها تفاصيل كاملة؛
  // باقي الخدمات بتاخد الوصف من services.ts ومن غير «مميزات» لحد ما تتصمم.
  items: [
    { slug: "wash", sub: t("غسيل خارجي وداخلي", "Exterior and interior wash"), price: 45 },
    { slug: "ppf", sub: t("حماية الطلاء من الخدوش", "Protects the paint from scratches"), price: 799 },
    { slug: "tint", sub: t("عزل حراري وخصوصية", "Heat insulation and privacy"), price: 549 },
    { slug: "polish", sub: t("إزالة الخدوش الخفيفة", "Removes light scratches"), price: 349 },
    { slug: "nano-ceramic", sub: t("لمعان يدوم وطبقة طاردة للماء", "Lasting shine and a water-repellent layer"), price: 449 },
  ] as { slug: ServiceSlug; sub: Text; price: number }[],
  details: {
    tint: {
      popular: t("الأكثر طلباً", "Most requested"),
      description: t(
        "أفلام تظليل حرارية تخفّف حرارة المقصورة وتحجب الأشعة فوق البنفسجية، مع خصوصية أعلى داخل سيارتك.",
        "Heat-rejecting tint films that cool the cabin and block UV rays, with more privacy inside your car.",
      ),
      // الترتيب من بداية السطر
      benefits: [
        { icon: "service", text: t("حرارة أقل داخل المقصورة", "A cooler cabin") },
        { icon: "brand-shield-neon", text: t("حماية من الأشعة فوق البنفسجية", "UV protection") },
        { icon: "brand-car-neon", text: t("خصوصية ومظهر أنيق", "Privacy and a sleek look") },
      ],
      logos: ["xpel", "3m", "llumar", "v-kool", "nukhba", "3seven"],
    },
  } as Partial<Record<ServiceSlug, { popular?: Text; description: Text; benefits: { icon: string; text: Text }[]; logos: string[] }>>,
};

// ---------------------------------------------------------------- V2-02 · لماذا لينكار (618:1795)
export const featuresBand = {
  head: {
    overline: t("لماذا لينكار", "Why Linkar"),
    title: t("تجربة عناية بسيارتك، أوضح وأسهل", "A clearer, easier car care experience"),
    description: t(
      "من اختيار مقدّم الخدمة حتى استلام سيارتك، صمّمنا كل خطوة لتكون واضحة ومضمونة.",
      "From choosing a provider to picking up your car, we designed every step to be clear and guaranteed.",
    ),
  } satisfies Head,
  ai: {
    label: t("ترشيحات بالذكاء الاصطناعي", "AI recommendations"),
    title: t("دع الذكاء الاصطناعي يختار لك", "Let AI choose for you"),
    body: t(
      "يقترح عليك مقدّم الخدمة الأنسب حسب سيارتك وميزانيتك وموقعك، مع سبب واضح لكل ترشيح.",
      "It suggests the best provider for your car, budget and location, with a clear reason for every pick.",
    ),
    example_label: t("مثال: ترشيح للتظليل في جدة", "Example: a tinting pick in Jeddah"),
    example_provider: "nukhba",
    example_reason: t("أفضل مزيج بين السعر والجودة", "The best mix of price and quality"),
  },
  // عمودين بجانب كارت الذكاء الاصطناعي — الترتيب من بداية السطر
  columns: [
    [
      { icon: "feature-price-neon", title: t("أسعار واضحة قبل الحجز", "Clear prices before booking"), body: t("السعر النهائي لسيارتك شاملاً الضريبة، قبل أن تدفع.", "The final price for your car, VAT included, before you pay.") },
      { icon: "brand-calendar-neon", title: t("حجز مؤكد فوراً", "Instantly confirmed booking"), body: t("اختر الفرع وادفع، ويتأكد حجزك مباشرة.", "Choose the branch and pay, and your booking is confirmed right away.") },
    ],
    [
      { icon: "feature-voucher-neon", title: t("قسيمة رقمية", "Digital voucher"), body: t("قسيمة برمز QR تُظهرها لمقدّم الخدمة عند وصولك.", "A QR voucher you show the provider when you arrive.") },
      { icon: "brand-car-neon", title: t("تابع حجزك وقسيمتك", "Follow your booking and voucher"), body: t("تحديثات لحظية حتى تستلم سيارتك جاهزة.", "Live updates until you pick up your car ready.") },
    ],
  ],
  inline: [
    { icon: "brand-shield-neon", title: t("ضمان موثّق", "Recorded warranty"), body: t("موثّق برقم القسيمة، ونتابع أي شكوى حتى الحل.", "Recorded with the voucher number, and we follow up any complaint until it’s resolved."), light: false },
    { icon: "feature-payment-neon", title: t("دفع آمن ومرن", "Secure, flexible payment"), body: t("مدى، Apple Pay، STC Pay والبطاقات", "mada, Apple Pay, STC Pay and cards"), light: false },
    { icon: "feature-gift-neon", title: t("باقات وكالات السيارات", "Car dealer packages"), body: t("باقتك من وكالة سيارتك تظهر في حسابك تلقائياً.", "Your package from your car dealer shows up in your account automatically."), light: true },
    { icon: "feature-points-neon", title: t("نقاط مع كل حجز", "Points with every booking"), body: t("اجمع النقاط واستخدمها في حجزك القادم.", "Collect points and use them on your next booking."), light: false },
  ],
};

// ---------------------------------------------------------------- V2-02 · مقدّمو الخدمة (618:1894)
export const providersGuest = {
  head: {
    overline: t("قريبون منك · حي الروضة، جدة", "Near you · Al Rawdah, Jeddah"),
    title: t("مقدّمو خدمة معتمدون قريبون منك", "Certified providers near you"),
    description: t(
      "مرتّبون حسب المسافة من موقعك، وتخضع منتجاتهم لفحص الجودة ومطابقة المواصفات، وتقييماتهم من حجوزات مكتملة فقط.",
      "Sorted by distance from you; their products go through quality and spec checks, and their ratings come from completed bookings only.",
    ),
    link: { ...t("كل مقدّمي الخدمة", "All providers"), href_key: "providers" },
  } satisfies Head,
  view: t("عرض", "View"),
  // الترتيب من بداية السطر
  cards: [
    { provider: "bareeq", photo: "/figma/home/provider-bareeq.jpg", highlight: t("الأقرب إليك", "Closest to you") },
    { provider: "xpel", photo: "/figma/home/provider-xpel.jpg", highlight: t("ضمان حتى 10 سنوات", "Up to 10-year warranty") },
    { provider: "nukhba", photo: "/figma/home/provider-nukhba.jpg", highlight: t("متخصص في التظليل", "Tinting specialist") },
    { provider: "johnson", photo: "/figma/home/provider-johnson.jpg", highlight: t("الأعلى تقييماً", "Top rated") },
  ],
  more: t("وغيرهم من مقدّمي الخدمة المعتمدين على لينكار", "And more certified providers on Linkar"),
  // 3 صفوف × 7 — الترتيب من بداية السطر
  logo_grid: [
    "autoshabo", "lamaa", "3m", "3seven", "crystal", "golden-wash", "nanoshield",
    "carpro", "zipart", "stek", "autoplus", "johnson", "v-kool", "llumar",
    "dir", "nanox", "armor", "wraptek", "feynlab", "suntek", "viper",
  ],
};

// ---------------------------------------------------------------- V2-02 · العروض والباقات (619:1884)
export const offersGuest = {
  head: {
    overline: t("العروض والباقات", "Offers & packages"),
    title: t("عروض هذا الأسبوع من مقدّمي الخدمة", "This week’s offers from providers"),
    link: { ...t("كل العروض والباقات", "All offers & packages"), href_key: "offers" },
  } satisfies Head,
  package_label: t("باقة ·", "Package ·"),
  book: t("احجز العرض", "Book offer"),
  // الترتيب من بداية السطر
  cards: [
    {
      provider: "johnson",
      discount: 16,
      is_package: false,
      services: ["nano-ceramic"],
      title: t("باقة Johnson Ceramic Pro", "Johnson Ceramic Pro package"),
      includes: [
        { icon: "brand-shield-outline", text: t("ضمان 9 سنوات", "9-year warranty") },
        { icon: "brand-calendar-outline", text: t("يوم واحد", "1 day") },
      ],
      ends: t("ينتهي خلال 3 أيام", "Ends in 3 days"),
      price: 1899,
      old_price: 2250,
      package_slug: "johnson-ceramic-pro",
    },
    {
      provider: "xpel",
      discount: 15,
      is_package: false,
      services: ["ppf"],
      title: t("حماية PPF للواجهة مع نانو سيراميك", "Front PPF protection with nano ceramic"),
      includes: [
        { icon: "brand-shield-outline", text: t("ضمان 10 سنوات", "10-year warranty") },
        { icon: "brand-calendar-outline", text: t("يومان", "2 days") },
      ],
      ends: t("ينتهي خلال يومين", "Ends in 2 days"),
      price: 5950,
      old_price: 7000,
    },
    {
      provider: "nanoshield",
      discount: 18,
      is_package: true,
      services: ["wash", "polish", "nano-ceramic"],
      title: t("باقة العناية الشهرية: غسيل وتلميع ونانو", "Monthly care package: wash, polish and nano"),
      includes: [
        { icon: "brand-shield-outline", text: t("مواد أصلية", "Genuine materials") },
        { icon: "brand-calendar-outline", text: t("زيارة واحدة", "One visit") },
      ],
      ends: t("ينتهي خلال أسبوع", "Ends in a week"),
      price: 1690,
      old_price: 2070,
    },
  ] as {
    provider: string;
    discount: number;
    is_package: boolean;
    services: ServiceSlug[];
    title: Text;
    includes: { icon: string; text: Text }[];
    ends: Text;
    price: number;
    old_price: number;
    package_slug?: string;
  }[],
};

// ---------------------------------------------------------------- عناوين الأقسام المستخدمة كمراجع (#)
export const anchors = { forYou: "for-you", services: "services-explorer", app: "app" };
