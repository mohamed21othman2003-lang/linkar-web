"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import type { ProviderBranch } from "@/lib/data/provider-details";
import { routes } from "@/lib/routes";
import { Icon, type UiGlyph } from "@/components/icons/Icon";
import { LogoTile } from "./bits";
import { Modal, ModalHead, RadioDot, useToast } from "./Modal";

const optionRow =
  "flex w-full items-center gap-3 rounded-[14px] border border-cool-gray px-3.5 py-3 text-start hover:border-border-strong";

function OptionRow({ icon, title, sub, href, external }: { icon: ReactNode; title: string; sub: string; href: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={optionRow}>
      <span className="flex shrink-0 items-center rounded-md bg-neon-green/16 p-2.5 text-deep-charcoal">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-label-l text-deep-charcoal">{title}</span>
        <span className="text-caption text-state-gray">{sub}</span>
      </span>
      <Icon name="chevron-left" size={16} flip className="shrink-0 text-state-gray" />
    </a>
  );
}

// P-07 · تواصل مع الفرع
export function ContactBranchModal({
  locale,
  open,
  onClose,
  providerName,
  logo,
  branch,
  city,
  bookingNo,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  providerName: string;
  logo: string;
  branch: ProviderBranch | null;
  city: string;
  bookingNo?: string;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  if (!branch) return null;
  return (
    <Modal open={open} onClose={onClose} label={t.contactTitle}>
      <ModalHead title={t.contactTitle} onClose={onClose} closeLabel={c.close} />
      <div className="flex items-center gap-3 rounded-lg bg-tile px-3.5 py-3">
        <LogoTile src={logo} alt={providerName} size={48} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-label-l text-deep-charcoal">{t.contactWith(providerName, tx(locale, branch, "name"))}</p>
          <p className="text-caption text-state-gray">{`${tx(locale, branch, "address")}${locale === "en" ? ", " : "، "}${city}`}</p>
        </div>
      </div>
      <OptionRow icon={<Icon name="phone" size={18} />} title={t.call} sub={t.callSub} href={`tel:${branch.phone}`} />
      <OptionRow icon={<Icon name="message" size={18} />} title={t.whatsapp} sub={t.whatsappSub} href={`https://wa.me/${branch.whatsapp}`} external />
      <OptionRow
        icon={<Icon name="navigation" size={18} />}
        title={t.directions}
        sub={t.directionsSub}
        href={`https://maps.google.com/?q=${encodeURIComponent(branch.maps_query)}`}
        external
      />
      {bookingNo && (
        <div className="flex items-center gap-2 rounded-md bg-neon-green/14 px-3.5 py-2.5">
          <Icon name="info" size={14} className="shrink-0" />
          <p className="text-caption text-deep-charcoal">{t.bookingRefNote(bookingNo)}</p>
        </div>
      )}
    </Modal>
  );
}

// P-08b · مشاركة صفحة مقدّم الخدمة (+ P-10a «تم نسخ الرابط»)
export function ShareModal({
  locale,
  open,
  onClose,
  shortName,
  path,
  slug,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  shortName: string;
  path: string; // مسار الصفحة اللي هتتشارك
  slug: string;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const toast = useToast();
  const display = `linkarksa.com/p/${slug}`;
  const url = () => (typeof window !== "undefined" ? window.location.origin + path : path);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
    } catch {
      /* المتصفح رفض النسخ — بنعرض الرسالة برضه */
    }
    toast({ text: t.linkCopied, icon: "check" });
    onClose();
  };
  const text = `${t.shareTitle(shortName)} — `;
  const options: { key: string; label: string; icon: UiGlyph; href?: string; onClick?: () => void }[] = [
    { key: "copy", label: t.copyLink, icon: "copy", onClick: copy },
    { key: "wa", label: t.whatsapp, icon: "message", href: `https://wa.me/?text=${encodeURIComponent(text + url())}` },
    { key: "sms", label: t.sms, icon: "phone", href: `sms:?&body=${encodeURIComponent(text + url())}` },
    { key: "mail", label: t.email, icon: "mail", href: `mailto:?subject=${encodeURIComponent(t.shareTitle(shortName))}&body=${encodeURIComponent(url())}` },
  ];
  return (
    <Modal open={open} onClose={onClose} label={t.shareTitle(shortName)}>
      <ModalHead title={t.shareTitle(shortName)} onClose={onClose} closeLabel={c.close} />
      <p className="text-body-s text-state-gray">{t.shareSub}</p>
      <div className="flex items-center gap-2.5 rounded-md bg-tile py-2 ps-3.5 pe-2">
        <p className="min-w-0 flex-1 truncate text-end text-body-m text-deep-charcoal">
          <bdi>{display}</bdi>
        </p>
        <button type="button" onClick={copy} className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-deep-charcoal px-3.5 py-[9px] text-label-m text-neon-green">
          <Icon name="copy" size={14} />
          {t.copy}
        </button>
      </div>
      <div className="flex items-start justify-between gap-2">
        {options.map((o) => {
          const inner = (
            <>
              <span className="flex size-[52px] items-center justify-center rounded-full bg-neon-green/16 text-deep-charcoal">
                <Icon name={o.icon} size={20} />
              </span>
              <span className="text-caption whitespace-nowrap text-deep-charcoal">{o.label}</span>
            </>
          );
          return o.href ? (
            <a key={o.key} href={o.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
              {inner}
            </a>
          ) : (
            <button key={o.key} type="button" onClick={o.onClick} className="flex flex-col items-center gap-2">
              {inner}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// P-19 · اختر الفرع (فروع مقدّم الخدمة الأقرب)
export function ChooseBranchModal({
  locale,
  open,
  onClose,
  providerName,
  city,
  branches,
  value,
  onConfirm,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  providerName: string;
  city: string;
  branches: ProviderBranch[];
  value?: string;
  onConfirm: (id: string) => void;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const sorted = [...branches].sort((a, b) => a.distance_km - b.distance_km);
  const [sel, setSel] = useState(value ?? sorted[0]?.id);
  return (
    <Modal open={open} onClose={onClose} label={t.chooseBranch}>
      <ModalHead title={t.chooseBranch} onClose={onClose} closeLabel={c.close} />
      <p className="text-body-s text-state-gray">{t.chooseBranchSub(providerName, city)}</p>
      <div role="radiogroup" aria-label={t.chooseBranch} className="flex flex-col gap-4">
        {sorted.map((b, i) => {
          const on = b.id === sel;
          return (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSel(b.id)}
              className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-start ${
                on ? "border-[1.5px] border-neon-green bg-neon-green/8" : "border border-cool-gray bg-white"
              }`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-label-l text-deep-charcoal">{tx(locale, b, "name")}</span>
                <span className="text-caption text-state-gray">
                  {[tx(locale, b, "district"), t.kmAway(b.distance_km.toFixed(1)), i === 0 ? t.nearestToYou : null].filter(Boolean).join(" · ")}
                </span>
              </span>
              <RadioDot on={on} />
            </button>
          );
        })}
      </div>
      <div className="pt-1.5">
        <button
          type="button"
          onClick={() => sel && onConfirm(sel)}
          className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-neon-green text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
        >
          {t.confirm}
        </button>
      </div>
    </Modal>
  );
}

export type DemoCar = { id: string; name: string; meta: string; size: "sedan" | "suv" | "large"; is_default: boolean };

// P-15 · اختر سيارتك (من W2-32 «تغيير»)
export function ChooseCarModal({
  locale,
  open,
  onClose,
  cars,
  value,
  onConfirm,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  cars: DemoCar[];
  value: string;
  onConfirm: (id: string) => void;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const [sel, setSel] = useState(value);
  return (
    <Modal open={open} onClose={onClose} label={t.chooseCar}>
      <ModalHead title={t.chooseCar} onClose={onClose} closeLabel={c.close} />
      <p className="text-body-s text-state-gray">{t.chooseCarSub}</p>
      <div role="radiogroup" aria-label={t.chooseCar} className="flex flex-col gap-4">
        {cars.map((car) => {
          const on = car.id === sel;
          return (
            <button
              key={car.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSel(car.id)}
              className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-start ${
                on ? "border-[1.5px] border-neon-green bg-neon-green/8" : "border border-cool-gray bg-white"
              }`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-label-l text-deep-charcoal">{car.name}</span>
                <span className="text-caption text-state-gray">{car.meta}</span>
              </span>
              <RadioDot on={on} />
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2.5 pt-1.5">
        <Link
          href={routes.cars}
          className="flex h-[52px] items-center justify-center rounded-[14px] border border-cool-gray bg-white text-label-l text-deep-charcoal hover:border-border-strong"
        >
          {t.addCar}
        </Link>
        <button
          type="button"
          onClick={() => onConfirm(sel)}
          className="flex h-[52px] items-center justify-center rounded-[14px] bg-neon-green text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
        >
          {t.confirm}
        </button>
      </div>
    </Modal>
  );
}
