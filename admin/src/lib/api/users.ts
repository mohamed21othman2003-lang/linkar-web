// المستخدمون والصلاحيات وسجل التدقيق (القسم 6) — بيانات تجريبية بنفس شكل الخادم المتوقع.
// المصدر: إطارات Figma CON5-23 / 23D / 23R / 23L / 23LD (صفحة 3114:412).
import { ApiError, DEMO_OTP, delay } from "./errors";

// ───────────── الوحدات والصلاحيات (CON5-23R) ─────────────
export const MODULES = [
  "نظرة عامة",
  "التحليلات والتقارير",
  "الطلبات",
  "الحجوزات",
  "العملاء",
  "الضمانات",
  "مقدّمو الخدمة",
  "الفروع",
  "الوكالات",
  "المسوّقون",
  "الخدمات",
  "العروض والباقات",
  "الأسعار",
  "مستحقات المزوّدين",
  "المدفوعات والاستردادات",
  "الفواتير والقسائم",
  "الاعتماد",
  "التقييم الميداني",
  "التقييمات والشكاوى",
  "الرسائل",
  "البيانات المرجعية",
  "السياسات",
  "الميزات المدفوعة",
  "المستخدمون والسجل",
] as const;
export type ModuleName = (typeof MODULES)[number];

/** الإجراءات الأربعة بالترتيب (القسم 2.5) */
export const ACTIONS = ["عرض", "إضافة وتعديل", "قرار واعتماد", "إلغاء وحذف"] as const;
/** [عرض، إضافة وتعديل، قرار واعتماد، إلغاء وحذف] */
export type Grant = [boolean, boolean, boolean, boolean];

export const SENSITIVE = [
  { key: "refunds", label: "الإلغاء والاسترداد", hint: "إلغاء الحجز واسترداد المبلغ للعميل" },
  { key: "prices", label: "تعديل الأسعار", hint: "سعر البيع، وتكلفة المزوّد بعد اتفاق مكتوب معه" },
  { key: "payouts", label: "اعتماد دفعات التحويل للمزوّدين", hint: "اعتماد الدفعة الشهرية للمزوّدين، وإضافة الخصومات والتسويات" },
  { key: "approvals", label: "قرارات الاعتماد والزيارات", hint: "اعتماد منشأة أو فرع أو خدمة بعد الزيارة" },
  { key: "broadcast", label: "الإرسال الجماعي للعملاء", hint: "رسائل نصية وإشعارات وكوبونات وهدايا لشرائح العملاء" },
  { key: "low-margin", label: "اعتماد هامش أقل من الحد الأدنى", hint: "نشر عرض أو سعر يقل هامش لينكار فيه عن 15%" },
  { key: "provider-users", label: "إدارة مستخدمي المزوّدين", hint: "إنشاء حسابات لوحة المزوّد وإيقافها" },
  { key: "payout-accounts", label: "اعتماد حسابات استلام المزوّدين", hint: "إضافة حساب بنكي أو محفظة، أو تغيير الحساب الافتراضي أو حساب فرع" },
  { key: "reassign", label: "تحويل الحجز لفرع أو مزوّد آخر", hint: "يغيّر الفرع أو المزوّد وتكلفة الحجز دون تغيير ما دفعه العميل" },
  { key: "users-roles", label: "إدارة المستخدمين والأدوار", hint: "دعوة وإيقاف وتعديل الصلاحيات" },
  { key: "agency-credit", label: "حد ائتمان الوكالات وسدادها", hint: "تعديل حد الائتمان، وتسجيل السداد والشحن، واعتماد طلبات الوكالات" },
  { key: "affiliates", label: "عمولات المسوّقين وتحويلها", hint: "اعتماد العمولة أو رفضها، وتسجيل تحويل الدفعات، واعتماد حسابات استلام المسوّقين" },
] as const;
export type SensitiveKey = (typeof SENSITIVE)[number]["key"];

export const SCOPES = ["كل المدن", "الرياض", "جدة", "الدمام"] as const;

// ───────────── الأنواع ─────────────
export type UserStatus = "active" | "invited" | "suspended";

export interface PanelUser {
  id: string;
  name: string;
  email: string;
  /** الجوال كما يرجع من الخادم (مخفي إلا آخر 4) */
  phoneMasked: string;
  roleId: string;
  /** لو المسمّى في الدرج مختلف عن اسم الدور (مديرة النظام) */
  roleTitle?: string;
  scope: string;
  /** "now" · تاريخ ISO · null = لم يسجّل الدخول */
  lastLogin: string | null;
  lastCity?: string;
  mfa: boolean;
  status: UserStatus;
  /** تاريخ إرسال الدعوة للدعوات المعلّقة */
  invitedAt?: string;
  isMe?: boolean;
}

export interface Role {
  id: string;
  name: string;
  /** السطر الثاني تحت اسم الدور في الجدول */
  tagline?: string;
  /** «أبرز الصلاحيات» في الجدول */
  highlights: string;
  /** وصف رأس محرر الدور */
  description: string;
  scope: string;
  memberCount: number;
  updatedBy: string | null;
  updatedAt: string | null;
  /** مدير النظام: للعرض فقط */
  system?: boolean;
  grants: Record<ModuleName, Grant>;
  sensitive: Record<SensitiveKey, boolean>;
}

export interface AuditEntry {
  id: string;
  at: string;
  user: string;
  module: string;
  action: string;
  item: string;
  ip: string | null;
  change: { field: string; before: string; after: string };
}

export type ListResult<T, C extends string = string> = { items: T[]; total: number; counts: Record<C, number> };

// ───────────── البيانات ─────────────
const g = (s: string): Grant => [...s].map((c) => c === "Y") as Grant;
function grants(rows: string): Record<ModuleName, Grant> {
  const parts = rows.split(" ");
  return Object.fromEntries(MODULES.map((m, i) => [m, g(parts[i] ?? "----")])) as Record<ModuleName, Grant>;
}
function sens(on: string): Record<SensitiveKey, boolean> {
  return Object.fromEntries(SENSITIVE.map((s, i) => [s.key, on[i] === "1"])) as Record<SensitiveKey, boolean>;
}
const ALL = Array(24).fill("YYYY").join(" ");
const OCT1 = "2026-10-01T13:20:00";

let roles: Role[] = [
  { id: "admin", name: "مدير النظام", tagline: "كل الصلاحيات", highlights: "كل الوحدات · كل الإجراءات", description: "كل الوحدات وكل الإجراءات في كل المدن · الدور الوحيد الذي يدير المستخدمين والأدوار", scope: "كل المدن", memberCount: 1, updatedBy: null, updatedAt: null, system: true, grants: grants(ALL), sensitive: sens("111111111111") },
  { id: "operations", name: "مدير العمليات", highlights: "كل الوحدات · المستخدمون والإعدادات عرض فقط", description: "كل الوحدات · المستخدمون والبيانات المرجعية والسياسات عرض فقط", scope: "كل المدن", memberCount: 0, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants(Array(20).fill("YYYY").join(" ") + " Y--- Y--- YYYY Y---"), sensitive: sens("111111101000") },
  { id: "bookings", name: "لينكار", highlights: "الحجوزات · تعذّر قبول الخدمة · الإلغاء والاسترداد", description: "الحجوزات وتعذّر قبول الخدمة والإلغاء والاسترداد", scope: "كل المدن", memberCount: 3, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- ---- YY-- YYYY YY-- YY-- Y--- Y--- ---- ---- ---- ---- ---- ---- Y--- Y--- ---- ---- YY-- YY-- ---- ---- ---- ----"), sensitive: sens("100000001000") },
  { id: "finance", name: "المالية", highlights: "مستحقات المزوّدين · المدفوعات والاستردادات · الفواتير", description: "المستحقات والمدفوعات والفواتير", scope: "كل المدن", memberCount: 2, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- Y--- YY-- ---- ---- ---- Y--- ---- Y-Y- Y-Y- ---- ---- Y--- YYYY YYYY YYYY ---- ---- ---- ---- ---- ---- ---- ----"), sensitive: sens("001000010011") },
  { id: "pricing", name: "التسعير والكتالوج", highlights: "الأسعار · الخدمات · العروض والباقات", description: "الخدمات والعروض والباقات والأسعار وطلباتها", scope: "كل المدن", memberCount: 1, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- ---- YY-- ---- ---- ---- Y--- ---- ---- ---- YYYY YYYY YYYY Y--- ---- ---- ---- ---- ---- ---- Y--- ---- ---- ----"), sensitive: sens("010000000000") },
  { id: "quality", name: "الجودة والزيارات", highlights: "الطلبات (الفروع والخدمات) · التقييم الميداني · القوالب", description: "الاعتماد والزيارات الميدانية والقوالب والشكاوى", scope: "كل المدن", memberCount: 4, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- ---- YY-- ---- ---- Y--- YY-- YY-- ---- ---- ---- ---- ---- ---- ---- ---- YYYY YYYY YY-- ---- YY-- ---- ---- ----"), sensitive: sens("000100000000") },
  { id: "support", name: "خدمة العملاء", highlights: "العملاء · الرسائل · الحجوزات (عرض · بلا إلغاء أو استرداد)", description: "العملاء والرسائل · الحجوزات عرض فقط بلا إلغاء أو استرداد", scope: "كل المدن", memberCount: 6, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- ---- Y--- Y--- YY-- Y--- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- YY-- YYYY ---- ---- ---- ----"), sensitive: sens("000000000000") },
  { id: "partnerships", name: "الشراكات والفوترة", highlights: "الوكالات · المسوّقون · الميزات المدفوعة", description: "الوكالات والمسوّقون والميزات المدفوعة", scope: "كل المدن", memberCount: 2, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("Y--- Y--- ---- ---- ---- ---- ---- ---- YYYY YYYY ---- Y--- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- YYYY ----"), sensitive: sens("000000100011") },
  { id: "content", name: "المحتوى والتسويق", highlights: "العروض (عرض) · إدارة المحتوى · الرسائل (عرض)", description: "العروض عرض فقط · إدارة المحتوى · الرسائل عرض فقط", scope: "كل المدن", memberCount: 1, updatedBy: "سلطان العنزي", updatedAt: OCT1, grants: grants("---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- Y--- ---- ---- ---- ---- ---- ---- ---- Y--- ---- ---- ---- ----"), sensitive: sens("000010000000") },
];

let users: PanelUser[] = [
  { id: "u-1", name: "نوف القحطاني", email: "noura@linkar.sa", phoneMasked: "050 ••• 1203", roleId: "admin", roleTitle: "مديرة النظام", scope: "كل المدن", lastLogin: "now", lastCity: "الرياض", mfa: true, status: "active", isMe: true },
  { id: "u-2", name: "لينا الحربي", email: "lina@linkar.sa", phoneMasked: "055 ••• 7781", roleId: "quality", scope: "كل المدن", lastLogin: "2026-10-14T09:12:00", lastCity: "جدة", mfa: true, status: "active" },
  { id: "u-3", name: "هند المطيري", email: "hind@linkar.sa", phoneMasked: "054 ••• 3320", roleId: "bookings", scope: "كل المدن", lastLogin: "2026-10-14T08:40:00", lastCity: "جدة", mfa: true, status: "active" },
  { id: "u-4", name: "عبدالرحمن ح.", email: "abdulrahman@linkar.sa", phoneMasked: "050 ••• 6618", roleId: "finance", scope: "كل المدن", lastLogin: "2026-10-14T08:05:00", lastCity: "الرياض", mfa: true, status: "active" },
  { id: "u-5", name: "ريم الشهري", email: "reem@linkar.sa", phoneMasked: "053 ••• 4407", roleId: "support", scope: "كل المدن", lastLogin: "2026-10-14T07:55:00", lastCity: "جدة", mfa: true, status: "active" },
  { id: "u-6", name: "ماجد الفيفي", email: "majed@linkar.sa", phoneMasked: "055 ••• 9012", roleId: "quality", scope: "كل المدن", lastLogin: "2026-10-13T16:20:00", lastCity: "الرياض", mfa: true, status: "active" },
  { id: "u-7", name: "عبدالعزيز المالكي", email: "aziz@linkar.sa", phoneMasked: "054 ••• 0932", roleId: "partnerships", scope: "كل المدن", lastLogin: "2026-10-13T11:00:00", lastCity: "الرياض", mfa: true, status: "active" },
  { id: "u-8", name: "سلطان العنزي", email: "sultan@linkar.sa", phoneMasked: "050 ••• 6610", roleId: "pricing", scope: "كل المدن", lastLogin: "2026-10-12T10:30:00", lastCity: "الرياض", mfa: true, status: "active" },
  { id: "u-9", name: "ريما القرشي", email: "rima@linkar.sa", phoneMasked: "", roleId: "content", scope: "كل المدن", lastLogin: null, mfa: false, status: "invited", invitedAt: "2026-10-11T10:00:00" },
];

let audit: AuditEntry[] = [
  { id: "LOG-0", at: "2026-10-14T11:40:00", user: "نوف القحطاني", module: "مقدّمو الخدمة", action: "إضافة وتفعيل مقدّم خدمة", item: "مركز الواحة للعناية", ip: "10.20.4.18", change: { field: "الحالة", before: "غير موجود", after: "نشط · فرع النرجس · أُرسلت دعوة المالك" } },
  { id: "LOG-1", at: "2026-10-14T10:05:00", user: "نوف القحطاني", module: "الخدمات والمعايير", action: "تعديل قالب التقييم", item: "نانو سيراميك", ip: "10.20.4.18", change: { field: "قالب التقييم", before: "3 جوانب", after: "4 جوانب: + «العناية بالسيارة ونظافتها»" } },
  { id: "LOG-2", at: "2026-10-11T18:10:00", user: "النظام", module: "الجودة", action: "تصعيد شكوى", item: "CM-3349", ip: null, change: { field: "الحالة", before: "بانتظار رد المركز", after: "لدى لينكار" } },
  { id: "LOG-3", at: "2026-10-08T16:40:00", user: "عبدالعزيز المالكي", module: "الوكالات", action: "تسجيل سداد", item: "INV-2026-10-0212", ip: "10.20.4.31", change: { field: "حالة الكشف", before: "صادر · 18,750", after: "مسدّد · TRX-55119002" } },
  { id: "LOG-4", at: "2026-10-08T14:15:00", user: "لينا الحربي", module: "الاعتماد", action: "اعتماد شهادة", item: "REQ-2026-0396 · XPEL", ip: "10.20.4.22", change: { field: "التوثيق", before: "بدون", after: "موثّق · XPEL Ultimate Plus" } },
  { id: "LOG-5", at: "2026-10-06T11:00:00", user: "نوف القحطاني", module: "الاعتماد", action: "اعتماد تعديل", item: "REQ-2026-0393 · جونسون", ip: "10.20.4.18", change: { field: "الشعار", before: "الشعار القديم", after: "الشعار الجديد" } },
  { id: "LOG-6", at: "2026-10-04T09:30:00", user: "عبدالعزيز المالكي", module: "المسوّقون", action: "تسجيل تحويل", item: "PY-2026-10-001", ip: "10.20.4.31", change: { field: "الدفعة", before: "معتمدة · 18,420.75", after: "مُحوّلة" } },
  { id: "LOG-7", at: "2026-10-01T13:20:00", user: "سلطان العنزي", module: "المستخدمون والصلاحيات", action: "تعديل صلاحيات", item: "الشراكات والفوترة", ip: "10.20.4.10", change: { field: "المسوّقون", before: "عرض", after: "عرض · اعتماد · تصدير" } },
];

/** «الآن» في البيانات التجريبية (آخر تحديث في التصميم) — فلتر «آخر 30 يوماً» بيتحسب منه */
export const MOCK_NOW = new Date("2026-10-14T12:00:00");
const ME_NAME = "نوف القحطاني";
const ME_IP = "10.20.4.18";

function log(module: string, action: string, item: string, field: string, before: string, after: string) {
  audit = [{ id: `LOG-${audit.length}`, at: new Date().toISOString(), user: ME_NAME, module, action, item, ip: ME_IP, change: { field, before, after } }, ...audit];
}

const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? "—";
const counts = () => ({ users: users.length, roles: roles.length });
const clone = <T,>(v: T): T => structuredClone(v);

// ───────────── الدوال ─────────────
export type InviteInput = { name: string; phone: string; email: string; roleId: string; scope: string };
export type UserEdit = { name: string; phone: string; roleId: string; scope: string };
export type RoleInput = { name: string; scope: string; grants: Record<ModuleName, Grant>; sensitive: Record<SensitiveKey, boolean> };
export type AuditQuery = { search?: string; user?: string; module?: string; period?: string; page?: number };

export const usersApi = {
  list: async (q: { page?: number; search?: string } = {}): Promise<ListResult<PanelUser, "users" | "roles">> => {
    const s = q.search?.trim();
    const items = s ? users.filter((u) => u.name.includes(s) || u.email.includes(s)) : users;
    return delay({ items: clone(items), total: items.length, counts: counts() });
  },
  get: async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) throw new ApiError(404);
    return delay(clone(u), 150);
  },
  invite: async (input: InviteInput) => {
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) throw new ApiError(422, "", { email: "هذا البريد مستخدم بالفعل" });
    const u: PanelUser = { id: `u-${Date.now()}`, name: input.name, email: input.email, phoneMasked: maskPhone(input.phone), roleId: input.roleId, scope: input.scope, lastLogin: null, mfa: false, status: "invited", invitedAt: new Date().toISOString() };
    users = [...users, u];
    bump(input.roleId, 1);
    log("المستخدمون والصلاحيات", "دعوة مستخدم", input.email, "الحالة", "غير موجود", `دعوة معلّقة · ${roleName(input.roleId)}`);
    return delay(clone(u));
  },
  update: async (id: string, input: UserEdit) => {
    const u = users.find((x) => x.id === id);
    if (!u) throw new ApiError(404);
    const before = `${roleName(u.roleId)} · ${u.scope}`;
    if (u.roleId !== input.roleId) {
      bump(u.roleId, -1);
      bump(input.roleId, 1);
      if (u.roleTitle) u.roleTitle = undefined;
    }
    Object.assign(u, { name: input.name, roleId: input.roleId, scope: input.scope, phoneMasked: input.phone.includes("•") ? u.phoneMasked : maskPhone(input.phone) });
    log("المستخدمون والصلاحيات", "تعديل مستخدم", u.name, "الدور والنطاق", before, `${roleName(u.roleId)} · ${u.scope}`);
    return delay(clone(u));
  },
  suspend: async (id: string, reason: string) => {
    const u = users.find((x) => x.id === id);
    if (!u || u.isMe) throw new ApiError(403);
    u.status = "suspended";
    log("المستخدمون والصلاحيات", "إيقاف حساب", u.name, "الحالة", "نشط", `موقوف · ${reason}`);
    return delay(clone(u));
  },
  reactivate: async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) throw new ApiError(404);
    u.status = "active";
    log("المستخدمون والصلاحيات", "إعادة تفعيل حساب", u.name, "الحالة", "موقوف", "نشط");
    return delay(clone(u));
  },
  resendInvite: async (id: string) => {
    const u = users.find((x) => x.id === id && x.status === "invited");
    if (!u) throw new ApiError(404);
    u.invitedAt = new Date().toISOString();
    log("المستخدمون والصلاحيات", "إعادة إرسال دعوة", u.email, "الدعوة", "مرسلة", "أُعيد إرسالها");
    return delay({ ok: true });
  },
  deleteInvite: async (id: string) => {
    const u = users.find((x) => x.id === id && x.status === "invited");
    if (!u) throw new ApiError(404);
    users = users.filter((x) => x.id !== id);
    bump(u.roleId, -1);
    log("المستخدمون والصلاحيات", "حذف دعوة", u.email, "الدعوة", "معلّقة", "محذوفة");
    return delay({ ok: true });
  },
};

export const rolesApi = {
  list: async (): Promise<ListResult<Role, "users" | "roles">> => delay({ items: clone(roles), total: roles.length, counts: counts() }),
  get: async (id: string) => {
    const r = roles.find((x) => x.id === id);
    if (!r) throw new ApiError(404);
    return delay({ role: clone(r), members: clone(users.filter((u) => u.roleId === id)) }, 200);
  },
  /** صلاحية حساسة «إدارة المستخدمين والأدوار»: من غير رمز التحقق الخادم يرد 428 (القسم 2.5) */
  save: async (id: string | null, input: RoleInput, otp?: string) => {
    await delay(null, 300);
    if (!otp) throw new ApiError(428, "otp_required");
    if (otp.replace(/\s/g, "") !== DEMO_OTP) throw new ApiError(422, "", { otp: "رمز التحقق غير صحيح" });
    if (!input.name.trim()) throw new ApiError(422, "", { name: "اكتب اسم الدور" });
    const now = new Date().toISOString();
    if (id) {
      const r = roles.find((x) => x.id === id);
      if (!r || r.system) throw new ApiError(403);
      Object.assign(r, clone(input), { updatedBy: ME_NAME, updatedAt: now });
      log("المستخدمون والصلاحيات", "تعديل صلاحيات", r.name, "الصلاحيات", "قبل الحفظ", "حُفظت");
      return clone(r);
    }
    const r: Role = { id: `role-${Date.now()}`, ...clone(input), highlights: "—", description: "", memberCount: 0, updatedBy: ME_NAME, updatedAt: now };
    roles = [...roles, r];
    log("المستخدمون والصلاحيات", "إضافة دور", r.name, "الدور", "غير موجود", "جديد");
    return clone(r);
  },
};

export const auditApi = {
  list: async (q: AuditQuery = {}): Promise<ListResult<AuditEntry, "all">> => {
    const days = q.period === "7" ? 7 : q.period === "90" ? 90 : q.period === "all" ? Infinity : 30;
    const from = MOCK_NOW.getTime() - days * 86_400_000;
    const s = q.search?.trim();
    const items = audit.filter(
      (e) =>
        new Date(e.at).getTime() >= from &&
        (!q.user || q.user === "all" || e.user === q.user) &&
        (!q.module || q.module === "all" || e.module === q.module) &&
        (!s || e.item.includes(s) || e.action.includes(s)),
    );
    return delay({ items: clone(items), total: items.length, counts: { all: audit.length } });
  },
  get: async (id: string) => {
    const e = audit.find((x) => x.id === id);
    if (!e) throw new ApiError(404);
    return delay(clone(e), 150);
  },
  /** خيارات الفلاتر: المستخدمون والوحدات الموجودة في السجل */
  facets: async () => delay({ users: [...new Set(audit.map((e) => e.user))], modules: [...new Set(audit.map((e) => e.module))] }, 100),
  /** التصدير نفسه بيتسجّل في السجل (CON5-M00) */
  record: (module: string, item: string, detail: string) => log(module, "تصدير", item, "الملف", "—", detail),
};

function bump(roleId: string, by: number) {
  const r = roles.find((x) => x.id === roleId);
  if (r) r.memberCount = Math.max(0, r.memberCount + by);
}
function maskPhone(p: string) {
  const d = p.replace(/\D/g, "");
  return d.length >= 7 ? `${d.slice(0, 3)} ••• ${d.slice(-4)}` : p;
}
