import type { Localized } from "@/i18n/config";

// W2-68 · طرق الدفع (751:8569) + W2-68b إضافة بطاقة (751:8983)

export const paymentPage = {
  title_ar: "طرق الدفع",
  title_en: "Payment methods",
  description_ar: "بطاقاتك المحفوظة ووسائل الدفع المتاحة. الدفع إلكتروني فقط، ويتأكد الحجز فور الدفع.",
  description_en: "Your saved cards and available payment methods. Payment is online only, and the booking is confirmed as soon as you pay.",
  add_card_ar: "أضف بطاقة",
  add_card_en: "Add card",
  cards_title_ar: "بطاقاتك المحفوظة",
  cards_title_en: "Your saved cards",
  other_title_ar: "وسائل دفع أخرى",
  other_title_en: "Other payment methods",
  other_subtitle_ar: "تختارها عند الدفع ولا تحتاج حفظاً.",
  other_subtitle_en: "Choose them at checkout — nothing to save.",
  security_ar: "لا تحفظ لينكار بيانات بطاقتك — تُحفظ مشفّرة لدى مزوّد دفع مرخّص، ويطلب البنك رمز التحقق عند أول استخدام.",
  security_en: "Linkar doesn’t store your card details — they’re kept encrypted with a licensed payment provider, and your bank asks for a verification code on first use.",
  invoices_title_ar: "الفواتير الضريبية",
  invoices_title_en: "Tax invoices",
  invoices_subtitle_ar: "تصلك كل فاتورة أيضاً برسالة وعلى بريدك إن أضفته.",
  invoices_subtitle_en: "Every invoice is also sent to you by text message and to your email if you added one.",
  invoice_label_ar: "فاتورة",
  invoice_label_en: "Invoice",
  // نافذة «أضف بطاقة» (Modal 751:9746)
  modal_title_ar: "أضف بطاقة",
  modal_title_en: "Add card",
  modal_subtitle_ar: "mada · Visa · Mastercard",
  modal_subtitle_en: "mada · Visa · Mastercard",
  field_number_ar: "رقم البطاقة",
  field_number_en: "Card number",
  field_expiry_ar: "تاريخ الانتهاء",
  field_expiry_en: "Expiry date",
  field_cvv_ar: "رمز الأمان CVV",
  field_cvv_en: "Security code (CVV)",
  field_name_ar: "الاسم على البطاقة",
  field_name_en: "Name on card",
  make_default_ar: "اجعلها البطاقة الافتراضية",
  make_default_en: "Make it my default card",
  modal_note_ar: "نتحقق من البطاقة بمبلغ 1 ر.س يُعاد فوراً، ويطلب البنك رمز التحقق. لا نحفظ رقم البطاقة كاملاً.",
  modal_note_en: "We verify the card with SAR 1 that’s refunded right away, and your bank asks for a verification code. We never store the full card number.",
  save_ar: "حفظ البطاقة",
  save_en: "Save card",
  // P-05 / P-05b · حذف بطاقة — {card} = «VISA •••• 9034»
  delete_title_ar: "حذف بطاقة {card}؟",
  delete_title_en: "Delete card {card}?",
  delete_text_ar: "لن تظهر في طرق الدفع، ويمكنك إضافتها مجدداً في أي وقت.",
  delete_text_en: "It won’t appear in your payment methods, and you can add it again at any time.",
  // {next} = البطاقة اللي هتبقى الافتراضية
  delete_default_text_ar: "هذه بطاقتك الافتراضية؛ بعد حذفها تصبح {next} الافتراضية.",
  delete_default_text_en: "This is your default card; once it’s deleted, {next} becomes your default.",
  delete_confirm_ar: "حذف البطاقة",
  delete_confirm_en: "Delete card",
  // P-10k · P-10l
  toast_default_ar: "تم التعيين كافتراضي",
  toast_default_en: "Set as default",
  toast_unlinked_ar: "تم إلغاء ربط {name}",
  toast_unlinked_en: "{name} unlinked",
  // P-10d — ملف الفاتورة نفسه لسه مش موجود (هيجي من الـAPI)
  toast_download_ar: "جارٍ تنزيل الملف (PDF)…",
  toast_download_en: "Downloading the file (PDF)…",
};

// القيم الظاهرة في نموذج الفيجما (W2-68b)
export const cardDraft = { number: "4532 •••• •••• 7710", expiry: "09 / 29", cvv: "•••", name: "MOHAMMED SALEM" };

export type SavedCard = {
  id: string;
  brand: "mada" | "VISA";
  last4: string;
  expiry: string;
  holder: string;
  is_default: boolean;
};

// من بداية السطر: الافتراضية أولاً
export const savedCards: SavedCard[] = [
  { id: "card-mada", brand: "mada", last4: "4821", expiry: "06/28", holder: "MOHAMMED SALEM", is_default: true },
  { id: "card-visa", brand: "VISA", last4: "9034", expiry: "08/27", holder: "MOHAMMED SALEM", is_default: false },
];

export type OtherMethod = Localized<"name"> &
  Localized<"text"> & {
    id: string;
    linked: boolean;
  };

export const otherMethods: OtherMethod[] = [
  { id: "apple-pay", name_ar: "Apple Pay", name_en: "Apple Pay", text_ar: "متاحة على أجهزة Apple — تؤكد الدفع ببصمة الوجه أو الإصبع.", text_en: "Available on Apple devices — confirm payment with Face ID or Touch ID.", linked: false },
  { id: "stc-pay", name_ar: "STC Pay", name_en: "STC Pay", text_ar: "مربوطة برقم ‎055‎ ‎123‎ ‎4567‎", text_en: "Linked to 055 123 4567", linked: true },
  { id: "tabby", name_ar: "تابي", name_en: "Tabby", text_ar: "قسّم مدفوعاتك على 4 دفعات بدون فوائد عند الدفع، دون ربط بطاقة مسبقاً.", text_en: "Split your payment into 4 interest-free installments at checkout, with no card to link beforehand.", linked: false },
  { id: "tamara", name_ar: "تمارا", name_en: "Tamara", text_ar: "اختر خطة دفع شهرية بدون فوائد عند الدفع، دون ربط بطاقة مسبقاً.", text_en: "Choose an interest-free monthly plan at checkout, with no card to link beforehand.", linked: false },
];

export type Invoice = Localized<"title"> & {
  id: string;
  booking: string;
  date: string; // ISO
  amount: number;
};

export const invoices: Invoice[] = [
  { id: "inv-21452", booking: "BK-21452", title_ar: "‏BK-21452 · جونسون Johnson", title_en: "BK-21452 · Johnson", date: "2026-10-11", amount: 2323 },
  { id: "inv-21431", booking: "BK-21431", title_ar: "‏BK-21431 · XPEL السعودية", title_en: "BK-21431 · XPEL Saudi Arabia", date: "2026-10-07", amount: 7800 },
  { id: "inv-21388", booking: "BK-21388", title_ar: "‏BK-21388 · مركز لمعة للتلميع", title_en: "BK-21388 · Lamaa Polishing Center", date: "2026-10-05", amount: 349 },
  { id: "inv-21302", booking: "BK-21302", title_ar: "‏BK-21302 · مغاسل بريق", title_en: "BK-21302 · Bareeq Car Wash", date: "2026-09-27", amount: 45 },
];
