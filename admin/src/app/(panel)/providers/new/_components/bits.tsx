"use client";

import { useRef, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// قطع صفحات المعالج (CON5-07N1 3114-51246 · 07N2 3114-51551 · 07N3 3114-51438)

/** بطاقة بيضا بإطار r16 · حشو 20 · مسافة 12 · عنوان 16 Bold (بطاقة الحساب البنكي في Figma بلا إطار وعنوانها 18) */
export function WCard({ title, children, plain, className }: { title: ReactNode; children: ReactNode; plain?: boolean; className?: string }) {
  return (
    <section className={`flex flex-col rounded-16 bg-white p-5 ${plain ? "gap-3.5" : "gap-3 border border-border"} ${className ?? ""}`}>
      <h2 className={`font-bold text-ink ${plain ? "text-18 leading-7" : "text-16 leading-[26px]"}`}>{title}</h2>
      {children}
    </section>
  );
}

/** مؤشر الخطوات: 58 · r14 · حشو 14·18 · نقطة 28 (الحالية كحلي برقم أبيض · المكتملة أخضر فاتح · القادمة رمادي) · خط 2 #E3E7E5 */
const STEPS = ["المنشأة والمالك", "الفروع", "المراجعة والحفظ"];
export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol aria-label="خطوات المعالج" className="flex items-center gap-2 rounded-14 border border-border bg-white px-[18px] py-3.5">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n === step ? "current" : n < step ? "done" : "next";
        return (
          <li key={label} className={`flex items-center gap-2 ${i < 2 ? "flex-1" : ""}`} aria-current={state === "current" ? "step" : undefined}>
            <span className={`text-13 leading-5 whitespace-nowrap ${state === "current" ? "font-bold text-ink" : state === "done" ? "font-medium text-ink" : "font-medium text-muted"}`}>{label}</span>
            <span className={`num flex size-7 shrink-0 items-center justify-center rounded-full text-13 font-bold ${state === "current" ? "bg-ink text-white" : state === "done" ? "bg-lime text-ink" : "bg-surface-2 text-muted"}`}>{state === "done" ? <Icon name="check" size={14} /> : n}</span>
            {i < 2 ? <span aria-hidden className={`h-0.5 flex-1 ${state === "done" ? "bg-lime" : "bg-[#e3e7e5]"}`} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

/** عنوان قسم داخل بطاقة الفرع (14 Bold) */
export function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-14 leading-[22px] font-bold text-ink">{children}</h3>;
}

/** صف مستند: أيقونة ملف 18 + الاسم 14 Medium يمين، والحالة (شارة خضراء) أو «رفع الملف» شمال · 46 · r10 · حشو 10·12 */
export function DocRow({ label, status, onFile, accept = "application/pdf,image/*", multiple }: { label: string; status: string; onFile: (files: FileList) => void; accept?: string; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), ref.current?.click())}
      className="flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-10 border border-border bg-white px-3 py-2.5 hover:bg-surface-1"
    >
      <Icon name="file" size={18} className="shrink-0 text-ink" />
      <span className="min-w-0 flex-1 text-14 leading-[22px] font-medium text-ink">{label}</span>
      {status ? (
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-success-tint px-2.5 text-12 leading-[18px] font-medium text-success">{status}</span>
      ) : (
        <span className="inline-flex h-[46px] shrink-0 items-center gap-1.5 rounded-12 border border-border bg-white px-[18px] text-14 font-medium text-ink">
          رفع الملف
          <Icon name="download" size={16} />
        </span>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          if (e.target.files?.length) onFile(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** اختيار من اتنين (هوية الفرع): 45 · r10 · المختار خلفية #F7FBE9 بإطار كحلي 1.5 ودائرة ممتلئة */
export function RadioCard({ checked, onSelect, children }: { checked: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`flex h-[45px] items-center gap-2.5 rounded-10 px-3.5 text-start ${checked ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}
    >
      <span className="min-w-0 flex-1 text-14 font-medium text-ink">{children}</span>
      <span aria-hidden className={`size-[18px] shrink-0 rounded-full ${checked ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
    </button>
  );
}
