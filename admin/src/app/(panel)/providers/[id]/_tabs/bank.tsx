"use client";

import { EmptyState } from "@/components/panel/PageHead";
import type { ProfileTabProps } from "./types";

// CON5-07a · الحساب البنكي (3260-204545)
// مكان مؤقت — يبنيه وكيل التبويب. الملف ده بتاعه بالكامل: الرأس والتبويبات ونوافذ المنشأة في ../_components/ProfileView.tsx.
export default function BankTab({ profile }: ProfileTabProps) {
  return <EmptyState title="قيد التنفيذ" body={`تبويب «الحساب البنكي» لـ${profile.provider.name} هو خطوة جاية في بناء اللوحة.`} />;
}
