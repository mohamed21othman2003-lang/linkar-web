import { routes } from "@/lib/routes";
import type { UiGlyph } from "@/components/icons/Icon";

// W2-95 · من نحن (760:13173) — العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
// الترتيب في كل قائمة = ترتيب القراءة (أول عنصر من بداية السطر، يمين في العربي).

export type AboutCard = {
  icon: UiGlyph;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
};

export const aboutPage = {
  title_ar: "من نحن",
  title_en: "About us",
  description_ar: "لينكار منصة سعودية تربطك بمقدّمي خدمات العناية بالسيارات المعتمدين: قارن، احجز، وادفع، وتابع سيارتك حتى الاستلام.",
  description_en: "Linkar is a Saudi platform that connects you with certified car care providers: compare, book, pay, and follow your car until pickup.",

  // Story
  story_title_ar: "بدأنا من سؤال بسيط",
  story_title_en: "We started with a simple question",
  story_body_ar:
    "تجمع لينكار مقدّمي خدمات العناية بالسيارات المعتمدين في منصة واحدة. ترى الخدمات بصورها وأسعارها حسب نوع سيارتك، وتقارن بين مقدّمي الخدمة، ثم تختار الفرع وتدفع فيتأكد حجزك فوراً — مع ضمان مسجّل باسمك ومتابعة حتى استلام السيارة.",
  story_body_en:
    "Linkar brings certified car care providers together on one platform. You see services with their photos and prices for your car type, compare providers, then choose the branch and pay so your booking is confirmed instantly — with a warranty registered in your name and follow-up until you pick up your car.",
  quote_ar: "لماذا يصعب معرفة السعر الحقيقي وجودة العمل قبل تسليم سيارتك؟",
  quote_en: "Why is it so hard to know the real price and the quality of the work before handing over your car?",
  quote_caption_ar: "السؤال الذي بدأت منه لينكار.",
  quote_caption_en: "The question Linkar started from.",

  // Vision & mission (#vision)
  vision_label_ar: "رؤيتنا",
  vision_label_en: "Our vision",
  vision_ar: "أن تكون العناية بالسيارة في المملكة واضحة وموثوقة لكل مالك سيارة — بدون مفاجآت في السعر أو الجودة.",
  vision_en: "For car care in the Kingdom to be clear and trustworthy for every car owner — with no surprises in price or quality.",
  mission_label_ar: "رسالتنا",
  mission_label_en: "Our mission",
  mission_ar: "نجمع مقدّمي الخدمة المعتمدين، ونوضح الأسعار والضمان قبل الدفع، ونحمي حق العميل من اختيار الخدمة حتى استلام السيارة.",
  mission_en: "We bring certified providers together, make prices and warranties clear before payment, and protect the customer from choosing the service until picking up the car.",

  values_title_ar: "قيمنا",
  values_title_en: "Our values",
  values: [
    {
      icon: "tag",
      title_ar: "الوضوح",
      title_en: "Clarity",
      body_ar: "السعر والمدة والضمان أمامك قبل أن تدفع.",
      body_en: "Price, duration and warranty are in front of you before you pay.",
    },
    {
      icon: "star",
      title_ar: "الجودة",
      title_en: "Quality",
      body_ar: "التقييمات من حجوزات مكتملة فقط، ونتدخل عند أي شكوى.",
      body_en: "Reviews come from completed bookings only, and we step in on any complaint.",
    },
    {
      icon: "lock",
      title_ar: "الثقة",
      title_en: "Trust",
      body_ar: "لا يظهر مقدّم خدمة قبل التحقق منه وزيارته، ونتابع جودته باستمرار.",
      body_en: "No provider is listed before we verify and visit them, and we keep monitoring their quality.",
    },
    {
      icon: "calendar",
      title_ar: "السهولة",
      title_en: "Ease",
      body_ar: "طلب ودفع في دقيقة، ويتأكد الحجز فوراً بدون انتظار.",
      body_en: "Order and pay in a minute, and your booking is confirmed instantly with no waiting.",
    },
  ] satisfies AboutCard[],

  // How it works (#how-it-works)
  how_title_ar: "كيف تعمل لينكار؟",
  how_title_en: "How does Linkar work?",
  how_subtitle_ar: "ابحث، قارن، اطلب، ثم قيّم تجربتك.",
  how_subtitle_en: "Search, compare, book, then rate your experience.",
  steps: [
    {
      title_ar: "ابحث",
      title_en: "Search",
      body_ar: "اكتب الخدمة أو الخدمات التي تحتاجها، أو اسم مقدّم الخدمة، ونعرض لك الأقرب لموقعك.",
      body_en: "Type the service or services you need, or a provider's name, and we show you the closest to your location.",
    },
    {
      title_ar: "قارن",
      title_en: "Compare",
      body_ar: "قارن الأسعار حسب نوع سيارتك، والضمان والتقييمات، بين مقدّمي الخدمة أو بين خدماتهم.",
      body_en: "Compare prices for your car type, warranties and reviews — between providers or between their services.",
    },
    {
      title_ar: "اطلب",
      title_en: "Book",
      body_ar: "اختر الفرع وادفع إلكترونياً — مدى أو Apple Pay أو STC Pay أو البطاقة — وتصلك قسيمتك فوراً.",
      body_en: "Choose the branch and pay online — mada, Apple Pay, STC Pay or card — and your voucher arrives instantly.",
    },
    {
      title_ar: "قيّم",
      title_en: "Rate",
      body_ar: "بعد اكتمال الخدمة قيّم تجربتك، وتابع أي ملاحظة مع فريق لينكار حتى الحل.",
      body_en: "Once the service is done, rate your experience and follow up any issue with the Linkar team until it's resolved.",
    },
  ],

  audience_title_ar: "لينكار لمن؟",
  audience_title_en: "Who is Linkar for?",
  audiences: [
    {
      icon: "user",
      title_ar: "لأصحاب السيارات",
      title_en: "For car owners",
      body_ar: "احجز خدمات العناية لدى مقدّمي خدمة معتمدين بأسعار واضحة.",
      body_en: "Book car care with certified providers at clear prices.",
      cta_ar: "تصفح الخدمات",
      cta_en: "Browse services",
      href: routes.services,
    },
    {
      icon: "package",
      title_ar: "لمقدّمي الخدمة",
      title_en: "For service providers",
      body_ar: "حجوزات مؤكدة ومدفوعة من عملاء منطقتك.",
      body_en: "Confirmed, prepaid bookings from customers in your area.",
      cta_ar: "لينكار لمقدّمي الخدمة",
      cta_en: "Linkar for providers",
      href: routes.forProviders,
    },
    {
      icon: "gift",
      title_ar: "للوكالات",
      title_en: "For dealerships",
      body_ar: "هدايا عناية مع كل سيارة تبيعها.",
      body_en: "Car care gifts with every car you sell.",
      cta_ar: "برنامج هدايا الوكالات",
      cta_en: "Dealer gift program",
      href: routes.forDealers,
    },
  ] satisfies (AboutCard & { cta_ar: string; cta_en: string; href: string })[],
};
