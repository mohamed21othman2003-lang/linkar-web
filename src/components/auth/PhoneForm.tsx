"use client";

import { useActionState, useState } from "react";
import { sendOtp, type AuthState } from "@/app/actions/auth";
import { formatSaudiPhone } from "@/lib/data/auth/rules";
import { Field, inputBoxClass, submitClass } from "./ui";

// W2-50 · حقل الجوال (+966 | 55 123 4567) + «أرسل رمز التحقق»
export function PhoneForm({
  next,
  initialPhone = "",
  copy,
}: {
  next: string;
  initialPhone?: string;
  copy: { label: string; placeholder: string; hint: string; cta: string; prefix: string; errors: Record<string, string> };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(sendOtp, null);
  const [value, setValue] = useState(initialPhone ? formatSaudiPhone(initialPhone) : "");
  const error = state?.error ? copy.errors[state.error] : undefined;

  const onChange = (raw: string) => {
    let d = raw.replace(/[٠-٩]/g, (x) => String("٠١٢٣٤٥٦٧٨٩".indexOf(x))).replace(/\D/g, "");
    d = d.replace(/^(00966|966)/, "").replace(/^0/, "").slice(0, 9);
    setValue(formatSaudiPhone(d));
  };

  return (
    <form action={action} className="flex w-full flex-col items-start gap-[18px]" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label={copy.label} htmlFor="phone" hint={copy.hint} error={error}>
        <div dir="ltr" className={`${inputBoxClass({ invalid: !!error })} gap-3`}>
          <span className="text-label-l text-deep-charcoal" aria-label={copy.prefix}>
            +966
          </span>
          <span aria-hidden className="h-[22px] w-px bg-cool-gray" />
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            autoFocus
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={copy.placeholder}
            aria-invalid={!!error}
            className="min-w-0 flex-1 bg-transparent text-body-l text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none!"
          />
        </div>
      </Field>
      <button type="submit" disabled={pending} className={submitClass()}>
        {copy.cta}
      </button>
    </form>
  );
}
