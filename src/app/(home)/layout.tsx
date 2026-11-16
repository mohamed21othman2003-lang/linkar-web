import { Suspense } from "react";
import { PendingRating } from "@/components/booking/PendingRating";
import { Footer } from "@/components/layout/Footer";
import { Fabs } from "@/components/layout/Fabs";

// الرئيسية: الهيدر الشفاف جوه الهيرو نفسه (V2-01)، والفوتر والأزرار العائمة هنا
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* من غير <ViewTransition> هنا: جوه الرئيسية كان بيشغّل View Transition للصفحة كلها مع ظهور كل قسم (Suspense) وقت
          التحميل الأول — layout مرتين ونطّة على الديسكتوب. الـDISSOLVE بين الصفحات لسه شغال من ViewTransition بتاع (site)
          (الانتقال من/إلى الرئيسية بيعدّي عليه) */}
      <main className="flex-1">{children}</main>
      {/* الفوتر آخر الصفحة: بيتجهّز في مهمة لوحده (Suspense) — ظهوره مش بيزق أي حاجة فوقه */}
      <Suspense fallback={null}>
        <Footer home />
      </Suspense>
      {/* «قيّم الخدمة» بيفتح لوحده بعد اكتمال الحجز (W2-39) — للعميل اللي عنده حجز مكتمل ماتقيّمش بس */}
      <Suspense fallback={null}>
        <PendingRating />
      </Suspense>
      <Suspense fallback={null}>
        <Fabs />
      </Suspense>
    </>
  );
}
