"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · الجودة والتقييم (3114-51034 · ردود بانتظار الاعتماد 3302-138749)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function QualityTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «الجودة والتقييم» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
