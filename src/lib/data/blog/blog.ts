import type { ServiceSlug } from "@/lib/data/types";

// W2-100 · المدونة (85:48104) + W2-100b · مقال (85:48224) — العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة).
// الفيجما فيها مقال واحد كامل بس: «حماية PPF أم نانو سيراميك» (ppf-vs-nano-ceramic).
// باقي المقالات (كروت W2-100) عناوينها ومقتطفاتها من الفيجما، والمحتوى **مؤقت** (body غير موجود → «محتوى المقال قيد الإعداد»).

export type BlogCategoryKey = "all" | "care-tips" | "protection" | "guides" | "news";

export type BlogSection =
  | { kind: "h2"; id: string; text_ar: string; text_en: string }
  | { kind: "p"; text_ar: string; text_en: string }
  | { kind: "table"; id: string; head: { text_ar: string; text_en: string }[]; rows: { text_ar: string; text_en: string }[][] }
  | { kind: "tip"; title_ar: string; title_en: string; text_ar: string; text_en: string }
  | { kind: "list"; items: { text_ar: string; text_en: string }[] };

export type BlogPost = {
  slug: string;
  category: Exclude<BlogCategoryKey, "all">;
  title_ar: string;
  title_en: string;
  // اسم مختصر لمسار التنقّل في W2-100b
  crumb_ar: string;
  crumb_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  minutes: number;
  date: string; // ISO
  photo: string;
  featured?: boolean;
  placeholder?: boolean;
  lead_ar?: string;
  lead_en?: string;
  sections?: BlogSection[];
  tags?: { text_ar: string; text_en: string }[];
  // «جاهز تحمي سيارتك؟» — أزرار كارت الدعوة (أول واحد الزر الليموني)، والأيقونات بنفس الخدمات
  cta_services?: { service: ServiceSlug; label_ar: string; label_en: string }[];
  related: string[];
};

export const blogPage = {
  title_ar: "مدونة لينكار",
  title_en: "Linkar blog",
  crumb_ar: "المدونة",
  crumb_en: "Blog",
  description_ar: "نصائح وأدلة للعناية بسيارتك في أجواء المملكة، من فريق لينكار ومقدّمي الخدمة المعتمدين.",
  description_en: "Tips and guides for caring for your car in the Kingdom’s climate, from the Linkar team and certified service providers.",
  search_ar: "ابحث في المقالات",
  search_en: "Search articles",
  featured_tag_ar: "مقال مميز",
  featured_tag_en: "Featured",
  read_ar: "اقرأ المقال",
  read_en: "Read the article",
  // العربي: 3–10 «دقائق»، غير كده «دقيقة» (الفيجما: «2 دقيقة قراءة»)
  minutes_ar: "{n} دقائق قراءة",
  minutes_en: "{n} min read",
  minute_one_ar: "{n} دقيقة قراءة",
  minute_one_en: "{n} min read",
  author_ar: "فريق لينكار",
  author_en: "Linkar team",
  author_initial_ar: "ل",
  author_initial_en: "L",
  author_bio_ar: "نكتب بالتعاون مع مقدّمي الخدمة المعتمدين على لينكار.",
  author_bio_en: "We write in collaboration with the certified service providers on Linkar.",
  next_ar: "الصفحة التالية",
  next_en: "Next page",
  // صياغتنا — لما الفلتر أو البحث مايلاقيش
  empty_ar: "لا توجد مقالات مطابقة. جرّب كلمة أخرى أو تصنيفاً آخر.",
  empty_en: "No matching articles. Try another word or category.",
  cta: {
    title_ar: "جاهز تطبّق النصيحة؟",
    title_en: "Ready to put the tip into practice?",
    body_ar: "قارن مقدّمي الخدمة القريبين منك بالسعر والتقييم والضمان، واحجز في دقائق.",
    body_en: "Compare nearby service providers by price, rating and warranty, and book in minutes.",
    button_ar: "ابحث عن خدمة",
    button_en: "Find a service",
  },
  // W2-100b
  toc_ar: "في هذا المقال",
  toc_en: "In this article",
  related_ar: "مقالات ذات صلة",
  related_en: "Related articles",
  service_cta: {
    title_ar: "جاهز تحمي سيارتك؟",
    title_en: "Ready to protect your car?",
    body_ar: "قارن المراكز المعتمدة القريبة منك بالسعر والتقييم والضمان، واحجز الخدمتين في زيارة واحدة.",
    body_en: "Compare certified centers near you by price, rating and warranty, and book both services in one visit.",
  },
  share_ar: "مشاركة",
  share_en: "Share",
  copy_ar: "نسخ الرابط",
  copy_en: "Copy link",
  copied_ar: "تم نسخ رابط المقال", // صياغتنا (توست)
  copied_en: "Article link copied",
  placeholder_body_ar: "[محتوى المقال قيد الإعداد — يُضاف لاحقاً]",
  placeholder_body_en: "[Article content in preparation — to be added]",
};

// ترتيب الشرايح من بداية السطر (يمين في العربي): الكل · نصائح العناية · الحماية والتظليل · أدلة لينكار · أخبار لينكار
export const blogCategories: { key: BlogCategoryKey; label_ar: string; label_en: string }[] = [
  { key: "all", label_ar: "الكل", label_en: "All" },
  { key: "care-tips", label_ar: "نصائح العناية", label_en: "Care tips" },
  { key: "protection", label_ar: "الحماية والتظليل", label_en: "Protection and tinting" },
  { key: "guides", label_ar: "أدلة لينكار", label_en: "Linkar guides" },
  { key: "news", label_ar: "أخبار لينكار", label_en: "Linkar news" },
];

const photos = {
  night: "/figma/business/program-employees.jpg",
  polish: "/figma/business/corporate-why.jpg",
  tint: "/figma/business/program-gifts.jpg",
  sunset: "/figma/business/corporate-hero.jpg",
  wash: "/figma/business/program-fleet.jpg",
};

// ترتيب العرض في W2-100: المميز ثم الكروت (الصف الأول ثم التاني، من اليمين)
export const blogPosts: BlogPost[] = [
  {
    slug: "ppf-vs-nano-ceramic",
    category: "protection",
    featured: true,
    title_ar: "حماية PPF أم نانو سيراميك: أيهما يناسب سيارتك؟",
    title_en: "PPF or nano ceramic: which one suits your car?",
    crumb_ar: "حماية PPF أم نانو سيراميك",
    crumb_en: "PPF or nano ceramic",
    excerpt_ar: "الاثنان يحميان سيارتك، لكن بطريقتين مختلفتين. نشرح الفرق بينهما، ومتى تختار كل واحد، ومتى يكون الجمع بينهما هو الخيار الأفضل.",
    excerpt_en: "Both protect your car, but in two different ways. We explain the difference, when to choose each one, and when combining them is the best option.",
    minutes: 6,
    date: "2026-10-20",
    photo: photos.night,
    lead_ar: "الاثنان يحميان سيارتك، لكن بطريقتين مختلفتين. حماية PPF درع يمتص الصدمات، والنانو سيراميك طبقة لمعان تسهّل التنظيف. في هذا المقال نشرح الفرق، ومتى تختار كل واحد.",
    lead_en: "Both protect your car, but in two different ways. PPF is a shield that absorbs impacts, while nano ceramic is a gloss layer that makes cleaning easier. In this article we explain the difference and when to choose each one.",
    sections: [
      { kind: "h2", id: "what-is-ppf", text_ar: "ما هو فيلم الحماية PPF؟", text_en: "What is paint protection film (PPF)?" },
      {
        kind: "p",
        text_ar:
          "فيلم شفاف من البولي يوريثان يُركّب على طلاء السيارة ليمتص صدمات الحصى والخدوش اليومية. معظم الأفلام الحديثة تُصلح الخدوش الدقيقة ذاتياً مع الحرارة، ويمكن تركيبه على كامل السيارة أو على الأجزاء الأكثر تعرضاً مثل الواجهة والمرايا.",
        text_en:
          "A clear polyurethane film applied over the car’s paint to absorb stone chips and everyday scratches. Most modern films heal fine scratches by themselves with heat, and it can be applied to the whole car or just the most exposed parts such as the front and the mirrors.",
      },
      { kind: "h2", id: "what-is-nano-ceramic", text_ar: "ما هو النانو سيراميك؟", text_en: "What is nano ceramic?" },
      {
        kind: "p",
        text_ar: "طبقة سائلة تُطبّق على الطلاء بعد تلميعه، وتتصلب لتكوّن سطحاً لامعاً يطرد الماء والأوساخ. تسهّل الغسيل وتحافظ على اللمعان، لكنها رقيقة ولا تحمي من الحصى أو الخدوش العميقة.",
        text_en: "A liquid coating applied to the paint after polishing, which hardens into a glossy surface that repels water and dirt. It makes washing easier and keeps the shine, but it’s thin and doesn’t protect against stone chips or deep scratches.",
      },
      {
        kind: "table",
        id: "quick-comparison",
        head: [
          { text_ar: "المقارنة", text_en: "Comparison" },
          { text_ar: "حماية PPF", text_en: "PPF" },
          { text_ar: "نانو سيراميك", text_en: "Nano ceramic" },
        ],
        rows: [
          [{ text_ar: "الحماية من الحصى والخدوش", text_en: "Protection from stone chips and scratches" }, { text_ar: "عالية", text_en: "High" }, { text_ar: "محدودة", text_en: "Limited" }],
          [{ text_ar: "اللمعان وطرد الماء", text_en: "Gloss and water repellency" }, { text_ar: "جيد", text_en: "Good" }, { text_ar: "عالٍ", text_en: "High" }],
          [{ text_ar: "إصلاح الخدوش الدقيقة ذاتياً", text_en: "Self-healing fine scratches" }, { text_ar: "نعم، مع الحرارة", text_en: "Yes, with heat" }, { text_ar: "لا", text_en: "No" }],
          [{ text_ar: "سهولة الغسيل", text_en: "Ease of washing" }, { text_ar: "جيدة", text_en: "Good" }, { text_ar: "ممتازة", text_en: "Excellent" }],
          [{ text_ar: "التكلفة", text_en: "Cost" }, { text_ar: "أعلى", text_en: "Higher" }, { text_ar: "أقل", text_en: "Lower" }],
          [{ text_ar: "الضمان", text_en: "Warranty" }, { text_ar: "حسب المنتج والمركز", text_en: "Depends on the product and center" }, { text_ar: "حسب المنتج والمركز", text_en: "Depends on the product and center" }],
        ],
      },
      { kind: "h2", id: "combine", text_ar: "هل يمكن الجمع بينهما؟", text_en: "Can you combine them?" },
      {
        kind: "p",
        text_ar: "نعم، وهو خيار شائع: يُركّب فيلم الحماية على الأجزاء الأمامية الأكثر تعرضاً للحصى، ثم تُطبّق طبقة سيراميك على باقي السيارة أو فوق الفيلم لتسهيل تنظيفه.",
        text_en: "Yes, and it’s a popular choice: the protection film goes on the front parts most exposed to stone chips, then a ceramic coating is applied to the rest of the car or over the film to make it easier to clean.",
      },
      {
        kind: "tip",
        title_ar: "نصيحة لينكار",
        title_en: "Linkar tip",
        text_ar: "اسأل المركز عن اسم المنتج ومدة الضمان قبل الحجز، وستجد الضمان مسجّلاً برقم قسيمتك بعد التنفيذ.",
        text_en: "Ask the center for the product name and warranty period before booking, and you’ll find the warranty registered to your voucher number after the work.",
      },
      { kind: "h2", id: "how-to-choose", text_ar: "كيف تختار؟", text_en: "How to choose?" },
      {
        kind: "list",
        items: [
          { text_ar: "سيارة جديدة وطرق سريعة كثيرة: ابدأ بحماية PPF للواجهة على الأقل.", text_en: "A new car and lots of highway driving: start with PPF on the front at least." },
          { text_ar: "تريد لمعاناً وسهولة في الغسيل بتكلفة أقل: النانو سيراميك يكفيك.", text_en: "You want gloss and easy washing at a lower cost: nano ceramic is enough." },
          { text_ar: "تريد الحماية الكاملة: اجمع بينهما في زيارة واحدة، وادفع مرة واحدة عبر لينكار.", text_en: "You want full protection: combine both in one visit, and pay once on Linkar." },
        ],
      },
    ],
    tags: [
      { text_ar: "الحماية والتظليل", text_en: "Protection and tinting" },
      { text_ar: "نانو سيراميك", text_en: "Nano ceramic" },
      { text_ar: "حماية PPF", text_en: "PPF" },
    ],
    cta_services: [
      { service: "ppf", label_ar: "قارن أسعار حماية PPF", label_en: "Compare PPF prices" },
      { service: "nano-ceramic", label_ar: "قارن أسعار النانو سيراميك", label_en: "Compare nano ceramic prices" },
    ],
    related: ["protect-paint-summer", "choose-tint-level", "signs-car-needs-polish"],
  },
  {
    slug: "protect-paint-summer",
    category: "care-tips",
    placeholder: true,
    title_ar: "كيف تحمي طلاء سيارتك من شمس الصيف؟",
    title_en: "How do you protect your car’s paint from the summer sun?",
    crumb_ar: "حماية الطلاء من شمس الصيف",
    crumb_en: "Protecting paint from the summer sun",
    excerpt_ar: "الحرارة والأشعة فوق البنفسجية والغبار تُبهت الطلاء مع الوقت. خطوات بسيطة تحافظ على لمعانه.",
    excerpt_en: "Heat, UV rays and dust fade the paint over time. Simple steps keep it shining.",
    minutes: 4,
    date: "2026-10-14",
    photo: photos.sunset,
    related: ["ppf-vs-nano-ceramic", "common-wash-mistakes", "signs-car-needs-polish"],
  },
  {
    slug: "choose-tint-level",
    category: "protection",
    placeholder: true,
    title_ar: "كيف تختار درجة التظليل المناسبة لسيارتك؟",
    title_en: "How do you choose the right tint level for your car?",
    crumb_ar: "اختيار درجة التظليل",
    crumb_en: "Choosing a tint level",
    excerpt_ar: "نسبة العتامة ليست كل شيء: عزل الحرارة وحماية الأشعة ونوع الفيلم أهم مما تتوقع.",
    excerpt_en: "Darkness isn’t everything: heat rejection, UV protection and the film type matter more than you’d expect.",
    minutes: 5,
    date: "2026-10-10",
    photo: photos.tint,
    related: ["ppf-vs-nano-ceramic", "wrap-color-change", "protect-paint-summer"],
  },
  {
    slug: "signs-car-needs-polish",
    category: "care-tips",
    placeholder: true,
    title_ar: "5 علامات تخبرك أن سيارتك تحتاج إلى تلميع",
    title_en: "5 signs your car needs polishing",
    crumb_ar: "علامات تحتاج معها إلى تلميع",
    crumb_en: "Signs you need polishing",
    excerpt_ar: "خدوش دائرية، وبهتان، وبقع ماء لا تزول بالغسيل: إليك متى يكون التلميع هو الحل.",
    excerpt_en: "Swirl marks, fading and water spots that won’t wash off: here’s when polishing is the answer.",
    minutes: 3,
    date: "2026-10-06",
    photo: photos.polish,
    related: ["ppf-vs-nano-ceramic", "common-wash-mistakes", "protect-paint-summer"],
  },
  {
    slug: "common-wash-mistakes",
    category: "care-tips",
    placeholder: true,
    title_ar: "أخطاء شائعة في غسيل السيارة تضر الطلاء",
    title_en: "Common car-wash mistakes that damage the paint",
    crumb_ar: "أخطاء شائعة في الغسيل",
    crumb_en: "Common washing mistakes",
    excerpt_ar: "الغسيل تحت الشمس، والإسفنجة الخشنة، والصابون المنزلي: عادات تترك أثراً على الطلاء.",
    excerpt_en: "Washing in the sun, rough sponges and household soap: habits that leave their mark on the paint.",
    minutes: 4,
    date: "2026-09-30",
    photo: photos.wash,
    related: ["signs-car-needs-polish", "protect-paint-summer", "ppf-vs-nano-ceramic"],
  },
  {
    slug: "wrap-color-change",
    category: "protection",
    placeholder: true,
    title_ar: "تغيير لون سيارتك بالتغليف: ما تحتاج معرفته",
    title_en: "Changing your car’s color with a wrap: what you need to know",
    crumb_ar: "تغيير اللون بالتغليف",
    crumb_en: "Color change with a wrap",
    excerpt_ar: "قبل أن تختار اللون، تعرّف على أنواع الأفلام، ومدة التركيب، ومتطلبات المرور.",
    excerpt_en: "Before you pick a color, learn about film types, installation time and traffic requirements.",
    minutes: 5,
    date: "2026-09-24",
    photo: photos.night,
    related: ["ppf-vs-nano-ceramic", "choose-tint-level", "protect-paint-summer"],
  },
  {
    slug: "use-digital-voucher",
    category: "guides",
    placeholder: true,
    title_ar: "كيف تستخدم قسيمتك الرقمية في الفرع؟",
    title_en: "How do you use your digital voucher at the branch?",
    crumb_ar: "استخدام القسيمة الرقمية",
    crumb_en: "Using the digital voucher",
    excerpt_ar: "من لحظة الدفع حتى استلام سيارتك: أين تجد القسيمة، وماذا تعرض في الفرع.",
    excerpt_en: "From the moment you pay until you pick up your car: where to find the voucher, and what to show at the branch.",
    minutes: 2,
    date: "2026-09-18",
    photo: photos.sunset,
    related: ["ppf-vs-nano-ceramic", "signs-car-needs-polish", "common-wash-mistakes"],
  },
];

// ترتيب الكروت في W2-100 (من اليمين): الصف الأول ثم التاني
export const blogGridOrder = ["protect-paint-summer", "choose-tint-level", "signs-car-needs-polish", "common-wash-mistakes", "wrap-color-change", "use-digital-voucher"];
// W2-100 بيعرض 3 صفحات في الترقيم (الصفحة 1 نشطة) — المقالات الحالية كلها في الصفحة الأولى
export const blogPageCount = 3;
