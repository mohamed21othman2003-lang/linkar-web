"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import type { RatingModal as RatingModalType } from "./RatingModal";

// النافذة (ومعاها مكتبة motion ~45KB) بتتحمّل بس لما تفتح — قبل كده كانت بتنزل مع كل صفحة لكل زائر
const RatingModal = dynamic(() => import("./RatingModal").then((m) => m.RatingModal), { ssr: false });

const seenKey = (id: string) => `linkar_rate_prompted_${id}`;

// W2-39 بيفتح لوحده مرة واحدة لكل حجز مكتمل لسه ماتقيّمش — لو العميل قفله أو قيّم، مابيرجعش تاني
// (ولسه يقدر يقيّم من «حجوزاتي» أو متابعة الحجز). مابيفتحش فوق صفحات الحجز والدفع ولا صفحة التقييم نفسها.
export function PendingRatingPrompt({
  bookingId,
  ...props
}: Omit<ComponentProps<typeof RatingModalType>, "open" | "onClose" | "onPublished"> & { bookingId: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // اتفتحت مرة → نسيبها مركّبة عشان أنيميشن القفل يكمّل
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/booking") || pathname.startsWith("/login")) return;
    let seen = false;
    try {
      seen = localStorage.getItem(seenKey(bookingId)) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      setMounted(true);
      setOpen(true);
    }, 1200);
    return () => clearTimeout(t);
  }, [pathname, bookingId]);

  const done = () => {
    try {
      localStorage.setItem(seenKey(bookingId), "1");
    } catch {}
    setOpen(false);
  };

  if (!mounted) return null;
  return <RatingModal {...props} open={open} onClose={done} onPublished={() => setTimeout(done, 1200)} />;
}
