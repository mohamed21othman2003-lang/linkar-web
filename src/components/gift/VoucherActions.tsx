"use client";

import Link from "next/link";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useState } from "react";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { Popup, Toast, useFlash } from "./Popup";
import { actionClass } from "./ui";

export type ContactInfo = { title: string; address: string; logo: string; phone: string; whatsapp: string; mapsUrl: string; note: string };

export type ActionsCopy = {
  close: string;
  contactBranch: string;
  callBranch: string;
  callBranchSub: string;
  whatsapp: string;
  whatsappSub: string;
  directions: string;
  directionsSub: string;
  shareTitle: string;
  shareBody: string;
  copy: string;
  mail: string;
  sms: string;
  copyLink: string;
  copied: string;
  viewInAccount: string;
  shareVoucher: string;
  appleWallet: string;
  googleWallet: string;
  walletAdded: string;
};

// P-07 · تواصل مع الفرع
function ContactPopup({ open, onClose, info, copy, dissolve = false }: { open: boolean; onClose: () => void; info: ContactInfo; copy: ActionsCopy; dissolve?: boolean }) {
  const rows: { icon: UiGlyph; title: string; sub: string; href: string; external?: boolean }[] = [
    { icon: "phone", title: copy.callBranch, sub: copy.callBranchSub, href: `tel:${info.phone}` },
    { icon: "message", title: copy.whatsapp, sub: copy.whatsappSub, href: `https://wa.me/${info.whatsapp}`, external: true },
    { icon: "navigation", title: copy.directions, sub: copy.directionsSub, href: info.mapsUrl, external: true },
  ];
  return (
    <Popup open={open} title={copy.contactBranch} closeLabel={copy.close} onClose={onClose} dissolve={dissolve}>
      <div className="flex items-center gap-3 rounded-lg bg-tile px-3.5 py-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cool-gray bg-white">
          <img src={info.logo} alt="" width={39} height={12} className="w-[39px] object-contain" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-label-l text-deep-charcoal">{info.title}</p>
          <p className="text-caption text-text-secondary">{info.address}</p>
        </div>
      </div>
      {rows.map((r) => (
        <a
          key={r.icon}
          href={r.href}
          target={r.external ? "_blank" : undefined}
          rel={r.external ? "noopener noreferrer" : undefined}
          onClick={onClose}
          className="flex items-center gap-3 rounded-[14px] border border-border-default px-3.5 py-3 hover:border-border-strong"
        >
          <span className="flex shrink-0 rounded-md bg-neon-green/16 p-2.5 text-deep-charcoal">
            <Icon name={r.icon} size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-label-l text-deep-charcoal">{r.title}</span>
            <span className="text-caption text-text-secondary">{r.sub}</span>
          </span>
          <Icon name="chevron-left" size={16} flip className="shrink-0 text-state-gray" />
        </a>
      ))}
      <p className="flex items-center gap-2 rounded-md bg-neon-green/14 px-3.5 py-2.5 text-caption text-deep-charcoal">
        <span className="flex-1">{info.note}</span>
        <Icon name="info" size={14} className="shrink-0 text-deep-charcoal" />
      </p>
    </Popup>
  );
}

// P-08 · مشاركة القسيمة
function SharePopup({
  open,
  onClose,
  path,
  display,
  copy,
  onCopied,
}: {
  open: boolean;
  onClose: () => void;
  path: string;
  display: string;
  copy: ActionsCopy;
  onCopied: () => void;
}) {
  const url = () => (typeof window === "undefined" ? path : `${window.location.origin}${path}`);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      /* المتصفح رفض الوصول للحافظة */
    }
    onCopied();
  };
  const go = (href: string) => window.open(href, "_blank", "noopener,noreferrer");
  const options: { icon: UiGlyph; label: string; run: () => void }[] = [
    { icon: "copy", label: copy.copyLink, run: copyLink },
    { icon: "message", label: copy.whatsapp, run: () => go(`https://wa.me/?text=${encodeURIComponent(url())}`) },
    { icon: "phone", label: copy.sms, run: () => (window.location.href = `sms:?&body=${encodeURIComponent(url())}`) },
    { icon: "mail", label: copy.mail, run: () => (window.location.href = `mailto:?body=${encodeURIComponent(url())}`) },
  ];
  return (
    <Popup open={open} title={copy.shareTitle} closeLabel={copy.close} onClose={onClose}>
      <p className="text-body-s text-text-secondary">{copy.shareBody}</p>
      <div className="flex items-center gap-2.5 rounded-md bg-tile py-2 ps-3.5 pe-2">
        <Link href={path} dir="ltr" className="min-w-0 flex-1 truncate text-body-m text-deep-charcoal hover:underline rtl:text-end">
          {display}
        </Link>
        <button type="button" onClick={copyLink} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-deep-charcoal px-3.5 py-[9px] text-label-m text-neon-green">
          {copy.copy}
          <Icon name="copy" size={14} />
        </button>
      </div>
      <div className="flex items-start justify-between gap-2">
        {options.map((o) => (
          <button key={o.icon} type="button" onClick={() => {
              o.run();
              if (o.icon !== "copy") onClose();
            }} className="flex flex-col items-center gap-2 text-caption text-deep-charcoal">
            <span className="flex rounded-full bg-neon-green/16 p-4">
              <Icon name={o.icon} size={20} />
            </span>
            {o.label}
          </button>
        ))}
      </div>
    </Popup>
  );
}

// أزرار W2-80c: تواصل مع الفرع · عرضها في حسابي · مشاركة القسيمة
export function GiftVoucherActions({
  contact,
  sharePath,
  shareDisplay,
  accountHref,
  copy,
}: {
  contact: ContactInfo;
  sharePath: string;
  shareDisplay: string;
  accountHref: string;
  copy: ActionsCopy;
}) {
  const [popup, setPopup] = useState<"contact" | "share" | null>(null);
  const [toast, setToast] = useFlash();
  const close = useCallback(() => setPopup(null), []);
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={() => setPopup("contact")} className={actionClass("primary", "max-sm:w-full")}>
          {copy.contactBranch}
          <Icon name="phone" size={16} />
        </button>
        <Link href={accountHref} className={actionClass("outline", "max-sm:flex-1")}>
          {copy.viewInAccount}
          <Icon name="user" size={16} />
        </Link>
        <button type="button" onClick={() => setPopup("share")} className={actionClass("outline", "max-sm:flex-1")}>
          {copy.shareVoucher}
          <Icon name="share" size={16} />
        </button>
      </div>
      <ContactPopup open={popup === "contact"} onClose={close} info={contact} copy={copy} />
      <SharePopup
        open={popup === "share"}
        onClose={close}
        path={sharePath}
        display={shareDisplay}
        copy={copy}
        onCopied={() => {
          setPopup(null);
          setToast(copy.copied);
        }}
      />
      <Toast message={toast} />
    </>
  );
}

// أزرار W2-81: الاتجاهات · تواصل مع الفرع + أزرار المحفظة
export function SharedVoucherActions({ contact, copy }: { contact: ContactInfo; copy: ActionsCopy }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useFlash();
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className={actionClass("outline", "px-5 max-sm:flex-1")}>
          {copy.directions}
          <Icon name="navigation" size={16} />
        </a>
        <button type="button" onClick={() => setOpen(true)} className={actionClass("outline", "px-5 max-sm:flex-1")}>
          {copy.contactBranch}
          <Icon name="phone" size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {[
          { label: copy.appleWallet, logo: "/figma/gift/wallet-apple.svg" },
          { label: copy.googleWallet, logo: "/figma/gift/wallet-google.svg" },
        ].map((w) => (
          <button key={w.logo} type="button" onClick={() => setToast(copy.walletAdded)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-wallet-black px-3.5 py-2.5 text-label-m whitespace-nowrap text-white transition-colors hover:bg-solid-black">
            {w.label}
            <img src={w.logo} alt="" width={18} height={18} />
          </button>
        ))}
      </div>
      <ContactPopup open={open} onClose={close} info={contact} copy={copy} dissolve />
      <Toast message={toast} />
    </>
  );
}
