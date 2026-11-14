"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { CUSTOM_PERIOD, USAGE_LIMITS, packagePeriodLabel, pctOf, pctText, type CatalogItem, type Package, type PackageInput } from "@/lib/api/offers";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import { SIZE_LABELS, type Tri } from "@/lib/api/services";
import { num } from "@/lib/format";
import { DateField } from "../../../_components/form-bits";
import { BigModal, BranchChips, CELL_ALERT, CELL_CALC, IN, LOW_MARGIN, SCard, SEL, TagChip, ToggleRow } from "./bits";

// CON5-07M · باقة جديدة · جونسون (3260-207985) — ونفسها لـ«تعديل البيانات» من قائمة ⋯ في جدول الباقات.
// بيانات الباقة: (اسم الباقة · الفترة · الحد) ← الوصف للعميل (60) ← الفروع ← 3 مفاتيح القنوات
// الخدمات المشمولة: جدول بخانات اختيار (الخدمة · المنتج · التكلفة الحالية · سعر البيع الحالي · «ضمن الباقة» / «غير مختارة»)
// سعر الباقة حسب الحجم · لكل فرع: تبويب لكل فرع مختار · «مجموع المكوّنات» تلقائي (مجموع تكلفة المختار) · التكلفة والبيع والوكالات تُكتب يدوياً · الهامش تلقائي.

type S3 = [string, string, string];
type PriceV = { cost: S3; sale: S3; b2b: S3 };
const PRESET = { key: "permanent", from: "2026-11-01" };
const digits = (s: string) => s.replace(/\D/g, "");
const toNum = (s: string) => Number(digits(s)) || 0;
const emptyPrice = (): PriceV => ({ cost: ["", "", ""], sale: ["", "", ""], b2b: ["", "", ""] });

const schema = z
  .object({
    name: z.string().trim().min(1, "أدخل اسم الباقة للعملاء").max(80, "الاسم أطول من 80 حرفاً"),
    description: z.string().trim().min(1, "أدخل وصف الباقة للعميل").max(300, "الوصف أطول من 300 حرف"),
    usageLimit: z.string().min(1),
    period: z.string(),
    from: z.string().min(1, "اختر تاريخ البداية"),
    to: z.string(),
    branchIds: z.array(z.string()),
    channels: z.object({ customers: z.boolean(), b2b: z.boolean(), marketers: z.boolean() }),
    items: z.array(z.string()).min(2, "اختر خدمتين على الأقل"),
    prices: z.record(z.string(), z.object({ cost: z.array(z.string()), sale: z.array(z.string()), b2b: z.array(z.string()) })),
  })
  .superRefine((v, ctx) => {
    if (v.period === CUSTOM_PERIOD && v.to && v.to < v.from) ctx.addIssue({ code: "custom", path: ["to"], message: "تاريخ النهاية قبل البداية" });
    if (!v.channels.customers && !v.channels.b2b && !v.channels.marketers) ctx.addIssue({ code: "custom", path: ["channels"], message: "اختر قناة واحدة على الأقل" });
  });
type FormValues = z.infer<typeof schema>;

export function PackageFormModal({ profile, branches, pkg, onClose }: { profile: ProviderProfile; branches: ProviderBranch[]; pkg?: Package; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const pid = profile.provider.id;
  const approved = branches.filter((b) => b.status === "approved");
  const catalog = useQuery({ queryKey: ["providers", "offers", pid, "catalog"], queryFn: () => api.offers.catalog(pid) });
  const services = catalog.data ?? [];
  const edit = !!pkg;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: pkg
      ? {
          name: pkg.name,
          description: pkg.description,
          usageLimit: pkg.usageLimit,
          period: pkg.to ? CUSTOM_PERIOD : pkg.from === PRESET.from ? PRESET.key : CUSTOM_PERIOD,
          from: pkg.from,
          to: pkg.to ?? "",
          branchIds: pkg.branchIds,
          channels: pkg.channels,
          items: pkg.items.map((i) => i.serviceId),
          prices: Object.fromEntries(Object.entries(pkg.prices).map(([b, p]) => [b, { cost: p.cost.map(String), sale: p.sale.map(String), b2b: p.b2b.map(String) }])),
        }
      : {
          name: "",
          description: "",
          usageLimit: USAGE_LIMITS[1],
          period: PRESET.key,
          from: PRESET.from,
          to: "",
          branchIds: [],
          channels: { customers: true, b2b: true, marketers: false },
          items: [],
          prices: {},
        },
  });
  const { register, control, setValue, formState } = form;
  const e = formState.errors;
  const v = useWatch({ control }) as FormValues;
  const selBranches = v.branchIds?.length ? approved.filter((b) => v.branchIds.includes(b.id)) : approved;
  const [tabRaw, setTab] = useState("");
  const tab = selBranches.some((b) => b.id === tabRaw) ? tabRaw : (selBranches[0]?.id ?? "");
  const [priceError, setPriceError] = useState("");
  const chosen = services.filter((s) => (v.items ?? []).includes(s.serviceId));
  const price = (v.prices?.[tab] as PriceV | undefined) ?? emptyPrice();
  const sumCost = (i: number, b = tab) => chosen.reduce((t, s) => t + (s.prices[b]?.cost[i] ?? 0), 0);

  const setPrice = (k: keyof PriceV, i: number, val: string) => {
    const cur = (form.getValues(`prices.${tab}`) as PriceV | undefined) ?? emptyPrice();
    const next = { ...cur, [k]: cur[k].map((x, j) => (j === i ? val : x)) as S3 };
    setValue(`prices.${tab}`, next, { shouldDirty: true });
    setPriceError("");
  };

  /** كل فرع مختار لازم له تكلفة وبيع ووكالات لكل حجم، والبيع مش أقل من التكلفة */
  const checkPrices = (val: FormValues) => {
    for (const b of selBranches) {
      const p = val.prices[b.id] as PriceV | undefined;
      for (let i = 0; i < 3; i++) {
        if (!p || !toNum(p.cost[i]) || !toNum(p.sale[i]) || !toNum(p.b2b[i])) return { b: b.id, msg: `أكمل سعر الباقة لفرع ${b.name}` };
        if (toNum(p.sale[i]) < toNum(p.cost[i])) return { b: b.id, msg: `سعر البيع أقل من التكلفة في فرع ${b.name}` };
      }
    }
    return null;
  };
  const toInput = (val: FormValues): PackageInput => ({
    name: val.name.trim(),
    description: val.description.trim(),
    usageLimit: val.usageLimit,
    from: val.from,
    to: val.period === CUSTOM_PERIOD && val.to ? val.to : null,
    branchIds: val.branchIds,
    channels: val.channels,
    items: val.items.map((id) => ({ serviceId: id, productId: services.find((s) => s.serviceId === id)?.productId ?? "" })),
    prices: Object.fromEntries(
      selBranches.map((b) => {
        const p = (val.prices[b.id] as PriceV | undefined) ?? emptyPrice();
        return [b.id, { cost: p.cost.map(toNum) as Tri, sale: p.sale.map(toNum) as Tri, b2b: p.b2b.map(toNum) as Tri }];
      }),
    ),
  });

  const save = useMutation({
    mutationFn: async ({ val, schedule }: { val: FormValues; schedule: boolean }) => (pkg ? api.offers.updatePackage(pkg.id, toInput(val)) : api.offers.createPackage(pid, toInput(val), schedule)),
    onSuccess: (_r, { val, schedule }) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      onClose();
      const short = profile.provider.short ?? profile.provider.name;
      if (pkg) toast("حُفظت التعديلات", `حُفظت تعديلات ${val.name.trim()}`);
      else if (schedule) toast(`جُدولت الباقة · ${short}`, `جُدولت الباقة الجديدة لدى ${profile.provider.name}`);
      else toast(`مسودة الباقة · ${short}`, "حُفظت الباقة الجديدة كمسودة");
    },
    onError: () => toast("تعذّر الحفظ", "تعذّر حفظ الباقة، حاول مرة أخرى"),
  });
  const busy = save.isPending;
  const focusError = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-offer-form] [aria-invalid=true]")?.focus());
  const schedule = form.handleSubmit((val) => {
    const bad = checkPrices(val);
    if (bad) {
      setTab(bad.b);
      setPriceError(bad.msg);
      return focusError();
    }
    save.mutate({ val, schedule: true });
  }, focusError);
  const draft = async () => {
    if (await form.trigger("name")) save.mutate({ val: form.getValues(), schedule: false });
    else focusError();
  };
  const tryClose = () => {
    if (busy) return;
    if (formState.isDirty && !confirm("تجاهل التعديلات غير المحفوظة؟")) return;
    onClose();
  };
  const periodOptions = [
    { value: PRESET.key, label: packagePeriodLabel(PRESET.from, null) },
    { value: CUSTOM_PERIOD, label: v.period === CUSTOM_PERIOD ? packagePeriodLabel(v.from, v.to || null) : "فترة مخصصة…" },
  ];
  const toggleItem = (id: string) => setValue("items", v.items.includes(id) ? v.items.filter((x) => x !== id) : [...v.items, id], { shouldDirty: true, shouldValidate: formState.isSubmitted });
  const priceInput = (k: keyof PriceV, i: number, label: string) => {
    const missing = !!priceError && !toNum(price[k][i]);
    return (
      <input
        aria-label={`${label} · ${SIZE_LABELS[i]}`}
        inputMode="numeric"
        value={price[k][i] ? num(toNum(price[k][i])) : ""}
        onChange={(ev) => setPrice(k, i, digits(ev.target.value).slice(0, 6))}
        aria-invalid={missing || undefined}
        className={`num h-[38px] w-full min-w-0 rounded-8 border bg-white px-2.5 text-13 leading-5 text-ink outline-none focus:border-[1.5px] focus:border-ink ${missing ? "border-danger" : "border-border"}`}
      />
    );
  };

  return (
    <BigModal
      title={edit ? "تعديل الباقة" : "باقة جديدة"}
      description={edit ? pkg.name : `باقة جديدة لـ${profile.provider.name}`}
      onClose={tryClose}
      footer={
        <>
          <Button variant="accent" className="h-11 px-4" icon={<Icon name="calendar" size={16} />} loading={busy && save.variables?.schedule !== false} disabled={busy} onClick={schedule}>
            {edit ? "حفظ التعديلات" : "جدولة الباقة"}
          </Button>
          {edit ? null : (
            <Button variant="secondary" className="h-[46px] px-4" loading={busy && save.variables?.schedule === false} disabled={busy} onClick={draft}>
              حفظ كمسودة
            </Button>
          )}
          <Button variant="secondary" className="ms-auto h-[46px] px-4" onClick={tryClose} disabled={busy}>
            إلغاء
          </Button>
        </>
      }
    >
      {/* بيانات الباقة */}
      <SCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="اسم الباقة للعملاء" error={e.name?.message}>
            {(id) => <TextInput id={id} {...register("name")} placeholder="باقة الحماية الكاملة" invalid={!!e.name} className={IN} />}
          </Field>
          <Field label="الفترة" error={e.to?.message ?? e.from?.message}>
            {(id) => (
              <Select
                id={id}
                icon="calendar"
                value={v.period}
                onChange={(k) => {
                  setValue("period", k, { shouldDirty: true });
                  if (k === PRESET.key) {
                    setValue("from", PRESET.from, { shouldDirty: true });
                    setValue("to", "", { shouldDirty: true });
                  }
                }}
                options={periodOptions}
                invalid={!!(e.to || e.from)}
                className={SEL}
                ariaLabel="الفترة"
              />
            )}
          </Field>
          <Field label="الحد">
            {(id) => <Controller control={control} name="usageLimit" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={USAGE_LIMITS.map((x) => ({ value: x, label: x }))} className={SEL} ariaLabel="الحد" />} />}
          </Field>
          {v.period === CUSTOM_PERIOD ? (
            <div className="grid grid-cols-2 gap-3 sm:col-start-2">
              <Field label="من">{(id) => <DateField id={id} value={v.from} onChange={(x) => setValue("from", x, { shouldDirty: true, shouldValidate: true })} invalid={!!e.from} className="h-11" />}</Field>
              <Field label="إلى (اختياري)">{(id) => <DateField id={id} value={v.to} min={v.from} onChange={(x) => setValue("to", x, { shouldDirty: true, shouldValidate: true })} invalid={!!e.to} className="h-11" placeholder="دائم" />}</Field>
            </div>
          ) : null}
        </div>
        <Field label="الوصف للعميل" error={e.description?.message}>
          {(id) => (
            <textarea
              id={id}
              {...register("description")}
              rows={2}
              aria-invalid={!!e.description || undefined}
              placeholder="حماية واجهة السيارة بفيلم PPF مع نانو سيراميك للهيكل وتفصيل داخلي كامل، بسعر أقل من حجزها منفردة."
              className={`h-[60px] w-full resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none placeholder:font-light placeholder:text-muted focus:border-[1.5px] focus:border-ink ${e.description ? "border-danger" : "border-border"}`}
            />
          )}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-12 leading-5 font-medium text-muted">الفروع</legend>
          <BranchChips value={v.branchIds} onChange={(x) => setValue("branchIds", x, { shouldDirty: true })} branches={approved} />
        </fieldset>
        <div className="flex flex-col gap-2.5" role="group" aria-label="القنوات">
          <ToggleRow label="العملاء · الموقع والتطبيق" checked={v.channels.customers} onChange={(x) => setValue("channels.customers", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          <ToggleRow label="الوكالات (B2B)" checked={v.channels.b2b} onChange={(x) => setValue("channels.b2b", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          <ToggleRow label="المسوّقون" checked={v.channels.marketers} onChange={(x) => setValue("channels.marketers", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          {e.channels?.message ? (
            <p role="alert" className="text-12 text-danger">
              {e.channels.message}
            </p>
          ) : null}
        </div>
      </SCard>

      {/* الخدمات المشمولة */}
      <SCard title="الخدمات المشمولة">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]" role="table" aria-label="الخدمات المشمولة">
            <div role="row" className="grid grid-cols-[36px_1fr_150px_150px_110px] rounded-10 bg-surface-1 px-3 py-[9px] text-12 leading-5 font-medium text-muted">
              <span role="columnheader" className="sr-only">
                اختيار
              </span>
              <span role="columnheader">الخدمة · المنتج</span>
              <span role="columnheader">التكلفة الحالية</span>
              <span role="columnheader">سعر البيع الحالي</span>
              <span role="columnheader" className="sr-only">
                الحالة
              </span>
            </div>
            {catalog.isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="border-b border-divider px-3 py-[15px]">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-surface-1" />
                  </div>
                ))
              : services.map((s: CatalogItem) => {
                  const on = (v.items ?? []).includes(s.serviceId);
                  const p = s.prices[tab] ?? Object.values(s.prices)[0];
                  return (
                    <label key={s.serviceId} role="row" className="grid cursor-pointer grid-cols-[36px_1fr_150px_150px_110px] items-center border-b border-divider p-3 text-13 leading-5 text-ink hover:bg-surface-1/50">
                      <span role="cell" className="flex">
                        <input type="checkbox" checked={on} onChange={() => toggleItem(s.serviceId)} aria-invalid={!!e.items || undefined} className="peer sr-only" aria-label={s.short} />
                        <span
                          aria-hidden
                          className={`flex size-[18px] items-center justify-center rounded-[5px] peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${on ? "bg-ink" : "border-[1.5px] border-[#b9c1bd] bg-white"}`}
                        >
                          {on ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6.2 4.9 8.5 9.5 3.7" stroke="#ABF907" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                      </span>
                      <span role="cell" className="truncate">
                        {s.short} · {s.productName}
                      </span>
                      <span role="cell" className="num">
                        {p ? num(p.cost[0]) : "—"}
                      </span>
                      <span role="cell" className="num">
                        {p ? num(p.sale[0]) : "—"}
                      </span>
                      <span role="cell" className="flex justify-end">
                        {on ? <Pill className="h-6 rounded-full bg-success-tint! px-2.5 text-success!">ضمن الباقة</Pill> : <Pill className="h-6 rounded-full bg-surface-2! px-2.5 text-[#4a5550]!">غير مختارة</Pill>}
                      </span>
                    </label>
                  );
                })}
          </div>
        </div>
        {e.items?.message ? (
          <p role="alert" className="text-12 text-danger">
            {e.items.message}
          </p>
        ) : null}
      </SCard>

      {/* سعر الباقة حسب الحجم · لكل فرع */}
      <SCard title="سعر الباقة حسب الحجم · لكل فرع">
        <div role="tablist" aria-label="الفرع" className="flex flex-wrap gap-2">
          {selBranches.map((b) => (
            <TagChip key={b.id} on={b.id === tab} onClick={() => setTab(b.id)}>
              فرع {b.name}
            </TagChip>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[760px] flex-col gap-2" role="table" aria-label="سعر الباقة">
            <div role="row" className="grid min-h-10 grid-cols-[110px_repeat(5,1fr)] items-center gap-2.5 text-12 leading-5 font-medium text-muted">
              <span role="columnheader">الحجم</span>
              <span role="columnheader">مجموع المكوّنات</span>
              <span role="columnheader">تكلفة الباقة (للمزوّد) · شامل الضريبة</span>
              <span role="columnheader">سعر البيع · شامل</span>
              <span role="columnheader">الهامش</span>
              <span role="columnheader">سعر الوكالات · شامل الضريبة</span>
            </div>
            {SIZE_LABELS.map((label, i) => {
              const cost = toNum(price.cost[i]);
              const sale = toNum(price.sale[i]);
              const m = sale - cost;
              const pct = pctOf(m, sale);
              return (
                <div key={label} role="row" className="grid grid-cols-[110px_repeat(5,1fr)] items-center gap-2.5 text-13 leading-5 text-ink">
                  <span role="cell" className="font-semibold">
                    {label}
                  </span>
                  <span role="cell" className={`num flex h-[38px] items-center rounded-8 px-2.5 ${CELL_CALC}`}>
                    {chosen.length ? num(sumCost(i)) : "—"}
                  </span>
                  <span role="cell">{priceInput("cost", i, "تكلفة الباقة")}</span>
                  <span role="cell">{priceInput("sale", i, "سعر البيع")}</span>
                  <span role="cell" className={`num flex h-[38px] items-center rounded-8 px-2.5 ${sale && cost && pct < LOW_MARGIN ? CELL_ALERT : CELL_CALC}`}>
                    {sale && cost ? `${num(m)} · ${pctText(pct)}` : "—"}
                  </span>
                  <span role="cell">{priceInput("b2b", i, "سعر الوكالات")}</span>
                </div>
              );
            })}
          </div>
        </div>
        {priceError ? (
          <p role="alert" className="text-12 text-danger">
            {priceError}
          </p>
        ) : null}
      </SCard>
    </BigModal>
  );
}
