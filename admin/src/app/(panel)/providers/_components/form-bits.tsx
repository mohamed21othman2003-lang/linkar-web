"use client";

import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { MOCK_NOW } from "@/lib/api/users";
import { arDate, arTime } from "@/lib/format";

// قطع نماذج مشتركة بين نوافذ مقدّمي الخدمة ومعالج الإضافة (CON5-07M / 07N)

/** حقول النوافذ في CON5-07M: 40 · r10 · حشو 12 · نص 14 Regular */
export const M_INPUT = "h-10! [&_input]:text-14! [&_input]:font-normal!";
export const M_SELECT = "h-10! [&>span]:text-14! [&>span]:font-normal!";
/** حقول المعالج (CON5-07N): 44 · نص 14 Regular */
export const W_INPUT = "[&_input]:text-14! [&_input]:font-normal!";
export const W_SELECT = "[&>span]:text-14! [&>span]:font-normal!";

/** سطر «مفتاح … قيمة» داخل النوافذ: حشو 5 · مسافة 12 · المفتاح 13 Light رمادي يمين والقيمة 13 Medium شمال */
export function ModalKV({ k, children }: { k: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-[5px] text-13 leading-5">
      <span className="shrink-0 font-light text-muted">{k}</span>
      <span className="min-w-0 text-end font-medium text-ink">{children}</span>
    </div>
  );
}

/** حقل نص متعدد الأسطر (96 · r10 · حشو 10·12 · 13 Medium) */
export function TextArea({ id, value, onChange, placeholder, invalid, rows = 3, className }: { id?: string; value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean; rows?: number; className?: string }) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-24 w-full resize-none rounded-10 border bg-white px-3 py-2.5 text-13 leading-[22px] font-medium text-ink outline-none placeholder:text-muted focus:border-[1.5px] focus:border-ink ${invalid ? "border-danger" : "border-border"} ${className ?? ""}`}
    />
  );
}

const todayIso = MOCK_NOW.toISOString().slice(0, 10);

/** تاريخ بالشكل العربي («1 نوفمبر 2026») + أيقونة التقويم على الشمال — الضغط يفتح منتقي التاريخ من المتصفح */
export function DateField({
  id,
  value,
  onChange,
  min,
  withTime,
  todayLabel,
  invalid,
  className = "h-10",
  placeholder = "اختر التاريخ",
  noIcon,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  withTime?: boolean;
  /** «اليوم · 14 أكتوبر 2026» لما القيمة هي تاريخ اليوم */
  todayLabel?: boolean;
  invalid?: boolean;
  className?: string;
  placeholder?: string;
  /** من غير أيقونة التقويم (موعد الزيارة في CON5-07N2) */
  noIcon?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const label = !value
    ? null
    : withTime
      ? `${arDate(value)} · ${arTime(value)}`
      : `${todayLabel && value === todayIso ? "اليوم · " : ""}${arDate(value)}`;
  return (
    <div className={`relative flex items-center gap-2 rounded-10 border bg-white px-3 focus-within:border-[1.5px] focus-within:border-ink ${invalid ? "border-danger" : "border-border"} ${className}`}>
      <span className={`min-w-0 flex-1 truncate text-14 ${label ? "text-ink" : "font-light text-muted"}`}>{label ?? placeholder}</span>
      {noIcon ? null : <Icon name="calendar" size={16} className="shrink-0 text-ink" />}
      <input
        ref={ref}
        id={id}
        type={withTime ? "datetime-local" : "date"}
        value={value}
        min={withTime && min ? `${min}T00:00` : min}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => ref.current?.showPicker?.()}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </div>
  );
}
