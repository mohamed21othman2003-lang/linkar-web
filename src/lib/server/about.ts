// طبقة بيانات «عن لينكار» (W2-95 · W2-96) — بيانات تجريبية دلوقتي؛ في المرحلة 3 الدوال دي بس هي اللي تتغيّر.
import { aboutPage } from "@/lib/data/about/about";
import { contactPage } from "@/lib/data/about/contact";

export async function getAboutPage() {
  return aboutPage;
}

export async function getContactPage() {
  return contactPage;
}
