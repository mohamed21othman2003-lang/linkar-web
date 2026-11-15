// طبقة الـAPI (القسم 2.4). الـAPI لسه بيتبني، فكل الدوال هنا بترجع بيانات تجريبية بنفس شكل الخادم
// بعد تأخير بسيط. لما الخادم يجهز: نغيّر جسم الدوال لـfetch من غير ما الشاشات تتغيّر.
import type { Me, Session } from "./types";
import { auditApi, rolesApi, usersApi } from "./users";
import { exportsApi } from "./exports";
import { providersApi } from "./providers";
import { profileApi } from "./profile";
import { servicesApi } from "./services";
import { branchesApi } from "./branches";
import { providerUsersApi } from "./provider-users";
import { providerTabsApi } from "./provider-tabs";
import { sharedApi } from "./shared";
import { offersApi } from "./offers";
import { bankApi } from "./bank";
import { linkarOffersApi, requestsApi } from "./requests";
import { overviewApi } from "./overview";
import { analyticsApi } from "./analytics";
import { reportsApi } from "./reports";
import { bookingsApi } from "./bookings";
import { customersApi } from "./customers";
import { couponsApi } from "./coupons";
import { agenciesApi } from "./agencies";
import { agencyExtraApi, agencyRequestsApi } from "./agency-extra";
import { vouchersApi as agencyVouchersApi } from "./agency-vouchers";
import { agencyProfileApi } from "./agency-profile";
import { marketersApi } from "./marketers";
import { centersApi, fieldVisitsApi, practicalApi } from "./field-evaluation";
import { qualityApi } from "./reviews";
import { paymentsApi } from "./payments";
import { invoicesApi } from "./invoices";
import { duesApi } from "./dues";
import { messagesApi } from "./messages";
import { policiesApi } from "./policies";
import { paidFeaturesApi } from "./paid-features";
import { referenceApi } from "./reference";
import { notificationsApi } from "./notifications";
import { withBase } from "@/lib/base-path";
export type * from "./types";
export { ApiError, isApiError } from "./errors";

const delay = <T,>(v: T, ms = 350) => new Promise<T>((r) => setTimeout(() => r(v), ms));

const ME: Me = {
  id: "u-1",
  name: "نوف القحطاني",
  initial: "ن",
  role: "مديرة النظام",
  scope: "كل الصلاحيات · كل المدن",
  email: "noura@linkar.sa",
  phoneMasked: "050 ••• 1203",
  memberSince: "2026-08-02",
  passwordChangedDaysAgo: 41,
  mfa: { enabled: true, method: "تطبيق المصادقة" },
  permissions: ["*"],
};

let sessions: Session[] = [
  { id: "s-1", device: "Chrome · Windows", city: "الرياض", lastSeen: "now", current: true },
  { id: "s-2", device: "Safari · iPhone", city: "الرياض", lastSeen: "3h" },
];

export const api = {
  auth: {
    forgotPassword: async (email: string) => delay({ ok: true, email }),
    resetPassword: async (token: string, password: string) => delay({ ok: !!token && password.length >= 12 }),
    logout: async () => {
      await fetch(withBase("/api/auth/logout"), { method: "POST" });
    },
  },
  me: {
    get: async () => delay(ME, 150),
    sessions: async () => delay(sessions),
    changePassword: async (current: string, next: string) => {
      if (!current || next.length < 12) return delay({ ok: false });
      ME.passwordChangedDaysAgo = 0;
      sessions = sessions.filter((s) => s.current);
      return delay({ ok: true });
    },
    resetMfa: async () => delay({ ok: true }),
    logoutOtherDevices: async () => {
      sessions = sessions.filter((s) => s.current);
      return delay({ ok: true });
    },
  },
  // القسم 6 · المستخدمون والصلاحيات وسجل التدقيق
  users: usersApi,
  roles: rolesApi,
  audit: auditApi,
  exports: exportsApi,
  // القسم 15 · النوافذ المشتركة CON5-M00 (معاينة مستند · اتصال · إسناد · ملاحظة داخلية)
  shared: sharedApi,
  // القسم 7 و 8 · مقدّمو الخدمة
  providers: providersApi,
  // القسم 9 و 10 · ملف المزوّد والخدمات والأسعار
  profile: profileApi,
  services: servicesApi,
  // القسم 14 · مستخدمو لوحة المزوّد
  providerUsers: providerUsersApi,
  // القسم 15 · تبويبات الملف المؤجّلة (الشكل فقط) + أرقام تبويب الفروع
  providerTabs: providerTabsApi,
  // القسم 12 · الفروع
  branches: branchesApi,
  // القسم 11 · العروض والباقات · القسم 13 · الحساب البنكي
  offers: offersApi,
  bank: bankApi,
  // المرحلة 2 · الطلبات CON5-03 (+ عروض لينكار CON5-12D اللي بتتفتح منها)
  requests: requestsApi,
  linkarOffers: linkarOffersApi,
  // المرحلة 2 · الرئيسية «نظرة عامة» CON5-01
  overview: overviewApi,
  // المرحلة 2 · التحليلات CON5-02
  analytics: analyticsApi,
  // المرحلة 2 · التقارير CON5-02R
  reports: reportsApi,
  // المرحلة 2 · الحجوزات CON5-04
  bookings: bookingsApi,
  // المرحلة 2 · العملاء CON5-05
  customers: customersApi,
  coupons: couponsApi,
  // المرحلة 2 · الشركاء · الوكالات CON5-09
  agencies: agenciesApi,
  agencyExtra: agencyExtraApi,
  agencyRequests: agencyRequestsApi,
  agencyVouchers: agencyVouchersApi,
  agencyProfile: agencyProfileApi,
  // المرحلة 2 · الشركاء · المسوّقون CON5-10
  marketers: marketersApi,
  // المرحلة 2 · التقييم الميداني والتصنيف CON5-17
  fieldVisits: fieldVisitsApi,
  centers: centersApi,
  practical: practicalApi,
  // المرحلة 2 · التقييمات والشكاوى CON5-18
  quality: qualityApi,
  // المرحلة 2 · المدفوعات والاستردادات CON5-15
  payments: paymentsApi,
  // المرحلة 2 · الفواتير والقسائم CON5-16
  invoices: invoicesApi,
  // المرحلة 2 · مستحقات المزوّدين CON5-14
  dues: duesApi,
  // المرحلة 2 · الرسائل CON5-19
  messages: messagesApi,
  // المرحلة 2 · الإعدادات · السياسات CON5-21
  policies: policiesApi,
  // المرحلة 2 · الإعدادات · الميزات المدفوعة CON5-22
  paidFeatures: paidFeaturesApi,
  // المرحلة 2 · البيانات المرجعية CON5-20
  reference: referenceApi,
  // CON5-M02 · الإشعارات (جرس الشريط العلوي)
  notifications: notificationsApi,
};

// صلاحيات (القسم 2.5): لكل وحدة أربعة إجراءات + صلاحيات حساسة. «*» = كل الصلاحيات.
export type Action = "view" | "edit" | "decide" | "delete";
export const can = (me: Pick<Me, "permissions"> | undefined, module: string, action: Action) =>
  !!me && (me.permissions.includes("*") || me.permissions.includes(`${module}:${action}`));
