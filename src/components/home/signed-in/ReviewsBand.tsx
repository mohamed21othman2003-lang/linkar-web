import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { HomeContent } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { SectionHead } from "../bits";
import { ReviewsCarousel } from "./ReviewsCarousel";

// V2-01 · Band · Reviews (557:286) — علامة اقتباس ليموني كبيرة في الخلفية + كروت التقييم
export function ReviewsBand({ locale, content }: { locale: Locale; content: HomeContent }) {
  const r = content.reviewsBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const d = getHomeDict(locale);
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:pt-[104px] lg:pb-[104px]">
      <span
        aria-hidden
        className="pointer-events-none absolute end-10 -top-[140px] hidden text-[520px] leading-[986px] font-bold text-neon-green opacity-35 select-none lg:block"
      >
        ”
      </span>
      <Container className="relative">
        <ReviewsCarousel
          rtl={locale === "ar"}
          head={<SectionHead overline={s(r.head.overline)} title={s(r.head.title)} description={s(r.head.description)} />}
          summary={s(r.summary)}
          prevLabel={d.previous}
          nextLabel={d.next}
          slideLabel={d.slide}
          items={r.items.map((it) => ({
            rating: `${it.rating.toFixed(1)} ${s(r.of5)}`,
            text: s(it.text),
            name: s(it.name),
            initial: s(it.initial),
            service: s(it.service),
            car: s(it.car),
            date: s(it.date),
          }))}
        />
      </Container>
    </section>
  );
}
