import type { Metadata } from "next";
import { EmptyState, PageHead } from "@/components/panel/PageHead";

export const metadata: Metadata = { title: "مقدّمو الخدمة" };

// CON5-07 · مقدّمو الخدمة — مكانها محجوز، الشاشة نفسها في المرحلة الجاية (القسم 7)
export default function ProvidersPage() {
  return (
    <>
      <PageHead title="مقدّمو الخدمة" description="كل المنشآت على لينكار: علامتها التجارية وفروعها وخدماتها وأسعارها وحسابها البنكي." />
      <div className="rounded-16 border border-border bg-white">
        <EmptyState title="قيد التنفيذ" body="قائمة مقدّمي الخدمة هي الخطوة الجاية في بناء اللوحة." />
      </div>
    </>
  );
}
