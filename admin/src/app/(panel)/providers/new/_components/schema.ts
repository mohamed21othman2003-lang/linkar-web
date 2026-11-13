import { z } from "zod";

// معالج «إضافة مقدّم خدمة» (القسم 8 · CON5-07N1 / 07N2 / 07N3) — نموذج واحد للخطوات الثلاث، وكل خطوة تتحقق من حقولها.
const digits = (v: string) => v.replace(/\D/g, "");
const req = (m: string) => z.string().trim().min(1, m);
const phone = z.string().refine((v) => /^05\d{8}$/.test(digits(v)), "جوال سعودي يبدأ بـ05 (10 أرقام)");

export const serviceSchema = z.object({ type: req("اختر نوع الخدمة"), from: req("أدخل المدة"), to: req("أدخل المدة") });

export const branchSchema = z
  .object({
    identity: z.enum(["brand-district", "custom"]),
    customName: z.string(),
    code: z.string().regex(/^LK-[A-Z]{2}-[A-Z]{2}-\d{3}$/, "الكود بالشكل LK-XX-XX-001"),
    codeEdited: z.boolean(),
    registry: z.string(),
    main: z.boolean(),
    city: req("اختر المدينة"),
    district: req("اختر الحي"),
    address: req("أدخل العنوان"),
    manager: req("أدخل اسم مدير الفرع"),
    managerPhone: phone,
    phone,
    email: z.email("بريد غير صحيح"),
    contact: z.string(),
    hours: req("اختر ساعات العمل"),
    slots: z.string().regex(/^[1-9]\d?$/, "عدد صحيح"),
    technicians: z.string().regex(/^[1-9]\d?$/, "عدد صحيح"),
    visitDate: req("اختر موعد الزيارة"),
    services: z.array(serviceSchema).min(1, "أضف خدمة واحدة على الأقل"),
    docs: z.object({ license: z.string(), civil: z.string(), photos: z.number() }),
  })
  .refine((b) => b.identity !== "custom" || b.customName.trim().length > 0, { path: ["customName"], message: "أدخل اسم الفرع" });

export const accountSchema = z.object({
  bank: req("اختر البنك"),
  accountName: req("أدخل اسم صاحب الحساب"),
  iban: z.string().refine((v) => /^SA\d{22}$/.test(v.replace(/\s/g, "").toUpperCase()), "الآيبان يبدأ بـSA ثم 22 رقماً"),
});

export const wizardSchema = z.object({
  type: z.enum(["care", "wash"]),
  brand: req("أدخل العلامة التجارية"),
  brandEn: z.string().trim().regex(/^[A-Za-z0-9 &'.-]+$/, "بالحروف الإنجليزية"),
  city: req("اختر المدينة"),
  legalName: req("أدخل الاسم القانوني"),
  cr: z.string().refine((v) => /^\d{10}$/.test(digits(v)), "السجل التجاري 10 أرقام"),
  vat: z.string().refine((v) => /^3\d{13}3$/.test(digits(v)), "15 رقماً يبدأ وينتهي بـ3"),
  unified: z.string().refine((v) => /^7\d{9}$/.test(digits(v)), "10 أرقام يبدأ بـ7"),
  code: z.string().regex(/^LK-[A-Z]{2}-\d{3}$/, "الكود بالشكل LK-XX-001"),
  codeEdited: z.boolean(),
  logo: z.string(),
  ownerName: req("أدخل اسم المالك"),
  ownerPhone: phone,
  email: z.email("بريد غير صحيح"),
  nationalId: z.string().refine((v) => /^[12]\d{9}$/.test(digits(v)), "رقم الهوية 10 أرقام يبدأ بـ1 أو 2"),
  accounts: z.array(accountSchema).min(1),
  docs: z.object({ cr: z.string(), vat: z.string(), agreement: z.string() }),
  branches: z.array(branchSchema).min(1),
});

export type WizardValues = z.infer<typeof wizardSchema>;
export type BranchValues = z.infer<typeof branchSchema>;

export const STEP1_FIELDS = ["type", "brand", "brandEn", "city", "legalName", "cr", "vat", "unified", "code", "ownerName", "ownerPhone", "email", "nationalId", "accounts"] as const;

export const emptyBranch = (main: boolean, city: string, phone = "", contact = ""): BranchValues => ({
  identity: "brand-district",
  customName: "",
  code: "",
  codeEdited: false,
  registry: "same",
  main,
  city,
  district: "",
  address: "",
  manager: "",
  managerPhone: "",
  phone,
  email: "",
  contact,
  hours: "",
  slots: "",
  technicians: "",
  visitDate: "",
  services: [],
  docs: { license: "", civil: "", photos: 0 },
});

export const emptyWizard = (): WizardValues => ({
  type: "care",
  brand: "",
  brandEn: "",
  city: "الرياض",
  legalName: "",
  cr: "",
  vat: "",
  unified: "",
  code: "",
  codeEdited: false,
  logo: "",
  ownerName: "",
  ownerPhone: "",
  email: "",
  nationalId: "",
  accounts: [{ bank: "مصرف الإنماء", accountName: "", iban: "" }],
  docs: { cr: "", vat: "", agreement: "" },
  branches: [emptyBranch(true, "الرياض")],
});

/** حروف الحي في كود الفرع (LK-WA-NR-001) */
const DISTRICT_CODE: Record<string, string> = {
  النرجس: "NR", العارض: "AR", الملقا: "MQ", العليا: "OL", الياسمين: "YS", الروضة: "RD", السلامة: "SL", الصحافة: "SH", حطين: "HT", السامر: "SM",
  الزهراء: "ZH", الحمراء: "HM", المحمدية: "MH", النسيم: "NS", الصفا: "SF", الشاطئ: "SA", التحلية: "TH", الفيصلية: "FS", النور: "NO", الريان: "RY",
  العزيزية: "AZ", الشوقية: "SQ", العقربية: "AQ", الثقبة: "TQ", الراكة: "RK",
};

/** يقترح كود مقدّم الخدمة من العلامة بالإنجليزية: «Al Waha Car Care» → LK-WA-001 */
export function suggestCode(brandEn: string, taken: string[]) {
  const words = brandEn.toUpperCase().replace(/[^A-Z ]/g, "").split(/\s+/).filter((w) => w && !["AL", "THE", "EL"].includes(w));
  if (!words.length || words[0].length < 2) return "";
  const letters = words[0].slice(0, 2);
  for (let i = 1; i < 1000; i++) {
    const c = `LK-${letters}-${String(i).padStart(3, "0")}`;
    if (!taken.includes(c)) return c;
  }
  return "";
}

export const branchCode = (providerCode: string, district: string, index: number) =>
  /^LK-[A-Z]{2}-\d{3}$/.test(providerCode) && DISTRICT_CODE[district] ? `${providerCode.slice(0, 5)}-${DISTRICT_CODE[district]}-${String(index + 1).padStart(3, "0")}` : "";

/** «مركز الواحة للعناية» → «مركز الواحة» (الاسم الظاهر للعميل مع الحي) */
export const shortBrand = (brand: string) => brand.trim().replace(/\s+(للعناية|لخدمات السيارات|للتلميع|للحماية)$/, "");

export const branchTitle = (b: Pick<BranchValues, "identity" | "customName" | "district">) => (b.identity === "custom" && b.customName.trim() ? b.customName.trim() : b.district ? `فرع ${b.district}` : "فرع جديد");

/** النواقص للبطاقة المطوية: «ينقصه: شهادة الدفاع المدني وصور الفرع» */
export function branchMissing(b: BranchValues) {
  const m: string[] = [];
  if (!b.district || !b.address) m.push("الموقع");
  if (!b.manager || !b.managerPhone) m.push("بيانات المدير");
  if (!b.hours || !b.slots || !b.technicians) m.push("التشغيل");
  if (!b.visitDate) m.push("موعد الزيارة");
  if (!b.services.length) m.push("الخدمات");
  if (!b.docs.license) m.push("رخصة البلدية");
  if (!b.docs.civil) m.push("شهادة الدفاع المدني");
  if (!b.docs.photos) m.push("صور الفرع");
  return m;
}
export const joinAr = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join("، ")} و${xs[xs.length - 1]}`);
