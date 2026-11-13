"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { keepFocusQuiet } from "@/components/ui/focus";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SERVICE_TYPES, TIERS, type Tier } from "@/lib/api/providers";
import { M_INPUT, M_SELECT, TextArea } from "../../_components/form-bits";

// ───────────── معايير الاعتماد (للعرض فقط · القائمة من «البيانات المرجعية» CON5-20) ─────────────
// CON5-07N · نانو سيراميك (3344-222210) · التلميع (3344-222502) · التظليل (3344-222755) · المعايير الأساسية لقبول الفرع (3344-223038)
type Criterion = [name: string, critical: boolean];
export const CRITERIA: Record<string, { title: string; items: Criterion[] }> = {
  "نانو سيراميك": {
    title: "معايير الاعتماد · نانو سيراميك",
    items: [
      ["تدريب الفني / المنتج", true], ["أصالة المنتج ومصدره المعتمد", true], ["تخزين المنتج وضبط الصلاحية", false], ["الفحص المسبق للمركبة / الطلاء", true],
      ["الغسيل وإزالة الملوثات", true], ["التحضير لتصحيح الطلاء", false], ["بيئة عمل محكومة", true], ["تجهيز السطح / اللوح", true], ["تقنية التطبيق", true],
      ["ضوابط المعالجة / التصلب", true], ["فحص البقع المرتفعة والتشطيب", true], ["تتبع المنتج / الدفعة", true], ["تسجيل الضمان", true], ["ضبط الجودة النهائي", true],
      ["تعليمات المعالجة والعناية للعميل", false],
    ],
  },
  التلميع: {
    title: "معايير الاعتماد · التلميع",
    items: [
      ["منتجات تلميع أصلية", true], ["فني مدرّب على التلميع", true], ["ماكينات تلميع بحالة جيدة", false], ["إضاءة فحص مناسبة", false], ["غسيل وإزالة ملوثات قبل التلميع", false],
      ["حماية الأجزاء البلاستيكية والمطاطية", false], ["نظافة الفوط والأقراص", false], ["فحص نهائي بالإضاءة", false], ["صور قبل التنفيذ وبعده", false], ["سجل تشغيل لكل سيارة", false],
    ],
  },
  التظليل: {
    title: "معايير الاعتماد · التظليل",
    items: [
      ["تدريب فنيي تظليل النوافذ", true], ["أصالة الفيلم ومصدره المعتمد", true], ["تخزين الفيلم والتعامل مع اللفائف", false], ["الفحص المسبق للمركبة والزجاج", false],
      ["تجهيز الزجاج ونظافته", true], ["طريقة القص وحماية الزجاج", true], ["تقنية تركيب الفيلم", true], ["التشكيل والانكماش الحراري", false],
      ["جودة الحواف وخلو التركيب من التلوث والفقاعات", true], ["حماية المقصورة والإلكترونيات", true], ["توضيح المواصفات والمتطلبات النظامية", false],
      ["تسجيل الضمان وإمكانية التتبع", true], ["فحص الجودة النهائي", true], ["تسليم العميل وتعليمات العناية", false],
    ],
  },
  base: {
    title: "المعايير الأساسية لقبول الفرع",
    items: [
      ["مؤهلات الفنيين وتدريبهم", true], ["اعتمادات العلامة / الموزع", true], ["أصالة المنتجات وإمكانية التتبع", true], ["تخزين المنتجات والتعامل معها", false],
      ["جودة التركيب والتنفيذ", true], ["الأدوات والمعدات", false], ["حالة المنشأة", false], ["النظافة والتنظيم", false], ["اللوحات وعرض العلامة", false],
      ["استقبال العملاء ومنطقة الانتظار", false], ["السلامة وممارسات التشغيل", true], ["إدارة الضمان وتسجيله", true], ["معالجة الشكاوى", false],
      ["موثوقية الحجوزات والتشغيل", false], ["تقييمات وتجربة العملاء", false], ["الالتزام بسياسات لينكار والبيانات", true],
    ],
  },
};
const criticalCount = (k: string) => CRITERIA[k]?.items.filter((i) => i[1]).length ?? 0;

// 760 · r24 · حشو 28·32 · مسافة 16 · عنوان 20 Bold · جدول (# · المعيار · حرج) · «إغلاق» تحت على الشمال
export function CriteriaModal({ kind, onClose }: { kind: string; onClose: () => void }) {
  const c = CRITERIA[kind];
  if (!c) return null;
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          dir="rtl"
          onOpenAutoFocus={keepFocusQuiet}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[760px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[24px] bg-white px-8 py-7 shadow-card focus:outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <Dialog.Title className="text-[20px] leading-[38px] font-bold text-ink">{c.title}</Dialog.Title>
            <Dialog.Close className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1" aria-label="إغلاق">
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{c.title}</Dialog.Description>
          <div className="min-h-0 overflow-y-auto">
            <table className="w-full border-separate border-spacing-0 text-13">
              <thead>
                <tr className="text-12 font-medium text-[#6b7a75]">
                  <th scope="col" className="h-[34px] w-12 rounded-s-8 bg-[#f3f5f4] ps-3 text-start font-medium">#</th>
                  <th scope="col" className="h-[34px] bg-[#f3f5f4] ps-3 text-start font-medium">المعيار</th>
                  <th scope="col" className="h-[34px] w-[88px] rounded-e-8 bg-[#f3f5f4] pe-3 text-end font-medium">حرج</th>
                </tr>
              </thead>
              <tbody>
                {c.items.map(([name, critical], i) => (
                  <tr key={name}>
                    <td className="num h-[33px] border-b border-surface-2 py-0 ps-3 leading-[25px] text-[#6b7a75]">{i + 1}</td>
                    <td className="h-[33px] border-b border-surface-2 py-0 ps-3 leading-[25px] text-ink">{name}</td>
                    <td className="h-[33px] border-b border-surface-2 py-0 pe-3 text-end">
                      {critical ? <span className="inline-flex h-[25px] items-center rounded-[6px] bg-[#fdecec] px-2 text-[11px] font-medium text-[#b42318]">حرج</span> : <span className="leading-[25px] text-[#6b7a75]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" className="h-[49px] rounded-10 px-5" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** «معايير الاعتماد ↗» — شريحة زرقاء تفتح نافذة المعايير */
export function CriteriaLink({ label, onClick, block }: { label: string; onClick: () => void; block?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-12 leading-[18px] font-medium text-info hover:underline ${block ? "w-full rounded-10 bg-info-tint px-3 py-2 text-start" : "h-[30px] shrink-0 rounded-full bg-info-tint px-2.5"}`}
    >
      {label} ↗
    </button>
  );
}

// ───────────── CON5-07M · إضافة خدمة لفرع (المعالج) — فرع النرجس (3114-53607) · فرع العارض (3114-53641) ─────────────
// 520 · حشو 22 · نوع الخدمة + رابط المعايير + مدة التنفيذ من/إلى · «إضافة الخدمة» كحلي شمال و«إلغاء» يمين
export function AddServiceModal({
  branch,
  brand,
  taken,
  onAdd,
  onClose,
  onCriteria,
}: {
  branch: string;
  brand: string;
  taken: string[];
  onAdd: (s: { type: string; from: string; to: string }) => void;
  onClose: () => void;
  onCriteria: (k: string) => void;
}) {
  const options = SERVICE_TYPES.filter((s) => !taken.includes(s)).map((s) => ({ value: s, label: s }));
  const [type, setType] = useState(options[0]?.value ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = () => {
    const e: Record<string, string> = {};
    if (!type) e.type = "اختر نوع الخدمة";
    if (!from.trim()) e.from = "أدخل المدة";
    if (!to.trim()) e.to = "أدخل المدة";
    setErr(e);
    if (!Object.keys(e).length) onAdd({ type, from: from.trim(), to: to.trim() });
  };
  const c = CRITERIA[type];
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} width={520} className="gap-3! p-[22px]!" title={`إضافة خدمة لـ${branch}`} subtitle={`${brand} · قبل الإرسال`}>
      <Field label="نوع الخدمة" error={err.type}>
        {(id) => <Select id={id} value={type} onChange={setType} options={options} className={M_SELECT} invalid={!!err.type} placeholder="كل الخدمات مضافة" />}
      </Field>
      {c ? <CriteriaLink block label={`معايير الاعتماد: ${type} · ${c.items.length} معياراً · ${criticalCount(type)} حرجة`} onClick={() => onCriteria(type)} /> : null}
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="مدة التنفيذ من" error={err.from}>
          {(id) => <TextInput id={id} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="3 ساعات" invalid={!!err.from} className={M_INPUT} />}
        </Field>
        <Field label="إلى" error={err.to}>
          {(id) => <TextInput id={id} value={to} onChange={(e) => setTo(e.target.value)} placeholder="5 ساعات" invalid={!!err.to} className={M_INPUT} />}
        </Field>
      </div>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]" onClick={onClose}>
          إلغاء
        </Button>
        <Button className="h-11" onClick={submit} disabled={!options.length}>
          إضافة الخدمة
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-07M · اعتماد ونشر بدون زيارة — مركز الواحة (3114-54483) ─────────────
// 640 · الفئة + التقييم الظاهر حتى أول 5 تقييمات · نجوم · مراجعة لينكار · تظهر المراجعة على (شرائح) · «اعتماد ونشر» أخضر يمين
const RATING_OPTS = ["5", "4.5", "4", "3.5"].map((v) => ({ value: v, label: `★ ${v} من 5` }));
const SCOPES = ["الفرع", "مقدّم الخدمة", "العلامة التجارية"] as const;

export function ApproveModal({
  short,
  name,
  code,
  busy,
  onConfirm,
  onClose,
}: {
  short: string;
  name: string;
  code: string;
  busy: boolean;
  onConfirm: (v: { tier: Tier; rating: number; review: string }) => void;
  onClose: () => void;
}) {
  const [tier, setTier] = useState<Tier>("gold");
  const [rating, setRating] = useState("4.5");
  const [review, setReview] = useState("");
  const [scope, setScope] = useState<string[]>(["الفرع", "العلامة التجارية"]);
  const [err, setErr] = useState<string>();
  const r = +rating;
  return (
    <Modal open onOpenChange={(o) => !o && !busy && onClose()} width={640} title={`اعتماد ونشر بدون زيارة · ${short}`} subtitle={`${name} · ${code}`}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="الفئة">{(id) => <Select id={id} value={tier} onChange={(v) => setTier(v as Tier)} options={TIERS} className="[&>span]:text-14! [&>span]:font-normal!" />}</Field>
        <Field label="التقييم الظاهر حتى أول 5 تقييمات">{(id) => <Select id={id} value={rating} onChange={setRating} options={RATING_OPTS} className="[&>span]:text-14! [&>span]:font-normal!" />}</Field>
      </div>
      <div className="flex items-center gap-2 rounded-12 border border-border px-3 py-2.5">
        <p className="min-w-0 flex-1 text-13 leading-5 text-ink">تقييم لينكار المبدئي للفرع · {rating} من 5</p>
        <span dir="ltr" className="flex gap-0.5 text-star" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} name={i <= Math.floor(r) ? "star-filled" : "star"} size={18} />
          ))}
        </span>
      </div>
      <Field label="مراجعة لينكار · تظهر في صفحة الفرع على الموقع والتطبيق" error={err}>
        {(id) => <TextArea id={id} value={review} invalid={!!err} onChange={(v) => (setReview(v), setErr(undefined))} placeholder="«مركز حديث بفتحات مكيفة وفريق معتمد، يقدّم الغسيل والتلميع بمواد Koch Chemie.»" className="h-[72px]! text-14! font-normal!" />}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-12 font-medium text-muted">تظهر المراجعة على:</span>
        <div className="flex gap-2">
        {SCOPES.map((s) => {
          const on = scope.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setScope(on ? scope.filter((x) => x !== s) : [...scope, s])}
              className={`flex h-[30px] items-center gap-1.5 rounded-[20px] border px-2.5 text-12 text-ink ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white font-normal"}`}
            >
              {s}
              {on ? <Icon name="check" size={12} /> : null}
            </button>
          );
        })}
        </div>
      </div>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button
          variant="accent"
          className="h-11"
          loading={busy}
          onClick={() => (review.trim() ? onConfirm({ tier, rating: r, review: review.trim() }) : setErr("اكتب مراجعة لينكار"))}
        >
          اعتماد ونشر
          <Icon name="check" size={16} />
        </Button>
        <Button variant="secondary" className="h-[46px]" onClick={onClose} disabled={busy}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── تأكيد قبل مغادرة نموذج غير محفوظ (القسم 18.2 · غير مرسومة — تُعرض على المصمم) ─────────────
export function LeaveModal({ onLeave, onStay }: { onLeave: () => void; onStay: () => void }) {
  return (
    <Modal open onOpenChange={(o) => !o && onStay()} width={440} title="مغادرة بدون حفظ؟" description="البيانات التي أدخلتها في المعالج لن تُحفظ.">
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="danger" onClick={onLeave}>
          مغادرة
        </Button>
        <Button variant="secondary" onClick={onStay}>
          متابعة التعبئة
        </Button>
      </div>
    </Modal>
  );
}
