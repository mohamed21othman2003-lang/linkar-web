"use client";

import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { RatingModal } from "@/components/booking/RatingModal";

// يفتح W2-39 فوق الصفحة؛ الإغلاق/«لاحقاً» يرجع لمتابعة الحجز (W2-37)، والنشر بعد ثانية
export function RateScreen({ backHref, ...props }: Omit<ComponentProps<typeof RatingModal>, "open" | "onClose" | "onPublished"> & { backHref: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const close = () => {
    setOpen(false);
    router.push(backHref);
  };
  return <RatingModal {...props} open={open} onClose={close} onPublished={() => setTimeout(close, 1200)} />;
}
