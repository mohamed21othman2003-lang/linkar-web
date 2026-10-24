import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile, SectionHead } from "../bits";
import { FigmaToggle } from "../motion";

// V2-02 · Features (618:1795) — «لماذا لينكار»: كارت الذكاء الاصطناعي + 4 مميزات + 4 مميزات مختصرة
export function FeaturesBand({ locale, content, providers }: { locale: Locale; content: HomeContent; providers: Provider[] }) {
  const f = content.featuresBand;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const ex = providers.find((p) => p.slug === f.ai.example_provider);
  return (
    <section className="bg-cool-gray/35 py-16 lg:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHead tone="guest" textClass="max-w-[720px]" overline={s(f.head.overline)} title={s(f.head.title)} description={s(f.head.description)} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[628fr_302fr_302fr]">
          {/* Feature · AI */}
          <div className="relative flex min-h-[440px] flex-col items-start gap-3.5 overflow-hidden rounded-2xl p-6 md:col-span-2 lg:col-span-1 lg:p-8">
            <Image src="/figma/home/ai-card-bg.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 628px" className="object-cover" />
            <div className="absolute inset-0 bg-linear-to-b from-deep-charcoal/35 via-deep-charcoal/75 to-deep-charcoal/92" />
            <span className="relative flex h-10 items-center gap-2 rounded-full bg-neon-green ps-1.5 pe-3 text-label-m text-deep-charcoal">
              <FigmaIcon name="feature-ai-dark" size={28} />
              {s(f.ai.label)}
            </span>
            <h3 className="relative text-h3 text-white">{s(f.ai.title)}</h3>
            <p className="relative max-w-[440px] text-body-m text-white/80">{s(f.ai.body)}</p>
            <div className="flex-1" />
            {/* Example — ⚠ نصوص فاتحة على خلفية بيضا 92% زي الفيجما بالظبط */}
            <div className="relative flex min-h-[130px] w-full items-center gap-3.5 rounded-[18px] border border-white/20 bg-white/92 px-4 py-3.5">
              {ex && <LogoTile slug={ex.slug} alt={tx(locale, ex, "name")} size={52} />}
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-white/70">{s(f.ai.example_label)}</span>
                <span className="text-label-l text-white">{ex ? tx(locale, ex, "name") : ""}</span>
                <span className="text-caption text-neon-green">{s(f.ai.example_reason)}</span>
              </div>
              <FigmaToggle label={s(f.ai.label)} />
            </div>
          </div>
          {f.columns.map((col, i) => (
            <div key={i} className="flex flex-col gap-6">
              {col.map((c) => (
                <div key={c.title.text_ar} className="flex min-h-[208px] flex-1 flex-col items-start justify-between gap-2.5 rounded-2xl bg-white p-6">
                  <FigmaIcon name={c.icon} size={48} />
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-h5 text-deep-charcoal">{s(c.title)}</h3>
                    <p className="text-caption text-state-gray">{s(c.body)}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {f.inline.map((c) => (
            <li key={c.title.text_ar} className="flex min-h-[116px] items-center gap-3.5 rounded-xl bg-white p-5">
              <FigmaIcon name={c.icon} size={44} />
              <div className="flex flex-col gap-1">
                <p className={`text-[16px] leading-[26px] text-deep-charcoal ${c.light ? "font-light" : "font-medium"}`}>{s(c.title)}</p>
                <p className="text-caption text-state-gray">{s(c.body)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
