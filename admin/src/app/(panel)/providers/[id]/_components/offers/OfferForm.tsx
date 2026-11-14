"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { isCancelled, useSensitive } from "@/components/panel/Sensitive";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import {
  APPEARS_IN,
  CUSTOM_PERIOD,
  DISCOUNT_TYPES,
  USAGE_LIMITS,
  afterOffer,
  pctText,
  periodLabel,
  type CatalogItem,
  type DiscountType,
  type Funding,
  type Offer,
  type OfferInput,
} from "@/lib/api/offers";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import { num } from "@/lib/format";
import { DateField } from "../../../_components/form-bits";
import { BigModal, BranchChips, CELL_ALERT, CELL_CALC, IN, LOW_MARGIN, RadioCard, SCard, SEL, ToggleRow, WideKV } from "./bits";

// CON5-07M · عرض جديد · جونسون (3260-207383) — نفس النافذة لـ«تعديل البيانات» من قائمة ⋯ في جدول العروض.
// بيانات العرض: صفّين × 3 حقول (371 · مسافة 12) ← القنوات (3 مفاتيح) ← إشعار العملاء
// تمويل الخصم: كارتين راديو ← الخدمات والفروع: شرائح الفروع + جدول (الفروع · الخدمة · التكلفة · البيع قبل · بعد العرض · هامش لينكار بعده) + «إضافة خدمة».
// الجدول يحسب البيع بعد العرض وهامش لينكار بعده؛ لو الهامش أقل من 15% الخلية تنبيه، والجدولة تطلب صلاحية حساسة (رمز التحقق).
// «جدولة العرض» = حالة مجدولة · «حفظ كمسودة» = مسودة (القسم 11 · التنفيذ).

/** الفترات الجاهزة (القسم 17: «1 – 31 ديسمبر 2026، فترة مخصصة…») */
const PRESETS = [
  { key: "2026-12", from: "2026-12-01", to: "2026-12-31" },
  { key: "2026-11", from: "2026-11-01", to: "2026-11-30" },
];
const presetOf = (from: string, to: string) => PRESETS.find((p) => p.from === from && p.to === to)?.key ?? CUSTOM_PERIOD;

const schema = z
  .object({
    name: z.string().trim().min(1, "أدخل اسم العرض للعملاء").max(80, "الاسم أطول من 80 حرفاً"),
    discountType: z.enum(["pct", "fixed", "free"]),
    value: z.string(),
    appearsIn: z.string().min(1),
    usageLimit: z.string().min(1),
    period: z.string(),
    from: z.string().min(1, "اختر تاريخ البداية"),
    to: z.string().min(1, "اختر تاريخ النهاية"),
    channels: z.object({ customers: z.boolean(), b2b: z.boolean(), marketers: z.boolean() }),
    funding: z.enum(["linkar", "provider"]),
    branchIds: z.array(z.string()),
    serviceIds: z.array(z.string()).min(1, "أضف خدمة واحدة على الأقل"),
  })
  .superRefine((v, ctx) => {
    const n = Number(v.value);
    if (v.discountType === "pct" && (!v.value || !(n >= 1 && n <= 90))) ctx.addIssue({ code: "custom", path: ["value"], message: "أدخل نسبة من 1 إلى 90" });
    if (v.discountType === "fixed" && (!v.value || !(n > 0))) ctx.addIssue({ code: "custom", path: ["value"], message: "أدخل مبلغ الخصم" });
    if (v.from && v.to && v.to < v.from) ctx.addIssue({ code: "custom", path: ["to"], message: "تاريخ النهاية قبل البداية" });
    if (!v.channels.customers && !v.channels.b2b && !v.channels.marketers) ctx.addIssue({ code: "custom", path: ["channels"], message: "اختر قناة واحدة على الأقل" });
  });
type FormValues = z.infer<typeof schema>;

const toInput = (v: FormValues): OfferInput => ({
  name: v.name.trim(),
  discountType: v.discountType,
  value: v.discountType === "free" ? 0 : Number(v.value),
  appearsIn: v.appearsIn,
  usageLimit: v.usageLimit,
  from: v.from,
  to: v.to,
  channels: v.channels,
  funding: v.funding,
  branchIds: v.branchIds,
  serviceIds: v.serviceIds,
});

/** صفوف الجدول: لكل خدمة، الفروع المختارة بنفس السعر في صف واحد */
function gridRows(services: CatalogItem[], ids: string[], branchIds: string[], approved: ProviderBranch[]) {
  const sel = branchIds.length ? approved.filter((b) => branchIds.includes(b.id)) : approved;
  return ids.flatMap((id) => {
    const s = services.find((x) => x.serviceId === id);
    if (!s) return [];
    const groups = new Map<string, { ids: string[]; cost: number; sale: number }>();
    for (const b of sel) {
      const p = s.prices[b.id];
      if (!p) continue;
      const key = `${p.cost[0]}-${p.sale[0]}`;
      const g = groups.get(key) ?? { ids: [], cost: p.cost[0], sale: p.sale[0] };
      g.ids.push(b.id);
      groups.set(key, g);
    }
    return [...groups.values()].map((g) => {
      const allSel = g.ids.length === approved.length;
      const label = allSel ? (approved.length === 3 ? "الفروع الثلاثة" : approved.length === 2 ? "الفرعين" : approved.length === 1 ? `فرع ${approved[0].name}` : "كل الفروع") : g.ids.map((b) => `فرع ${approved.find((x) => x.id === b)?.name}`).join(" · ");
      return { key: `${id}-${g.ids.join(",")}`, serviceId: id, name: s.short === s.serviceName ? s.serviceName : s.short, label, cost: g.cost, sale: g.sale };
    });
  });
}

export function OfferFormModal({ profile, branches, offer, onClose }: { profile: ProviderProfile; branches: ProviderBranch[]; offer?: Offer; onClose: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const sensitive = useSensitive();
  const pid = profile.provider.id;
  const approved = branches.filter((b) => b.status === "approved");
  const catalog = useQuery({ queryKey: ["providers", "offers", pid, "catalog"], queryFn: () => api.offers.catalog(pid) });
  const services = catalog.data ?? [];
  const edit = !!offer;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: offer
      ? { ...offer, value: offer.value ? String(offer.value) : "", period: presetOf(offer.from, offer.to) }
      : {
          name: "",
          discountType: "pct",
          value: "",
          appearsIn: APPEARS_IN[0],
          usageLimit: USAGE_LIMITS[0],
          period: PRESETS[0].key,
          from: PRESETS[0].from,
          to: PRESETS[0].to,
          channels: { customers: true, b2b: false, marketers: true },
          funding: "linkar",
          branchIds: [],
          serviceIds: [],
        },
  });
  const { register, control, setValue, formState } = form;
  const e = formState.errors;
  const v = useWatch({ control }) as FormValues;
  const rows = gridRows(services, v.serviceIds ?? [], v.branchIds ?? [], approved).map((r) => ({ ...r, after: afterOffer(r, { discountType: v.discountType, value: Number(v.value) || 0, funding: v.funding }) }));
  const lowMargin = rows.some((r) => r.after.pct < LOW_MARGIN);
  const audience = useQuery({
    queryKey: ["providers", "offers", "audience", v.serviceIds?.[0] ?? ""],
    queryFn: () => api.offers.audience(v.serviceIds, services),
    enabled: !!services.length && !!v.serviceIds?.length,
  });
  const [valueFocus, setValueFocus] = useState(false);

  const save = useMutation({
    mutationFn: async ({ val, schedule }: { val: FormValues; schedule: boolean }) => {
      const input = toInput(val);
      const copy = {
        title: "رمز التحقق",
        description: `هامش لينكار بعد العرض أقل من ${LOW_MARGIN}%. أدخل رمز تطبيق المصادقة لتأكيد ${edit ? "حفظ التعديلات" : "جدولة العرض"}.`,
        confirmLabel: edit ? "حفظ التعديلات" : "جدولة العرض",
      };
      if (offer) return sensitive.run((otp) => api.offers.updateOffer(offer.id, input, { lowMargin, otp }), copy);
      return schedule ? sensitive.run((otp) => api.offers.createOffer(pid, input, true, { lowMargin, otp }), copy) : api.offers.createOffer(pid, input, false);
    },
    onSuccess: (_r, { val, schedule }) => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      onClose();
      if (offer) toast("حُفظت التعديلات", `حُفظت تعديلات ${val.name.trim()}`);
      else if (schedule) toast(`جُدول العرض · ${profile.provider.short ?? profile.provider.name}`, `جُدول العرض الجديد لدى ${profile.provider.name}`);
      else toast(`مسودة العرض · ${profile.provider.short ?? profile.provider.name}`, "حُفظ العرض الجديد كمسودة");
    },
    onError: (err) => {
      if (isCancelled(err)) return;
      toast("تعذّر الحفظ", isApiError(err) && err.status === 404 ? "لم يعد هذا العرض موجوداً" : "تعذّر حفظ العرض، حاول مرة أخرى");
    },
  });
  const busy = save.isPending;
  const focusError = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-offer-form] [aria-invalid=true]")?.focus());
  const schedule = form.handleSubmit((val) => save.mutate({ val, schedule: true }), focusError);
  const draft = async () => {
    if (await form.trigger("name")) save.mutate({ val: form.getValues(), schedule: false });
    else focusError();
  };
  const tryClose = () => {
    if (busy) return;
    if (formState.isDirty && !confirm("تجاهل التعديلات غير المحفوظة؟")) return;
    onClose();
  };
  const unit = v.discountType === "pct" ? "%" : v.discountType === "fixed" ? " ر.س" : "";
  const remaining = services.filter((s) => !(v.serviceIds ?? []).includes(s.serviceId));
  const periodOptions = [
    ...PRESETS.map((p) => ({ value: p.key, label: periodLabel(p.from, p.to) })),
    { value: CUSTOM_PERIOD, label: v.period === CUSTOM_PERIOD && v.from && v.to ? periodLabel(v.from, v.to) : "فترة مخصصة…" },
  ];

  return (
    <>
    <BigModal
      title={edit ? "تعديل العرض" : "عرض جديد"}
      description={edit ? offer.name : `عرض جديد لـ${profile.provider.name}`}
      onClose={tryClose}
      footer={
        <>
          <Button variant="accent" className="h-11 px-4" icon={<Icon name="calendar" size={16} />} loading={busy && save.variables?.schedule !== false} disabled={busy} onClick={schedule}>
            {edit ? "حفظ التعديلات" : "جدولة العرض"}
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
      {/* بيانات العرض */}
      <SCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="اسم العرض للعملاء" error={e.name?.message}>
            {(id) => <TextInput id={id} {...register("name")} placeholder="عرض نهاية العام · خصم 12% على حماية PPF" invalid={!!e.name} className={IN} />}
          </Field>
          <Field label="نوع الخصم">
            {(id) => (
              <Controller
                control={control}
                name="discountType"
                render={({ field }) => <Select id={id} value={field.value} onChange={(x) => field.onChange(x as DiscountType)} options={DISCOUNT_TYPES} className={SEL} ariaLabel="نوع الخصم" />}
              />
            )}
          </Field>
          <Field label="القيمة" error={e.value?.message}>
            {(id) => (
              <Controller
                control={control}
                name="value"
                render={({ field }) => (
                  <TextInput
                    id={id}
                    inputMode="numeric"
                    disabled={v.discountType === "free"}
                    value={v.discountType === "free" ? "—" : valueFocus || !field.value ? field.value : `${field.value}${unit}`}
                    onFocus={() => setValueFocus(true)}
                    onBlur={() => {
                      setValueFocus(false);
                      field.onBlur();
                    }}
                    onChange={(ev) => field.onChange(ev.target.value.replace(/\D/g, "").slice(0, v.discountType === "pct" ? 2 : 5))}
                    placeholder={v.discountType === "fixed" ? "200 ر.س" : "12%"}
                    invalid={!!e.value}
                    className={IN}
                  />
                )}
              />
            )}
          </Field>
          <Field label="الفترة" error={e.to?.message ?? e.from?.message}>
            {(id) => (
              <Select
                id={id}
                icon="calendar"
                value={v.period}
                onChange={(k) => {
                  setValue("period", k, { shouldDirty: true });
                  const p = PRESETS.find((x) => x.key === k);
                  if (p) {
                    setValue("from", p.from, { shouldDirty: true });
                    setValue("to", p.to, { shouldDirty: true });
                  }
                }}
                options={periodOptions}
                invalid={!!(e.to || e.from)}
                className={SEL}
                ariaLabel="الفترة"
              />
            )}
          </Field>
          <Field label="حد الاستخدام">
            {(id) => <Controller control={control} name="usageLimit" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={USAGE_LIMITS.map((x) => ({ value: x, label: x }))} className={SEL} ariaLabel="حد الاستخدام" />} />}
          </Field>
          <Field label="يظهر في">
            {(id) => <Controller control={control} name="appearsIn" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={APPEARS_IN.map((x) => ({ value: x, label: x }))} className={SEL} ariaLabel="يظهر في" />} />}
          </Field>
          {v.period === CUSTOM_PERIOD ? (
            <div className="grid grid-cols-2 gap-3 sm:col-span-1">
              <Field label="من">{(id) => <DateField id={id} value={v.from} onChange={(x) => setValue("from", x, { shouldDirty: true, shouldValidate: true })} invalid={!!e.from} className="h-11" />}</Field>
              <Field label="إلى">{(id) => <DateField id={id} value={v.to} min={v.from} onChange={(x) => setValue("to", x, { shouldDirty: true, shouldValidate: true })} invalid={!!e.to} className="h-11" />}</Field>
            </div>
          ) : null}
        </div>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 w-full text-end text-12 leading-5 font-medium text-muted">القنوات</legend>
          <ToggleRow label="العملاء · الموقع والتطبيق" checked={v.channels.customers} onChange={(x) => setValue("channels.customers", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          <ToggleRow label="الوكالات (B2B)" checked={v.channels.b2b} onChange={(x) => setValue("channels.b2b", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          <ToggleRow label="المسوّقون" checked={v.channels.marketers} onChange={(x) => setValue("channels.marketers", x, { shouldDirty: true, shouldValidate: formState.isSubmitted })} />
          {e.channels?.message ? (
            <p role="alert" className="text-12 text-danger">
              {e.channels.message}
            </p>
          ) : null}
        </fieldset>
        <WideKV k="إشعار العملاء">{audience.data ? `${audience.data.label} · ${num(audience.data.count)} عميلاً` : "—"}</WideKV>
      </SCard>

      {/* تمويل الخصم */}
      <SCard title="تمويل الخصم">
        <div role="radiogroup" aria-label="تمويل الخصم" className="flex flex-col gap-2.5 sm:flex-row">
          {(
            [
              ["provider", "باتفاق مع المزوّد"],
              ["linkar", "من هامش لينكار"],
            ] as [Funding, string][]
          ).map(([k, label]) => (
            <RadioCard key={k} name="funding" on={v.funding === k} onClick={() => setValue("funding", k, { shouldDirty: true })} title={label} />
          ))}
        </div>
      </SCard>

      {/* الخدمات والفروع */}
      <SCard title="الخدمات والفروع">
        <BranchChips value={v.branchIds} onChange={(x) => setValue("branchIds", x, { shouldDirty: true })} branches={approved} />
        <div className="overflow-x-auto">
          <div className="flex min-w-[760px] flex-col gap-2" role="table" aria-label="الخدمات والفروع">
            <div role="row" className="grid grid-cols-[150px_1fr_80px_80px_90px_120px_30px] gap-2.5 text-12 leading-5 font-medium text-muted">
              <span role="columnheader">الفروع</span>
              <span role="columnheader">الخدمة</span>
              <span role="columnheader">التكلفة</span>
              <span role="columnheader">البيع قبل</span>
              <span role="columnheader">بعد العرض</span>
              <span role="columnheader">هامش لينكار بعده</span>
              <span role="columnheader" className="sr-only">
                إزالة
              </span>
            </div>
            {catalog.isLoading ? (
              <div className="h-[38px] animate-pulse rounded-8 bg-surface-1" />
            ) : (
              rows.map((r) => (
                <div key={r.key} role="row" className="grid h-[38px] grid-cols-[150px_1fr_80px_80px_90px_120px_30px] items-center gap-2.5 text-13 leading-5 text-ink">
                  <span role="cell" className="truncate font-semibold">
                    {r.label}
                  </span>
                  <span role="cell" className="truncate font-semibold">
                    {r.name}
                  </span>
                  <span role="cell" className="num font-semibold">
                    {num(r.after.cost)}
                  </span>
                  <span role="cell" className="num font-semibold">
                    {num(r.sale)}
                  </span>
                  <span role="cell" className={`num flex h-[38px] items-center rounded-8 px-2.5 ${CELL_CALC}`}>
                    {num(r.after.sale)}
                  </span>
                  <span role="cell" className={`num flex h-[38px] items-center rounded-8 px-2.5 ${r.after.pct < LOW_MARGIN ? CELL_ALERT : CELL_CALC}`}>
                    {num(r.after.margin)} · {pctText(r.after.pct)}
                  </span>
                  <button
                    type="button"
                    role="cell"
                    aria-label={`إزالة ${r.name}`}
                    title="إزالة"
                    onClick={() =>
                      setValue(
                        "serviceIds",
                        v.serviceIds.filter((x) => x !== r.serviceId),
                        { shouldDirty: true },
                      )
                    }
                    className="group flex h-4 w-[30px] items-center justify-center text-ink"
                  >
                    <Icon name="check" size={16} className="group-hover:hidden" />
                    <Icon name="x" size={16} className="hidden group-hover:block" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {lowMargin ? <p className="text-12 leading-5 text-warning">هامش لينكار بعد العرض أقل من {LOW_MARGIN}% — تتطلب الجدولة صلاحية حساسة.</p> : null}
        {e.serviceIds?.message ? (
          <p role="alert" className="text-12 text-danger">
            {e.serviceIds.message}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Menu.Root dir="rtl" modal={false}>
            <Menu.Trigger
              aria-invalid={!!e.serviceIds || undefined}
              disabled={!remaining.length}
              className="inline-flex h-[34px] items-center gap-1 rounded-full border border-border bg-white px-3 text-13 leading-5 font-medium text-success hover:bg-surface-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="plus" size={14} className="shrink-0 text-[#3bb34b]" />
              إضافة خدمة
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content align="start" sideOffset={6} className="z-[70] flex max-h-[320px] min-w-[260px] flex-col gap-0.5 overflow-y-auto rounded-12 border border-border bg-white p-1.5 shadow-menu">
                {remaining.map((s) => (
                  <Menu.Item
                    key={s.serviceId}
                    onSelect={() => setValue("serviceIds", [...(v.serviceIds ?? []), s.serviceId], { shouldDirty: true, shouldValidate: formState.isSubmitted })}
                    className="flex min-h-[37px] cursor-pointer items-center rounded-8 px-2.5 py-2 text-13 leading-[21px] font-medium text-ink outline-none data-highlighted:bg-surface-1"
                  >
                    {s.short}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </SCard>
    </BigModal>
    {sensitive.modal}
    </>
  );
}
