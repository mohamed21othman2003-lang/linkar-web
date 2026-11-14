import { redirect } from "next/navigation";

// /partners → أول قسم في «الشركاء» (الوكالات CON5-09) — المسوّقون في /partners/marketers
export default function PartnersPage() {
  redirect("/partners/agencies");
}
