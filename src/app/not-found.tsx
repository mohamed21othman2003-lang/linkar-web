import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getHelpDict } from "@/i18n/dict/help";
import { getNotFoundPage } from "@/lib/server/help";
import { getServices } from "@/lib/server/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundSearch } from "@/components/help/NotFoundSearch";
import { StatusPage } from "@/components/status/StatusPage";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getNotFoundPage();
  return { title: tx(locale, p, "title") };
}

// W2-404 · الصفحة غير موجودة (85:47357) — خارج مجموعة (site) فالهيدر والفوتر هنا. نفس قالب صفحات الحالة (StatusPage) + البحث
export default async function NotFound() {
  const [locale, p, services] = await Promise.all([getLocale(), getNotFoundPage(), getServices()]);
  const d = getHelpDict(locale);

  return (
    <>
      <Header variant="light" />
      <main className="flex flex-1 flex-col">
        <StatusPage
          code={p.code}
          title={tx(locale, p, "title")}
          body={tx(locale, p, "body")}
          actions={p.actions.map((a) => ({ label: tx(locale, a, "label"), href: a.href, primary: "primary" in a && a.primary }))}
        >
          <NotFoundSearch
            placeholder={tx(locale, p, "search_placeholder")}
            button={d.search}
            services={services.map((s) => ({ slug: s.slug, names: [s.name_ar, s.name_en] }))}
          />
        </StatusPage>
      </main>
      <Footer />
    </>
  );
}
