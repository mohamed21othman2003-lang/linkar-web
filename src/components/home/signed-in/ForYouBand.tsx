import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import type { DemoUser, Provider } from "@/lib/data/types";
import type { HomeContent } from "@/lib/server/home";
import { PickCard } from "@/components/cards/PickCard";
import { Container } from "@/components/ui/Container";
import { FigmaIcon } from "../bits";
import { LocationPill } from "../LocationPill";

// V2-01 · Band · For you (AI) (597:2899) — «اخترنا لك حسب موقعك وتجاربك»
// بطاقات «لأنك حجزت…» للعميل العائد فقط؛ العميل الجديد يرى مكانها ترشيحاً حسب موقعه (ملاحظة 585:1601)
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
  user: DemoUser;
  id: string;
}) {
  const f = content.forYou;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const returning = !user.is_new;
  return (
    <section id={id} className="scroll-mt-20 bg-cool-gray/35 pt-16 pb-16 lg:pt-[132px] lg:pb-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-overline text-green-active">
              <FigmaIcon name="feature-ai-dark" size={28} />
              {s(f.overline)}
            </p>
            <h2 className="text-[26px]/[40px] font-bold text-deep-charcoal md:text-h2">{s(f.title)}</h2>
          </div>
          <div className="flex flex-col items-start gap-2">
            <LocationPill near={s(f.near)} location={s(content.demoLocation)} change={s(f.change)} />
            <p className="text-caption text-state-gray">{s(f.hint)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {f.picks.map((p) => {
            const provider = providers.find((x) => x.slug === p.provider);
            if (!provider) return null;
            const byLocation = p.kind === "location" || (p.kind === "returning" && !returning);
            return (
              <PickCard
                key={p.provider}
                locale={locale}
                provider={provider}
                variant={p.kind === "ai" ? "ai" : "light"}
                reason={byLocation && p.kind === "returning" ? s(f.location_reason) : s(p.reason)}
                reasonTone={byLocation ? "green" : "neon"}
                note={s(p.note)}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
