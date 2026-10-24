import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { LogoTile } from "./LogoTile";

export type SummaryRow = { label: string; value: string; icon?: "branch" | "car"; tone?: "default" | "credit" };

// Summary (W2-33…W2-35): «حجزك لدى» + الشعار، بنود الحجز بأسعارها، الفرع/السيارة، المجموع والخصومات، الإجمالي و CTA
// مكوّن عرض فقط (بيشتغل على السيرفر أو جوّه كومبوننت عميل)
export function Summary({
  v,
  cta,
  footer,
  className = "",
}: {
  v: {
    at: string;
    providerName: string;
    providerSlug: string;
    providerLogo: string;
    lines: { key: string; name: string; price: string }[];
    rows: SummaryRow[]; // الفرع والسيارة
    adjustments?: SummaryRow[]; // المجموع + خصم النقاط / رصيد المسوّق
    totalLabel: string;
    totalNote: string;
    total: string;
  };
  cta: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <aside className={`flex w-full flex-col gap-3.5 rounded-2xl border border-border-default bg-white p-6 lg:sticky lg:top-28 lg:w-[392px] lg:shrink-0 ${className}`}>
      <div className="flex items-center gap-3">
        <LogoTile slug={v.providerSlug} src={v.providerLogo} alt={v.providerName} size={44} />
        <div className="flex flex-col gap-0.5">
          <span className="text-caption text-text-secondary">{v.at}</span>
          <span className="text-h5">{v.providerName}</span>
        </div>
      </div>
      <hr className="border-border-default" />
      {v.lines.map((l) => (
        <div key={l.key} className="flex items-center justify-between gap-3 text-[14px] leading-6">
          <span className="font-light">{l.name}</span>
          <span className="shrink-0 font-medium">{l.price}</span>
        </div>
      ))}
      <hr className="border-border-default" />
      {v.rows.map((r) => (
        <Row key={r.label} r={r} />
      ))}
      {v.adjustments?.length ? (
        <>
          <hr className="border-border-default" />
          {v.adjustments.map((r) => (
            <Row key={r.label} r={r} />
          ))}
        </>
      ) : null}
      <hr className="border-border-default" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-label-l">{v.totalLabel}</span>
          <span className="text-caption text-text-secondary">{v.totalNote}</span>
        </div>
        <span className="shrink-0 text-h3">{v.total}</span>
      </div>
      {cta}
      {footer}
    </aside>
  );
}

function Row({ r }: { r: SummaryRow }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[14px] leading-6">
      <span className="flex shrink-0 items-center gap-1.5 font-light text-text-secondary">
        {r.icon === "branch" && <Icon name="map-pin" size={16} className="text-nature-green" />}
        {r.icon === "car" && (
          <span className="flex size-4 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/booking/car-outline.svg" alt="" width={10} height={6} />
          </span>
        )}
        {r.label}
      </span>
      <span className={`text-end font-medium ${r.tone === "credit" ? "text-green-active" : "text-deep-charcoal"}`}>{r.value}</span>
    </div>
  );
}

// ملاحظة «قسيمة صالحة 14 يوماً من الدفع» بأيقونة الدرع
export function VoucherNote({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-caption text-text-secondary">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/booking/shield-16.svg" alt="" width={16} height={16} />
      {text}
    </p>
  );
}
