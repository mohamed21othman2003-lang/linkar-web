"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { actionClass } from "./ui";

type Copy = {
  title: string;
  body: string;
  phoneLabel: string;
  otpLabel: string;
  digitLabels: string[];
  noCode: string;
  resend: string;
  resent: string;
  submit: string;
  error: string;
  noAccount: string;
};

// W2-80b · «Auth card · v2»: رقم الجوال (للقراءة فقط) + رمز التحقق + إعادة الإرسال.
// تجريبي: أي رمز من الأرقام المطلوبة بيتقبل وبيودّي لصفحة القسيمة.
export function OtpForm({ phone, length, next, copy, demo = false }: { phone: string; length: number; next: string; copy: Copy; demo?: boolean }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, (_, i) => (demo && i < length - 1 ? String(i + 1) : "")));
  const [error, setError] = useState(false);
  const [resent, setResent] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, v: string) => {
    setDigits((cur) => cur.map((d, j) => (j === i ? v : d)));
    setError(false);
  };

  const onChange = (i: number, raw: string) => {
    const only = raw.replace(/\D/g, "");
    if (only.length > 1) {
      // لصق الرمز كله
      const next = Array.from({ length }, (_, j) => only[j] ?? "");
      setDigits(next);
      setError(false);
      refs.current[Math.min(only.length, length) - 1]?.focus();
      return;
    }
    setAt(i, only);
    if (only && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.some((d) => !d)) {
      setError(true);
      refs.current[digits.findIndex((d) => !d)]?.focus();
      return;
    }
    router.push(next);
  };

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 md:p-8 lg:w-[540px] lg:min-w-0 xl:shrink-0">
      <h1 className="text-h4 text-deep-charcoal md:text-h3">{copy.title}</h1>
      <p className="text-body-m text-text-secondary">{copy.body}</p>

      <div aria-label={copy.phoneLabel} className="flex items-center gap-2 rounded-md border border-border-default bg-tile px-3.5 py-3">
        <Icon name="phone" size={16} className="shrink-0 text-state-gray" />
        <span dir="ltr" className="text-body-m text-deep-charcoal">
          {phone}
        </span>
        <span className="flex-1" />
        <Icon name="lock" size={16} className="shrink-0 text-state-gray" />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{copy.otpLabel}</legend>
        <div dir="ltr" className="flex gap-3 rtl:justify-end">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={length}
              value={d}
              aria-label={copy.digitLabels[i]}
              aria-invalid={error && !d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              className={`size-14 rounded-md border bg-white text-center text-h4 text-deep-charcoal outline-none focus:border-deep-charcoal focus:shadow-focus-ring ${
                error && !d ? "border-border-danger" : d ? "border-deep-charcoal" : "border-border-default"
              }`}
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="text-caption text-text-danger">
            {copy.error}
          </p>
        )}
      </fieldset>

      <p className="flex flex-wrap items-center gap-1.5 text-[14px]">
        <span className="text-body-s text-text-secondary">{copy.noCode}</span>
        <button
          type="button"
          onClick={() => {
            setResent(true);
            setDigits(Array(length).fill(""));
            refs.current[0]?.focus();
          }}
          className="text-label-m text-deep-charcoal underline underline-offset-4"
        >
          {copy.resend}
        </button>
        {resent && (
          <span role="status" className="text-caption text-text-success">
            {copy.resent}
          </span>
        )}
      </p>

      <button type="submit" className={actionClass("primary", "w-full")}>
        {copy.submit}
        <Icon name="check" size={16} />
      </button>
      <p className="text-caption text-text-secondary">{copy.noAccount}</p>
    </form>
  );
}
