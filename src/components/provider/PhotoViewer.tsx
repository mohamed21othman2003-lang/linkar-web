"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Locale } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getProviderDict } from "@/i18n/dict/provider";
import { Icon } from "@/components/icons/Icon";
import { Modal } from "./Modal";

// P-14 · عارض الصور («v2 · Photo viewer (P-14)» 930:78): صورة كبيرة + أسهم + عدّاد «1 / 11» + 3 مصغّرات + «+8»
export function PhotoViewer({
  locale,
  open,
  onClose,
  title,
  photos,
  index,
  onIndex,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  title: string;
  photos: string[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const t = getProviderDict(locale);
  const c = getCommon(locale);
  const n = photos.length;
  const go = (d: number) => onIndex((index + d + n) % n);
  useEffect(() => {
    if (!open) return;
    // الأسهم بتمشي مع اتجاه القراءة: في العربي السهم اليمين = السابق
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onIndex((index + (rtl ? 1 : -1) + n) % n);
      if (e.key === "ArrowRight") onIndex((index + (rtl ? -1 : 1) + n) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, n, onIndex]);
  // 3 مصغّرات حوالين الصورة الحالية + مربع «+الباقي»
  const start = Math.min(Math.max(0, index - 1), Math.max(0, n - 3));
  const thumbs = photos.slice(start, start + 3).map((src, k) => ({ src, i: start + k }));
  const rest = n - 3;
  return (
    <Modal open={open} onClose={onClose} label={title} width={1040} bare>
      <div className="flex flex-col gap-[18px] rounded-2xl bg-[#0d1a21] px-4 pt-[22px] pb-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-label-l text-white">{title}</p>
          <button type="button" aria-label={c.close} onClick={onClose} className="flex shrink-0 rounded-full bg-white/12 p-2.5 text-white hover:bg-white/20">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="relative aspect-[992/540] max-h-[540px] w-full overflow-hidden rounded-lg">
          {/* CHANGE_TO Photo=n · DISSOLVE 200ms EASE_OUT */}
          <Image key={index} src={photos[index]} alt={t.photoAlt(title, index + 1)} fill sizes="(min-width: 1040px) 992px, 100vw" className="animate-dissolve object-cover" />
          <span className="absolute start-4 top-4 rounded-full bg-deep-charcoal/70 px-3 py-1.5 text-label-m text-white" dir="ltr">
            {t.photoOf(index + 1, n)}
          </span>
          <button
            type="button"
            aria-label={t.prevPhoto}
            onClick={() => go(-1)}
            className="absolute start-4 top-1/2 flex -translate-y-1/2 rounded-full bg-white/90 p-3 text-deep-charcoal hover:bg-white"
          >
            <Icon name="chevron-right" size={20} flip />
          </button>
          <button
            type="button"
            aria-label={t.nextPhoto}
            onClick={() => go(1)}
            className="absolute end-4 top-1/2 flex -translate-y-1/2 rounded-full bg-white/90 p-3 text-deep-charcoal hover:bg-white"
          >
            <Icon name="chevron-left" size={20} flip />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          {thumbs.map(({ src, i }) => (
            <button
              key={i}
              type="button"
              aria-label={t.photoAlt(title, i + 1)}
              aria-current={i === index}
              onClick={() => onIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-[10px] ${i === index ? "border-2 border-neon-green" : "opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="192px" className="object-cover" />
            </button>
          ))}
          {rest > 0 && (
            <button
              type="button"
              onClick={() => onIndex(Math.min(n - 1, start + 3))}
              className="flex h-16 w-24 shrink-0 items-center justify-center rounded-[10px] bg-white/12 text-label-l text-white hover:bg-white/20"
            >
              {t.morePhotosShort(rest)}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
