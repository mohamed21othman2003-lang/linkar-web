"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { Toast, useToast } from "./Toast";

// «هل أفادك المقال؟» (W2-97b) — نعم/لا، وبعد الاختيار توست P-10h
export function ArticleFeedback({ question, yes, no, thanks }: { question: string; yes: string; no: string; thanks: string }) {
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const toast = useToast();
  const pick = (v: "yes" | "no") => {
    if (vote) return;
    setVote(v);
    toast.show(thanks);
  };
  const btn = (v: "yes" | "no") =>
    `inline-flex h-10 items-center gap-1.5 rounded-md border px-[18px] text-label-m transition-colors disabled:cursor-default ${
      vote === v ? "border-deep-charcoal bg-tint-lime text-deep-charcoal" : "border-border-default bg-white text-deep-charcoal hover:border-border-strong"
    }`;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <p className="text-label-l text-deep-charcoal">{question}</p>
      <button type="button" aria-pressed={vote === "yes"} disabled={!!vote} onClick={() => pick("yes")} className={btn("yes")}>
        <Icon name="check" size={16} className="text-deep-charcoal" />
        {yes}
      </button>
      <button type="button" aria-pressed={vote === "no"} disabled={!!vote} onClick={() => pick("no")} className={btn("no")}>
        {no}
      </button>
      <Toast message={toast.message} icon="check" />
    </div>
  );
}
