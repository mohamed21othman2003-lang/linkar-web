"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { TEST_METHODS, type ListKey, type Product, type Template } from "@/lib/api/reference";
import { useUrlState } from "@/lib/use-url-state";

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
  if (m === "ref-product" && category && url.get("product")) return <ProductForm slug={category} id={url.get("product")!} onClose={close} />;
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
            <Icon name="download" size={24} className="text-ink" />
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

/** CON5-20M · إضافة قالب جديد / تعديل القالب (600) */
function TemplateForm({ id, onClose }: { id: string; onClose: () => void }) {
  const done = useDone(onClose);
  const t = useQuery({ queryKey: ["reference", "templates"], queryFn: () => api.reference.templates() });
  const cats = useQuery({ queryKey: ["reference", "categories"], queryFn: () => api.reference.categories() });
  if (!t.data || !cats.data) return null;
  const current = id === "new" ? undefined : t.data.find((x) => x.id === id);
  if (id !== "new" && !current) return null;
  const options = ["عام", ...cats.data.map((c) => c.name)].map((v) => ({ value: v, label: v }));
  return <TemplateFormInner key={id} current={current} options={options} done={done} onClose={onClose} />;
}
function TemplateFormInner({ current, options, done, onClose }: { current?: Template; options: { value: string; label: string }[]; done: (r: { toast: string }) => void; onClose: () => void }) {
  const [v, setV] = useState({
    name: current?.name ?? "",
    category: current?.category ?? "",
    method: current && current.method !== "—" ? current.method : "",
    count: current && current.count !== "—" ? current.count : "",
    threshold: current && current.threshold !== "—" ? current.threshold : "",
  });
  const [err, setErr] = useState<Record<string, string>>({});
  const mut = useMutation({
    mutationFn: () => api.reference.saveTemplate({ ...v, id: current?.id }),
    onSuccess: done,
    onError: (e) => isApiError(e) && setErr(e.fields ?? {}),
  });
  const set = (k: keyof typeof v, val: string) => (setV({ ...v, [k]: val }), setErr({ ...err, [k]: "" }));
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={current ? "تعديل القالب" : "إضافة قالب جديد"} width={600}>
      <Field label="اسم القالب" error={err.name}>
        {(id) => <TextInput id={id} value={v.name} invalid={!!err.name} placeholder="أدخل اسم القالب" onChange={(e) => set("name", e.target.value)} className={INPUT} />}
      </Field>
      <Field label="التصنيف" error={err.category}>
        {(id) => <Select id={id} value={v.category || undefined} placeholder="اختر التصنيف" options={options} invalid={!!err.category} onChange={(x) => set("category", x)} />}
      </Field>
      <Field label="طريقة الاختبار" error={err.method}>
        {() => (
          <div role="radiogroup" aria-label="طريقة الاختبار" className="flex flex-wrap gap-2">
            {TEST_METHODS.map((m) => (
              <button key={m} type="button" role="radio" aria-checked={v.method === m} onClick={() => set("method", m)} className={`h-[38px] rounded-10 px-3 text-13 font-medium ${v.method === m ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}>
                {m}
              </button>
            ))}
          </div>
        )}
      </Field>
      <Field label="عدد المعايير">{(id) => <TextInput id={id} inputMode="numeric" value={v.count} placeholder="مثال: 10" onChange={(e) => set("count", e.target.value.replace(/\D/g, ""))} className={INPUT} />}</Field>
      <Field label="حد قبول القالب">{(id) => <TextInput id={id} value={v.threshold} placeholder="70%" onChange={(e) => set("threshold", e.target.value)} className={INPUT} />}</Field>
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant="accent" className="h-11!" loading={mut.isPending} onClick={() => mut.mutate()}>
          حفظ القالب
        </Button>
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

/** CON5-20M · إضافة / تعديل منتج معتمد (1240 · بطاقات على #F6F8F7): المنتج المعتمد · المواصفات · الضمان · ما يشمله */
function ProductForm({ slug, id, onClose }: { slug: string; id: string; onClose: () => void }) {
  const done = useDone(onClose);
  const q = useQuery({ queryKey: ["reference", "category", slug], queryFn: () => api.reference.category(slug) });
  if (!q.data) return null;
  const p = id === "new" ? undefined : q.data.products.find((x) => x.id === id);
  if (id !== "new" && !p) return null;
  return <ProductFormInner key={id} slug={slug} p={p} done={done} onClose={onClose} />;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-14 bg-white p-4">
      <h3 className="text-14 font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function ProductFormInner({ slug, p, done, onClose }: { slug: string; p?: Product; done: (r: { toast: string }) => void; onClose: () => void }) {
  const [name, setName] = useState(p?.name ?? "");
  const [duration, setDuration] = useState(p?.duration ?? "");
  const [description, setDescription] = useState(p?.description ?? "");
  const [specs, setSpecs] = useState<string[]>(p ? p.specs.split(" · ") : [""]);
  const [options, setOptions] = useState(p?.options ?? "");
  const [wParty, setWParty] = useState(p?.warranty.includes("الشركة المصنّعة") ? "الشركة المصنّعة" : "المركز");
  const [wDuration, setWDuration] = useState(p ? p.warranty.split(" · ")[0] : "");
  const [err, setErr] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      api.reference.saveProduct(slug, {
        id: p?.id,
        name,
        duration,
        description,
        specs: specs.map((s) => s.trim()).filter(Boolean).join(" · "),
        options,
        warranty: wDuration === "بدون ضمان" || !wDuration ? "بدون ضمان" : `${wDuration} · ${wParty}`,
      }),
    onSuccess: done,
    onError: (e) => isApiError(e) && setErr(e.fields?.name ?? ""),
  });
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={p ? `تعديل منتج معتمد · ${p.name}` : "إضافة منتج معتمد"} width={1240} className="max-h-[calc(100vh-60px)]! gap-4!">
      <div className="flex flex-col gap-3 rounded-16 bg-[#f6f8f7] p-4">
        <Card title="المنتج المعتمد">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="اسم المنتج المعتمد" error={err}>
              {(id) => <TextInput id={id} value={name} invalid={!!err} placeholder="مثال: نانو سيراميك بريميوم" onChange={(e) => (setName(e.target.value), setErr(""))} className={INPUT} />}
            </Field>
            <Field label="مدة التنفيذ">{(id) => <TextInput id={id} value={duration} placeholder="مثال: يوم واحد · 6 – 8 ساعات" onChange={(e) => setDuration(e.target.value)} className={INPUT} />}</Field>
          </div>
          <Field label="وصف قصير">{(id) => <TextInput id={id} value={description} placeholder="مثال: طبقتان على الهيكل بعد تصحيح مرحلتين." onChange={(e) => setDescription(e.target.value)} className={INPUT} />}</Field>
        </Card>
        <Card title="المواصفات">
          {specs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput aria-label={`مواصفة ${i + 1}`} value={s} placeholder="مواصفة" onChange={(e) => setSpecs(specs.map((x, j) => (j === i ? e.target.value : x)))} className={`${INPUT} flex-1`} />
              <button type="button" aria-label="حذف المواصفة" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="flex size-8 items-center justify-center rounded-8 border border-border text-danger hover:bg-surface-1">
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setSpecs([...specs, ""])} className="w-fit text-13 font-medium text-success">
            + مواصفة
          </button>
        </Card>
        <Card title="الخيارات">
          <Field label="اسم الخيار">{(id) => <TextInput id={id} value={options} placeholder="مثال: الأسطح الإضافية" onChange={(e) => setOptions(e.target.value)} className={INPUT} />}</Field>
        </Card>
        <Card title="الضمان">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="الجهة">
              {() => (
                <div role="radiogroup" aria-label="الجهة" className="flex gap-2">
                  {["المركز", "الشركة المصنّعة"].map((x) => (
                    <button key={x} type="button" role="radio" aria-checked={wParty === x} onClick={() => setWParty(x)} className={`h-11 flex-1 rounded-10 text-13 font-medium ${wParty === x ? "bg-ink text-white" : "border border-border bg-white text-ink"}`}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </Field>
            <Field label="المدة">{(id) => <TextInput id={id} value={wDuration} placeholder="مثال: 3 سنوات" onChange={(e) => setWDuration(e.target.value)} className={INPUT} />}</Field>
          </div>
        </Card>
      </div>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button variant="accent" className="h-11! px-6" loading={mut.isPending} onClick={() => mut.mutate()}>
          حفظ
        </Button>
        <Button variant="secondary" className="h-[46px]!" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
