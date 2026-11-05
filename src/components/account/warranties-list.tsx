"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Dialog, CloseButton, popupBtnClass } from "./account-dialog";

export type WarrantyCardView =
  | {
      status: "active";
      booking: string;
      statusLabel: string;
      title: string;
      provider: string;
      meta: [string, string][];
      remaining: number;
      certificate: string;
      // P-30
      showAt: string;
      rows: [string, string][];
    }
  | { status: "pending"; booking: string; statusLabel: string; title: string; provider: string; meta: [string, string][]; note: string };

// W2-74 · ضماناتي (202:22768) — كروت الشهادات، و«عرض الشهادة» بيفتح P-30 (202:27073)
export function WarrantiesList({
  items,
  copy,
}: {
  items: WarrantyCardView[];
  copy: { view: string; popupTitle: string; popupNote: string; close: string };
}) {
  const [open, setOpen] = useState<string | null>(null);
  const current = items.find((w) => w.status === "active" && w.certificate === open);

  return (
    <>
      {items.map((w) => (
        <article key={w.booking} className="flex flex-col gap-3.5 rounded-[20px] border border-[#e3e8e5] bg-white px-6 py-[22px]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-[18px] leading-[28px] font-bold text-deep-charcoal">{w.title}</h2>
              <p className="text-[14px] leading-[22px] text-state-gray">{w.provider}</p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[13px] leading-[20px] font-medium ${
                w.status === "active" ? "bg-[#eaf7ec] text-nature-green" : "bg-[#fdf3e1] text-[#9a5b00]"
              }`}
            >
              {w.statusLabel}
            </span>
          </div>
          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {w.meta.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <dt className="text-[13px] leading-[20px] text-state-gray">{k}</dt>
                <dd className="text-[15px] leading-[24px] font-medium text-deep-charcoal">{v}</dd>
              </div>
            ))}
          </dl>
          {w.status === "active" ? (
            <>
              {/* Track — المدة المتبقية من الضمان */}
              <div className="flex h-1.5 w-full rounded-full bg-icon-tile" aria-hidden>
                <span className="h-1.5 rounded-full bg-green-active" style={{ width: `${w.remaining * 100}%` }} />
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setOpen(w.certificate)}
                  className="flex items-center gap-2 rounded-md bg-deep-charcoal px-5 py-[11px] text-[15px] leading-[22px] font-medium text-white hover:bg-bg-inverse-subtle"
                >
                  <Icon name="qr" size={16} className="text-neon-green" />
                  {copy.view}
                </button>
              </div>
            </>
          ) : (
            <p className="text-[13px] leading-[21px] text-state-gray">{w.note}</p>
          )}
        </article>
      ))}

      {/* P-30 · شهادة الضمان */}
      <Dialog open={!!current} onClose={() => setOpen(null)} label={copy.popupTitle} className="max-w-[520px]">
        {current && current.status === "active" && (
          <div className="flex flex-col gap-4 rounded-[24px] bg-white px-5 pt-[26px] pb-7 shadow-popup sm:px-7">
            <div className="flex items-start gap-3">
              <h2 className="min-w-0 flex-1 text-h4 text-deep-charcoal">{copy.popupTitle}</h2>
              <CloseButton label={copy.close} onClick={() => setOpen(null)} />
            </div>
            <div className="flex flex-col items-center gap-2 rounded-lg bg-tile p-[18px] text-center">
              <Icon name="qr" size={120} className="text-deep-charcoal" />
              <p className="text-[16px] leading-[24px] font-semibold text-deep-charcoal" dir="ltr">
                {current.certificate}
              </p>
              <p className="text-[13px] leading-[20px] text-state-gray">{current.showAt}</p>
            </div>
            <dl className="flex flex-col">
              {current.rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 border-b border-[#e3e8e5] py-2 text-[14px] leading-[22px]">
                  <dt className="shrink-0 text-state-gray">{k}</dt>
                  <dd className="text-end font-medium text-deep-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[13px] leading-[21px] text-state-gray">{copy.popupNote}</p>
            <button type="button" onClick={() => setOpen(null)} className={`${popupBtnClass.outline} h-auto! w-full flex-none py-[11px] text-[15px]! font-medium`}>
              {copy.close}
            </button>
          </div>
        )}
      </Dialog>
    </>
  );
}
