"use client";

import type { RefSlug } from "@/lib/api/reference";
import { Panel, RefNav } from "./bits";
import { AccreditationPage, CategoriesPage, CategoryPage, WarrantyPage } from "./CatalogPages";
import { EditableList } from "./EditableList";
import { RefModals } from "./RefModals";

// CON5-20 · البيانات المرجعية (3114:74880): القائمة الجانبية الداخلية «Ref nav» (250) يمين + لوحة المحتوى (866) — من غير رأس صفحة زي Figma.
// الروابط: /reference/<slug> · /reference/service-categories/<تصنيف> · /reference/accreditation?tab=tiers · النوافذ ?modal=ref-…
export function ReferenceView({ slug, category }: { slug: RefSlug; category?: string }) {
  return (
    <>
      <div className="flex flex-col items-start gap-5 xl:flex-row">
        <RefNav active={slug} />
        <Panel>
          {category ? (
            <CategoryPage slug={category} />
          ) : slug === "service-categories" ? (
            <CategoriesPage />
          ) : slug === "accreditation" ? (
            <AccreditationPage />
          ) : slug === "warranty-certificate" ? (
            <WarrantyPage />
          ) : (
            <EditableList listKey={slug} />
          )}
        </Panel>
      </div>
      <RefModals category={category} />
    </>
  );
}
