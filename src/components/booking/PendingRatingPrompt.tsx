"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentProps } from "react";
import { RatingModal } from "./RatingModal";

const seenKey = (id: string) => `linkar_rate_prompted_${id}`;

// W2-39 بيفتح لوحده مرة واحدة لكل حجز مكتمل لسه ماتقيّمش — لو العميل قفله أو قيّم، مابيرجعش تاني
// (ولسه يقدر يقيّم من «حجوزاتي» أو متابعة الحجز). مابيفتحش فوق صفحات الحجز والدفع ولا صفحة التقييم نفسها.
export function PendingRatingPrompt({
  bookingId,
  ...props
}: Omit<ComponentProps<typeof RatingModal>, "open" | "onClose" | "onPublished"> & { bookingId: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/booking") || pathname.startsWith("/login")) return;
    let seen = false;
    try {
      seen = localStorage.getItem(seenKey(bookingId)) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [pathname, bookingId]);

  const done = () => {
    try {
      localStorage.setItem(seenKey(bookingId), "1");
    } catch {}
    setOpen(false);
  };

  return <RatingModal {...props} open={open} onClose={done} onPublished={() => setTimeout(done, 1200)} />;
}
