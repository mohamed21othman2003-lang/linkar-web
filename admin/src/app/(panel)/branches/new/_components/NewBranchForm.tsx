"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/panel/PageHead";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { ASSESSORS, BASE_QUALITY, BRANCH_DISTRICTS, HOURS_OPTIONS, LICENSE_EXPIRY, SERVICE_CRITERIA, TODAY } from "@/lib/api/branches";
import { CITIES, TIERS, TIER_LABEL, type Tier } from "@/lib/api/providers";
import { useUrlState } from "@/lib/use-url-state";
import { DateField, TextArea, W_INPUT, W_SELECT } from "../../../providers/_components/form-bits";
import { CriteriaLink, MapBox } from "../../_components/bits";

// CON5-08N · إضافة فرع · مركز الريم · فرع الملز (3114-59725) — ومن ملف جونسون · فرع السلامة (3114-59892)
// الخطوة 2 من 2 بعد «اختر مقدّم الخدمة» (CON5-08M 3114-59692). الرابط: /branches/new?provider=<id> · نافذة الاعتماد ?modal=approve
// «حفظ الفرع وجدولة الزيارة» → الفرع «بانتظار الزيارة الميدانية» + رسالة · «حفظ واعتماد ونشر» → CON5-08M «اعتماد ونشر بدون زيارة» (3114-61688)
// العنوان من الخريطة (القسم 18.1): TODO(map provider) — لحد ما يتحدد مزوّد الخرائط الحقل نص + صندوق خريطة مكانه.
const phoneRe = /^05\d\s?\d{3}\s?\d{4}$/;
const schema = z.object({
  nameMode: z.enum(["brand-district", "custom"]),
  customName: z.string().trim(),
  records: z.string(),
  main: z.boolean(),
  city: z.string().min(1, "اختر المدينة"),
  district: z.string().min(1, "اختر الحي"),
  address: z.string().trim().min(5, "حدّد العنوان من الخريطة أو اكتبه"),
  manager: z.string().trim().min(2, "اكتب اسم مدير الفرع"),
  managerPhone: z.string().trim().regex(phoneRe, "اكتب جوالاً صحيحاً يبدأ بـ05"),
  liaison: z.string().trim().min(2, "اكتب اسم مسؤول التواصل"),
  phone: z.string().trim().regex(phoneRe, "اكتب جوالاً صحيحاً يبدأ بـ05"),
  hours: z.string().min(1, "اختر ساعات العمل"),
  slots: z.string().trim().regex(/^\d{1,2}$/, "اكتب رقماً"),
  technicians: z.string().trim().regex(/^\d{1,3}$/, "اكتب رقماً"),
  license: z.string().min(1, "ارفع رخصة البلدية"),
  civil: z.string().min(1, "ارفع شهادة الدفاع المدني"),
  licenseExpiry: z.string(),
  visitAt: z.string().min(1, "اختر موعد الزيارة"),
  assessor: z.string().min(1, "اختر المقيّم"),
}).refine((v) => v.nameMode === "brand-district" || v.customName.length >= 2, { path: ["customName"], message: "اكتب اسم الفرع" });
type Form = z.infer<typeof schema>;
const HOURS_DEFAULT = HOURS_OPTIONS[1];
const RECORDS = ["نفس بيانات المنشأة", "سجل مستقل للفرع"];

export function NewBranchForm({ providerId }: { providerId?: string }) {
  const router = useRouter();
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  const f = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { nameMode: "brand-district", customName: "", records: RECORDS[0], main: false, city: "", district: "", address: "", manager: "", managerPhone: "", liaison: "", phone: "", hours: HOURS_DEFAULT, slots: "", technicians: "", license: "", civil: "", licenseExpiry: LICENSE_EXPIRY[0], visitAt: "", assessor: ASSESSORS[0] },
  });
  const [district, city, nameMode, customName] = useWatch({ control: f.control, name: ["district", "city", "nameMode", "customName"] });
  const draft = useQuery({ queryKey: ["branches", "draft", providerId, district], queryFn: () => api.branches.draft(providerId!, district || "فرع"), enabled: !!providerId, placeholderData: (p) => p });
  const d = draft.data;
  // المدينة الافتراضية = مدينة المنشأة
  const [seeded, setSeeded] = useState(false);
  if (d && !seeded) {
    setSeeded(true);
    f.setValue("city", d.provider.city);
  }
  const dirty = f.formState.isDirty;
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const name = district ? `فرع ${district}` : "فرع جديد";
  const input = (v: Form) => ({
    providerId: providerId!,
    name: v.nameMode === "custom" && v.customName ? v.customName : name,
    nameMode: v.nameMode,
    customName: v.customName,
    district: v.district,
    city: v.city,
    address: v.address,
    code: d!.code,
    main: v.main,
    manager: v.manager,
    managerPhone: v.managerPhone,
    liaison: v.liaison,
    phone: v.phone,
    technicians: v.technicians,
    slots: v.slots,
    hours: v.hours,
    services: d!.services,
    licenseExpiry: v.licenseExpiry,
    assessor: v.assessor,
    visitAt: v.visitAt,
  });
  const create = useMutation({
    mutationFn: (v: Form) => api.branches.create(input(v)),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
      f.reset(f.getValues());
      router.push("/branches?tab=pending-visit");
      toast(`أُضيف ${r.name}`, `أُضيف ${r.name} لـ${r.provider} · بانتظار الزيارة الميدانية · ${r.visit}`);
    },
    onError: (e) => {
      if (isApiError(e, 422)) toast("تعذّر الحفظ", e.fields?.code ?? "تحقق من البيانات");
    },
  });
  const cancel = () => {
    if (dirty && !window.confirm("لديك بيانات غير محفوظة. هل تريد الخروج؟")) return;
    router.push("/branches");
  };

  if (!providerId)
    return <EmptyState title="اختر مقدّم الخدمة أولاً" body="الفرع يُضاف لمقدّم خدمة محدد." action={<ButtonLink href="/branches?modal=add-branch" variant="secondary" size="S">اختر مقدّم الخدمة</ButtonLink>} />;
  if (draft.isError)
    return isApiError(draft.error, 404) ? (
      <EmptyState title="مقدّم الخدمة غير موجود" action={<ButtonLink href="/branches?modal=add-branch" variant="secondary" size="S">اختر مقدّم الخدمة</ButtonLink>} />
    ) : (
      <EmptyState title="تعذّر تحميل البيانات" body="حدث خطأ أثناء التحميل. حاول مرة أخرى." action={<Button variant="secondary" size="S" onClick={() => draft.refetch()}>إعادة المحاولة</Button>} />
    );
  if (!d)
    return (
      <div className="flex flex-col gap-5" aria-busy>
        <Skeleton className="h-[82px] w-1/2 rounded-12" />
        <Skeleton className="h-[900px] w-full rounded-16" />
      </div>
    );

  const e = f.formState.errors;
  const label = d.provider.label;
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <nav aria-label="مسار الصفحة" className="text-12 leading-[18px] font-light text-muted">
          <Link href="/branches" className="hover:text-ink">
            الفروع
          </Link>{" "}
          ← إضافة فرع
        </nav>
        <h1 className="text-24 font-bold text-ink">إضافة فرع لـ{d.provider.name.replace(/\s+[A-Za-z].*$/, "")}</h1>
        <p className="text-13 font-light text-muted">
          الخطوة 2 من 2 · {label} · {d.provider.code} · {d.provider.kind}
        </p>
      </div>
      <form onSubmit={f.handleSubmit((v) => create.mutate(v))} noValidate className="flex flex-col gap-5">
        <section className="flex flex-col gap-3.5 rounded-16 border border-border bg-white px-5 pt-[18px] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] leading-7 font-bold text-ink">{nameMode === "custom" && customName ? customName : name}</h2>
            <span className="inline-flex h-6 items-center rounded-full bg-[#fdf3e1] px-2.5 text-12 leading-[18px] font-medium text-warning">سيبدأ «بانتظار الزيارة الميدانية»</span>
          </div>
          <Controller
            control={f.control}
            name="nameMode"
            render={({ field }) => (
              <div role="radiogroup" aria-label="اسم الفرع على لينكار" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NameOption on={field.value === "brand-district"} onClick={() => field.onChange("brand-district")} title="اسم المنشأة + الحي" sub={`يظهر للعميل «${label} · ${district || "الحي"}»`} />
                <NameOption on={field.value === "custom"} onClick={() => field.onChange("custom")} title="اسم مختلف للفرع" sub="مثل فرع يعمل بعلامة أخرى" />
              </div>
            )}
          />
          {nameMode === "custom" ? (
            <Field required label="اسم الفرع على لينكار" error={e.customName?.message}>{(id) => <TextInput id={id} {...f.register("customName")} invalid={!!e.customName} className={W_INPUT} />}</Field>
          ) : null}
          <Row cols={2}>
            <Field label="كود الفرع (تولّده لينكار)">{(id) => <TextInput id={id} value={district ? d.code : d.code.replace(/-[A-Z]{2}-(?=\d+$)/, "-··-")} readOnly ltr className={`${W_INPUT} bg-surface-1!`} aria-readonly />}</Field>
            <Field label="السجل والرقم الضريبي">{(id) => <Ctl f={f} name="records" render={(v, set) => <Select id={id} value={v} onChange={set} options={RECORDS.map((r) => ({ value: r, label: r }))} className={W_SELECT} />} />}</Field>
          </Row>
          <Controller
            control={f.control}
            name="main"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-2.5">
                <span className="text-13 leading-5 font-medium text-ink">الفرع الرئيسي للمنشأة</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} label="الفرع الرئيسي للمنشأة" />
              </label>
            )}
          />
          <Row cols={3}>
            <Field required label="المدينة" error={e.city?.message}>
              {(id) => (
                <Ctl
                  f={f}
                  name="city"
                  render={(v, set) => (
                    <Select
                      id={id}
                      value={v}
                      onChange={(c) => {
                        set(c);
                        f.setValue("district", "", { shouldDirty: true });
                      }}
                      options={CITIES.map((c) => ({ value: c, label: c }))}
                      invalid={!!e.city}
                      className={W_SELECT}
                    />
                  )}
                />
              )}
            </Field>
            <Field required label="الحي" error={e.district?.message}>
              {(id) => <Ctl f={f} name="district" render={(v, set) => <Select id={id} value={v} onChange={set} options={(BRANCH_DISTRICTS[city] ?? []).map((x) => ({ value: x, label: x }))} invalid={!!e.district} placeholder="اختر الحي" className={W_SELECT} />} />}
            </Field>
            <AddressField f={f} error={e.address?.message} />
          </Row>
          <Row cols={4}>
            <Field required label="مدير الفرع" error={e.manager?.message}>{(id) => <TextInput id={id} {...f.register("manager")} invalid={!!e.manager} className={W_INPUT} />}</Field>
            <Field required label="جوال المدير" error={e.managerPhone?.message}>{(id) => <TextInput id={id} {...f.register("managerPhone")} invalid={!!e.managerPhone} inputMode="tel" ltr placeholder="05X XXX XXXX" className={W_INPUT} />}</Field>
            <Field required label="مسؤول التواصل مع لينكار" error={e.liaison?.message}>{(id) => <TextInput id={id} {...f.register("liaison")} invalid={!!e.liaison} className={W_INPUT} />}</Field>
            <Field required label="جوال الفرع" error={e.phone?.message}>{(id) => <TextInput id={id} {...f.register("phone")} invalid={!!e.phone} inputMode="tel" ltr placeholder="05X XXX XXXX" className={W_INPUT} />}</Field>
          </Row>
          <Row cols={3}>
            <Field required label="ساعات العمل" error={e.hours?.message}>{(id) => <Ctl f={f} name="hours" render={(v, set) => <Select id={id} value={v} onChange={set} options={HOURS_OPTIONS.map((h) => ({ value: h, label: h }))} icon="clock" className={W_SELECT} />} />}</Field>
            <Field required label="فتحات العمل" error={e.slots?.message}>{(id) => <TextInput id={id} {...f.register("slots")} invalid={!!e.slots} inputMode="numeric" className={W_INPUT} />}</Field>
            <Field required label="عدد الفنيين" error={e.technicians?.message}>{(id) => <TextInput id={id} {...f.register("technicians")} invalid={!!e.technicians} inputMode="numeric" className={W_INPUT} />}</Field>
          </Row>
          <h3 className="text-14 leading-[22px] font-bold text-ink">الخدمات في هذا الفرع</h3>
          {d.services.map((s) => {
            const c = SERVICE_CRITERIA[s];
            return (
              <div key={s} className="flex flex-wrap items-center gap-3 rounded-12 border border-border px-3.5 py-3">
                <div className="flex w-[100px] shrink-0 flex-col gap-0.5">
                  <span className="text-14 leading-[22px] font-semibold whitespace-nowrap text-ink">{s}</span>
                  <span className="text-12 leading-[18px] font-light text-muted">
                    مدة التنفيذ: من {c?.from} إلى {c?.to}
                  </span>
                </div>
                <span className="flex-1" />
                <CriteriaLink className="py-1.5!">معايير الاعتماد · {c?.criteria} ↗</CriteriaLink>
              </div>
            );
          })}
          <CriteriaLink className="w-full! rounded-10! px-3! py-2!">يُقيَّم الفرع أيضاً بـ«الجودة الأساسية» · {BASE_QUALITY} ↗</CriteriaLink>
          <Row cols={2}>
            <FileField f={f} name="license" label="رخصة البلدية" error={e.license?.message} sample="license.pdf" />
            <FileField f={f} name="civil" label="شهادة الدفاع المدني" error={e.civil?.message} sample="civil-defense.pdf" />
          </Row>
          {/* «عند انتهاء رخصة الفرع» (القسم 17 · CON5-DD 3114:69041) — مش مرسوم في CON5-08N، مكانه هنا مع المستندات (يحتاج تأكيد المصمم) */}
          <Field label="عند انتهاء رخصة الفرع">{(id) => <Ctl f={f} name="licenseExpiry" render={(v, set) => <Select id={id} value={v} onChange={set} options={LICENSE_EXPIRY.map((x) => ({ value: x, label: x }))} className={W_SELECT} />} />}</Field>
        </section>
        <section className="flex flex-col gap-2.5 rounded-16 border border-border bg-white px-5 py-4">
          <h2 className="text-[15px] leading-6 font-bold text-ink">الزيارة الميدانية (إلزامية حتى لو أضافته لينكار)</h2>
          <Row cols={2}>
            <Field required label="الموعد" error={e.visitAt?.message}>{(id) => <Ctl f={f} name="visitAt" render={(v, set) => <DateField id={id} value={v} onChange={set} withTime min={TODAY} invalid={!!e.visitAt} className="h-11" />} />}</Field>
            <Field required label="المقيّم" error={e.assessor?.message}>{(id) => <Ctl f={f} name="assessor" render={(v, set) => <Select id={id} value={v} onChange={set} options={ASSESSORS.map((a) => ({ value: a, label: `${a} · الجودة` }))} className={W_SELECT} />} />}</Field>
          </Row>
        </section>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" className="h-[46px] px-[18px]" onClick={cancel} disabled={create.isPending}>
            إلغاء
          </Button>
          <span className="flex-1" />
          <Button type="submit" variant="accent" className="h-11 px-[18px]" loading={create.isPending}>
            حفظ الفرع وجدولة الزيارة
            <Icon name="check" size={16} />
          </Button>
          <Button variant="secondary" className="h-[46px]" disabled={create.isPending} onClick={f.handleSubmit(() => url.push({ modal: "approve" }))}>
            حفظ واعتماد ونشر
            <Icon name="check" size={16} />
          </Button>
        </div>
      </form>
      {url.get("modal") === "approve" ? (
        <ApproveModal
          title={`${f.getValues("nameMode") === "custom" && f.getValues("customName") ? f.getValues("customName") : name} · ${label}`}
          sub={`‏${d.provider.code.replace(/-\d+$/, "")} · ${name} · ${f.getValues("city")}`}
          review={`«فرع ${ORDINAL[d.code.slice(-3)] ?? "جديد"} ل${label} في ${district} يقدّم ${[...d.services].reverse().join(" و")}.»`}
          close={() => url.replace({ modal: null })}
          onApprove={async (pub) => {
            const r = await api.branches.create(input(f.getValues()));
            await api.branches.approvePublish(r.id, pub);
            qc.invalidateQueries({ queryKey: ["branches"] });
            qc.invalidateQueries({ queryKey: ["providers"] });
            f.reset(f.getValues());
            router.push("/branches?tab=new");
            toast(`اعتُمد ${r.name} ونُشر`, `اعتُمد ${r.name} ونُشر · ${TIER_LABEL[pub.tier]} · ★${pub.rating} · زيارة تحقّق خلال 60 يوماً`);
          }}
        />
      ) : null}
    </>
  );
}
const ORDINAL: Record<string, string> = { "002": "ثانٍ", "003": "ثالث", "004": "رابع", "005": "خامس" };

function Ctl<K extends keyof Form>({ f, name, render }: { f: UseFormReturn<Form>; name: K; render: (v: Form[K], set: (v: Form[K]) => void) => ReactNode }) {
  return <Controller control={f.control} name={name} render={({ field }) => <>{render(field.value as Form[K], field.onChange)}</>} />;
}

/** صف حقول: أعمدة متساوية بفاصل 12 (تترص تحت بعض على الموبايل) */
function Row({ cols, children }: { cols: 2 | 3 | 4; children: ReactNode }) {
  return <div className={`grid grid-cols-1 gap-3 ${cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>{children}</div>;
}

/** خيار اسم الفرع: 64 · r12 · حشو 10·12 · المختار #F7FBE9 بإطار كحلي 1.5 · دائرة 18 على الشمال */
function NameOption({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} className={`flex items-start gap-2.5 rounded-12 px-3 text-start ${on ? "border-[1.5px] border-ink bg-lime-tint py-2" : "border border-border bg-white py-[9px] hover:bg-surface-1"}`}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-14 leading-[22px] text-ink ${on ? "font-semibold" : "font-medium"}`}>{title}</span>
        <span className="text-12 leading-[18px] font-light text-muted">{sub}</span>
      </span>
      <span aria-hidden className={`mt-0.5 size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink bg-white" : "border-[1.5px] border-border-strong"}`} />
    </button>
  );
}

/** العنوان: نص + زر الخريطة (map-pin) — TODO(map provider): اختيار الموقع من الخريطة يعبّي العنوان (القسم 18.1) */
function AddressField({ f, error }: { f: UseFormReturn<Form>; error?: string }) {
  const [map, setMap] = useState(false);
  return (
    <Field required label="العنوان" error={error}>
      {(id) => (
        <div className="flex flex-col gap-2">
          <TextInput
            id={id}
            {...f.register("address")}
            invalid={!!error}
            className={`${W_INPUT} flex-row-reverse`}
            icon={
              <button type="button" aria-label="اختيار الموقع من الخريطة" aria-expanded={map} onClick={() => setMap((m) => !m)} className="flex text-ink">
                <Icon name="map-pin" size={16} />
              </button>
            }
          />
          {map ? (
            // اختيار الموقع يعبّي العنوان (القسم 18.1) — لحد ما يتحدد مزوّد الخرائط: الضغط على الخريطة يحط عنوان الحي والمدينة المختارين
            <button
              type="button"
              aria-label="تحديد الموقع على الخريطة"
              onClick={() => {
                const [city, district] = f.getValues(["city", "district"]);
                f.setValue("address", [district ? `حي ${district}` : "", city].filter(Boolean).join("، ") || "الموقع المحدد على الخريطة", { shouldDirty: true, shouldValidate: true });
                setMap(false);
              }}
              className="block w-full cursor-crosshair"
            >
              <MapBox className="h-[160px]" />
            </button>
          ) : null}
        </div>
      )}
    </Field>
  );
}

/** مستند مرفوع: «license.pdf · مرفوعة» + أيقونة ملف · الضغط يفتح اختيار ملف */
function FileField({ f, name, label, error, sample }: { f: UseFormReturn<Form>; name: "license" | "civil"; label: string; error?: string; sample: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const v = useWatch({ control: f.control, name });
  return (
    <Field required label={label} error={error}>
      {(id) => (
        <>
          <button
            id={id}
            type="button"
            onClick={() => ref.current?.click()}
            className={`flex h-11 w-full items-center gap-2 rounded-10 border bg-white px-3 text-start ${error ? "border-danger" : "border-border"}`}
          >
            <span className={`min-w-0 flex-1 truncate text-14 ${v ? "text-ink" : "font-light text-muted"}`}>{v ? `‏${v} · مرفوعة` : `ارفع ${sample}`}</span>
            <Icon name="file" size={16} className="shrink-0 text-ink" />
          </button>
          <input ref={ref} type="file" accept=".pdf,image/*" className="hidden" onChange={(ev) => ev.target.files?.[0] && f.setValue(name, ev.target.files[0].name, { shouldDirty: true, shouldValidate: true })} />
        </>
      )}
    </Field>
  );
}

// ───────────── CON5-08M · اعتماد ونشر بدون زيارة (3114-61688 · 3114-61624) ─────────────
// 640 · حشو 24 · مسافة 14 · الفئة + التقييم الظاهر · صندوق النجوم · مراجعة لينكار · «تظهر المراجعة على» · «اعتماد ونشر» أخضر يمين و«إلغاء» شمال
const RATINGS = ["5", "4.5", "4", "3.5", "3"];
const SCOPES = ["العلامة التجارية", "مقدّم الخدمة", "الفرع"];
function ApproveModal({ title, sub, review: initialReview, close, onApprove }: { title: string; sub: string; review: string; close: () => void; onApprove: (v: { rating: number; tier: Tier; review: string; scope: string[] }) => Promise<void> }) {
  const [rating, setRating] = useState("4");
  const [tier, setTier] = useState<Tier>("gold");
  const [review, setReview] = useState(initialReview);
  const [scope, setScope] = useState<string[]>(["العلامة التجارية", "الفرع"]);
  const m = useMutation({ mutationFn: () => onApprove({ rating: +rating, tier, review, scope }) });
  const r = +rating;
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={640} title={`اعتماد ونشر بدون زيارة · ${title}`} subtitle={sub}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="الفئة">{(id) => <Select id={id} value={tier} onChange={setTier} options={TIERS} className={W_SELECT} />}</Field>
        <Field label="التقييم الظاهر حتى أول 5 تقييمات">{(id) => <Select id={id} value={rating} onChange={setRating} options={RATINGS.map((x) => ({ value: x, label: `★ ${x} من 5` }))} className={W_SELECT} />}</Field>
      </div>
      <div className="flex items-center gap-2 rounded-12 border border-border px-3 py-2.5">
        <span className="min-w-0 flex-1 text-13 leading-5 text-ink">تقييم لينكار المبدئي للفرع · {rating} من 5</span>
        <span className="flex items-center gap-0.5 text-star" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <Icon key={i} name={i <= Math.round(r) ? "star-filled" : "star"} size={18} />
          ))}
        </span>
      </div>
      <Field required label="مراجعة لينكار · تظهر في صفحة الفرع على الموقع والتطبيق" error={!review.trim() ? "اكتب المراجعة" : undefined}>
        {(id) => <TextArea id={id} value={review} onChange={setReview} invalid={!review.trim()} className="h-[72px]! text-14! font-normal!" rows={2} />}
      </Field>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-12 leading-5 font-medium text-muted">تظهر المراجعة على:</span>
        {[...SCOPES].reverse().map((s) => {
          const on = scope.includes(s);
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => setScope(on ? scope.filter((x) => x !== s) : [...scope, s])}
              className={`inline-flex h-[30px] items-center gap-1.5 rounded-[20px] border px-2.5 text-12 leading-[18px] text-ink ${on ? "border-ink bg-lime-tint font-semibold" : "border-border bg-white font-normal hover:bg-surface-1"}`}
            >
              {on ? <Icon name="check" size={12} /> : null}
              {s}
            </button>
          );
        })}
      </div>
      {m.isError ? <p className="text-12 text-danger">تعذّر الاعتماد. حاول مرة أخرى.</p> : null}
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="accent" className="h-11" loading={m.isPending} disabled={!review.trim() || !scope.length} onClick={() => m.mutate()}>
          اعتماد ونشر
          <Icon name="check" size={16} />
        </Button>
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
