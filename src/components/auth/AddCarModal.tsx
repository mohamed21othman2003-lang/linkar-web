"use client";

import { useEffect, useRef, useState } from "react";
import { finishSignup } from "@/app/actions/auth";
import { Icon } from "@/components/icons/Icon";
import { inputBoxClass, inputClass } from "./ui";

export type AddCarCopy = Record<
  "created" | "title" | "body" | "make" | "model" | "year" | "color" | "plate" | "platePlaceholder" | "sizeNote" | "sizeLabel" | "later" | "cta" | "close",
  string
>;
export type CarOptions = {
  makes: { slug: string; name: string; models: { slug: string; name: string; size: string | null }[] }[];
  colors: { slug: string; name: string }[];
  years: number[];
  defaults: { make: string; model: string; year: number; color: string };
};

// P-24 · أضف سيارتك (بعد إنشاء الحساب) — 520 · r24 · p28 · gap16.
// تجريبي: السيارة ما بتتحفظش؛ «إضافة السيارة والمتابعة» و«لاحقاً» والإغلاق كلهم بيكمّلوا الدخول كعميل جديد.
export function AddCarModal({ next, copy, options }: { next: string; copy: AddCarCopy; options: CarOptions }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [make, setMake] = useState(options.defaults.make);
  const models = options.makes.find((m) => m.slug === make)?.models ?? [];
  const [model, setModel] = useState(options.defaults.model);
  const size = models.find((m) => m.slug === model)?.size ?? null;
  const action = finishSignup.bind(null, next);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && formRef.current?.requestSubmit();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    // OVERLAY · DISSOLVE 200ms EASE_OUT (الخلفية والنافذة مع بعض)
    <div className="fixed inset-0 z-50 flex animate-dissolve items-center justify-center overflow-y-auto bg-bg-overlay p-4">
      <form
        ref={formRef}
        action={action}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-car-title"
        className="my-auto flex w-full max-w-[520px] flex-col items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_24px_0_rgb(8_20_28/0.25)] sm:p-7"
      >
        <div className="flex w-full items-center">
          <span className="flex items-center gap-1.5 rounded-md bg-bg-success-subtle px-2.5 py-1 text-label-m text-nature-green">
            <Icon name="check" size={16} />
            {copy.created}
          </span>
          <span className="flex-1" />
          <button type="submit" aria-label={copy.close} className="flex size-9 items-center justify-center rounded-[18px] bg-tile text-deep-charcoal hover:bg-bg-muted">
            <Icon name="x" size={18} />
          </button>
        </div>
        <h2 id="add-car-title" className="text-h4 text-deep-charcoal">
          {copy.title}
        </h2>
        <p className="w-full text-body-s text-state-gray">{copy.body}</p>

        <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4">
          <Select
            id="car_make"
            label={copy.make}
            value={make}
            autoFocus
            onChange={(v) => {
              setMake(v);
              setModel(options.makes.find((m) => m.slug === v)?.models[0]?.slug ?? "");
            }}
            items={options.makes.map((m) => ({ value: m.slug, label: m.name }))}
          />
          <Select id="car_model" label={copy.model} value={model} onChange={setModel} items={models.map((m) => ({ value: m.slug, label: m.name }))} />
          <Select id="car_year" label={copy.year} defaultValue={String(options.defaults.year)} items={options.years.map((y) => ({ value: String(y), label: String(y) }))} />
          <Select id="car_color" label={copy.color} defaultValue={options.defaults.color} items={options.colors.map((c) => ({ value: c.slug, label: c.name }))} />
        </div>

        <div className="flex w-full flex-col items-start gap-1.5">
          <label htmlFor="car_plate" className="text-label-m text-deep-charcoal">
            {copy.plate}
          </label>
          <div className={inputBoxClass()}>
            <input id="car_plate" name="car_plate" placeholder={copy.platePlaceholder} className={inputClass} />
          </div>
        </div>

        <div className="flex w-full items-center gap-2 rounded-md bg-tile px-3 py-2.5">
          {size && (
            <span className="shrink-0 rounded-sm bg-neon-green px-2 py-0.5 text-label-m text-deep-charcoal">
              {copy.sizeLabel} {size}
            </span>
          )}
          <p className="min-w-0 flex-1 text-caption text-state-gray">{copy.sizeNote}</p>
        </div>

        <div className="flex w-full items-start gap-3">
          <button type="submit" className="flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-md bg-deep-charcoal px-4 text-label-l text-white hover:bg-bg-inverse-subtle">
            {copy.cta}
          </button>
          <button type="submit" className="flex h-[54px] shrink-0 items-center justify-center rounded-md border border-cool-gray px-5 text-label-l text-deep-charcoal hover:border-border-strong">
            {copy.later}
          </button>
        </div>
      </form>
    </div>
  );
}

function Select({
  id,
  label,
  items,
  value,
  defaultValue,
  onChange,
  autoFocus,
}: {
  id: string;
  label: string;
  items: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5">
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <div className={`${inputBoxClass()} relative gap-2`}>
        <select
          id={id}
          name={id}
          value={value}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className={`${inputClass} appearance-none pe-6`}
        >
          {items.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute end-3.5 text-deep-charcoal" />
      </div>
    </div>
  );
}
