import type { Localized } from "@/i18n/config";
import { routes } from "@/lib/routes";

export type NotificationKind = "car" | "check" | "message" | "tag" | "gift" | "bell";

export type AppNotification = Localized<"title"> &
  Localized<"body"> &
  Localized<"time"> & {
    id: string;
    kind: NotificationKind;
    unread: boolean;
    href: string;
    category: "bookings" | "offers" | "complaints" | "points" | "account";
  };

// المصدر: W2-71 «قائمة الحساب والإشعارات» (754:13223) — أحدث 4 إشعارات (منيو الهيدر بيعرضها كلها)
// القائمة الكاملة لصفحة الإشعارات W2-73 تحت في notificationFeed.
export const notifications: AppNotification[] = [
  {
    id: "n-1",
    kind: "car",
    unread: true,
    category: "bookings",
    href: routes.booking("BK-21431"),
    title_ar: "سيارتك في الخدمة الآن",
    title_en: "Your car is being serviced now",
    body_ar: "‏XPEL السعودية · باقة السيارة الجديدة",
    body_en: "XPEL Saudi Arabia · New car package",
    time_ar: "قبل 20 دقيقة",
    time_en: "20 minutes ago",
  },
  {
    id: "n-2",
    kind: "check",
    unread: true,
    category: "bookings",
    href: routes.booking("BK-21452"),
    title_ar: "تم الدفع وتأكيد حجزك",
    title_en: "Payment received and booking confirmed",
    body_ar: "‏BK-21452 · جونسون Johnson · فرع الزهراء",
    body_en: "BK-21452 · Johnson · Al Zahra branch",
    time_ar: "قبل ساعتين",
    time_en: "2 hours ago",
  },
  {
    id: "n-3",
    kind: "message",
    unread: true,
    category: "complaints",
    href: routes.complaints(),
    title_ar: "رد مركز لمعة على شكواك",
    title_en: "Lamaa Center replied to your complaint",
    body_ar: "اقترح إزالة الآثار مجاناً الثلاثاء 13 أكتوبر 4:00 م",
    body_en: "Offered to remove the marks for free on Tue 13 Oct, 4:00 PM",
    time_ar: "أمس · 10:40 ص",
    time_en: "Yesterday · 10:40 AM",
  },
  {
    id: "n-4",
    kind: "tag",
    unread: false,
    category: "points",
    href: routes.points,
    title_ar: "أُضيفت 349 نقطة لرصيدك",
    title_en: "349 points added to your balance",
    body_ar: "حجز مكتمل · BK-21388 · مركز لمعة للتلميع",
    body_en: "Completed booking · BK-21388 · Lamaa Polishing Center",
    time_ar: "الخميس 8 أكتوبر",
    time_en: "Thu 8 Oct",
  },
];

// W2-73 · الإشعارات (779:18406) — نفس الإشعارات بصياغة صفحة الإشعارات (الوصف والوقت أطول من المنيو) + الهدية والعرض.
// group = عنوان المجموعة (اليوم · أمس · هذا الأسبوع)، وcategory = تبويب الصفحة (الحجوزات · العروض · النقاط والهدايا · الشكاوى).
export type FeedNotification = AppNotification & { group: "today" | "yesterday" | "week" };

export const notificationFeed: FeedNotification[] = [
  {
    id: "n-2",
    group: "today",
    kind: "check",
    unread: true,
    category: "bookings",
    href: routes.booking("BK-21452"),
    title_ar: "تم الدفع وتأكيد حجزك",
    title_en: "Payment received and booking confirmed",
    body_ar: "‏BK-21452 · جونسون Johnson · فرع الزهراء · 2,323 ر.س",
    body_en: "BK-21452 · Johnson · Al Zahra branch · SAR 2,323",
    time_ar: "قبل ساعتين",
    time_en: "2 hours ago",
  },
  {
    id: "n-1",
    group: "today",
    kind: "car",
    unread: true,
    category: "bookings",
    href: routes.booking("BK-21431"),
    title_ar: "سيارتك في الخدمة الآن",
    title_en: "Your car is being serviced now",
    body_ar: "‏BK-21431 · XPEL السعودية · باقة السيارة الجديدة",
    body_en: "BK-21431 · XPEL Saudi Arabia · New car package",
    time_ar: "قبل 3 ساعات",
    time_en: "3 hours ago",
  },
  {
    id: "n-3",
    group: "yesterday",
    kind: "message",
    unread: true,
    category: "complaints",
    href: routes.complaints(),
    title_ar: "رد مركز لمعة على شكواك",
    title_en: "Lamaa Center replied to your complaint",
    body_ar: "‏CM-3340 · اقترح إزالة الآثار مجاناً — اختر قبولها أو حلاً آخر",
    body_en: "CM-3340 · Offered to remove the marks for free — accept it or choose another solution",
    time_ar: "أمس · 10:40 ص",
    time_en: "Yesterday · 10:40 AM",
  },
  {
    id: "n-5",
    group: "week",
    kind: "gift",
    unread: false,
    category: "points",
    href: routes.dealerPackages,
    title_ar: "هدية جديدة من وكالة الريادة للسيارات",
    title_en: "A new gift from Al Riyada Motors",
    body_ar: "عزل حراري كامل للزجاج · صالحة حتى 30 ديسمبر 2026",
    body_en: "Full heat-insulation for the glass · Valid until 30 Dec 2026",
    time_ar: "السبت 10 أكتوبر",
    time_en: "Sat 10 Oct",
  },
  {
    id: "n-6",
    group: "week",
    kind: "tag",
    unread: false,
    category: "offers",
    href: routes.offers,
    title_ar: "عرض جديد من XPEL السعودية",
    title_en: "A new offer from XPEL Saudi Arabia",
    body_ar: "تظليل Prime XR لكامل السيارة بخصم 14%",
    body_en: "Prime XR tint for the whole car at 14% off",
    time_ar: "الجمعة 9 أكتوبر",
    time_en: "Fri 9 Oct",
  },
  {
    id: "n-4",
    group: "week",
    kind: "tag",
    unread: false,
    category: "points",
    href: routes.points,
    title_ar: "أُضيفت 349 نقطة لرصيدك",
    title_en: "349 points added to your balance",
    body_ar: "حجز مكتمل · BK-21388 · مركز لمعة للتلميع",
    body_en: "Completed booking · BK-21388 · Lamaa Polishing Center",
    time_ar: "الخميس 8 أكتوبر",
    time_en: "Thu 8 Oct",
  },
];
