"use client";

import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getBusinessDict } from "@/i18n/dict/business";
import type { providerJoin } from "@/lib/data/business/providers";
import type { Option } from "@/lib/data/business/types";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { Toast, useFlash } from "@/components/gift/Popup";
import { ChipGroup, clean, Consent, demoFile, FileBox, fileSize, re, Row, SectionHead, SelectField, TextField } from "./fields";
import { useForm } from "./useForm";

type Data = typeof providerJoin & { cities: Option[]; branchCounts: Option[] };

// W2-90b · نموذج طلب الانضمام · مقدّم خدمة
export function ProviderJoinForm({ locale, d, next, demo = false }: { locale: Locale; d: Data; next: string; demo?: boolean }) {
  const b = getBusinessDict(locale);
  const e = b.errors;
  const L = (k: string) => (d as unknown as Record<string, string>)[`${k}_${locale}`];
  const opt = (o: Option) => ({ value: o.value, label: tx(locale, o, "label") });
  const [toast, flash] = useFlash();

  const { values: v, set, errors, onSubmit } = useForm(
    () => ({
      tradeName: "",
      cr: "",
      city: demo ? "jeddah" : "",
      vat: "",
      branches: "",
      location: "",
      services: (demo ? ["nano-ceramic", "tint", "ppf"] : []) as string[],
      name: "",
      role: "",
      phone: "",
      email: "",
      crDoc: (demo ? demoFile(locale === "en" ? "Commercial registration.pdf" : "السجل التجاري.pdf", 1.2) : null) as File | null,
      photos: [] as File[],
      consent: demo,
    }),
    (x) => {
      const r: Record<string, string> = {};
      if (!x.tradeName.trim()) r.tradeName = e.required;
      if (!re.digits(10).test(clean(x.cr))) r.cr = e.digits(10);
      if (!x.city) r.city = e.required;
      if (x.vat.trim() && !re.digits(15).test(clean(x.vat))) r.vat = e.digits15;
      if (!x.branches) r.branches = e.required;
      if (!x.location.trim()) r.location = e.required;
      if (!x.services.length) r.services = e.pickOne;
      if (!x.name.trim()) r.name = e.required;
      if (!x.role.trim()) r.role = e.required;
      if (!re.phone.test(clean(x.phone))) r.phone = e.phone;
      if (!re.email.test(x.email.trim())) r.email = e.email;
      if (!x.crDoc) r.crDoc = e.file;
      if (!x.consent) r.consent = e.consent;
      return r;
    },
    next,
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-1 flex-col gap-7 rounded-xl border border-border-default bg-white p-5 md:p-8">
      <section className="flex flex-col gap-4">
        <SectionHead title={L("s1")} />
        <Row>
          <TextField label={L("trade_name")} name="tradeName" value={v.tradeName} onChange={set("tradeName")} placeholder={L("trade_name_ph")} error={errors.tradeName} autoComplete="organization" />
          <TextField label={L("cr")} name="cr" value={v.cr} onChange={set("cr")} placeholder={L("cr_ph")} inputMode="numeric" error={errors.cr} />
        </Row>
        <Row>
          <SelectField label={L("city")} name="city" value={v.city} onChange={set("city")} placeholder={L("city")} options={d.cities.map(opt)} error={errors.city} />
          <TextField label={L("vat")} name="vat" value={v.vat} onChange={set("vat")} placeholder={L("vat_ph")} inputMode="numeric" error={errors.vat} />
        </Row>
        <Row>
          <SelectField label={L("branches")} name="branches" value={v.branches} onChange={set("branches")} placeholder={L("branches_ph")} options={d.branchCounts.map(opt)} error={errors.branches} />
          <TextField label={L("location")} name="location" value={v.location} onChange={set("location")} placeholder={L("location_ph")} icon="map-pin" type="url" inputMode="url" error={errors.location} />
        </Row>
      </section>

      <hr className="border-border-default" />

      <ChipGroup legend={L("s2")} hint={L("s2_hint")} options={d.services.map(opt)} value={v.services} onChange={set("services")} error={errors.services} />

      <hr className="border-border-default" />

      <section className="flex flex-col gap-4">
        <SectionHead title={L("s3")} />
        <Row>
          <TextField label={L("name")} name="name" value={v.name} onChange={set("name")} placeholder={L("name_ph")} error={errors.name} autoComplete="name" />
          <TextField label={L("role")} name="role" value={v.role} onChange={set("role")} placeholder={L("role_ph")} error={errors.role} autoComplete="organization-title" />
        </Row>
        <Row>
          <TextField label={L("phone")} name="phone" value={v.phone} onChange={set("phone")} placeholder="05X XXX XXXX" icon="phone" type="tel" inputMode="tel" error={errors.phone} autoComplete="tel" />
          <TextField label={L("email")} name="email" value={v.email} onChange={set("email")} placeholder={d.email_ph} icon="mail" type="email" error={errors.email} autoComplete="email" />
        </Row>
      </section>

      <hr className="border-border-default" />

      <section className="flex flex-col gap-4">
        <SectionHead title={L("s4")} />
        <FileBox
          label={`${L("cr_doc")} (PDF)`}
          accept="application/pdf"
          file={v.crDoc}
          onFile={(f) => {
            if (!f && v.crDoc) flash(b.fileDeleted);
            set("crDoc")(f);
          }}
          removeLabel={b.remove}
          sizeText={(f) => fileSize(f, b.mb, b.kb)}
          error={errors.crDoc}
        />
        <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border border-dashed border-nature-green p-6 text-center hover:bg-tint-lime">
          <Icon name="camera" size={24} className="text-nature-green" />
          <span className="text-label-m text-green-active">{L("photos")}</span>
          <span className="text-caption text-text-secondary">{v.photos.length ? b.photosAttached(v.photos.length) : L("photos_hint")}</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="sr-only"
            onChange={(ev) => {
              const files = Array.from(ev.target.files ?? []).slice(0, 10);
              set("photos")(files);
              if (files.length) flash(files.length === 1 ? b.fileAttached : b.photosAttached(files.length));
            }}
          />
        </label>
      </section>

      <Consent checked={v.consent} onChange={set("consent")} error={errors.consent}>
        {L("consent")}
      </Consent>

      {/* زر الإرسال في آخر السطر (يسار في العربي) زي الفيجما */}
      <div className="flex justify-end">
        <button type="submit" className={actionClass("primary")}>
          {L("submit")}
          <Icon name="chevron-left" size={16} flip />
        </button>
      </div>
      <Toast message={toast} />
    </form>
  );
}
