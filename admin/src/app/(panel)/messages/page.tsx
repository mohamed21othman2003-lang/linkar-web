import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "./_components/MessagesView";

export const metadata: Metadata = { title: "الرسائل" };

// CON5-19 · الرسائل (3114:1328) — Figma «v5 · 19 · الرسائل» 3114:1327
export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  );
}
