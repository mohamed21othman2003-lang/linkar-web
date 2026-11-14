import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReferenceView } from "../../_components/ReferenceView";

export const metadata: Metadata = { title: "تصنيف · البيانات المرجعية" };

// CON5-20 · البيانات المرجعية · تصنيف · <الخدمة> (نانو سيراميك 3114:77859 · PPF 78315 · التظليل 78783 · التلميع 79154 · الغسيل 79489 · تغيير اللون 79828)
export default async function ReferenceCategoryPage({ params }: { params: Promise<{ slug: string; sub: string }> }) {
  const { slug, sub } = await params;
  if (slug !== "service-categories") notFound();
  return (
    <Suspense>
      <ReferenceView slug="service-categories" category={sub} />
    </Suspense>
  );
}
