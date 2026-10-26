// محتوى الرئيسية للزائر — V2-02 · Home · Icons (37:28371، صفحة 0:1 في نسخة العميل).
// اتبنت أصلاً من linkar-site-final V2-02 (600:2964)؛ العربي من الفيجما بالحرف والإنجليزي ترجمتنا.
import type { ServiceSlug } from "@/lib/data/types";
import type { LinkKey, Text } from "./home";

const t = (ar: string, en: string): Text => ({ text_ar: ar, text_en: en });
type Head = { overline: Text; title: Text; description?: Text; link?: Text & { href_key: LinkKey } };

// ---------------------------------------------------------------- V2-02 · Services (37:28436)
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
  // ترتيب 37:28486 (من فوق): التظليل · PPF · نانو · التلميع · الغسيل · تغيير اللون
  items: [
    { slug: "tint", sub: t("عزل حراري وخصوصية", "Heat insulation and privacy"), price: 549 },
    { slug: "ppf", sub: t("حماية الطلاء من الخدوش", "Protects the paint from scratches"), price: 799 },
    { slug: "nano-ceramic", sub: t("لمعان يدوم وطبقة طاردة للماء", "Lasting shine and a water-repellent layer"), price: 449 },
    { slug: "polish", sub: t("إزالة الخدوش الخفيفة", "Removes light scratches"), price: 349 },
    { slug: "wash", sub: t("غسيل خارجي وداخلي", "Exterior and interior wash"), price: 45 },
    { slug: "color-change", sub: t("تغليف بلون جديد", "Wrap in a new color"), price: 1499 },
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

// ---------------------------------------------------------------- V2-02 · Features (37:28558)
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
      { icon: "brand-car-neon", title: t("تابع سيارتك", "Follow your car"), body: t("تحديثات لحظية حتى تستلم سيارتك جاهزة.", "Live updates until you pick up your car ready.") },
    ],
  ],
  inline: [
    { icon: "brand-shield-neon", title: t("ضمان موثّق", "Recorded warranty"), body: t("موثّق برقم القسيمة، ونتابع أي شكوى حتى الحل.", "Recorded with the voucher number, and we follow up any complaint until it’s resolved."), light: false },
    { icon: "feature-payment-neon", title: t("دفع آمن ومرن", "Secure, flexible payment"), body: t("مدى وApple Pay وSTC Pay والبطاقات", "mada, Apple Pay, STC Pay and cards"), light: false },
    { icon: "feature-gift-neon", title: t("هدايا وكالات السيارات", "Car dealer gifts"), body: t("هديتك من وكالة سيارتك تظهر في حسابك تلقائياً.", "Your gift from your car dealer shows up in your account automatically."), light: false },
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


// ---------------------------------------------------------------- V2-02 · How it works (37:28888)
export const howGuest = {
  overline: t("كيف يعمل لينكار", "How Linkar works"),
};

// ---------------------------------------------------------------- V2-02 · التطبيق (37:28940)
export const appGuest = {
  overline: t("تطبيق لينكار", "Linkar app"),
  title_1: t("لينكار في جيبك", "Linkar in your pocket"),
  scan: t("امسح للتحميل", "Scan to download"),
  guest_description: t("احجز وتابع سيارتك، واحتفظ بقسائمك وضماناتك في مكان واحد.", "Book and follow your car, and keep your vouchers and warranties in one place."),
  guest_points: [
    { icon: "brand-calendar-dark", text: t("حجز مؤكد فوراً من جوالك", "Instant confirmed booking from your phone") },
    { icon: "brand-car-dark", text: t("تتبّع حالة سيارتك لحظة بلحظة", "Track your car’s status moment by moment") },
    { icon: "brand-shield-dark", text: t("قسائمك وضماناتك في مكان واحد", "Your vouchers and warranties in one place") },
  ],
  phones_alt: t("شاشات تطبيق لينكار: الرئيسية وقسيمة الحجز", "Linkar app screens: home and booking voucher"),
  platforms: t("آيفون وأندرويد", "iPhone and Android"),
};
