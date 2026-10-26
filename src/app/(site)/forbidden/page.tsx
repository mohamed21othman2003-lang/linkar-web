import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getStatusPage } from "@/lib/server/help";
import { StatusPage } from "@/components/status/StatusPage";
import { statusView } from "@/components/status/statusView";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, s] = await Promise.all([getLocale(), getStatusPage("forbidden")]);
  return { title: tx(locale, s, "title"), robots: { index: false } };
}

// W2-403 — قالب صفحات الحالة المشترك (StatusPage)
export default async function Page() {
  const [locale, s] = await Promise.all([getLocale(), getStatusPage("forbidden")]);
  return <StatusPage {...statusView(locale, s)} />;
}
