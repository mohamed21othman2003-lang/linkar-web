import type { Localized } from "@/i18n/config";

// W2-67 · سياراتي (750:8595) + W2-67b إضافة سيارة (751:9787)

export const carsPage = {
  title_ar: "سياراتي",
  title_en: "My cars",
  description_ar: "حجم سيارتك يحدد الأسعار التي تراها، والسيارة الافتراضية تُختار تلقائياً عند الحجز.",
  description_en: "Your car’s size sets the prices you see, and your default car is picked automatically when you book.",
  add_car_ar: "أضف سيارة",
  add_car_en: "Add car",
  // W2-67-0 · حالة فارغة (85:44968)
  empty_title_ar: "لا توجد سيارات بعد",
  empty_title_en: "No cars yet",
  empty_text_ar: "أضف سيارتك ليعرض لك لينكار الأسعار المناسبة لنوعها، وتُحفظ لحجوزاتك القادمة.",
  empty_text_en: "Add your car so Linkar shows you the right prices for its type, and it’s saved for your next bookings.",
  last_booking_ar: "آخر حجز:",
  last_booking_en: "Last booking:",
  size_note_ar: "نحدد الحجم تلقائياً من الموديل (سيدان · SUV متوسطة · كبيرة)، لأن أسعار التظليل والنانو سيراميك والتلميع تختلف حسب الحجم. يمكنك تعديل السيارة في أي وقت؛ وحذفها متاح إذا لم يكن عليها حجز قادم ولم تكن الافتراضية.",
  size_note_en: "We set the size automatically from the model (Sedan · Mid-size SUV · Large), because tinting, nano ceramic and polishing prices depend on size. You can edit a car at any time; deleting it is possible if it has no upcoming booking and isn’t your default.",
  gift_title_ar: "تويوتا كامري 2026 · بدون لوحة بعد",
  gift_title_en: "Toyota Camry 2026 · no plate yet",
  gift_text_ar: "من هدية وكالة الريادة للسيارات — تُضاف إلى سياراتك عند استخدام الهدية، وتضيف لوحتها لاحقاً.",
  gift_text_en: "From Al Riyada Motors’ gift — it’s added to your cars when you use the gift, and you add its plate later.",
  gift_cta_ar: "عرض الهدية",
  gift_cta_en: "View gift",
  // نافذة «أضف سيارة» (Modal 751:10517)
  modal_title_ar: "أضف سيارة",
  modal_title_en: "Add car",
  modal_edit_title_ar: "تعديل السيارة",
  modal_edit_title_en: "Edit car",
  modal_subtitle_ar: "نحدد الحجم تلقائياً من الموديل، والأسعار تظهر حسبه.",
  modal_subtitle_en: "We set the size automatically from the model, and prices are shown for it.",
  field_make_ar: "الشركة",
  field_make_en: "Make",
  field_model_ar: "الموديل",
  field_model_en: "Model",
  field_year_ar: "سنة الصنع",
  field_year_en: "Year",
  field_color_ar: "اللون (اختياري)",
  field_color_en: "Color (optional)",
  field_plate_numbers_ar: "أرقام اللوحة",
  field_plate_numbers_en: "Plate numbers",
  field_plate_letters_ar: "حروف اللوحة",
  field_plate_letters_en: "Plate letters",
  // {size} = اسم الحجم
  size_detected_ar: "الحجم: {size} — حددناه من الموديل",
  size_detected_en: "Size: {size} — set from the model",
  size_change_ar: "تغيير",
  size_change_en: "Change",
  make_default_ar: "اجعلها السيارة الافتراضية",
  make_default_en: "Make it my default car",
  save_ar: "حفظ السيارة",
  save_en: "Save car",
  // P-04 · حذف سيارة — {car} = اسم السيارة
  delete_title_ar: "حذف {car}؟",
  delete_title_en: "Delete {car}?",
  delete_text_ar: "تُحذف السيارة من «سياراتي»، ولا تتأثر حجوزاتك السابقة وفواتيرها.",
  delete_text_en: "The car is removed from “My cars”; your past bookings and their invoices aren’t affected.",
  delete_confirm_ar: "حذف السيارة",
  delete_confirm_en: "Delete car",
  // P-04b · لا يمكن حذف السيارة — {car} و {booking} (= «(BK-…)» بدون كسر سطر، زي الفيجما)
  locked_title_ar: "لا يمكن حذف هذه السيارة الآن",
  locked_title_en: "This car can’t be deleted right now",
  locked_text_ar: "{car} هي سيارتك الافتراضية وعليها حجز قادم {booking}. اجعل سيارة أخرى افتراضية، ويمكنك حذفها بعد اكتمال الحجز.",
  locked_text_en: "{car} is your default car and has an upcoming booking {booking}. Make another car your default, and you can delete it once the booking is completed.",
  locked_cta_ar: "عرض حجوزاتي",
  locked_cta_en: "View my bookings",
  // P-10k
  toast_default_ar: "تم التعيين كافتراضي",
  toast_default_en: "Set as default",
};

export type CarSize = "sedan" | "suv" | "large";

export const carSizes: (Localized<"label"> & { key: CarSize })[] = [
  { key: "sedan", label_ar: "سيدان", label_en: "Sedan" },
  { key: "suv", label_ar: "SUV متوسطة", label_en: "Mid-size SUV" },
  { key: "large", label_ar: "كبيرة", label_en: "Large" },
];

// قوائم نافذة الإضافة — من الموديلات الظاهرة في الفيجما فقط (القائمة الكاملة هتيجي من الـAPI)
export const carMakes: (Localized<"label"> & { key: string; models: (Localized<"label"> & { key: string; size: CarSize })[] })[] = [
  {
    key: "toyota",
    label_ar: "تويوتا",
    label_en: "Toyota",
    models: [
      { key: "landcruiser", label_ar: "لاندكروزر", label_en: "Land Cruiser", size: "large" },
      { key: "camry", label_ar: "كامري", label_en: "Camry", size: "sedan" },
    ],
  },
  {
    key: "lexus",
    label_ar: "لكزس",
    label_en: "Lexus",
    models: [{ key: "es", label_ar: "ES", label_en: "ES", size: "sedan" }],
  },
];

export const carColors: (Localized<"label"> & { key: string })[] = [
  { key: "black", label_ar: "أسود", label_en: "Black" },
  { key: "white", label_ar: "أبيض", label_en: "White" },
  { key: "gray", label_ar: "رمادي", label_en: "Gray" },
];

export const carYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

// القيم الظاهرة في نموذج الفيجما (W2-67b)
export const carDraft = { make: "toyota", model: "landcruiser", year: 2024, color: "black", plate_numbers: "4417", plate_letters_ar: "ك ه ن", plate_letters_en: "K H N" };

export type Car = Localized<"name"> &
  Localized<"plate_letters"> &
  Localized<"last_booking"> & {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    plate_numbers: string;
    size: CarSize;
    is_default: boolean;
    upcoming_booking?: string; // رقم الحجز القادم (يمنع الحذف · P-04b)
  };

// من بداية السطر: الافتراضية أولاً
export const cars: Car[] = [
  {
    id: "car-camry",
    name_ar: "تويوتا كامري 2023",
    name_en: "Toyota Camry 2023",
    make: "toyota",
    model: "camry",
    year: 2023,
    color: "white",
    size: "sedan",
    plate_letters_ar: "ر س ح",
    plate_letters_en: "R S H",
    plate_numbers: "1234",
    last_booking_ar: "BK-21452 · بانتظار الزيارة",
    last_booking_en: "BK-21452 · awaiting visit",
    is_default: true,
    upcoming_booking: "BK-21452",
  },
  {
    id: "car-es",
    name_ar: "لكزس ES 2022",
    name_en: "Lexus ES 2022",
    make: "lexus",
    model: "es",
    year: 2022,
    color: "gray",
    size: "sedan",
    plate_letters_ar: "ب ن د",
    plate_letters_en: "B N D",
    plate_numbers: "5678",
    last_booking_ar: "BK-21388 · مكتمل الخميس 8 أكتوبر",
    last_booking_en: "BK-21388 · completed Thu 8 Oct",
    is_default: false,
  },
];

export const carLockNote = {
  label_ar: "لا يمكن حذفها: السيارة الافتراضية وعليها حجز قادم.",
  label_en: "Can’t be deleted: it’s your default car and has an upcoming booking.",
};
