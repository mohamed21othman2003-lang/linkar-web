// ملف المزوّد (القسم 9) — رأس الملف وأعداد التبويبات و«نظرة عامة» والفروع والمستخدمون.
// المصدر: إطارات Figma CON5-07a (صفحة 3114:412، قسم «v5 · 07 · مقدّمو الخدمة») — جونسون نظرة عامة 3114:48595 · تعديل البيانات CON5-07E1 3304:158088.
// باقي التبويبات (الحجوزات، التحليلات، المستحقات، …) بتضيف دوالها هنا أو في ملفاتها من غير ما تغيّر الأشكال دي.
import { delay } from "./errors";
import { providersApi, type Provider } from "./providers";

// ───────────── الأنواع ─────────────
export const PROFILE_TABS = ["overview", "bookings", "analytics", "services", "branches", "dues", "bank", "users", "quality"] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export interface ProviderBranch {
  id: string;
  code: string;
  /** اسم الحي («الزهراء») — الواجهة تعرض «فرع الزهراء» */
  name: string;
  status: "approved" | "pending-visit";
  tier?: "platinum" | "gold" | "silver";
}

export interface ProviderUser {
  id: string;
  name: string;
  /** «المالك · كل الفروع» · «مدير فرع الزهراء» · «فني · فرع الزهراء» */
  role: string;
  /** null = كل الفروع */
  branchId: string | null;
  kind: "owner" | "manager" | "technician";
  /** تبويب «المستخدمون» (القسم 14 · CON5-07a 3114:54076) — الجوال 10 أرقام · آخر دخول ISO أو null · الحالة */
  phone?: string;
  lastLogin?: string | null;
  /** active = نشط · new = أُضيف ولم يدخل بعد (شارة «نشط» صفرا) · paused = موقوف */
  status?: "active" | "new" | "paused";
  /** ترتيب الإضافة — الجدول بيترتّب بيه (أقدم الأول) */
  createdAt?: string;
}

export interface ProfileDoc {
  name: string;
  authority: string;
}

export interface ProviderProfile {
  provider: Provider;
  /** شعار المركز (اختياري) */
  logo?: string;
  /** «مركز عناية» / «مغسلة» */
  kindLabel: string;
  joinedAt: string;
  docs: ProfileDoc[];
  /** أعداد التبويبات من الخادم — التبويب من غير عدد ما يظهرلوش شارة (CON5-07a 3114:48595) */
  counts: Partial<Record<ProfileTab, number>>;
}

/** قيم نموذج «تعديل بيانات المنشأة» (CON5-07E1) — الأرقام الحساسة بترجع مخفية من الخادم */
export interface CompanyForm {
  type: "care" | "wash";
  brand: string;
  brandEn: string;
  city: string;
  legalName: string;
  cr: string;
  vat: string;
  unified: string;
  code: string;
  logo: string;
  ownerName: string;
  ownerPhone: string;
  email: string;
  nationalId: string;
  accounts: { bank: string; accountName: string; iban: string }[];
  docs: { cr: string; vat: string; agreement: string };
}

// ───────────── البيانات ─────────────
const DISTRICT_CODE: Record<string, string> = {
  الزهراء: "ZH",
  الحمراء: "HM",
  المحمدية: "MH",
  "أبحر الشمالية": "AB",
  الروضة: "RD",
  الياسمين: "YS",
  العليا: "OL",
  الملقا: "MQ",
  السلامة: "SL",
  النسيم: "NS",
  السامر: "SM",
  النرجس: "NR",
  العارض: "AR",
  الصفا: "SF",
  الشاطئ: "SA",
  الفيصلية: "FS",
  النور: "NO",
  الريان: "RY",
  التحلية: "TH",
  الصحافة: "SH",
  حطين: "HT",
};
const POOL: Record<string, string[]> = {
  الرياض: ["الروضة", "الياسمين", "العليا", "الملقا", "السلامة", "الصحافة", "حطين"],
  جدة: ["الزهراء", "الحمراء", "المحمدية", "الروضة", "السلامة", "النسيم", "التحلية"],
  الدمام: ["الشاطئ", "الفيصلية", "النور", "الريان"],
};

/** فروع جونسون كما في Figma (القائمة 17 «الفروع · إضافة خدمة»: الزهراء LK-JN-ZH-001 · الحمراء LK-JN-HM-002 · المحمدية LK-JN-MH-003) */
const BRANCHES: Record<string, ProviderBranch[]> = {
  "lk-jn-001": [
    {
      id: "lk-jn-zh-001",
      code: "LK-JN-ZH-001",
      name: "الزهراء",
      status: "approved",
      tier: "gold",
    },
    {
      id: "lk-jn-hm-002",
      code: "LK-JN-HM-002",
      name: "الحمراء",
      status: "approved",
      tier: "gold",
    },
    {
      id: "lk-jn-mh-003",
      code: "LK-JN-MH-003",
      name: "المحمدية",
      status: "approved",
      tier: "gold",
    },
    {
      id: "lk-jn-ab-004",
      code: "LK-JN-AB-004",
      name: "أبحر الشمالية",
      status: "pending-visit",
    },
  ],
};

/** باقي المنشآت: الأسماء الظاهرة في سطر الفروع ثم أحياء من نفس المدينة لحد عدد الفروع */
function deriveBranches(p: Provider): ProviderBranch[] {
  const named = (p.branchesLine.split(":")[1] ?? "")
    .split("·")
    .map((s) => s.trim().split(" ")[0])
    .filter((s) => s && !s.startsWith("+"));
  const names = [...named];
  for (const d of POOL[p.city] ?? POOL["الرياض"]) if (names.length < p.branchCount && !names.includes(d)) names.push(d);
  return names.slice(0, p.branchCount).map((name, i) => {
    const code = `${p.code.slice(0, 5)}-${DISTRICT_CODE[name] ?? "BR"}-${String(i + 1).padStart(3, "0")}`;
    return {
      id: code.toLowerCase(),
      code,
      name,
      status: i < p.approvedBranches ? "approved" : "pending-visit",
      tier: p.tiers[0],
    };
  });
}

/** مستخدمو حساب جونسون (CON5-07M إضافة خدمة · «ظهور الأسعار لمستخدمي مقدّم الخدمة» 3260:206684) */
const USERS: Record<string, ProviderUser[]> = {
  "lk-jn-001": [
    {
      id: "u-fahd",
      name: "فهد العتيبي",
      role: "المالك · كل الفروع",
      branchId: null,
      kind: "owner",
      phone: "0554102290",
      lastLogin: "2026-10-14T10:00:00",
      status: "active",
      createdAt: "2026-01-04T09:00:00",
    },
    {
      id: "u-khalid",
      name: "خالد الزهراني",
      role: "مدير فرع الزهراء",
      branchId: "lk-jn-zh-001",
      kind: "manager",
      phone: "0553182207",
      lastLogin: "2026-10-14T10:00:00",
      status: "active",
      createdAt: "2026-01-08T09:00:00",
    },
    {
      id: "u-abdullah",
      name: "عبدالله الغامدي",
      role: "مدير فرع الحمراء",
      branchId: "lk-jn-hm-002",
      kind: "manager",
      phone: "0556421180",
      lastLogin: "2026-10-14T10:00:00",
      status: "active",
      createdAt: "2026-01-09T09:00:00",
    },
    {
      id: "u-yasser",
      name: "ياسر العمري",
      role: "مدير فرع المحمدية",
      branchId: "lk-jn-mh-003",
      kind: "manager",
      phone: "0549802234",
      lastLogin: "2026-10-13T10:00:00",
      status: "active",
      createdAt: "2026-01-10T09:00:00",
    },
    {
      id: "u-majed",
      name: "ماجد الحربي",
      role: "فني · فرع الزهراء",
      branchId: "lk-jn-zh-001",
      kind: "technician",
      phone: "0502217781",
      lastLogin: "2026-10-13T10:00:00",
      status: "active",
      createdAt: "2026-01-05T09:00:00",
    },
    {
      id: "u-faisal",
      name: "فيصل القحطاني",
      role: "فني · فرع المحمدية",
      branchId: "lk-jn-mh-003",
      kind: "technician",
      phone: "0553180942",
      lastLogin: "2026-10-12T10:00:00",
      status: "active",
      createdAt: "2026-01-06T09:00:00",
    },
    {
      id: "u-sultan",
      name: "سلطان الحارثي",
      role: "فني · فرع الحمراء",
      branchId: "lk-jn-hm-002",
      kind: "technician",
      phone: "0506123390",
      lastLogin: null,
      status: "new",
      createdAt: "2026-10-14T10:00:00",
    },
  ],
};
function deriveUsers(p: Provider): ProviderUser[] {
  const owner = p.company.owner !== "—" ? p.company.owner.split(" · ")[0] : p.company.contact.split(" · ")[0];
  return owner && owner !== "—"
    ? [
        {
          id: `u-${p.id}-owner`,
          name: owner,
          role: "المالك · كل الفروع",
          branchId: null,
          kind: "owner",
          phone: (p.company.owner !== "—" ? p.company.owner : p.company.contact).split(" · ")[1]?.replace(/\D/g, "") || undefined,
          lastLogin: null,
          status: "new",
          createdAt: p.joinedAt,
        },
      ]
    : [];
}

const DOCS_JN: ProfileDoc[] = [
  { name: "السجل التجاري للمنشأة", authority: "وزارة التجارة" },
  {
    name: "شهادة ضريبة القيمة المضافة",
    authority: "هيئة الزكاة والضريبة والجمارك",
  },
  { name: "تفويض الموزّع المعتمد", authority: "Johnson Window Films" },
  { name: "الاتفاقية مع لينكار", authority: "لينكار" },
];
const DOCS_DEFAULT: ProfileDoc[] = [DOCS_JN[0], DOCS_JN[1], DOCS_JN[3]];

const EXTRA: Record<
  string,
  {
    logo?: string;
    joinedAt?: string;
    quality?: number;
    form?: Partial<CompanyForm>;
  }
> = {
  "lk-jn-001": {
    logo: "/providers/lk-jn-001.png",
    joinedAt: "2026-01-04",
    quality: 2,
    form: {
      brandEn: "Johnson Window Films",
      unified: "7004 •••• ••",
      logo: "johnson-logo.png · 240 × 240",
      email: "f.alotaibi@johnsoncare.sa",
      nationalId: "1 •••• •••• ••••",
      accounts: [
        {
          bank: "مصرف الراجحي",
          accountName: "شركة جونسون للعناية بالسيارات",
          iban: "SA•• 8000 •••• •••• •••• 4471",
        },
      ],
      docs: { cr: "مرفوع · ساري حتى مارس 2028", vat: "مرفوعة", agreement: "" },
    },
  },
};

export const branchesOf = (p: Provider) => BRANCHES[p.id] ?? deriveBranches(p);
// متخزّنة عشان إضافة/تعديل المستخدمين (provider-users.ts) تفضل ظاهرة في كل مكان
export const usersOf = (p: Provider) => (USERS[p.id] ??= deriveUsers(p));

export const profileApi = {
  get: async (id: string): Promise<ProviderProfile> => {
    const p = await providersApi.get(id);
    const x = EXTRA[id] ?? {};
    return delay(
      {
        provider: p,
        logo: x.logo,
        kindLabel: p.type === "care" ? "مركز عناية" : "مغسلة",
        joinedAt: x.joinedAt ?? p.joinedAt,
        docs: id === "lk-jn-001" ? DOCS_JN : DOCS_DEFAULT,
        counts: {
          branches: p.branchCount,
          users: usersOf(p).length || undefined,
          quality: x.quality,
        },
      },
      150,
    );
  },
  branches: async (id: string) => delay(branchesOf(await providersApi.get(id)), 120),
  users: async (id: string) => delay(usersOf(await providersApi.get(id)), 120),
  /** قيم «تعديل بيانات المنشأة» (CON5-07E1) */
  companyForm: async (id: string): Promise<CompanyForm> => {
    const p = await providersApi.get(id);
    const c = p.company;
    const [ownerName = "", ownerPhone = ""] = c.owner === "—" ? c.contact.split(" · ") : c.owner.split(" · ");
    const [bank = "مصرف الراجحي"] = c.bank === "—" ? [] : [c.bank.split(" •")[0]];
    const last4 = /(\d{4})$/.exec(c.bank)?.[1] ?? "0000";
    const base: CompanyForm = {
      type: p.type,
      brand: p.name,
      brandEn: (p.name.match(/[A-Za-z][A-Za-z ]*/)?.[0] ?? "").trim(),
      city: p.city,
      legalName: c.legalName,
      cr: c.cr,
      vat: c.vat,
      unified: "7••• •••• ••",
      code: p.code,
      logo: "",
      ownerName: ownerName === "—" ? "" : ownerName,
      ownerPhone: ownerPhone,
      email: "",
      nationalId: "1 •••• •••• ••••",
      accounts: [
        {
          bank: bank.startsWith("الراجحي") ? "مصرف الراجحي" : bank,
          accountName: c.legalName,
          iban: `SA•• •••• •••• •••• •••• ${last4}`,
        },
      ],
      docs: { cr: "مرفوع", vat: "مرفوعة", agreement: "" },
    };
    return delay({ ...base, ...(EXTRA[id]?.form ?? {}) }, 200);
  },
  saveCompanyForm: async (id: string, v: CompanyForm) => {
    const p = await providersApi.get(id);
    const acc = v.accounts[0];
    await providersApi.updateCompany(id, {
      ...p.company,
      brand: v.brand,
      legalName: v.legalName,
      cr: v.cr,
      vat: v.vat,
      owner: `${v.ownerName} · ${v.ownerPhone}`,
      bank: `${acc.bank.replace(/^مصرف /, "")} •••• ${acc.iban.replace(/\s/g, "").slice(-4)}`,
    });
    // الأرقام الحساسة بتتخزن وترجع مخفية زي ما الخادم بيعمل
    const digits = (s: string) => s.replace(/\D/g, "");
    const unified = /^\d{10}$/.test(digits(v.unified)) && !v.unified.includes("•") ? `${digits(v.unified).slice(0, 4)} •••• ••` : v.unified;
    const nationalId = v.nationalId.includes("•") ? v.nationalId : `${v.nationalId[0] ?? "1"} •••• •••• ••••`;
    const accounts = v.accounts.map((a) =>
      a.iban.includes("•")
        ? a
        : {
            ...a,
            iban: `SA•• ${a.iban.replace(/\s/g, "").slice(4, 8)} •••• •••• •••• ${a.iban.replace(/\s/g, "").slice(-4)}`,
          },
    );
    const x = (EXTRA[id] ??= {});
    x.form = {
      ...(x.form ?? {}),
      brandEn: v.brandEn,
      email: v.email,
      logo: v.logo,
      unified,
      nationalId,
      accounts,
      docs: v.docs,
    };
    return delay({ ok: true });
  },
};
