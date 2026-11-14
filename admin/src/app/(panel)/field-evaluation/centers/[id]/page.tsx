import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticalView } from "../../_components/PracticalView";

export const metadata: Metadata = { title: "التقييم العملي" };

// CON5-17P · التقييم العملي · مركز درع للحماية (3114:62593)
export default async function PracticalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <PracticalView id={id} />
    </Suspense>
  );
}
