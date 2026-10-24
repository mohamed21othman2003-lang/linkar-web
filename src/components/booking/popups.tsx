"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getBookingDict } from "@/i18n/dict/booking";
import type { CarSize } from "@/lib/data/booking/types";
import { Icon } from "@/components/icons/Icon";
import { Modal, ModalActions, PopupHead, btnDark, btnPrimary, btnSecondary } from "./Modal";

// P-09 · التحقق الآمن من البنك · P-09b · التحقق عبر STC Pay
export function VerifyPaymentModal({
  locale,
  open,
  kind,
  amount,
  instrument,
  phone,
  onConfirm,
  onCancel,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  kind: "bank" | "stc";
  amount: string;
  instrument: string;
  phone: string;
  onConfirm: (code: string) => void;
  onCancel?: () => void; // «إلغاء العملية» ← W2-35b (فشلت العملية)
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const bank = kind === "bank";
  return (
    <Modal open={open} onClose={onClose} label={bank ? t.bankTitle : t.stcTitle}>
      <PopupHead
        title={bank ? t.bankTitle : t.stcTitle}
        closeLabel={t.close}
        onClose={onClose}
        icon={
          <span className="flex size-[42px] items-center justify-center rounded-[14px] bg-neon-green/18">
            <Icon name="lock" size={22} className="text-white" />
          </span>
        }
      />
      <p className="text-body-s text-text-secondary">{bank ? t.bankBody : t.fill(t.stcBody, { phone })}</p>
      <dl className="flex flex-col gap-2.5 rounded-[14px] bg-tile px-4 py-3.5 text-[14px] leading-[22px]">
        {[
          [t.merchant, t.merchantName],
          [t.amount, amount],
          [bank ? t.cardLabel : t.walletLabel, instrument],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <dt className="font-light text-text-secondary">{k}</dt>
            <dd className="font-medium" dir="auto">
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <label className="flex flex-col gap-2">
        <span className="text-label-m">{bank ? t.bankCode : t.code}</span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          ref={codeRef}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="• • • • • •"
          className="h-14 rounded-md border border-deep-charcoal px-3.5 text-[16px] font-light tracking-[0.3em] outline-none placeholder:text-deep-charcoal focus:shadow-focus-ring"
        />
      </label>
      <p className="flex items-center gap-2 rounded-md bg-neon-green/14 px-3.5 py-2.5 text-caption">
        <Icon name="lock" size={14} className="shrink-0 text-white" />
        {bank ? t.bankNote : t.stcNote}
      </p>
      <ModalActions>
        <button type="button" className={btnSecondary} onClick={onCancel ?? onClose}>
          {t.cancelOp}
        </button>
        <button type="button" className={btnPrimary} aria-disabled={code.length < 4} onClick={() => (code.length < 4 ? codeRef.current?.focus() : onConfirm(code))}>
          {t.confirmPay}
        </button>
      </ModalActions>
    </Modal>
  );
}

// P-23a / P-23c · تابي · P-23b · تمارا
export function InstallmentModal({
  locale,
  open,
  kind,
  installment,
  onContinue,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  kind: "tabby" | "tamara";
  installment: string;
  onContinue: () => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  const tabby = kind === "tabby";
  return (
    <Modal open={open} onClose={onClose} width={440} label={tabby ? t.tabbyTitle : t.tamaraTitle}>
      <PopupHead
        title={tabby ? t.tabbyTitle : t.tamaraTitle}
        closeLabel={t.close}
        onClose={onClose}
        icon={
          <span className={`flex h-[46px] w-fit items-center rounded-[14px] px-2.5 text-label-l text-solid-black ${tabby ? "bg-tabby" : "bg-tamara"}`}>
            {kind}
          </span>
        }
      />
      <p className="text-body-s text-text-secondary">{tabby ? t.fill(t.tabbyBody, { amount: installment }) : t.tamaraBody}</p>
      <ModalActions>
        <button type="button" className={btnSecondary} onClick={onClose}>
          {t.close}
        </button>
        <button type="button" className={btnDark} onClick={onContinue}>
          {tabby ? t.goTabby : t.goTamara}
        </button>
      </ModalActions>
    </Modal>
  );
}

// P-25a · الحد الأدنى · P-25b · رقم المسوّق نفسه
export function MarketerCodeModal({
  locale,
  open,
  reason,
  code,
  min,
  total,
  items,
  onEdit,
  onContinue,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  reason: "min" | "self";
  code: string;
  min: string;
  total: string;
  items: string;
  onEdit: () => void;
  onContinue: () => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  return (
    <Modal open={open} onClose={onClose} label={t.cantApply} className="rounded-[20px]! p-6!">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-warning-tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/booking/alert.svg" alt="" width={20} height={20} />
        </span>
        <h2 className="flex-1 text-h5">{t.cantApply}</h2>
        <button type="button" aria-label={t.close} onClick={onClose} className="flex size-9 items-center justify-center rounded-[10px] border border-border-default">
          <Icon name="x" size={16} />
        </button>
      </div>
      <span className="w-fit rounded-full bg-bg-danger-subtle px-3 py-1.5 text-label-m text-promotional-red" dir="auto">
        {t.fill(t.notEligible, { code })}
      </span>
      <p className="text-body-m text-text-secondary">{reason === "min" ? t.fill(t.minBody, { code, min, total, items }) : t.selfBody}</p>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={`${btnPrimary} h-[50px]! rounded-md! px-[22px]!`} onClick={onContinue}>
          {t.continueWithout}
        </button>
        <button type="button" className={`${btnSecondary} h-[52px]! rounded-md! px-[22px]!`} onClick={onEdit}>
          {t.editCode}
        </button>
      </div>
    </Modal>
  );
}

export type CarOption = { id: string; title: string; meta: string };

// P-15 · اختر سيارتك (من W2-42 «تغيير» السيارة)
export function ChooseCarModal({
  locale,
  open,
  cars,
  value,
  onConfirm,
  onAdd,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  cars: CarOption[];
  value: string;
  onConfirm: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  const [sel, setSel] = useState(value);
  return (
    <Modal open={open} onClose={onClose} label={t.chooseCar}>
      <PopupHead title={t.chooseCar} closeLabel={t.close} onClose={onClose} />
      <p className="text-body-s text-text-secondary">{t.chooseCarSub}</p>
      <div role="radiogroup" className="flex flex-col gap-4">
        {cars.map((c) => {
          const on = c.id === sel;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => (setSel(c.id), onConfirm(c.id))}
              className={`flex items-center gap-3 rounded-[14px] px-4 py-3.5 text-start transition-colors duration-200 ease-figma-out ${on ? "border-[1.5px] border-neon-green bg-neon-green/8" : "border border-border-default bg-white"}`}
            >
              <span className={`size-5 shrink-0 rounded-full ${on ? "border-[6px] border-deep-charcoal bg-deep-charcoal" : "border-[1.5px] border-border-default bg-white"}`} />
              <span className="flex flex-col gap-0.5">
                <span className="text-label-l">{c.title}</span>
                <span className="text-caption text-text-secondary">{c.meta}</span>
              </span>
            </button>
          );
        })}
      </div>
      <ModalActions>
        <button type="button" className={btnSecondary} onClick={onAdd}>
          {t.addCarShort}
        </button>
        <button type="button" className={btnPrimary} onClick={() => onConfirm(sel)}>
          {t.confirm}
        </button>
      </ModalActions>
    </Modal>
  );
}

export type NewCar = { make: string; model: string; year: string; color: string; plate: string; size: CarSize };

export type CarCatalog = {
  makes: { key: string; ar: string; en: string; models: { ar: string; en: string; size: CarSize }[] }[];
  colors: { ar: string; en: string }[];
};

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-m">{label}</span>
      <span className="relative">
        {children}
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3.5 top-[19px] text-state-gray" />
      </span>
    </label>
  );
}

// P-24 · أضف سيارتك (بعد إنشاء الحساب) — وكمان من «أضف سيارة أخرى» في W2-34b
export function AddCarModal({
  locale,
  open,
  accountCreated = false,
  catalog,
  onAdd,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  accountCreated?: boolean;
  catalog: CarCatalog;
  onAdd: (car: NewCar) => void;
  onClose: () => void;
}) {
  const t = getBookingDict(locale);
  const [make, setMake] = useState(0);
  const [model, setModel] = useState(0);
  const [year, setYear] = useState("2023");
  const [color, setColor] = useState(0);
  const [plate, setPlate] = useState("");
  const m = catalog.makes[make] ?? catalog.makes[0];
  const md = m.models[model] ?? m.models[0];
  const L = (o: { ar: string; en: string }) => (locale === "en" ? o.en : o.ar);
  const years = Array.from({ length: 12 }, (_, i) => String(2026 - i));
  const select = "h-[54px] w-full appearance-none rounded-md border border-border-default bg-white ps-3.5 pe-10 text-[16px] font-light outline-none focus:border-deep-charcoal";
  return (
    <Modal open={open} onClose={onClose} width={520} label={t.addYourCar} className="sm:p-7!">
      <div className="flex items-center justify-between">
        {accountCreated ? (
          <span className="flex items-center gap-1.5 rounded-md bg-bg-success-subtle px-2.5 py-1 text-label-m text-nature-green">
            <Icon name="check" size={16} />
            {t.accountCreated}
          </span>
        ) : (
          <span />
        )}
        <button type="button" aria-label={t.close} onClick={onClose} className="flex size-9 items-center justify-center rounded-full bg-tile">
          <Icon name="x" size={18} />
        </button>
      </div>
      <h2 className="text-h4">{t.addYourCar}</h2>
      <p className="text-body-s text-text-secondary">{t.addCarBody}</p>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label={t.make}>
          <select className={select} value={make} onChange={(e) => (setMake(Number(e.target.value)), setModel(0))}>
            {catalog.makes.map((v, i) => (
              <option key={v.key} value={i}>
                {L(v)}
              </option>
            ))}
          </select>
        </SelectField>
        <SelectField label={t.model}>
          <select className={select} value={model} onChange={(e) => setModel(Number(e.target.value))}>
            {m.models.map((x, i) => (
              <option key={x.en} value={i}>
                {L(x)}
              </option>
            ))}
          </select>
        </SelectField>
        <SelectField label={t.year}>
          <select className={select} value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </SelectField>
        <SelectField label={t.color}>
          <select className={select} value={color} onChange={(e) => setColor(Number(e.target.value))}>
            {catalog.colors.map((c, i) => (
              <option key={c.en} value={i}>
                {L(c)}
              </option>
            ))}
          </select>
        </SelectField>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-label-m">{t.plate}</span>
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder={t.platePh}
          className="h-[54px] rounded-md border border-border-default px-3.5 text-[16px] font-light outline-none placeholder:text-state-gray focus:border-deep-charcoal"
        />
      </label>
      <div className="flex items-center justify-between gap-2 rounded-md bg-tile px-3 py-2.5">
        <span className="rounded-sm bg-neon-green px-2 py-0.5 text-label-m">{t.fill(t.sizeChip, { size: t.sizes[md.size] })}</span>
        <span className="text-caption text-text-secondary">{t.sizeNote}</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="flex h-[52px] flex-1 items-center justify-center rounded-md bg-deep-charcoal text-label-l text-white hover:bg-bg-inverse-subtle"
          onClick={() => onAdd({ make: L(m), model: L(md), year, color: L(catalog.colors[color]), plate, size: md.size })}
        >
          {t.addAndContinue}
        </button>
        <button type="button" className="flex h-[54px] items-center justify-center rounded-md border border-border-default px-5 text-label-l" onClick={onClose}>
          {t.later}
        </button>
      </div>
    </Modal>
  );
}
