"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { TEMPLATE_GENERAL, TEMPLATE_GENERAL_LABEL, TEST_METHODS, type Criterion, type ListKey, type Template } from "@/lib/api/reference";
import { useUrlState } from "@/lib/use-url-state";
import { ProductModal } from "./ProductModal";

// نوافذ البيانات المرجعية:
// CON5-20M · حذف قيمة (3114:80661) · تصنيف جديد (80683) · تعديل التصنيف ×6 (3435:327750…327895) · CON7 · حذف التصنيف (3344:223967)
// · إضافة قالب جديد (3400:241845) · تعديل القالب ×7 (3411:244361…250411) · حذف القالب ×7 (3411:251301…251595)
// · إضافة منتج معتمد ×6 (3502:151688 …) · تعديل منتج معتمد ×24 (3502:95593 …) · حذف منتج معتمد ×6 (3502:141838 · 3544:307623…307703)
// الرسائل CON5-20T: حُفظت التغييرات · عُطّلت القيمة · أُنشئ التصنيف كمسودة · أُضيف القالب · حُذف القالب · حُذف التصنيف · أُضيف المنتج المعتمد · حُذف المنتج المعتمد
export function RefModals({ category }: { category?: string }) {
  const url = useUrlState();
  const m = url.get("modal");
  const close = () => url.replace({ modal: null, row: null, list: null, cat: null, product: null, template: null });
  if (!m?.startsWith("ref-")) return null;
  if (m === "ref-delete" && url.get("list") && url.get("row")) return <DeleteValue list={url.get("list") as ListKey} row={url.get("row")!} onClose={close} />;
  if (m === "ref-cat-new") return <CategoryForm onClose={close} />;
  if (m === "ref-cat-edit" && url.get("cat")) return <CategoryForm slug={url.get("cat")!} onClose={close} />;
  if (m === "ref-cat-delete" && url.get("cat")) return <DeleteCategory slug={url.get("cat")!} onClose={close} />;
  if (m === "ref-template" && url.get("template")) return <TemplateForm id={url.get("template")!} onClose={close} />;
  if (m === "ref-template-delete" && url.get("template")) return <DeleteTemplate id={url.get("template")!} onClose={close} />;
  if (m === "ref-product" && category && url.get("product")) return <ProductModal slug={category} id={url.get("product")!} onClose={close} />;
  if (m === "ref-product-delete" && category && url.get("product")) return <DeleteProduct slug={category} id={url.get("product")!} onClose={close} />;
  return null;
}

function useDone(onClose: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (r: { toast: string }) => {
    qc.invalidateQueries({ queryKey: ["reference"] });
    toast(r.toast);
    onClose();
  };
}

/** نافذة تأكيد 480 (حذف قيمة · حذف التصنيف · حذف القالب · حذف منتج معتمد) */
function Confirm({ title, subtitle, body, confirm = "تأكيد", cancel = "تراجع", loading, onConfirm, onClose }: { title: string; subtitle?: string; body?: string; confirm?: string; cancel?: string; loading: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={title} subtitle={subtitle} width={480}>
      {/* حذف قيمة: ملاحظة تنبيه (#FBF3E4 بنص #B7791F) — نوافذ الحذف التانية في Figma بعنوان وأزرار بس */}
      {body ? <p className="min-h-[100px] rounded-12 bg-pending-tint p-3 text-13 font-light text-pending">{body}</p> : null}
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="danger" className="h-11!" loading={loading} onClick={onConfirm}>
          {confirm}
        </Button>
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          {cancel}
        </Button>
      </div>
    </Modal>
  );
}
const RULE = "إن لم تكن مستخدمة تُحذف نهائياً، وإن كانت مستخدمة تُعطَّل وتبقى في السجلات.";

function DeleteValue({ list, row, onClose }: { list: ListKey; row: string; onClose: () => void }) {
  const done = useDone(onClose);
  const mut = useMutation({ mutationFn: () => api.reference.deleteValue(list, row), onSuccess: done });
  return <Confirm title="حذف قيمة من القائمة" subtitle="القيمة المستخدمة في خدمات أو حجوزات قائمة تُعطَّل بدل حذفها" body={RULE} loading={mut.isPending} onConfirm={() => mut.mutate()} onClose={onClose} />;
}

function DeleteCategory({ slug, onClose }: { slug: string; onClose: () => void }) {
  const router = useRouter();
  const done = useDone(onClose);
  const mut = useMutation({
    mutationFn: () => api.reference.deleteCategory(slug),
    onSuccess: (r) => {
      done(r);
      router.replace("/reference/service-categories");
    },
  });
  return <Confirm title="حذف التصنيف" loading={mut.isPending} onConfirm={() => mut.mutate()} onClose={onClose} />;
}

function DeleteTemplate({ id, onClose }: { id: string; onClose: () => void }) {
  const done = useDone(onClose);
  const q = useQuery({ queryKey: ["reference", "templates"], queryFn: () => api.reference.templates() });
  const t = q.data?.find((x) => x.id === id);
  const mut = useMutation({ mutationFn: () => api.reference.deleteTemplate(id), onSuccess: done });
  if (!t) return null;
  return <Confirm title={`حذف القالب «${t.name}»؟`} confirm="حذف" cancel="إلغاء" loading={mut.isPending} onConfirm={() => mut.mutate()} onClose={onClose} />;
}

function DeleteProduct({ slug, id, onClose }: { slug: string; id: string; onClose: () => void }) {
  const done = useDone(onClose);
  const mut = useMutation({ mutationFn: () => api.reference.deleteProduct(slug, id), onSuccess: done });
  return <Confirm title="حذف المنتج المعتمد" loading={mut.isPending} onConfirm={() => mut.mutate()} onClose={onClose} />;
}

const INPUT = "h-11! [&_input]:text-13!";
/** حقول نوافذ القوالب: 14 Regular (القيمة) · 14 Light رمادي (المثال) */
const INPUT14 = "h-11! [&_input]:text-14! [&_input]:font-normal! [&_input]:placeholder:font-light!";

/** CON5-20M · تصنيف جديد / تعديل التصنيف (520): الاسم + الأيقونة (منطقة رفع 158) */
function CategoryForm({ slug, onClose }: { slug?: string; onClose: () => void }) {
  const done = useDone(onClose);
  const q = useQuery({ queryKey: ["reference", "category", slug], queryFn: () => api.reference.category(slug!), enabled: !!slug });
  if (slug && !q.data) return null;
  return <CategoryFormInner key={slug ?? "new"} slug={slug} initial={q.data?.name ?? ""} done={done} onClose={onClose} />;
}
function CategoryFormInner({ slug, initial, done, onClose }: { slug?: string; initial: string; done: (r: { toast: string }) => void; onClose: () => void }) {
  const [name, setName] = useState(initial);
  const [file, setFile] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const mut = useMutation({
    mutationFn: () => (slug ? api.reference.updateCategory(slug, name) : api.reference.createCategory(name)),
    onSuccess: done,
    onError: (e) => isApiError(e) && setErr(e.fields?.name ?? ""),
  });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={slug ? "تعديل التصنيف" : "تصنيف جديد"} width={520}>
      <Field label="الاسم" error={err}>
        {(id) => <TextInput id={id} value={name} invalid={!!err} placeholder="مثال: تنظيف المحرك" onChange={(e) => (setName(e.target.value), setErr(""))} className={INPUT} />}
      </Field>
      <Field label="الأيقونة">
        {(id) => (
          <label htmlFor={id} className="flex size-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-12 border border-dashed border-border-strong bg-white px-2 text-center text-12 font-medium text-success hover:bg-surface-1">
            <Icon name="download" size={24} className="rotate-180 text-ink" />
            <span>{file ?? (slug ? "تغيير الأيقونة" : "رفع الأيقونة")}</span>
            <input id={id} type="file" accept="image/svg+xml,image/png" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
          </label>
        )}
      </Field>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="accent" className="h-11!" loading={mut.isPending} onClick={() => mut.mutate()}>
          {slug ? "حفظ التغييرات" : "إنشاء"}
        </Button>
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

/** CON5-20M · إضافة قالب جديد (3400:241845) · إضافة قالب جديد · 10 معايير (3411:243676) · تعديل القالب ×7 (3411:244361 … 250411) — 600 · r20 · حشو 24
 * «عدد المعايير» يولّد صفوف «المعايير» (حقل 468 + «حرج» + مفتاح 44×24) والجسم يمرَّر داخل نافذة 780 — من غير عدد: نافذة 558 بدون قائمة (تعديل · تغيير اللون). */
function TemplateForm({ id, onClose }: { id: string; onClose: () => void }) {
  const done = useDone(onClose);
  const t = useQuery({ queryKey: ["reference", "templates"], queryFn: () => api.reference.templates() });
  const cats = useQuery({ queryKey: ["reference", "categories"], queryFn: () => api.reference.categories() });
  if (!t.data || !cats.data) return null;
  const current = id === "new" ? undefined : t.data.find((x) => x.id === id);
  if (id !== "new" && !current) return null;
  // CON5-DD · التصنيف (3411:251618 …): «عام · كل الفروع» ثم التصنيفات
  const options = [{ value: TEMPLATE_GENERAL, label: TEMPLATE_GENERAL_LABEL }, ...["نانو سيراميك", "حماية PPF", "التظليل", "التلميع", "الغسيل والتنظيف", "تغيير اللون", ...cats.data.map((c) => c.name)].filter((v, i, a) => a.indexOf(v) === i).map((v) => ({ value: v, label: v }))];
  return <TemplateFormInner key={id} current={current} options={options} done={done} onClose={onClose} />;
}

const MAX_CRITERIA = 60;
type Crit = Criterion & { k: number };
let critSeq = 0;
const critRows = (n: number, prev: Crit[]): Crit[] => Array.from({ length: n }, (_, i) => prev[i] ?? { k: ++critSeq, text: "", critical: false });

function TemplateFormInner({ current, options, done, onClose }: { current?: Template; options: { value: string; label: string }[]; done: (r: { toast: string }) => void; onClose: () => void }) {
  const [v, setV] = useState({ name: current?.name ?? "", category: current?.category ?? "", method: current?.method ?? "", threshold: current?.threshold ?? "" });
  const [crits, setCrits] = useState<Crit[]>(() => (current?.criteria ?? []).map((c) => ({ ...c, k: ++critSeq })));
  const [count, setCount] = useState(crits.length ? String(crits.length) : "");
  const [err, setErr] = useState<Record<string, string>>({});
  const [initial] = useState(() => JSON.stringify({ v, crits: crits.map(({ text, critical }) => [text, critical]) }));
  const dirty = JSON.stringify({ v, crits: crits.map(({ text, critical }) => [text, critical]) }) !== initial;
  const mut = useMutation({
    mutationFn: () => api.reference.saveTemplate({ ...v, threshold: v.threshold.trim(), criteria: crits.map(({ text, critical }) => ({ text, critical })), id: current?.id }),
    onSuccess: done,
    onError: (e) => isApiError(e) && setErr(e.fields ?? {}),
  });
  const set = (k: keyof typeof v, val: string) => (setV({ ...v, [k]: val }), setErr({ ...err, [k]: "" }));
  const onCount = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    const n = Math.min(Number(digits || 0), MAX_CRITERIA);
    setCount(digits ? String(n) : "");
    setCrits((prev) => critRows(n, prev));
  };
  const leave = () => {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    onClose();
  };
  return (
    <Modal
      open
      onOpenChange={(o) => !o && leave()}
      title={current ? "تعديل القالب" : "إضافة قالب جديد"}
      width={600}
      className="max-h-[calc(100vh-32px)]! overflow-hidden! sm:max-h-[calc(100vh-120px)]!"
      footer={
        <>
          <Button variant="accent" className="h-11!" loading={mut.isPending} onClick={() => mut.mutate()}>
            {current ? "حفظ التغييرات" : "حفظ القالب"}
          </Button>
          <Button variant="secondary" className="h-[46px]!" onClick={leave}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-1">
        <Field label="اسم القالب" error={err.name}>
          {(fid) => <TextInput id={fid} value={v.name} invalid={!!err.name} placeholder="أدخل اسم القالب" onChange={(e) => set("name", e.target.value)} className={INPUT14} />}
        </Field>
        <Field label="التصنيف" error={err.category}>
          {(fid) => <CategorySelect id={fid} value={v.category} options={options} invalid={!!err.category} onChange={(x) => set("category", x)} />}
        </Field>
        <Field label="طريقة الاختبار" error={err.method}>
          {() => (
            <div role="radiogroup" aria-label="طريقة الاختبار" className="flex flex-wrap gap-2">
              {TEST_METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={v.method === m}
                  onClick={() => set("method", m)}
                  className={`h-[38px] rounded-10 px-3.5 text-14 ${v.method === m ? "h-9 self-center bg-ink font-semibold text-white" : "border border-border bg-white font-medium text-ink hover:bg-surface-1"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </Field>
        <Field label="عدد المعايير">{(fid) => <TextInput id={fid} inputMode="numeric" value={count} placeholder="مثال: 10" onChange={(e) => onCount(e.target.value)} className={INPUT14} />}</Field>
        {crits.length ? (
          <div className="flex flex-col gap-2">
            <p className="text-12 leading-5 font-medium text-muted">المعايير</p>
            {crits.map((c, i) => (
              <div key={c.k} className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <TextInput
                    aria-label={`المعيار ${i + 1}`}
                    value={c.text}
                    invalid={!!err[`criterion-${i}`]}
                    placeholder={`المعيار ${i + 1}`}
                    onChange={(e) => (setCrits(crits.map((x) => (x.k === c.k ? { ...x, text: e.target.value } : x))), setErr({ ...err, [`criterion-${i}`]: "" }))}
                    className={`${INPUT14} min-w-0 flex-1`}
                  />
                  <span className="text-12 leading-5 font-medium text-muted">حرج</span>
                  <CritToggle checked={c.critical} label={`حرج · المعيار ${i + 1}`} onChange={(critical) => setCrits(crits.map((x) => (x.k === c.k ? { ...x, critical } : x)))} />
                </div>
                {err[`criterion-${i}`] ? (
                  <p role="alert" className="text-12 text-danger">
                    {err[`criterion-${i}`]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <Field label="حد قبول القالب">{(fid) => <TextInput id={fid} value={v.threshold} placeholder="70%" onChange={(e) => set("threshold", e.target.value)} className={INPUT14} />}</Field>
      </div>
    </Modal>
  );
}

/** «حرج»: مفتاح 44×24 · حشو 2 · المقبض 20 — شغّال كحلي والمقبض أخضر شمال · مطفي #D9DEDB والمقبض أبيض يمين */
function CritToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "justify-end bg-ink" : "justify-start bg-border"}`}>
      <span aria-hidden className={`size-5 rounded-full ${checked ? "bg-lime" : "bg-white"}`} />
    </button>
  );
}

/** CON5-DD · التصنيف (3411:251618 · 251654 · 251686 … 251890): حقل 44 بسهم 16 + قائمة 420 · r12 · حشو 6 · عناصر 36 (13 Regular · المختار #F7FBE9 13 SemiBold + ✓ 14) */
function CategorySelect({ id, value, options, invalid, onChange }: { id: string; value: string; options: { value: string; label: string }[]; invalid?: boolean; onChange: (v: string) => void }) {
  const current = options.find((o) => o.value === value);
  return (
    <Menu.Root dir="rtl" modal={false}>
      <Menu.Trigger
        id={id}
        aria-invalid={invalid || undefined}
        className={`group flex h-11 w-full items-center gap-2 rounded-10 border bg-white px-3 text-14 text-ink outline-none data-[state=open]:border-ink ${invalid ? "border-danger" : "border-border"}`}
      >
        <span className={`min-w-0 flex-1 truncate text-start ${current ? "" : "font-light text-muted"}`}>{current?.label ?? "اختر التصنيف"}</span>
        <Icon name="chevron-down" size={16} className="shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="start" sideOffset={6} className="z-[70] flex max-h-[320px] w-[420px] max-w-[calc(100vw-32px)] flex-col gap-0.5 overflow-y-auto rounded-12 border border-border bg-white p-1.5 shadow-menu">
          <Menu.RadioGroup value={value} onValueChange={onChange} className="flex flex-col gap-0.5">
            {options.map((o) => (
              <Menu.RadioItem
                key={o.value}
                value={o.value}
                className="flex h-9 cursor-pointer items-center justify-between gap-2 rounded-8 px-2.5 text-13 text-ink outline-none data-highlighted:bg-surface-1 data-[state=checked]:bg-lime-tint data-[state=checked]:font-semibold"
              >
                {o.label}
                <Menu.ItemIndicator>
                  <Icon name="check" size={14} />
                </Menu.ItemIndicator>
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
