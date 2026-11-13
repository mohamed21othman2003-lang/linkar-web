"use client";

// Switch (القسم 3.5 · Figma CON5-23R 3114:25621): 40×22 · r999 · حشو 2 · المقبض 18 أبيض
// شغّال = كحلي والمقبض يمين، مطفي = #CFD6D3 والمقبض شمال. معطّل = شفافية.
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  /** نص للقارئ الصوتي لما مفيش عنوان ظاهر مربوط */
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={`flex h-[22px] w-10 shrink-0 items-center rounded-full p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "justify-start bg-ink" : "justify-end bg-[#cfd6d3]"
      } ${className ?? ""}`}
    >
      <span aria-hidden className="size-[18px] rounded-full bg-white" />
    </button>
  );
}
