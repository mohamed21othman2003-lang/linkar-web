"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { signIn } from "@/app/actions/session";
import { Icon } from "@/components/icons/Icon";

// W2-34a · تسجيل الدخول برقم الجوال داخل خطوة «بياناتك»: رقم الجوال ← رمز التحقق (4 خانات) ← «تحقّق ومتابعة».
// العميل العادي: signIn ويرجع لنفس الخطوة (W2-34b). عميل رابط المسوّق (ref): يكمل كضيف مباشرة للدفع (W2-35s).
export function PhoneLogin({
  locale,
  defaultPhone,
  typed = "",
  next,
  guestNext,
}: {
  locale: Locale;
  defaultPhone: string; // «55 123 4567»
  typed?: string; // أرقام مكتوبة مسبقاً (حالة الفيجما: «7 4» والخانة الثالثة عليها التركيز)
  next: string; // الرابط بعد تسجيل الدخول
  guestNext?: string; // لو موجود: تحقق كضيف ثم هذا الرابط
}) {
  const t = getBookingDict(locale);
  const router = useRouter();
  const [phone, setPhone] = useState(defaultPhone);
  const [editing, setEditing] = useState(false);
  const [digits, setDigits] = useState([0, 1, 2, 3].map((i) => typed[i] ?? ""));
  const [left, setLeft] = useState(45);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (editing || left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left, editing]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length > 1) {
      // لصق الرمز كامل
      const next = [...digits];
      d.slice(0, 4 - i).split("").forEach((c, k) => (next[i + k] = c));
      setDigits(next);
      boxes.current[Math.min(3, i + d.length)]?.focus();
      return;
    }
    const nextDigits = digits.map((x, k) => (k === i ? d : x));
    setDigits(nextDigits);
    if (d && i < 3) boxes.current[i + 1]?.focus();
  };

  const complete = digits.every(Boolean);
  const local = `0${phone.replace(/\s/g, "")}`;
  const mmss = `0:${String(Math.max(0, left)).padStart(2, "0")}`;
  const action = signIn.bind(null, "user", next);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-v3-card-stroke bg-white p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h4">{t.loginTitle}</h2>
        <p className="text-body-s text-v3-text-meta">{t.loginSub}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="booking-phone" className="text-label-m">
          {t.phone}
        </label>
        <div dir="ltr" className={`flex h-[50px] items-center gap-2 rounded-md border bg-white px-3.5 ${editing ? "border-deep-charcoal" : "border-border-default"}`}>
          <span className="text-label-m text-v3-text-meta">+966</span>
          <input
            id="booking-phone"
            inputMode="tel"
            value={phone}
            readOnly={!editing}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
            className={`min-w-0 flex-1 bg-transparent text-[16px] font-light outline-none ${locale === "ar" ? "text-right" : "text-left"}`}
          />
        </div>
        {editing ? (
          <button
            type="button"
            onClick={() => (setEditing(false), setLeft(45), setDigits(["", "", "", ""]), boxes.current[0]?.focus())}
            className="w-fit text-label-m text-green-active hover:underline"
          >
            {t.sendCode}
          </button>
        ) : (
          <p className="flex flex-wrap items-center gap-1 text-caption">
            <span className="text-v3-text-meta">{t.fill(t.sentTo, { phone: local })}</span>
            <button
              type="button"
              onClick={() => {
                // النموذج الأولي: «تعديل الرقم» ← SCROLL_TO حقل الجوال (SCROLL_ANIMATE 400ms)
                setEditing(true);
                const el = document.getElementById("booking-phone");
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus({ preventScroll: true });
              }}
              className="text-green-active hover:underline"
            >
              {t.editPhone}
            </button>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-caption text-v3-text-meta">
        <span className="h-px flex-1 bg-border-default" />
        {t.or}
        <span className="h-px flex-1 bg-border-default" />
      </div>

      <form action={action} className="flex flex-col gap-2.5">
        <button type="submit" className="flex h-[52px] items-center justify-center gap-2.5 rounded-[14px] border border-border-default bg-white text-label-l hover:border-border-strong">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/auth/google.svg" alt="" width={20} height={20} />
          {t.google}
        </button>
        <button type="submit" formAction={action} className="flex h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-pay-black text-label-l text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/auth/apple.svg" alt="" width={20} height={20} />
          {t.apple}
        </button>
      </form>

      <form
        action={guestNext ? undefined : action}
        onSubmit={(e) => {
          // الرمز ناقص ← نركّز على أول خانة فاضية بدل الإرسال
          if (!complete) {
            e.preventDefault();
            boxes.current[digits.findIndex((d) => !d)]?.focus();
            return;
          }
          if (guestNext) {
            e.preventDefault();
            router.push(guestNext);
          }
        }}
        className="flex flex-col gap-4"
      >
        <span className="text-label-m">{t.code}</span>
        <div dir="ltr" className={`flex gap-3 ${locale === "ar" ? "justify-end" : "justify-start"}`}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                boxes.current[i] = el;
              }}
              aria-label={`${t.code} ${i + 1}`}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && boxes.current[i - 1]?.focus()}
              autoFocus={i === Math.min(3, typed.length)}
              className="size-16 rounded-[14px] border border-border-default bg-white text-center text-h3 outline-none focus:border-2 focus:border-deep-charcoal"
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 text-caption text-v3-text-meta">
          {left > 0 ? (
            <span>{t.fill(t.resendIn, { t: mmss })}</span>
          ) : (
            <button type="button" onClick={() => setLeft(45)} className="text-green-active hover:underline">
              {t.resend}
            </button>
          )}
          <span>{t.attempts}</span>
        </div>
        <button
          type="submit"
          aria-disabled={!complete}
          className="flex h-[54px] items-center justify-center rounded-[14px] bg-neon-green text-label-l text-deep-charcoal transition-colors duration-200 ease-figma-out hover:bg-bg-brand-hover active:bg-bg-brand-pressed"
        >
          {t.verify}
        </button>
      </form>

      <p className="flex items-center gap-2 rounded-md bg-cool-gray/30 px-3 py-2.5 text-caption">
        <Icon name="lock" size={16} className="shrink-0 text-state-gray" />
        {t.privacy}
      </p>
    </section>
  );
}
