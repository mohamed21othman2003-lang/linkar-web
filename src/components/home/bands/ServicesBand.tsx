import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider, Service } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { homeHref } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { MobileLink, RText, SectionHead } from "../bits";
import { HomeServiceCard } from "../HomeServiceCard";

// V2-01 · Band · Services (85:30008 · تابلت 85:34385 · موبايل 85:33716) — 6 كروت غامقة (أُضيفت «تغيير اللون») فوق شبكة خطوط باهتة
// ديسكتوب: صف واحد 6×206 · تابلت: جريد 3×2 (238) · موبايل: شريط أفقي (148)
export function ServicesBand({ locale, content, items }: { locale: Locale; content: HomeContent; items: { service: Service; providers: Provider[] }[] }) {
  const b = content.servicesBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="relative overflow-hidden bg-white py-9 md:py-16 xl:pt-[104px] xl:pb-24">
      {/* Grid pattern — خطوط #152935/5 بتختفي لفوق (ديسكتوب بس) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[91px] hidden h-[760px] [mask-image:linear-gradient(to_top,#000,transparent)] xl:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(21 41 53 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(21 41 53 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "37px 0",
        }}
      />
      <Container className="relative flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:gap-10">
        <SectionHead
          overline={s(b.overline)}
          title={s(b.title)}
          description={b.description && <RText d={s(b.description)} t={s(b.description_t)} m={s(b.description_m)} />}
          link={b.link && { label: s(b.link), href: homeHref(b.link.href_key) }}
          className="[&>a]:md:max-xl:hidden"
        />
        <div className="-me-5 flex snap-x gap-2.5 overflow-x-auto pe-5 [scrollbar-width:none] md:m-0 md:grid md:grid-cols-[repeat(3,auto)] md:justify-center md:gap-5 md:overflow-visible md:p-0 xl:-mx-1 xl:flex xl:justify-center xl:gap-[10.4px] xl:max-[1439px]:[zoom:0.865] [&::-webkit-scrollbar]:hidden">
          {items.map(({ service, providers }) => (
            // تابلت 834: 238 بالظبط؛ من 768 لـ833 أصغر شوية عشان التلاتة يكفّوا (min-[…] بتتطلع قبل xl فـxl بيكسب)
            <div key={service.slug} className="w-[148px] shrink-0 snap-start min-[768px]:w-[216px] min-[834px]:w-[238px] xl:w-[206px] xl:p-[4.33px]">
              <div className="w-[197.35px] [zoom:0.75] min-[768px]:[zoom:1.0945] min-[834px]:[zoom:1.206] xl:[zoom:1]">
                <HomeServiceCard locale={locale} service={service} providers={providers} />
              </div>
            </div>
          ))}
        </div>
        {b.link && <MobileLink label={s(b.link)} href={homeHref(b.link.href_key)} />}
      </Container>
    </section>
  );
}
