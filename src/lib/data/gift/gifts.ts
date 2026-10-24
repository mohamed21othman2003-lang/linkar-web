// 07 · روابط الرسائل النصية — باقة الوكالة (W2-80 · W2-80b · W2-80c · W2-80e)
// الرابط اللي بيوصل العميل في رسالة SMS: /gift/<code>. الكود هنا هو رقم الحجز الظاهر في الفيجما.
// المصدر: W2-80 (757:11310) · W2-80b (757:11766) · W2-80c (757:12166) · W2-80e (757:13054)
import type { Localized } from "@/i18n/config";

type L<K extends string> = Localized<K>;

export type GiftStep = L<"title"> & L<"body"> & { icon: "lock" | "qr" | "check" };

// بيانات نافذة «تواصل مع الفرع» (P-07 · 834:3)
export type BranchContact = L<"title"> &
  L<"address"> & {
    logo: string;
    // [placeholder] الفيجما مافيهاش رقم الفرع ولا رابط الخريطة الحقيقي
    phone: string;
    whatsapp: string;
    maps_url: string;
  };

export const johnsonZahraa: BranchContact = {
  logo: "/figma/logos/johnson.png",
  title_ar: "جونسون Johnson · فرع الزهراء",
  title_en: "Johnson · Al Zahraa branch",
  address_ar: "شارع الأمير سلطان، حي الزهراء، جدة",
  address_en: "Prince Sultan St, Al Zahraa, Jeddah",
  phone: "+966500000000",
  whatsapp: "966500000000",
  maps_url: "https://maps.google.com/?q=Johnson+Al+Zahra+Jeddah", // من زر «الاتجاهات» في W2-81
};

export type ActiveGift = {
  code: string;
  status: "active";
  booking_no: string;
  provider_slug: string;
  // اسم المستلم المختصر في سطر «رسالة نصية من لينكار إلى …»
  recipient: L<"name">;
  phone_masked: string; // الرقم المسجّل لدى الوكالة (مخفي جزئياً)
  otp_length: number;
} & L<"dealer"> & // «الريادة للسيارات»
  L<"title"> &
  L<"subtitle"> &
  L<"package"> & // «Johnson Ceramic Pro · سيدان»
  L<"car"> &
  L<"branch"> & // «جونسون Johnson · فرع الزهراء، جدة»
  L<"valid_until"> &
  L<"address"> &
  L<"purchase_date"> & {
    po_number: string;
    voucher_code: string;
    contact: BranchContact;
    includes: L<"label">[];
    steps: GiftStep[];
  };

// قسيمة منتهية: الصفحة بتعرض رسالة الانتهاء بس (W2-80e)
export type ExpiredGift = { code: string; status: "expired" };

export type AgencyGift = ActiveGift | ExpiredGift;

export const agencyGifts: AgencyGift[] = [
  {
    code: "BK-21414",
    status: "active",
    booking_no: "BK-21414",
    provider_slug: "johnson",
    recipient: { name_ar: "محمد س.", name_en: "Mohammed S." },
    phone_masked: "05X XXX XX67",
    otp_length: 4,
    dealer_ar: "الريادة للسيارات",
    dealer_en: "Al Riyada Motors",
    title_ar: "لديك باقة من الريادة للسيارات",
    title_en: "You have a package from Al Riyada Motors",
    subtitle_ar: "اشترت لك وكالة الريادة للسيارات باقة عناية لسيارتك الجديدة. تحقق من رقمك لعرض القسيمة، ثم زر الفرع المحدد.",
    subtitle_en: "Al Riyada Motors bought a care package for your new car. Verify your number to see the voucher, then visit the selected branch.",
    package_ar: "‏Johnson Ceramic Pro · سيدان",
    package_en: "Johnson Ceramic Pro · Sedan",
    car_ar: "تويوتا كامري 2026",
    car_en: "Toyota Camry 2026",
    branch_ar: "جونسون Johnson · فرع الزهراء، جدة",
    branch_en: "Johnson · Al Zahraa branch, Jeddah",
    valid_until_ar: "الثلاثاء 5 يناير 2027",
    valid_until_en: "Tuesday 5 January 2027",
    address_ar: "شارع الأمير سلطان، حي الزهراء",
    address_en: "Prince Sultan St, Al Zahraa",
    purchase_date_ar: "الأربعاء 7 أكتوبر 2026",
    purchase_date_en: "Wednesday 7 October 2026",
    po_number: "PO-2026-01406",
    voucher_code: "LK-3R7D-9KWA",
    contact: johnsonZahraa,
    includes: [
      { label_ar: "غسيل وتجهيز السطح", label_en: "Wash and surface prep" },
      { label_ar: "تلميع خفيف قبل التطبيق", label_en: "Light polish before application" },
      { label_ar: "تطبيق طبقة Johnson Ceramic Pro", label_en: "Johnson Ceramic Pro coating" },
    ],
    steps: [
      {
        icon: "lock",
        title_ar: "تحقق من رقمك",
        title_en: "Verify your number",
        body_ar: "برمز يصل إلى جوالك المسجّل لدى الوكالة.",
        body_en: "With a code sent to the mobile number registered with the dealer.",
      },
      {
        icon: "qr",
        title_ar: "اعرض القسيمة",
        title_en: "Show the voucher",
        body_ar: "عند زيارتك لفرع الزهراء أو بعد التواصل معه.",
        body_en: "When you visit the Al Zahraa branch or after contacting it.",
      },
      {
        icon: "check",
        title_ar: "يكتمل الحجز",
        title_en: "Booking completed",
        body_ar: "بعد أن يتحقق الفرع من القسيمة.",
        body_en: "Once the branch verifies the voucher.",
      },
    ],
  },
  // كود تجريبي لحالة «منتهية الصلاحية» (W2-80e) — الفيجما مافيهاش رقم للحالة دي
  { code: "BK-20318", status: "expired" },
];
