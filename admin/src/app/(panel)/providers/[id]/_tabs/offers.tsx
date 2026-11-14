"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · العروض والباقات (3127-3263) · الباقات (3312-213706) — جوه تبويب «الخدمات والأسعار» من شرائح «عروض» و«باقات»
// (?tab=services&view=offers|packages). نوافذ «عرض جديد» (3260-207383) و«باقة جديدة» (3260-207985) بتتفتح بـ?modal=offer-new|package-new.
// مكان مؤقت — يبنيه وكيل العروض والباقات. الملف ده بتاعه بالكامل؛ تبويب الخدمات (./services.tsx) بيمرّر له شريط الشرائح `chips`
// عشان يحطه في شريطه العلوي زي Figma (أزرار «باقة جديدة» M ثانوي + «عرض جديد» M مميز على الشمال).
export default function OffersTab({ profile, kind, chips }: ProfileTabProps & { kind: "offers" | "packages"; chips: ReactNode }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2.5">{chips}</div>
      <EmptyState title="قيد التنفيذ" body={`${kind === "offers" ? "عروض" : "باقات"} ${profile.provider.name} خطوة جاية في بناء اللوحة.`} />
    </>
  );
}

/** نوافذ «عرض جديد» و«باقة جديدة» — ?modal=offer-new | package-new (بتتركّب مرة في ملف المزوّد) */
export function OffersOverlays({ profile }: { profile: ProfileTabProps["profile"] }) {
  void profile;
  return null;
}
