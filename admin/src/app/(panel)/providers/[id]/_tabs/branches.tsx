"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · الفروع (3114-50649 · معتمدة 3312-215819)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function BranchesTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «الفروع» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
