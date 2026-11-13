import type { Metadata } from "next";
import { EmptyState, PageHead } from "@/components/panel/PageHead";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "ملف المزوّد" };

// CON5-07a · ملف المزوّد (3114-48595 …) — القسم 9، يبنيه الوكيل التالي. مكان مؤقت عشان روابط الدرج والإجراءات ما توديش لصفحة 404.
export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHead title="ملف المزوّد" crumbs={[{ label: "مقدّمو الخدمة", href: "/providers" }, { label: id.toUpperCase() }]} />
      <div className="rounded-16 border border-border bg-white">
        <EmptyState title="قيد التنفيذ" body="ملف مقدّم الخدمة هو الخطوة الجاية في بناء اللوحة." action={<ButtonLink href="/providers" variant="secondary" size="S">العودة لمقدّمي الخدمة</ButtonLink>} />
      </div>
    </>
  );
}
