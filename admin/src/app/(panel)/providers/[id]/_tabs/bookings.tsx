"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · الحجوزات (3114-38407 · الزهراء 3114-38697 · الحمراء 3114-38919 · المحمدية 3114-39164)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function BookingsTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «الحجوزات» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
