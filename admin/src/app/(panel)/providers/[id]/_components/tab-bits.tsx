"use client";

import type { ReactNode } from "react";
import { Select, type Option } from "@/components/ui/Select";

// قطع مشتركة بين تبويبات الملف (المستخدمون · الحجوزات · التحليلات · المستحقات · الجودة · الفروع)

/** شرائح (Figma «Chip»): 37 · r16 · حشو 6·14 · 13 Medium · #F1F3F2 والمختارة كحلي بنص أبيض */
export function Chips<V extends string>({ items, value, onChange, label }: { items: readonly { value: V; label: string }[]; value: V; onChange: (v: V) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-2">
      {items.map((c) => {
        const on = c.value === value;
        return (
          <button
            key={c.value || "all"}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.value)}
            className={`h-[37px] rounded-16 px-3.5 text-13 leading-[25px] font-medium whitespace-nowrap ${on ? "bg-ink text-white" : "bg-[#f1f3f2] text-ink hover:bg-surface-2"}`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/** فلتر «العنوان: القيمة» (Figma «Dropdown»): 40 · r10 · حشو 12·10 · مسافة 4 · القيمة 13 SemiBold.
 *  `active` = فلتر مختار (#F7FBE9 بإطار كحلي 1.5) وزر × مكان السهم يرجّعه لـ`clearTo`. */
export function FilterSelect<V extends string>({
  label,
  value,
  options,
  onChange,
  active,
  clearTo,
  semibold = true,
}: {
  label: string;
  value: V;
  options: readonly Option<V>[];
  onChange: (v: V) => void;
  active?: boolean;
  clearTo?: V;
  semibold?: boolean;
}) {
  const cls = `h-10! ${semibold ? "gap-1! ps-3! pe-2.5! [&>span:last-of-type]:font-semibold" : ""} ${active ? "border-[1.5px]! border-ink! bg-lime-tint! hover:bg-lime-tint!" : ""}`;
  if (!active || clearTo === undefined) return <Select variant="filter" label={label} value={value} onChange={onChange} options={options} className={cls} />;
  return (
    <div className="relative">
      <Select variant="filter" label={label} value={value} onChange={onChange} options={options} icon="x" className={cls} />
      {/* منطقة × فوق أيقونة الفلتر */}
      <button
        type="button"
        aria-label={`مسح ${label}`}
        onClick={() => onChange(clearTo)}
        className="absolute inset-y-0 end-0 w-8 rounded-e-10"
      />
    </div>
  );
}

/** «مسح الفلاتر» (13 Medium أخضر) */
export function ClearLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-13 leading-5 font-medium whitespace-nowrap text-success hover:underline">
      مسح الفلاتر
    </button>
  );
}

/** عنوان قسم جوه التبويب (16 Bold) */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-16 leading-6 font-bold text-ink ${className ?? ""}`}>{children}</h2>;
}

/** عنوان عمود من سطرين (رأس 58 في Figma: «سعر البيع · شامل» / «إجمالي الحجوزات 2026») */
export function WrapHead({ children }: { children: ReactNode }) {
  return <span className="block leading-5 whitespace-normal">{children}</span>;
}
