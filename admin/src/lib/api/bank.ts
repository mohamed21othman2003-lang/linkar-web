// الحساب البنكي (القسم 13) — حسابات استلام المستحقات لكل مزوّد + إعدادات التسوية.
// المصدر: Figma CON5-07a الحساب البنكي 3260:204545 · إضافة حساب استلام 3114:54387 · إعدادات تسوية 3114:54442.
// الحساب الافتراضي لباقي المنشآت مأخوذ من نفس مخزن المنشآت (company.bank / legalName في providers.ts).
import { ApiError, delay } from "./errors";
import { providersApi } from "./providers";
import { branchesOf } from "./profile";

// ───────────── القوائم (القسم 17) ─────────────
export { BANKS } from "./providers";
export const WALLETS = ["STC Pay أعمال", "urpay أعمال"] as const;
export const SETTLEMENT_RULES = ["كل 15 يوماً", "كل 7 أيام", "شهرياً"] as const;
/** الدورة الجاية اللي يسري منها تعديل التسوية */
export const NEXT_CYCLE = "1 – 15 نوفمبر 2026";

export type AccountType = "bank" | "wallet";
export type AccountStatus = "verified" | "pending" | "request";

export interface ReceivingAccount {
  id: string;
  providerId: string;
  type: AccountType;
  /** اسم البنك أو المحفظة */
  provider: string;
  /** الآيبان كامل (الواجهة تعرض آخر 4 بس) — للمحفظة رقم الجوال */
  number: string;
  holder: string;
  /** null = كل الفروع (الحساب الافتراضي) */
  branchId: string | null;
  isDefault: boolean;
  status: AccountStatus;
  /** طلب من المزوّد (CON5-03D) */
  requestId?: string;
  /** وصف الطلب: «طلب جعله الافتراضي بدل الراجحي» */
  requestNote?: string;
  certificate?: { name: string; sizeKb: number };
  createdAt: string;
}
export type AccountInput = Pick<ReceivingAccount, "type" | "provider" | "number" | "holder" | "branchId" | "certificate">;

export interface Settlement {
  rule: string;
  method: "grouped" | "per-branch";
}

// ───────────── عرض ─────────────
const digits = (s: string) => s.replace(/\D/g, "");
export const last4 = (s: string) => digits(s).slice(-4);
/** «مصرف الراجحي •••• 4471» · «‏STC Pay أعمال · 055 410 2290» */
export const accountTitle = (a: Pick<ReceivingAccount, "type" | "provider" | "number">) =>
  a.type === "wallet" ? `‏${a.provider} · ${digits(a.number).replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")}` : `${a.provider} •••• ${last4(a.number)}`;
/** «الراجحي» من «مصرف الراجحي» (للتسوية) · «البنك الأهلي» من «البنك الأهلي السعودي» (للرسائل) */
export const bankShort = (b: string) => b.replace(/^(مصرف|بنك) /, "").replace(/^البنك (.+) السعودي$/, "$1");
export const bankToastName = (b: string) => b.replace(/ السعودي$/, "");

// ───────────── البيانات التجريبية ─────────────
const JN: ReceivingAccount[] = [
  {
    id: "jn-acc-1",
    providerId: "lk-jn-001",
    type: "bank",
    provider: "مصرف الراجحي",
    number: "SA0380000000608010164471",
    holder: "شركة جونسون للعناية بالسيارات",
    branchId: null,
    isDefault: true,
    status: "verified",
    certificate: { name: "IBAN-Certificate-Rajhi.pdf", sizeKb: 210 },
    createdAt: "2026-01-04",
  },
  {
    id: "jn-acc-2",
    providerId: "lk-jn-001",
    type: "bank",
    provider: "البنك الأهلي السعودي",
    number: "SA3110000001400000123456",
    holder: "شركة جونسون للعناية بالسيارات",
    branchId: null,
    isDefault: false,
    status: "request",
    requestId: "REQ-2026-0427",
    requestNote: "طلب جعله الافتراضي بدل الراجحي",
    createdAt: "2026-10-12",
  },
  {
    id: "jn-acc-3",
    providerId: "lk-jn-001",
    type: "wallet",
    provider: "STC Pay أعمال",
    number: "0554102290",
    holder: "شركة جونسون للعناية بالسيارات",
    branchId: "lk-jn-mh-003",
    isDefault: false,
    status: "request",
    requestId: "REQ-2026-0435",
    requestNote: "مخصّصة لفرع المحمدية",
    createdAt: "2026-10-13",
  },
];
let accounts: ReceivingAccount[] = structuredClone(JN);
const seeded = new Set<string>(["lk-jn-001"]);
const settlements: Record<string, Settlement> = {};

/** باقي المنشآت: الحساب الافتراضي من «company.bank» («الراجحي •••• 4471») */
async function ensure(providerId: string) {
  if (seeded.has(providerId)) return;
  seeded.add(providerId);
  const p = await providersApi.get(providerId);
  const m = /^(.+?) •+ (\d{4})$/.exec(p.company.bank);
  if (!m) return;
  const name = m[1].trim();
  const bank = name === "الراجحي" ? "مصرف الراجحي" : name === "الأهلي" ? "البنك الأهلي السعودي" : name;
  accounts.push({
    id: `${providerId}-acc-1`,
    providerId,
    type: "bank",
    provider: bank,
    number: `SA00000000000000000000${m[2]}`.slice(-24).replace(/^../, "SA"),
    holder: p.company.legalName,
    branchId: null,
    isDefault: true,
    status: "verified",
    createdAt: p.joinedAt,
  });
}

const clone = <T>(v: T): T => structuredClone(v);
/** صيغة الآيبان السعودي: SA + 22 رقم */
export const isSaudiIban = (v: string) => /^SA\d{22}$/.test(v.replace(/\s/g, "").toUpperCase());

export const bankApi = {
  /** GET /providers/:id/accounts */
  list: async (providerId: string) => {
    await ensure(providerId);
    const items = accounts.filter((a) => a.providerId === providerId).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return delay({ items: clone(items), total: items.length });
  },
  /** POST /providers/:id/accounts — يُضاف «بانتظار التحقق» ولا تُحوَّل عليه مستحقات قبل تحقق «المالية» */
  add: async (providerId: string, v: AccountInput) => {
    await ensure(providerId);
    const p = await providersApi.get(providerId);
    const n = v.type === "bank" ? v.number.replace(/\s/g, "").toUpperCase() : digits(v.number);
    if (v.type === "bank" && !isSaudiIban(n)) throw new ApiError(422, "", { number: "رقم الآيبان غير صحيح" });
    if (accounts.some((a) => a.providerId === providerId && a.number === n)) throw new ApiError(409, "", { number: "هذا الحساب مضاف من قبل" });
    if (v.branchId && !branchesOf(p).some((b) => b.id === v.branchId)) throw new ApiError(422, "", { branchId: "الفرع غير موجود" });
    const a: ReceivingAccount = {
      ...clone(v),
      number: n,
      id: `${providerId}-acc-${Date.now().toString(36)}`,
      providerId,
      isDefault: false,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    accounts = [...accounts, a];
    return delay({ id: a.id, provider: a.provider });
  },
  settlement: async (providerId: string) => {
    await ensure(providerId);
    const p = await providersApi.get(providerId);
    const def = accounts.find((a) => a.providerId === providerId && a.isDefault);
    return delay(
      {
        ...(settlements[providerId] ?? { rule: SETTLEMENT_RULES[0], method: "grouped" as const }),
        vat: p.company.vat,
        branchCount: branchesOf(p).filter((b) => b.status === "approved").length,
        defaultAccount: def ? `${bankShort(def.provider)} •••• ${last4(def.number)}` : null,
      },
      150,
    );
  },
  saveSettlement: async (providerId: string, v: Settlement) => {
    settlements[providerId] = clone(v);
    return delay({ ok: true, from: NEXT_CYCLE });
  },
};
