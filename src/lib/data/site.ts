import { routes } from "@/lib/routes";
import type { Link, MenuItem } from "./types";

// محتوى الإطار العام للموقع: الهيدر وقوائمه والفوتر.
// المصدر: v2 · Web header (689:2383) · Hero header (1314:595) · W2-10 (1095:29543) · W2-11 (1095:29629) · v2 · Footer (689:2447)

// روابط المنصات التانية (كونسول مقدّمي الخدمة، بوابة الوكالات، بوابة المسوّقين) — خارج نطاق الموقع.
// لحد ما الدومينات تتحدد بتودّي لصفحة التعريف بتاعة كل برنامج.
export const externalPortals = {
  provider: routes.forProviders,
  dealer: routes.forDealers,
  affiliate: routes.affiliates,
};

export const stores = {
  google: "https://play.google.com/store/apps?hl=ar",
  apple: "https://www.apple.com/sa-ar/app-store/",
};

export const site = {
  brand_name_ar: "لينكار",
  brand_name_en: "Linkar",
  email: "info@linkarksa.com",

  // الهيدر — الترتيب من بداية السطر (يمين في العربي)
  nav: {
    home: { label_ar: "الرئيسية", label_en: "Home", href: routes.home },
    services: { label_ar: "الخدمات", label_en: "Services", href: routes.services },
    offers: { label_ar: "العروض", label_en: "Offers", href: routes.offers },
    packages: { label_ar: "الباقات", label_en: "Packages", href: routes.packages },
    about: { label_ar: "من نحن", label_en: "About", href: routes.about },
    business: { label_ar: "لينكار للأعمال", label_en: "Linkar for business", href: routes.forProviders },
  } satisfies Record<string, Link>,

  header: {
    search_ar: "ابحث",
    search_en: "Search",
    sign_in_ar: "تسجيل الدخول",
    sign_in_en: "Sign in",
    // زر اللغة بيعرض اللغة التانية
    switch_to_ar: "ع",
    switch_to_en: "En",
    menu_ar: "القائمة",
    menu_en: "Menu",
    close_ar: "إغلاق",
    close_en: "Close",
  },

  // W2-10 · قائمة «من نحن»
  aboutMenu: {
    featured: {
      eyebrow_ar: "تطبيق لينكار",
      eyebrow_en: "Linkar app",
      title_ar: "حجوزاتك وقسائمك في جيبك",
      title_en: "Your bookings and vouchers in your pocket",
      body_ar: "احجز وادفع، وتابع سيارتك حتى الاستلام، وأضف قسيمتك إلى محفظة جوالك.",
      body_en: "Book and pay, follow your car until pickup, and add your voucher to your phone wallet.",
      cta_ar: "حمّل التطبيق",
      cta_en: "Get the app",
    },
    customers_title_ar: "للعملاء",
    customers_title_en: "For customers",
    customers: [
      {
        title_ar: "نبذة عن مقدّمي الخدمة",
        title_en: "About our service providers",
        subtitle_ar: "من هم مراكزنا المعتمدة",
        subtitle_en: "Who our certified centers are",
        href: routes.providers(),
        icon: "/figma/icons/menu-users.svg",
      },
      {
        title_ar: "مركز المساعدة",
        title_en: "Help center",
        subtitle_ar: "إجابات عن الحجز والدفع والقسيمة",
        subtitle_en: "Answers about booking, payment and vouchers",
        href: routes.help,
        icon: "/figma/icons/menu-help.svg",
      },
    ] satisfies MenuItem[],
    about_title_ar: "عن لينكار",
    about_title_en: "About Linkar",
    about: [
      {
        title_ar: "نبذة عن لينكار",
        title_en: "About Linkar",
        subtitle_ar: "من نحن ولماذا بدأنا",
        subtitle_en: "Who we are and why we started",
        href: routes.about,
        icon: "/figma/icons/menu-info.svg",
        highlighted: true,
      },
      {
        title_ar: "رؤيتنا ورسالتنا",
        title_en: "Our vision and mission",
        subtitle_ar: "ما نؤمن به وما نسعى إليه",
        subtitle_en: "What we believe in and work toward",
        href: routes.aboutVision,
        icon: "/figma/icons/menu-eye.svg",
      },
      {
        title_ar: "كيف يعمل لينكار",
        title_en: "How Linkar works",
        subtitle_ar: "ابحث، قارن، اطلب، ثم قيّم",
        subtitle_en: "Search, compare, book, then rate",
        href: routes.howItWorks,
        icon: "/figma/icons/menu-calendar.svg",
      },
      {
        title_ar: "تواصل معنا",
        title_en: "Contact us",
        subtitle_ar: "محادثة، هاتف، بريد",
        subtitle_en: "Chat, phone, email",
        href: routes.contact,
        icon: "/figma/icons/menu-message.svg",
      },
    ] satisfies MenuItem[],
    policies_label_ar: "السياسات والمساعدة:",
    policies_label_en: "Policies and help:",
    policies: [
      { label_ar: "الأسئلة الشائعة", label_en: "FAQ", href: routes.faq() },
      { label_ar: "الشروط والأحكام", label_en: "Terms and conditions", href: routes.terms },
      { label_ar: "سياسة الخصوصية", label_en: "Privacy policy", href: routes.privacy },
      { label_ar: "الإلغاء والاسترداد", label_en: "Cancellation and refunds", href: routes.cancellation },
      { label_ar: "الضمان والشكاوى", label_en: "Warranty and complaints", href: routes.warranty },
    ] satisfies Link[],
  },

  // W2-11 · قائمة «لينكار للأعمال»
  businessMenu: {
    providersCard: {
      eyebrow_ar: "مقدّمو الخدمة",
      eyebrow_en: "Service providers",
      title_ar: "مراكز العناية بالسيارات",
      title_en: "Car care centers",
      body_ar: "اعرض خدماتك وباقاتك، واستقبل الحجوزات وأدِر فريقك ومستحقاتك.",
      body_en: "List your services and packages, receive bookings, and manage your team and payouts.",
      cta_ar: "انضم كمقدّم خدمة",
      cta_en: "Join as a provider",
      cta_href: routes.providerJoin,
      login_ar: "دخول مقدّمي الخدمة",
      login_en: "Provider sign-in",
      login_href: externalPortals.provider,
    },
    dealersCard: {
      eyebrow_ar: "الوكالات",
      eyebrow_en: "Dealerships",
      title_ar: "وكالات السيارات",
      title_en: "Car dealerships",
      body_ar: "أهدِ عملاءك خدمات عناية مع كل سيارة جديدة، وتابع الاستخدام بتقارير.",
      body_en: "Gift your customers car care with every new car, and track usage with reports.",
      cta_ar: "برنامج الهدايا",
      cta_en: "Gift program",
      cta_href: routes.forDealers,
      login_ar: "دخول الوكالات",
      login_en: "Dealer sign-in",
      login_href: externalPortals.dealer,
    },
    providers_title_ar: "مقدّمو الخدمة",
    providers_title_en: "Service providers",
    providers: [
      {
        title_ar: "معايير الاعتماد",
        title_en: "Certification criteria",
        subtitle_ar: "كيف نختار المراكز ونتابع جودتها",
        subtitle_en: "How we choose centers and monitor quality",
        href: `${routes.forProviders}#criteria`,
        icon: "/figma/icons/menu-shield-check.svg",
      },
      {
        title_ar: "انضم كمقدّم خدمة",
        title_en: "Join as a provider",
        subtitle_ar: "سجّل مركزك في دقائق",
        subtitle_en: "Register your center in minutes",
        href: routes.providerJoin,
        icon: "/figma/icons/menu-plus.svg",
      },
    ] satisfies MenuItem[],
    companies_title_ar: "الشركات",
    companies_title_en: "Companies",
    companies: [
      {
        title_ar: "برامج الشركات",
        title_en: "Corporate programs",
        subtitle_ar: "عناية مخصّصة لسيارات شركتك وأسطولها",
        subtitle_en: "Dedicated care for your company cars and fleet",
        href: routes.corporate,
        icon: "/figma/icons/menu-bank.svg",
      },
    ] satisfies MenuItem[],
    affiliates_title_ar: "المسوّقون",
    affiliates_title_en: "Affiliates",
    affiliates: [
      { label_ar: "برنامج المسوّقين", label_en: "Affiliate program", href: routes.affiliates },
      { label_ar: "دخول المسوّقين", label_en: "Affiliate sign-in", href: externalPortals.affiliate },
    ] satisfies Link[],
  },

  // v2 · Footer
  footer: {
    about_ar: "لينكار منصة سعودية تربطك بمقدّمي خدمات العناية بالسيارات المعتمدين: قارن، احجز، وادفع، وتابع سيارتك حتى الاستلام.",
    about_en: "Linkar is a Saudi platform that connects you with certified car care providers: compare, book, pay, and follow your car until pickup.",
    columns: [
      {
        title_ar: "من نحن",
        title_en: "About",
        links: [
          { label_ar: "نبذة عن لينكار", label_en: "About Linkar", href: routes.about },
          { label_ar: "مركز المساعدة", label_en: "Help center", href: routes.help },
          { label_ar: "المدونة", label_en: "Blog", href: routes.blog },
          { label_ar: "كيف تعمل لينكار", label_en: "How Linkar works", href: routes.howItWorks },
          { label_ar: "الأسئلة الشائعة", label_en: "FAQ", href: routes.faq() },
          { label_ar: "تواصل معنا", label_en: "Contact us", href: routes.contact },
        ],
      },
      {
        title_ar: "الخدمات",
        title_en: "Services",
        links: [
          { label_ar: "الغسيل", label_en: "Car wash", href: routes.search({ services: ["wash"] }) },
          { label_ar: "حماية PPF", label_en: "PPF protection", href: routes.search({ services: ["ppf"] }) },
          { label_ar: "التظليل", label_en: "Window tinting", href: routes.search({ services: ["tint"] }) },
          { label_ar: "التلميع", label_en: "Polishing", href: routes.search({ services: ["polish"] }) },
          { label_ar: "نانو سيراميك", label_en: "Nano ceramic", href: routes.search({ services: ["nano-ceramic"] }) },
          { label_ar: "تغيير اللون", label_en: "Color change", href: routes.search({ services: ["color-change"] }) },
        ],
      },
      {
        title_ar: "للأعمال",
        title_en: "For business",
        links: [
          { label_ar: "مقدّمو الخدمة", label_en: "Service providers", href: routes.forProviders },
          { label_ar: "انضم كمقدّم خدمة", label_en: "Join as a provider", href: routes.providerJoin },
          { label_ar: "معايير الاعتماد", label_en: "Certification criteria", href: `${routes.forProviders}#criteria` },
          { label_ar: "برنامج الوكالات", label_en: "Dealer program", href: routes.forDealers },
          { label_ar: "برامج الشركات", label_en: "Corporate programs", href: routes.corporate },
          { label_ar: "برنامج المسوّقين", label_en: "Affiliate program", href: routes.affiliates },
          { label_ar: "دخول مقدّمي الخدمة", label_en: "Provider sign-in", href: externalPortals.provider },
          { label_ar: "دخول الوكالات", label_en: "Dealer sign-in", href: externalPortals.dealer },
          { label_ar: "دخول المسوّقين", label_en: "Affiliate sign-in", href: externalPortals.affiliate },
        ],
      },
      {
        title_ar: "السياسات",
        title_en: "Policies",
        links: [
          { label_ar: "الشروط والأحكام", label_en: "Terms and conditions", href: routes.terms },
          { label_ar: "سياسة الخصوصية", label_en: "Privacy policy", href: routes.privacy },
          { label_ar: "الإلغاء والاسترداد", label_en: "Cancellation and refunds", href: routes.cancellation },
          { label_ar: "الضمان والشكاوى", label_en: "Warranty and complaints", href: routes.warranty },
          { label_ar: "شروط مقدّمي الخدمة", label_en: "Provider terms", href: routes.providerTerms },
        ],
      },
    ] satisfies (Record<"title_ar" | "title_en", string> & { links: Link[] })[],
    // روابط السوشيال لحد ما توصل الحسابات الرسمية (من وصف v2 · Social icon)
    social: [
      { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
      { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
      { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/" },
      { platform: "snapchat", label: "Snapchat", href: "https://www.snapchat.com/" },
      { platform: "x", label: "X", href: "https://x.com/" },
      { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
    ],
    payments: ["Apple Pay", "mada", "Visa", "Mastercard", "STC Pay", "tabby", "tamara"],
    copyright_ar: "© 2026 لينكار. جميع الحقوق محفوظة.",
    copyright_en: "© 2026 Linkar. All rights reserved.",
    registry_ar: "السجل التجاري: [يُضاف] · الرقم الضريبي: [يُضاف]",
    registry_en: "CR number: [to be added] · VAT number: [to be added]",
  },

  // الأزرار العائمة (FAB) — مساعد لينكار وواتساب
  fab: {
    assistant_ar: "مساعد لينكار",
    assistant_en: "Linkar assistant",
    whatsapp_ar: "تواصل عبر واتساب",
    whatsapp_en: "Chat on WhatsApp",
  },
};
