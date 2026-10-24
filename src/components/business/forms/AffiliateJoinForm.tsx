"use client";

import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getBusinessDict } from "@/i18n/dict/business";
import type { affiliateJoin } from "@/lib/data/business/affiliates";
import type { Option } from "@/lib/data/business/types";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { Toast, useFlash } from "@/components/gift/Popup";
import { ChipGroup, clean, Consent, FileBox, fileSize, re, Row, SearchField, SectionHead, TextField } from "./fields";
import { useForm } from "./useForm";

type Data = typeof affiliateJoin & { cities: Option[] };

// W2-94b · نموذج طلب الانضمام · مسوّق
export function AffiliateJoinForm({ locale, d, next, demo = false }: { locale: Locale; d: Data; next: string; demo?: boolean }) {
  const b = getBusinessDict(locale);
  const e = b.errors;
  const L = (k: string) => (d as unknown as Record<string, string>)[`${k}_${locale}`];
  const [toast, flash] = useFlash();

  const { values: v, set, errors, onSubmit } = useForm(
    () => ({
      name: demo ? d[`name_ph_${locale}`] : "",
      phone: "",
      email: "",
      city: "",
      id: "",
      channels: (demo ? ["whatsapp", "snapchat"] : []) as string[],
      account: "",
      iban: "",
      bankDoc: null as File | null,
      consent: demo,
    }),
    (x) => {
      const r: Record<string, string> = {};
      if (!x.name.trim()) r.name = e.required;
      if (!re.phone.test(clean(x.phone))) r.phone = e.phone;
      if (!re.email.test(x.email.trim())) r.email = e.email;
      if (!x.city.trim()) r.city = e.required;
      if (!re.digits(10).test(clean(x.id))) r.id = e.digits(10);
      if (!x.channels.length) r.channels = e.pickOne;
      // الحساب البنكي اختياري الآن — بس لو اتكتب لازم يكون صحيح
      if (x.iban.trim() && !re.iban.test(clean(x.iban).toUpperCase())) r.iban = e.iban;
      if (!x.consent) r.consent = e.consent;
      return r;
    },
    next,
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border-default bg-white p-5 md:p-8">
      <SectionHead title={L("s1")} />
      <Row>
        <TextField label={L("name")} name="name" value={v.name} onChange={set("name")} placeholder={L("name_ph")} icon="user" error={errors.name} autoComplete="name" />
        <TextField label={L("phone")} name="phone" value={v.phone} onChange={set("phone")} placeholder="05X XXX XXXX" icon="phone" type="tel" inputMode="tel" error={errors.phone} autoComplete="tel" />
      </Row>
      <p className="text-caption text-text-secondary">{L("phone_hint")}</p>
      <Row>
        <TextField label={L("email")} name="email" value={v.email} onChange={set("email")} placeholder={d.email_ph} icon="mail" type="email" error={errors.email} autoComplete="email" />
        <SearchField label={L("city")} name="city" value={v.city} onChange={set("city")} placeholder={L("city_ph")} options={d.cities.map((c) => tx(locale, c, "label"))} icon="map-pin" error={errors.city} />
      </Row>
      <TextField label={L("id")} name="id" value={v.id} onChange={set("id")} placeholder={L("id_ph")} icon="file" inputMode="numeric" error={errors.id} />

      <ChipGroup
        legend={L("s2")}
        hint={L("s2_hint")}
        options={d.channels.map((o) => ({ value: o.value, label: tx(locale, o, "label") }))}
        value={v.channels}
        onChange={set("channels")}
        error={errors.channels}
        selectedText="white"
        spaced
      />
      <TextField label={L("account")} name="account" value={v.account} onChange={set("account")} placeholder={d.account_ph} icon="share" />

      <SectionHead title={L("s3")} hint={L("s3_hint")} spaced />
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <TextField className="md:max-w-[378px]" label={L("iban")} name="iban" value={v.iban} onChange={set("iban")} placeholder={d.iban_ph} icon="card" error={errors.iban} />
        <FileBox
          label={L("bank_doc")}
          accept="application/pdf"
          file={v.bankDoc}
          onFile={(f) => {
            if (!f && v.bankDoc) flash(b.fileDeleted);
            set("bankDoc")(f);
          }}
          removeLabel={b.remove}
          sizeText={(f) => fileSize(f, b.mb, b.kb)}
        />
      </div>

      <Consent checked={v.consent} onChange={set("consent")} error={errors.consent}>
        {L("consent")}
      </Consent>
      <div>
        <button type="submit" className={actionClass("primary")}>
          {L("submit")}
          <Icon name="check" size={16} />
        </button>
      </div>
      <Toast message={toast} />
    </form>
  );
}
