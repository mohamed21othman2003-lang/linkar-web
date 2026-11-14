// التنسيق (القسم 2.6)

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** أرقام إنجليزية بفاصل الآلاف: 1,899 */
export const num = (n: number, digits = 0) => n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** «2,100 ر.س» — العملة بعد الرقم */
export const sar = (n: number) => `${num(n)} ر.س`;

/** «14 أكتوبر 2026» */
export function arDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** «11:40 ص» */
export function arTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "ص" : "م"}`;
}

/** الجوال بمسافات: «050 914 2276» */
export const phone = (p: string) => p.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");

/** الآيبان: مجموعات من 4 — مخفي في الجداول إلا آخر 4: «•••• 2290» */
export const iban = (v: string, masked = false) => (masked ? `•••• ${v.slice(-4)}` : v.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim());

/** الهوية مخفية: «1 •••• •••• 4418» */
export const nationalId = (v: string) => `${v[0]} •••• •••• ${v.slice(-4)}`;

/** الأسعار الثلاثة في خلية واحدة: «1,520 · 1,760 · 1,990» (سيدان · متوسط · كبير) */
export const sizePrices = (p: [number, number, number]) => p.map((x) => num(x)).join(" · ");

/** الهامش وقبل الضريبة (القسم 2.4) — للعرض الفوري، والخادم هو المرجع */
export const margin = (sale: number, cost: number) => ({ value: sale - cost, percent: sale ? Math.round(((sale - cost) / sale) * 1000) / 10 : 0 });
export const beforeVat = (price: number) => Math.round((price / 1.15) * 100) / 100;

/** «قبل 3 ساعات» من «3h» */
export function relative(s: string) {
  const m = /^(\d+)([mhd])$/.exec(s);
  if (!m) return s;
  const n = +m[1];
  const unit = m[2] === "m" ? (n === 1 ? "دقيقة" : n === 2 ? "دقيقتين" : n <= 10 ? "دقائق" : "دقيقة") : m[2] === "h" ? (n === 1 ? "ساعة" : n === 2 ? "ساعتين" : n <= 10 ? "ساعات" : "ساعة") : n === 1 ? "يوم" : n === 2 ? "يومين" : n <= 10 ? "أيام" : "يوماً";
  return n <= 2 ? `قبل ${unit}` : `قبل ${n} ${unit}`;
}

// القسم 19.1 · 8: الإنجليزي والأرقام جوه العربي من غير انقلاب — عزل (LRI…PDI) حوالين التسلسل اللاتيني/الرقمي
// ltr("•••• 4471") للقيمة كلها · ltrRuns("تركي العتيبي · 050 112 4455") يعزل كل تسلسل فيه مسافة أو شرطة جوه نص حر
export const ltr = (s: string) => `\u2066${s}\u2069`;
export const ltrRuns = (s: string) => s.replace(/[A-Za-z0-9•²]+(?:[ \-/.:+]+[A-Za-z0-9•²]+)+/g, (m) => (/[ \-/]/.test(m) ? ltr(m) : m));
