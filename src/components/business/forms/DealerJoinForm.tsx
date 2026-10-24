"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getBusinessDict } from "@/i18n/dict/business";
import type { dealerJoin } from "@/lib/data/business/dealers";
import type { Option } from "@/lib/data/business/types";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { Toast, useFlash } from "@/components/gift/Popup";
import { clean, Consent, FieldError, FileBox, fileSize, re, Row, SearchField, SectionHead, SelectField, TextField } from "./fields";
import { useForm } from "./useForm";

type Data = typeof dealerJoin & { cities: Option[]; volumeRanges: Option[] };
type Person = { name: string; role: string; phone: string; email: string };
const emptyPerson: Person = { name: "", role: "", phone: "", email: "" };

// W2-91b · نموذج طلب الانضمام · وكالة
export function DealerJoinForm({ locale, d, next, demo = false }: { locale: Locale; d: Data; next: string; demo?: boolean }) {
  const b = getBusinessDict(locale);
  const e = b.errors;
  const L = (k: string) => (d as unknown as Record<string, string>)[`${k}_${locale}`];
  const cityNames = d.cities.map((c) => tx(locale, c, "label"));
  const [cityQuery, setCityQuery] = useState("");
  const [toast, flash] = useFlash();

  const { values: v, set, errors, onSubmit } = useForm(
    () => ({
      name: "",
      city: "",
      cr: "",
      vat: "",
      crDoc: null as File | null,
      vatDoc: null as File | null,
      people: [{ ...emptyPerson }] as Person[],
      payment: "credit",
      volume: "",
      cities: [] as string[],
      consent: demo,
    }),
    (x) => {
      const r: Record<string, string> = {};
      if (!x.name.trim()) r.name = e.required;
      if (!x.city.trim()) r.city = e.required;
      if (!re.digits(10).test(clean(x.cr))) r.cr = e.digits(10);
      if (!re.digits(15).test(clean(x.vat))) r.vat = e.digits15;
      if (!x.crDoc) r.crDoc = e.file;
      if (!x.vatDoc) r.vatDoc = e.file;
      x.people.forEach((p, i) => {
        if (!p.name.trim()) r[`p${i}name`] = e.required;
        if (!p.role.trim()) r[`p${i}role`] = e.required;
        if (!re.phone.test(clean(p.phone))) r[`p${i}phone`] = e.phone;
        if (!re.email.test(p.email.trim())) r[`p${i}email`] = e.email;
      });
      if (!x.volume) r.volume = e.required;
      if (!x.cities.length) r.cities = e.pickOne;
      if (!x.consent) r.consent = e.consent;
      return r;
    },
    next,
  );
  const err = errors as Record<string, string | undefined>;

  const setPerson = (i: number, k: keyof Person) => (val: string) => set("people")(v.people.map((p, j) => (j === i ? { ...p, [k]: val } : p)));
  const addCity = (raw?: string) => {
    const c = (raw ?? cityQuery).trim();
    if (c && !v.cities.includes(c)) set("cities")([...v.cities, c]);
    setCityQuery("");
  };
  const fileProps = (k: "crDoc" | "vatDoc") => ({
    file: v[k],
    onFile: (f: File | null) => {
      if (!f && v[k]) flash(b.fileDeleted);
      set(k)(f);
    },
    accept: "application/pdf",
    removeLabel: b.remove,
    sizeText: (f: File) => fileSize(f, b.mb, b.kb),
    error: err[k],
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border-default bg-white p-5 md:p-8">
      <SectionHead title={L("s1")} />
      <Row>
        <TextField label={L("name")} name="name" value={v.name} onChange={set("name")} placeholder={L("name_ph")} icon="store" error={err.name} autoComplete="organization" />
        <SearchField label={L("city")} name="city" value={v.city} onChange={set("city")} placeholder={L("city_ph")} options={cityNames} icon="map-pin" error={err.city} />
      </Row>
      <Row>
        <TextField label={L("cr")} name="cr" value={v.cr} onChange={set("cr")} placeholder={L("cr_ph")} icon="file" inputMode="numeric" error={err.cr} />
        <TextField label={L("vat")} name="vat" value={v.vat} onChange={set("vat")} placeholder={L("vat_ph")} icon="receipt" inputMode="numeric" error={err.vat} />
      </Row>
      <Row>
        <FileBox label={L("cr_doc")} {...fileProps("crDoc")} />
        <FileBox label={L("vat_doc")} {...fileProps("vatDoc")} />
      </Row>

      <SectionHead title={L("s2")} hint={L("s2_hint")} spaced />
      {v.people.map((p, i) => (
        <div key={i} className="flex flex-col gap-5">
          {i > 0 && (
            <div className="flex items-center justify-between border-t border-border-default pt-4">
              <span className="text-label-m text-text-secondary">{`${L("person")} ${i + 1}`}</span>
              <button type="button" onClick={() => set("people")(v.people.filter((_, j) => j !== i))} className="text-label-m text-promotional-red hover:underline">
                {L("remove_person")}
              </button>
            </div>
          )}
          <Row>
            <TextField label={L("person")} name={`person-${i}`} value={p.name} onChange={setPerson(i, "name")} placeholder={L("person_ph")} icon="user" error={err[`p${i}name`]} autoComplete="name" />
            <TextField label={L("role")} name={`role-${i}`} value={p.role} onChange={setPerson(i, "role")} placeholder={L("role_ph")} icon="users" error={err[`p${i}role`]} />
          </Row>
          <Row>
            <TextField label={L("phone")} name={`phone-${i}`} value={p.phone} onChange={setPerson(i, "phone")} placeholder="05X XXX XXXX" icon="phone" type="tel" inputMode="tel" error={err[`p${i}phone`]} autoComplete="tel" />
            <TextField label={L("email")} name={`email-${i}`} value={p.email} onChange={setPerson(i, "email")} placeholder={d.email_ph} icon="mail" type="email" error={err[`p${i}email`]} autoComplete="email" />
          </Row>
        </div>
      ))}
      <button type="button" onClick={() => set("people")([...v.people, { ...emptyPerson }])} className="flex items-center gap-1.5 self-start text-label-m text-deep-charcoal hover:underline">
        {L("add_person")}
        <Icon name="plus" size={16} />
      </button>

      <SectionHead title={L("s3")} hint={L("s3_hint")} spaced />
      <div role="radiogroup" aria-label={L("s3")} className="grid items-start gap-4 md:grid-cols-2">
        {d.payment.map((o) => {
          const on = v.payment === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => set("payment")(o.value)}
              className={`flex items-start gap-3 rounded-[14px] p-[18px] text-start ${on ? "border-[1.5px] border-deep-charcoal bg-option-selected" : "border border-border-default bg-white hover:border-border-strong"}`}
            >
              <span className={`mt-0.5 size-5 shrink-0 rounded-full bg-white ${on ? "border-[6px] border-deep-charcoal" : "border border-border-default"}`} />
              <span className="flex flex-col gap-1">
                <span className="text-label-l text-deep-charcoal">{tx(locale, o, "title")}</span>
                <span className="text-body-s text-text-secondary">{tx(locale, o, "body")}</span>
              </span>
            </button>
          );
        })}
      </div>
      <Row>
        <SelectField
          label={L("volume")}
          name="volume"
          value={v.volume}
          onChange={set("volume")}
          placeholder={L("volume_ph")}
          options={d.volumeRanges.map((o) => ({ value: o.value, label: tx(locale, o, "label") }))}
          error={err.volume}
        />
        <div data-invalid={!!err.cities} className="flex min-w-0 flex-1 flex-col gap-2">
          <SearchField
            label={L("cities")}
            name="cities"
            value={cityQuery}
            onChange={(val) => (cityNames.includes(val) ? addCity(val) : setCityQuery(val))}
            onEnter={() => addCity()}
            placeholder={L("cities_ph")}
            options={cityNames.filter((c) => !v.cities.includes(c))}
            icon="search"
          />
          {v.cities.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {v.cities.map((c) => (
                <li key={c} className="flex items-center gap-1.5 rounded-full bg-deep-charcoal py-1 ps-3 pe-1.5 text-label-m text-white">
                  {c}
                  <button type="button" aria-label={b.removeCity(c)} onClick={() => set("cities")(v.cities.filter((x) => x !== c))} className="rounded-full p-0.5 hover:bg-white/15">
                    <Icon name="x" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <FieldError id="cities-e" error={err.cities} />
        </div>
      </Row>

      <Consent checked={v.consent} onChange={set("consent")} error={err.consent}>
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
