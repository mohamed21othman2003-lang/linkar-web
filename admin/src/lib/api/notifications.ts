// الإشعارات (CON5-M02 · الإشعارات 3114:31717 — لوحة الجرس في الشريط العلوي).
// كل إشعار بيفتح السجل بتاعه في قسمه (طلب · شكوى · دفعة المستحقات). النصوص حرفياً من الإطار.
import { delay } from "./errors";

export type NotifIcon = "receipt" | "file" | "alert" | "message" | "wallet";
export interface Notification {
  id: string;
  icon: NotifIcon;
  title: string;
  /** «14 أكتوبر 2026 · التسعير» */
  meta: string;
  href: string;
  unread: boolean;
}

let items: Notification[] = [
  { id: "n-0426", icon: "receipt", title: "‏REQ-2026-0426 · جونسون طلب الاشتراك في «ظهورك على لينكار»", meta: "14 أكتوبر 2026 · التسعير", href: "/requests?request=REQ-2026-0426", unread: true },
  { id: "n-0425", icon: "receipt", title: "‏REQ-2026-0425 · جونسون طلب تجديد الاتفاقية", meta: "14 أكتوبر 2026 · المالية", href: "/requests?request=REQ-2026-0425", unread: true },
  { id: "n-0424", icon: "file", title: "‏REQ-2026-0424 · جونسون أرسل تفويض الموزّع المجدّد", meta: "14 أكتوبر 2026 · الجودة", href: "/requests?request=REQ-2026-0424", unread: true },
  { id: "n-0427", icon: "receipt", title: "‏REQ-2026-0427 · جونسون طلب تغيير الحساب البنكي", meta: "14 أكتوبر 2026 · المالية", href: "/requests?request=REQ-2026-0427", unread: true },
  { id: "n-0417", icon: "alert", title: "‏REQ-2026-0417 · تعذّر قبول BK-21475 · فرع الزهراء", meta: "14 أكتوبر 2026 · لينكار", href: "/requests?request=REQ-2026-0417", unread: true },
  { id: "n-3352", icon: "message", title: "‏CM-3352 · شكوى بانتظار رد جونسون · فرع الحمراء", meta: "13 أكتوبر 2026 · خدمة العملاء", href: "/reviews?complaint=CM-3352", unread: true },
  { id: "n-0071", icon: "wallet", title: "دفعة 1 نوفمبر 2026 جاهزة للمعاينة · 2.14 مليون ر.س لـ 21 مقدّم خدمة", meta: "‏TRF-2026-11-0071 · المالية", href: "/dues?modal=preview", unread: true },
];

export const notificationsApi = {
  /** GET /notifications → { items, unread } */
  list: async () => delay({ items: items.map((n) => ({ ...n })), unread: items.filter((n) => n.unread).length }, 200),
  /** فتح إشعار = مقروء */
  read: async (id: string) => {
    items = items.map((n) => (n.id === id ? { ...n, unread: false } : n));
    return delay({ ok: true }, 80);
  },
};
