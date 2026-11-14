"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, get, useFieldArray, useForm, useFormContext, FormProvider, useWatch, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { keepFocusQuiet } from "@/components/ui/focus";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import {
  APPROVED_PRODUCTS,
  DURATIONS,
  REMINDERS,
  SIZE_LABELS,
  SPEC_LABELS,
  TAGS,
  WARRANTY_BY,
  WARRANTY_YEARS,
  beforeVatOf,
  marginOf,
  warrantyLabel,
  type Service,
  type ServiceInput,
  type ServiceProduct,
  type SpecKey,
} from "@/lib/api/services";
import { SERVICE_TYPES } from "@/lib/api/providers";
import { num } from "@/lib/format";

// CON5-07M · إضافة خدمة · جونسون (3260-206684) · تعديل الخدمة · Johnson Ceramic Pro (3260-243268)
// أكبر نافذة في اللوحة: 1240×840 · r20 · الرأس (حشو 22·32·14 · عنوان 22 Bold + إغلاق 36) ثابت، والمحتوى بتمرير داخلي (حشو 4·32·24 · مسافة 16)،
// والأزرار ثابتة تحت (حشو 16·32 · خط #E7EAE8): «نشر الخدمة» مميز + «حفظ كمسودة» يمين و«إلغاء» شمال.
// الأقسام: الخدمة ← المنتجات (لكل منتج: الوصف والخصائص · الصور · المواصفات الفنية · الضمان · السعر لكل فرع) ← التنفيذ والقنوات ← ظهور الأسعار.
// السعر: تبويب لكل فرع مختار · الهامش يُحسب فوراً · «قبل الضريبة» = السعر ÷ 1.15 (القسم 2.4).

type Tri = [string, string, string];
type PriceValues = { cost: Tri; sale: Tri; b2b: Tri };
const emptyTri = (): Tri => ["", "", ""];
const emptyPrice = (): PriceValues => ({
  cost: emptyTri(),
  sale: emptyTri(),
  b2b: emptyTri(),
});
const digits = (s: string) => s.replace(/\D/g, "");
const toNum = (s: string) => Number(digits(s)) || 0;

const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "اختر المنتج المعتمد"),
  tier: z.string().optional(),
  description: z.string().trim().min(1, "اكتب الوصف للعميل"),
  features: z.array(z.string()),
  featureOpts: z.array(z.string()),
  includes: z.array(z.string()),
  includeOpts: z.array(z.string()),
  photos: z.number(),
  specs: z.record(z.string(), z.string()),
  extraSpecs: z.array(z.object({ label: z.string(), value: z.string() })),
  showAllSpecs: z.boolean(),
  warrantyBy: z.string(),
  warrantyYears: z.string(),
  covers: z.array(z.string()),
  coverOpts: z.array(z.string()),
  terms: z.array(z.string()),
  termOpts: z.array(z.string()),
  notCovered: z.string(),
  linkarCert: z.boolean(),
  consent: z.boolean(),
  reminder: z.string(),
  prices: z.record(
    z.string(),
    z.object({
      cost: z.array(z.string()),
      sale: z.array(z.string()),
      b2b: z.array(z.string()),
    }),
  ),
});
const schema = z
  .object({
    name: z.string().trim().min(1, "اكتب اسم الخدمة كما يراه العميل"),
    category: z.string().min(1, "اختر التصنيف"),
    branchIds: z.array(z.string()).min(1, "اختر فرعاً واحداً على الأقل"),
    products: z.array(productSchema).min(1),
    duration: z.string().min(1, "اختر مدة التنفيذ"),
    channels: z.object({
      customers: z.boolean(),
      b2b: z.boolean(),
      marketers: z.boolean(),
      marketerPct: z.string(),
    }),
    visibility: z.record(z.string(), z.object({ sale: z.boolean(), cost: z.boolean() })),
    visibilityBranchIds: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (v.channels.marketers && !(toNum(v.channels.marketerPct) > 0 && toNum(v.channels.marketerPct) < 100))
      ctx.addIssue({
        code: "custom",
        path: ["channels", "marketerPct"],
        message: "نسبة من 1 إلى 99",
      });
    v.products.forEach((p, i) =>
      v.branchIds.forEach((b) => {
        const pr = p.prices[b] ?? emptyPrice();
        for (let k = 0; k < 3; k++) {
          const cost = toNum(pr.cost[k]),
            sale = toNum(pr.sale[k]),
            b2b = toNum(pr.b2b[k]);
          if (!cost)
            ctx.addIssue({
              code: "custom",
              path: ["products", i, "prices", b, "cost", k],
              message: "أدخل سعر التكلفة",
            });
          if (!sale)
            ctx.addIssue({
              code: "custom",
              path: ["products", i, "prices", b, "sale", k],
              message: "أدخل سعر البيع",
            });
          else if (cost && sale <= cost)
            ctx.addIssue({
              code: "custom",
              path: ["products", i, "prices", b, "sale", k],
              message: "سعر البيع أكبر من التكلفة",
            });
          if (!b2b)
            ctx.addIssue({
              code: "custom",
              path: ["products", i, "prices", b, "b2b", k],
              message: "أدخل سعر الوكالات",
            });
        }
      }),
    );
  });
type FormValues = z.infer<typeof schema>;
type ProductValues = FormValues["products"][number];

const SPEC_KEYS = Object.keys(SPEC_LABELS) as SpecKey[];
const emptySpecs = (): Record<SpecKey, string> => Object.fromEntries(SPEC_KEYS.map((k) => [k, ""])) as Record<SpecKey, string>;
const uniq = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])];

function newProduct(n: number): ProductValues {
  return {
    id: `new-${Date.now().toString(36)}-${n}`,
    name: "",
    description: "",
    features: [],
    featureOpts: [...TAGS.features],
    includes: [],
    includeOpts: [...TAGS.includes],
    photos: 0,
    specs: emptySpecs(),
    extraSpecs: [],
    showAllSpecs: true,
    warrantyBy: WARRANTY_BY[0],
    warrantyYears: "",
    covers: [],
    coverOpts: [...TAGS.covers],
    terms: [],
    termOpts: [...TAGS.terms],
    notCovered: "",
    linkarCert: true,
    consent: true,
    reminder: REMINDERS[2],
    prices: {},
  };
}
const fromProduct = (p: ServiceProduct): ProductValues => ({
  ...p,
  featureOpts: uniq(TAGS.features, p.features),
  includeOpts: uniq(TAGS.includes, p.includes),
  coverOpts: uniq(TAGS.covers, p.covers),
  termOpts: uniq(TAGS.terms, p.terms),
  warrantyYears: p.warrantyYears ? String(p.warrantyYears) : "",
  prices: Object.fromEntries(
    Object.entries(p.prices).map(([b, x]) => [
      b,
      {
        cost: x.cost.map(String) as Tri,
        sale: x.sale.map(String) as Tri,
        b2b: x.b2b.map(String) as Tri,
      },
    ]),
  ),
});
const toInput = (v: FormValues): ServiceInput => ({
  name: v.name.trim(),
  category: v.category,
  branchIds: v.branchIds,
  duration: v.duration,
  channels: { ...v.channels, marketerPct: toNum(v.channels.marketerPct) },
  visibility: v.visibility,
  visibilityBranchIds: v.visibilityBranchIds,
  products: v.products.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    description: p.description.trim(),
    features: p.features,
    includes: p.includes,
    photos: p.photos,
    specs: { ...emptySpecs(), ...p.specs },
    extraSpecs: p.extraSpecs.filter((x) => x.label.trim() && x.value.trim()),
    showAllSpecs: p.showAllSpecs,
    warrantyBy: p.warrantyBy,
    warrantyYears: toNum(p.warrantyYears),
    covers: p.covers,
    terms: p.terms,
    notCovered: p.notCovered.trim(),
    linkarCert: p.linkarCert,
    consent: p.consent,
    reminder: p.reminder,
    prices: Object.fromEntries(
      v.branchIds.map((b) => {
        const pr = p.prices[b] ?? emptyPrice();
        const t = (a: string[]) => a.map(toNum) as [number, number, number];
        return [b, { cost: t(pr.cost), sale: t(pr.sale), b2b: t(pr.b2b) }];
      }),
    ),
  })),
});

export function ServiceFormModal({ profile, branches, service, onClose }: { profile: ProviderProfile; branches: ProviderBranch[]; service?: Service; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const pid = profile.provider.id;
  const users = useQuery({
    queryKey: ["providers", "users", pid],
    queryFn: () => api.profile.users(pid),
  });
  const approved = branches.filter((b) => b.status === "approved");
  const edit = !!service;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: service
      ? {
          name: service.name,
          category: service.category,
          branchIds: service.branchIds,
          products: service.products.map(fromProduct),
          duration: service.duration,
          channels: {
            ...service.channels,
            marketerPct: String(service.channels.marketerPct),
          },
          visibility: service.visibility,
          visibilityBranchIds: service.visibilityBranchIds,
        }
      : {
          name: "",
          category: "",
          branchIds: approved.map((b) => b.id),
          products: [newProduct(1)],
          duration: "",
          channels: {
            customers: true,
            b2b: true,
            marketers: true,
            marketerPct: "5",
          },
          visibility: {},
          visibilityBranchIds: approved.map((b) => b.id),
        },
  });
  // الافتراضي لظهور الأسعار: المالك والمديرون يشوفوا الاتنين، والفنيون سعر البيع بس
  useEffect(() => {
    if (!edit && users.data && !Object.keys(form.getValues("visibility")).length)
      form.setValue("visibility", Object.fromEntries(users.data.map((u) => [u.id, { sale: true, cost: u.kind !== "technician" }])));
  }, [edit, users.data, form]);

  const [open, setOpen] = useState(0);
  const [priceTab, setPriceTab] = useState<string>("");
  const done = (msg: [string, string]) => {
    qc.invalidateQueries({ queryKey: ["providers"] });
    onClose();
    toast(...msg);
  };
  const save = useMutation({
    mutationFn: async ({ v, publish }: { v: FormValues; publish: boolean }) => {
      if (service) await api.services.update(service.id, toInput(v));
      else await api.services.create(pid, toInput(v), publish);
    },
    onSuccess: (_r, { v, publish }) =>
      done(
        service ? ["حُفظت التعديلات", `حُفظت تعديلات ${v.name.trim()}`] : publish ? ["نُشرت الخدمة", `نُشرت الخدمة الجديدة لدى ${profile.provider.name}`] : ["مسودة الخدمة", "حُفظت الخدمة الجديدة كمسودة"],
      ),
    onError: () => toast("تعذّر الحفظ", "تعذّر حفظ الخدمة، حاول مرة أخرى"),
  });
  const busy = save.isPending;

  const onInvalid = (e: FieldErrors<FormValues>) => {
    // افتح أول منتج فيه خطأ وروح لأول فرع ناقص سعره
    const i = Array.isArray(e.products) ? e.products.findIndex(Boolean) : -1;
    if (i >= 0) {
      setOpen(i);
      const pe = (e.products as unknown as Record<string, unknown>[])[i] as { prices?: Record<string, unknown> } | undefined;
      const b = pe?.prices ? Object.keys(pe.prices)[0] : undefined;
      if (b) setPriceTab(b);
    }
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-svc-form] [aria-invalid=true]")?.focus());
  };
  const publish = form.handleSubmit((v) => save.mutate({ v, publish: true }), onInvalid);
  const draft = async () => {
    if (await form.trigger("name")) save.mutate({ v: form.getValues(), publish: false });
  };
  const tryClose = () => {
    if (busy) return;
    if (form.formState.isDirty && !confirm("تجاهل التعديلات غير المحفوظة؟")) return;
    onClose();
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && tryClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content
          dir="rtl"
          data-svc-form
          onOpenAutoFocus={keepFocusQuiet}
          className="fixed inset-0 z-50 flex flex-col bg-white focus:outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(840px,calc(100vh-32px))] sm:w-[min(1240px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[20px]"
        >
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3.5 sm:px-8 sm:pt-[22px]">
            <Dialog.Title className="text-[22px] leading-[42px] font-bold text-ink">{edit ? "تعديل الخدمة" : "إضافة خدمة"}</Dialog.Title>
            <Dialog.Description className="sr-only">{edit ? service?.name : `إضافة خدمة لـ${profile.provider.name}`}</Dialog.Description>
            <button
              type="button"
              onClick={tryClose}
              aria-label="إغلاق"
              className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()} noValidate className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-1 pb-6 sm:px-8">
              <ServiceCard branches={branches} />
              <ProductsCard open={open} setOpen={setOpen} edit={edit} branches={branches} priceTab={priceTab} setPriceTab={setPriceTab} />
              <ChannelsCard
                users={users.data ?? []}
                branches={approved}
                durations={service && !DURATIONS.includes(service.duration as (typeof DURATIONS)[number]) ? [service.duration, ...DURATIONS] : [...DURATIONS]}
              />
            </form>
          </FormProvider>
          <div className="flex flex-wrap items-center gap-2.5 border-t border-[#e7eae8] px-4 py-4 sm:px-8">
            <Button variant="accent" className="h-11 px-4" loading={busy && save.variables?.publish !== false} disabled={busy} onClick={publish}>
              {edit ? "حفظ التعديلات" : "نشر الخدمة"}
              {edit ? null : <Icon name="check" size={16} />}
            </Button>
            {edit ? null : (
              <Button variant="secondary" className="h-[46px] px-4" loading={busy && save.variables?.publish === false} disabled={busy} onClick={draft}>
                حفظ كمسودة
              </Button>
            )}
            <Button variant="secondary" className="ms-auto h-[46px] px-4" onClick={tryClose} disabled={busy}>
              إلغاء
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ───────────── قطع مشتركة ─────────────
/** بطاقة داخل النافذة: بيضا r16 · حشو 20 · مسافة 14 · عنوان 18 Bold */
function SCard({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-3.5 rounded-16 bg-white p-0 sm:p-5 ${className ?? ""}`}>
      {title ? <h3 className="text-18 leading-7 font-bold text-ink">{title}</h3> : null}
      {children}
    </section>
  );
}
const IN = "[&_input]:text-14! [&_input]:font-normal!";
const SEL = "[&>span]:text-14! [&>span]:font-normal!";
const err = (errors: FieldErrors<FormValues>, path: string) => (get(errors, path) as { message?: string } | undefined)?.message;

/** شريحة اختيار (34 · r999 · حشو 6·12): المختارة #F7FBE9 بإطار كحلي + ✓ و13 SemiBold · غير المختارة بيضا بإطار و13 Regular */
function TagChip({ on, onClick, children, disabled }: { on: boolean; onClick?: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-13 leading-5 text-ink disabled:cursor-not-allowed ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white font-normal hover:bg-surface-1"}`}
    >
      {on ? <Icon name="check" size={14} className="shrink-0" /> : null}
      {children}
    </button>
  );
}
/** شريحة «+ …» (خاصية · بند · مواصفة · إضافة منتج): بيضا بإطار · + أخضر 14 + نص 13 Medium أخضر */
function AddChip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[34px] items-center gap-1 rounded-full border border-border bg-white px-3 text-13 leading-5 font-medium text-success hover:bg-surface-1"
    >
      <Icon name="plus" size={14} className="shrink-0 text-[#3bb34b]" />
      {children}
    </button>
  );
}

/** مجموعة وسوم قابلة للإضافة (الخصائص · تشمل الخدمة · ما يغطيه الضمان · شروط الضمان) */
function TagGroup({
  label,
  value,
  options,
  onChange,
  onOptions,
  addLabel,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (v: string[]) => void;
  onOptions: (v: string[]) => void;
  addLabel: string;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t) {
      if (!options.includes(t)) onOptions([...options, t]);
      if (!value.includes(t)) onChange([...value, t]);
    }
    setText("");
    setAdding(false);
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-12 leading-5 font-medium text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <TagChip key={o} on={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}>
              {o}
            </TagChip>
          );
        })}
        {adding ? (
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
              if (e.key === "Escape") {
                setText("");
                setAdding(false);
              }
            }}
            aria-label={`${addLabel} جديد`}
            className="h-[34px] w-44 rounded-full border border-ink px-3 text-13 text-ink outline-none"
          />
        ) : (
          <AddChip onClick={() => setAdding(true)}>{addLabel}</AddChip>
        )}
      </div>
    </fieldset>
  );
}

/** مفتاح v2 (44×24 · المقبض 20): شغّال كحلي بمقبض أخضر فاتح على الشمال · مطفي #D9DEDB بمقبض أبيض على اليمين */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "justify-end bg-ink" : "justify-start bg-border"}`}
    >
      <span aria-hidden className={`size-5 rounded-full ${checked ? "bg-lime" : "bg-white"}`} />
    </button>
  );
}
function ToggleRow({ label, checked, onChange, children }: { label: string; checked: boolean; onChange: (v: boolean) => void; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-13 leading-5 font-medium text-ink">{label}</span>
      {children}
      <span className="flex-1" />
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ───────────── الخدمة ─────────────
function ServiceCard({ branches }: { branches: ProviderBranch[] }) {
  const { register, control, formState } = useFormContext<FormValues>();
  const e = formState.errors;
  return (
    <SCard>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="اسم الخدمة كما يراه العميل" error={e.name?.message}>
          {(id) => <TextInput id={id} {...register("name")} placeholder="Johnson Ceramic Pro Gold" invalid={!!e.name} className={IN} />}
        </Field>
        <Field label="التصنيف" error={e.category?.message}>
          {(id) => (
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select id={id} value={field.value} onChange={field.onChange} options={SERVICE_TYPES.map((t) => ({ value: t, label: t }))} invalid={!!e.category} className={SEL} />
              )}
            />
          )}
        </Field>
      </div>
      <Controller
        control={control}
        name="branchIds"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-12 leading-5 font-medium text-muted">الفروع</legend>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => {
                const on = field.value.includes(b.id);
                const pending = b.status !== "approved";
                return (
                  <TagChip key={b.id} on={on && !pending} disabled={pending} onClick={() => field.onChange(on ? field.value.filter((x) => x !== b.id) : [...field.value, b.id])}>
                    فرع {b.name}
                    {pending ? " · بانتظار الزيارة" : ""}
                  </TagChip>
                );
              })}
            </div>
            {e.branchIds ? (
              <p role="alert" className="text-12 text-danger">
                {e.branchIds.message}
              </p>
            ) : null}
          </fieldset>
        )}
      />
    </SCard>
  );
}

// ───────────── المنتجات المعتمدة داخل الخدمة ─────────────
const layersWord = (l: string) => (l === "1" ? "طبقة واحدة" : l === "2" ? "طبقتان" : l ? `${l} طبقات` : "");
function ProductsCard({
  open,
  setOpen,
  edit,
  branches,
  priceTab,
  setPriceTab,
}: {
  open: number;
  setOpen: (i: number) => void;
  edit: boolean;
  branches: ProviderBranch[];
  priceTab: string;
  setPriceTab: (b: string) => void;
}) {
  const { control, formState } = useFormContext<FormValues>();
  const arr = useFieldArray({ control, name: "products", keyName: "key" });
  const products = useWatch({ control, name: "products" });
  const branchIds = useWatch({ control, name: "branchIds" });
  const e = formState.errors;
  return (
    <SCard title="المنتجات المعتمدة داخل الخدمة">
      {arr.fields.map((f, i) => {
        const p = products[i] ?? f;
        const expanded = open === i;
        const first = branchIds[0];
        const pr = first ? p.prices[first] : undefined;
        const parts = [p.tier, p.name || "منتج جديد", layersWord(p.specs.layers ?? ""), p.warrantyYears ? `ضمان ${warrantyLabel(+p.warrantyYears)}` : ""].filter(Boolean);
        const priceLine = pr && toNum(pr.cost[0]) && toNum(pr.sale[0]) ? ` · سيدان: تكلفة ${num(toNum(pr.cost[0]))} · بيع ${num(toNum(pr.sale[0]))}` : "";
        const hasErr = !!get(e, `products.${i}`);
        return (
          <div key={f.key} className={`flex flex-col rounded-14 ${expanded ? "gap-3 bg-[#f6f8f7] p-3 sm:p-4" : `border px-4 py-3.5 ${hasErr ? "border-danger" : "border-border"}`}`}>
            <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : i)} className="flex items-center gap-2 text-start">
              <span className="min-w-0 flex-1 text-16 leading-[30px] text-ink">
                <span className="font-bold">المنتج {i + 1}</span>
                <span className={edit ? "font-bold" : "font-normal"}> · </span>
                <bdi className={edit ? "font-bold" : "font-normal"}>
                  {edit ? parts.join(" · ") : p.name || "منتج جديد"}
                  {edit && !expanded ? priceLine : ""}
                </bdi>
              </span>
              {arr.fields.length > 1 ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`حذف المنتج ${i + 1}`}
                  title="حذف المنتج"
                  onClick={(ev) => (ev.stopPropagation(), arr.remove(i), setOpen(0))}
                  onKeyDown={(ev) => ev.key === "Enter" && (ev.stopPropagation(), arr.remove(i), setOpen(0))}
                  className="flex size-7 items-center justify-center rounded-8 text-muted hover:bg-white hover:text-danger"
                >
                  <Icon name="trash" size={16} />
                </span>
              ) : null}
              <Icon name="chevron-down" size={16} className={`shrink-0 text-ink transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded ? <ProductBody i={i} branches={branches} priceTab={priceTab} setPriceTab={setPriceTab} /> : null}
          </div>
        );
      })}
      <div className="flex">
        <AddChip
          onClick={() => {
            arr.append(newProduct(arr.fields.length + 1));
            setOpen(arr.fields.length);
          }}
        >
          إضافة منتج
        </AddChip>
      </div>
    </SCard>
  );
}

function ProductBody({ i, branches, priceTab, setPriceTab }: { i: number; branches: ProviderBranch[]; priceTab: string; setPriceTab: (b: string) => void }) {
  const { control, register, setValue, getValues, formState } = useFormContext<FormValues>();
  const e = formState.errors;
  const p = useWatch({ control, name: `products.${i}` });
  const base = `products.${i}` as const;
  const cert = APPROVED_PRODUCTS.find((x) => x.name === p.name)?.cert;
  const pick = (name: string) => {
    const ref = APPROVED_PRODUCTS.find((x) => x.name === name);
    const cur = getValues(`${base}.specs`);
    setValue(`${base}.name`, name, {
      shouldDirty: true,
      shouldValidate: !!get(e, `${base}.name`),
    });
    setValue(
      `${base}.specs`,
      {
        ...emptySpecs(),
        layers: cur.layers || "2",
        thickness: cur.thickness || "2 – 3",
        prep: cur.prep || "تصحيح خفيف",
        ...ref?.specs,
        approved: name,
        company: ref?.company ?? "",
      },
      { shouldDirty: true },
    );
  };
  const locked = (k: SpecKey, lock = true) => (
    <Field label={k === "company" ? "الشركة · المنشأ" : SPEC_LABELS[k]}>
      {(id) => (
        <div id={id} aria-readonly className="flex h-11 items-center gap-2 rounded-10 border border-border bg-surface-1 px-3 text-14 text-ink">
          <bdi className="min-w-0 flex-1 truncate">{p.specs[k] || "—"}</bdi>
          {lock ? <Icon name="lock" size={16} className="shrink-0" /> : null}
        </div>
      )}
    </Field>
  );
  return (
    <>
      {/* الوصف والخصائص */}
      <SCard title="الوصف والخصائص" className="p-4!">
        <Field label="الوصف للعميل" error={err(e, `${base}.description`)}>
          {(id) => (
            <textarea
              id={id}
              {...register(`${base}.description`)}
              aria-invalid={!!err(e, `${base}.description`) || undefined}
              rows={2}
              className={`h-[72px] w-full resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink ${err(e, `${base}.description`) ? "border-danger" : "border-border"}`}
            />
          )}
        </Field>
        <TagGroup
          label="الخصائص"
          value={p.features}
          options={p.featureOpts}
          onChange={(v) => setValue(`${base}.features`, v, { shouldDirty: true })}
          onOptions={(v) => setValue(`${base}.featureOpts`, v)}
          addLabel="خاصية"
        />
        <TagGroup
          label="تشمل الخدمة"
          value={p.includes}
          options={p.includeOpts}
          onChange={(v) => setValue(`${base}.includes`, v, { shouldDirty: true })}
          onOptions={(v) => setValue(`${base}.includeOpts`, v)}
          addLabel="بند"
        />
        <div className="flex flex-col gap-2">
          <span className="text-12 leading-5 font-medium text-muted">صور الخدمة</span>
          <div className="flex min-h-[100px] flex-wrap items-center gap-2.5">
            <label className="flex h-[72px] w-[150px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-10 border border-border bg-white hover:bg-surface-1">
              <Icon name="download" size={18} className="text-ink" />
              <span className="text-12 leading-[18px] font-medium text-ink">أضف صوراً · حتى 8</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(ev) => (setValue(`${base}.photos`, Math.min(8, p.photos + (ev.target.files?.length ?? 0)), { shouldDirty: true }), (ev.target.value = ""))}
              />
            </label>
            {Array.from({ length: p.photos }, (_, k) => (
              <span key={k} className="group relative h-[72px] w-24 rounded-10 bg-[#dfe6e2]">
                <button
                  type="button"
                  aria-label={`حذف الصورة ${k + 1}`}
                  onClick={() =>
                    setValue(`${base}.photos`, p.photos - 1, {
                      shouldDirty: true,
                    })
                  }
                  className="absolute top-1 left-1 hidden size-6 items-center justify-center rounded-full bg-white text-ink group-hover:flex"
                >
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </SCard>

      {/* المواصفات الفنية — حقول ديناميكية من تعريف التصنيف، وأغلبها تلقائي من المنتج المعتمد (مقفول) */}
      <SCard title="المواصفات الفنية" className="p-4!">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="المنتج المعتمد" error={err(e, `${base}.name`)}>
            {(id) => (
              <Select
                id={id}
                value={p.name}
                onChange={pick}
                options={APPROVED_PRODUCTS.map((x) => ({
                  value: x.name,
                  label: x.name,
                }))}
                invalid={!!err(e, `${base}.name`)}
                className={SEL}
              />
            )}
          </Field>
          {locked("company", false)}
          {locked("layers")}
          {locked("hardness")}
          <Field label={SPEC_LABELS.thickness}>{(id) => <TextInput id={id} {...register(`${base}.specs.thickness`)} className={`bg-surface-1! ${IN}`} />}</Field>
          {locked("finish")}
          {locked("cure")}
          {locked("prep")}
        </div>
        {p.extraSpecs.map((x, k) => (
          <div key={k} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TextInput aria-label="اسم المواصفة" {...register(`${base}.extraSpecs.${k}.label`)} placeholder="اسم المواصفة" className={IN} />
            <TextInput aria-label="القيمة" {...register(`${base}.extraSpecs.${k}.value`)} placeholder="القيمة" className={IN} />
            <Button
              variant="ghost"
              size="S"
              className="self-center justify-self-start text-danger!"
              onClick={() =>
                setValue(
                  `${base}.extraSpecs`,
                  p.extraSpecs.filter((_, j) => j !== k),
                  { shouldDirty: true },
                )
              }
            >
              حذف
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <AddChip onClick={() => setValue(`${base}.extraSpecs`, [...p.extraSpecs, { label: "", value: "" }], { shouldDirty: true })}>مواصفة</AddChip>
          {cert ? <span className="inline-flex h-6 items-center rounded-full bg-success-tint px-2.5 text-12 leading-[18px] font-medium text-success">{cert}</span> : null}
        </div>
        <ToggleRow label="إظهار كل المواصفات للعميل" checked={p.showAllSpecs} onChange={(v) => setValue(`${base}.showAllSpecs`, v, { shouldDirty: true })} />
      </SCard>

      {/* الضمان */}
      <SCard title="الضمان" className="p-4!">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="مدة الضمان">
            {(id) => (
              <Select
                id={id}
                value={p.warrantyYears}
                onChange={(v) => setValue(`${base}.warrantyYears`, v, { shouldDirty: true })}
                options={[
                  { value: "", label: "بدون ضمان" },
                  ...WARRANTY_YEARS.map((y) => ({
                    value: String(y),
                    label: warrantyLabel(y),
                  })),
                ]}
                className={SEL}
              />
            )}
          </Field>
          <Field label="جهة الضمان">
            {(id) => (
              <Select
                id={id}
                value={p.warrantyBy}
                onChange={(v) => setValue(`${base}.warrantyBy`, v, { shouldDirty: true })}
                options={WARRANTY_BY.map((w) => ({ value: w, label: w }))}
                className={SEL}
              />
            )}
          </Field>
        </div>
        <TagGroup
          label="ما يغطيه الضمان"
          value={p.covers}
          options={p.coverOpts}
          onChange={(v) => setValue(`${base}.covers`, v, { shouldDirty: true })}
          onOptions={(v) => setValue(`${base}.coverOpts`, v)}
          addLabel="بند ضمان"
        />
        <TagGroup
          label="شروط الضمان"
          value={p.terms}
          options={p.termOpts}
          onChange={(v) => setValue(`${base}.terms`, v, { shouldDirty: true })}
          onOptions={(v) => setValue(`${base}.termOpts`, v)}
          addLabel="شرط"
        />
        <Field label="ما لا يغطيه">
          {(id) => (
            <textarea
              id={id}
              {...register(`${base}.notCovered`)}
              rows={2}
              className="h-[60px] w-full resize-none rounded-10 border border-border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink"
            />
          )}
        </Field>
        <div className="flex flex-col gap-2.5 rounded-12 border border-[#cfe8a0] bg-lime-tint p-3.5">
          <h4 className="text-14 leading-[22px] font-semibold text-ink">ضمان لينكار المزدوج</h4>
          <ToggleRow label="إصدار شهادة ضمان لينكار مع الفاتورة" checked={p.linkarCert} onChange={(v) => setValue(`${base}.linkarCert`, v, { shouldDirty: true })} />
          <ToggleRow label="موافقة العميل على شروط الضمان عند الحجز" checked={p.consent} onChange={(v) => setValue(`${base}.consent`, v, { shouldDirty: true })} />
          <Field label="تذكير الصيانة الدورية للعميل">
            {(id) => (
              <Select id={id} value={p.reminder} onChange={(v) => setValue(`${base}.reminder`, v, { shouldDirty: true })} options={REMINDERS.map((r) => ({ value: r, label: r }))} className={SEL} />
            )}
          </Field>
        </div>
      </SCard>

      <PriceCard i={i} branches={branches} tab={priceTab} setTab={setPriceTab} />
    </>
  );
}

// ───────────── السعر حسب حجم السيارة · لكل فرع ─────────────
// تبويب لكل فرع مختار (شرائح 34) · شبكة: الحجم (110) · سعر التكلفة · سعر البيع · هامش لينكار (رمادي #F4F6F5 بنص أخضر) · سعر الوكالات — كل خلية 50 · r8 · حشو 6·10
// والسطر الصغير «قبل الضريبة …» 11 Regular رمادي
function PriceCard({ i, branches, tab, setTab }: { i: number; branches: ProviderBranch[]; tab: string; setTab: (b: string) => void }) {
  const { control, setValue, getValues, formState } = useFormContext<FormValues>();
  const e = formState.errors;
  const branchIds = useWatch({ control, name: "branchIds" });
  const prices = useWatch({ control, name: `products.${i}.prices` });
  const selected = branches.filter((b) => branchIds.includes(b.id));
  const active = selected.some((b) => b.id === tab) ? tab : selected[0]?.id;
  if (!active) return null;
  const pr = prices[active] ?? emptyPrice();
  const set = (kind: keyof PriceValues, k: number, raw: string) => {
    const cur = getValues(`products.${i}.prices.${active}`) ?? emptyPrice();
    const next = {
      ...cur,
      [kind]: cur[kind].map((x, j) => (j === k ? digits(raw).slice(0, 6) : x)) as Tri,
    };
    setValue(`products.${i}.prices.${active}`, next, {
      shouldDirty: true,
      shouldValidate: formState.isSubmitted,
    });
  };
  const copyFrom = selected.find((b) => b.id !== active && prices[b.id] && prices[b.id].sale.some(Boolean));
  const cell = (kind: keyof PriceValues, k: number, label: string) => {
    const path = `products.${i}.prices.${active}.${kind}.${k}`;
    const msg = err(e, path);
    const v = pr[kind][k];
    return (
      <label className={`flex h-[50px] flex-col justify-center rounded-8 border bg-white px-2.5 focus-within:border-ink ${msg ? "border-danger" : "border-border"}`} title={msg}>
        <span className="flex items-center gap-1 text-13 leading-5 text-ink">
          <input
            value={v ? num(toNum(v)) : ""}
            onChange={(ev) => set(kind, k, ev.target.value)}
            inputMode="numeric"
            aria-label={`${label} · ${SIZE_LABELS[k].replace("‏", "")}`}
            aria-invalid={!!msg || undefined}
            placeholder="0"
            dir="ltr"
            className="num w-0 min-w-0 flex-1 bg-transparent text-right outline-none placeholder:text-muted"
          />
          <span className="shrink-0">ر.س</span>
        </span>
        <span className="num text-[11px] leading-4 text-muted">{msg ?? (v ? `قبل الضريبة ${num(beforeVatOf(toNum(v)), 2)}` : "قبل الضريبة —")}</span>
      </label>
    );
  };
  return (
    <SCard title="السعر حسب حجم السيارة · لكل فرع" className="p-4!">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="الفرع">
        {selected.map((b) => {
          const bad = !!get(e, `products.${i}.prices.${b.id}`);
          return (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === active}
              onClick={() => setTab(b.id)}
              className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-13 leading-5 text-ink ${b.id === active ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white"}`}
            >
              فرع {b.name}
              {bad ? <span aria-label="ناقص" className="size-1.5 rounded-full bg-danger" /> : null}
            </button>
          );
        })}
        {copyFrom && !pr.sale.some(Boolean) ? (
          <Button variant="link" className="ms-auto" onClick={() => setValue(`products.${i}.prices.${active}`, structuredClone(prices[copyFrom.id]), { shouldDirty: true })}>
            نسخ أسعار فرع {copyFrom.name}
          </Button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[720px] flex-col gap-2">
          <div className="grid grid-cols-[110px_repeat(4,minmax(0,1fr))] gap-2.5 text-12 leading-5 font-medium text-muted">
            <span>الحجم</span>
            <span>سعر التكلفة (للمزوّد) · شامل الضريبة</span>
            <span>سعر البيع للعميل · شامل الضريبة</span>
            <span>هامش لينكار</span>
            <span>سعر الوكالات (B2B) · شامل الضريبة</span>
          </div>
          {SIZE_LABELS.map((size, k) => {
            const cost = toNum(pr.cost[k]),
              sale = toNum(pr.sale[k]);
            const m = marginOf(sale, cost);
            const ok = !!(cost && sale);
            return (
              <div key={size} className="grid grid-cols-[110px_repeat(4,minmax(0,1fr))] items-center gap-2.5">
                <span className="text-13 leading-5 font-semibold text-ink">{size}</span>
                {cell("cost", k, "سعر التكلفة")}
                {cell("sale", k, "سعر البيع")}
                <div className="flex h-12 flex-col justify-center rounded-8 bg-surface-1 px-2.5" aria-live="polite">
                  <span className={`num text-13 leading-5 ${ok && m.value <= 0 ? "text-danger" : "text-success"}`}>
                    {ok ? `${num(m.value)} · ${Number.isInteger(m.pct) ? m.pct : m.pct.toFixed(1)}%` : "—"}
                  </span>
                  <span className="num text-[11px] leading-4 text-muted">{ok ? `قبل الضريبة ${num(beforeVatOf(m.value), 2)}` : "قبل الضريبة —"}</span>
                </div>
                {cell("b2b", k, "سعر الوكالات")}
              </div>
            );
          })}
        </div>
      </div>
    </SCard>
  );
}

// ───────────── التنفيذ والقنوات + ظهور الأسعار ─────────────
function ChannelsCard({ users, branches, durations }: { users: { id: string; name: string; role: string }[]; branches: ProviderBranch[]; durations: string[] }) {
  const { control, register, setValue, formState } = useFormContext<FormValues>();
  const e = formState.errors;
  const ch = useWatch({ control, name: "channels" });
  const vis = useWatch({ control, name: "visibility" });
  const vb = useWatch({ control, name: "visibilityBranchIds" });
  const setVis = (u: string, k: "sale" | "cost", v: boolean) => setValue("visibility", { ...vis, [u]: { ...(vis[u] ?? { sale: false, cost: false }), [k]: v } }, { shouldDirty: true });
  return (
    <SCard title="التنفيذ والقنوات">
      <Field label="مدة التنفيذ" error={e.duration?.message}>
        {(id) => (
          <Controller
            control={control}
            name="duration"
            render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={durations.map((d) => ({ value: d, label: d }))} invalid={!!e.duration} className={SEL} />}
          />
        )}
      </Field>
      <div className="flex flex-col gap-2.5">
        <ToggleRow label="العملاء · الموقع والتطبيق" checked={ch.customers} onChange={(v) => setValue("channels.customers", v, { shouldDirty: true })} />
        <ToggleRow label="الوكالات (B2B)" checked={ch.b2b} onChange={(v) => setValue("channels.b2b", v, { shouldDirty: true })} />
        <ToggleRow label="المسوّقون · نسبة المسوّق" checked={ch.marketers} onChange={(v) => setValue("channels.marketers", v, { shouldDirty: true })}>
          {ch.marketers ? (
            <span
              className={`flex h-9 w-24 items-center gap-1 rounded-10 border bg-white px-3 text-14 text-ink ${e.channels?.marketerPct ? "border-danger" : "border-border"}`}
              title={e.channels?.marketerPct?.message}
            >
              <input
                {...register("channels.marketerPct", {
                  setValueAs: (v: string) => digits(v).slice(0, 2),
                })}
                inputMode="numeric"
                aria-label="نسبة المسوّق"
                aria-invalid={!!e.channels?.marketerPct || undefined}
                className="num w-0 min-w-0 flex-1 bg-transparent outline-none"
              />
              <span>%</span>
            </span>
          ) : null}
        </ToggleRow>
      </div>
      <div className="flex flex-col gap-2 rounded-12 bg-surface-1 p-3.5">
        <h4 className="text-14 leading-[22px] font-semibold text-ink">ظهور الأسعار لمستخدمي مقدّم الخدمة</h4>
        <div className="overflow-x-auto">
          <div className="min-w-[440px]">
            <div className="grid grid-cols-[minmax(160px,260px)_120px_120px_1fr] gap-3 pb-1 text-12 leading-5 font-medium text-muted">
              <span className="text-13">المستخدم</span>
              <span>سعر التكلفة</span>
              <span>سعر البيع</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className="grid grid-cols-[minmax(160px,260px)_120px_120px_1fr] items-center gap-3 border-b border-[#e3e7e5] py-1.5">
                <span className="flex flex-col">
                  <span className="text-13 leading-5 font-semibold text-ink">{u.name}</span>
                  <span className="text-12 leading-[18px] font-light text-muted">{u.role}</span>
                </span>
                <Toggle checked={!!vis[u.id]?.cost} onChange={(v) => setVis(u.id, "cost", v)} label={`سعر التكلفة · ${u.name}`} />
                <Toggle checked={!!vis[u.id]?.sale} onChange={(v) => setVis(u.id, "sale", v)} label={`سعر البيع · ${u.name}`} />
              </div>
            ))}
          </div>
        </div>
        <Field label="الفروع">
          {(id) => <MultiSelect id={id} value={vb} onChange={(v) => setValue("visibilityBranchIds", v, { shouldDirty: true })} options={branches.map((b) => ({ value: b.id, label: b.name }))} />}
        </Field>
      </div>
    </SCard>
  );
}

/** قائمة اختيار متعدد بنفس شكل الحقل (44 · r10) — القيمة «الزهراء · الحمراء · المحمدية» */
function MultiSelect({ id, value, onChange, options }: { id?: string; value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
  const label = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(" · ");
  return (
    <Menu.Root dir="rtl" modal={false}>
      <Menu.Trigger id={id} className="group flex h-11 w-full items-center gap-2 rounded-10 border border-border bg-white px-3 text-14 text-ink outline-none data-[state=open]:border-ink">
        <span className={`min-w-0 flex-1 truncate text-start ${label ? "" : "font-light text-muted"}`}>{label || "اختر"}</span>
        <Icon name="chevron-down" size={16} className="shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="start" sideOffset={6} className="z-[70] flex w-[var(--radix-dropdown-menu-trigger-width)] flex-col gap-0.5 rounded-12 border border-border bg-white p-1.5 shadow-menu">
          {options.map((o) => (
            <Menu.CheckboxItem
              key={o.value}
              checked={value.includes(o.value)}
              onSelect={(ev) => ev.preventDefault()}
              onCheckedChange={(c) => onChange(c ? [...value, o.value] : value.filter((x) => x !== o.value))}
              className="flex min-h-[37px] cursor-pointer items-center justify-between gap-2.5 rounded-8 px-2.5 py-2 text-13 font-medium text-ink outline-none data-highlighted:bg-surface-1 data-[state=checked]:bg-lime-tint"
            >
              {o.label}
              <Menu.ItemIndicator>
                <Icon name="check" size={16} />
              </Menu.ItemIndicator>
            </Menu.CheckboxItem>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
