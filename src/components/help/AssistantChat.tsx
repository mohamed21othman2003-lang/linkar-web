"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export type AssistantCopy = {
  title: string;
  status: string;
  greeting: string;
  prompt: string;
  quick: { key: string; label: string; href: string | null }[];
  placeholder: string;
  send: string;
  note: string;
  pendingReply: string;
  close: string;
};

type Msg = { from: "bot" | "user"; text: string };

// P-21 · مساعد لينكار (956:21) — لوحة شات 380×518 فوق الأزرار العائمة (من بداية الصفحة).
// الأسئلة السريعة روابط (أو onTeam لفتح P-22)، والكتابة الحرة بترد برد مؤقت لحد ما يتربط المساعد الحقيقي.
export function AssistantChat({ open, onClose, onTeam, copy }: { open: boolean; onClose: () => void; onTeam?: () => void; copy: AssistantCopy }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);
  if (!open) return null;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: "user", text: v }, { from: "bot", text: copy.pendingReply }]);
    setText("");
  };

  const chip = "flex h-10 items-center rounded-full border border-deep-charcoal bg-white px-3.5 text-label-m text-deep-charcoal hover:bg-tint-lime";

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label={copy.title}
      className="fixed inset-x-4 bottom-4 z-50 flex animate-dissolve outline-none focus-visible:shadow-popup max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-popup sm:inset-x-auto sm:start-6 sm:bottom-6 sm:w-[380px]"
    >
      <div className="flex items-center justify-between gap-3 bg-deep-charcoal px-[18px] py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex rounded-full bg-neon-green p-2.5">
            <Icon name="message" size={18} className="text-deep-charcoal" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-label-l text-white">{copy.title}</p>
            <p className="flex items-center gap-1.5 text-caption text-white/72">
              <span aria-hidden className="size-2 rounded-full bg-neon-green" />
              {copy.status}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={copy.close} className="flex size-[30px] items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20">
          <Icon name="x" size={14} />
        </button>
      </div>

      <div ref={listRef} className="flex h-[340px] min-h-0 flex-col items-start gap-2.5 overflow-y-auto bg-tile p-[18px] [scrollbar-width:thin] [&>*]:shrink-0">
        <p className="max-w-[298px] rounded-lg rounded-ss-xs bg-white px-3.5 py-3 text-body-s text-deep-charcoal">{copy.greeting}</p>
        <p className="text-caption text-text-secondary">{copy.prompt}</p>
        {copy.quick.map((q) =>
          q.href ? (
            <Link key={q.key} href={q.href} onClick={onClose} className={chip}>
              {q.label}
            </Link>
          ) : (
            <button key={q.key} type="button" onClick={() => (onTeam ? onTeam() : undefined)} className={chip}>
              {q.label}
            </button>
          ),
        )}
        {msgs.map((m, i) => (
          <p
            key={i}
            className={`max-w-[298px] rounded-lg px-3.5 py-3 text-body-s ${
              m.from === "user" ? "self-end rounded-se-xs bg-deep-charcoal text-white" : "rounded-ss-xs bg-white text-deep-charcoal"
            }`}
          >
            {m.text}
          </p>
        ))}
      </div>

      <form onSubmit={send} className="flex items-center gap-2.5 bg-white px-3.5 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={copy.placeholder}
          aria-label={copy.placeholder}
          className="h-9 min-w-0 flex-1 rounded-md bg-transparent px-1 text-body-s text-deep-charcoal outline-none placeholder:text-state-gray"
        />
        <button type="submit" aria-label={copy.send} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-charcoal text-neon-green hover:bg-bg-inverse-subtle">
          <Icon name="chevron-left" size={16} flip />
        </button>
      </form>
      <p className="px-[18px] pb-3.5 text-caption text-text-secondary">{copy.note}</p>
    </div>
  );
}
