import { Suspense } from "react";
import { Sidebar } from "@/components/panel/Sidebar";
import { Topbar } from "@/components/panel/Topbar";

// هيكل اللوحة (القسم 4): القائمة الجانبية 240 يمين + عمود المحتوى 1200 (الشريط العلوي + المحتوى بحشو 32).
// التصميم لسطح المكتب 1440 (القسم 3.4)؛ تحت 1280 القائمة الجانبية بتبقى درج، والمحتوى بيترص، والجداول العريضة بتمرير أفقي داخلي.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-1">
      <Suspense>
        <Sidebar />
      </Suspense>
      <div className="flex min-h-screen min-w-0 flex-col xl:ms-60">
        <Topbar />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 min-w-0 flex-col gap-5 px-4 pt-5 pb-12 md:px-6 md:pt-7 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
