"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { useAxToast } from "./account-extra-dialog";

export type ThreadMsgView = { key: string; from: "you" | "linkar" | "provider"; author: string; time: string; text: string; photos?: number };

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
  c: { decisionTitle: string; accept: string; other: string; placeholder: string; send: string; attach: string; toastPhoto: string; toastAccepted: string; toastReply: string };
}) {
  const [messages, setMessages] = useState(initial);
  const [accepted, setAccepted] = useState(false);
  const [reply, setReply] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const { show, node } = useAxToast();

  const send = () => {
    const text = reply.trim();
    if (!text) return input.current?.focus();
    setMessages((m) => [...m, { key: `r-${Date.now()}`, from: "you", author: you.author, time: you.now, text }]);
    setReply("");
    show(c.toastReply, "message");
  };

  return (
    <>
      <ol className="flex flex-col gap-3">
        {messages.map((m) => (
          <li key={m.key} className={`flex flex-col gap-1.5 rounded-lg px-4 py-3.5 ${bubble[m.from]}`}>
            <p className="flex flex-wrap items-center gap-2.5">
              <span className={`text-label-m ${m.from === "linkar" ? "text-green-active" : "text-deep-charcoal"}`}>{m.author}</span>
              <span className="text-caption text-state-gray">{m.time}</span>
            </p>
            <p className="text-body-s text-deep-charcoal">{m.text}</p>
            {!!m.photos && (
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
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.length && show(c.toastPhoto)} />
          </div>
        </form>
      </div>
      {node}
    </>
  );
}
