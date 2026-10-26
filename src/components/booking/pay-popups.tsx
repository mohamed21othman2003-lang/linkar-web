"use client";

import { useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import { Icon } from "@/components/icons/Icon";
import { Modal } from "./Modal";

// نوافذ الدفع في نسخة العميل (P-26a / P-26b / P-26c): كارت 480 · r20 · حشو 26/28 · مسافات 16
// الرأس: شارة الطريقة + العنوان + سطر توضيحي، وزر إغلاق دائري 32 على الطرف الآخر
// الأزرار: كبسولات (r999) — الرئيسي يملأ العرض والثانوي «إلغاء / طريقة أخرى» بحدود رمادية

const pillSecondary =
  "flex h-[58px] shrink-0 items-center justify-center rounded-full border border-v3-card-stroke px-[18px] text-[15px] font-medium text-deep-charcoal transition-colors duration-200 ease-figma-out hover:border-deep-charcoal";
const pillPrimary = "flex h-14 min-w-0 flex-1 items-center justify-center rounded-full px-4 text-center text-[15px] leading-5 font-bold transition-colors duration-200 ease-figma-out";

function PayHead({ badge, title, sub, closeLabel, onClose }: { badge: ReactNode; title: string; sub: string; closeLabel: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col items-start gap-2">
        {badge}
        <h2 className="text-[22px] leading-[42px] font-bold">{title}</h2>
        <p className="text-[14px] leading-[18px] font-normal text-state-gray">{sub}</p>
      </div>
      <button type="button" aria-label={closeLabel} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tile hover:bg-bg-muted">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

const badgeBox = "flex h-10 items-center rounded-[10px] px-3 text-[15px] leading-7 font-bold";

// P-26a · الدفع عبر Apple Pay (من «Apple Pay» في W2-35 أو زر الدفع) ← «ادفع بـ Apple Pay» ← W2-36
export function ApplePayModal({
  locale,
  open,
  amount,
  provider,
  card,
  onPay,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  amount: string;
  provider: string;
  card: string;
  onPay: () => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  return (
    <Modal open={open} onClose={onClose} label={t.applePayTitle} className="rounded-xl!">
      <PayHead
        title={t.applePayTitle}
        sub={t.applePaySub}
        closeLabel={t.close}
        onClose={onClose}
        badge={
          <span dir="ltr" className={`${badgeBox} gap-0.5 bg-pay-black text-white`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/auth/apple.svg" alt="" width={13} height={16} className="size-[13px]" />
            Pay
          </span>
        }
      />
      <div className="flex flex-col gap-1 rounded-[14px] bg-v3-box-light px-4 py-3.5">
        <span className="text-[13px] leading-4 font-normal text-state-gray">{t.fill(t.merchantLine, { provider })}</span>
        <span className="text-[28px] leading-[53px] font-bold">{amount}</span>
      </div>
      <div className="flex min-h-[27px] items-center justify-between gap-2">
        <span className="text-[14px] leading-[18px] font-normal" dir="auto">
          {t.fill(t.cardOnFile, { card })}
        </span>
        <button type="button" onClick={onClose} className="shrink-0 text-label-m text-green-active hover:underline">
          {t.change}
        </button>
      </div>
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={onPay} className={`${pillPrimary} bg-pay-black text-white hover:opacity-90`}>
          {t.payWithApple}
        </button>
        <button type="button" onClick={onClose} className={pillSecondary}>
          {t.cancel}
        </button>
      </div>
    </Modal>
  );
}

// P-26b · الدفع ببطاقة مدى أو ائتمانية ← «ادفع» ← P-09 (التحقق الآمن من البنك · W2-35m)
export function CardPayModal({
  locale,
  open,
  amount,
  onPay,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  amount: string;
  onPay: (last4: string) => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [save, setSave] = useState(false);
  const numberRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const digits = number.replace(/\D/g, "");
  const fmtNumber = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const fmtExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };
  const submit = () => {
    // نموذج تجريبي: نتأكد إن الحقول الأساسية مكتملة، وإلا نركّز على أول حقل ناقص
    if (digits.length < 12) return numberRef.current?.focus();
    if (expiry.replace(/\D/g, "").length < 4) return expiryRef.current?.focus();
    if (cvv.length < 3) return cvvRef.current?.focus();
    onPay(digits.slice(-4));
  };
  const box = "flex h-[45px] items-center rounded-md border border-v3-card-stroke bg-white px-3.5 focus-within:border-deep-charcoal";
  const input = "min-w-0 flex-1 bg-transparent text-[15px] font-normal outline-none placeholder:text-[#9aa29e]";
  const label = "text-[13px] leading-[25px] font-medium";
  return (
    <Modal open={open} onClose={onClose} label={t.cardTitle} className="rounded-xl!">
      <PayHead
        title={t.cardTitle}
        sub={t.cardSub}
        closeLabel={t.close}
        onClose={onClose}
        badge={
          <span dir="ltr" className={`${badgeBox} bg-v3-box-light text-deep-charcoal`}>
            {t.cardBadge}
          </span>
        }
      />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.cardNumber}</span>
          <span className={box}>
            <input
              ref={numberRef}
              dir="ltr"
              inputMode="numeric"
              autoComplete="cc-number"
              value={number}
              onChange={(e) => setNumber(fmtNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className={`${input} ${locale === "ar" ? "text-right" : "text-left"}`}
            />
          </span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={label}>{t.cardExpiry}</span>
            <span className={box}>
              <input
                ref={expiryRef}
                dir="ltr"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                placeholder="MM / YY"
                className={`${input} ${locale === "ar" ? "text-right" : "text-left"}`}
              />
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>{t.cardCvv}</span>
            <span className={box}>
              <input
                ref={cvvRef}
                dir="ltr"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                className={`${input} ${locale === "ar" ? "text-right" : "text-left"}`}
              />
            </span>
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={label}>{t.cardName}</span>
          <span className={box}>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" dir="auto" placeholder={t.cardNamePh} className={input} />
          </span>
        </label>
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[14px] leading-[18px] font-normal">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-v3-card-stroke bg-white transition-colors duration-200 ease-figma-out peer-checked:border-deep-charcoal peer-checked:bg-deep-charcoal peer-focus-visible:shadow-focus-ring"
          >
            {save && <Icon name="check" size={12} className="text-neon-green" />}
          </span>
          {t.saveCard}
        </label>
        <p className="text-[13px] leading-4 font-normal text-state-gray">{t.threeDs}</p>
        <div className="flex items-center gap-2.5">
          <button type="submit" className={`${pillPrimary} bg-neon-green text-v3-card-dark hover:bg-bg-brand-hover active:bg-bg-brand-pressed`}>
            {t.fill(t.payAmount, { amount })}
          </button>
          <button type="button" onClick={onClose} className={pillSecondary}>
            {t.cancel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// P-26c · الدفع نقداً في الفرع ← «تأكيد الحجز والدفع في الفرع» ← W2-36 (قسيمة بانتظار الدفع) · «طريقة أخرى» تقفل النافذة
export function CashPayModal({ locale, open, onConfirm, onClose }: { locale: Locale; open: boolean; onConfirm: () => void; onClose: () => void }) {
  const t = getBookingDict(locale);
  return (
    <Modal open={open} onClose={onClose} label={t.cashTitle} className="rounded-xl!">
      <PayHead
        title={t.cashTitle}
        sub={t.cashSub}
        closeLabel={t.close}
        onClose={onClose}
        badge={<span className={`${badgeBox} bg-cash-tint text-green-active`}>{t.cashBadge}</span>}
      />
      <ol className="flex flex-col gap-2.5">
        {t.cashSteps.map((s, i) => (
          <li key={s} className="flex items-start gap-2.5">
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-deep-charcoal text-[13px] font-bold text-neon-green">{i + 1}</span>
            <span className="text-[14px] leading-[18px] font-normal">{s}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-1 rounded-md bg-v3-box-light px-3.5 py-3">
        {t.cashConditions.map((c) => (
          <p key={c} className="text-[13px] leading-4 font-normal text-state-gray">
            {c}
          </p>
        ))}
      </div>
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={onConfirm} className={`${pillPrimary} bg-neon-green text-v3-card-dark hover:bg-bg-brand-hover active:bg-bg-brand-pressed`}>
          {t.cashConfirm}
        </button>
        <button type="button" onClick={onClose} className={pillSecondary}>
          {t.otherMethod}
        </button>
      </div>
    </Modal>
  );
}
