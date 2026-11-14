"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · المستخدمون (3114-54076 · الفروع 3312-193276 / 193658 / 194040)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function UsersTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «المستخدمون» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
