"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { Icon, type UiGlyph } from "./Icon";

// قائمة منسدلة (القسم 3.5 + 17). شكلين من Figma:
// field  = حقل النماذج (CON5-23M 3114:25249): 44 · r10 · حشو 12 · 13 Medium · سهم 14 على الشمال
// filter = فلتر «العنوان: القيمة» (CON5-23L 3114:28160): 40 · r10 · حشو 12 · العنوان 13 Light رمادي والقيمة 13 Medium
// القائمة نفسها بنفس شكل قائمة ⋯ (CON7 3114:48542): r12 · حشو 6 · عناصر 37 r8 · 13 Medium
export type Option<V extends string = string> = { value: V; label: string };

export function Select<V extends string = string>({
  value,
  onChange,
  options,
  label,
  variant = "field",
  placeholder = "اختر",
  invalid,
  disabled,
  id,
  className,
  ariaLabel,
  icon,
}: {
  value: V | undefined;
  onChange: (v: V) => void;
  options: readonly Option<V>[];
  /** في شكل filter: العنوان اللي قبل «:» */
  label?: string;
  variant?: "field" | "filter";
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  ariaLabel?: string;
  /** أيقونة مكان السهم (حقل «الفترة» في CON5-M00 = calendar 16) */
  icon?: UiGlyph;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Menu.Root dir="rtl" modal={false}>
      <Menu.Trigger
        id={id}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-invalid={invalid || undefined}
        className={`group flex items-center rounded-10 border bg-white text-13 text-ink outline-none disabled:cursor-not-allowed disabled:bg-surface-1 data-[state=open]:border-ink ${
          variant === "filter" ? "h-10 w-fit gap-1.5 px-3 hover:bg-surface-1" : "h-11 w-full gap-2 px-3"
        } ${invalid ? "border-danger" : "border-border"} ${className ?? ""}`}
      >
        {variant === "filter" ? (
          <>
            {label ? <span className="font-light whitespace-nowrap text-muted">{label}:</span> : null}
            <span className="font-medium whitespace-nowrap">{current?.label ?? placeholder}</span>
          </>
        ) : (
          <span className={`min-w-0 flex-1 truncate text-start ${current ? "font-medium" : "font-light text-muted"}`}>{current?.label ?? placeholder}</span>
        )}
        {icon ? <Icon name={icon} size={16} className="shrink-0" /> : <Icon name="chevron-down" size={14} className="shrink-0 transition-transform group-data-[state=open]:rotate-180" />}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className={`z-[70] flex max-h-[320px] flex-col gap-0.5 overflow-y-auto rounded-12 border border-border bg-white p-1.5 shadow-menu ${
            variant === "field" ? "w-[var(--radix-dropdown-menu-trigger-width)]" : "min-w-[200px]"
          }`}
        >
          <Menu.RadioGroup value={value} onValueChange={(v) => onChange(v as V)}>
            {options.map((o) => (
              <Menu.RadioItem
                key={o.value}
                value={o.value}
                className="flex min-h-[37px] cursor-pointer items-center justify-between gap-2.5 rounded-8 px-2.5 py-2 text-13 leading-[21px] font-medium text-ink outline-none data-highlighted:bg-surface-1 data-[state=checked]:bg-lime-tint"
              >
                {o.label}
                <Menu.ItemIndicator>
                  <Icon name="check" size={16} />
                </Menu.ItemIndicator>
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
