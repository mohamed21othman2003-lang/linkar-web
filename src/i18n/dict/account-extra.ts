import type { Locale } from "@/i18n/config";

// كلمات الواجهة الصغيرة لصفحات الحساب (الجزء 2): المفضلة، النقاط، باقات الوكالات، سياراتي،
// طرق الدفع، الشكاوى والمقترحات، تقييماتي — والنوافذ المنبثقة التابعة لها.
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا (للمراجعة). محتوى الصفحات نفسه في lib/data/account/*.
const ar = {
  book: "احجز",
  copy: "نسخ",
  share: "مشاركة",
  edit: "تعديل",
  delete: "حذف",
  cancel: "إلغاء",
  close: "إغلاق",
  makeDefault: "اجعلها الافتراضية",
  default: "الافتراضية",
  unlink: "إلغاء الربط",
  downloadPdf: "تحميل PDF",
  removeFavorite: "إزالة من المفضلة",
  points: (n: string) => `${n} نقطة`,
  pointsUnit: "نقطة",
  // النقاط
  table: { date: "التاريخ", operation: "العملية", points: "النقاط", balance: "الرصيد" },
  // سياراتي
  carSpecs: { size: "الحجم", plate: "اللوحة", color: "اللون" },
  // الشكاوى
  send: "إرسال",
  photo: "صورة",
  addPhoto: "إضافة صورة",
  removePhoto: "حذف الصورة",
  you: "أنت",
  charCount: "{n} / {max}",
  selectPlaceholder: "اختر",
};

const en: typeof ar = {
  book: "Book",
  copy: "Copy",
  share: "Share",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  close: "Close",
  makeDefault: "Make default",
  default: "Default",
  unlink: "Unlink",
  downloadPdf: "Download PDF",
  removeFavorite: "Remove from favorites",
  points: (n: string) => (n === "1" ? "1 point" : `${n} points`),
  pointsUnit: "points",
  table: { date: "Date", operation: "Activity", points: "Points", balance: "Balance" },
  carSpecs: { size: "Size", plate: "Plate", color: "Color" },
  send: "Send",
  photo: "Photo",
  addPhoto: "Add photo",
  removePhoto: "Remove photo",
  you: "You",
  charCount: "{n} / {max}",
  selectPlaceholder: "Select",
};

export const getAccountExtra = (locale: Locale) => (locale === "en" ? en : ar);
export type AccountExtraDict = typeof ar;
