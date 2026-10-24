"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Toast, useToast } from "@/components/help/Toast";

export type ContactFormCopy = {
  title: string;
  name: string;
  phone: string;
  phonePlaceholder: string;
  topic: string;
  topics: { value: string; label: string }[];
  booking: string;
  bookingPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sent: string;
  required: string;
  phoneInvalid: string;
};

type Field = "name" | "phone" | "message";

// نموذج «أرسل رسالتك» (W2-96) — تجريبي: بعد الإرسال توست P-10f ويتفضّى النموذج
// demo: يعرض حالة الفيجما بالظبط للمقارنة (/contact?demo=figma): الاسم مكتوب ومركّز عليه + رقم الحجز
export function ContactForm({ copy, defaultName = "", demo }: { copy: ContactFormCopy; defaultName?: string; demo?: { name: string; booking: string } }) {
  const toast = useToast();
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [key, setKey] = useState(0);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const next: Partial<Record<Field, string>> = {};
    if (!v("name")) next.name = copy.required;
    const digits = v("phone").replace(/\D/g, "");
    if (!digits) next.phone = copy.required;
    else if (!/^(05\d{8}|5\d{8}|9665\d{8})$/.test(digits)) next.phone = copy.phoneInvalid;
    if (!v("message")) next.message = copy.required;
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.show(copy.sent);
    setKey((k) => k + 1); // يفضّي الحقول
  };

  const box = (err?: string, active?: boolean) =>
    `w-full rounded-md border bg-white px-3.5 text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus:border-[1.5px] focus:border-deep-charcoal ${
      err ? "border-border-danger" : active ? "border-[1.5px] border-deep-charcoal" : "border-border-default"
    }`;
  const label = "text-label-m text-deep-charcoal";
  const errText = (f: Field) =>
    errors[f] ? (
      <p id={`contact-${f}-err`} className="text-caption text-text-danger">
        {errors[f]}
      </p>
    ) : null;

  return (
    <form key={key} noValidate onSubmit={onSubmit} className="flex flex-col gap-5 rounded-xl border border-border-default bg-white p-5 md:p-8">
      <h2 className="text-h4 text-deep-charcoal">{copy.title}</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className={label}>
            {copy.name}
          </label>
          <input id="contact-name" name="name" defaultValue={demo?.name ?? defaultName} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-err" : undefined} className={`${demo ? "h-[55px]" : "h-[54px]"} ${box(errors.name, !!demo)}`} />
          {errText("name")}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-phone" className={label}>
            {copy.phone}
          </label>
          <div className="relative">
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={copy.phonePlaceholder}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "contact-phone-err" : undefined}
              className={`h-[54px] pe-10 [direction:inherit] ${box(errors.phone)}`}
            />
            <Icon name="phone" size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
          </div>
          {errText("phone")}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-topic" className={label}>
            {copy.topic}
          </label>
          <div className="relative">
            <select id="contact-topic" name="topic" defaultValue={copy.topics[0].value} className={`h-[54px] appearance-none pe-10 ${box()}`}>
              {copy.topics.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-state-gray" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-booking" className={label}>
            {copy.booking}
          </label>
          <input id="contact-booking" name="booking" defaultValue={demo?.booking} placeholder={copy.bookingPlaceholder} className={`h-[54px] ${box()}`} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className={label}>
          {copy.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          placeholder={copy.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-err" : undefined}
          className={`h-[140px] resize-y py-3 ${box(errors.message)}`}
        />
        {errText("message")}
      </div>
      {/* الفيجما: الزر في آخر السطر */}
      <div className="flex justify-end">
        <button type="submit" className="inline-flex h-[50px] items-center gap-1.5 rounded-md bg-neon-green px-[22px] text-label-l text-deep-charcoal transition-colors hover:bg-bg-brand-hover active:bg-bg-brand-pressed">
          {copy.submit}
          <Icon name="chevron-left" size={16} flip />
        </button>
      </div>
      <Toast message={toast.message} icon="mail" />
    </form>
  );
}
