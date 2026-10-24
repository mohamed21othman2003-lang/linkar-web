import { ViewTransition } from "react";
import { Footer } from "@/components/layout/Footer";
import { Fabs } from "@/components/layout/Fabs";

// الرئيسية: الهيدر الشفاف جوه الهيرو نفسه (V2-01/V2-02)، والفوتر والأزرار العائمة هنا
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* DISSOLVE 200ms بين الصفحات (experimental.viewTransition) */}
      <ViewTransition>
        <main className="flex-1">{children}</main>
      </ViewTransition>
      <Footer />
      <Fabs />
    </>
  );
}
