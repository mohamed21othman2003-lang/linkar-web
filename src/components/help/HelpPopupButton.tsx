"use client";

import { useCallback, useState, type ReactNode } from "react";
import { AssistantChat, type AssistantCopy } from "./AssistantChat";
import { WhatsAppDialog, type WhatsAppCopy } from "./WhatsAppDialog";

export type HelpPopupsCopy = { assistant: AssistantCopy; whatsapp: WhatsAppCopy };

// زر يفتح P-21 (مساعد لينكار) أو P-22 (واتساب). الاستخدام (من سيرفر كومبوننت):
//   const popups = await getHelpPopupsCopy();            // @/lib/server/help
//   <HelpPopupButton popup="assistant" copy={popups} aria-label="…" className="…">…</HelpPopupButton>
// «تحدّث مع فريق لينكار» جوه P-21 بيقفل الشات ويفتح P-22.
export function HelpPopupButton({
  popup,
  copy,
  className,
  children,
  "aria-label": ariaLabel,
  title,
}: {
  popup: "assistant" | "whatsapp";
  copy: HelpPopupsCopy;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  title?: string;
}) {
  const [open, setOpen] = useState<"assistant" | "whatsapp" | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const team = useCallback(() => setOpen("whatsapp"), []);
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open === popup}
        aria-label={ariaLabel}
        title={title}
        onClick={() => setOpen((o) => (o === popup ? null : popup))}
        className={className}
      >
        {children}
      </button>
      <AssistantChat open={open === "assistant"} onClose={close} onTeam={team} copy={copy.assistant} />
      <WhatsAppDialog open={open === "whatsapp"} onClose={close} copy={copy.whatsapp} />
    </>
  );
}
