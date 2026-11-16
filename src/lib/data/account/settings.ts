import type { Localized } from "@/i18n/config";

// W2-72 · الإعدادات (753:9822) — بيانات العميل التجريبي كما في الفيجما.

// العنوان بيتخزّن بمفاتيح (النوع + المدينة + الحي) والنص بيتترجم حسب اللغة — مش نص ثابت بلغة واحدة (تقرير QA #29).
// name = اسم حر لما النوع «other» (بيفضل زي ما العميل كتبه)
export type AddressKind = "home" | "work" | "other";
export type SettingsAddress = { id: string; kind: AddressKind; name?: string; city: string; district: string; selected: boolean };

export const addressKinds: (Localized<"label"> & { key: AddressKind })[] = [
  { key: "home", label_ar: "المنزل", label_en: "Home" },
  { key: "work", label_ar: "العمل", label_en: "Work" },
  { key: "other", label_ar: "عنوان آخر", label_en: "Other" },
];

// W2-DD · المدينة والحي في نافذة العنوان (P-31a/b/c) — نفس مدن وأحياء اقتراحات البحث في الرئيسية لحد ما تيجي من الـAPI
export const addressCities: (Localized<"label"> & { key: string; districts: (Localized<"label"> & { key: string })[] })[] = [
  {
    key: "jeddah",
    label_ar: "جدة",
    label_en: "Jeddah",
    districts: [
      { key: "rawdah", label_ar: "حي الروضة", label_en: "Al Rawdah" },
      { key: "zahra", label_ar: "حي الزهراء", label_en: "Al Zahra" },
      { key: "salamah", label_ar: "حي السلامة", label_en: "Al Salamah" },
      { key: "hamra", label_ar: "حي الحمراء", label_en: "Al Hamra" },
      { key: "mohammadiya", label_ar: "حي المحمدية", label_en: "Al Mohammadiya" },
    ],
  },
  {
    key: "riyadh",
    label_ar: "الرياض",
    label_en: "Riyadh",
    districts: [
      { key: "malqa", label_ar: "حي الملقا", label_en: "Al Malqa" },
      { key: "olaya", label_ar: "حي العليا", label_en: "Al Olaya" },
      { key: "narjis", label_ar: "حي النرجس", label_en: "Al Narjis" },
    ],
  },
  { key: "dammam", label_ar: "الدمام", label_en: "Dammam", districts: [{ key: "shati", label_ar: "حي الشاطئ", label_en: "Al Shati" }] },
  { key: "khobar", label_ar: "الخبر", label_en: "Al Khobar", districts: [{ key: "aqrabiyah", label_ar: "حي العقربية", label_en: "Al Aqrabiyah" }] },
];

export type SettingsPref = Localized<"title"> &
  Localized<"body"> & {
    key: "booking" | "whatsapp" | "followed_offers" | "wash_reminder" | "email_invoices" | "location";
    // locked = «رسائل الحجز والقسيمة — لا يمكن إيقافها»
    state: "on" | "off" | "locked";
  };

export const settingsProfile = {
  first_name_ar: "محمد",
  first_name_en: "Mohammed",
  last_name_ar: "سالم",
  last_name_en: "Salem",
  phone_display: "+966 55 123 4567",
  email: "",
};

export const settingsAddresses: SettingsAddress[] = [
  { id: "home", selected: true, kind: "home", city: "jeddah", district: "rawdah" },
  { id: "work", selected: false, kind: "work", city: "jeddah", district: "zahra" },
];

// كارت «التنبيهات»
export const settingsAlerts: SettingsPref[] = [
  {
    key: "booking",
    state: "locked",
    title_ar: "رسائل الحجز والقسيمة",
    title_en: "Booking and voucher messages",
    body_ar: "تأكيد الحجز والقسيمة وحالة سيارتك — لا يمكن إيقافها.",
    body_en: "Booking and voucher confirmation and your car’s status — can’t be turned off.",
  },
  { key: "whatsapp", state: "on", title_ar: "واتساب", title_en: "WhatsApp", body_ar: "نسخة من رسائل الحجز على واتساب.", body_en: "A copy of booking messages on WhatsApp." },
  {
    key: "followed_offers",
    state: "on",
    title_ar: "عروض مقدّمي الخدمة الذين تتابعهم",
    title_en: "Offers from providers you follow",
    body_ar: "تصلك عروضهم الجديدة أولاً.",
    body_en: "Their new offers reach you first.",
  },
  {
    key: "wash_reminder",
    state: "off",
    title_ar: "تذكير الغسيل الدوري",
    title_en: "Regular wash reminder",
    body_ar: "تذكير كل 30 يوماً من آخر غسيل.",
    body_en: "A reminder every 30 days after your last wash.",
  },
  {
    key: "email_invoices",
    state: "off",
    title_ar: "الفواتير على البريد",
    title_en: "Invoices by email",
    body_ar: "يحتاج إضافة بريدك الإلكتروني.",
    body_en: "Requires adding your email.",
  },
];

// كارت «الخصوصية والحساب»
export const settingsLocation: SettingsPref = {
  key: "location",
  state: "on",
  title_ar: "السماح بموقعي الحالي",
  title_en: "Allow my current location",
  body_ar: "لعرض الفروع الأقرب لك تلقائياً. يمكنك تغييره من المتصفح أيضاً.",
  body_en: "To show the nearest branches automatically. You can also change this in your browser.",
};
