// W2-93 · برامج الشركات (تصميم العميل المعدّل 85:46285) — صفحة كاملة: مقدمة + البرامج + الخطوات + المزايا + لمن + اطلب عرضاً + أسئلة
// العربي من الفيجما بالحرف، الإنجليزي ترجمتنا. العناصر المعلّمة «صياغتنا» مش في الفيجما.
import type { ServiceSlug } from "@/lib/data/types";
import type { Card, Faq, PageHead, Txt } from "./types";

type Program = Card & { photo: string; points: Txt[] };
type Audience = Card & { link?: Txt & { href_key: "dealers" } };

export const corporatePage = {
  head: {
    crumb_ar: "برامج الشركات",
    crumb_en: "Corporate programs",
    title_ar: "برامج الشركات",
    title_en: "Corporate programs",
    description_ar: "برامج عناية لسيارات شركتك وموظفيك لدى مقدّمي خدمة معتمدين، بأسعار متفق عليها ومتابعة من مكان واحد.",
    description_en: "Care programs for your company cars and employees at certified providers, at agreed prices and tracked from one place.",
  } satisfies PageHead,

  // Band · مقدمة
  intro: {
    overline_ar: "لينكار للأعمال",
    overline_en: "Linkar for business",
    title_ar: "عناية سيارات شركتك، من منصة واحدة",
    title_en: "Care for your company cars, from one platform",
    body_ar:
      "سواء كان لديك أسطول سيارات أو تريد ميزة إضافية لموظفيك، نصمّم لك برنامجاً بأسعار متفق عليها لدى مقدّمي خدمة معتمدين قريبين من مواقع عملكم.",
    body_en:
      "Whether you run a fleet or want an extra perk for your employees, we design a program at agreed prices with certified providers close to your work sites.",
    cta_offer_ar: "اطلب عرضاً لشركتك",
    cta_offer_en: "Request an offer for your company",
    cta_contact_ar: "تواصل مع فريق الأعمال",
    cta_contact_en: "Contact the business team",
    photo: "/figma/business/corporate-hero.jpg",
    chip_ar: "قسيمة رقمية لكل زيارة",
    chip_en: "A digital voucher for every visit",
    card: {
      title_ar: "أسطول شركتك",
      title_en: "Your company fleet",
      pill_ar: "هذا الشهر",
      pill_en: "This month",
      rows: [
        { service: "wash", text_ar: "غسيل دوري · 18 سيارة", text_en: "Regular wash · 18 cars" },
        { service: "tint", text_ar: "تظليل · 6 سيارات", text_en: "Tinting · 6 cars" },
        { service: "ppf", text_ar: "حماية PPF · سيارتان", text_en: "PPF protection · 2 cars" },
      ] as (Txt & { service: ServiceSlug })[],
      total_ar: "26 زيارة",
      total_en: "26 visits",
      note_ar: "فاتورة ضريبية لكل خدمة",
      note_en: "A tax invoice for every service",
    },
  },

  // Band · البرامج (غامق)
  programs: {
    overline_ar: "برامجنا",
    overline_en: "Our programs",
    title_ar: "ثلاثة برامج، واحد منها يناسب شركتك",
    title_en: "Three programs, one of them fits your company",
    body_ar: "نبدأ من احتياجكم: عدد السيارات، والخدمات، والمدن التي تعملون فيها.",
    body_en: "We start from your needs: the number of cars, the services, and the cities you operate in.",
    items: [
      {
        icon: "car",
        photo: "/figma/business/program-fleet.jpg",
        title_ar: "عناية الأسطول",
        title_en: "Fleet care",
        body_ar: "غسيل دوري وتظليل وحماية لسيارات شركتك، في فروع قريبة من مواقع عملكم.",
        body_en: "Regular washing, tinting and protection for your company cars, at branches close to your work sites.",
        points: [
          { text_ar: "جدول زيارات حسب احتياجكم", text_en: "A visit schedule that fits your needs" },
          { text_ar: "قسيمة رقمية لكل سيارة", text_en: "A digital voucher for every car" },
          { text_ar: "سجل خدمات لكل سيارة", text_en: "A service record for every car" },
        ],
      },
      {
        icon: "users",
        photo: "/figma/business/program-employees.jpg",
        title_ar: "مزايا الموظفين",
        title_en: "Employee perks",
        body_ar: "أسعار خاصة لموظفيك على خدمات العناية، يحجزونها بأنفسهم من لينكار.",
        body_en: "Special prices on care services for your employees, who book them on Linkar themselves.",
        points: [
          { text_ar: "كود خاص بشركتك", text_en: "A code for your company" },
          { text_ar: "أسعار متفق عليها", text_en: "Agreed prices" },
          { text_ar: "دون أي إدارة من طرفكم", text_en: "Nothing to manage on your side" },
        ],
      },
      {
        icon: "gift",
        photo: "/figma/business/program-gifts.jpg",
        title_ar: "هدايا وحوافز",
        title_en: "Gifts and incentives",
        body_ar: "أهدِ موظفيك أو عملاءك باقات عناية تصلهم برسالة نصية، ويختارون الفرع والموعد.",
        body_en: "Gift your employees or customers care packages that arrive by text message — they choose the branch and the time.",
        points: [
          { text_ar: "باقات جاهزة أو مخصّصة", text_en: "Ready-made or custom packages" },
          { text_ar: "قسيمة صالحة 90 يوماً", text_en: "Voucher valid for 90 days" },
          { text_ar: "تصل برسالة نصية", text_en: "Delivered by text message" },
        ],
      },
    ] satisfies Program[],
  },

  // Band · كيف يعمل
  how: {
    overline_ar: "كيف يعمل البرنامج",
    overline_en: "How the program works",
    title_ar: "من الطلب إلى أول زيارة، في أربع خطوات",
    title_en: "From request to first visit, in four steps",
    body_ar: "فريق لينكار للأعمال يرافقكم من أول طلب، ويبقى نقطة التواصل لحسابكم.",
    body_en: "The Linkar for business team is with you from the first request and stays your account’s point of contact.",
    steps: [
      { icon: "file", title_ar: "أرسل احتياج شركتك", title_en: "Send your company’s needs", body_ar: "عدد السيارات، والخدمات، والمدن التي تعملون فيها.", body_en: "The number of cars, the services, and the cities you operate in." },
      { icon: "users", title_ar: "نصمّم برنامجك", title_en: "We design your program", body_ar: "يتواصل معك فريق لينكار للأعمال خلال يوم عمل بعرض بأسعار متفق عليها.", body_en: "The Linkar for business team contacts you within one business day with an offer at agreed prices." },
      { icon: "qr", title_ar: "احجز أو وزّع القسائم", title_en: "Book or hand out vouchers", body_ar: "يحجز السائقون أو الموظفون عبر لينكار، وتصل قسيمة رقمية لكل زيارة.", body_en: "Drivers or employees book on Linkar, and a digital voucher arrives for every visit." },
      { icon: "chart", title_ar: "تابع من مكان واحد", title_en: "Track from one place", body_ar: "حالة كل حجز حتى الاستلام، مع فاتورة ضريبية لكل خدمة.", body_en: "The status of every booking until pickup, with a tax invoice for every service." },
    ] satisfies Card[],
  },

  // Band · لماذا لينكار للأعمال (صورة غامقة)
  why: {
    overline_ar: "لماذا لينكار للأعمال؟",
    overline_en: "Why Linkar for business?",
    title_ar: "عناية موثوقة لسياراتكم، دون أن تديروها بأنفسكم",
    title_en: "Reliable care for your cars, without managing it yourselves",
    photo: "/figma/business/corporate-why.jpg",
    items: [
      { icon: "check", title_ar: "مراكز مقيّمة ميدانياً", title_en: "Field-assessed centers", body_ar: "لا ينضم مركز قبل أن يجتاز تقييم لينكار، ويعاد تقييمه كل سنة.", body_en: "No center joins before passing Linkar’s assessment, and it is reassessed every year." },
      { icon: "tag", title_ar: "أسعار متفق عليها", title_en: "Agreed prices", body_ar: "سعر ثابت لكل خدمة ولكل حجم سيارة طوال مدة البرنامج.", body_en: "A fixed price for every service and car size for the whole program." },
      { icon: "receipt", title_ar: "فاتورة ضريبية لكل خدمة", title_en: "A tax invoice for every service", body_ar: "وكشف موحّد لكل الزيارات يسهّل المطابقة مع الإدارة المالية.", body_en: "Plus one statement for all visits that makes reconciliation easy for your finance team." },
      { icon: "gift", title_ar: "ضمان مزدوج", title_en: "Double warranty", body_ar: "ضمان مقدّم الخدمة على كل خدمة، ومتابعة لينكار لأي ملاحظة.", body_en: "The provider’s warranty on every service, and Linkar follows up on any issue." },
      { icon: "map-pin", title_ar: "فروع قريبة منكم", title_en: "Branches near you", body_ar: "نختار لكم الفروع الأقرب لمواقع عملكم وسكن موظفيكم.", body_en: "We pick the branches closest to your work sites and where your employees live." },
      { icon: "user", title_ar: "مسؤول لحسابكم", title_en: "A dedicated account manager", body_ar: "فريق لينكار للأعمال يتابع برنامجكم ويرد على طلباتكم.", body_en: "The Linkar for business team follows your program and answers your requests." },
    ] satisfies Card[],
  },

  // Band · لمن البرنامج
  audience: {
    overline_ar: "لمن هذه البرامج؟",
    overline_en: "Who are these programs for?",
    title_ar: "مصمّمة لأي شركة لديها سيارات أو موظفون يقودون",
    title_en: "Designed for any company with cars or employees who drive",
    items: [
      { icon: "car", title_ar: "شركات تأجير السيارات", title_en: "Car rental companies", body_ar: "نظافة وجاهزية دائمة لسياراتكم بين كل عميل وآخر.", body_en: "Your cars always clean and ready between one customer and the next." },
      { icon: "package", title_ar: "التوصيل والخدمات اللوجستية", title_en: "Delivery and logistics", body_ar: "غسيل دوري وحماية لسيارات تقطع مسافات طويلة يومياً.", body_en: "Regular washing and protection for cars that cover long distances every day." },
      { icon: "store", title_ar: "الشركات ذات الأسطول", title_en: "Companies with fleets", body_ar: "سيارات الإدارة والمبيعات والخدمة الميدانية.", body_en: "Management, sales and field-service cars." },
      { icon: "users", title_ar: "الجهات التي تهتم بموظفيها", title_en: "Employers who care for their staff", body_ar: "ميزة يستفيد منها كل موظف لديه سيارة.", body_en: "A perk for every employee who owns a car." },
      {
        icon: "gift",
        title_ar: "الوكالات ومعارض السيارات",
        title_en: "Dealerships and car showrooms",
        body_ar: "باقات تهدونها لعملائكم مع كل سيارة جديدة.",
        body_en: "Packages you gift your customers with every new car.",
        link: { text_ar: "برنامج الوكالات", text_en: "Dealership program", href_key: "dealers" },
      },
    ] satisfies Audience[],
  },

  // Band · اطلب عرضاً — النموذج + «بعد الإرسال»
  offer: {
    overline_ar: "اطلب عرضاً",
    overline_en: "Request an offer",
    title_ar: "أخبرنا عن شركتك، ونعود إليك خلال يوم عمل",
    title_en: "Tell us about your company, and we’ll get back to you within one business day",
    steps: [
      { title_ar: "أرسل الطلب", title_en: "Send the request", body_ar: "يصلنا طلبك ويُسجّل برقم مرجعي.", body_en: "We receive your request and log it with a reference number." },
      { title_ar: "نتصل بك", title_en: "We call you", body_ar: "يتواصل معك فريق لينكار للأعمال خلال يوم عمل.", body_en: "The Linkar for business team contacts you within one business day." },
      { title_ar: "تستلم العرض", title_en: "You receive the offer", body_ar: "عرض مكتوب بالخدمات والأسعار والفروع المقترحة.", body_en: "A written offer with the services, prices and suggested branches." },
      { title_ar: "نفعّل برنامجك", title_en: "We activate your program", body_ar: "وتبدأ أول زيارة لسياراتكم.", body_en: "And your cars’ first visit begins." },
    ] satisfies Card[],
    mail_label_ar: "أو راسلنا:",
    mail_label_en: "Or email us:",
  },

  // Band · أسئلة — إجابة السؤال الأول من الفيجما، والباقي «صياغتنا» (الفيجما بيعرضهم مقفولين)
  faq: {
    overline_ar: "أسئلة شائعة",
    overline_en: "FAQ",
    title_ar: "قبل أن تبدأ",
    title_en: "Before you start",
    items: [
      {
        q_ar: "هل يوجد حد أدنى لعدد السيارات؟",
        q_en: "Is there a minimum number of cars?",
        a_ar: "نصمّم البرنامج حسب عدد سياراتكم واحتياجكم، ويوضّح العرض أي حد أدنى إن وُجد.",
        a_en: "We design the program around your number of cars and needs, and the offer states any minimum if there is one.",
      },
      {
        q_ar: "كيف تتم الفوترة؟",
        q_en: "How does invoicing work?",
        // صياغتنا
        a_ar: "تصلكم فاتورة ضريبية لكل خدمة، وكشف موحّد لكل الزيارات يسهّل المطابقة مع الإدارة المالية.",
        a_en: "You receive a tax invoice for every service, plus one statement for all visits that makes reconciliation easy for your finance team.",
      },
      {
        q_ar: "هل يحجز الموظف بنفسه؟",
        q_en: "Do employees book by themselves?",
        // صياغتنا
        a_ar: "نعم في برنامج مزايا الموظفين: يحجز الموظف من لينكار بكود شركتك، وتصله قسيمة رقمية لكل زيارة.",
        a_en: "Yes, in the employee perks program: employees book on Linkar with your company code and receive a digital voucher for every visit.",
      },
      {
        q_ar: "في أي المدن تتوفر الخدمة؟",
        q_en: "Which cities is the service available in?",
        // صياغتنا
        a_ar: "نختار لكم الفروع الأقرب لمواقع عملكم في المدن التي تعملون فيها، ويوضّح العرض الفروع المقترحة.",
        a_en: "We pick the branches closest to your work sites in the cities you operate in, and the offer lists the suggested branches.",
      },
    ] satisfies Faq[],
  },

  form_title_ar: "اطلب عرضاً لشركتك",
  form_title_en: "Request an offer for your company",
  contact_ar: "اسم المسؤول",
  contact_en: "Contact person",
  contact_ph_ar: "الاسم الكامل",
  contact_ph_en: "Full name",
  phone_ar: "رقم الجوال",
  phone_en: "Mobile number",
  company_ar: "اسم الشركة",
  company_en: "Company name",
  company_ph_ar: "اسم الشركة كما في السجل التجاري",
  company_ph_en: "Company name as in the commercial registration",
  cars_ar: "عدد السيارات (تقريباً)",
  cars_en: "Number of cars (approx.)",
  cars_ph_ar: "مثال: 25",
  cars_ph_en: "e.g. 25",
  needs_ar: "احتياج شركتك",
  needs_en: "Your company’s needs",
  needs_ph_ar: "الخدمات التي تحتاجها شركتك، والمدن التي تعمل فيها سياراتها...",
  needs_ph_en: "The services your company needs, and the cities its cars operate in...",
  submit_ar: "إرسال الطلب",
  submit_en: "Send request",
};

export type CorporatePage = typeof corporatePage;
