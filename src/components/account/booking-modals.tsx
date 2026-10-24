"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getAccountDict } from "@/i18n/dict/account";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { useRouter } from "next/navigation";
import { CloseButton, Dialog, Popup, useToast } from "./account-dialog";
import { ProviderTile, VoucherCode } from "./account-ui";

export type BranchView = { id: string; providerSlug: string; branchLine: string; address: string; mapsUrl: string };

// P-07 · تواصل مع الفرع (834:3) — من «تواصل مع الفرع» في W2-37
export function ContactBranchPopup({ locale, open, onClose, b }: { locale: Locale; open: boolean; onClose: () => void; b: BranchView }) {
  const d = getAccountDict(locale);
  const p = d.popups.p07;
  // رقم الفرع وواتساب مش موجودين في الفيجما — الصفين بيظهروا بدون رابط لحد ما تيجي البيانات من الـAPI
  const rows: { icon: "phone" | "message" | "navigation"; title: string; sub: string; href?: string }[] = [
    { icon: "phone", title: p.call, sub: p.callSub },
    { icon: "message", title: p.whatsapp, sub: p.whatsappSub },
    { icon: "navigation", title: p.directions, sub: p.directionsSub, href: b.mapsUrl },
  ];
  return (
    <Popup open={open} onClose={onClose} title={p.title} closeLabel={d.close}>
      <div className="flex items-center gap-3 rounded-[16px] bg-tile px-3.5 py-3">
        <ProviderTile slug={b.providerSlug} alt="" size={48} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-label-l text-deep-charcoal">{b.branchLine}</p>
          <p className="text-caption text-state-gray">{b.address}</p>
        </div>
      </div>
      {rows.map((r) => {
        const inner = (
          <>
            <span className="flex shrink-0 rounded-md bg-neon-green/16 p-2.5 text-deep-charcoal">
              <Icon name={r.icon} size={18} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-label-l text-deep-charcoal">{r.title}</span>
              <span className="text-caption text-state-gray">{r.sub}</span>
            </span>
            <Icon name="chevron-left" size={16} flip className="shrink-0 text-state-gray" />
          </>
        );
        const cls = "flex items-center gap-3 rounded-[14px] border border-cool-gray px-3.5 py-3 text-start";
        return r.href ? (
          <a key={r.icon} href={r.href} target="_blank" rel="noopener noreferrer" onClick={onClose} className={`${cls} hover:border-border-strong`}>
            {inner}
          </a>
        ) : (
          <div key={r.icon} aria-disabled="true" className={cls}>
            {inner}
          </div>
        );
      })}
      <p className="flex items-center gap-2 rounded-md bg-neon-green/14 px-3.5 py-2.5 text-caption text-deep-charcoal">
        <Icon name="info" size={14} className="shrink-0" />
        {p.note(b.id)}
      </p>
    </Popup>
  );
}

// P-08 · مشاركة القسيمة (834:55) — من «مشاركة» في W2-37v
export function ShareVoucherPopup({
  locale,
  open,
  onClose,
  link,
  onCopied,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  link: string;
  onCopied: () => void;
}) {
  const d = getAccountDict(locale);
  const p = d.popups.p08;
  const url = `https://${link}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* المتصفح رافض الوصول للحافظة — بنكمّل ونعرض الرسالة */
    }
    onCopied();
  };
  const enc = encodeURIComponent(url);
  const opts = [
    { key: "wa", icon: "message" as const, label: p.whatsapp, href: `https://wa.me/?text=${enc}` },
    { key: "sms", icon: "phone" as const, label: p.sms, href: `sms:?&body=${enc}` },
    { key: "mail", icon: "mail" as const, label: p.email, href: `mailto:?body=${enc}` },
  ];
  return (
    <Popup open={open} onClose={onClose} title={p.title} closeLabel={d.close}>
      <p className="text-body-s text-state-gray">{p.body}</p>
      <div className="flex items-center gap-2.5 rounded-md bg-tile py-2 ps-3.5 pe-2">
        <span dir="ltr" className="min-w-0 flex-1 truncate text-start text-body-m text-deep-charcoal">
          {link}
        </span>
        <button type="button" onClick={copy} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-deep-charcoal px-3.5 py-[9px] text-label-m text-neon-green">
          <Icon name="copy" size={14} />
          {p.copy}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copy} className="flex flex-col items-center gap-2 text-caption text-deep-charcoal">
          <span className="flex rounded-full bg-neon-green/16 p-4">
            <Icon name="copy" size={20} />
          </span>
          {p.copyLink}
        </button>
        {opts.map((o) => (
          <a key={o.key} href={o.href} target="_blank" rel="noopener noreferrer" onClick={onClose} className="flex flex-col items-center gap-2 text-caption text-deep-charcoal">
            <span className="flex rounded-full bg-neon-green/16 p-4">
              <Icon name={o.icon} size={20} />
            </span>
            {o.label}
          </a>
        ))}
      </div>
    </Popup>
  );
}

export type RatingView = { bookingId: string; providerSlug: string; meta: string; criteria: string[]; sample: number[]; comment: string; reviewer: string };

function Stars({ value, size, onChange, label }: { value: number; size: number; onChange: (n: number) => void; label: (n: number) => string }) {
  return (
    <span role="radiogroup" className="flex shrink-0 items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={label(n)}
          onClick={() => onChange(n)}
          className={n <= value ? "text-v3-rating-star" : "text-state-gray"}
        >
          <Icon name={n <= value ? "star-filled" : "star"} size={size} />
        </button>
      ))}
    </span>
  );
}

// W2-63 · تقييم الخدمة (754:12337) — يفتح من «قيّم الخدمة» في W2-37c (وروابط «قيّم» في W2-38 وW2-60)
export function RatingModal({ locale, open, onClose, r }: { locale: Locale; open: boolean; onClose: () => void; r: RatingView }) {
  const d = getAccountDict(locale);
  const t = d.rating;
  const router = useRouter();
  const [toast, showToast] = useToast();
  const [scores, setScores] = useState<number[]>(r.sample);
  const [photos, setPhotos] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  const set = (i: number, n: number) => setScores((s) => s.map((v, j) => (j === i ? n : v)));
  const criteria = [...t.criteria, ...r.criteria];
  return (
    <Dialog open={open} onClose={onClose} label={t.title} className="max-w-[640px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // «نشر التقييم» → W2-70 تقييماتي
          router.push(routes.reviews);
        }}
        className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-modal sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-h4 text-deep-charcoal">{t.title}</h2>
            <p className="text-body-s text-state-gray">{r.meta}</p>
          </div>
          <button type="button" aria-label={d.close} onClick={onClose} className="shrink-0 rounded-md border border-cool-gray p-2.5 text-deep-charcoal hover:border-border-strong">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-tile px-5 py-4">
          <div className="flex items-center gap-3">
            <ProviderTile slug={r.providerSlug} alt="" size={44} />
            <div className="flex flex-col">
              <span className="text-caption text-state-gray">{t.overall}</span>
              <span className="text-h5 text-deep-charcoal">{t.labels[scores[0] - 1]}</span>
            </div>
          </div>
          <Stars value={scores[0]} size={30} onChange={(n) => set(0, n)} label={t.star} />
        </div>
        {criteria.map((c, i) => (
          <div key={c} className="flex items-center justify-between gap-3">
            <span className="text-body-m text-deep-charcoal">{c}</span>
            <Stars value={scores[i + 1] ?? 0} size={20} onChange={(n) => set(i + 1, n)} label={t.star} />
          </div>
        ))}
        <textarea
          aria-label={t.commentLabel}
          defaultValue={r.comment}
          rows={2}
          className="w-full resize-y rounded-md border-[1.5px] border-deep-charcoal bg-white px-3.5 py-3 text-body-m text-deep-charcoal outline-none"
        />
        <div className="flex">
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => {
              const n = e.target.files?.length ?? 0;
              setPhotos(n);
              if (n) showToast(d.toasts.photo);
            }}
          />
          <button
            type="button"
            onClick={() => file.current?.click()}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-nature-green px-3.5 py-2 text-label-m text-green-active hover:bg-tint-lime"
          >
            <Icon name="camera" size={16} className="text-nature-green" />
            {photos ? t.photosAdded(photos) : t.addPhotos}
          </button>
        </div>
        <p className="text-caption text-state-gray">{t.publicNote(r.reviewer)}</p>
        <Link href={routes.complaintNew} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-tile px-3.5 py-2.5 hover:bg-bg-muted">
          <span className="text-body-s text-deep-charcoal">{t.complaintQ}</span>
          <span className="text-label-m text-green-active">{t.complaintCta}</span>
        </Link>
        <div className="flex justify-end gap-2.5">
          <button type="submit" className="rounded-md bg-neon-green px-5 py-3 text-label-m text-deep-charcoal hover:bg-bg-brand-hover">
            {t.publish}
          </button>
          <button type="button" onClick={onClose} className="rounded-md border border-cool-gray bg-white px-5 py-3 text-label-m text-deep-charcoal hover:border-border-strong">
            {d.later}
          </button>
        </div>
      </form>
      {toast}
    </Dialog>
  );
}

export type VoucherView = {
  id: string;
  providerSlug: string;
  branchLine: string;
  address: string;
  code: string;
  validUntil: string;
  car: string;
  services: string;
  paid: string;
  paidAt: string;
  warranty: string;
  mapsUrl: string;
  shareLink: string;
};

// W2-37v · القسيمة كاملة (828:181)
export function VoucherModal({
  locale,
  open,
  onClose,
  v,
  onShare,
  onDownload,
  onWallet,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  v: VoucherView;
  onShare: () => void;
  onDownload: () => void;
  onWallet: () => void;
}) {
  const d = getAccountDict(locale);
  const t = d.voucher;
  const rows: [string, string, boolean?][] = [
    [t.rows.id, v.id, true],
    [t.rows.car, v.car],
    [t.rows.services, v.services],
    [t.rows.paid, v.paid],
    [t.rows.paidAt, v.paidAt],
    [t.rows.warranty, v.warranty],
  ];
  const outline = "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] border border-cool-gray bg-white px-3 py-3 text-label-m text-deep-charcoal hover:border-border-strong";
  return (
    <Dialog open={open} onClose={onClose} label={t.label} align="top" className="max-w-[520px]">
      <div className="flex flex-col overflow-hidden rounded-[28px] bg-white shadow-modal">
        <div className="flex flex-col items-start gap-[18px] bg-deep-charcoal px-5 pt-6 pb-[26px] sm:px-7">
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2.5">
              <img src="/brand/logo-inverse.svg" alt="LINKAR" width={96} height={13} className="h-[13px] w-24" />
              <span className="text-label-m text-neon-green">{t.label}</span>
            </span>
            <CloseButton label={d.close} onClick={onClose} tone="glass" />
          </div>
          <div className="flex items-center gap-3">
            <ProviderTile slug={v.providerSlug} alt="" size={48} />
            <span className="flex flex-col gap-0.5">
              <span className="text-label-l text-white">{v.branchLine}</span>
              <span className="text-caption text-white/72">{v.address}</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-neon-green px-3.5 py-1.5 text-label-m text-deep-charcoal">
            <Icon name="clock" size={14} />
            {t.validUntil(v.validUntil)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2.5 px-7 pt-7 pb-[22px]">
          <img src="/figma/account/qr-placeholder.svg" alt="" width={200} height={200} className="size-[200px]" />
          <VoucherCode code={v.code} className="text-[26px] leading-10 text-deep-charcoal" />
          <p className="text-center text-body-s text-state-gray">{t.show}</p>
        </div>
        <div className="mx-7 border-t-[1.5px] border-dashed border-cool-gray" />
        <div className="flex flex-col gap-3 px-5 pt-[22px] pb-[18px] sm:px-7">
          {rows.map(([label, value, ltr]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-[14px] leading-[22px]">
              <span className="shrink-0 font-light text-state-gray">{label}</span>
              <span className="text-end font-medium text-deep-charcoal" dir={ltr ? "ltr" : undefined}>
                {value}
              </span>
            </div>
          ))}
          <p className="flex items-center gap-2 rounded-[14px] bg-neon-green/14 px-3.5 py-2.5 text-caption text-deep-charcoal">
            <Icon name="info" size={14} className="shrink-0" />
            {t.note}
          </p>
        </div>
        <div className="flex gap-2.5 px-5 pt-1.5 pb-3 sm:px-7">
          <button type="button" onClick={onDownload} className={outline}>
            <Icon name="download" size={16} />
            {t.pdf}
          </button>
          <button type="button" onClick={onShare} className={outline}>
            <Icon name="share" size={16} />
            {t.share}
          </button>
          <a
            href={v.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] bg-deep-charcoal px-3 py-3 text-label-m text-neon-green hover:bg-bg-inverse-subtle"
          >
            <Icon name="navigation" size={16} />
            {d.booking.directions}
          </a>
        </div>
        <div className="flex flex-col gap-2.5 px-5 pb-7 sm:flex-row sm:px-7">
          <WalletButton kind="apple" label={d.booking.walletApple} onClick={onWallet} />
          <WalletButton kind="google" label={d.booking.walletGoogle} onClick={onWallet} />
        </div>
      </div>
    </Dialog>
  );
}

// v2 · Wallet button (1073:28) — أسود، r12، أيقونة المحفظة 18
export function WalletButton({ kind, label, onClick }: { kind: "apple" | "google"; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-wallet-black px-3.5 py-2.5 text-label-m text-white hover:opacity-90">
      <img src={`/figma/account/icons/wallet-${kind}.svg`} alt="" width={18} height={18} className="size-[18px] shrink-0" />
      {label}
    </button>
  );
}
