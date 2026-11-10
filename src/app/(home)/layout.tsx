import { Suspense, ViewTransition } from "react";
import { PendingRating } from "@/components/booking/PendingRating";
import { Footer } from "@/components/layout/Footer";
import { Fabs } from "@/components/layout/Fabs";

// الرئيسية: الهيدر الشفاف جوه الهيرو نفسه (V2-01)، والفوتر والأزرار العائمة هنا
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* DISSOLVE 200ms بين الصفحات (experimental.viewTransition) */}
      <ViewTransition>
        <main className="flex-1">{children}</main>
      </ViewTransition>
      <Footer home />
      {/* «قيّم الخدمة» بيفتح لوحده بعد اكتمال الحجز (W2-39) — للعميل اللي عنده حجز مكتمل ماتقيّمش بس */}
      <Suspense fallback={null}>
        <PendingRating />
      </Suspense>
      <Fabs />
    </>
  );
}
