import { Suspense } from "react";
import { Sidebar } from "@/components/panel/Sidebar";
import { Topbar } from "@/components/panel/Topbar";

// هيكل اللوحة (القسم 4): القائمة الجانبية 240 يمين + عمود المحتوى 1200 (الشريط العلوي + المحتوى بحشو 32).
// اللوحة لسطح المكتب: قابلة للاستخدام من 1280 وأكبر، والجداول العريضة بتمرير أفقي داخلي (القسم 3.4).
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-w-[1280px] bg-surface-1">
      <Suspense>
        <Sidebar />
      </Suspense>
      <div className="ms-60 flex min-h-screen flex-col">
        <Topbar />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-5 px-8 pt-7 pb-12">{children}</main>
      </div>
    </div>
  );
}
