// ملف الوكالة CON5-09P (Figma 3114:4312 … 6157) — صفحة /partners/agencies/<DL> بتبويباتها:
// نظرة عامة · طلبات الشراء · القسائم والعملاء · الفروع والفريق · الكشوف والمدفوعات · طلبات التعديل
// + نافذة الإجراءات CON5-09A ونوافذ تعديل البيانات / تغيير المفوّض (T0931 / T0930). الأرقام حرفياً من الإطارات (الريادة DL-014).
import { agenciesApi } from "./agencies";
import { ApiError, delay } from "./errors";

export interface Branch {
  name: string;
  address: string;
  phone: string;
  manager: string;
  team: string;
  orders: string;
}
export interface Member {
  name: string;
  phone: string;
  role: string;
  branch: string;
  orders: string;
  pending?: boolean;
}
export interface ProfileStatement {
  id?: string;
  title: string;
  sub: string;
  period: string;
  periodSub?: string;
  orders: string;
  vouchers: string;
  amount: string;
  due: string;
  dueSub: string;
  state: "open" | "due" | "paid";
  paidLabel?: string;
}
export interface AgencyProfile {
  id: string;
  name: string;
  line: string;
  pills: { label: string; tone: "warning" | "success" | "neutral" }[];
  kpis: { label: string; icon: "receipt" | "qr" | "package" | "wallet"; value: string; hint: string; warn?: boolean }[];
  finance: { k: string; v: string }[];
  data: { k: string; v: string }[];
  activity: { text: string; date: string; open: Record<string, string> }[];
  counts: { orders: number; vouchers: number; branches: number; statements: number; requests: number };
  branches: Branch[];
  team: Member[];
  teamSub: string;
  stmtKpis: { label: string; icon: "card" | "chart" | "wallet" | "file"; value: string; hint: string }[];
  statements: ProfileStatement[];
  payments: { date: string; invoice: string; method: string; amount: string }[];
  address: string;
  cities: string;
  cr: string;
  vat: string;
}

let ryada: AgencyProfile = {
  id: "DL-014",
  name: "الريادة للسيارات",
  line: "معرض سيارات · جدة والرياض · معتمدة منذ 30 يوليو 2026 · 4 فروع · 7 أعضاء",
  pills: [
    { label: "نشطة", tone: "success" },
    { label: "ائتمان شهري", tone: "neutral" },
    { label: "منتظم في السداد", tone: "success" },
    { label: "4 طلبات تعديل", tone: "warning" },
  ],
  kpis: [
    { label: "المتاح للشراء", icon: "wallet", value: "99,150", hint: "ر.س من حد 300,000 · مستخدم 67%" },
    { label: "طلبات أكتوبر", icon: "package", value: "41,650", hint: "ر.س · 5 طلبات · 24 قسيمة" },
    { label: "بانتظار الزيارة", icon: "qr", value: "82", hint: "قسيمة · 9 تنتهي خلال 30 يوماً", warn: true },
    { label: "المستحق", icon: "receipt", value: "159,200", hint: "ر.س · يستحق 31 أكتوبر 2026" },
  ],
  finance: [
    { k: "حد الائتمان", v: "‏300,000 ر.س" },
    { k: "المستخدم", v: "‏200,850 ر.س · 67%" },
    { k: "كشف سبتمبر", v: "‏159,200 · INV-2026-10-0214 · يستحق 31 أكتوبر 2026" },
    { k: "طلبات أكتوبر", v: "‏41,650 · تُفوتر 1 نوفمبر 2026" },
    { k: "آخر سداد", v: "‏117,100 · INV-2026-09-0151 · 28 سبتمبر 2026" },
    { k: "المتأخرات", v: "لا يوجد" },
  ],
  data: [],
  activity: [
    { text: "‏PO-2026-01488‏ · 10 قسائم Johnson Ceramic Pro‏ · 16,500 ر.س · سامي الغامدي", date: "اليوم", open: { po: "PO-2026-01488" } },
    { text: "‏DQ-2026-0013 · طلب تعديل العنوان · سامي الغامدي", date: "اليوم", open: { dq: "DQ-2026-0013" } },
    { text: "‏DQ-2026-0012 · طلب رفع حد الائتمان إلى 400,000 ر.س · سامي الغامدي", date: "اليوم", open: { dq: "DQ-2026-0012" } },
    { text: "استُخدمت القسيمة BK-21304 · بسام ت. · جونسون · فرع الحمراء", date: "8 أكتوبر 2026", open: { voucher: "BK-21304" } },
    { text: "استُخدمت القسيمة BK-21381 · عمر الفيفي · XPEL · فرع حطين", date: "7 أكتوبر 2026", open: { voucher: "BK-21381" } },
    { text: "‏PO-2026-01406 · قسيمة واحدة · 1,650 ر.س · فيصل الشهري", date: "7 أكتوبر 2026", open: { po: "PO-2026-01406" } },
  ],
  counts: { orders: 22, vouchers: 159, branches: 4, statements: 2, requests: 4 },
  branches: [
    { name: "جدة · التحلية", address: "شارع التحلية، حي الأندلس، جدة", phone: "012 661 4420", manager: "خالد البلوي", team: "‏2 أعضاء", orders: "3" },
    { name: "جدة · الشاطئ", address: "طريق الكورنيش، حي الشاطئ، جدة", phone: "012 693 1108", manager: "بدون مدير", team: "‏1 عضو", orders: "1" },
    { name: "الرياض · العليا", address: "طريق العليا العام، حي العليا، الرياض", phone: "011 462 7731", manager: "منيرة العتيبي", team: "‏2 أعضاء", orders: "1" },
    { name: "الرياض · الملقا", address: "طريق أنس بن مالك، حي الملقا، الرياض", phone: "011 518 2094", manager: "بدون مدير", team: "دعوة معلّقة", orders: "0" },
  ],
  team: [
    { name: "سامي الغامدي", phone: "055 210 4478", role: "مدير الحساب · المفوّض الرئيسي", branch: "كل الفروع", orders: "1" },
    { name: "خالد البلوي", phone: "050 318 6604", role: "مدير فرع", branch: "جدة · التحلية", orders: "0" },
    { name: "منيرة العتيبي", phone: "056 220 9135", role: "مدير فرع", branch: "الرياض · العليا", orders: "0" },
    { name: "فيصل الشهري", phone: "054 771 0682", role: "مندوب مبيعات", branch: "جدة · التحلية", orders: "2" },
    { name: "أحمد باعشن", phone: "059 103 4457", role: "مندوب مبيعات", branch: "جدة · الشاطئ", orders: "1" },
    { name: "عبدالرحمن السالم", phone: "053 618 2290", role: "مندوب مبيعات", branch: "الرياض · العليا", orders: "1" },
    { name: "لمى الحربي", phone: "056 781 2290", role: "مندوبة مبيعات", branch: "الرياض · الملقا", orders: "—", pending: true },
  ],
  teamSub: "‏6 أعضاء نشطون ودعوة معلّقة",
  stmtKpis: [
    { label: "حد الائتمان", icon: "card", value: "300,000", hint: "ر.س · ائتمان شهري" },
    { label: "المستخدم", icon: "chart", value: "200,850", hint: "ر.س · كشف سبتمبر + طلبات أكتوبر" },
    { label: "المتاح للشراء", icon: "wallet", value: "99,150", hint: "ر.س · يتجدد عند السداد" },
    { label: "الإشعارات الدائنة", icon: "file", value: "0", hint: "لا توجد إشعارات" },
  ],
  statements: [
    { title: "طلبات أكتوبر", sub: "لم يصدر بعد", period: "‏1–31 أكتوبر 2026", periodSub: "حتى اليوم", orders: "‏5 طلبات", vouchers: "‏24 قسيمة", amount: "41,650.00", due: "يصدر 1 نوفمبر 2026", dueSub: "يستحق 1 ديسمبر 2026", state: "open" },
    { id: "INV-2026-10-0214", title: "INV-2026-10-0214", sub: "صدر 1 أكتوبر 2026", period: "طلبات سبتمبر 2026", orders: "‏10 طلبات", vouchers: "‏80 قسيمة", amount: "159,200.00", due: "31 أكتوبر 2026", dueSub: "بعد 17 يوماً", state: "due" },
    { id: "INV-2026-09-0151", title: "INV-2026-09-0151", sub: "صدر 1 سبتمبر 2026", period: "طلبات أغسطس 2026", orders: "‏7 طلبات", vouchers: "‏55 قسيمة", amount: "117,100.00", due: "1 أكتوبر 2026", dueSub: "صافي 30 يوماً", state: "paid", paidLabel: "مدفوعة · 28 سبتمبر 2026" },
  ],
  payments: [{ date: "28 سبتمبر 2026", invoice: "INV-2026-09-0151", method: "تحويل بنكي", amount: "117,100.00" }],
  address: "شارع التحلية، حي الأندلس، جدة",
  cities: "جدة والرياض",
  cr: "4030318842",
  vat: "310482215600003",
};

const withData = (p: AgencyProfile, contact: string): AgencyProfile => ({
  ...p,
  data: [
    { k: "رقم الوكالة", v: p.id },
    { k: "الاسم التجاري", v: p.name },
    { k: "السجل التجاري", v: p.cr },
    { k: "الرقم الضريبي", v: p.vat },
    { k: "العنوان", v: p.address },
    { k: "المفوّض الرئيسي", v: contact },
    { k: "الاعتماد", v: "30 يوليو 2026" },
  ],
});

export const agencyProfileApi = {
  get: async (id: string) => {
    if (id !== ryada.id) throw new ApiError(404);
    const a = await agenciesApi.get(id);
    const contact = `${a.contact.name} · ${a.contact.phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")}`;
    return delay({ profile: withData(ryada, contact), agency: a }, 150);
  },
  /** CON5-09M · تعديل البيانات → T0931 */
  update: async (id: string, d: { name: string; cr: string; vat: string; address: string; cities: string }) => {
    const f: Record<string, string> = {};
    if (!d.name.trim()) f.name = "اكتب الاسم التجاري";
    if (!/^\d{10}$/.test(d.cr)) f.cr = "السجل التجاري 10 أرقام";
    if (!/^3\d{13}3$/.test(d.vat)) f.vat = "الرقم الضريبي 15 رقماً يبدأ وينتهي بـ3";
    if (!d.address.trim()) f.address = "اكتب العنوان";
    if (Object.keys(f).length) throw new ApiError(422, "", f);
    if (id === ryada.id) ryada = { ...ryada, name: d.name.trim(), cr: d.cr, vat: d.vat, address: d.address.trim(), cities: d.cities.trim() };
    return delay({ toast: "حُفظت بيانات الوكالة" });
  },
  /** CON5-09M · تغيير المفوّض → T0930 */
  changeContact: async (id: string, member: string, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "", { reason: "اكتب السبب" });
    const m = ryada.team.find((x) => x.name === member);
    if (!m) throw new ApiError(422, "", { member: "اختر المفوّض الجديد" });
    ryada = {
      ...ryada,
      team: ryada.team.map((x) => (x.name === member ? { ...x, role: `${x.role} · المفوّض الرئيسي` } : x.role.includes("المفوّض الرئيسي") ? { ...x, role: x.role.replace(" · المفوّض الرئيسي", "") } : x)),
    };
    await agenciesApi.setContact(id, m.name, m.phone.replace(/\s/g, ""));
    return delay({ toast: "تغيّر المفوّض الرئيسي وأُرسل له رابط الدخول" });
  },
};
