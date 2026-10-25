import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "../bits";

// V2-01 · Band · Services (557:3) — كروت الخدمات الغامقة الخمسة فوق شبكة خطوط باهتة
export function ServicesBand({ locale, content, items }: { locale: Locale; content: HomeContent; items: { service: Service; providers: Provider[] }[] }) {
  const b = content.servicesBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:pt-[104px] lg:pb-24">
      {/* Grid pattern — خطوط #152935/5 بتختفي لفوق */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[91px] h-[760px] [mask-image:linear-gradient(to_top,#000,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(21 41 53 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(21 41 53 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "37px 0",
        }}
      />
      <Container className="relative flex flex-col gap-10">
        <SectionHead
          overline={s(b.overline)}
          title={s(b.title)}
          description={b.description && s(b.description)}
          descBold
          link={b.link && { label: s(b.link), href: homeHref(b.link.href_key) }}
        />
        {/* 5 أعمدة من xl بس — محتوى الكارت متثبّت بمقاسات الفيجما فمحتاج عرض 226+ (عمودين من sm وتلاتة من lg) */}
        <div className="grid grid-cols-1 gap-[9.4px] sm:grid-cols-2 lg:grid-cols-3 xl:-mx-1 xl:grid-cols-5">
          {items.map(({ service, providers }) => (
            <div key={service.slug} className="p-[5.25px]">
              <ServiceCard locale={locale} service={service} providers={providers} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
