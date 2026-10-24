// W2-81 · رابط القسيمة المشتركة (757:13432) — /v/<code>
// العميل بيشارك قسيمة حجزه مع حد تاني (السائق مثلاً) يعرضها عند تسليم السيارة. بدون حساب وبدون بيانات دفع.
// الرابط بالشكل ده ظاهر في P-08 «مشاركة القسيمة»: linkarksa.com/v/LK-9F3K-7QPD
import type { Localized } from "@/i18n/config";
import { johnsonZahraa, type BranchContact } from "./gifts";

type L<K extends string> = Localized<K>;

export type SharedVoucher = {
  code: string; // كود القسيمة (يظهر تحت الـQR)
  booking_no: string;
  qr: string; // صورة الـQR
  sharer: L<"name">;
  contact: BranchContact;
} & L<"title"> & // «جونسون Johnson · فرع الزهراء»
  L<"valid_until"> &
  L<"services"> &
  L<"car"> &
  L<"due">;

// دومين الرابط المعروض في نافذة المشاركة (P-08)
export const shareDomain = "linkarksa.com";

export const sharedVouchers: SharedVoucher[] = [
  {
    code: "LK-9F3K-7QPD",
    booking_no: "BK-21452",
    qr: "/figma/gift/voucher-qr.svg",
    sharer: { name_ar: "محمد س.", name_en: "Mohammed S." },
    contact: johnsonZahraa,
    title_ar: "جونسون Johnson · فرع الزهراء",
    title_en: "Johnson · Al Zahraa branch",
    valid_until_ar: "الأحد 25 أكتوبر",
    valid_until_en: "Sunday 25 October",
    services_ar: "‏Johnson Ceramic Pro + تفصيل داخلي كامل",
    services_en: "Johnson Ceramic Pro + full interior detailing",
    car_ar: "تويوتا كامري 2023 · ر س ح 1234",
    car_en: "Toyota Camry 2023 · RSH 1234",
    due_ar: "لا شيء — الحجز مدفوع",
    due_en: "Nothing — the booking is paid",
  },
  // قسيمة باقة الوكالة (W2-80c) لما تتشارك من «مشاركة القسيمة» — نفس بيانات W2-80c
  {
    code: "LK-3R7D-9KWA",
    booking_no: "BK-21414",
    qr: "/figma/gift/voucher-qr.svg",
    sharer: { name_ar: "محمد س.", name_en: "Mohammed S." },
    contact: johnsonZahraa,
    title_ar: "جونسون Johnson · فرع الزهراء",
    title_en: "Johnson · Al Zahraa branch",
    valid_until_ar: "الثلاثاء 5 يناير 2027",
    valid_until_en: "Tuesday 5 January 2027",
    services_ar: "‏Johnson Ceramic Pro · سيدان",
    services_en: "Johnson Ceramic Pro · Sedan",
    car_ar: "تويوتا كامري 2026",
    car_en: "Toyota Camry 2026",
    due_ar: "لا شيء — الحجز مدفوع",
    due_en: "Nothing — the booking is paid",
  },
];
