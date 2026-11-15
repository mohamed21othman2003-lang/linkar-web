import { notFound } from "next/navigation";

// أي رابط مالوش صفحة بيقع هنا (أقل أولوية من كل المسارات التانية) → not-found بتاع (site) بالهيدر والفوتر
export default function Missing() {
  notFound();
}
