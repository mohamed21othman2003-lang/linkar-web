"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { emailLogin, requestReset, resetPassword, type AuthState } from "@/app/actions/auth";
import { Icon } from "@/components/icons/Icon";
import { Field, inputBoxClass, inputClass, submitClass } from "./ui";

type Errors = Record<string, string>;
const errOf = (state: AuthState, errors: Errors, field: string) => (state?.field === field && state.error ? errors[state.error] : undefined);

// حقل البريد (W2-50e / W2-50f): الكتابة من الشمال (name@example.com) · ارتفاع 60
function EmailInput({ label, placeholder, error, value, onChange }: { label: string; placeholder: string; error?: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} htmlFor="email" error={error}>
      <div dir="ltr" className={inputBoxClass({ size: "lg", invalid: !!error })}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={inputClass}
        />
      </div>
    </Field>
  );
}

// W2-50e · البريد الإلكتروني وكلمة المرور
export function EmailLoginForm({
  next,
  forgotHref,
  copy,
}: {
  next: string;
  forgotHref: string;
  copy: { email: string; emailPlaceholder: string; password: string; forgot: string; cta: string; errors: Errors };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(emailLogin, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const pwError = errOf(state, copy.errors, "password");
  return (
    <form action={action} className="flex w-full flex-col items-start gap-[18px]" noValidate>
      <input type="hidden" name="next" value={next} />
      <EmailInput label={copy.email} placeholder={copy.emailPlaceholder} error={errOf(state, copy.errors, "email")} value={email} onChange={setEmail} />
      <Field label={copy.password} htmlFor="password" error={pwError}>
        <div dir="ltr" className={inputBoxClass({ size: "lg", invalid: !!pwError })}>
          <Icon name="lock" size={16} className="shrink-0 text-state-gray" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!pwError}
            className={inputClass}
          />
        </div>
      </Field>
      <Link href={forgotHref} className="text-label-m text-green-active hover:underline">
        {copy.forgot}
      </Link>
      <button type="submit" disabled={pending} className={submitClass("lg")}>
        {copy.cta}
      </button>
    </form>
  );
}

// W2-50f · استعادة كلمة المرور
export function ForgotForm({ next, copy }: { next: string; copy: { email: string; emailPlaceholder: string; cta: string; errors: Errors } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestReset, null);
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="flex w-full flex-col items-start gap-[18px]" noValidate>
      <input type="hidden" name="next" value={next} />
      <EmailInput label={copy.email} placeholder={copy.emailPlaceholder} error={errOf(state, copy.errors, "email")} value={email} onChange={setEmail} />
      <button type="submit" disabled={pending} className={submitClass("lg")}>
        {copy.cta}
      </button>
    </form>
  );
}

// W2-50h · تعيين كلمة مرور جديدة
export function ResetForm({ next, copy }: { next: string; copy: { newLabel: string; confirmLabel: string; hint: string; cta: string; errors: Errors } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPassword, null);
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const field = (name: "password" | "confirm", label: string, hint?: string, autoFocus?: boolean) => {
    const error = errOf(state, copy.errors, name);
    return (
      <Field label={label} htmlFor={name} hint={hint} error={error}>
        <div className={inputBoxClass({ size: "lg", invalid: !!error })}>
          <Icon name="lock" size={16} className="shrink-0 text-state-gray" />
          <input
            id={name}
            name={name}
            type="password"
            autoComplete="new-password"
            autoFocus={autoFocus}
            value={pw[name]}
            onChange={(e) => setPw((s) => ({ ...s, [name]: e.target.value }))}
            placeholder="••••••••"
            aria-invalid={!!error}
            className={inputClass}
          />
        </div>
      </Field>
    );
  };
  return (
    <form action={action} className="flex w-full flex-col items-start gap-[18px]" noValidate>
      <input type="hidden" name="next" value={next} />
      {field("password", copy.newLabel, copy.hint, true)}
      {field("confirm", copy.confirmLabel)}
      <button type="submit" disabled={pending} className={submitClass("lg")}>
        {copy.cta}
      </button>
    </form>
  );
}

// W2-50g «لم يصلك الرابط؟ أعد الإرسال» ← P-10t (رسالة سريعة تختفي بعد ثانيتين)
export function ResendLink({ label, toast }: { label: string; toast: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(() => setShown(0), 2000);
    return () => clearTimeout(id);
  }, [shown]);
  return (
    <>
      <button type="button" onClick={() => setShown(Date.now())} className="text-label-m text-green-active hover:underline">
        {label}
      </button>
      {shown > 0 && <Toast key={shown} text={toast} />}
    </>
  );
}

// P-10t · رسالة سريعة: charcoal · r14 · علامة نيون — OVERLAY DISSOLVE 200ms، وتتقفل بعد 2 ثانية (AFTER_TIMEOUT · CLOSE)
export function Toast({ text }: { text: string }) {
  return (
    <div role="status" className="fixed inset-x-0 bottom-6 z-50 flex animate-dissolve justify-center px-4">
      <div className="flex items-center gap-3.5 rounded-[14px] bg-deep-charcoal px-[18px] py-3.5 shadow-[0_12px_24px_0_rgb(20_41_54/0.25)]">
        <Icon name="check" size={16} className="shrink-0 text-neon-green" />
        <span className="text-body-s text-white">{text}</span>
      </div>
    </div>
  );
}
