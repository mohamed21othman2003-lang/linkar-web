import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getAccountExtra } from "@/i18n/dict/account-extra";
import { complaintForm as f } from "@/lib/data/account/complaints-data";
import { routes } from "@/lib/routes";
import type { ComplaintFormCopy } from "./complaints-form";

// نصوص نموذجي W2-69b / W2-69c (سيرفر) — mode بيحدد زر الإرسال وسطر التذييل
export function complaintFormCopy(locale: Locale, mode: "complaint" | "suggestion"): ComplaintFormCopy {
  const t = getAccountExtra(locale);
  return {
    step1Title: tx(locale, f, "step1_title"),
    step1Text: tx(locale, f, "step1_text"),
    otherBooking: tx(locale, f, "other_booking"),
    bookingsNote: tx(locale, f, "bookings_note"),
    step2Title: tx(locale, f, "step2_title"),
    step3Title: tx(locale, f, "step3_title"),
    step3Text: tx(locale, f, "step3_text"),
    step4Title: tx(locale, f, "step4_title"),
    step4Text: tx(locale, f, "step4_text"),
    submit: tx(locale, f, mode === "complaint" ? "submit" : "suggestion_submit"),
    footer: tx(locale, f, mode === "complaint" ? "footer_note" : "suggestion_footer"),
    photo: t.photo,
    addPhoto: t.addPhoto,
    removePhoto: t.removePhoto,
    toastPhotoAdded: tx(locale, f, "toast_photo_added"),
    toastPhotoRemoved: tx(locale, f, "toast_photo_removed"),
    draft: tx(locale, f, "draft"),
    maxLength: f.max_length,
    charCount: t.charCount,
  };
}

export function complaintFormTabs(locale: Locale, active: "complaint" | "suggestion") {
  return [
    { key: "complaint", label: tx(locale, f, "tab_complaint"), href: routes.complaintNew, active: active === "complaint" },
    { key: "suggestion", label: tx(locale, f, "tab_suggestion"), href: routes.suggestionNew, active: active === "suggestion" },
  ];
}
