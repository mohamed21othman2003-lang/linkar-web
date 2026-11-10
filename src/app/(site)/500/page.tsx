import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getStatusPage } from "@/lib/server/help";
import { StatusPage } from "@/components/status/StatusPage";
import { statusView } from "@/components/status/statusView";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, s] = await Promise.all([getLocale(), getStatusPage("server-error")]);
  return { title: tx(locale, s, "title"), robots: { index: false } };
}

// W2-500 · خطأ في الخادم (85:47978) — نفس شاشة error.tsx بس على رابط ثابت /500 (بالهيدر والفوتر).
// من غيرها Next كان بيعرض صفحته الإنجليزي «This page couldn’t load» لو حد فتح /500 مباشرة.
// السيرفر بيرجّع كود 500 تلقائياً لأي زيارة مباشرة للمسار ده. «إعادة المحاولة» هنا بتعيد تحميل الصفحة.
export default async function Page() {
  const [locale, s] = await Promise.all([getLocale(), getStatusPage("server-error")]);
  return <StatusPage {...statusView(locale, s)} />;
}
