import { notFound } from "next/navigation";

// أي رابط غلط جوه اللوحة (/admin/…) → صفحة «غير موجودة» العربية جوه هيكل اللوحة ((panel)/not-found.tsx)
// بدل صفحة Next الإنجليزية السودا. الصفحات الثابتة (login · api …) بتكسب على المسار ده.
export default function Missing() {
  notFound();
}
