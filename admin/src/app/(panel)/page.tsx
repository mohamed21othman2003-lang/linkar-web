import { redirect } from "next/navigation";
import { HOME_PATH } from "@/lib/session";

// الصفحة الرئيسية (نظرة عامة CON5-01) مش في المرحلة الأولى → مقدّمو الخدمة
export default function Root() {
  redirect(HOME_PATH);
}
