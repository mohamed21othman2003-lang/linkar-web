import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { REF_NAV, REF_SLUGS, type RefSlug } from "@/lib/api/reference";
import { ReferenceView } from "../_components/ReferenceView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = REF_NAV.flatMap((g) => g.items).find((i) => i.slug === slug);
  return { title: item ? `${item.label} · البيانات المرجعية` : "البيانات المرجعية" };
}

// CON5-20 · البيانات المرجعية (3114:74880) — صفحة لكل قائمة + القائمة الجانبية الداخلية
export default async function ReferenceSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(REF_SLUGS as string[]).includes(slug)) notFound();
  return (
    <Suspense>
      <ReferenceView slug={slug as RefSlug} />
    </Suspense>
  );
}
