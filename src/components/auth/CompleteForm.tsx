"use client";

import { useActionState, useState } from "react";
import { completeAccount, type AuthState } from "@/app/actions/auth";
import { Icon } from "@/components/icons/Icon";
import { Field, inputBoxClass, inputClass, submitClass } from "./ui";
import { AddCarModal, type AddCarCopy, type CarOptions } from "./AddCarModal";

type Copy = {
  firstName: string;
  lastName: string;
  firstPlaceholder: string;
  lastPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  emailHint: string;
  password: string;
  passwordHint: string;
  invite: string;
  inviteApplied: string;
  terms: string;
  smsOffers: string;
  cta: string;
  errors: Record<string, string>;
};

// W2-50d · إكمال الحساب — بعد «إنشاء الحساب والمتابعة» تفتح P-24 «أضف سيارتك»
type Values = { first_name: string; last_name: string; email: string; password: string; invite: string };

export function CompleteForm({
  next,
  inviteCodes,
  initial,
  copy,
  car,
}: {
  next: string;
  inviteCodes: string[];
  initial?: Values; // وضع العرض (?demo=filled)
  copy: Copy;
  car: { copy: AddCarCopy; options: CarOptions };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(completeAccount, null);
  const [v, setV] = useState<Values>(initial ?? { first_name: "", last_name: "", email: "", password: "", invite: "" });
  const [terms, setTerms] = useState(!!initial);
  const [sms, setSms] = useState(false);
  const err = (f: string) => (state?.field === f && state.error ? copy.errors[state.error] : undefined);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  const inviteOk = inviteCodes.includes(v.invite.trim().toUpperCase());

  return (
    <>
      <form action={action} className="flex w-full flex-col items-start gap-[18px]" noValidate>
        <div className="flex w-full flex-col gap-1.5">
          <div className="grid w-full grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-3.5">
            <Field label={copy.firstName} htmlFor="first_name">
              <div className={inputBoxClass({ invalid: !!err("name") && !v.first_name.trim() })}>
                <input id="first_name" name="first_name" autoComplete="given-name" autoFocus value={v.first_name} onChange={set("first_name")} placeholder={copy.firstPlaceholder} className={inputClass} />
              </div>
            </Field>
            <Field label={copy.lastName} htmlFor="last_name">
              <div className={inputBoxClass({ invalid: !!err("name") && !v.last_name.trim() })}>
                <input id="last_name" name="last_name" autoComplete="family-name" value={v.last_name} onChange={set("last_name")} placeholder={copy.lastPlaceholder} className={inputClass} />
              </div>
            </Field>
          </div>
          {err("name") && (
            <p role="alert" className="text-caption text-promotional-red">
              {err("name")}
            </p>
          )}
        </div>

        <Field label={copy.email} htmlFor="email" hint={copy.emailHint} error={err("email")}>
          <div className={inputBoxClass({ invalid: !!err("email") })}>
            <input id="email" name="email" type="email" autoComplete="email" value={v.email} onChange={set("email")} placeholder={copy.emailPlaceholder} className={inputClass} />
            <Icon name="mail" size={16} className="shrink-0 text-state-gray" />
          </div>
        </Field>

        <Field label={copy.password} htmlFor="password" hint={copy.passwordHint} error={err("password")}>
          <div className={inputBoxClass({ invalid: !!err("password") })}>
            <input id="password" name="password" type="password" autoComplete="new-password" value={v.password} onChange={set("password")} placeholder="••••••••" className={inputClass} />
            <Icon name="lock" size={16} className="shrink-0 text-state-gray" />
          </div>
        </Field>

        <Field label={copy.invite} htmlFor="invite" hint={inviteOk ? copy.inviteApplied : undefined} hintTone="green" error={err("invite")}>
          <div className={inputBoxClass({ invalid: !!err("invite") && !inviteOk })}>
            <input id="invite" name="invite" autoComplete="off" autoCapitalize="characters" value={v.invite} onChange={set("invite")} className={`${inputClass} uppercase`} />
            {inviteOk && <Icon name="check" size={16} className="shrink-0 text-nature-green" />}
          </div>
        </Field>

        <div className="flex w-full flex-col gap-1.5">
          <Check name="terms" checked={terms} onChange={setTerms} label={copy.terms} />
          {err("terms") && (
            <p role="alert" className="text-caption text-promotional-red">
              {err("terms")}
            </p>
          )}
        </div>
        <Check name="sms_offers" checked={sms} onChange={setSms} label={copy.smsOffers} />

        <button type="submit" disabled={pending} className={submitClass()}>
          {copy.cta}
        </button>
      </form>
      {state?.ok && <AddCarModal next={next} copy={car.copy} options={car.options} />}
    </>
  );
}

// خانة اختيار 20×20 r6: مختارة = charcoal + علامة نيون
function Check({ name, checked, onChange, label }: { name: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`flex size-5 shrink-0 items-center justify-center rounded-[6px] border peer-focus-visible:shadow-focus-ring ${
          checked ? "border-deep-charcoal bg-deep-charcoal" : "border-cool-gray bg-white"
        }`}
      >
        {checked && <Icon name="check" size={14} className="text-neon-green" />}
      </span>
      <span className="text-body-s text-deep-charcoal">{label}</span>
    </label>
  );
}
