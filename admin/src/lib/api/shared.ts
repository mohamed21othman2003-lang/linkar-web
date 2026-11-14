// النوافذ المشتركة (القسم 15 · CON5-M00): معاينة مستند · اتصال · إسناد لمسؤول · ملاحظة داخلية.
// (التصدير CON5-M00 في exports.ts.) كل الإجراءات بتتسجّل في سجل الطلب/الحجز على الخادم.
import { ApiError, delay } from "./errors";

export interface PreviewDoc {
  id: string;
  /** «السجل التجاري» */
  kind: string;
  file: string;
  page: number;
  pages: number;
  authority: string;
  title: string;
  fields: [string, string][];
}

/** مستندات المعاينة (CON5-M00 · معاينة مستند 3114:65298 — يفتح من DR-0034 / DR-0033 / AR-0058 / AR-0057) */
const DOCS: Record<string, PreviewDoc> = {
  "CR-4030588102": {
    id: "CR-4030588102",
    kind: "السجل التجاري",
    file: "CR-4030588102.pdf",
    page: 1,
    pages: 2,
    authority: "وزارة التجارة · المملكة العربية السعودية",
    title: "شهادة السجل التجاري",
    fields: [
      ["رقم السجل", "4030588102"],
      ["اسم المنشأة", "مؤسسة المرجان لخدمات السيارات"],
      ["المدينة", "جدة"],
      ["تاريخ الانتهاء", "2 فبراير 2028"],
      ["النشاط", "غسيل وتلميع السيارات"],
    ],
  },
};

/** قائمة «القسم» و«المسؤول» و«مهلة الرد» في «إسناد لمسؤول» (CON5-M00 3114:65356) */
export const ASSIGN_DEPARTMENTS = [
  { value: "pricing", label: "التسعير" },
  { value: "quality", label: "الجودة والزيارات" },
  { value: "finance", label: "المالية" },
  { value: "bookings", label: "العمليات" },
  { value: "support", label: "خدمة العملاء" },
];
export const ASSIGNEES: Record<string, { value: string; label: string }[]> = {
  pricing: [{ value: "u-8", label: "سلطان العنزي · التسعير والكتالوج" }],
  quality: [
    { value: "u-2", label: "لينا الحربي · الجودة والزيارات" },
    { value: "u-6", label: "ماجد الفيفي · الجودة والزيارات" },
  ],
  finance: [{ value: "u-4", label: "عبدالرحمن ح. · المالية" }],
  bookings: [{ value: "u-3", label: "هند المطيري · لينكار" }],
  support: [{ value: "u-5", label: "ريم الشهري · خدمة العملاء" }],
};
export const ASSIGN_DEADLINES = ["24 ساعة", "48 ساعة", "72 ساعة"].map((v) => ({ value: v, label: v }));

const log: { ref: string; kind: "call" | "assign" | "note" | "whatsapp"; text: string; at: string }[] = [];

export const sharedApi = {
  doc: async (id: string) => {
    const d = DOCS[id];
    if (!d) throw new ApiError(404, "المستند غير موجود");
    return delay(d, 150);
  },
  /** نسخة للتنزيل (الخادم يرجّع رابط مؤقت) */
  downloadDoc: async (id: string) => delay({ url: `/files/${id}` }, 300),
  logCall: async (ref: string, phone: string) => {
    log.push({ ref, kind: "call", text: phone, at: new Date().toISOString() });
    return delay({ ok: true }, 300);
  },
  sendWhatsapp: async (ref: string, phone: string) => {
    log.push({ ref, kind: "whatsapp", text: phone, at: new Date().toISOString() });
    return delay({ ok: true }, 300);
  },
  assign: async (ref: string, v: { department: string; assignee: string; deadline: string }) => {
    if (!v.assignee) throw new ApiError(422, "تحقق من الحقول", { assignee: "اختر المسؤول" });
    log.push({ ref, kind: "assign", text: `${v.department} · ${v.assignee} · ${v.deadline}`, at: new Date().toISOString() });
    return delay({ ok: true }, 400);
  },
  saveNote: async (ref: string, note: string) => {
    if (!note.trim()) throw new ApiError(422, "تحقق من الحقول", { note: "اكتب الملاحظة" });
    log.push({ ref, kind: "note", text: note.trim(), at: new Date().toISOString() });
    return delay({ ok: true }, 400);
  },
  log: async (ref: string) => delay(log.filter((l) => l.ref === ref), 100),
};
