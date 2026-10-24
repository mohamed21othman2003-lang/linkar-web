import type { Locale } from "@/i18n/config";

// نصوص واجهة المساعدة والأسئلة الشائعة والسياسات و404 (القسم 09).
// العربي من الفيجما؛ المعلّم «صياغتنا» مش موجود في الفيجما (للمراجعة).
const ar = {
  search: "بحث",
  allArticles: "كل المقالات",
  helpful: "هل أفادك المقال؟",
  yes: "نعم",
  no: "لا",
  faqTopics: "مواضيع الأسئلة الشائعة", // صياغتنا (aria)
  // صياغتنا — المقالات اللي محتواها لسه ما اتكتبش
  placeholderBody: "[محتوى المقال قيد الإعداد — يُضاف لاحقاً]",
  // صياغتنا — نتائج البحث في مركز المساعدة
  noResults: "لا توجد مقالات مطابقة. جرّب كلمة أخرى أو تصفّح الأسئلة الشائعة.",
  results: (n: number) => (n === 1 ? "مقال واحد مطابق" : n === 2 ? "مقالان مطابقان" : `${n} مقالات مطابقة`),
  clearSearch: "مسح البحث",
};

const en: typeof ar = {
  search: "Search",
  allArticles: "All articles",
  helpful: "Was this article helpful?",
  yes: "Yes",
  no: "No",
  faqTopics: "FAQ topics",
  placeholderBody: "[Article content in preparation — to be added]",
  noResults: "No matching articles. Try another word or browse the FAQ.",
  results: (n: number) => (n === 1 ? "1 matching article" : `${n} matching articles`),
  clearSearch: "Clear search",
};

export const getHelpDict = (locale: Locale) => (locale === "en" ? en : ar);
export type HelpDict = typeof ar;
