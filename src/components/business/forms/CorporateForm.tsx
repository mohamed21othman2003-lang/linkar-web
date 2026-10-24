"use client";

import type { Locale } from "@/i18n/config";
import { getBusinessDict } from "@/i18n/dict/business";
import { Toast, useFlash } from "@/components/gift/Popup";
import type { corporatePage } from "@/lib/data/business/corporate";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "@/components/gift/ui";
import { clean, re, Row, TextArea, TextField } from "./fields";
import { useForm } from "./useForm";

// W2-93 · «اطلب عرضاً لشركتك»
// الإرسال: OVERLAY P-10f «وصلتنا رسالتك…» DISSOLVE 200ms (مش صفحة جديدة)
export function CorporateForm({ locale, d }: { locale: Locale; d: typeof corporatePage }) {
  const b = getBusinessDict(locale);
  const e = b.errors;
  const [toast, flash] = useFlash();
  const L = (k: string) => (d as unknown as Record<string, string>)[`${k}_${locale}`];
  const { values: v, set, errors, onSubmit } = useForm(
    () => ({ contact: "", phone: "", company: "", cars: "", needs: "" }),
    (x) => {
      const r: Record<string, string> = {};
      if (!x.contact.trim()) r.contact = e.required;
      if (!re.phone.test(clean(x.phone))) r.phone = e.phone;
      if (!x.company.trim()) r.company = e.required;
      if (!/^\d+$/.test(clean(x.cars)) || Number(clean(x.cars)) < 1) r.cars = e.number;
      if (!x.needs.trim()) r.needs = e.required;
      return r;
    },
    () => flash(b.requestSent),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-w-0 flex-1 flex-col gap-5 rounded-xl border border-border-default bg-white p-5 md:p-8">
      <h2 className="text-h4 text-deep-charcoal">{L("form_title")}</h2>
      <Row>
        <TextField label={L("contact")} name="contact" value={v.contact} onChange={set("contact")} placeholder={L("contact_ph")} error={errors.contact} autoComplete="name" />
        <TextField label={L("phone")} name="phone" value={v.phone} onChange={set("phone")} placeholder="05X XXX XXXX" icon="phone" type="tel" inputMode="tel" error={errors.phone} autoComplete="tel" />
      </Row>
      <Row>
        <TextField label={L("company")} name="company" value={v.company} onChange={set("company")} placeholder={L("company_ph")} error={errors.company} autoComplete="organization" />
        <TextField label={L("cars")} name="cars" value={v.cars} onChange={set("cars")} placeholder={L("cars_ph")} inputMode="numeric" error={errors.cars} />
      </Row>
      <TextArea label={L("needs")} name="needs" value={v.needs} onChange={set("needs")} placeholder={L("needs_ph")} error={errors.needs} />
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
