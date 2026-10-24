import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getGiftDict } from "@/i18n/dict/gift";
import type { BranchContact } from "@/lib/data/gift/gifts";
import type { ActionsCopy, ContactInfo } from "./VoucherActions";

// تجهيز نصوص الأزرار والنوافذ (P-07، P-08، P-10a، P-10u) على السيرفر وتمريرها للكومبوننت التفاعلي
export function actionsCopy(locale: Locale): ActionsCopy {
  const t = getGiftDict(locale);
  return {
    close: t.close,
    contactBranch: t.contactBranch,
    callBranch: t.callBranch,
    callBranchSub: t.callBranchSub,
    whatsapp: t.whatsapp,
    whatsappSub: t.whatsappSub,
    directions: t.directions,
    directionsSub: t.directionsSub,
    shareTitle: t.shareTitle,
    shareBody: t.shareBody,
    copy: t.copy,
    mail: t.mail,
    sms: t.sms,
    copyLink: t.copyLink,
    copied: t.copied,
    viewInAccount: t.viewInAccount,
    shareVoucher: t.shareVoucher,
    appleWallet: t.appleWallet,
    googleWallet: t.googleWallet,
    walletAdded: t.walletAdded,
  };
}

export function contactInfo(locale: Locale, c: BranchContact, bookingNo: string): ContactInfo {
  return {
    title: tx(locale, c, "title"),
    address: tx(locale, c, "address"),
    logo: c.logo,
    phone: c.phone,
    whatsapp: c.whatsapp,
    mapsUrl: c.maps_url,
    note: getGiftDict(locale).mentionBooking(bookingNo),
  };
}
