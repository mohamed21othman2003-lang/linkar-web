import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { HomeContent } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { FigmaIcon } from "../bits";

const icons = ["brand-search-neon", "brand-car-neon", "brand-calendar-neon", "feature-payment-neon"];

// V2-02 · How it works (619:2045) — كحلي: 4 خطوات بأيقونات ليموني + شريط الضمانات
export function HowItWorksGuest({ locale, content }: { locale: Locale; content: HomeContent }) {
  const h = content.howItWorks;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  return (
    <section className="bg-deep-charcoal py-16 lg:pt-24 lg:pb-[88px]">
      <Container className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <p className="text-overline text-neon-green">{s(h.overline)}</p>
          <h2 className="text-[26px]/[40px] font-bold text-white md:text-h2">{s(h.title)}</h2>
        </div>
        <ol className="grid w-full grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {h.steps.map((st, i) => (
            <li key={i} className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-3 text-center">
              <span className="flex items-center gap-2.5">
                <FigmaIcon name={icons[i]} size={64} />
                <span className="flex size-7 items-center justify-center rounded-full border border-neon-green text-label-m text-neon-green">{i + 1}</span>
              </span>
              <h3 className="text-h5 text-white">{s(st.title)}</h3>
              <p className="max-w-[240px] text-body-s text-white/70">{s(st.body)}</p>
            </li>
          ))}
        </ol>
        <ul className="flex flex-col items-center gap-4 rounded-3xl border border-white/12 bg-white/6 px-7 py-[18px] sm:flex-row sm:gap-10 sm:rounded-full">
          {h.guarantees.map((g) => (
            <li key={g.text_ar} className="flex items-center gap-2 text-label-m text-white">
              <FigmaIcon name="brand-shield-outline" size={20} />
              {s(g)}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
