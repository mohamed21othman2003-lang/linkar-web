import type { Localized } from "@/i18n/config";

// حجوزات العميل التجريبي «محمد سالم» — W2-38 (الجدول) + W2-37/37b/37c/37d (متابعة الحجز) + W2-37v (القسيمة كاملة).
// نفس الشكل اللي الـAPI هيرجّعه: النصوص _ar/_en، والأسماء لقطة وقت الحجز (اسم المركز والفرع كما في الفيجما).
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا.

export type BookingStatus = "waiting" | "in_service" | "completed" | "cancelled";
export type BookingTab = "upcoming" | "completed" | "cancelled";
export type BookingCar = "camry" | "es";
// زر الصف في الجدول: القسيمة · تتبّع · قيّم (غامق) — الفاتورة · التفاصيل (فاتح)
export type BookingRowAction = "voucher" | "track" | "rate" | "invoice" | "details";

export type TrackerStep = Localized<"label"> &
  Localized<"note"> & {
    state: "done" | "current" | "todo" | "cancelled";
  };

export type DetailRow = Localized<"label"> & Localized<"value"> & { tone?: "green" };
export type LogEntry = Localized<"time"> & Localized<"text"> & { tone: "green" | "red" };
export type ManageAction = "branch" | "support" | "rate" | "complaint";

export type BookingDetail = Localized<"status_label"> &
  Localized<"tip"> & {
    status_tone: "lime" | "red";
    tracker: TrackerStep[];
    tip_tone: "lime" | "red";
    voucher: Localized<"note"> & {
      code: string;
      state: "active" | "used" | "cancelled";
    };
    // «إدارة الحجز» أو «بعد الخدمة» — null = الفيجما مافيهاش الكارت (W2-37b)
    manage: (Localized<"title"> & { actions: (ManageAction | { kind: "complaint"; id: string; title_ar: string; title_en: string; sub_ar: string; sub_en: string })[] }) | null;
    rows: DetailRow[];
    log: LogEntry[];
  };

// W2-37v · القسيمة كاملة
export type VoucherFull = Localized<"valid_until"> &
  Localized<"services"> &
  Localized<"paid"> &
  Localized<"paid_at"> &
  Localized<"warranty">;

export type Booking = Localized<"provider"> &
  Localized<"branch"> &
  Localized<"address"> &
  Localized<"services_short"> &
  Localized<"car_short"> &
  Localized<"car"> &
  Localized<"date"> & {
    id: string;
    status: BookingStatus;
    provider_slug: string;
    car_key: BookingCar;
    date_iso: string;
    amount: number;
    action: BookingRowAction;
    maps_url: string;
    // تقييم الخدمة W2-63 (للحجوزات المكتملة): معيار خاص بالخدمة بعد المعايير الأربعة الثابتة
    rating?: Localized<"title_meta"> & Localized<"extra_criterion"> & Localized<"sample_comment"> & { sample: number[] };
    detail?: BookingDetail;
    voucher_full?: VoucherFull;
  };

export const bookings: Booking[] = [
  {
    id: "BK-21452",
    status: "waiting",
    action: "voucher",
    provider_slug: "johnson",
    provider_ar: "جونسون Johnson",
    provider_en: "Johnson",
    branch_ar: "فرع الزهراء",
    branch_en: "Al Zahra branch",
    address_ar: "شارع الأمير سلطان، حي الزهراء، جدة",
    address_en: "Prince Sultan St, Al Zahra, Jeddah",
    services_short_ar: "Johnson Ceramic Pro +1",
    services_short_en: "Johnson Ceramic Pro +1",
    car_key: "camry",
    car_short_ar: "كامري 2023",
    car_short_en: "Camry 2023",
    car_ar: "تويوتا كامري 2023 · سيدان · ر س ح 1234",
    car_en: "Toyota Camry 2023 · Sedan · RSH 1234",
    date_iso: "2026-10-11",
    date_ar: "الأحد 11 أكتوبر",
    date_en: "Sun 11 Oct",
    amount: 2323,
    maps_url: "https://maps.google.com/?q=Johnson+Al+Zahra+Jeddah",
    detail: {
      status_label_ar: "مؤكد · بانتظار زيارتك",
      status_label_en: "Confirmed · Awaiting your visit",
      status_tone: "lime",
      tracker: [
        { state: "done", label_ar: "تم الدفع", label_en: "Paid", note_ar: "الأحد 11 أكتوبر · 10:24 م", note_en: "Sun 11 Oct · 10:24 PM" },
        { state: "current", label_ar: "بانتظار الزيارة", label_en: "Awaiting visit", note_ar: "القسيمة صالحة حتى الأحد 25 أكتوبر", note_en: "Voucher valid until Sun 25 Oct" },
        { state: "todo", label_ar: "مكتمل", label_en: "Completed", note_ar: "—", note_en: "—" },
      ],
      tip_ar: "سنرسل لك إشعاراً عند وصول سيارتك للفرع، وعند بدء العمل، وعندما تجهز للاستلام.",
      tip_en: "We’ll notify you when your car arrives at the branch, when work starts, and when it’s ready for pickup.",
      tip_tone: "lime",
      voucher: { code: "LK-9F3K-7QPD", state: "active", note_ar: "أظهر الرمز في الفرع عند وصولك", note_en: "Show the code at the branch when you arrive" },
      manage: { title_ar: "إدارة الحجز", title_en: "Manage booking", actions: ["branch", "support"] },
      rows: [
        { label_ar: "صلاحية القسيمة", label_en: "Voucher validity", value_ar: "حتى الأحد 25 أكتوبر 2026", value_en: "Until Sun 25 Oct 2026" },
        { label_ar: "السيارة", label_en: "Car", value_ar: "تويوتا كامري 2023 · سيدان · ر س ح 1234", value_en: "Toyota Camry 2023 · Sedan · RSH 1234" },
        { label_ar: "Johnson Ceramic Pro", label_en: "Johnson Ceramic Pro", value_ar: "1,899 ر.س", value_en: "SAR 1,899" },
        { label_ar: "تفصيل داخلي كامل", label_en: "Full interior detailing", value_ar: "449 ر.س", value_en: "SAR 449" },
        { label_ar: "خصم النقاط", label_en: "Points discount", value_ar: "−25 ر.س", value_en: "−SAR 25", tone: "green" },
        { label_ar: "المدفوع", label_en: "Paid", value_ar: "2,323 ر.س · Apple Pay", value_en: "SAR 2,323 · Apple Pay" },
      ],
      log: [
        { tone: "green", time_ar: "الأحد 11 أكتوبر · 10:24 م", time_en: "Sun 11 Oct · 10:24 PM", text_ar: "تم الدفع وتأكيد الحجز فوراً", text_en: "Paid and booking confirmed instantly" },
        { tone: "green", time_ar: "الأحد 11 أكتوبر · 10:24 م", time_en: "Sun 11 Oct · 10:24 PM", text_ar: "أُرسلت القسيمة إلى جوالك وبريدك", text_en: "Voucher sent to your phone and email" },
      ],
    },
    voucher_full: {
      valid_until_ar: "الأحد 25 أكتوبر 2026",
      valid_until_en: "Sun 25 Oct 2026",
      services_ar: "‏Johnson Ceramic Pro + تفصيل داخلي كامل",
      services_en: "Johnson Ceramic Pro + Full interior detailing",
      paid_ar: "2,323 ر.س · Apple Pay",
      paid_en: "SAR 2,323 · Apple Pay",
      paid_at_ar: "الأحد 11 أكتوبر 2026 · 10:24 م",
      paid_at_en: "Sun 11 Oct 2026 · 10:24 PM",
      warranty_ar: "9 سنوات على Johnson Ceramic Pro",
      warranty_en: "9 years on Johnson Ceramic Pro",
    },
  },
  {
    id: "BK-21431",
    status: "in_service",
    action: "track",
    provider_slug: "xpel",
    provider_ar: "XPEL السعودية",
    provider_en: "XPEL Saudi Arabia",
    branch_ar: "فرع الروضة",
    branch_en: "Al Rawdah branch",
    address_ar: "حي الروضة، جدة",
    address_en: "Al Rawdah, Jeddah",
    services_short_ar: "باقة السيارة الجديدة",
    services_short_en: "New car package",
    car_key: "camry",
    car_short_ar: "كامري 2023",
    car_short_en: "Camry 2023",
    car_ar: "تويوتا كامري 2023 · سيدان · ر س ح 1234",
    car_en: "Toyota Camry 2023 · Sedan · RSH 1234",
    date_iso: "2026-10-07",
    date_ar: "الأربعاء 7 أكتوبر",
    date_en: "Wed 7 Oct",
    amount: 7800,
    maps_url: "https://maps.google.com/?q=XPEL+Al+Rawdah+Jeddah",
    detail: {
      status_label_ar: "في الخدمة · سيارتك في الفرع",
      status_label_en: "In service · Your car is at the branch",
      status_tone: "lime",
      tracker: [
        { state: "done", label_ar: "تم الدفع", label_en: "Paid", note_ar: "الأربعاء 7 أكتوبر · 4:12 م", note_en: "Wed 7 Oct · 4:12 PM" },
        { state: "current", label_ar: "بانتظار الزيارة", label_en: "Awaiting visit", note_ar: "استُخدمت القسيمة · 9:20 ص", note_en: "Voucher used · 9:20 AM" },
        { state: "todo", label_ar: "مكتمل", label_en: "Completed", note_ar: "نُشعرك فور جاهزية سيارتك", note_en: "We’ll notify you as soon as your car is ready" },
      ],
      tip_ar: "سيارتك في فرع الروضة · التسليم المتوقع اليوم 7:00 م. سنرسل لك إشعاراً فور اكتمال الخدمة.",
      tip_en: "Your car is at Al Rawdah branch · Expected handover today 7:00 PM. We’ll notify you as soon as the service is done.",
      tip_tone: "lime",
      voucher: {
        code: "LK-7M2C-X4RB",
        state: "used",
        note_ar: "استُخدمت القسيمة في فرع الروضة · السبت 10 أكتوبر",
        note_en: "Voucher used at Al Rawdah branch · Sat 10 Oct",
      },
      manage: null,
      rows: [
        { label_ar: "تاريخ الحجز", label_en: "Booking date", value_ar: "الأربعاء 7 أكتوبر 2026", value_en: "Wed 7 Oct 2026" },
        { label_ar: "السيارة", label_en: "Car", value_ar: "تويوتا كامري 2023 · سيدان · ر س ح 1234", value_en: "Toyota Camry 2023 · Sedan · RSH 1234" },
        { label_ar: "باقة السيارة الجديدة · 3 خدمات", label_en: "New car package · 3 services", value_ar: "7,800 ر.س", value_en: "SAR 7,800" },
        { label_ar: "المدفوع", label_en: "Paid", value_ar: "7,800 ر.س · mada", value_en: "SAR 7,800 · mada" },
      ],
      log: [
        { tone: "green", time_ar: "الأربعاء 7 أكتوبر · 4:12 م", time_en: "Wed 7 Oct · 4:12 PM", text_ar: "تم الدفع وتأكيد الحجز فوراً", text_en: "Paid and booking confirmed instantly" },
        { tone: "green", time_ar: "الأربعاء 7 أكتوبر · 4:12 م", time_en: "Wed 7 Oct · 4:12 PM", text_ar: "أُرسلت القسيمة إلى جوالك وبريدك", text_en: "Voucher sent to your phone and email" },
        // ⚠️ نص السطرين دول فاضي في الفيجما (W2-37b) — مأخوذ من نفس الخطوات في W2-37c مع اسم الفرع (للمراجعة)
        { tone: "green", time_ar: "السبت 10 أكتوبر · 9:20 ص", time_en: "Sat 10 Oct · 9:20 AM", text_ar: "استُخدمت القسيمة عند الوصول", text_en: "Voucher used on arrival" },
        { tone: "green", time_ar: "السبت 10 أكتوبر · 9:30 ص", time_en: "Sat 10 Oct · 9:30 AM", text_ar: "بدأت الخدمة في فرع الروضة", text_en: "Service started at Al Rawdah branch" },
      ],
    },
  },
  {
    id: "BK-21388",
    status: "completed",
    action: "rate",
    provider_slug: "lamaa",
    provider_ar: "مركز لمعة للتلميع",
    provider_en: "Lamaa Polishing Center",
    branch_ar: "فرع السلامة",
    branch_en: "Al Salamah branch",
    address_ar: "حي السلامة، جدة",
    address_en: "Al Salamah, Jeddah",
    services_short_ar: "تلميع ثلاث مراحل",
    services_short_en: "Three-stage polish",
    car_key: "es",
    car_short_ar: "ES 2022",
    car_short_en: "ES 2022",
    car_ar: "لكزس ES 2022 · سيدان",
    car_en: "Lexus ES 2022 · Sedan",
    date_iso: "2026-10-05",
    date_ar: "الاثنين 5 أكتوبر",
    date_en: "Mon 5 Oct",
    amount: 349,
    maps_url: "https://maps.google.com/?q=Lamaa+Al+Salamah+Jeddah",
    rating: {
      title_meta_ar: "تلميع ثلاث مراحل · مركز لمعة للتلميع · BK-21388 · اكتمل الخميس 8 أكتوبر",
      title_meta_en: "Three-stage polish · Lamaa Polishing Center · BK-21388 · Completed Thu 8 Oct",
      extra_criterion_ar: "إزالة الخدوش والدوائر",
      extra_criterion_en: "Scratch and swirl removal",
      sample_comment_ar: "نتيجة التلميع ممتازة واللمعان واضح، وبقيت آثار بسيطة على حواف المصابيح فتحت بخصوصها شكوى.",
      sample_comment_en: "Excellent polish with a clear shine; a few light marks were left on the headlight edges, so I opened a complaint about them.",
      // العام · جودة العمل · العناية · التعامل · القيمة · الخدوش (زي الفيجما)
      sample: [4, 4, 5, 5, 4, 4],
    },
    detail: {
      status_label_ar: "مكتمل",
      status_label_en: "Completed",
      status_tone: "lime",
      tracker: [
        { state: "done", label_ar: "تم الدفع", label_en: "Paid", note_ar: "الاثنين 5 أكتوبر · 7:40 م", note_en: "Mon 5 Oct · 7:40 PM" },
        { state: "done", label_ar: "بانتظار الزيارة", label_en: "Awaiting visit", note_ar: "استُخدمت القسيمة · 10:00 ص", note_en: "Voucher used · 10:00 AM" },
        { state: "done", label_ar: "مكتمل", label_en: "Completed", note_ar: "الخميس 8 أكتوبر · 1:30 م", note_en: "Thu 8 Oct · 1:30 PM" },
      ],
      tip_ar: "اكتملت الخدمة، وأُضيفت 349 نقطة إلى رصيدك.",
      tip_en: "The service is complete, and 349 points were added to your balance.",
      tip_tone: "lime",
      voucher: {
        code: "LK-4P9D-H2WS",
        state: "used",
        note_ar: "استُخدمت القسيمة في فرع السلامة · الخميس 8 أكتوبر",
        note_en: "Voucher used at Al Salamah branch · Thu 8 Oct",
      },
      manage: {
        title_ar: "بعد الخدمة",
        title_en: "After the service",
        actions: [
          "rate",
          {
            kind: "complaint",
            id: "CM-3340",
            title_ar: "شكوى مفتوحة · CM-3340",
            title_en: "Open complaint · CM-3340",
            sub_ar: "اقترح المركز حلاً وبانتظار ردك",
            sub_en: "The center proposed a solution and is awaiting your reply",
          },
          "support",
        ],
      },
      rows: [
        { label_ar: "تاريخ الحجز", label_en: "Booking date", value_ar: "الاثنين 5 أكتوبر 2026", value_en: "Mon 5 Oct 2026" },
        { label_ar: "السيارة", label_en: "Car", value_ar: "لكزس ES 2022 · سيدان", value_en: "Lexus ES 2022 · Sedan" },
        { label_ar: "تلميع ثلاث مراحل", label_en: "Three-stage polish", value_ar: "349 ر.س", value_en: "SAR 349" },
        { label_ar: "المدفوع", label_en: "Paid", value_ar: "349 ر.س · Apple Pay", value_en: "SAR 349 · Apple Pay" },
      ],
      log: [
        { tone: "green", time_ar: "الاثنين 5 أكتوبر · 7:40 م", time_en: "Mon 5 Oct · 7:40 PM", text_ar: "تم الدفع وتأكيد الحجز فوراً", text_en: "Paid and booking confirmed instantly" },
        { tone: "green", time_ar: "الاثنين 5 أكتوبر · 7:40 م", time_en: "Mon 5 Oct · 7:40 PM", text_ar: "أُرسلت القسيمة إلى جوالك وبريدك", text_en: "Voucher sent to your phone and email" },
        { tone: "green", time_ar: "الخميس 8 أكتوبر · 10:00 ص", time_en: "Thu 8 Oct · 10:00 AM", text_ar: "استُخدمت القسيمة عند الوصول", text_en: "Voucher used on arrival" },
        { tone: "green", time_ar: "الخميس 8 أكتوبر · 10:05 ص", time_en: "Thu 8 Oct · 10:05 AM", text_ar: "بدأت الخدمة في فرع السلامة", text_en: "Service started at Al Salamah branch" },
        { tone: "green", time_ar: "الخميس 8 أكتوبر · 1:30 م", time_en: "Thu 8 Oct · 1:30 PM", text_ar: "اكتملت الخدمة وسيارتك جاهزة", text_en: "Service completed and your car is ready" },
        { tone: "green", time_ar: "الخميس 8 أكتوبر · 1:31 م", time_en: "Thu 8 Oct · 1:31 PM", text_ar: "أُضيفت 349 نقطة إلى رصيدك", text_en: "349 points added to your balance" },
        { tone: "green", time_ar: "الجمعة 9 أكتوبر · 11:20 ص", time_en: "Fri 9 Oct · 11:20 AM", text_ar: "فتحت شكوى CM-3340", text_en: "You opened complaint CM-3340" },
      ],
    },
  },
  {
    // صف في الجدول بس — مافيش فريم متابعة له في الفيجما (زر «الفاتورة» بيبدأ التنزيل)
    id: "BK-21302",
    status: "completed",
    action: "invoice",
    provider_slug: "bareeq",
    provider_ar: "مغاسل بريق",
    provider_en: "Bareeq Car Wash",
    branch_ar: "فرع الروضة",
    branch_en: "Al Rawdah branch",
    address_ar: "",
    address_en: "",
    services_short_ar: "غسيل خارجي وداخلي",
    services_short_en: "Exterior and interior wash",
    car_key: "camry",
    car_short_ar: "كامري 2023",
    car_short_en: "Camry 2023",
    car_ar: "تويوتا كامري 2023",
    car_en: "Toyota Camry 2023",
    date_iso: "2026-09-27",
    date_ar: "الأحد 27 سبتمبر",
    date_en: "Sun 27 Sep",
    amount: 45,
    maps_url: "https://maps.google.com/?q=Bareeq+Al+Rawdah+Jeddah",
  },
  {
    id: "BK-21280",
    status: "cancelled",
    action: "details",
    provider_slug: "nukhba",
    provider_ar: "مركز النخبة للتظليل",
    provider_en: "Al Nukhba Tinting Center",
    branch_ar: "فرع الحمراء",
    branch_en: "Al Hamra branch",
    address_ar: "طريق الكورنيش، حي الحمراء",
    address_en: "Corniche Rd, Al Hamra",
    services_short_ar: "تظليل كامل",
    services_short_en: "Full tint",
    car_key: "es",
    car_short_ar: "ES 2022",
    car_short_en: "ES 2022",
    car_ar: "لكزس ES 2022 · سيدان",
    car_en: "Lexus ES 2022 · Sedan",
    date_iso: "2026-09-16",
    date_ar: "الأربعاء 16 سبتمبر",
    date_en: "Wed 16 Sep",
    amount: 549,
    maps_url: "https://maps.google.com/?q=Al+Nukhba+Al+Hamra+Jeddah",
    detail: {
      status_label_ar: "ملغى · مسترد",
      status_label_en: "Cancelled · Refunded",
      status_tone: "red",
      tracker: [
        { state: "done", label_ar: "تم الدفع", label_en: "Paid", note_ar: "الأربعاء 16 سبتمبر · 6:05 م", note_en: "Wed 16 Sep · 6:05 PM" },
        { state: "cancelled", label_ar: "أُلغي الحجز", label_en: "Booking cancelled", note_ar: "الخميس 17 سبتمبر · 11:30 ص", note_en: "Thu 17 Sep · 11:30 AM" },
      ],
      tip_ar: "ألغى مقدّم الخدمة هذا الحجز، واستُرد المبلغ المدفوع إلى وسيلة الدفع.",
      tip_en: "The provider cancelled this booking, and the amount paid was refunded to your payment method.",
      tip_tone: "red",
      voucher: { code: "LK-2H8N-Q6TA", state: "cancelled", note_ar: "القسيمة ملغاة ولا يمكن استخدامها", note_en: "The voucher is cancelled and can’t be used" },
      manage: { title_ar: "إدارة الحجز", title_en: "Manage booking", actions: ["branch", "support"] },
      rows: [
        { label_ar: "تاريخ الحجز", label_en: "Booking date", value_ar: "الأربعاء 16 سبتمبر 2026", value_en: "Wed 16 Sep 2026" },
        { label_ar: "السيارة", label_en: "Car", value_ar: "لكزس ES 2022 · سيدان", value_en: "Lexus ES 2022 · Sedan" },
        { label_ar: "تظليل كامل", label_en: "Full tint", value_ar: "549 ر.س", value_en: "SAR 549" },
        { label_ar: "المسترد", label_en: "Refunded", value_ar: "549 ر.س · الأحد 20 سبتمبر", value_en: "SAR 549 · Sun 20 Sep", tone: "green" },
        { label_ar: "المدفوع", label_en: "Paid", value_ar: "549 ر.س · mada", value_en: "SAR 549 · mada" },
      ],
      log: [
        { tone: "green", time_ar: "الأربعاء 16 سبتمبر · 6:05 م", time_en: "Wed 16 Sep · 6:05 PM", text_ar: "تم الدفع وتأكيد الحجز فوراً", text_en: "Paid and booking confirmed instantly" },
        { tone: "green", time_ar: "الأربعاء 16 سبتمبر · 6:05 م", time_en: "Wed 16 Sep · 6:05 PM", text_ar: "أُرسلت القسيمة إلى جوالك وبريدك", text_en: "Voucher sent to your phone and email" },
        { tone: "red", time_ar: "الخميس 17 سبتمبر · 11:30 ص", time_en: "Thu 17 Sep · 11:30 AM", text_ar: "ألغى مقدّم الخدمة الحجز", text_en: "The provider cancelled the booking" },
        { tone: "green", time_ar: "الأحد 20 سبتمبر · 2:10 م", time_en: "Sun 20 Sep · 2:10 PM", text_ar: "استُرد 549 ر.س إلى وسيلة الدفع", text_en: "SAR 549 refunded to your payment method" },
      ],
    },
  },
];

// السيارات في فلتر P-20 (W2-38 «السيارة»)
export const bookingCars: (Localized<"label"> & { key: BookingCar })[] = [
  { key: "camry", label_ar: "تويوتا كامري 2023", label_en: "Toyota Camry 2023" },
  { key: "es", label_ar: "لكزس ES 2022", label_en: "Lexus ES 2022" },
];

export const bookingTabOf: Record<BookingStatus, BookingTab> = {
  waiting: "upcoming",
  in_service: "upcoming",
  completed: "completed",
  cancelled: "cancelled",
};
