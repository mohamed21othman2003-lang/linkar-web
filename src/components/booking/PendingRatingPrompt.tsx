"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import type { RatingModal as RatingModalType } from "./RatingModal";

// النافذة (ومعاها مكتبة motion ~45KB) بتتحمّل بس لما تفتح — قبل كده كانت بتنزل مع كل صفحة لكل زائر
const RatingModal = dynamic(() => import("./RatingModal").then((m) => m.RatingModal), { ssr: false });

// حدث فتح التقييم: كارت «كيف كانت تجربتك…؟» في حسابي بيبعته، والـprompt (لو الحجز مستني تقييم) بيفتح النافذة مكانه
const OPEN_EVENT = "linkar:rate-open";

// W2-39 · تقييم الخدمة — مابقاش بيفتح لوحده بعد الدخول (الفيجما: التقييم من متابعة الحجز W2-39 / W2-63).
// بيفتح بس لما العميل يضغط «قيّم» في كارت حسابي (RateLink تحت)، ولسه يقدر يقيّم من «حجوزاتي» أو متابعة الحجز.
export function PendingRatingPrompt({
  bookingId,
  ...props
}: Omit<ComponentProps<typeof RatingModalType>, "open" | "onClose" | "onPublished"> & { bookingId: string }) {
  const [open, setOpen] = useState(false);
  // اتفتحت مرة → نسيبها مركّبة عشان أنيميشن القفل يكمّل
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== bookingId) return;
      e.preventDefault(); // = «اتفتحت هنا» ← الرابط مايروحش لصفحة حجوزاتي
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [bookingId]);

  if (!mounted) return null;
  return <RatingModal {...props} open={open} onClose={() => setOpen(false)} onPublished={() => setTimeout(() => setOpen(false), 1200)} />;
}

// رابط «قيّم» في كارت حسابي: يفتح النافذة في نفس الصفحة لو الحجز مستني تقييم، وإلا يكمّل للرابط العادي (تقييم فوق «حجوزاتي»)
export function RateLink({ bookingId, href, className, children }: { bookingId: string; href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const handled = !window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: bookingId, cancelable: true }));
    if (!handled) router.push(href);
  };
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
