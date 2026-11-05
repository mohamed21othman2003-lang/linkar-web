// W2-74 · ضماناتي (202:22768) + P-30 · شهادة الضمان (202:27073) — شهادات الضمان لخدمات العميل التجريبي «محمد سالم»
// الضمان الساري من حجز التلميع المكتمل (BK-21388)، والتاني بيصدر بعد تنفيذ حجز جونسون (BK-21452)

export const warrantiesPage = {
  title_ar: "ضماناتي",
  title_en: "My warranties",
  description_ar: "شهادات الضمان لخدماتك المكتملة. اعرض رمز الشهادة في الفرع لطلب خدمة الضمان.",
  description_en: "Warranty certificates for your completed services. Show the certificate code at the branch to claim warranty service.",
  booking_ar: "الحجز",
  booking_en: "Booking",
  valid_until_ar: "صالح حتى",
  valid_until_en: "Valid until",
  car_ar: "السيارة",
  car_en: "Car",
  certificate_no_ar: "رقم الشهادة",
  certificate_no_en: "Certificate no.",
  expected_ar: "الضمان المتوقع",
  expected_en: "Expected warranty",
  view_ar: "عرض الشهادة",
  view_en: "View certificate",
  note_ar: "الضمان صالح في أي فرع لمقدّم الخدمة نفسه، وينتقل مع السيارة إذا بعتها. لأي خلاف حول الضمان تواصل مع لينكار من «الشكاوى والمقترحات».",
  note_en: "The warranty is valid at any branch of the same provider and moves with the car if you sell it. For any warranty dispute, contact Linkar from “Complaints and suggestions”.",
  // P-30
  popup_title_ar: "شهادة الضمان",
  popup_title_en: "Warranty certificate",
  popup_status_ar: "الحالة",
  popup_status_en: "Status",
  popup_provider_ar: "مقدّم الخدمة",
  popup_provider_en: "Provider",
  popup_service_ar: "الخدمة",
  popup_service_en: "Service",
  popup_duration_ar: "المدة",
  popup_duration_en: "Duration",
  popup_covers_ar: "يغطي",
  popup_covers_en: "Covers",
  popup_note_ar: "الضمان صالح في أي فرع للمركز نفسه، وينتقل مع السيارة إذا بعتها. لأي خلاف تواصل مع لينكار من «الشكاوى والمقترحات».",
  popup_note_en: "The warranty is valid at any branch of the same center and moves with the car if you sell it. For any dispute, contact Linkar from “Complaints and suggestions”.",
  popup_close_ar: "إغلاق",
  popup_close_en: "Close",
};

type L = { ar: string; en: string };

export type Warranty =
  | {
      status: "active";
      booking: string;
      title: L;
      provider: L; // «مركز لمعة للتلميع · فرع السلامة»
      valid_until: L;
      car: L;
      certificate: string;
      remaining: number; // نسبة المدة المتبقية (شريط التقدّم)
      // P-30
      status_line: L;
      show_at: L;
      service_line: L;
      car_line: L;
      duration: L;
      covers: L;
    }
  | {
      status: "pending";
      booking: string;
      title: L;
      provider: L;
      car: L;
      expected: L;
      note: L;
    };

export const statusLabels = {
  active: { ar: "ساري", en: "Active" },
  pending: { ar: "يصدر بعد التنفيذ", en: "Issued after the service" },
};

export const warranties: Warranty[] = [
  {
    status: "active",
    booking: "BK-21388",
    title: { ar: "تلميع خارجي · 3 مراحل", en: "Exterior polish · 3 stages" },
    provider: { ar: "مركز لمعة للتلميع · فرع السلامة", en: "Lamaa Polishing Center · Al Salamah branch" },
    valid_until: { ar: "8 أبريل 2027", en: "8 Apr 2027" },
    car: { ar: "لكزس ES 2022", en: "Lexus ES 2022" },
    certificate: "WR-2026-00405",
    remaining: 861 / 928,
    status_line: { ar: "ساري · متبقٍ 5 أشهر و19 يوماً", en: "Active · 5 months and 19 days left" },
    show_at: { ar: "اعرض الرمز في أي فرع لمركز لمعة للتلميع", en: "Show the code at any Lamaa Polishing Center branch" },
    service_line: { ar: "تلميع خارجي · 3 مراحل · BK-21388", en: "Exterior polish · 3 stages · BK-21388" },
    car_line: { ar: "لكزس ES 2022 · ب ن د 5678", en: "Lexus ES 2022 · BND 5678" },
    duration: { ar: "6 أشهر · من 8 أكتوبر 2026 إلى 8 أبريل 2027", en: "6 months · 8 Oct 2026 to 8 Apr 2027" },
    covers: { ar: "عودة الخدوش الدقيقة · بهتان اللمعان", en: "Returning fine scratches · fading gloss" },
  },
  {
    status: "pending",
    booking: "BK-21452",
    title: { ar: "طلاء نانو سيراميك + تنظيف داخلي عميق", en: "Nano-ceramic coating + deep interior cleaning" },
    provider: { ar: "جونسون Johnson · فرع الزهراء", en: "Johnson · Al Zahraa branch" },
    car: { ar: "تويوتا كامري 2023", en: "Toyota Camry 2023" },
    expected: { ar: "9 سنوات على طلاء نانو سيراميك · بريميوم", en: "9 years on Nano-ceramic coating · Premium" },
    note: {
      ar: "يصدر المركز الشهادة بعد تنفيذ الخدمة ومسح القسيمة، وتصلك برسالة وتظهر هنا برمز QR.",
      en: "The center issues the certificate after the service is done and the voucher is scanned; you get it by message and it appears here with a QR code.",
    },
  },
];
