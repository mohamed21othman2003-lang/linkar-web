"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// نموذج تجريبي: التحقق على المتصفح فقط، ولو كله سليم يروح لصفحة «تم الإرسال».
// الأخطاء بتظهر بعد أول محاولة إرسال، وبتتحدث مع الكتابة.
export function useForm<T extends Record<string, unknown>>(initial: () => T, validate: (v: T) => Partial<Record<keyof T, string>>, next: string | ((v: T) => void)) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const errors: Partial<Record<keyof T, string>> = submitted ? validate(values) : {};

  const set =
    <K extends keyof T>(k: K) =>
    (v: T[K]) =>
      setValues((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate(values)).length) {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>('form [aria-invalid="true"], form [data-invalid="true"]');
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
        el?.focus({ preventScroll: true });
      });
      return;
    }
    if (typeof next === "function") {
      next(values);
      setSubmitted(false);
      setValues(initial());
    } else router.push(next);
  };

  return { values, set, errors, onSubmit };
}
