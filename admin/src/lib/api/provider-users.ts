// مستخدمو لوحة المزوّد (القسم 14 · CON5-07a المستخدمون 3114:54076 + نوافذ CON5-07M) — اللي تنشئهم لينكار للوحة المزوّد.
// القسم 18.1: الإضافة والتعديل = الاسم والجوال والدور والفرع بس (من غير بريد)، ومفيش «إعادة تعيين كلمة المرور» لأن الدخول بالجوال + رمز التحقق.
// المخزن نفسه هو مستخدمو profile.ts (usersOf) عشان العدد في التبويب ونموذج الخدمة يشوفوا نفس البيانات.
import { ApiError, delay } from "./errors";
import { branchesOf, usersOf, type ProviderUser } from "./profile";
import { providersApi } from "./providers";

export type ProviderUserKind = ProviderUser["kind"];
export type ProviderUserStatus = NonNullable<ProviderUser["status"]>;

export interface ProviderUserRow {
  id: string;
  name: string;
  /** 10 أرقام «0554102290» — الواجهة تعرضه «055 410 2290» */
  phone: string;
  kind: ProviderUserKind;
  /** «المالك» · «مدير الفرع» · «فني الفرع» */
  roleLabel: string;
  /** null = كل الفروع */
  branchId: string | null;
  /** «كل الفروع» أو اسم الحي «الزهراء» */
  branchLabel: string;
  lastLogin: string | null;
  status: ProviderUserStatus;
}

export const KIND_LABEL: Record<ProviderUserKind, string> = {
  owner: "المالك",
  manager: "مدير الفرع",
  technician: "فني الفرع",
};

/** قائمة «الدور» في نافذة الإضافة/التعديل (القسم 17: المالك، مدير فرع — و«فني الفرع» عشان صفوف الفنيين في الجدول تتعدّل) */
export const KIND_OPTIONS: { value: ProviderUserKind; label: string }[] = [
  { value: "owner", label: "المالك" },
  { value: "manager", label: "مدير فرع" },
  { value: "technician", label: "فني الفرع" },
];

export interface ProviderUserInput {
  name: string;
  phone: string;
  kind: ProviderUserKind;
  branchId: string | null;
}

/** طلبات تحديث جوال المالك المفتوحة (CON5-03D · REQ-2026-0429) */
export interface PhoneRequest {
  id: string;
  /** «REQ-0429» في نص الملاحظة */
  short: string;
  label: string;
}
const PHONE_REQUESTS: Record<string, PhoneRequest[]> = {
  "lk-jn-001": [{ id: "REQ-2026-0429", short: "REQ-0429", label: "REQ-2026-0429 · من فهد العتيبي · 14 أكتوبر 2026" }],
};

const digits = (s: string) => s.replace(/\D/g, "");
let seq = 0;

async function ctx(providerId: string) {
  const p = await providersApi.get(providerId);
  return { p, users: usersOf(p), branches: branchesOf(p) };
}

function roleText(kind: ProviderUserKind, branchName?: string) {
  if (kind === "owner") return "المالك · كل الفروع";
  if (kind === "manager") return `مدير فرع ${branchName ?? ""}`.trim();
  return `فني · فرع ${branchName ?? ""}`.trim();
}

function toRow(u: ProviderUser, names: Map<string, string>): ProviderUserRow {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone ?? "",
    kind: u.kind,
    roleLabel: KIND_LABEL[u.kind],
    branchId: u.branchId,
    branchLabel: u.branchId ? (names.get(u.branchId) ?? "—") : "كل الفروع",
    lastLogin: u.lastLogin ?? null,
    status: u.status ?? "active",
  };
}

function validate(v: ProviderUserInput, users: ProviderUser[], branchIds: string[], selfId?: string) {
  const errors: Record<string, string> = {};
  if (!v.name.trim()) errors.name = "اكتب الاسم";
  if (!/^05\d{8}$/.test(digits(v.phone))) errors.phone = "رقم جوال غير صحيح · 05XXXXXXXX";
  else if (users.some((u) => u.id !== selfId && u.phone === digits(v.phone))) errors.phone = "الرقم مستخدم لحساب آخر";
  if (v.kind === "owner" && users.some((u) => u.id !== selfId && u.kind === "owner")) errors.kind = "للمنشأة مالك واحد";
  if (v.kind !== "owner" && (!v.branchId || !branchIds.includes(v.branchId))) errors.branchId = "اختر الفرع";
  if (Object.keys(errors).length) throw new ApiError(422, "تحقق من الحقول", errors);
}

export const providerUsersApi = {
  /** GET /providers/:id/users?branch= → { items, total, counts } (counts: all + لكل فرع) */
  list: async (providerId: string, q: { branch?: string } = {}) => {
    const { users, branches } = await ctx(providerId);
    const names = new Map(branches.map((b) => [b.id, b.name]));
    const sorted = [...users].sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    const items = sorted.filter((u) => !q.branch || u.branchId === q.branch).map((u) => toRow(u, names));
    const counts: Record<string, number> = { all: users.length };
    for (const b of branches) counts[b.id] = users.filter((u) => u.branchId === b.id).length;
    return delay({ items, total: items.length, counts });
  },
  get: async (providerId: string, userId: string) => {
    const { users, branches } = await ctx(providerId);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new ApiError(404, "المستخدم غير موجود");
    return delay(toRow(u, new Map(branches.map((b) => [b.id, b.name]))), 120);
  },
  /** فروع المنشأة المعتمدة (قائمة «الفرع» · القسم 17: فرع الزهراء، فرع الحمراء، فرع المحمدية) */
  branchOptions: async (providerId: string) => {
    const { branches } = await ctx(providerId);
    return delay(branches.filter((b) => b.status === "approved").map((b) => ({ value: b.id, label: `فرع ${b.name}`, short: b.name })), 100);
  },
  create: async (providerId: string, v: ProviderUserInput) => {
    const { users, branches } = await ctx(providerId);
    validate(v, users, branches.filter((b) => b.status === "approved").map((b) => b.id));
    const branch = branches.find((b) => b.id === v.branchId);
    const u: ProviderUser = {
      id: `u-${providerId}-${Date.now().toString(36)}-${++seq}`,
      name: v.name.trim(),
      role: roleText(v.kind, branch?.name),
      branchId: v.kind === "owner" ? null : v.branchId,
      kind: v.kind,
      phone: digits(v.phone),
      lastLogin: null,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    users.push(u);
    return delay(u, 450);
  },
  update: async (providerId: string, userId: string, v: ProviderUserInput) => {
    const { users, branches } = await ctx(providerId);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new ApiError(404, "المستخدم غير موجود");
    validate(v, users, branches.filter((b) => b.status === "approved").map((b) => b.id), userId);
    const branch = branches.find((b) => b.id === v.branchId);
    Object.assign(u, {
      name: v.name.trim(),
      phone: digits(v.phone),
      kind: v.kind,
      branchId: v.kind === "owner" ? null : v.branchId,
      role: roleText(v.kind, branch?.name),
    });
    return delay(u, 450);
  },
  /** إيقاف الحساب (CON5-07M · إدارة المستخدم) — حساب المالك ما يتوقفش إلا بإيقاف المنشأة */
  pause: async (providerId: string, userId: string) => {
    const { users } = await ctx(providerId);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new ApiError(404, "المستخدم غير موجود");
    if (u.kind === "owner") throw new ApiError(409, "لا يُوقف حساب المالك إلا بإيقاف المنشأة");
    u.status = "paused";
    return delay(u, 400);
  },
  resume: async (providerId: string, userId: string) => {
    const { users } = await ctx(providerId);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new ApiError(404, "المستخدم غير موجود");
    u.status = u.lastLogin ? "active" : "new";
    return delay(u, 400);
  },
  remove: async (providerId: string, userId: string) => {
    const { users } = await ctx(providerId);
    const i = users.findIndex((x) => x.id === userId);
    if (i < 0) throw new ApiError(404, "المستخدم غير موجود");
    if (users[i].kind === "owner") throw new ApiError(409, "لا يُحذف حساب المالك");
    users.splice(i, 1);
    return delay({ ok: true }, 400);
  },
  phoneRequests: async (providerId: string) => delay(PHONE_REQUESTS[providerId] ?? [], 100),
  /** تحديث جوال الدخول (CON5-07M · تحديث جوال المالك 3114:54351): يُرسل رمز تحقق للرقم الجديد ويُنفَّذ الطلب */
  updatePhone: async (providerId: string, userId: string, v: { phone: string; request?: string }) => {
    const { users } = await ctx(providerId);
    const u = users.find((x) => x.id === userId);
    if (!u) throw new ApiError(404, "المستخدم غير موجود");
    const ph = digits(v.phone);
    if (!/^05\d{8}$/.test(ph)) throw new ApiError(422, "تحقق من الحقول", { phone: "رقم جوال غير صحيح · 05XXXXXXXX" });
    if (ph === u.phone) throw new ApiError(422, "تحقق من الحقول", { phone: "الرقم الجديد هو نفس الرقم الحالي" });
    if (users.some((x) => x.id !== userId && x.phone === ph)) throw new ApiError(422, "تحقق من الحقول", { phone: "الرقم مستخدم لحساب آخر" });
    u.phone = ph;
    const reqs = PHONE_REQUESTS[providerId];
    const req = reqs?.find((r) => r.id === v.request);
    if (reqs && req) reqs.splice(reqs.indexOf(req), 1);
    return delay({ user: u, request: req ?? null }, 450);
  },
};
