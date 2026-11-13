"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { BANKS, CITIES, branchWord, visitDates, type NewProviderInput, type Tier } from "@/lib/api/providers";
import { iban as fmtIban, nationalId as maskId, phone as fmtPhone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { ModalKV, W_INPUT, W_SELECT } from "../../_components/form-bits";
import { DocRow, Stepper, WCard } from "./bits";
import { BranchesStep } from "./BranchesStep";
import { STEP1_FIELDS, branchTitle, emptyWizard, shortBrand, suggestCode, wizardSchema, type WizardValues } from "./schema";
import { ApproveModal, LeaveModal } from "./WizardModals";

// القسم 8 · إضافة مقدّم خدمة — /providers/new?step=1|2|3
// CON5-07N1 · المنشأة والمالك (3114-51246) · CON5-07N2 · الفروع (3114-51551 / 07N2b 3114-51732) · CON5-07N3 · المراجعة والحفظ (3114-51438)
// البيانات محفوظة بين الخطوات (نموذج واحد + مسودة في sessionStorage لحد ما الخادم يدعم المسودات)، و«التالي» يتحقق من حقول الخطوة.
const DRAFT = "linkar-admin:new-provider";
const noop = () => () => {};
const TYPES = [
  { value: "care", label: "مركز عناية" },
  { value: "wash", label: "مغسلة سيارات" },
] as const;
const CITY_OPTS = CITIES.map((c) => ({ value: c, label: c }));
const BANK_OPTS = BANKS.map((b) => ({ value: b, label: b }));

function loadDraft(): WizardValues {
  try {
    const raw = sessionStorage.getItem(DRAFT);
    if (raw) return { ...emptyWizard(), ...JSON.parse(raw) };
  } catch {}
  return emptyWizard();
}

export function AddProviderWizard() {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const raw = Number(url.get("step"));
  const step = (raw === 2 || raw === 3 ? raw : 1) as 1 | 2 | 3;

  const form = useForm<WizardValues>({ resolver: zodResolver(wizardSchema), defaultValues: emptyWizard(), mode: "onTouched" });
  const [leave, setLeave] = useState<string | null>(null);
  const [approve, setApprove] = useState(false);
  const saved = useRef(false);

  // استرجاع المسودة بعد التحميل (sessionStorage مش متاح على الخادم)
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const restored = useRef(false);
  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    form.reset(loadDraft());
  }, [ready, form]);
  const all = useWatch({ control: form.control });
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify(all));
    } catch {}
  }, [all, ready]);

  // تأكيد قبل مغادرة الصفحة والنموذج فيه بيانات (القسم 18.2 · 6)
  const dirty = form.formState.isDirty;
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty && !saved.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // لو حد فتح خطوة 2/3 مباشرة والخطوة 1 ناقصة → يرجع لها
  const { trigger, getValues } = form;
  useEffect(() => {
    if (!ready || step === 1) return;
    const ok = wizardSchema.pick({ type: true, brand: true, brandEn: true, city: true, legalName: true, cr: true, vat: true, unified: true, code: true, ownerName: true, ownerPhone: true, email: true, nationalId: true, accounts: true }).safeParse(getValues()).success;
    if (!ok) url.replace({ step: "1" });
    else if (step === 3 && !wizardSchema.shape.branches.safeParse(getValues("branches")).success) url.replace({ step: "2" });
  }, [ready, step, getValues, url]);

  const next = async (to: 2 | 3) => {
    const ok = to === 2 ? await trigger([...STEP1_FIELDS]) : await trigger("branches");
    if (ok) url.push({ step: String(to) });
    else requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
  };

  const create = useMutation({
    mutationFn: (publish?: { tier: Tier; rating: number; review: string }) => api.providers.create(toInput(getValues(), publish)),
    onSuccess: (r, publish) => {
      saved.current = true;
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {}
      qc.invalidateQueries({ queryKey: ["providers"] });
      const v = getValues();
      if (publish) {
        const tier = { platinum: "بلاتيني", gold: "ذهبي", silver: "فضي" }[publish.tier];
        toast("اعتُمد ونُشر", `اعتُمد ${r.short} ونُشر ${r.branches === 1 ? "الفرع" : r.branches === 2 ? "الفرعان" : "الفروع"} · ${tier} · ★${publish.rating} · زيارة تحقّق خلال 60 يوماً`);
        router.push(`/providers?tab=${v.type}`);
      } else {
        toast(`أُنشئ ${r.short} · ${branchWord(r.branches)} بانتظار الزيارة`, `أُنشئ ${r.name} ${r.code} · ${branchWord(r.branches)} بانتظار الزيارة الميدانية (${r.dates})`);
        router.push("/providers?tab=pending-visit");
      }
    },
    onError: (e) => {
      setApprove(false);
      if (isApiError(e, 422) && e.fields?.code) {
        form.setError("code", { message: e.fields.code });
        url.push({ step: "1" });
      } else toast("تعذّر الحفظ", "تعذّر حفظ مقدّم الخدمة، حاول مرة أخرى");
    },
  });

  const goTo = (href: string) => (dirty && !saved.current ? setLeave(href) : router.push(href));
  const brand = useWatch({ control: form.control, name: "brand" });
  const code = useWatch({ control: form.control, name: "code" });
  const type = useWatch({ control: form.control, name: "type" });

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-0.5">
        <nav aria-label="مسار الصفحة" className="text-12 leading-[18px] font-light text-muted">
          <Link
            href="/providers"
            onClick={(e) => {
              e.preventDefault();
              goTo("/providers");
            }}
            className="hover:text-ink"
          >
            مقدّمو الخدمة
          </Link>{" "}
          ← إضافة مقدّم خدمة
        </nav>
        <h1 className="text-24 font-bold text-ink">إضافة مقدّم خدمة</h1>
        <p className="text-13 font-light text-muted">
          {step === 2 && brand ? (
            <>
              {brand} · <bdi dir="ltr">{code}</bdi> · {type === "care" ? "مركز عناية" : "مغسلة سيارات"}
            </>
          ) : (
            "منشأة واحدة بفرع واحد أو أكثر."
          )}
        </p>
      </div>
      <Stepper step={step} />
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-5">
        {!ready ? null : step === 1 ? (
          <>
            <CompanyStep />
            <Actions>
              <Button variant="secondary" className="h-[46px] px-[18px]" onClick={() => goTo("/providers")}>
                إلغاء
              </Button>
              <Button className="h-11 px-[18px]" onClick={() => next(2)}>
                التالي: الفروع
                <Icon name="chevron-left" size={16} />
              </Button>
            </Actions>
          </>
        ) : step === 2 ? (
          <>
            <BranchesStep />
            <Actions>
              <Button variant="secondary" className="h-[46px] px-[18px]" onClick={() => url.push({ step: "1" })}>
                السابق
              </Button>
              <Button className="h-11 px-[18px]" onClick={() => next(3)}>
                التالي: المراجعة والحفظ
                <Icon name="chevron-left" size={16} />
              </Button>
            </Actions>
          </>
        ) : (
          <>
            <ReviewStep />
            <Actions>
              <Button variant="secondary" className="h-[46px] px-[18px]" onClick={() => url.push({ step: "2" })}>
                السابق
              </Button>
              <div className="flex gap-2.5">
                <Button variant="accent" className="h-11 px-[18px]" loading={create.isPending && !approve} disabled={create.isPending} onClick={() => create.mutate(undefined)}>
                  حفظ وجدولة الزيارات
                  <Icon name="check" size={16} />
                </Button>
                <Button variant="secondary" className="h-[46px]" disabled={create.isPending} onClick={() => setApprove(true)}>
                  اعتماد ونشر بدون زيارة
                  <Icon name="check" size={16} />
                </Button>
              </div>
            </Actions>
          </>
        )}
      </form>
      {approve ? (
        <ApproveModal short={shortBrand(brand)} name={brand} code={code} busy={create.isPending} onClose={() => setApprove(false)} onConfirm={(v) => create.mutate(v)} />
      ) : null}
      {leave ? (
        <LeaveModal
          onStay={() => setLeave(null)}
          onLeave={() => {
            saved.current = true;
            try {
              sessionStorage.removeItem(DRAFT);
            } catch {}
            router.push(leave);
          }}
        />
      ) : null}
    </FormProvider>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2.5">{children}</div>;
}

function toInput(v: WizardValues, publish?: { tier: Tier; rating: number; review: string }): NewProviderInput {
  const acc = v.accounts[0];
  return {
    type: v.type,
    brand: v.brand.trim(),
    brandEn: v.brandEn.trim(),
    city: v.city,
    legalName: v.legalName.trim(),
    unified: v.unified.replace(/\D/g, ""),
    vat: v.vat.replace(/\D/g, ""),
    cr: v.cr.replace(/\D/g, ""),
    code: v.code,
    ownerName: v.ownerName.trim(),
    ownerPhone: fmtPhone(v.ownerPhone),
    email: v.email.trim(),
    bank: acc.bank,
    accountName: acc.accountName.trim(),
    iban: acc.iban.replace(/\s/g, "").toUpperCase(),
    branches: v.branches.map((b) => ({
      name: branchTitle(b),
      district: b.district,
      city: b.city,
      code: b.code,
      main: b.main,
      services: b.services.map((s) => s.type),
      visitDate: b.visitDate,
      manager: b.manager.trim(),
      managerPhone: fmtPhone(b.managerPhone),
      address: b.address.trim(),
      hours: b.hours,
      technicians: b.technicians,
      slots: b.slots,
    })),
    publish,
  };
}

// ───────────── الخطوة 1 · CON5-07N1 المنشأة والمالك (3114-51246) ─────────────
function CompanyStep() {
  const toast = useToast();
  const { control, register, setValue, getValues, formState } = useFormContext<WizardValues>();
  const e = formState.errors;
  const accounts = useFieldArray({ control, name: "accounts" });
  const codes = useQuery({ queryKey: ["providers", "codes"], queryFn: api.providers.codes });
  const brandEn = useWatch({ control, name: "brandEn" });
  const docs = useWatch({ control, name: "docs" });
  const logo = useWatch({ control, name: "logo" });

  // الكود يُقترح تلقائياً من «العلامة بالإنجليزية» ويبقى قابلاً للتعديل
  useEffect(() => {
    if (getValues("codeEdited") || !codes.data) return;
    const c = suggestCode(brandEn, codes.data);
    if (c !== getValues("code")) setValue("code", c, { shouldDirty: true });
  }, [brandEn, codes.data, getValues, setValue]);

  const uploaded = (key: keyof WizardValues["docs"], label: string) => (files: FileList) => {
    setValue(`docs.${key}`, label, { shouldDirty: true });
    toast("رُفع الملف", `رُفع الملف · يراجعه قسم الجودة مع طلب الاعتماد`);
    void files;
  };
  const err = (k: keyof WizardValues) => (e[k] as { message?: string } | undefined)?.message;
  const text = (name: "brand" | "brandEn" | "legalName" | "ownerName" | "email", label: string, opts: { ltr?: boolean; placeholder?: string } = {}) => (
    <Field label={label} error={err(name)}>
      {(id) => <TextInput id={id} {...register(name)} ltr={opts.ltr} placeholder={opts.placeholder} invalid={!!e[name]} className={W_INPUT} />}
    </Field>
  );
  const digitsField = (name: "cr" | "vat" | "unified", label: string, max: number) => (
    <Field label={label} error={err(name)}>
      {(id) => <TextInput id={id} {...register(name, { onChange: (ev) => setValue(name, ev.target.value.replace(/\D/g, "").slice(0, max)) })} ltr inputMode="numeric" invalid={!!e[name]} className={`num ${W_INPUT}`} />}
    </Field>
  );

  return (
    <>
      <WCard title="نوع المنشأة">
        <Field label="النوع">{(id) => <Controller control={control} name="type" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={TYPES} className={W_SELECT} />} />}</Field>
      </WCard>

      <WCard title="العلامة التجارية والمنشأة">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {text("brand", "العلامة التجارية (تظهر للعملاء)", { placeholder: "مركز الواحة للعناية" })}
          {text("brandEn", "العلامة بالإنجليزية", { ltr: true, placeholder: "Al Waha Car Care" })}
          {text("legalName", "الاسم القانوني كما في السجل")}
          <Field label="المدينة الرئيسية" error={err("city")}>
            {(id) => <Controller control={control} name="city" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={CITY_OPTS} className={W_SELECT} />} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {digitsField("cr", "السجل التجاري", 10)}
          {digitsField("vat", "الرقم الضريبي", 15)}
          {digitsField("unified", "الرقم الوطني الموحد", 10)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-3">
          <Field label="كود مقدّم الخدمة" error={err("code")}>
            {(id) => (
              <TextInput
                id={id}
                {...register("code", { onChange: (ev) => (setValue("code", ev.target.value.toUpperCase()), setValue("codeEdited", true)) })}
                ltr
                invalid={!!e.code}
                placeholder="LK-XX-001"
                className={`bg-surface-1! ${W_INPUT}`}
              />
            )}
          </Field>
          <LogoField
            value={logo}
            onChange={(name) => {
              setValue("logo", name, { shouldDirty: true });
              toast("رُفع الملف", "رُفع الملف · يراجعه قسم الجودة مع طلب الاعتماد");
            }}
          />
        </div>
      </WCard>

      <WCard title="المالك والتواصل">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {text("ownerName", "اسم المالك")}
          <Field label="جوال المالك" error={err("ownerPhone")}>
            {(id) => <TextInput id={id} {...register("ownerPhone", { onBlur: (ev) => setValue("ownerPhone", fmtPhone(ev.target.value)) })} ltr inputMode="tel" placeholder="05X XXX XXXX" invalid={!!e.ownerPhone} className={`num ${W_INPUT}`} />}
          </Field>
          {text("email", "البريد", { ltr: true, placeholder: "name@company.sa" })}
        </div>
        <Controller
          control={control}
          name="nationalId"
          render={({ field }) => <NationalIdField value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={e.nationalId?.message} />}
        />
      </WCard>

      <WCard title="الحساب البنكي لاستلام المستحقات" plain>
        {accounts.fields.map((a, i) => (
          <div key={a.id} className={`flex flex-col gap-3.5 ${i ? "border-t border-border pt-3.5" : ""}`}>
            {i ? (
              <div className="flex items-center justify-between">
                <span className="text-14 font-bold text-ink">حساب {i + 1}</span>
                <Button variant="ghost" size="S" className="text-danger!" onClick={() => accounts.remove(i)}>
                  حذف
                </Button>
              </div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="البنك" error={e.accounts?.[i]?.bank?.message}>
                {(id) => <Controller control={control} name={`accounts.${i}.bank`} render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={BANK_OPTS} className={W_SELECT} />} />}
              </Field>
              <Field label="اسم صاحب الحساب" error={e.accounts?.[i]?.accountName?.message}>
                {(id) => <TextInput id={id} {...register(`accounts.${i}.accountName`)} invalid={!!e.accounts?.[i]?.accountName} className={W_INPUT} />}
              </Field>
            </div>
            <Field label="رقم الآيبان (IBAN)" error={e.accounts?.[i]?.iban?.message}>
              {(id) => (
                <TextInput
                  id={id}
                  {...register(`accounts.${i}.iban`, { onChange: (ev) => setValue(`accounts.${i}.iban`, fmtIban(ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24))) })}
                  ltr
                  placeholder="SA00 0000 0000 0000 0000 0000"
                  invalid={!!e.accounts?.[i]?.iban}
                  className={`num ${W_INPUT}`}
                />
              )}
            </Field>
          </div>
        ))}
        <Button variant="secondary" className="h-[46px] self-start px-[18px]" onClick={() => accounts.append({ bank: BANKS[0], accountName: getValues("legalName"), iban: "" })}>
          إضافة حساب بنكي أو محفظة
          <Icon name="download" size={16} />
        </Button>
      </WCard>

      <WCard title="مستندات المنشأة">
        <DocRow label="السجل التجاري" status={docs.cr ? "مرفوع" : ""} onFile={uploaded("cr", "مرفوع")} />
        <DocRow label="شهادة ضريبة القيمة المضافة" status={docs.vat ? "مرفوعة" : ""} onFile={uploaded("vat", "مرفوعة")} />
        <DocRow label="الاتفاقية مع لينكار" status={docs.agreement ? "مرفوعة" : ""} onFile={uploaded("agreement", "مرفوعة")} />
      </WCard>
    </>
  );
}

/** الشعار: مربع 132 بإطار متقطع · صورة 84 r18.7 + «تغيير الشعار» 12 Medium أخضر */
function LogoField({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-12 font-medium text-muted">الشعار</span>
      <button type="button" onClick={() => ref.current?.click()} className="flex size-[132px] flex-col items-center gap-1.5 rounded-12 border border-dashed border-[#bfc8c4] bg-white px-3 py-2.5 hover:bg-surface-1">
        <span className="flex size-[84px] items-center justify-center overflow-hidden rounded-[18.7px] border border-border bg-white text-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-contain" />
          ) : (
            <Icon name="store" size={28} />
          )}
        </span>
        <span className="text-12 leading-[23px] font-medium text-[#3bb34b]">{value ? "تغيير الشعار" : "رفع الشعار"}</span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setPreview(URL.createObjectURL(f));
          onChange(f.name);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** رقم الهوية: يُكتب كاملاً، ويُعرض مخفياً بعد الخروج من الحقل (1 •••• •••• 4418) */
function NationalIdField({ value, onChange, onBlur, error }: { value: string; onChange: (v: string) => void; onBlur: () => void; error?: string }) {
  const [focused, setFocused] = useState(false);
  const show = focused || !/^\d{10}$/.test(value) ? value : maskId(value);
  return (
    <Field label="رقم الهوية" error={error}>
      {(id) => (
        <TextInput
          id={id}
          value={show}
          ltr
          inputMode="numeric"
          autoComplete="off"
          invalid={!!error}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onChange={(ev) => onChange(ev.target.value.replace(/\D/g, "").slice(0, 10))}
          className={`num ${W_INPUT}`}
        />
      )}
    </Field>
  );
}

// ───────────── الخطوة 3 · CON5-07N3 المراجعة والحفظ (3114-51438) — ملخص للقراءة فقط ─────────────
function ReviewStep() {
  const v = useFormContext<WizardValues>().getValues();
  const acc = v.accounts[0];
  const docs = [v.docs.cr ? "السجل التجاري ✓" : "", v.docs.vat ? "شهادة الضريبة ✓" : "", v.docs.agreement ? "الاتفاقية ✓" : ""].filter(Boolean).join(" · ") || "—";
  return (
    <>
      <WCard title="المنشأة">
        <div className="flex flex-col">
          <ModalKV k="النوع">{v.type === "care" ? "مركز عناية" : "مغسلة سيارات"}</ModalKV>
          <ModalKV k="العلامة التجارية">
            {v.brand} · <bdi dir="ltr">{v.brandEn}</bdi> · <bdi dir="ltr">{v.code}</bdi>
          </ModalKV>
          <ModalKV k="الاسم القانوني">{v.legalName}</ModalKV>
          <ModalKV k="السجل · الضريبي · الموحد">
            <bdi dir="ltr" className="num">
              {v.cr} · {v.vat} · {v.unified}
            </bdi>
          </ModalKV>
          <ModalKV k="المالك">
            {v.ownerName} · <bdi dir="ltr">{fmtPhone(v.ownerPhone)}</bdi> · <bdi dir="ltr">{v.email}</bdi>
          </ModalKV>
          <ModalKV k="المستندات">{docs}</ModalKV>
          <ModalKV k="الحساب البنكي">
            {acc.bank} <bdi dir="ltr">•••• {acc.iban.replace(/\s/g, "").slice(-4)}</bdi> · {acc.accountName}
          </ModalKV>
          <ModalKV k="لوحة المزوّد">حساب المالك {v.ownerName}</ModalKV>
        </div>
      </WCard>
      <WCard title={`الفروع (${v.branches.length}) والزيارات الميدانية`}>
        {v.branches.map((b, i) => (
          <section key={i} className="flex flex-col gap-2 rounded-12 border border-border p-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] leading-6 font-bold text-ink">
                الفرع {i + 1} · {branchTitle(b)}
                {b.main ? " · الرئيسي" : ""}
              </h3>
              <span className="inline-flex h-6 items-center rounded-full bg-[#fdf3e1] px-2.5 text-12 leading-[18px] font-medium text-warning">بانتظار الزيارة الميدانية</span>
            </div>
            <ModalKV k="الكود والخدمات">
              <bdi dir="ltr">{b.code}</bdi> · {b.services.map((s) => s.type).join(" · ")}
            </ModalKV>
            <ModalKV k="الزيارة الميدانية">موعد الزيارة: {visitDates([b.visitDate])}</ModalKV>
          </section>
        ))}
      </WCard>
    </>
  );
}
