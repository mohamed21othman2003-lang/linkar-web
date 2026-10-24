import type { Localized } from "@/i18n/config";

// W2-72 · الإعدادات (753:9822) — بيانات العميل التجريبي كما في الفيجما.

export type SettingsAddress = Localized<"label"> & Localized<"area"> & { id: string; selected: boolean };

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
  { id: "home", selected: true, label_ar: "المنزل", label_en: "Home", area_ar: "حي الروضة، جدة", area_en: "Al Rawdah, Jeddah" },
  { id: "work", selected: false, label_ar: "العمل", label_en: "Work", area_ar: "حي الزهراء، جدة", area_en: "Al Zahra, Jeddah" },
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
