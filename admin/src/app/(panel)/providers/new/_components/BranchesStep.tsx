"use client";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { CITIES, DISTRICTS, HOURS } from "@/lib/api/providers";
import { phone as fmtPhone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { DateField, W_INPUT, W_SELECT } from "../../_components/form-bits";
import { DocRow, RadioCard, SubTitle } from "./bits";
import { branchCode, branchMissing, branchTitle, emptyBranch, joinAr, shortBrand, type WizardValues } from "./schema";
import { AddServiceModal, CRITERIA, CriteriaLink, CriteriaModal } from "./WizardModals";

// ───────────── الخطوة 2 · CON5-07N2 الفروع — الفرع 1 مفتوح (3114-51551) · الفرع 2 مفتوح (3114-51732) ─────────────
// «−» و«+» يغيّران عدد بطاقات الفروع. بطاقة واحدة مفتوحة كل مرة، والباقي مطوي يعرض الكود والتصنيفات و«غير مكتمل» مع الناقص.
// إضافة خدمة لهذا الفرع → CON5-07M (3114-53607) · روابط المعايير → CON5-07N (عرض فقط). النوافذ في الرابط: ?modal=add-service|criteria
const CITY_OPTS = CITIES.map((c) => ({ value: c, label: c }));
const HOUR_OPTS = HOURS.map((h) => ({ value: h, label: h }));
const REGISTRY = [{ value: "same", label: "نفس بيانات المنشأة" }]; // TODO(API): باقي الخيارات من القائمة المرجعية (القسم 17)

export function BranchesStep() {
  const url = useUrlState();
  const toast = useToast();
  const { control, getValues, setValue, formState } = useFormContext<WizardValues>();
  const branches = useFieldArray({ control, name: "branches" });
  const values = useWatch({ control, name: "branches" });
  const code = useWatch({ control, name: "code" });
  const brand = useWatch({ control, name: "brand" });
  const [open, setOpen] = useState(0);
  const modal = url.get("modal");
  const mb = Number(url.get("b") ?? 0);

  // جوال الفرع ومسؤول التواصل يبدآن ببيانات المالك (CON5-07N2: «الجوال» = جوال المالك)
  useEffect(() => {
    const v = getValues();
    v.branches.forEach((b, i) => {
      if (!b.phone) setValue(`branches.${i}.phone`, v.ownerPhone);
      if (!b.contact) setValue(`branches.${i}.contact`, v.ownerName);
    });
  }, [getValues, setValue]);

  // أكواد الفروع تُقترح من كود المنشأة والحي (LK-WA-NR-001) ما لم تُعدَّل يدوياً
  useEffect(() => {
    values.forEach((b, i) => {
      if (b.codeEdited) return;
      const c = branchCode(code, b.district, i);
      if (c && c !== b.code) setValue(`branches.${i}.code`, c, { shouldDirty: true });
    });
  }, [values, code, setValue]);

  const setCount = (n: number) => {
    if (n < 1 || n > 20) return;
    if (n > branches.fields.length) {
      const v = getValues();
      branches.append(emptyBranch(false, v.city, v.ownerPhone, v.ownerName));
      setOpen(n - 1);
    } else {
      branches.remove(branches.fields.length - 1);
      setOpen((o) => Math.min(o, n - 1));
    }
  };
  // لو فيه خطأ في فرع مطوي بعد «التالي» افتحه
  const errs = formState.errors.branches;
  const errIdx = Array.isArray(errs) ? errs.findIndex(Boolean) : -1;
  const [seenErr, setSeenErr] = useState(-1);
  if (errIdx !== seenErr) {
    setSeenErr(errIdx);
    if (errIdx >= 0) setOpen(errIdx);
  }

  const n = branches.fields.length;
  return (
    <>
      <section className="flex items-center justify-between gap-3.5 rounded-16 border border-border bg-white px-5 py-4">
        <h2 className="text-16 leading-[26px] font-bold text-ink">عدد الفروع</h2>
        <div className="flex h-[42px] items-center rounded-10 border border-border" role="group" aria-label="عدد الفروع">
          <button type="button" aria-label="فرع أقل" onClick={() => setCount(n - 1)} disabled={n <= 1} className="flex h-10 w-11 items-center justify-center text-16 font-medium text-ink disabled:text-border-strong">
            −
          </button>
          <span className="num flex h-10 w-11 items-center justify-center text-16 font-bold text-ink" aria-live="polite">
            {n}
          </span>
          <button type="button" aria-label="فرع إضافي" onClick={() => setCount(n + 1)} className="flex h-10 w-11 items-center justify-center text-16 font-medium text-ink">
            +
          </button>
        </div>
      </section>
      {branches.fields.map((f, i) =>
        i === open ? (
          <BranchCard key={f.id} i={i} brand={brand} onMain={() => values.forEach((_, j) => j !== i && setValue(`branches.${j}.main`, false))} openModal={(m, extra) => url.push({ modal: m, b: String(i), ...extra })} />
        ) : (
          <Collapsed key={f.id} i={i} onOpen={() => setOpen(i)} />
        ),
      )}
      {formState.errors.branches?.root?.message ? <p className="text-12 text-danger">{formState.errors.branches.root.message}</p> : null}

      {modal === "add-service" && values[mb] ? (
        <AddServiceModal
          branch={branchTitle(values[mb])}
          brand={brand}
          taken={values[mb].services.map((s) => s.type)}
          onClose={() => url.replace({ modal: null, b: null })}
          onCriteria={(k) => url.push({ modal: "criteria", c: k })}
          onAdd={(s) => {
            setValue(`branches.${mb}.services`, [...values[mb].services, s], { shouldDirty: true, shouldValidate: formState.isSubmitted });
            url.replace({ modal: null, b: null });
            toast("أُضيفت خدمة", `أُضيفت ${s.type} إلى ${branchTitle(values[mb])} · تُقيَّم معاييرها في زيارة الفرع`);
          }}
        />
      ) : null}
      {modal === "criteria" && url.get("c") ? <CriteriaModal kind={url.get("c")!} onClose={() => window.history.back()} /> : null}
    </>
  );
}

function Collapsed({ i, onOpen }: { i: number; onOpen: () => void }) {
  const b = useWatch({ control: useFormContext<WizardValues>().control, name: `branches.${i}` });
  const missing = branchMissing(b);
  const services = b.services.map((s) => s.type).join(" · ");
  return (
    <button type="button" onClick={onOpen} aria-expanded={false} className="flex items-center gap-2.5 rounded-16 border border-border bg-white px-[18px] py-3.5 text-start hover:bg-surface-1">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] leading-6 font-bold text-ink">
          الفرع {i + 1} · {branchTitle(b)}
          {b.main ? " · الرئيسي" : ""}
        </span>
        <span className="truncate text-12 leading-[18px] font-light text-muted">
          {b.code ? <bdi dir="ltr">{b.code}</bdi> : null}
          {[b.code ? "" : null, services || null, missing.length ? `ينقصه: ${joinAr(missing)}` : "كل الحقول مكتملة"].filter((x) => x != null).join(" · ")}
        </span>
      </span>
      {missing.length ? (
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#fdf3e1] px-2.5 text-12 leading-[18px] font-medium text-warning">غير مكتمل</span>
      ) : (
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-success-tint px-2.5 text-12 leading-[18px] font-medium text-success">مكتمل</span>
      )}
      <Icon name="chevron-down" size={18} className="shrink-0 text-ink" />
    </button>
  );
}

function BranchCard({ i, brand, onMain, openModal }: { i: number; brand: string; onMain: () => void; openModal: (m: string, extra?: Record<string, string>) => void }) {
  const toast = useToast();
  const { control, register, setValue, formState } = useFormContext<WizardValues>();
  const b = useWatch({ control, name: `branches.${i}` });
  const e = formState.errors.branches?.[i];
  const p = `branches.${i}` as const;
  const districts = (DISTRICTS[b.city] ?? []).map((d) => ({ value: d, label: d }));
  const input = (name: "manager" | "managerPhone" | "phone" | "email" | "contact" | "slots" | "technicians" | "address" | "customName", label: string, opts: { ltr?: boolean; placeholder?: string; tel?: boolean; num?: boolean } = {}) => (
    <Field label={label} error={e?.[name]?.message}>
      {(id) => (
        <TextInput
          id={id}
          {...register(`${p}.${name}`, opts.tel ? { onBlur: (ev) => setValue(`${p}.${name}`, fmtPhone(ev.target.value)) } : opts.num ? { onChange: (ev) => setValue(`${p}.${name}`, ev.target.value.replace(/\D/g, "").slice(0, 2)) } : undefined)}
          ltr={opts.ltr}
          inputMode={opts.tel ? "tel" : opts.num ? "numeric" : undefined}
          placeholder={opts.placeholder}
          invalid={!!e?.[name]}
          className={`${opts.num || opts.tel ? "num " : ""}${W_INPUT}`}
        />
      )}
    </Field>
  );
  const uploaded = (key: "license" | "civil") => () => {
    setValue(`${p}.docs.${key}`, "uploaded", { shouldDirty: true });
    toast("رُفع الملف", "رُفع الملف · يراجعه قسم الجودة مع طلب الاعتماد");
  };

  return (
    <section aria-label={`الفرع ${i + 1}`} className="flex flex-col gap-3.5 rounded-16 border-[1.5px] border-ink bg-white px-5 pt-[18px] pb-5">
      <h2 className="text-[17px] leading-7 font-bold text-ink">
        الفرع {i + 1} · {branchTitle(b)}
        {b.main ? " · الرئيسي" : ""}
      </h2>

      <SubTitle>هوية الفرع</SubTitle>
      <div role="radiogroup" aria-label="هوية الفرع" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <RadioCard checked={b.identity === "brand-district"} onSelect={() => setValue(`${p}.identity`, "brand-district", { shouldDirty: true })}>
          اسم المنشأة + الحي
        </RadioCard>
        <RadioCard checked={b.identity === "custom"} onSelect={() => setValue(`${p}.identity`, "custom", { shouldDirty: true })}>
          اسم مختلف للفرع
        </RadioCard>
      </div>
      {b.identity === "custom" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {input("customName", "اسم الفرع", { placeholder: "مثل فرع يعمل بعلامة أخرى" })}
          <p className="self-end pb-3 text-12 font-light text-muted">
            يظهر للعميل «{b.customName.trim() || `${shortBrand(brand)} · ${b.district || "الحي"}`}»
          </p>
        </div>
      ) : b.district ? (
        <p className="text-12 font-light text-muted">
          يظهر للعميل «{shortBrand(brand)} · {b.district}»
        </p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="كود الفرع" error={e?.code?.message}>
          {(id) => (
            <TextInput
              id={id}
              {...register(`${p}.code`, { onChange: (ev) => (setValue(`${p}.code`, ev.target.value.toUpperCase()), setValue(`${p}.codeEdited`, true)) })}
              ltr
              placeholder="LK-XX-XX-001"
              invalid={!!e?.code}
              className={`bg-surface-1! ${W_INPUT}`}
            />
          )}
        </Field>
        <Field label="السجل والرقم الضريبي">{(id) => <Controller control={control} name={`${p}.registry`} render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={REGISTRY} className={W_SELECT} />} />}</Field>
      </div>
      <label className="flex items-center justify-between gap-2.5">
        <span className="text-13 leading-5 font-medium text-ink">الفرع الرئيسي للمنشأة</span>
        <Switch
          checked={b.main}
          label="الفرع الرئيسي للمنشأة"
          onCheckedChange={(v) => {
            setValue(`${p}.main`, v, { shouldDirty: true });
            if (v) onMain();
          }}
        />
      </label>

      <SubTitle>الموقع</SubTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="المدينة" error={e?.city?.message}>
          {(id) => (
            <Controller
              control={control}
              name={`${p}.city`}
              render={({ field }) => (
                <Select
                  id={id}
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue(`${p}.district`, "");
                  }}
                  options={CITY_OPTS}
                  className={W_SELECT}
                />
              )}
            />
          )}
        </Field>
        <Field label="الحي" error={e?.district?.message}>
          {(id) => <Controller control={control} name={`${p}.district`} render={({ field }) => <Select id={id} value={field.value || undefined} onChange={field.onChange} options={districts} invalid={!!e?.district} className={W_SELECT} />} />}
        </Field>
      </div>
      <Field label="العنوان" error={e?.address?.message}>
        {(id) => (
          <div className="relative">
            <TextInput id={id} {...register(`${p}.address`)} placeholder="الشارع، الحي" invalid={!!e?.address} className={`pe-9! ${W_INPUT}`} />
            <Icon name="map-pin" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink" />
          </div>
        )}
      </Field>
      {/* TODO(API): اختيار الموقع من الخريطة وتعبئة العنوان منه (القسم 18.1) */}
      <div aria-hidden className="flex h-[120px] items-center justify-center rounded-12 bg-[#e7efe9] text-ink">
        <Icon name="map-pin" size={28} />
      </div>

      <SubTitle>التواصل</SubTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {input("manager", "مدير الفرع")}
        {input("managerPhone", "جوال المدير", { ltr: true, tel: true, placeholder: "05X XXX XXXX" })}
        {input("phone", "الجوال", { ltr: true, tel: true, placeholder: "05X XXX XXXX" })}
        {input("email", "بريد الفرع", { ltr: true, placeholder: "branch@company.sa" })}
        {b.main ? null : input("contact", "مسؤول التواصل مع لينكار")}
      </div>

      <SubTitle>التشغيل</SubTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="ساعات العمل" error={e?.hours?.message}>
          {(id) => <Controller control={control} name={`${p}.hours`} render={({ field }) => <Select id={id} value={field.value || undefined} onChange={field.onChange} options={HOUR_OPTS} icon="clock" invalid={!!e?.hours} className={W_SELECT} />} />}
        </Field>
        {input("slots", "فتحات العمل", { ltr: true, num: true })}
        {input("technicians", "عدد الفنيين", { ltr: true, num: true })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="قدرة الاستيعاب (تُحسب تلقائياً)">{(id) => <TextInput id={id} value="—" readOnly disabled className={`bg-[#f1f3f2]! ${W_INPUT}`} />}</Field>
        <Field label="موعد الزيارة الميدانية" error={e?.visitDate?.message}>
          {(id) => <Controller control={control} name={`${p}.visitDate`} render={({ field }) => <DateField id={id} value={field.value} onChange={field.onChange} min="2026-10-15" invalid={!!e?.visitDate} className="h-11" noIcon />} />}
        </Field>
      </div>

      <SubTitle>الخدمات في هذا الفرع</SubTitle>
      {b.services.map((s, k) => (
        <div key={s.type} className="flex items-center gap-3 rounded-12 border border-border bg-white px-3.5 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-14 leading-[22px] font-semibold text-ink">{s.type}</span>
            <span className="text-12 leading-[18px] font-light text-muted">
              مدة التنفيذ: من {s.from} إلى {s.to}
            </span>
          </div>
          {CRITERIA[s.type] ? <CriteriaLink label="معايير الاعتماد" onClick={() => openModal("criteria", { c: s.type })} /> : null}
          <button
            type="button"
            aria-label={`حذف ${s.type}`}
            onClick={() => setValue(`${p}.services`, b.services.filter((_, j) => j !== k), { shouldDirty: true })}
            className="flex size-8 shrink-0 items-center justify-center rounded-8 text-muted hover:bg-surface-1 hover:text-danger"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
      {e?.services?.message ? (
        <p role="alert" className="text-12 text-danger">
          {e.services.message}
        </p>
      ) : null}
      <Button variant="secondary" className="h-[38px] self-start rounded-10 px-3 text-13" onClick={() => openModal("add-service")}>
        إضافة خدمة لهذا الفرع
        <Icon name="plus" size={14} />
      </Button>
      <CriteriaLink block label="المعايير الأساسية لقبول الفرع" onClick={() => openModal("criteria", { c: "base" })} />

      <SubTitle>مستندات الفرع</SubTitle>
      <DocRow label="رخصة البلدية" status={b.docs.license ? "مرفوعة" : ""} onFile={uploaded("license")} />
      <DocRow label="شهادة الدفاع المدني" status={b.docs.civil ? "مرفوعة" : ""} onFile={uploaded("civil")} />
      <DocRow
        label="صور الفرع (الواجهة والفتحات)"
        status={b.docs.photos ? `${b.docs.photos} صور` : ""}
        accept="image/*"
        multiple
        onFile={(files) => {
          setValue(`${p}.docs.photos`, b.docs.photos + files.length, { shouldDirty: true });
          toast("رُفع الملف", "رُفع الملف · يراجعه قسم الجودة مع طلب الاعتماد");
        }}
      />
    </section>
  );
}
