import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { HOME_PATH } from "@/lib/session";

export const metadata: Metadata = { title: "الصفحة غير موجودة" };

// احتياطي لأي notFound() برّه هيكل اللوحة (صفحات الدخول) — الروابط الغلط جوه اللوحة بتروح لـ(panel)/not-found.tsx
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-1 px-6 text-center">
      <p className="num text-13 font-medium text-muted">404</p>
      <h1 className="text-24 font-bold text-ink">الصفحة غير موجودة</h1>
      <p className="max-w-md text-13 text-muted">الرابط غير صحيح أو الصفحة اتنقلت لمكان تاني.</p>
      <ButtonLink href={HOME_PATH}>العودة للرئيسية</ButtonLink>
    </main>
  );
}
