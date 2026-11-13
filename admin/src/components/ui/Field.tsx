import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";

// حقل نص (القسم 3.5 + 2.7): إطار #D9DEDB · ارتفاع 48 · r10 · خطأ = إطار أحمر ونص تحت الحقل
export const TextInput = forwardRef<
  HTMLInputElement,
  ComponentProps<"input"> & { icon?: ReactNode; invalid?: boolean; ltr?: boolean }
>(function TextInput({ icon, invalid, ltr, className, ...rest }, ref) {
  return (
    <div
      className={`flex h-12 items-center gap-2.5 rounded-10 border bg-white px-3.5 focus-within:border-ink focus-within:ring-1 focus-within:ring-ink ${
        invalid ? "border-danger" : "border-border"
      } ${className ?? ""}`}
    >
      {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
      <input
        ref={ref}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={invalid || undefined}
        {...rest}
        className={`min-w-0 flex-1 bg-transparent text-14 text-ink outline-none placeholder:text-muted ${ltr ? "text-right" : ""}`}
      />
    </div>
  );
});

export function Field({
  label,
  error,
  hint,
  aside,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  aside?: ReactNode;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-13 font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children(id)}
      {error ? (
        <p role="alert" className="text-12 text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-12 text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, className, ...rest }: { label: ReactNode } & Omit<ComponentProps<"input">, "type">) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 text-13 text-ink ${className ?? ""}`}>
      <input type="checkbox" {...rest} className="peer sr-only" />
      <span
        aria-hidden
        className="flex size-5 items-center justify-center rounded-[6px] border border-border-strong bg-white text-white peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-ink [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.2 4.9 8.5 9.5 3.7" stroke="#ABF907" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </label>
  );
}
