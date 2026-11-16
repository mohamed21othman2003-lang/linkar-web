"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { LOCATION_OPEN, LOCATION_STORAGE_KEY, announceLocation } from "./location-events";

export type LocationModalCopy = Record<
  "title" | "body" | "useCurrent" | "or" | "placeholder" | "hint" | "notNow" | "browserNote" | "privacy" | "noResults" | "close",
  string
>;

// الاختيار بيتحفظ في كوكي عشان السيرفر يعرف من الأول يرسم النافذة ولا لأ (لو ظهرت بعد التحميل بتأخّر Speed Index)
function remember(value: string) {
  document.cookie = `${LOCATION_STORAGE_KEY}=${value}; path=/; max-age=31536000; samesite=lax`;
}

// Home · Location permission · first visit (658:2075) — بتظهر مرة واحدة في أول زيارة (للنسختين)،
// وبتتفتح تاني من حقل الموقع في الهيرو أو «تغيير» في «اخترنا لك».
export function LocationModal({
  copy,
  privacyHref,
  currentLabel,
  initialOpen,
  suggestions,
}: {
  copy: LocationModalCopy;
  privacyHref: string;
  currentLabel: string;
  /** اقتراحات المدن/الأحياء اللي بتظهر أثناء الكتابة أو بالضغط على السهم */
  suggestions: string[];
  /** السيرفر بيفتحها من أول رسمة لو مفيش كوكي الاختيار (أول زيارة) */
  initialOpen: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  // من غير همزات/تاء مربوطة/«ال» عشان «رياض» = «الرياض» و«جده» = «جدة»
  const norm = (v: string) => v.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/(^|\s)ال/g, "$1").trim();
  const matches = query.trim() ? suggestions.filter((x) => norm(x).includes(norm(query))) : suggestions;
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // زوار قدام كان اختيارهم محفوظ في localStorage قبل الكوكي — ننقله ونقفل النافذة
    try {
      const old = window.localStorage.getItem(LOCATION_STORAGE_KEY);
      if (old) {
        remember(old);
        window.localStorage.removeItem(LOCATION_STORAGE_KEY);
        // مزامنة لمرة واحدة مع تخزين المتصفح (مش متاح وقت الرسم على السيرفر)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(false);
      }
    } catch {
      // التخزين مقفول (تصفح خاص) — مفيش حاجة ننقلها
    }
    const onOpen = () => setOpen(true);
    window.addEventListener(LOCATION_OPEN, onOpen);
    return () => window.removeEventListener(LOCATION_OPEN, onOpen);
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
    return () => document.removeEventListener("keydown", onKey);
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
    // items-start + my-auto على النافذة: في النص لو كفّت، ولو الشاشة أقصر منها (موبايل صغير/أفقي) بتبدأ من فوق وتتمرر —
    // قبل كده items-center كان بيزق زرار X فوق حافة الشاشة ومايتوصلّوش (تقرير الموبايل #2)
    <div className="fixed inset-0 z-[60] flex animate-dissolve items-start justify-center overflow-y-auto overscroll-contain bg-deep-charcoal/72 p-4" onClick={dismiss}>
      {/* قفل تمرير الصفحة وهي مفتوحة — جوه الـHTML من السيرفر نفسه، بدل ما JS يغيّره بعد التحميل ويعيد حساب layout الصفحة كلها */}
      <style>{"body{overflow:hidden}"}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        ref={dialog}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="my-auto flex w-[520px] max-w-full flex-col items-center gap-[18px] rounded-[28px] bg-white px-5 outline-none focus-visible:shadow-none pt-6 pb-7 text-center shadow-[0_12px_24px_#0000004d] sm:px-9 sm:pt-9 [@media(max-height:720px)]:gap-3 [@media(max-height:720px)]:pt-4 [@media(max-height:720px)]:pb-5"
      >
        {/* X ثابت فوق وهي بتتمرر على الشاشات القصيرة */}
        <div className="sticky top-0 z-10 -mx-2 -mb-2 flex w-[calc(100%+16px)] justify-end bg-white px-2">
          <button type="button" aria-label={copy.close} onClick={dismiss} className="-m-2.5 flex size-11 items-center justify-center rounded-full text-state-gray hover:bg-tile hover:text-deep-charcoal">
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
        <div className="relative w-full">
          <form
            className="flex h-[52px] w-full items-center gap-2.5 rounded-[14px] border border-cool-gray bg-white ps-4 pe-1.5 focus-within:border-nature-green"
            onSubmit={(e) => {
              e.preventDefault();
              const pick = matches[0] ?? query.trim();
              if (pick) choose(pick);
            }}
          >
            <Icon name="map-pin" size={20} className="shrink-0 text-nature-green" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setListOpen(true);
              }}
              onFocus={() => setListOpen(true)}
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              role="combobox"
              aria-expanded={listOpen}
              aria-controls="location-suggestions"
              aria-autocomplete="list"
              // حلقة التركيز العامة كانت بتبان جوه إطار الخانة (إطارين) — الإطار الخارجي بس هو اللي بيتلوّن (#36)
              className="min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none!"
            />
            <button
              type="button"
              aria-label={copy.placeholder}
              aria-expanded={listOpen}
              onClick={() => setListOpen((v) => !v)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-state-gray hover:bg-tile"
            >
              <Icon name="chevron-down" size={20} className={`transition-transform ${listOpen ? "rotate-180" : ""}`} />
            </button>
          </form>
          {listOpen && (
            <ul
              id="location-suggestions"
              role="listbox"
              aria-label={copy.placeholder}
              className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-[14px] border border-cool-gray bg-white p-1.5 text-start shadow-[0_12px_24px_#1429362e]"
            >
              {matches.length ? (
                matches.map((x) => (
                  <li key={x} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => choose(x)}
                      className="flex min-h-11 w-full items-center gap-2.5 rounded-[10px] px-3 text-start text-body-m text-deep-charcoal hover:bg-tile"
                    >
                      <Icon name="map-pin" size={16} className="shrink-0 text-state-gray" />
                      {x}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2.5 text-body-s text-state-gray">{copy.noResults}</li>
              )}
            </ul>
          )}
        </div>
        {/* 202:9017: سطرين في النص (الفيجما بيكسر قبل «الدخول.») */}
        <p className="mx-auto max-w-[420px] text-center text-caption text-state-gray">{copy.hint}</p>
        <button type="button" onClick={dismiss} className="rounded-md px-3 py-1.5 text-label-l text-nature-green hover:bg-tile">
          {copy.notNow}
        </button>
        <p className="text-caption text-state-gray">
          {copy.browserNote} ·{" "}
          <Link href={privacyHref} className="text-nature-green underline underline-offset-2 hover:text-deep-charcoal">
            {copy.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}
