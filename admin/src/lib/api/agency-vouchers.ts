// قسائم الوكالات CON5-09V (Figma 3114:2149): درج القسيمة ?voucher=BK-… أو LK-… ونوافذه (تغيير العميل · إلغاء القسيمة · تمديد الصلاحية)
// القسائم نفسها جاية من طلبات الشراء (agencies.ts) + قسائم أغسطس اللي «تنتهي خلال 30 يوماً» (PO-2026-00955 / 00994).
import { allOrders, findPoVoucher, patchPoVoucher } from "./agencies";
import { ApiError, delay } from "./errors";

export type VoucherState = "pending" | "expiring" | "used" | "cancelled";
export interface Voucher {
  key: string;
  code: string;
  booking?: string;
  po: string;
  agencyId: string;
  title: string;
  center: string;
  state: VoucherState;
  customer: string;
  phone: string;
  car: string;
  poLine: string;
  rep: string;
  price: string;
  priceValue: number;
  issued: string;
  message: string;
  validUntil: string;
  /** ISO لتمديد الصلاحية */
  validIso: string;
  usage?: { date: string; branch: string; address: string };
  /** «عرض الحجز» في الدرج (BK-21408) */
  bookingLink?: boolean;
}

const ADDR: Record<string, string> = {
  "‏XPEL · فرع حطين": "طريق الأمير محمد بن سلمان، حي حطين، الرياض",
  "جونسون · فرع الحمراء": "طريق الكورنيش، حي الحمراء، جدة",
  "جونسون · فرع المحمدية": "طريق الملك، حي المحمدية، جدة",
  "جونسون · فرع الزهراء": "شارع الأمير سلطان، حي الزهراء، جدة",
};
/** تاريخ الاستخدام والفرع (من الإطارات) */
const USED_ON: Record<string, [string, string?]> = {
  "BK-21304": ["8 أكتوبر 2026", "جونسون · فرع الحمراء"],
  "BK-21381": ["7 أكتوبر 2026"],
  "BK-21380": ["5 أكتوبر 2026"],
  "BK-21408": ["4 أكتوبر 2026"],
  "BK-21372": ["4 أكتوبر 2026"],
  "BK-21373": ["3 أكتوبر 2026"],
  "BK-21363": ["1 أكتوبر 2026"],
  "BK-21303": ["1 أكتوبر 2026", "جونسون · فرع الزهراء"],
};
const CARS: Record<string, string> = { "BK-21478": "Camry 2026", "BK-21480": "Tahoe 2025" };
/** سعر القسيمة الواحدة بسعر الوكالة */
const UNIT: Record<string, number> = { "PO-2026-01217": 1900, "PO-2026-01392": 2600, "PO-2026-01259": 2600, "PO-2026-01403": 1150, "PO-2026-01271": 1150, "PO-2026-01397": 1000, "PO-2026-01247": 2600 };

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const ar = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const NOW = Date.UTC(2026, 9, 14);
const daysLeft = (iso: string) => Math.round((Date.parse(iso) - NOW) / 86400000);
const toIso = (s?: string) => {
  const m = s?.match(/(\d+) (\S+) (\d{4})/);
  if (!m) return "2027-01-12";
  return `${m[3]}-${String(MONTHS.indexOf(m[2]) + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
};

// قسائم الطلبين PO-2026-00955 و00994 (أغسطس) — «تنتهي خلال 30 يوماً»
const EXPIRING: Voucher[] = (
  [
    ["LK-WWU8-G7CY", "عبدالله الشمري", "050 ••• 9900", "00955"],
    ["LK-S2R3-UVW7", "فواز العتيبي", "055 ••• 8819", "00955"],
    ["LK-NN42-HMYE", "محمد القحطاني", "056 ••• 7738", "00955"],
    ["LK-W95N-ASWD", "سعود الدوسري", "054 ••• 6657", "00955"],
    ["LK-7PQ8-RJGX", "عمر باشراحيل", "053 ••• 5576", "00994"],
    ["LK-YHNU-6PEV", "حسام الحربي", "059 ••• 4495", "00994"],
    ["LK-KR7X-FPN2", "ياسر المطيري", "058 ••• 3414", "00994"],
    ["LK-Y4DP-UAEV", "أنور القرشي", "050 ••• 2333", "00994"],
  ] as const
).map(([code, customer, phone, po]) => {
  const a = po === "00955";
  return {
    key: code,
    code,
    po: `PO-2026-${po}`,
    agencyId: "DL-014",
    title: "‏Johnson Ceramic Pro · سيدان",
    center: a ? "‏XPEL · فرع حطين" : "جونسون · فرع الزهراء",
    state: "expiring" as const,
    customer,
    phone,
    car: "—",
    poLine: a ? "‏PO-2026-00955 · 2 أغسطس 2026" : "‏PO-2026-00994 · 13 أغسطس 2026",
    rep: a ? "الرياض · العليا · عبدالرحمن السالم" : "جدة · التحلية · فيصل الشهري",
    price: a ? "‏2,600 ر.س" : "‏1,650 ر.س",
    priceValue: a ? 2600 : 1650,
    issued: a ? "2 أغسطس 2026" : "13 أغسطس 2026",
    message: a ? "أُرسلت من LINKAR · 2 أغسطس 2026" : "أُرسلت من LINKAR · 13 أغسطس 2026",
    validUntil: a ? "31 أكتوبر 2026 · بعد 17 يوماً" : "11 نوفمبر 2026 · بعد 28 يوماً",
    validIso: a ? "2026-10-31" : "2026-11-11",
  };
});

function buildVoucher(key: string): Voucher | null {
  const exp = EXPIRING.find((x) => x.key === key);
  if (exp) return exp;
  const hit = findPoVoucher(key);
  if (!hit) return null;
  const { po, v } = hit;
  const used = USED_ON[v.booking];
  const size = v.booking === "BK-21304" ? "SUV متوسط" : "سيدان";
  const center = used?.[1] ?? po.hero.sub.replace("فرعا الزهراء والحمراء", "فرع الزهراء");
  const unit = UNIT[po.id] ?? Math.round(po.value / po.vouchers);
  return {
    key: v.booking,
    code: v.code,
    booking: v.booking,
    po: po.id,
    agencyId: po.agencyId,
    title: `${po.service.startsWith("‏") ? "" : "‏"}${po.service} · ${size}`,
    center,
    state: v.used ? "used" : "pending",
    customer: v.customer,
    phone: v.phone,
    car: CARS[v.booking] ?? "—",
    poLine: `‏${po.id} · ${po.dateLabel}`,
    rep: po.branchRep ?? "",
    price: `‏${unit.toLocaleString("en-US")} ر.س`,
    priceValue: unit,
    issued: po.dateLabel,
    message: po.sent ? "أُرسلت من LINKAR · اليوم 14 أكتوبر 2026" : po.id === "PO-2026-01488" ? "لم تُرسل بعد" : `أُرسلت من LINKAR · ${po.dateLabel}`,
    validUntil: po.status.sub?.replace("صالحة حتى ", "") ?? "12 يناير 2027",
    validIso: toIso(po.status.sub),
    usage: used ? { date: used[0], branch: center, address: ADDR[center] ?? "" } : undefined,
    bookingLink: v.booking === "BK-21408",
  };
}

/** تغييرات الإجراءات على كل قسيمة (الخادم الحقيقي بيرجّعها في القسيمة نفسها) */
const patches: Record<string, Partial<Voucher>> = {};
const SENT = "أُرسلت من LINKAR · اليوم 14 أكتوبر 2026";

export const EXTEND_OPTIONS = [30, 60, 90];
/** «حتى 30 نوفمبر 2026» تحت خيار التمديد */
export const extendLabel = (validIso: string, days: number) => `حتى ${ar(new Date(Date.parse(validIso) + days * 86400000).toISOString())}`;

export const vouchersApi = {
  get: async (key: string) => {
    const b = buildVoucher(key);
    if (!b) throw new ApiError(404);
    return delay({ ...b, ...patches[b.key] } as Voucher, 200);
  },
  /** قسائم الوكالة (تبويب «القسائم والعملاء» في ملف الوكالة CON5-09P 3114:4762 / 5129 / 5462) */
  ofAgency: async (agencyId: string, seg: "all" | "expiring" | "used") => {
    const fromPos = allOrders()
      .filter((o) => o.agencyId === agencyId && o.list)
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((o) => o.list!.map((x) => buildVoucher(x.booking)!))
      .map((v) => ({ ...v, ...patches[v.key] }) as Voucher);
    const exp = agencyId === "DL-014" ? EXPIRING.map((v) => ({ ...v, ...patches[v.key] }) as Voucher) : [];
    const used = fromPos.filter((v) => v.state === "used" && USED_ON[v.key]).sort((a, b) => Date.parse(toIso(b.usage!.date)) - Date.parse(toIso(a.usage!.date)));
    const items = seg === "expiring" ? exp.filter((v) => v.state === "expiring") : seg === "used" ? used : [...fromPos, ...exp];
    // الأعداد الكاملة من الخادم (Figma: 159 · 9 · 77) — القائمة التجريبية جزء منها
    return delay({ items, counts: agencyId === "DL-014" ? { all: 159, expiring: 9, used: 77 } : { all: items.length, expiring: exp.length, used: used.length } });
  },
  /** «إرسال القسيمة» → T0920 */
  send: async (key: string) => {
    patches[key] = { ...patches[key], message: SENT };
    return delay({ toast: "أُرسلت القسيمة إلى العميل برسالة من LINKAR" });
  },
  /** CON5-09M · تغيير العميل → T0921 */
  changeCustomer: async (key: string, d: { name: string; phone: string; reason: string }) => {
    const f: Record<string, string> = {};
    if (!d.name.trim()) f.name = "اكتب اسم العميل";
    if (!/^05\d{8}$/.test(d.phone.replace(/\s/g, ""))) f.phone = "رقم جوال سعودي يبدأ بـ05";
    if (!d.reason.trim()) f.reason = "اكتب السبب";
    if (Object.keys(f).length) throw new ApiError(422, "", f);
    const p = d.phone.replace(/\s/g, "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
    patches[key] = { ...patches[key], customer: d.name.trim(), phone: p, message: SENT };
    patchPoVoucher(key, { customer: d.name.trim(), phone: p });
    return delay({ toast: "تغيّر العميل وأُرسلت القسيمة إلى العميل الجديد" });
  },
  /** CON5-09M · إلغاء القسيمة → T0922 */
  cancel: async (key: string, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "", { reason: "اكتب السبب" });
    patches[key] = { ...patches[key], state: "cancelled" };
    return delay({ toast: "أُلغيت القسيمة وصدر إشعار دائن بقيمتها في كشف الوكالة" });
  },
  /** «تذكير العميل» → T0923 */
  remind: async (key: string) => {
    if (!buildVoucher(key)) throw new ApiError(404);
    return delay({ toast: "أُرسل تذكير للعميل بموعد انتهاء القسيمة" });
  },
  /** CON5-09M · تمديد الصلاحية → T0924 */
  extend: async (key: string, days: number, reason: string) => {
    if (!reason.trim()) throw new ApiError(422, "", { reason: "اكتب السبب" });
    const b = buildVoucher(key);
    if (!b) throw new ApiError(404);
    const base = patches[key]?.validIso ?? b.validIso;
    const iso = new Date(Date.parse(base) + days * 86400000).toISOString().slice(0, 10);
    patches[key] = { ...patches[key], validIso: iso, validUntil: `${ar(iso)} · بعد ${daysLeft(iso)} يوماً`, state: daysLeft(iso) > 30 ? "pending" : "expiring" };
    return delay({ toast: "مُدّدت صلاحية القسيمة وأُبلغ العميل والوكالة" });
  },
};
