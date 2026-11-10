import { Suspense, ViewTransition } from "react";
import { PendingRating } from "@/components/booking/PendingRating";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// الصفحات الداخلية: الهيدر الأبيض + الفوتر الغامق (زي كل فريمات W2 في الفيجما)
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="light" />
      {/* DISSOLVE 200ms بين الصفحات (experimental.viewTransition) */}
      <ViewTransition>
        <main className="flex-1">{children}</main>
      </ViewTransition>
      <Footer />
      {/* «قيّم الخدمة» بيفتح لوحده بعد اكتمال الحجز (W2-39) — للعميل اللي عنده حجز مكتمل ماتقيّمش بس */}
      <Suspense fallback={null}>
        <PendingRating />
      </Suspense>
    </>
  );
}
