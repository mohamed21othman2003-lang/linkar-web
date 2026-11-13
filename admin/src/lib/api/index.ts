// طبقة الـAPI (القسم 2.4). الـAPI لسه بيتبني، فكل الدوال هنا بترجع بيانات تجريبية بنفس شكل الخادم
// بعد تأخير بسيط. لما الخادم يجهز: نغيّر جسم الدوال لـfetch من غير ما الشاشات تتغيّر.
import type { Me, Session } from "./types";
import { auditApi, rolesApi, usersApi } from "./users";
import { exportsApi } from "./exports";
import { providersApi } from "./providers";
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
      await fetch("/api/auth/logout", { method: "POST" });
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
  // القسم 7 و 8 · مقدّمو الخدمة
  providers: providersApi,
};

// صلاحيات (القسم 2.5): لكل وحدة أربعة إجراءات + صلاحيات حساسة. «*» = كل الصلاحيات.
export type Action = "view" | "edit" | "decide" | "delete";
export const can = (me: Pick<Me, "permissions"> | undefined, module: string, action: Action) =>
  !!me && (me.permissions.includes("*") || me.permissions.includes(`${module}:${action}`));
