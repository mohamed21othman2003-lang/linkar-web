"use client";

import { useId, useState } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { AxCloseButton, AxDialog, useAxToast } from "./account-extra-dialog";

export type ReferralCopy = {
  title: string;
  text: string;
  note: string;
  code: string;
  copy: string;
  share: string;
  close: string;
  // P-08c
  shareTitle: string;
  shareText: string;
  shareLink: string;
  shareMessage: string;
  shareOptions: { key: string; label: string }[];
  toastCopied: string;
};

const optionIcon: Record<string, UiGlyph> = { copy: "copy", whatsapp: "message", sms: "phone", email: "mail" };

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // متصفح من غير صلاحية الحافظة — مفيش حاجة نعملها
  }
}

// «Referral» في W2-65: ادعُ صديقاً + الكود + نسخ + مشاركة (بتفتح P-08c · مشاركة كود الدعوة)
export function PointsReferral({ c }: { c: ReferralCopy }) {
  const [open, setOpen] = useState(false);
  const { show, node } = useAxToast();
  const titleId = useId();
  const url = `https://${c.shareLink}`;
  const body = `${c.shareMessage} ${url}`;
  const hrefs: Record<string, string> = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(body)}`,
    sms: `sms:?&body=${encodeURIComponent(body)}`,
    email: `mailto:?subject=${encodeURIComponent(c.shareMessage)}&body=${encodeURIComponent(body)}`,
  };

  return (
    <section className="flex flex-col gap-2.5 rounded-[20px] border border-neon-green/60 bg-tint-lime p-6">
      <h2 className="flex items-center gap-2 text-h5 text-deep-charcoal">
        <Icon name="gift" size={20} className="shrink-0 text-nature-green" />
        {c.title}
      </h2>
      <p className="text-body-s text-deep-charcoal">{c.text}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-[42px] items-center gap-1.5 rounded-md bg-deep-charcoal px-[18px] text-label-m text-neon-green hover:bg-bg-inverse-subtle"
        >
          <Icon name="share" size={16} />
          {c.share}
        </button>
        <button
          type="button"
          onClick={() => (copyText(c.code), show(c.toastCopied))}
          className="inline-flex h-control-md items-center gap-1.5 rounded-md border border-cool-gray bg-white px-[18px] text-label-m text-deep-charcoal hover:bg-tile"
        >
          <Icon name="copy" size={16} />
          {c.copy}
        </button>
        <span dir="ltr" className="inline-flex h-[46px] items-center rounded-md border border-cool-gray bg-white px-4 text-h5 text-deep-charcoal">
          {c.code}
        </span>
      </div>
      <p className="text-caption text-state-gray">{c.note}</p>

      <AxDialog open={open} onClose={() => setOpen(false)} labelledBy={titleId} className="flex flex-col gap-4 px-7 pt-[26px] pb-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-h4 text-deep-charcoal">
            {c.shareTitle}
          </h2>
          <AxCloseButton onClick={() => setOpen(false)} label={c.close} />
        </div>
        <p className="text-body-s text-state-gray">{c.shareText}</p>
        <div className="flex items-center justify-between gap-2.5 rounded-md bg-tile py-2 ps-3.5 pe-2">
          <span dir="ltr" className="min-w-0 truncate text-body-m text-deep-charcoal">
            {c.shareLink}
          </span>
          <button
            type="button"
            data-autofocus
            onClick={() => (copyText(url), show(c.toastCopied))}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-deep-charcoal px-3.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
          >
            <Icon name="copy" size={14} />
            {c.copy}
          </button>
        </div>
        <ul className="flex items-start justify-between gap-3">
          {c.shareOptions.map((o) => {
            const inner = (
              <>
                <span className="flex size-[52px] items-center justify-center rounded-full bg-neon-green/16">
                  <Icon name={optionIcon[o.key] ?? "share"} size={20} className="text-deep-charcoal" />
                </span>
                <span className="text-caption whitespace-nowrap text-deep-charcoal">{o.label}</span>
              </>
            );
            const cls = "flex flex-col items-center gap-2 rounded-md hover:opacity-80";
            return (
              <li key={o.key}>
                {o.key === "copy" ? (
                  <button type="button" className={cls} onClick={() => (copyText(url), show(c.toastCopied))}>
                    {inner}
                  </button>
                ) : (
                  <a className={cls} href={hrefs[o.key]} target={o.key === "whatsapp" ? "_blank" : undefined} rel="noopener noreferrer">
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </AxDialog>
      {node}
    </section>
  );
}
