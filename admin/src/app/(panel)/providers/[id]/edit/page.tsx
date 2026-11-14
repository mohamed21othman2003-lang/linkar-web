import type { Metadata } from "next";
import { Suspense } from "react";
import { EditCompany } from "../_components/EditCompany";

export const metadata: Metadata = { title: "تعديل بيانات المنشأة" };

// CON5-07E1 · تعديل بيانات المنشأة · جونسون (3304-158088) — القسم 9
export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <EditCompany id={id} />
    </Suspense>
  );
}
