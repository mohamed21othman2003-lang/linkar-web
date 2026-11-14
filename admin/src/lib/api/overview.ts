// الرئيسية «نظرة عامة» (Figma CON5-01 3114:65057) — رد واحد زي GET /dashboard/overview.
// الأرقام والنصوص حرفياً من الإطار (اليوم التجريبي = MOCK_NOW 14 أكتوبر 2026).
import { delay } from "./errors";

/** صف في جدول «حجوزات جديدة بانتظار التواصل» (لكل مزوّد) */
export interface NewBookingsRow {
  provider: string;
  /** رابط المزوّد في اللوحة (null لصف «مزوّدون آخرون») */
  providerId: string | null;
  branches: number;
  /** أسماء الفروع تحت العدد («العليا · الملقا · +3 أخرى») */
  branchNames?: string;
  fresh: number;
  providerContacted: number;
  linkarContacted: number;
  /** أقرب موعد (ISO) — null = «—» */
  nearest: string | null;
}

export type DecisionTone = "warning" | "danger" | "info" | "neutral";
export interface DecisionItem {
  id: string;
  title: string;
  sub: string;
  tone: DecisionTone;
  /** الوجهة من نموذج Figma (الطلبات · الحجوزات · المطالبات · التقييم الميداني …) */
  href: string;
}

export interface OverviewData {
  greetingName: string;
  newBookings: {
    total: number;
    branches: number;
    providers: number;
    contacted: number;
    rows: NewBookingsRow[];
  };
  kpis: { salesToday: number; marginToday: number; duesToday: number; awaitingDecision: number; vouchersExpiring: number };
  network: { active: string; branches: string; services: string };
  salesByType: { type: string; sales: number; marginPct: number }[];
  decisions: DecisionItem[];
}

const DATA: OverviewData = {
  greetingName: "نوف",
  newBookings: {
    total: 186,
    branches: 41,
    providers: 17,
    contacted: 185,
    rows: [
      { provider: "XPEL السعودية", providerId: "lk-xp-001", branches: 5, branchNames: "العليا · الملقا · +3 أخرى", fresh: 24, providerContacted: 23, linkarContacted: 24, nearest: "2026-10-17" },
      { provider: "لومار", providerId: "lk-lm-001", branches: 4, branchNames: "الروضة · الياسمين · +2 أخرى", fresh: 19, providerContacted: 19, linkarContacted: 19, nearest: "2026-10-16" },
      { provider: "جونسون", providerId: "lk-jn-001", branches: 3, branchNames: "الحمراء · المحمدية · الزهراء", fresh: 14, providerContacted: 13, linkarContacted: 13, nearest: "2026-10-16" },
      { provider: "مزوّدون آخرون (14)", providerId: null, branches: 29, fresh: 129, providerContacted: 129, linkarContacted: 129, nearest: null },
    ],
  },
  kpis: { salesToday: 241380, marginToday: 46828, duesToday: 194552, awaitingDecision: 30, vouchersExpiring: 38 },
  network: { active: "21 · 18 مركز عناية · 3 مغاسل", branches: "55 · بلاتيني 9 · ذهبي 31 · فضي 15", services: "214" },
  salesByType: [
    { type: "نانو سيراميك", sales: 452605, marginPct: 20 },
    { type: "حماية PPF", sales: 359013, marginPct: 16 },
    { type: "التظليل", sales: 270172, marginPct: 19 },
    { type: "التلميع", sales: 78212, marginPct: 17 },
    { type: "الغسيل", sales: 66448, marginPct: 20 },
  ],
  // «تحتاج قرارك · مرتبة حسب المهلة» — الوجهات من روابط النموذج في Figma
  decisions: [
    { id: "new-requests", title: "22 طلباً جديداً", sub: "REQ-0429 جوال مالك جونسون · REQ-0430 إيقاف الزهراء · REQ-0414 XPEL · REQ-0435 محفظة جونسون", tone: "warning", href: "/requests" },
    { id: "BK-21475", title: "تعذّر قبول الخدمة · BK-21475", sub: "جونسون الزهراء · القسيمة تنتهي 28 أكتوبر 2026", tone: "danger", href: "/bookings?booking=BK-21475" },
    { id: "done-awaiting", title: "6 حجوزات منفّذة بانتظار الاعتماد", sub: "جونسون اليوم · الحمراء 3 · الزهراء 2 · المحمدية 1", tone: "warning", href: "/providers/lk-jn-001?tab=bookings" },
    { id: "claims", title: "مطالبتان ماليتان قيد النظر", sub: "CL-2026-0010 جونسون · CL-2026-0013 لومار", tone: "warning", href: "/dues?tab=claims" },
    { id: "REQ-2026-0427", title: "طلب تغيير الحساب البنكي · جونسون", sub: "REQ-2026-0427 · من الراجحي إلى الأهلي", tone: "warning", href: "/requests?request=REQ-2026-0427" },
    { id: "field-visits", title: "3 زيارات ميدانية قادمة", sub: "أبحر 14 · التظليل 20 · الندى 22 أكتوبر 2026", tone: "info", href: "/field-evaluation" },
    { id: "RF-2026-0190", title: "استرداد قيد التنفيذ · RF-2026-0190", sub: "8,999 ر.س · XPEL العليا", tone: "info", href: "/payments?refund=RF-2026-0190" },
    { id: "trials", title: "4 تجارب «ظهورك على لينكار» تنتهي", sub: "أقربها جونسون 31 أكتوبر 2026", tone: "neutral", href: "/system/paid-features" },
  ],
};

export const overviewApi = {
  get: async (): Promise<OverviewData> => delay(structuredClone(DATA)),
};
