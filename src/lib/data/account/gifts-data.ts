import type { Localized } from "@/i18n/config";
import type { UiGlyph } from "@/components/icons/Icon";

// W2-66 · باقات الوكالات (750:8219، نسخة v2) + W2-66-0 حالة فارغة (1071:469)
// القائمة الجانبية بتسمّيها «الهدايا» — النصوص هنا من الفيجما زي ما هي.

export const giftsPage = {
  title_ar: "باقات الوكالات",
  title_en: "Dealer packages",
  description_ar: "باقات العناية التي اشترتها لك وكالة سيارتك عبر لينكار، مع قسيمة تعرضها في الفرع المحدد.",
  description_en: "Care packages your car dealer bought for you through Linkar, with a voucher you show at the selected branch.",
  steps_title_ar: "كيف تستخدم باقتك؟",
  steps_title_en: "How do you use your package?",
  rule_ar: "الباقة مدفوعة من الوكالة ولا تحتاج إلى أي دفع. لتغيير الاسم أو رقم الجوال المرتبط بالقسيمة تواصل مع الوكالة التي اشتريت منها.",
  rule_en: "The package is paid for by the dealer and needs no payment. To change the name or mobile number linked to the voucher, contact the dealer you bought from.",
  view_voucher_ar: "عرض القسيمة",
  view_voucher_en: "View voucher",
  contact_branch_ar: "تواصل مع الفرع",
  contact_branch_en: "Contact the branch",
  // الحالة الفارغة
  empty_description_ar: "باقات العناية التي تشتريها لك وكالة سيارتك عبر لينكار تظهر هنا مع قسيمتها.",
  empty_description_en: "Care packages your car dealer buys for you through Linkar appear here with their voucher.",
  empty_title_ar: "لا توجد باقات من الوكالات حالياً",
  empty_title_en: "No dealer packages right now",
  empty_text_ar: "عندما تشتري لك وكالة سيارتك باقة عناية عبر لينكار، تظهر هنا مع قسيمتها والفرع المحدد، وتصلك رسالة نصية من لينكار.",
  empty_text_en: "When your car dealer buys you a care package through Linkar, it appears here with its voucher and branch, and you get a text message from Linkar.",
  empty_cta_ar: "تصفح الخدمات",
  empty_cta_en: "Browse services",
  empty_steps_title_ar: "كيف تعمل باقات الوكالات؟",
  empty_steps_title_en: "How do dealer packages work?",
};

export type GiftStep = Localized<"title"> & Localized<"text"> & { icon: UiGlyph };

// بترتيب الخطوات من بداية السطر
export const giftSteps: GiftStep[] = [
  { icon: "qr", title_ar: "اعرض القسيمة", title_en: "Show the voucher", text_ar: "اعرضها عند زيارتك لفرع الزهراء، أو تواصل مع الفرع لتنسيق زيارتك.", text_en: "Show it when you visit the Al Zahra branch, or contact the branch to arrange your visit." },
  { icon: "check", title_ar: "يتحقق الفرع منها", title_en: "The branch verifies it", text_ar: "يمسح الفرع رمز القسيمة ويتأكد من صلاحيتها.", text_en: "The branch scans the voucher code and checks it’s valid." },
  { icon: "star", title_ar: "يكتمل الحجز", title_en: "The booking is completed", text_ar: "بعد استخدام القسيمة يكتمل الحجز ويصلك طلب تقييم الخدمة.", text_en: "Once the voucher is used the booking is completed and you’re asked to review the service." },
];

export const giftEmptySteps: GiftStep[] = [
  { icon: "store", title_ar: "تشتري الوكالة الباقة", title_en: "The dealer buys the package", text_ar: "تختار وكالة سيارتك الباقة والفرع، وتسجّل اسمك ورقم جوالك.", text_en: "Your car dealer picks the package and branch, and registers your name and mobile number." },
  { icon: "message", title_ar: "تصلك رسالة من لينكار", title_en: "You get a message from Linkar", text_ar: "برابط القسيمة، وتظهر الباقة في حسابك تلقائياً.", text_en: "With the voucher link, and the package shows up in your account automatically." },
  { icon: "map-pin", title_ar: "زر الفرع واعرض القسيمة", title_en: "Visit the branch and show the voucher", text_ar: "يتحقق الفرع من القسيمة ويكتمل الحجز.", text_en: "The branch verifies the voucher and the booking is completed." },
];

export type DealerPackage = Localized<"title"> &
  Localized<"car"> &
  Localized<"valid"> &
  Localized<"branch"> & {
    booking: string;
    chips: (Localized<"label"> & { highlight?: boolean })[]; // من بداية السطر
    provider: string; // «تواصل مع الفرع» → صفحة المقدّم (رقم الفرع مش موجود في الفيجما)
  };

export const dealerPackages: DealerPackage[] = [
  {
    booking: "BK-21414",
    title_ar: "‏Johnson Ceramic Pro · سيدان",
    title_en: "Johnson Ceramic Pro · Sedan",
    car_ar: "لسيارتك تويوتا كامري 2026 · ‏BK-21414",
    car_en: "For your Toyota Camry 2026 · BK-21414",
    valid_ar: "صالحة حتى الثلاثاء 5 يناير 2027",
    valid_en: "Valid until Tue 5 Jan 2027",
    branch_ar: "جونسون Johnson · فرع الزهراء، جدة",
    branch_en: "Johnson · Al Zahra branch, Jeddah",
    chips: [
      { label_ar: "بانتظار الزيارة", label_en: "Awaiting visit", highlight: true },
      { label_ar: "من الريادة للسيارات", label_en: "From Al Riyada Motors" },
      { label_ar: "مدفوعة من الوكالة", label_en: "Paid by the dealer" },
    ],
    provider: "johnson",
  },
];
