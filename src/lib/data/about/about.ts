import type { UiGlyph } from "@/components/icons/Icon";

// W2-95 · من نحن (تصميم العميل المعدّل 85:46926) — العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
// الترتيب في كل قائمة = ترتيب القراءة (أول عنصر من بداية السطر، يمين في العربي).
// #vision = كروت «طموحنا/رسالتنا» و#how-it-works = «رحلتك مع لينكار» (مربوطين من قائمة «من نحن» والفوتر).

type T<K extends string> = { [P in `${K}_ar` | `${K}_en`]: string };
export type AboutCard = T<"title"> & T<"body"> & { icon: UiGlyph };
type Head = T<"overline"> & T<"title">;

export const aboutPage = {
  title_ar: "من نحن",
  title_en: "About us",
  description_ar: "تعرّف على لينكار: من نحن، وكيف نختار مقدّمي الخدمة، ولماذا تحجز عناية سيارتك عبرنا بثقة.",
  description_en: "Get to know Linkar: who we are, how we choose service providers, and why you can book your car care with us with confidence.",

  // Band · قصتنا
  story: {
    overline_ar: "قصتنا",
    overline_en: "Our story",
    title_ar: "منصة سعودية تجمع العناية بسيارتك في مكان واحد",
    title_en: "A Saudi platform that brings your car care together in one place",
    body_ar:
      "لينكار منصة رقمية تربط مالكي السيارات بمقدّمي خدمات العناية المعتمدين في تجربة واحدة: تستكشف الخدمات وتقارن بين مقدّميها، ثم تحجز وتدفع إلكترونياً، وتصلك قسيمة رقمية تعرضها في الفرع، وتتابع سيارتك حتى الاستلام والتقييم.",
    body_en:
      "Linkar is a digital platform that connects car owners with certified car care providers in one experience: explore services and compare providers, then book and pay online, receive a digital voucher to show at the branch, and follow your car until pickup and review.",
    photo_main: "/figma/business/corporate-why.jpg",
    photo_small: "/figma/business/program-gifts.jpg",
    chips: {
      qr_ar: "قسيمة رقمية بـ QR",
      qr_en: "A digital QR voucher",
      confirmed_ar: "حجز مؤكد فور الدفع",
      confirmed_en: "Booking confirmed on payment",
      warranty_ar: "ضمان مزدوج على كل خدمة",
      warranty_en: "A double warranty on every service",
    },
    // رسالتنا (غامق) ثم طموحنا (أبيض)
    mission: { icon: "car", title_ar: "رسالتنا", title_en: "Our mission", body_ar: "أن تبحث عن خدمات العناية بسيارتك وتحجزها وتدفعها وتتابع سجلّها في تجربة سلسة وآمنة.", body_en: "To let you find, book and pay for your car care and keep track of its history in one smooth, secure experience." } satisfies AboutCard,
    vision: { icon: "star", title_ar: "طموحنا", title_en: "Our ambition", body_ar: "أن تكون لينكار المرجع الأول للعناية بالسيارات في المملكة، للعملاء ومقدّمي الخدمة معاً.", body_en: "For Linkar to be the Kingdom’s first reference for car care, for customers and service providers alike." } satisfies AboutCard,
  },

  // ماذا نقدّم — كروت الخدمات الست (نفس كروت الهوم)
  services: {
    overline_ar: "ماذا نقدّم",
    overline_en: "What we offer",
    title_ar: "ستّ خدمات، ومراكز معتمدة لكل خدمة",
    title_en: "Six services, with certified centers for each",
    link_ar: "تصفّح كل الخدمات",
    link_en: "Browse all services",
  } satisfies Head & T<"link">,

  // Band · رحلتك مع لينكار (#how-it-works)
  journey: {
    overline_ar: "رحلتك مع لينكار",
    overline_en: "Your journey with Linkar",
    title_ar: "من البحث حتى استلام سيارتك، كل خطوة واضحة",
    title_en: "From search to picking up your car, every step is clear",
    body_ar: "لا اتصالات ولا انتظار: تختار وتدفع، وتصلك القسيمة، والفرع يكمل الباقي.",
    body_en: "No calls and no waiting: you choose and pay, the voucher arrives, and the branch does the rest.",
    cta_ar: "ابدأ الآن",
    cta_en: "Start now",
    photo: "/figma/business/program-employees.jpg",
    steps: [
      { icon: "search", title_ar: "ابحث وقارن", title_en: "Search and compare", body_ar: "اختر الخدمة وقارن بين المراكز القريبة بالسعر والتقييم والضمان.", body_en: "Pick the service and compare nearby centers by price, rating and warranty." },
      { icon: "calendar", title_ar: "احجز موعدك", title_en: "Book your visit", body_ar: "اختر الفرع واليوم المناسب، وأضف أكثر من خدمة في زيارة واحدة.", body_en: "Choose the branch and a day that suits you, and add more than one service to a single visit." },
      { icon: "card", title_ar: "ادفع بأمان", title_en: "Pay securely", body_ar: "بمدى أو Apple Pay أو STC Pay أو البطاقة، أو قسّطها مع تابي وتمارا.", body_en: "With mada, Apple Pay, STC Pay or card, or split it with tabby and tamara." },
      { icon: "qr", title_ar: "تصلك القسيمة", title_en: "Get your voucher", body_ar: "قسيمة رقمية برمز QR تصلك برسالة، وتجدها في «حجوزاتي».", body_en: "A digital QR voucher arrives by text message, and you’ll find it in “My bookings”." },
      { icon: "store", title_ar: "زر الفرع", title_en: "Visit the branch", body_ar: "اعرض القسيمة في الفرع، ويبدأ تنفيذ خدمتك.", body_en: "Show the voucher at the branch, and your service begins." },
      { icon: "star", title_ar: "استلم وقيّم", title_en: "Pick up and review", body_ar: "استلم سيارتك وقيّم الخدمة لتساعد غيرك على الاختيار.", body_en: "Pick up your car and review the service to help others choose." },
    ] satisfies AboutCard[],
  },

  // Band · كيف نختار مقدّمي الخدمة
  selection: {
    overline_ar: "كيف نختار مقدّمي الخدمة؟",
    overline_en: "How do we choose service providers?",
    title_ar: "لا يظهر أي مركز على لينكار قبل أن يجتاز تقييمنا",
    title_en: "No center appears on Linkar before it passes our assessment",
    body_ar: "فريق لينكار يزور المركز ويقيّمه ميدانياً قبل انضمامه، ثم يتابع أداءه على المنصة من حجوزات وتقييمات حقيقية.",
    body_en: "The Linkar team visits and assesses every center in the field before it joins, then follows its performance on the platform through real bookings and reviews.",
    tiers_title_ar: "تصنيف كل مركز حسب نتيجة تقييمه",
    tiers_title_en: "Every center is ranked by its assessment score",
    tier_caption_ar: "نتيجة التقييم الميداني",
    tier_caption_en: "Field assessment score",
    tiers: [
      { key: "platinum", letter: "P", range: "90 – 100", name_ar: "بلاتيني", name_en: "Platinum" },
      { key: "gold", letter: "G", range: "80 – 89", name_ar: "ذهبي", name_en: "Gold" },
      { key: "silver", letter: "S", range: "70 – 79", name_ar: "فضي", name_en: "Silver" },
    ] as const,
    zero: {
      title_ar: "إيقاف فوري، مهما كانت النتيجة",
      title_en: "Immediate suspension, whatever the score",
      body_ar: "منتجات مقلّدة · تبديل المنتج دون موافقتك · تزوير اعتماد أو شهادة · التلاعب بالضمان · تضليل جوهري للعميل · خطر سلامة جسيم.",
      body_en: "Counterfeit products · switching products without your consent · forged accreditation or certificates · warranty tampering · seriously misleading the customer · a serious safety risk.",
    },
    stages: [
      { icon: "check", title_ar: "تقييم ميداني بـ 91 معياراً", title_en: "A field assessment against 91 criteria", body_ar: "زيارة للمركز وتقييم في 6 محاور: الجودة الأساسية، والتظليل، وحماية PPF، والسيراميك، والغسيل، ثم التقييم العملي على المنصة.", body_en: "A visit to the center and an assessment across 6 areas: core quality, tinting, PPF protection, ceramic, washing, and then the practical assessment on the platform." },
      { icon: "star", title_ar: "القبول والتصنيف", title_en: "Acceptance and ranking", body_ar: "يُقبل المركز إذا حقق 70 فأكثر في كل محور دون أي إخفاق حرج، ويأخذ تصنيفه حسب نتيجته الإجمالية.", body_en: "A center is accepted if it scores 70 or more in every area with no critical failure, and gets its rank from its overall score." },
      { icon: "calendar", title_ar: "3 أشهر تحت المتابعة", title_en: "3 months under review", body_ar: "بعد انضمامه نتابع أداءه من أرقام المنصة، ونكمل التقييم بزيارات مفاجئة.", body_en: "After it joins, we follow its performance through platform data and continue assessing it with surprise visits." },
      { icon: "clock", title_ar: "إعادة تقييم كل سنة", title_en: "Reassessed every year", body_ar: "التصنيف ليس دائماً: يعاد التقييم الميداني سنوياً، فيبقى المستوى كما هو.", body_en: "A rank isn’t permanent: the field assessment is repeated every year, so the standard stays the same." },
    ] satisfies AboutCard[],
  },

  // Band · ضمان مزدوج
  warranty: {
    overline_ar: "ضمان مزدوج",
    overline_en: "Double warranty",
    title_ar: "خدمتك مضمونة مرّتين",
    title_en: "Your service is guaranteed twice",
    body_ar: "ضمان مكتوب من مقدّم الخدمة على كل خدمة، وفوقه متابعة لينكار حتى تُحل أي ملاحظة على التنفيذ.",
    body_en: "A written warranty from the provider on every service, plus Linkar’s follow-up until any issue with the work is resolved.",
    link_ar: "اقرأ سياسة الضمان والشكاوى",
    link_en: "Read the warranty and complaints policy",
    photo: "/figma/business/corporate-hero.jpg",
    cards: [
      { icon: "receipt", title_ar: "ضمان مقدّم الخدمة", title_en: "Provider warranty", body_ar: "ضمان مكتوب ومسجّل برقم قسيمة حجزك، تجد مدته وتفاصيله في «حجوزاتي».", body_en: "A written warranty registered to your booking voucher number — you’ll find its length and details in “My bookings”." },
      { icon: "check", title_ar: "ضمان لينكار", title_en: "Linkar warranty", body_ar: "إذا كانت لديك ملاحظة على التنفيذ، نتابعها مع المركز حتى تُحل.", body_en: "If you have an issue with the work, we follow it up with the center until it’s resolved." },
      { icon: "message", title_ar: "تواصل مع لينكار", title_en: "Contact Linkar", body_ar: "فريقنا يرد على الشكاوى خلال 24 ساعة من «الشكاوى والمقترحات» في حسابك.", body_en: "Our team replies to complaints within 24 hours from “Complaints and suggestions” in your account." },
    ] satisfies AboutCard[],
  },

  // Band · ثقتك أولاً
  trust: {
    overline_ar: "ثقتك أولاً",
    overline_en: "Your trust comes first",
    title_ar: "أسعار واضحة، وتقييمات حقيقية، ودفع آمن",
    title_en: "Clear prices, real reviews, and secure payment",
    photo: {
      tag_ar: "قبل وبعد",
      tag_en: "Before and after",
      title_ar: "توثيق بالصور لكل خدمة",
      title_en: "Photo records for every service",
      body_ar: "يرفع المركز صور سيارتك قبل الخدمة وبعدها، لتكون مرجعاً لجودة التنفيذ عند أي ملاحظة.",
      body_en: "The center uploads photos of your car before and after the service, as a reference for the quality of the work if there’s ever an issue.",
      src: "/figma/business/program-fleet.jpg",
    },
    price: { icon: "tag", title_ar: "السعر قبل الدفع", title_en: "The price before you pay", body_ar: "سعر خدمتك لنوع سيارتك بالضبط، شاملاً الضريبة، قبل أن تدفع.", body_en: "The exact price of your service for your car type, VAT included, before you pay." } satisfies AboutCard,
    reviews: { icon: "star", title_ar: "تقييمات من حجوزات مكتملة", title_en: "Reviews from completed bookings", body_ar: "لا يقيّم إلا من أكمل حجزه، فكل تقييم تراه حقيقي.", body_en: "Only customers who completed their booking can review, so every review you see is real." } satisfies AboutCard,
    // ملاحظة للمراجعة: نص الفيجما بيذكر تغيير الموعد والإلغاء من «حجوزاتي» — منقول بالحرف
    booking: { icon: "calendar", title_ar: "حجزك بين يديك", title_en: "Your booking, in your hands", body_ar: "غيّر الموعد أو ألغِ الحجز من «حجوزاتي» حسب سياسة الإلغاء.", body_en: "Change the date or cancel the booking from “My bookings”, according to the cancellation policy." } satisfies AboutCard,
    payment: { icon: "lock", title_ar: "دفع آمن", title_en: "Secure payment", body_ar: "بوابات دفع موثوقة، وبالوسيلة التي تناسبك.", body_en: "Trusted payment gateways, with the method that suits you." } satisfies AboutCard,
    // ترتيب الفيجما من اليمين: Apple Pay · STC Pay · tabby · tamara ثم mada في السطر التاني
    methods: ["Apple Pay", "STC Pay", "tabby", "tamara", "mada"],
  },

  // Band · علامات تعرفها
  partners: {
    overline_ar: "شركاؤنا",
    overline_en: "Our partners",
    title_ar: "علامات تعرفها وتثق بها",
    title_en: "Brands you know and trust",
    body_ar: "مراكز سعودية معروفة، ومنتجات أصلية من علامات عالمية في التظليل والحماية والعناية.",
    body_en: "Well-known Saudi centers, and genuine products from global brands in tinting, protection and care.",
    link_ar: "عرض كل مقدّمي الخدمة",
    link_en: "View all service providers",
    // مكان الشعار جوه الكارت 200×128 بالظبط زي الفيجما: [left, top, width, height] + طريقة الملء — صفّين، من اليمين
    rows: [
      [
        { slug: "suntek", alt: "SunTek", box: [33.7, 44.8, 132, 38.3], fit: "contain" },
        { slug: "stek", alt: "STEK", box: [44.9, 43.6, 110.2, 40.9], fit: "contain" },
        { slug: "v-kool", alt: "V-KOOL", box: [37.7, -2, 132.1, 132.1], fit: "cover" },
        { slug: "llumar", alt: "LLumar", box: [60.5, 38.4, 79, 51.2], fit: "cover" },
        { slug: "3m", alt: "3M", box: [58.5, 41.7, 83, 44.5], fit: "cover" },
        { slug: "xpel", alt: "XPEL", box: [60.5, 24.5, 79, 79], fit: "cover" },
      ],
      [
        { slug: "feynlab", alt: "FEYNLAB", box: [30.7, 47.5, 138.6, 32.9], fit: "contain" },
        { slug: "nanoshield", alt: "Nano Shield", box: [51.7, 19.4, 107, 80.2], fit: "contain" },
        { slug: "autoshabo", alt: "Autoshabo", box: [53, 28.8, 93.9, 70.4], fit: "contain" },
        { slug: "lamaa", alt: "Lamaa", box: [44.6, 43.3, 110.9, 41.4], fit: "contain" },
        { slug: "nukhba", alt: "Al Nukhba", box: [51.2, 43.2, 97.5, 41.6], fit: "contain" },
        { slug: "johnson", alt: "Johnson Window Films", box: [42.5, 45.9, 115.1, 36.3], fit: "contain" },
      ],
    ] as { slug: string; alt: string; box: [number, number, number, number]; fit: "contain" | "cover" }[][],
  },

  // Band · لينكار لمن؟
  audiences: {
    overline_ar: "لينكار لمن؟",
    overline_en: "Who is Linkar for?",
    title_ar: "منصة واحدة لأصحاب السيارات ولمن يخدمونها",
    title_en: "One platform for car owners and those who serve them",
    items: [
      { icon: "car", photo: "/figma/business/program-employees.jpg", href_key: "services", title_ar: "لأصحاب السيارات", title_en: "For car owners", body_ar: "احجز عناية سيارتك لدى مقدّمي خدمة معتمدين، بأسعار واضحة وضمان مزدوج.", body_en: "Book your car care at certified providers, with clear prices and a double warranty.", cta_ar: "تصفّح الخدمات", cta_en: "Browse services" },
      { icon: "store", photo: "/figma/business/corporate-why.jpg", href_key: "providers", title_ar: "لمقدّمي الخدمة", title_en: "For service providers", body_ar: "حجوزات مؤكدة ومدفوعة من عملاء في منطقتك، ولوحة تدير منها فروعك وخدماتك.", body_en: "Confirmed, prepaid bookings from customers in your area, and a dashboard to manage your branches and services.", cta_ar: "لينكار لمقدّمي الخدمة", cta_en: "Linkar for service providers" },
      { icon: "users", photo: "/figma/business/program-gifts.jpg", href_key: "corporate", title_ar: "للشركات والوكالات", title_en: "For companies and dealerships", body_ar: "برامج عناية لأساطيل الشركات، وباقات تهديها الوكالات لعملائها مع كل سيارة.", body_en: "Care programs for company fleets, and packages dealerships gift their customers with every car.", cta_ar: "برامج الشركات", cta_en: "Corporate programs" },
    ] as (AboutCard & T<"cta"> & { photo: string; href_key: "services" | "providers" | "corporate" })[],
  },
};
