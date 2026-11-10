"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";

// عناصر نماذج الانضمام (W2-90b · W2-91b · W2-93 · W2-94b): حقل 52px، حد رمادي، أيقونة في آخر الحقل

const box = "w-full rounded-md border bg-white px-3.5 py-3 text-body-m text-deep-charcoal placeholder:text-state-gray outline-none transition-colors focus:border-deep-charcoal";
const borderOf = (error?: string) => (error ? "border-border-danger" : "border-border-default");

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-caption text-text-danger">
      {error}
    </p>
  );
}

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  error,
  type = "text",
  inputMode,
  autoComplete,
  hint,
  className = "",
  inputClassName = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: UiGlyph;
  error?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  hint?: string;
  className?: string;
  /** كلاسات إضافية للـinput نفسه (مثلاً تصغير الـplaceholder الطويل على الموبايل) */
  inputClassName?: string;
}) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${box} ${borderOf(error)} ${icon ? "pe-10" : ""} [direction:inherit] ${inputClassName}`}
        />
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-state-gray">
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      {hint && <p className="text-caption text-text-secondary">{hint}</p>}
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${box} ${borderOf(error)} appearance-none pe-10 ${value ? "" : "text-state-gray"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-deep-charcoal">
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-state-gray">
          <Icon name="chevron-down" size={16} />
        </span>
      </div>
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

// النطاقات الرقمية («20 – 50») تتقري من الشمال لليمين زي الفيجما حتى جوه سطر عربي
const numDir = (label: string) => (/^[\d\s–-]+$/.test(label) ? "ltr" : undefined);

// W2-DD · قائمة منسدلة بلوحة بيضاء (زي «عدد الباقات المتوقع شهرياً»): عنوان الحقل فوق الخيارات،
// والمختار بخلفية ليموني فاتح + وزن 600 + ✓ في آخر السطر. تتقفل بالضغط برّه أو Esc، والأسهم بتتنقّل بين الخيارات.
export function MenuSelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // التركيز على المختار (أو أول خيار) أول ما اللوحة تفتح
  const openMenu = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      const btns = list.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
      btns?.[Math.max(0, options.findIndex((o) => o.value === value))]?.focus();
    });
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const btns = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = btns.length;
      btns[(i + (e.key === "ArrowDown" ? 1 : -1) + n) % n]?.focus();
    } else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={wrap} className="relative flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-l`}
        data-invalid={!!error}
        aria-describedby={error ? `${id}-e` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`${box} ${borderOf(error)} relative pe-10 text-start ${current ? "" : "text-state-gray"} ${open ? "border-deep-charcoal" : ""}`}
      >
        {current ? <span dir={numDir(current.label)}>{current.label}</span> : placeholder}
        <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-state-gray">
          <Icon name="chevron-down" size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 flex flex-col gap-1 rounded-2xl bg-white p-2.5 shadow-elevation-3">
          <p aria-hidden className="px-3 pt-1 text-[16px]/[26px] font-bold text-deep-charcoal">
            {label}
          </p>
          <ul ref={list} id={`${id}-l`} role="listbox" aria-label={label} onKeyDown={onListKey} className="flex flex-col">
            {options.map((o) => {
              const on = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(o.value);
                      close();
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-[11px] text-start text-[15px]/[24px] text-deep-charcoal outline-none focus-visible:ring-2 focus-visible:ring-deep-charcoal ${
                      on ? "bg-tint-lime font-semibold" : "font-normal hover:bg-tile focus-visible:bg-tile"
                    }`}
                  >
                    <span dir={numDir(o.label)}>{o.label}</span>
                    {on && <Icon name="check" size={16} className="shrink-0 text-state-gray" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

// حقل بحث بقائمة اقتراحات (المدينة) — datalist
export function SearchField({
  label,
  name,
  value,
  onChange,
  placeholder,
  options,
  icon,
  error,
  onEnter,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  icon: UiGlyph;
  error?: string;
  onEnter?: () => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          list={`${id}-l`}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          className={`${box} ${borderOf(error)} pe-10`}
        />
        <datalist id={`${id}-l`}>
          {options.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-state-gray">
          <Icon name={icon} size={16} />
        </span>
      </div>
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-m text-deep-charcoal">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${box} ${borderOf(error)} h-[140px] resize-none`}
      />
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

// شيبس اختيار متعدد — selected: كحلي + ✓ (tone neon = W2-90b، white = W2-94b)
export function ChipGroup({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  selectedText = "neon",
  spaced = false,
}: {
  legend: string;
  hint?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  selectedText?: "neon" | "white";
  spaced?: boolean;
}) {
  const id = useId();
  return (
    <fieldset className={`flex flex-col ${spaced ? "gap-5" : "gap-4"}`} aria-describedby={error ? `${id}-e` : undefined}>
      <legend className="sr-only">{legend}</legend>
      <div aria-hidden className={`flex flex-col ${spaced ? "gap-5" : "gap-0.5"}`}>
        <span className="text-h5 text-deep-charcoal">{legend}</span>
        {hint && <span className={`${spaced ? "text-caption" : "text-body-s"} text-text-secondary`}>{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              aria-invalid={!!error && i === 0}
              onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-label-m transition-colors duration-150 ease-figma-out ${
                on
                  ? `border-deep-charcoal bg-deep-charcoal ${selectedText === "neon" ? "text-neon-green" : "text-white"}`
                  : "border-border-default bg-white text-deep-charcoal hover:border-border-strong"
              }`}
            >
              {o.label}
              {on && <Icon name="check" size={14} className="text-neon-green" />}
            </button>
          );
        })}
      </div>
      <FieldError id={`${id}-e`} error={error} />
    </fieldset>
  );
}

export function Consent({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-body-s text-deep-charcoal">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-describedby={error ? `${id}-e` : undefined} />
        <span
          data-invalid={!!error}
          className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border peer-focus-visible:shadow-focus-ring ${
            checked ? "border-deep-charcoal bg-deep-charcoal text-neon-green" : error ? "border-border-danger bg-white" : "border-border-strong bg-white"
          }`}
        >
          {checked && <Icon name="check" size={14} />}
        </span>
        {children}
      </label>
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

// spaced = العنوان والوصف منفصلين بمسافة 20 (W2-91b، W2-94b)؛ غير كده متلاصقين (W2-90b)
export function SectionHead({ title, hint, spaced = false }: { title: string; hint?: string; spaced?: boolean }) {
  return (
    <div className={`flex flex-col ${spaced ? "gap-5" : "gap-0.5"}`}>
      <h2 className="text-h5 text-deep-charcoal">{title}</h2>
      {hint && <p className={`${spaced ? "text-caption" : "text-body-s"} text-text-secondary`}>{hint}</p>}
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4 md:flex-row md:items-start">{children}</div>;
}

// رفع ملف: صندوق رمادي متقطع (W2-91b، W2-94b) — بعد الاختيار يتحول لسطر «تم» زي W2-90b
export function FileBox({
  label,
  accept,
  file,
  onFile,
  removeLabel,
  sizeText,
  error,
  variant = "dashed",
}: {
  label: string;
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
  removeLabel: string;
  sizeText: (f: File) => string;
  error?: string;
  variant?: "dashed" | "done-only";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  if (file) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md bg-tint-lime px-3.5 py-3">
        <span className="flex min-w-0 items-center gap-2 text-label-m text-deep-charcoal">
          <Icon name="check" size={16} className="shrink-0 text-nature-green" />
          <span className="truncate">{`${file.name} · ${sizeText(file)}`}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            onFile(null);
            if (ref.current) ref.current.value = "";
          }}
          className="shrink-0 rounded-md py-0.5 text-label-m text-nature-green hover:underline"
        >
          {removeLabel}
        </button>
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label
        htmlFor={id}
        data-invalid={!!error}
        className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border border-dashed bg-tile p-3.5 text-body-s text-text-secondary hover:border-border-strong ${
          error ? "border-border-danger" : "border-border-default"
        } ${variant === "done-only" ? "hidden" : ""}`}
      >
        {label}
        <Icon name="download" size={16} className="shrink-0 text-state-gray" />
      </label>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <FieldError id={`${id}-e`} error={error} />
    </div>
  );
}

export const fileSize = (f: File, mb: string, kb: string) =>
  f.size >= 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} ${mb}` : `${Math.max(1, Math.round(f.size / 1024))} ${kb}`;

// قواعد التحقق
export const re = {
  phone: /^05\d{8}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  digits: (n: number) => new RegExp(`^\\d{${n}}$`),
  iban: /^SA\d{22}$/,
};
export const clean = (s: string) => s.replace(/[\s‎‏-]/g, "");

// ?demo=figma — حالة الفيجما المعبّاة (للمقارنة بالبكسل فقط؛ النموذج الحقيقي بيبدأ فاضي)
export const demoFile = (name: string, mb: number) => new File([new Uint8Array(Math.round(mb * 1024 * 1024))], name, { type: "application/pdf" });
