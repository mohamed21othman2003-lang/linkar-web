"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · التحليلات (3114-24787)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function AnalyticsTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «التحليلات» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
