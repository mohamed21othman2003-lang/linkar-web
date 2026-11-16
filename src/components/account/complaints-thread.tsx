"use client";

/* eslint-disable @next/next/no-img-element -- صور العميل (blob:/روابط المرفقات) مش بتعدّي على next/image */
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { AxCloseButton, AxDialog, useAxToast } from "./account-extra-dialog";

// photos = عدد صور من غير ملفات (بيانات الفيجما: مربعات كاميرا) · images = روابط الصور الفعلية (الـAPI أو اللي العميل أرفقها)
export type ThreadMsgView = { key: string; from: "you" | "linkar" | "provider"; author: string; time: string; text: string; photos?: number; images?: string[] };

const bubble = {
  you: "bg-tint-lime",
  linkar: "bg-tile",
  provider: "border border-cool-gray bg-white",
} as const;

// «Thread» + «Decision» في الشكوى المفتوحة (CM-3340): قبول الحل (P-10i)، أفضّل حلاً آخر، والرد على الفريق (P-10j)
export function ComplaintsThread({
  messages: initial,
  you,
  c,
}: {
  messages: ThreadMsgView[];
  you: { author: string; now: string };
  c: {
    decisionTitle: string;
    accept: string;
    other: string;
    placeholder: string;
    send: string;
    attach: string;
    toastPhoto: string;
    toastAccepted: string;
    toastReply: string;
    // P-14 عارض الصور
    viewer: { title: string; close: string; prev: string; next: string; remove: string; open: string };
  };
}) {
  const [messages, setMessages] = useState(initial);
  const [accepted, setAccepted] = useState(false);
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState<string[]>([]); // صور مرفقة لسه ما اتبعتتش
  const [viewer, setViewer] = useState<{ images: string[]; index: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  const { show, node } = useAxToast();

  // روابط blob: بتتمسح لما الصفحة تتقفل
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const send = () => {
    const text = reply.trim();
    if (!text && !pending.length) return input.current?.focus();
    setMessages((m) => [...m, { key: `r-${Date.now()}`, from: "you", author: you.author, time: you.now, text, images: pending.length ? pending : undefined }]);
    setReply("");
    setPending([]);
    show(c.toastReply, "message");
  };

  return (
    <>
      <ol className="flex flex-col gap-3">
        {messages.map((m) => (
          <li key={m.key} className={`flex flex-col gap-1.5 rounded-lg px-4 py-3.5 ${bubble[m.from]}`}>
            <p className="flex flex-wrap items-center gap-2.5">
              <span className={`text-label-m ${m.from === "linkar" ? "text-nature-green" : "text-deep-charcoal"}`}>{m.author}</span>
              <span className="text-caption text-state-gray">{m.time}</span>
            </p>
            {m.text && <p className="text-body-s text-deep-charcoal">{m.text}</p>}
            {/* صور فعلية: مصغّرات بتفتح عارض الصور (P-14) */}
            {!!m.images?.length && (
              <div className="flex flex-wrap gap-2">
                {m.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`${c.viewer.open} ${i + 1}`}
                    onClick={() => setViewer({ images: m.images!, index: i })}
                    className="size-16 overflow-hidden rounded-md border border-cool-gray bg-white hover:border-deep-charcoal"
                  >
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {!m.images?.length && !!m.photos && (
              <div className="flex gap-2">
                {Array.from({ length: m.photos }, (_, i) => (
                  <span key={i} className="flex size-16 items-center justify-center rounded-md bg-cool-gray/50">
                    <Icon name="camera" size={20} className="text-state-gray" />
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 rounded-[20px] border border-neon-green/70 bg-tint-lime p-[18px]">
        {!accepted && (
          <>
            <p className="text-label-l text-deep-charcoal">{c.decisionTitle}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => (setAccepted(true), show(c.toastAccepted))}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md bg-neon-green px-[18px] py-2 text-start text-label-m text-deep-charcoal hover:bg-bg-brand-hover"
              >
                <Icon name="check" size={16} className="shrink-0" />
                {c.accept}
              </button>
              <button
                type="button"
                // SCROLL_TO «Reply» · SCROLL_ANIMATE 400ms EASE_OUT ثم التركيز على خانة الرد
                onClick={() => {
                  input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => input.current?.focus({ preventScroll: true }), 400);
                }}
                className="inline-flex h-control-md items-center rounded-md border border-cool-gray bg-white px-[18px] text-label-m text-deep-charcoal hover:bg-tile"
              >
                {c.other}
              </button>
            </div>
          </>
        )}
        {pending.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pending.map((src, i) => (
              <span key={src} className="relative size-14 overflow-hidden rounded-md border border-cool-gray bg-white">
                <button type="button" aria-label={`${c.viewer.open} ${i + 1}`} onClick={() => setViewer({ images: pending, index: i })} className="size-full">
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
                <button
                  type="button"
                  aria-label={c.viewer.remove}
                  onClick={() => setPending((list) => list.filter((x) => x !== src))}
                  className="absolute end-0.5 top-0.5 flex size-6 items-center justify-center rounded-full bg-deep-charcoal/80 text-white"
                >
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => (e.preventDefault(), send())}
          className="flex items-center justify-between gap-2 rounded-md border border-cool-gray bg-white py-3 ps-3.5 pe-3 focus-within:border-deep-charcoal"
        >
          <input
            ref={input}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            className="min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray focus-visible:shadow-none"
          />
          <div className="flex shrink-0 items-center gap-2.5">
            <button type="submit" className="h-[34px] rounded-md max-md:h-10 bg-deep-charcoal px-3.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle">
              {c.send}
            </button>
            <button type="button" aria-label={c.attach} onClick={() => file.current?.click()} className="flex size-8 items-center max-md:size-10 justify-center rounded-md text-state-gray hover:bg-tile">
              <Icon name="camera" size={18} />
            </button>
            <input
              ref={file}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
                if (!files.length) return;
                const added = files.map((f) => URL.createObjectURL(f));
                urls.current.push(...added);
                setPending((list) => [...list, ...added]);
                show(c.toastPhoto);
                e.target.value = "";
              }}
            />
          </div>
        </form>
      </div>
      {viewer && <ImageViewer images={viewer.images} start={viewer.index} copy={c.viewer} onClose={() => setViewer(null)} />}
      {node}
    </>
  );
}

// P-14 · عارض الصور: الصورة كبيرة + السابقة/التالية (والأسهم في الكيبورد) + العدّاد
function ImageViewer({ images, start, copy, onClose }: { images: string[]; start: number; copy: { title: string; close: string; prev: string; next: string }; onClose: () => void }) {
  const id = useId();
  const [i, setI] = useState(start);
  const many = images.length > 1;
  const go = (d: number) => setI((x) => (x + d + images.length) % images.length);
  // الأسهم في الكيبورد: «التالية» ناحية الشمال في العربي
  useEffect(() => {
    if (images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") setI((x) => (x + (rtl ? 1 : -1) + images.length) % images.length);
      if (e.key === "ArrowRight") setI((x) => (x + (rtl ? -1 : 1) + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [images.length]);
  return (
    <AxDialog open onClose={onClose} labelledBy={id} width={720} className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="text-h5 text-deep-charcoal">
          {copy.title} {many && <span className="text-body-s text-state-gray">({i + 1} / {images.length})</span>}
        </h2>
        <AxCloseButton onClick={onClose} label={copy.close} />
      </div>
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-deep-charcoal">
        <img src={images[i]} alt="" className="max-h-[70dvh] w-auto max-w-full object-contain" />
        {many && (
          <>
            <button type="button" aria-label={copy.prev} onClick={() => go(-1)} className="absolute start-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-deep-charcoal hover:bg-white">
              <Icon name="chevron-right" size={18} flip />
            </button>
            <button type="button" aria-label={copy.next} onClick={() => go(1)} className="absolute end-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-deep-charcoal hover:bg-white">
              <Icon name="chevron-left" size={18} flip />
            </button>
          </>
        )}
      </div>
    </AxDialog>
  );
}
