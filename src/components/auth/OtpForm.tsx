"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { verifyOtp } from "@/app/actions/auth";
import { Icon } from "@/components/icons/Icon";
import { submitClass } from "./ui";

type Copy = {
  resendWait: string;
  cta: string;
  help: string;
  resend: string;
  wrong2: string;
  wrong1: string;
  wrongNote: string;
  locked: string;
  lockedNote: string;
  digit: string;
  incomplete: string;
};

// W2-50b · رمز التحقق — 4 خانات + عدّاد إعادة الإرسال · W2-50c · رمز غير صحيح (حدود حمراء + تنبيه + «أعد إرسال الرمز»)
export function OtpForm({
  phone,
  next,
  length,
  maxAttempts,
  resendSeconds,
  copy,
  demo,
}: {
  demo?: "filled" | "wrong";
  phone: string;
  next: string;
  length: number;
  maxAttempts: number;
  resendSeconds: number;
  copy: Copy;
}) {
  const [digits, setDigits] = useState<string[]>(() =>
    demo === "filled" ? ["7", "4", "1", ""] : demo === "wrong" ? ["7", "4", "1", "9"] : Array(length).fill(""),
  );
  const [wrong, setWrong] = useState(demo === "wrong"); // آخر محاولة غلط ولسه ما اتعدّلش الرمز
  const [attempts, setAttempts] = useState(demo === "wrong" ? 1 : 0);
  const [incomplete, setIncomplete] = useState(false);
  const [seconds, setSeconds] = useState(resendSeconds);
  const [pending, startTransition] = useTransition();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const locked = attempts >= maxAttempts;
  const left = maxAttempts - attempts;

  useEffect(() => {
    if (seconds <= 0 || demo) return; // في وضع العرض العدّاد ثابت على 0:45 زي الفيجما
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, demo]);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const fill = (start: number, raw: string) => {
    const chars = raw.replace(/[٠-٩]/g, (x) => String("٠١٢٣٤٥٦٧٨٩".indexOf(x))).replace(/\D/g, "").split("");
    setWrong(false);
    setIncomplete(false);
    setDigits((prev) => {
      const nextDigits = [...prev];
      if (!chars.length) nextDigits[start] = "";
      chars.slice(0, length - start).forEach((c, k) => (nextDigits[start + k] = c));
      return nextDigits;
    });
    if (chars.length) focus(start + chars.length);
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // رقم من الكيبورد: نكتبه في الخانة وننقل للي بعدها (حتى لو نفس الرقم اللي فيها — onChange مش بيتنادى ساعتها)
    if (/^[0-9٠-٩]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      fill(i, e.key);
    } else if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, k) => (k === i - 1 ? "" : d)));
      focus(i - 1);
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked || pending) return;
    const code = digits.join("");
    if (code.length < length) {
      setIncomplete(true);
      focus(digits.findIndex((d) => !d));
      return;
    }
    startTransition(async () => {
      const res = await verifyOtp(phone, code, next);
      if (res && !res.ok) {
        setAttempts((a) => a + 1);
        setWrong(true);
      }
    });
  };

  const resend = () => {
    setDigits(Array(length).fill(""));
    setWrong(false);
    setIncomplete(false);
    setSeconds(resendSeconds);
    focus(0);
  };

  const showError = wrong || locked;
  const mm = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <form onSubmit={submit} className="flex w-full flex-col items-start gap-[18px]" noValidate>
      {/* الخانات من الشمال لليمين في اللغتين (زي الفيجما) */}
      <div dir="ltr" className="flex w-full items-center justify-center gap-2.5 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => {
              const v = e.target.value;
              fill(i, d && v.length > 1 ? v.replace(d, "") : v);
            }}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => {
              e.preventDefault();
              fill(i, e.clipboardData.getData("text"));
            }}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={demo === "filled" ? i === 3 : !demo && i === 0}
            maxLength={length}
            disabled={locked}
            aria-label={`${copy.digit} ${i + 1}`}
            aria-invalid={showError}
            className={`size-14 rounded-[14px] border bg-white text-center text-h3 text-deep-charcoal outline-none transition-colors focus-visible:shadow-none! disabled:opacity-60 sm:size-16 ${
              showError
                ? "border-promotional-red shadow-[inset_0_0_0_0.5px_var(--color-promotional-red)]!"
                : "border-cool-gray focus:border-deep-charcoal focus:shadow-[inset_0_0_0_0.5px_var(--color-deep-charcoal)]!"
            }`}
          />
        ))}
      </div>

      {showError ? (
        <div role="alert" className="flex w-full items-start gap-2 rounded-md bg-[#fbf3f3] px-3.5 py-3">
          <Icon name="alert" size={16} className="mt-[3px] shrink-0 text-deep-charcoal" />
          <div className="flex flex-col gap-0.5 text-caption">
            <p className="font-medium text-promotional-red">{locked ? copy.locked : left === 1 ? copy.wrong1 : copy.wrong2}</p>
            <p className="text-deep-charcoal">{locked ? copy.lockedNote : copy.wrongNote}</p>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-start gap-1.5">
          {seconds > 0 ? (
            <p className="flex flex-wrap items-center gap-1.5 text-caption text-state-gray">
              {copy.resendWait}
              <span dir="ltr" className="font-medium text-deep-charcoal tabular-nums" aria-live="polite">
                {mm}
              </span>
            </p>
          ) : (
            <button type="button" onClick={resend} className="py-0.5 text-label-m text-green-active hover:underline">
              {copy.resend}
            </button>
          )}
          {incomplete && (
            <p role="alert" className="text-caption text-promotional-red">
              {copy.incomplete}
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={pending || locked} className={submitClass()}>
        {copy.cta}
      </button>

      {showError ? (
        !locked && (
          <button type="button" onClick={resend} className="py-0.5 text-label-m text-green-active hover:underline">
            {copy.resend}
          </button>
        )
      ) : (
        <p className="w-full text-caption text-state-gray">{copy.help}</p>
      )}
    </form>
  );
}
