"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { LOCATION_OPEN, LOCATION_STORAGE_KEY, announceLocation } from "./location-events";

export type LocationModalCopy = Record<
  "title" | "body" | "useCurrent" | "or" | "placeholder" | "hint" | "notNow" | "browserNote" | "privacy" | "close",
  string
>;

function remember(value: string) {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, value);
  } catch {
    // التخزين ممكن يكون مقفول (وضع التصفح الخاص) — النافذة هتظهر تاني بس مش مشكلة
  }
}

// Home · Location permission · first visit (658:2075) — بتظهر مرة واحدة في أول زيارة (للنسختين)،
// وبتتفتح تاني من حقل الموقع في الهيرو أو «تغيير» في «اخترنا لك».
export function LocationModal({ copy, privacyHref, currentLabel }: { copy: LocationModalCopy; privacyHref: string; currentLabel: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen: string | null = "1";
    try {
      seen = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    } catch {
      seen = "1";
    }
    const id = seen ? 0 : window.setTimeout(() => setOpen(true), 400);
    const onOpen = () => setOpen(true);
    window.addEventListener(LOCATION_OPEN, onOpen);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(LOCATION_OPEN, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    // مانركّزش على النافذة نفسها: حلقة التركيز العامة (:focus-visible) بتظهر كإطار أخضر
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      remember("dismissed");
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function dismiss() {
    remember("dismissed");
    setOpen(false);
  }

  function choose(label: string) {
    remember("set");
    announceLocation(label);
    setOpen(false);
  }

  function pickCurrent() {
    if (!("geolocation" in navigator)) return choose(currentLabel);
    // مفيش reverse geocoding لسه — بنعرض الموقع التجريبي بتاع الفيجما لما المتصفح يوافق
    navigator.geolocation.getCurrentPosition(
      () => choose(currentLabel),
      () => dismiss(),
      { timeout: 10000 },
    );
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex animate-dissolve items-center justify-center overflow-y-auto bg-deep-charcoal/72 p-4" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        ref={dialog}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="flex w-[520px] max-w-full flex-col items-center gap-[18px] rounded-[28px] bg-white px-5 outline-none focus-visible:shadow-none pt-6 pb-7 text-center shadow-[0_12px_24px_#0000004d] sm:px-9 sm:pt-9"
      >
        <div className="flex w-full justify-end">
          <button type="button" aria-label={copy.close} onClick={dismiss} className="text-state-gray hover:text-deep-charcoal">
            <Icon name="x" size={22} />
          </button>
        </div>
        <span className="flex size-16 items-center justify-center rounded-[18px] bg-neon-green text-deep-charcoal">
          <Icon name="map-pin" size={34} />
        </span>
        <h2 id="location-modal-title" className="text-[22px]/[34px] font-bold text-deep-charcoal sm:text-h3">
          {copy.title}
        </h2>
        <p className="text-body-m text-state-gray">{copy.body}</p>
        <button
          type="button"
          onClick={pickCurrent}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-neon-green text-label-l text-deep-charcoal hover:bg-bg-brand-hover"
        >
          <Icon name="navigation" size={20} />
          {copy.useCurrent}
        </button>
        <div className="flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-cool-gray" />
          <span className="text-caption text-state-gray">{copy.or}</span>
          <span className="h-px flex-1 bg-cool-gray" />
        </div>
        <form
          className="flex h-[52px] w-full items-center gap-2.5 rounded-[14px] border border-cool-gray bg-white px-4 focus-within:border-nature-green"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) choose(query.trim());
          }}
        >
          <Icon name="map-pin" size={20} className="text-nature-green" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            className="min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none"
          />
          <Icon name="chevron-down" size={20} className="text-state-gray" />
        </form>
        <p className="text-caption text-state-gray">{copy.hint}</p>
        <button type="button" onClick={dismiss} className="rounded-md px-3 py-1.5 text-label-l text-green-active hover:bg-tile">
          {copy.notNow}
        </button>
        <p className="text-caption text-state-gray">
          {copy.browserNote} ·{" "}
          <Link href={privacyHref} className="hover:text-deep-charcoal hover:underline">
            {copy.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}
