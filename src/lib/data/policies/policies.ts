import { routes } from "@/lib/routes";

// W2-99 · الشروط والأحكام (762:14207) · W2-99b · سياسة الخصوصية (762:14616)
// W2-99c · الإلغاء والاسترداد (762:15018 — «مسودة — بانتظار اعتماد السياسة»)
// W2-99d · الضمان والشكاوى (762:15420) · W2-99e · شروط مقدّمي الخدمة (762:15822)
// نفس القالب (قائمة السياسات + مستند البنود). العربي من الفيجما بالحرف، الإنجليزي ترجمتنا (للمراجعة) —
// الترجمة الإنجليزية للنصوص القانونية لازم تتراجع قانونياً قبل الإطلاق.

export type PolicySlug = "terms" | "privacy" | "cancellation" | "warranty" | "provider-terms";

export type PolicyClause = { title_ar: string; title_en: string; body_ar: string; body_en: string };

export type Policy = {
  slug: PolicySlug;
  href: string;
  title_ar: string;
  title_en: string;
  updated: string; // ISO
  read_minutes: number;
  draft?: boolean;
  clauses: PolicyClause[];
};

export const policiesCopy = {
  nav_title_ar: "السياسات",
  nav_title_en: "Policies",
  updated_ar: "آخر تحديث: {date} · مدة القراءة {n} دقائق",
  updated_en: "Last updated: {date} · {n} min read",
  // {contact} = رابط «تواصل معنا» · {email} = البريد
  ask_ar: "لديك سؤال عن هذه السياسة؟ تواصل معنا من صفحة {contact} أو عبر {email}.",
  ask_en: "Have a question about this policy? Contact us from the {contact} page or at {email}.",
  ask_contact_ar: "«تواصل معنا»",
  ask_contact_en: "Contact us",
  email: "info@linkarksa.com",
};

export const policies: Policy[] = [
  {
    slug: "terms",
    href: routes.terms,
    title_ar: "الشروط والأحكام",
    title_en: "Terms and conditions",
    updated: "2026-10-11",
    read_minutes: 7,
    clauses: [
      {
        title_ar: "1. التعريفات",
        title_en: "1. Definitions",
        body_ar:
          "«لينكار» أو «المنصة»: الموقع الإلكتروني وتطبيقات الجوال التي تتيح حجز خدمات العناية بالسيارات لدى مقدّمي الخدمة المسجّلين. «مقدّم الخدمة»: أي منشأة معتمدة تقدّم خدماتها عبر المنصة، مركزاً كانت أو مغسلة أو شركة.",
        body_en:
          "“Linkar” or “the Platform”: the website and mobile apps that allow booking car care services with registered service providers. “Service provider”: any certified business offering its services through the Platform, whether a center, a car wash or a company.",
      },
      {
        title_ar: "2. استخدام المنصة",
        title_en: "2. Using the Platform",
        body_ar: "يلتزم المستخدم بتقديم بيانات صحيحة، واستخدام المنصة لأغراض مشروعة، وعدم إساءة استخدام التقييمات، وعدم إتمام الحجز مع مقدّم الخدمة خارج المنصة.",
        body_en: "Users must provide accurate information, use the Platform for lawful purposes, not misuse reviews, and not complete bookings with a provider outside the Platform.",
      },
      {
        title_ar: "3. الحجز والدفع",
        title_en: "3. Booking and payment",
        body_ar:
          "تختار خدمة أو أكثر من مقدّم خدمة واحد والفرع، ثم تدفع إلكترونياً فيتأكد الحجز فوراً وتصلك القسيمة. الأسعار شاملة ضريبة القيمة المضافة وحسب نوع السيارة، ولا يُقبل الدفع لدى مقدّم الخدمة.",
        body_en:
          "You choose one or more services from a single provider and the branch, then pay online; the booking is confirmed instantly and you receive the voucher. Prices include VAT and depend on the car type, and payment at the provider is not accepted.",
      },
      {
        title_ar: "4. القسيمة والزيارة",
        title_en: "4. Voucher and visit",
        body_ar: "تصلك قسيمة صالحة 14 يوماً من الدفع، وتعرضها عند زيارتك للفرع الذي اخترته. لا يتوفر إلغاء الحجز أو تغييره من الموقع.",
        body_en: "You receive a voucher valid for 14 days from payment, which you show when you visit the branch you chose. Bookings can't be cancelled or changed from the website.",
      },
      {
        title_ar: "5. النقاط والهدايا",
        title_en: "5. Points and gifts",
        body_ar:
          "تُضاف النقاط عند اكتمال الخدمة، وكل 100 نقطة = 2 ر.س حتى 30% من قيمة الحجز، وتنتهي بعد 12 شهراً. هدايا الوكالات مرتبطة برقم الجوال المسجّل لدى الوكالة ولا تُستبدل بمبلغ نقدي.",
        body_en:
          "Points are added when the service is completed; every 100 points = SAR 2, up to 30% of the booking value, and they expire after 12 months. Dealership gifts are tied to the mobile number registered with the dealership and can't be exchanged for cash.",
      },
      {
        title_ar: "6. التقييمات",
        title_en: "6. Reviews",
        body_ar: "التقييم متاح لمن أكمل الحجز خلال 30 يوماً، ويظهر باسمك الأول وحرف من اسم العائلة، ويستطيع مقدّم الخدمة الرد عليه مرة واحدة.",
        body_en: "Reviews are available to customers who completed the booking, within 30 days; they show your first name and last initial, and the provider can reply once.",
      },
      {
        title_ar: "7. المسؤولية",
        title_en: "7. Liability",
        body_ar: "لينكار منصة تقنية تربطك بمقدّم الخدمة؛ ومقدّم الخدمة مسؤول عن تنفيذ الخدمة وضمانها، ويتدخل فريق لينكار عبر الشكاوى حتى الحل.",
        body_en: "Linkar is a technology platform that connects you with the provider; the provider is responsible for performing and guaranteeing the service, and the Linkar team steps in through complaints until resolution.",
      },
      {
        title_ar: "8. القانون المطبّق",
        title_en: "8. Governing law",
        body_ar: "تخضع هذه الشروط لأنظمة المملكة العربية السعودية، ونبلغك بأي تعديل جوهري قبل سريانه.",
        body_en: "These terms are governed by the laws of the Kingdom of Saudi Arabia, and we'll notify you of any material change before it takes effect.",
      },
    ],
  },
  {
    slug: "privacy",
    href: routes.privacy,
    title_ar: "سياسة الخصوصية",
    title_en: "Privacy policy",
    updated: "2026-10-11",
    read_minutes: 5,
    clauses: [
      {
        title_ar: "1. البيانات التي نجمعها",
        title_en: "1. Data we collect",
        body_ar:
          "اسمك ورقم جوالك للتحقق، وبريدك الإلكتروني إن أضفته، وبيانات سياراتك ولوحاتها، وموقعك التقريبي أو عناوينك المحفوظة عند السماح، وسجل حجوزاتك وتقييماتك.",
        body_en:
          "Your name and mobile number for verification, your email if you add it, your cars and their plates, your approximate location or saved addresses when you allow it, and your booking and review history.",
      },
      {
        title_ar: "2. لماذا نجمعها",
        title_en: "2. Why we collect it",
        body_ar: "لتأكيد حجوزاتك وإرسال القسائم والتذكيرات، وعرض الأسعار حسب حجم سيارتك، وإظهار الفروع الأقرب لك.",
        body_en: "To confirm your bookings and send vouchers and reminders, show prices for your car's size, and show the branches closest to you.",
      },
      {
        title_ar: "3. ما يراه مقدّم الخدمة",
        title_en: "3. What the provider sees",
        body_ar: "اسمك الأول وبيانات السيارة والخدمات وملاحظات الحجز. يظهر رقم جوالك لمقدّم الخدمة بعد تأكيد الحجز فقط، ولأغراض الحجز وحده.",
        body_en: "Your first name, car details, services and booking notes. Your mobile number is shown to the provider only after the booking is confirmed, and only for the booking.",
      },
      {
        title_ar: "4. الدفع",
        title_en: "4. Payment",
        body_ar: "لا تحتفظ لينكار ببيانات بطاقتك؛ تُعالج المدفوعات عبر مزوّد دفع مرخّص، وتصلك الفاتورة الضريبية في حسابك.",
        body_en: "Linkar doesn't store your card details; payments are processed by a licensed payment provider, and your tax invoice arrives in your account.",
      },
      {
        title_ar: "5. الوكالات والهدايا",
        title_en: "5. Dealerships and gifts",
        body_ar: "ترى الوكالة حالة هديتها فقط (أُرسلت · استُلمت · محجوزة · مستخدمة)، ولا ترى حجوزاتك الأخرى أو تقييماتك.",
        body_en: "The dealership only sees the status of its gift (sent · received · booked · used), not your other bookings or reviews.",
      },
      {
        title_ar: "6. حقوقك",
        title_en: "6. Your rights",
        body_ar: "يمكنك الاطلاع على بياناتك وتحميلها وتصحيحها، وطلب حذف حسابك وفق شروط الحذف المذكورة في الإعدادات.",
        body_en: "You can view, download and correct your data, and request deletion of your account under the deletion terms described in Settings.",
      },
    ],
  },
  {
    // مسودة — بانتظار اعتماد السياسة (اسم الفريم). البند 5 «إذا ألغى مقدّم الخدمة» مخفي في الفيجما،
    // والترقيم المعروض 1-2-3-4-6 زي الفيجما بالحرف.
    slug: "cancellation",
    href: routes.cancellation,
    title_ar: "الإلغاء والاسترداد",
    title_en: "Cancellation and refunds",
    updated: "2026-10-11",
    read_minutes: 4,
    draft: true,
    clauses: [
      {
        title_ar: "1. قبل الدفع",
        title_en: "1. Before payment",
        body_ar: "لا يوجد حجز قبل الدفع، ولا تُخصم أي رسوم.",
        body_en: "There's no booking before payment, and no fees are charged.",
      },
      {
        title_ar: "2. بعد الدفع",
        title_en: "2. After payment",
        body_ar: "لا يتوفر إلغاء الحجز أو تغييره من الموقع بعد الدفع.",
        body_en: "Bookings can't be cancelled or changed from the website after payment.",
      },
      {
        title_ar: "3. طلبات الإلغاء والاسترداد",
        title_en: "3. Cancellation and refund requests",
        body_ar: "يتعامل معها مقدّم الخدمة مباشرة وفق سياسته.",
        body_en: "These are handled directly by the provider according to their own policy.",
      },
      {
        title_ar: "4. صلاحية القسيمة",
        title_en: "4. Voucher validity",
        body_ar: "القسيمة صالحة 14 يوماً من الدفع، وتعرضها عند زيارتك للفرع.",
        body_en: "The voucher is valid for 14 days from payment, and you show it when you visit the branch.",
      },
      {
        title_ar: "6. الهدايا والباقات",
        title_en: "6. Gifts and packages",
        body_ar: "الهدية صالحة حتى تاريخها ولا تُستبدل بمبلغ نقدي، وتنطبق صلاحية القسيمة على كل زيارة من زيارات الباقة.",
        body_en: "A gift is valid until its expiry date and can't be exchanged for cash, and the voucher validity applies to each visit in a package.",
      },
    ],
  },
  {
    slug: "warranty",
    href: routes.warranty,
    title_ar: "الضمان والشكاوى",
    title_en: "Warranty and complaints",
    updated: "2026-10-11",
    read_minutes: 4,
    clauses: [
      {
        title_ar: "1. ضمان مقدّم الخدمة",
        title_en: "1. Provider warranty",
        body_ar: "كل خدمة تحمل ضمان مقدّم الخدمة المذكور في صفحتها، ويُسجَّل برقم القسيمة وباسمك، ويظهر في تفاصيل الحجز.",
        body_en: "Every service carries the provider warranty stated on its page; it's registered with the voucher number and your name, and shows in the booking details.",
      },
      {
        title_ar: "2. متى تفتح شكوى",
        title_en: "2. When to open a complaint",
        body_ar: "خلال 7 أيام من اكتمال الحجز لأي مشكلة في التنفيذ، أو خلال مدة الضمان للمشكلات التي يشملها.",
        body_en: "Within 7 days of the booking being completed for any problem with the work, or within the warranty period for issues it covers.",
      },
      {
        title_ar: "3. كيف تفتح شكوى",
        title_en: "3. How to open a complaint",
        body_ar: "من «حسابي ← الشكاوى والمقترحات»: اختر الحجز ونوع المشكلة، واكتب الوصف وأرفق الصور، واختر الحل الذي تفضّله.",
        body_en: "From “My account → Complaints and suggestions”: choose the booking and the type of problem, write a description, attach photos and pick the solution you prefer.",
      },
      {
        title_ar: "4. ماذا يحدث بعدها",
        title_en: "4. What happens next",
        body_ar: "يرد فريق لينكار خلال 24 ساعة، ويتواصل مع مقدّم الخدمة ويقترح حلاً: إعادة الخدمة أو استرداداً جزئياً أو كاملاً، وتتابع كل خطوة في صفحة الشكوى.",
        body_en: "The Linkar team replies within 24 hours, contacts the provider and proposes a solution — redoing the service or a partial or full refund — and you follow every step on the complaint page.",
      },
      {
        title_ar: "5. إن لم يرضك الحل",
        title_en: "5. If you're not satisfied with the solution",
        body_ar: "يمكنك طلب مراجعة من مشرف في لينكار قبل إغلاق الشكوى، ويصلك القرار النهائي كتابياً.",
        body_en: "You can ask a Linkar supervisor to review it before the complaint is closed, and you'll receive the final decision in writing.",
      },
      {
        title_ar: "6. ما لا يشمله الضمان",
        title_en: "6. What the warranty doesn't cover",
        body_ar: "الأضرار الناتجة عن حادث أو سوء استخدام، أو تعديل الخدمة لدى جهة أخرى بعد التنفيذ.",
        body_en: "Damage caused by an accident or misuse, or the work being altered elsewhere after it was done.",
      },
    ],
  },
  {
    slug: "provider-terms",
    href: routes.providerTerms,
    title_ar: "شروط مقدّمي الخدمة",
    title_en: "Provider terms",
    updated: "2026-10-11",
    read_minutes: 5,
    clauses: [
      {
        title_ar: "1. الانضمام",
        title_en: "1. Joining",
        body_ar:
          "يُقبل مقدّم الخدمة بعد التحقق من السجل التجاري والتراخيص واجتياز التقييم الميداني، ويُصنَّف بلاتيني أو ذهبي أو فضي، وتُمنح شارة «معتمد LINKAR» بعد فترة تجربة 90 يوماً. ولا يظهر للعملاء قبل اكتمال التحقق.",
        body_en:
          "A provider is accepted after verifying their commercial registration and licenses and passing the on-site assessment; they're rated platinum, gold or silver, and receive the “LINKAR certified” badge after a 90-day trial period. They aren't shown to customers until verification is complete.",
      },
      {
        title_ar: "2. الفروع وساعات العمل",
        title_en: "2. Branches and working hours",
        body_ar: "يحدّث مقدّم الخدمة فروعه وساعات عمله من لوحته، وكل حجز مدفوع مؤكد وملزم دون حاجة لقبول.",
        body_en: "Providers keep their branches and working hours up to date from their dashboard, and every paid booking is confirmed and binding without needing acceptance.",
      },
      {
        title_ar: "3. الأسعار",
        title_en: "3. Prices",
        body_ar: "شاملة الضريبة وحسب حجم السيارة، والسعر المعروض وقت الدفع هو السعر النهائي للعميل.",
        body_en: "Prices include VAT and depend on the car's size, and the price shown at payment is the customer's final price.",
      },
      {
        title_ar: "4. الأعمال الإضافية",
        title_en: "4. Additional work",
        body_ar: "لا يُنفَّذ أي عمل إضافي إلا بعد موافقة العميل ودفعه عبر لينكار.",
        body_en: "No additional work is carried out without the customer's approval and payment through Linkar.",
      },
      {
        title_ar: "5. العمولة والمستحقات",
        title_en: "5. Commission and payouts",
        body_ar: "لا رسوم تسجيل. تُحتسب العمولة على الحجوزات المكتملة فقط، وتُحوَّل المستحقات دورياً مع كشف حساب لكل حجز.",
        body_en: "No registration fees. Commission is charged on completed bookings only, and payouts are transferred periodically with a statement for every booking.",
      },
      {
        title_ar: "6. الإلغاء والاسترداد",
        title_en: "6. Cancellation and refunds",
        body_ar: "يتعامل مقدّم الخدمة مع طلبات الإلغاء والاسترداد مباشرة مع العميل وفق سياسته المعلنة.",
        body_en: "Providers handle cancellation and refund requests directly with the customer according to their published policy.",
      },
    ],
  },
];
