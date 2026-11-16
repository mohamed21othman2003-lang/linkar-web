import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";

// حقل نص (القسم 3.5 + 2.7 · Figma CON5-24M 3114:28715): M = 44 · r10 · حشو 12 · نص 13 Medium
// L = حقول صفحات الدخول (CON5-L1 3114:28801): 50 · r12 · حشو 14 · نص 14 Light. خطأ = إطار أحمر ونص تحت الحقل
export const TextInput = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<"input">, "size"> & { icon?: ReactNode; end?: ReactNode; invalid?: boolean; ltr?: boolean; size?: "M" | "L" }
>(function TextInput({ icon, end, invalid, ltr, size = "M", className, ...rest }, ref) {
  return (
    <div
      className={`flex items-center gap-2 border bg-white focus-within:border-[1.5px] ${
        size === "L" ? "h-[50px] rounded-12 px-3.5 [&_input]:text-14 [&_input]:font-light" : "h-11 rounded-10 px-3 [&_input]:text-13 [&_input]:font-medium"
      } ${
        // الخطأ يفضل أحمر حتى والحقل عليه الفوكس
        invalid ? "border-danger focus-within:border-danger" : "border-border focus-within:border-ink"
      } ${className ?? ""}`}
    >
      {icon ? <span className="shrink-0 text-muted">{icon}</span> : null}
      <input
        ref={ref}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={invalid || undefined}
        {...rest}
        className={`min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:font-light placeholder:text-muted ${ltr ? "text-right" : ""}`}
      />
      {end}
    </div>
  );
});

/** زر إظهار/إخفاء كلمة المرور (بيتحط في end بتاع TextInput) */
export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
      aria-pressed={shown}
      className="hit-44 flex size-8 shrink-0 items-center justify-center rounded-8 text-muted hover:bg-surface-1 hover:text-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        {shown ? null : <path d="M4 4l16 16" />}
      </svg>
    </button>
  );
}

export function Field({
  label,
  error,
  hint,
  aside,
  children,
  className,
  strong,
  required,
}: {
  /** عناوين حقول صفحات الدخول 13 Medium كحلي — باقي اللوحة 12 Medium رمادي */
  strong?: boolean;
  /** حقل إلزامي حسب قواعد الخادم → علامة * حمراء بعد العنوان (القسم 18.2 · 3) */
  required?: boolean;
  label: string;
  error?: string;
  hint?: string;
  aside?: ReactNode;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={strong ? "text-13 font-medium text-ink" : "text-12 font-medium text-muted"}>
          {label}
          {required ? (
            <span aria-hidden className="ms-0.5 text-danger">
              *
            </span>
          ) : null}
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
