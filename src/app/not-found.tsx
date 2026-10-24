import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getHelpDict } from "@/i18n/dict/help";
import { getNotFoundPage } from "@/lib/server/help";
import { getServices } from "@/lib/server/content";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotFoundSearch } from "@/components/help/NotFoundSearch";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const p = await getNotFoundPage();
  return { title: tx(locale, p, "title") };
}

// W2-404 · الصفحة غير موجودة (760:14089) — خارج مجموعة (site) فالهيدر والفوتر هنا
export default async function NotFound() {
  const [locale, p, services] = await Promise.all([getLocale(), getNotFoundPage(), getServices()]);
  const d = getHelpDict(locale);
  const btn = "inline-flex h-[52px] items-center justify-center rounded-md px-[22px] text-label-l text-deep-charcoal transition-colors";

  return (
    <>
      <Header variant="light" />
      <main className="flex flex-1 flex-col items-center bg-tile px-4 pt-16 pb-20 text-center md:px-20 md:pt-24 md:pb-[120px]">
        <div className="flex w-full max-w-[613px] flex-col items-center gap-4">
          <p className="text-display-xl text-green-active">{p.code}</p>
          <h1 className="text-h3 text-deep-charcoal md:text-h2">{tx(locale, p, "title")}</h1>
          <p className="text-body-l text-text-secondary">{tx(locale, p, "body")}</p>
          <NotFoundSearch
            placeholder={tx(locale, p, "search_placeholder")}
            button={d.search}
            services={services.map((s) => ({ slug: s.slug, names: [s.name_ar, s.name_en] }))}
          />
          <div className="flex flex-wrap justify-center gap-2.5">
            {p.actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`${btn} ${"primary" in a && a.primary ? "h-[50px] bg-neon-green hover:bg-bg-brand-hover" : "border border-border-default bg-white hover:bg-bg-muted"}`}
              >
                {tx(locale, a, "label")}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
