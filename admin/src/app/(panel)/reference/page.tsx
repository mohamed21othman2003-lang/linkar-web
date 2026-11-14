import { redirect } from "next/navigation";

// البيانات المرجعية → أول صفحة في القائمة الجانبية (تصنيفات الخدمات)
export default function ReferencePage() {
  redirect("/reference/service-categories");
}
