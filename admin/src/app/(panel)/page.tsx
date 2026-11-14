import { redirect } from "next/navigation";
import { HOME_PATH } from "@/lib/session";

// الرئيسية = «نظرة عامة» (CON5-01) على /overview
export default function Root() {
  redirect(HOME_PATH);
}
