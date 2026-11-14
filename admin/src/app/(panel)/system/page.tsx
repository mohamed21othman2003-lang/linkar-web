import { redirect } from "next/navigation";

// «الإعدادات» → السياسات (CON5-21)
export default function SystemPage() {
  redirect("/system/policies");
}
