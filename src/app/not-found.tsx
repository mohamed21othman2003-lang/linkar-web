import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getNotFoundPage } from "@/lib/server/help";
import { StatusPage } from "@/components/status/StatusPage";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getNotFoundPage();
  return { title: tx(locale, p, "title") };
}

// احتياطي بس: الـ404 الحقيقية (بالهيدر والفوتر والبحث) في (site)/not-found.tsx — الروابط الغلط بتوصلها عن طريق
// (site)/[...missing]. الملف ده خفيف عن قصد لأن Next بيحطه جوه بيانات كل صفحة في الموقع (مرتين في الرئيسية).
export default async function NotFound() {
  const [locale, p] = await Promise.all([getLocale(), getNotFoundPage()]);
  return (
    <main className="flex flex-1 flex-col">
      <StatusPage
        code={p.code}
        title={tx(locale, p, "title")}
        body={tx(locale, p, "body")}
        actions={p.actions.map((a) => ({ label: tx(locale, a, "label"), href: a.href, primary: "primary" in a && a.primary }))}
      />
    </main>
  );
}
