"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { keepFocusQuiet } from "@/components/ui/focus";
import { api, isApiError } from "@/lib/api";
import { productForm, specSuggestions, type OptionType, type Product, type ProductFormConfig, type WarrantyParty } from "@/lib/api/reference";

// CON5-20M · إضافة منتج معتمد · <التصنيف> (نانو 3502:151688 · PPF 3535:284451 · تغيير اللون 3536:288740 · التلميع 3536:293954 · التظليل 3544:299348 · الغسيل 3544:306693)
// CON5-20M · تعديل منتج معتمد · <المنتج> (نانو 3502:96853/3524:260569/3502:95593/3502:140573/3524:261924 · PPF 3535:279942/281068/282193/283322
//   · تغيير اللون 3535:285416/286515/287628 · التلميع 3536:289687/290769/291828/292904 · التظليل 3536:294910/296016/297122/298232 · الغسيل 3544:301416/302472/303536/304596/305640)
// نافذة 1240×840 · r20: رأس (22·32·14 · عنوان 22 Bold) + جسم يمرَّر (4·32·24) فيه حاوية #F6F8F7 r14 حشو 16 مسافة 12 لبطاقات بيضاء r16 حشو 20 مسافة 14
// + تذييل بخط علوي #E7EAE8 (16·32): «حفظ» ✓ يمين و«إلغاء» شمال. الصفوف الافتراضية والأمثلة وقوائم الاقتراح من إعداد التصنيف PRODUCT_FORM.

let seq = 0;
const key = () => ++seq;
type SpecRow = { k: number; name: string; value: string };
type OptionRow = { k: number; name: string; type: OptionType | ""; values: string[] };
interface Draft {
  name: string;
  duration: string;
  description: string;
  specs: SpecRow[];
  options: OptionRow[];
  party: WarrantyParty | "";
  wDuration: string;
  covers: string[];
  conditions: string[];
  excludes: string;
  includes: string[];
}

function toDraft(p: Product | undefined, cfg: ProductFormConfig): Draft {
  if (!p)
    return {
      name: "",
      duration: "",
      description: "",
      specs: cfg.specs.map((name) => ({ k: key(), name, value: "" })),
      options: [{ k: key(), name: "", type: "", values: [] }],
      party: "",
      wDuration: "",
      covers: [],
      conditions: [],
      excludes: "",
      includes: [],
    };
  return {
    name: p.name,
    duration: p.duration,
    description: p.description,
    specs: p.specs.map(([name, value]) => ({ k: key(), name, value })),
    options: p.options.map((o) => ({ k: key(), ...o, values: [...o.values] })),
    party: p.warranty.party,
    wDuration: p.warranty.duration,
    covers: [...p.warranty.covers],
    conditions: [...p.warranty.conditions],
    excludes: p.warranty.excludes,
    includes: [...p.includes],
  };
}
const strip = (d: Draft) => JSON.stringify({ ...d, specs: d.specs.map(({ name, value }) => [name, value]), options: d.options.map(({ name, type, values }) => [name, type, values]) });

export function ProductModal({ slug, id, onClose }: { slug: string; id: string; onClose: () => void }) {
  const q = useQuery({ queryKey: ["reference", "category", slug], queryFn: () => api.reference.category(slug) });
  const p = id === "new" ? undefined : q.data?.products.find((x) => x.id === id);
  const missing = !!q.data && id !== "new" && !p;
  /** Esc / الضغط برّه النافذة → نفس «إلغاء» (تأكيد لو فيه تعديلات غير محفوظة) */
  const leaveRef = useRef(onClose);
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          dir="rtl"
          onOpenAutoFocus={keepFocusQuiet}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            // Esc جوه حقل وسم/قائمة اقتراحات بيقفل الحقل بس (Radix بيسمع Esc على المستند قبل الحقل)
            if (!(e.target instanceof Element && e.target.closest("[data-own-esc]"))) leaveRef.current();
          }}
          onPointerDownOutside={(e) => (e.preventDefault(), leaveRef.current())}
          className="fixed top-1/2 left-1/2 z-50 flex h-[840px] max-h-[calc(100vh-32px)] w-[1240px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-white shadow-card focus:outline-none sm:max-h-[calc(100vh-60px)]"
        >
          {q.data && !missing ? (
            <ProductForm key={id} slug={slug} p={p} onClose={onClose} leaveRef={leaveRef} />
          ) : (
            <>
              <Head title={id === "new" ? "إضافة منتج معتمد" : "تعديل منتج معتمد"} onClose={onClose} />
              <div className="flex flex-1 flex-col gap-3 px-8 pt-1 pb-6">
                {missing || q.isError ? (
                  <p className="text-13 text-muted">{missing ? "المنتج المعتمد غير موجود." : "تعذّر تحميل البيانات."}</p>
                ) : (
                  <>
                    <Skeleton className="h-[264px] w-full rounded-16" />
                    <Skeleton className="h-[350px] w-full rounded-16" />
                  </>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[22px] pb-3.5 sm:px-8">
      <Dialog.Title className="text-[22px] leading-[42px] font-bold text-ink">{title}</Dialog.Title>
      <Dialog.Description className="sr-only">{title}</Dialog.Description>
      <button type="button" aria-label="إغلاق" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1">
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

function ProductForm({ slug, p, onClose, leaveRef }: { slug: string; p?: Product; onClose: () => void; leaveRef: { current: () => void } }) {
  const cfg = productForm(slug);
  const qc = useQueryClient();
  const toast = useToast();
  const [initial] = useState(() => toDraft(p, cfg));
  const [d, setD] = useState<Draft>(initial);
  const [err, setErr] = useState<Record<string, string>>({});
  const dirty = strip(d) !== strip(initial);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const leave = () => {
    if (dirty && !window.confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return;
    onClose();
  };
  useEffect(() => {
    leaveRef.current = leave;
  });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const clearErr = (k: string) => err[k] && setErr((e) => Object.fromEntries(Object.entries(e).filter(([x]) => x !== k)));

  const save = useMutation({
    mutationFn: () =>
      api.reference.saveProduct(slug, {
        id: p?.id,
        name: d.name,
        duration: d.duration.trim(),
        description: d.description.trim(),
        specs: d.specs.map((s) => [s.name, s.value]),
        options: d.options.map(({ name, type, values }) => ({ name, type, values })),
        warranty: { party: d.party, duration: d.wDuration.trim() || (d.party ? "" : "بدون ضمان"), covers: d.covers, conditions: d.conditions, excludes: d.excludes.trim() || "—" },
        includes: d.includes,
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["reference"] });
      toast(r.toast);
      onClose();
    },
    onError: (e) => {
      if (isApiError(e) && e.fields) setErr(e.fields);
      else toast("تعذّر الحفظ", "حاول مرة أخرى.");
    },
  });

  const suggestionsFor = (name: string) => specSuggestions(slug, name.trim());

  return (
    <>
      <Head title={p ? "تعديل منتج معتمد" : "إضافة منتج معتمد"} onClose={leave} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-6 sm:px-8">
        <div className="flex flex-col gap-3 rounded-14 bg-[#f6f8f7] p-2 sm:p-4">
          {/* المنتج المعتمد */}
          <Card title="المنتج المعتمد">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F label="اسم المنتج المعتمد" error={err.name}>
                {(fid) => <Input id={fid} value={d.name} invalid={!!err.name} placeholder={cfg.placeholders.name} onChange={(v) => (set("name", v), clearErr("name"))} />}
              </F>
              <F label="مدة التنفيذ">{(fid) => <Suggest id={fid} value={d.duration} placeholder={cfg.placeholders.duration} options={cfg.durations} onChange={(v) => set("duration", v)} />}</F>
            </div>
            <F label="وصف قصير">{(fid) => <TextArea id={fid} value={d.description} placeholder={cfg.placeholders.description} onChange={(v) => set("description", v)} />}</F>
          </Card>

          {/* المواصفات: [المواصفة 300 · القيمة · حذف 32] صفوف 32 بمسافة 8 */}
          <Card title="المواصفات">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-12 leading-5 font-medium text-muted">
                <span className="w-[34%] max-w-[300px] shrink-0 sm:w-[300px]">المواصفة</span>
                <span className="min-w-0 flex-1">القيمة</span>
                <span className="w-8 shrink-0" />
              </div>
              {d.specs.map((s, i) => (
                <div key={s.k} className="flex items-center gap-2">
                  <Input
                    small
                    aria-label={`المواصفة ${i + 1}`}
                    value={s.name}
                    invalid={!!err[`spec-${i}`]}
                    className="w-[34%] max-w-[300px] shrink-0 sm:w-[300px]"
                    onChange={(v) => (set("specs", d.specs.map((x) => (x.k === s.k ? { ...x, name: v } : x))), clearErr(`spec-${i}`))}
                  />
                  <Suggest small aria-label={`قيمة ${s.name || `المواصفة ${i + 1}`}`} value={s.value} options={suggestionsFor(s.name)} className="min-w-0 flex-1" onChange={(v) => set("specs", d.specs.map((x) => (x.k === s.k ? { ...x, value: v } : x)))} />
                  <DelBtn label={`حذف ${s.name || "المواصفة"}`} onClick={() => (set("specs", d.specs.filter((x) => x.k !== s.k)), setErr({}))} />
                </div>
              ))}
            </div>
            <AddChip label="مواصفة" onClick={() => set("specs", [...d.specs, { k: key(), name: "", value: "" }])} />
          </Card>

          {/* الخيارات: مجموعة لكل خيار (#F6F8F7 r12 حشو 16): اسم الخيار · النوع (إضافة / اختيار واحد) · القيم */}
          <Card title="الخيارات">
            {d.options.map((o, i) => {
              const patch = (v: Partial<OptionRow>) => set("options", d.options.map((x) => (x.k === o.k ? { ...x, ...v } : x)));
              return (
                <div key={o.k} className="flex flex-col gap-3 rounded-12 bg-[#f6f8f7] p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <F label="اسم الخيار" error={err[`option-${i}`]}>
                        {(fid) => <Input id={fid} value={o.name} invalid={!!err[`option-${i}`]} placeholder={i === 0 ? cfg.placeholders.option : "مثال: اسم الخيار"} onChange={(v) => (patch({ name: v }), clearErr(`option-${i}`))} />}
                      </F>
                      <Group label="النوع">
                        <ChoiceChip on={o.type === "single"} onClick={() => patch({ type: "single" })}>
                          اختيار واحد
                        </ChoiceChip>
                        <ChoiceChip on={o.type === "add"} onClick={() => patch({ type: "add" })}>
                          إضافة
                        </ChoiceChip>
                      </Group>
                    </div>
                    <DelBtn label={`حذف ${o.name || "الخيار"}`} onClick={() => (set("options", d.options.filter((x) => x.k !== o.k)), setErr({}))} />
                  </div>
                  <TagList label="القيم" addLabel="+ قيمة" values={o.values} onChange={(values) => patch({ values })} />
                </div>
              );
            })}
            <AddChip label="خيار" onClick={() => set("options", [...d.options, { k: key(), name: "", type: "", values: [] }])} />
          </Card>

          {/* الضمان */}
          <Card title="الضمان">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <F label="المدة">{(fid) => <Suggest id={fid} value={d.wDuration} options={cfg.warrantyDurations} onChange={(v) => set("wDuration", v)} />}</F>
              <Group label="الجهة">
                {(["الشركة المصنّعة", "المركز"] as const).map((x) => (
                  <ChoiceChip key={x} on={d.party === x} onClick={() => set("party", d.party === x ? "" : x)}>
                    {x}
                  </ChoiceChip>
                ))}
              </Group>
            </div>
            <TagList label="ما يغطيه" addLabel="+ أضف بنداً" values={d.covers} onChange={(v) => set("covers", v)} />
            <TagList label="الشروط" addLabel="+ أضف شرطاً" values={d.conditions} onChange={(v) => set("conditions", v)} />
            <F label="ما لا يغطيه">{(fid) => <TextArea id={fid} value={d.excludes} onChange={(v) => set("excludes", v)} />}</F>
          </Card>

          {/* ما يشمله المنتج المعتمد */}
          <Card title="ما يشمله المنتج المعتمد">
            <TagList ariaLabel="ما يشمله المنتج المعتمد" addLabel="+ أضف بنداً" values={d.includes} onChange={(v) => set("includes", v)} />
          </Card>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-[#e7eae8] px-4 py-4 sm:px-8">
        <Button variant="accent" className="h-11! px-4" loading={save.isPending} onClick={() => save.mutate()}>
          حفظ
          {save.isPending ? null : <Icon name="check" size={16} />}
        </Button>
        <Button variant="secondary" className="h-[46px]! px-4" onClick={leave}>
          إلغاء
        </Button>
      </div>
    </>
  );
}

// ───────── قطع النموذج ─────────
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-16 bg-white p-4 sm:p-5">
      <h3 className="text-18 leading-7 font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}

/** حقل: العنوان 12 Medium رمادي (20) + مسافة 6 */
function F({ label, error, children }: { label: string; error?: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-12 leading-5 font-medium text-muted">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** مجموعة شرائح بعنوان (النوع · الجهة) */
function Group({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={id} className="text-12 leading-5 font-medium text-muted">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

const BOX = "flex items-center rounded-10 border bg-white px-3 focus-within:border-ink";
const TXT = "min-w-0 flex-1 bg-transparent text-14 leading-[22px] text-ink outline-none placeholder:font-light placeholder:text-muted";

/** حقل 44 (أو 32 في صفوف المواصفات) · r10 · حشو 12 · 14 Regular */
function Input({ value, onChange, invalid, small, className, ...rest }: { value: string; onChange: (v: string) => void; invalid?: boolean; small?: boolean; className?: string; id?: string; placeholder?: string; "aria-label"?: string }) {
  return (
    <div className={`${BOX} ${small ? "h-8" : "h-11"} ${invalid ? "border-danger" : "border-border"} ${className ?? ""}`}>
      <input {...rest} value={value} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} className={TXT} />
    </div>
  );
}

/** وصف قصير / ما لا يغطيه: 72 · حشو علوي 10 */
function TextArea({ value, onChange, id, placeholder }: { value: string; onChange: (v: string) => void; id: string; placeholder?: string }) {
  return (
    <textarea
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`h-[72px] w-full flex-none resize-none rounded-10 border border-border bg-white px-3 pt-2.5 ${TXT} focus:border-ink`}
    />
  );
}

/** حقل نص بقائمة اقتراحات منسدلة (قوائم CON5-DD · 3114:65411 حيث وُجدت + القيم المستخدمة) — نفس شكل الحقل في Figma من غير سهم */
function Suggest({ value, onChange, options, small, className, id, placeholder, ...rest }: { value: string; onChange: (v: string) => void; options: string[]; small?: boolean; className?: string; id?: string; placeholder?: string; "aria-label"?: string }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const listId = useId();
  const v = value.trim();
  const list = options.includes(v) || !v ? options : options.filter((o) => o.includes(v));
  const show = open && list.length > 0;
  const pick = (o: string) => (onChange(o), setOpen(false), setHi(-1));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const n = list.length;
      if (n) setHi((h) => (e.key === "ArrowDown" ? (h + 1) % n : (h - 1 + n) % n));
    } else if (e.key === "Enter" && show && hi >= 0) {
      e.preventDefault();
      pick(list[hi]);
    } else if (e.key === "Escape" && show) {
      e.stopPropagation();
      setOpen(false);
    }
  };
  return (
    <div className={`relative ${className ?? ""}`}>
      <div className={`${BOX} ${small ? "h-8" : "h-11"} border-border`}>
        <input
          {...rest}
          id={id}
          value={value}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          data-own-esc={show || undefined}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKey}
          onChange={(e) => (onChange(e.target.value), setOpen(true), setHi(-1))}
          className={TXT}
        />
      </div>
      {show ? (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-10 mt-1.5 flex max-h-[240px] flex-col gap-0.5 overflow-y-auto rounded-12 border border-border bg-white p-1.5 shadow-menu">
          {list.map((o, i) => {
            const sel = o === v;
            return (
              <li
                key={o}
                role="option"
                aria-selected={sel}
                onMouseDown={(e) => (e.preventDefault(), pick(o))}
                onMouseEnter={() => setHi(i)}
                className={`flex h-9 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-8 px-2.5 text-13 text-ink ${sel ? "bg-lime-tint font-semibold" : i === hi ? "bg-surface-1" : ""}`}
              >
                {o}
                {sel ? <Icon name="check" size={14} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** زر حذف 32 · r8 بإطار · سلة حمراء */
function DelBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-border bg-white text-danger hover:bg-surface-1">
      <Icon name="trash" size={16} />
    </button>
  );
}

/** «+ مواصفة» · «+ خيار»: شريحة 34 بيضاء بإطار · 13 Medium أخضر */
function AddChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[34px] w-fit items-center gap-1 rounded-full border border-border bg-white px-3 text-13 font-medium text-success hover:bg-surface-1">
      {label}
      <Icon name="plus" size={14} />
    </button>
  );
}

/** شريحة اختيار 34: المختارة #F7FBE9 بإطار كحلي 13 SemiBold + ✓ — غيرها بيضاء 13 Regular */
function ChoiceChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-13 whitespace-nowrap text-ink ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white hover:bg-surface-1"}`}
    >
      {children}
      {on ? <Icon name="check" size={14} /> : null}
    </button>
  );
}

/** قائمة وسوم (#EEF1EF r999 · 13 Regular · × 12) + زر «+ …» (#F7FBE9 بإطار أخضر) يتحوّل لحقل كتابة — Enter يضيف */
function TagList({ label, ariaLabel, addLabel, values, onChange }: { label?: string; ariaLabel?: string; addLabel: string; values: string[]; onChange: (v: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  useEffect(() => {
    if (adding) ref.current?.focus();
  }, [adding]);
  const commit = (keepOpen: boolean) => {
    const t = text.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setText("");
    if (!keepOpen) setAdding(false);
  };
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <span id={id} className="text-12 leading-5 font-medium text-muted">
          {label}
        </span>
      ) : null}
      <ul aria-labelledby={label ? id : undefined} aria-label={label ? undefined : ariaLabel} className="flex flex-wrap items-center gap-2">
        {values.map((t) => (
          <li key={t} className="flex h-[30px] items-center gap-1.5 rounded-full bg-surface-2 px-2.5 text-13 whitespace-nowrap text-ink">
            {t}
            <button type="button" aria-label={`إزالة ${t}`} onClick={() => onChange(values.filter((x) => x !== t))} className="flex size-3 items-center justify-center text-muted hover:text-ink">
              <Icon name="x" size={12} />
            </button>
          </li>
        ))}
        <li>
          {adding ? (
            <input
              ref={ref}
              value={text}
              aria-label={addLabel.replace("+ ", "")}
              data-own-esc
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commit(true);
                } else if (e.key === "Escape") {
                  e.stopPropagation();
                  setText("");
                  setAdding(false);
                }
              }}
              onBlur={() => commit(false)}
              className="h-8 w-[200px] rounded-full border border-success bg-white px-3 text-13 text-ink outline-none"
            />
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="flex h-8 items-center rounded-full border border-success bg-lime-tint px-3 text-13 font-medium whitespace-nowrap text-success hover:bg-lime-tint/60">
              {addLabel}
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
