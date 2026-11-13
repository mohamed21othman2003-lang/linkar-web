import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";

// حقل نص (القسم 3.5 + 2.7 · Figma CON5-24M 3114:28715): M = 44 · r10 · حشو 12 · نص 13 Medium
// L = حقول صفحات الدخول (CON5-L1 3114:28801): 50 · r12 · حشو 14 · نص 14 Light. خطأ = إطار أحمر ونص تحت الحقل
export const TextInput = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<"input">, "size"> & { icon?: ReactNode; invalid?: boolean; ltr?: boolean; size?: "M" | "L" }
>(function TextInput({ icon, invalid, ltr, size = "M", className, ...rest }, ref) {
  return (
    <div
      className={`flex items-center gap-2 border bg-white focus-within:border-[1.5px] focus-within:border-ink ${
        size === "L" ? "h-[50px] rounded-12 px-3.5 [&_input]:text-14 [&_input]:font-light" : "h-11 rounded-10 px-3 [&_input]:text-13 [&_input]:font-medium"
      } ${
        invalid ? "border-danger" : "border-border"
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
  strong,
}: {
  /** عناوين حقول صفحات الدخول 13 Medium كحلي — باقي اللوحة 12 Medium رمادي */
  strong?: boolean;
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
