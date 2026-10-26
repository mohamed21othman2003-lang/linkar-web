import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { DemoUser, Provider } from "@/lib/data/types";
import { formatNumber } from "@/lib/format";
import type { HomeContent } from "@/lib/server/home";
import { PickCard } from "@/components/cards/PickCard";
import { Container } from "@/components/ui/Container";
import { FigmaIcon } from "../bits";
import { LocationPill } from "../LocationPill";
import { Rail } from "../Rail";

type Pick = { provider: Provider; reason: string; note: string; variant: "light" | "ai"; tone: "neon" | "green" };

// V2-01 · Band · For you (AI) (85:29829 · تابلت 85:34284 · موبايل 85:33666) — «اخترناها لك حسب موقعك وتجاربك»
// «لأنك حجزت…» للعميل العائد بعد الدخول بس؛ الزائر والعميل الجديد يشوفوا مكانها ترشيحات حسب موقعهم
// (ملاحظة 85:30647): أقرب مقدّمي خدمة لموقعه من بيانات المقدّمين الحقيقية (المسافة والتقييم).
export function ForYouBand({
  locale,
  content,
  providers,
  user,
  id,
}: {
  locale: Locale;
  content: HomeContent;
  providers: Provider[];
  user: DemoUser | null;
  id: string;
}) {
  const f = content.forYou;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const returning = !!user && !user.is_new;
  const find = (slug: string) => providers.find((x) => x.slug === slug);

  let picks: Pick[];
  if (returning) {
    picks = f.picks.flatMap((p) => {
      const provider = find(p.provider);
      if (!provider) return [];
      return [{ provider, reason: s(p.reason), note: s(p.note), variant: p.kind === "ai" ? "ai" : "light", tone: p.kind === "location" ? "green" : "neon" } as Pick];
    });
  } else {
    // الكارت الغامق (ترشيح الذكاء الاصطناعي) زي ما هو؛ الباقي = الأقرب للموقع
    const ai = f.picks.find((p) => p.kind === "ai")!;
    const aiProvider = find(ai.provider);
    const near = providers.filter((p) => p.slug !== ai.provider).sort((a, b) => a.distance_km - b.distance_km);
    const nearest = near[0];
    const topRated = near.slice(1).filter((p) => p.distance_km <= 2).sort((a, b) => b.rating - a.rating)[0] ?? near[1];
    const next = near.find((p) => p !== nearest && p !== topRated)!;
    const note = s(f.picks[0].note);
    picks = [
      { provider: nearest, reason: s(f.location_reasons[0]), note, variant: "light", tone: "green" },
      { provider: topRated, reason: s(f.location_reasons[1]), note, variant: "light", tone: "green" },
      { provider: next, reason: s(f.location_note).replace("{km}", formatNumber(next.distance_km)), note, variant: "light", tone: "green" },
      ...(aiProvider ? [{ provider: aiProvider, reason: s(ai.reason), note: s(ai.note), variant: "ai", tone: "neon" } as Pick] : []),
    ];
  }

  return (
    <section id={id} className="scroll-mt-20 bg-white py-9 md:py-16 xl:bg-surface-soft xl:pt-[132px] xl:pb-24">
      <Container className="flex flex-col gap-[18px] max-md:px-5 md:gap-7 xl:gap-8">
        <div className="flex flex-col gap-[18px] md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex flex-col gap-1.5 md:gap-2 xl:gap-2.5">
            <p className="flex items-center gap-2 text-[13px]/[20px] font-medium text-green-dark md:text-overline xl:text-green-active">
              <FigmaIcon name="feature-ai-dark" size={28} className="max-xl:hidden" />
              {s(f.overline)}
            </p>
            <h2 className="text-[22px]/[34px] font-bold text-deep-charcoal md:text-[28px]/[42px] xl:text-h2 xl:whitespace-nowrap">
              {s(returning ? f.title : f.title_guest)}
            </h2>
          </div>
          <LocationPill className="self-start md:self-auto" near={s(f.near)} location={s(content.demoLocation)} change={s(f.change)} />
        </div>
        <div className="flex flex-col gap-[18px] md:gap-7 xl:gap-3.5">
          <Rail
            reverse
            trackClass="-me-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pe-5 md:-me-10 md:gap-4 md:pe-10 xl:m-0 xl:grid xl:grid-cols-4 xl:gap-[26.1px] xl:overflow-visible xl:p-0"
            itemClass="w-[258px] shrink-0 snap-start md:w-[300px] xl:w-auto"
          >
            {picks.map((p) => (
              // موبايل: نفس الكارت متصغّر (258×305 = 300×355 × 0.86)
              <div key={p.provider.slug} className="max-md:[zoom:0.86] max-md:w-[300px]">
                <PickCard locale={locale} provider={p.provider} variant={p.variant} reason={p.reason} reasonTone={p.tone} note={p.note} />
              </div>
            ))}
          </Rail>
          <p className="text-[12px]/[20px] font-light text-state-gray md:w-[291px] md:text-[13px]/[22px] xl:w-[300px] xl:self-end xl:text-caption">{s(f.hint)}</p>
        </div>
      </Container>
    </section>
  );
}
