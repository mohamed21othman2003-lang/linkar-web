import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import type { DemoUser, Provider, Service, ServiceSlug } from "@/lib/data/types";
import { formatNumber, formatPrice } from "@/lib/format";
import type { HomeContent } from "@/lib/server/home";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";
import { FigmaIcon, LogoTile } from "../bits";
import { GuestServiceIcon } from "../guest/ServiceIcon";
import { LocationPill } from "../LocationPill";
import { Rail } from "../Rail";

type Pick = { provider: Provider; kind: "returning" | "location" | "ai"; tag: string | null; note: string | null; services: ServiceSlug[] };

// «4.2 · 0.8 كم · 14 فرعاً»
export function providerMeta(locale: Locale, p: Provider) {
  const t = getCommon(locale);
  return `${p.rating.toFixed(1)} · ${formatNumber(p.distance_km)} ${t.km} · ${t.branches(p.branches)}`;
}

// V2-01 · Band · For you (AI) (37:26726) — «اخترنا لك حسب موقعك وتجاربك»: كارت الذكاء الاصطناعي الغامق + 3 كروت
// «لأنك حجزت…/حان موعد…» للعميل العائد بس؛ العميل الجديد يشوف مكانها ترشيحات حسب موقعه (37:28368)
export function ForYouBand({
  locale,
  content,
  providers,
  services,
  user,
  id,
}: {
  locale: Locale;
  content: HomeContent;
  providers: Provider[];
  services: Service[];
  user: DemoUser;
  id: string;
}) {
  const f = content.forYouV3;
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const t = getCommon(locale);
  const returning = !user.is_new;
  const find = (slug: string) => providers.find((x) => x.slug === slug);

  const base: Pick[] = f.picks.flatMap((p) => {
    const provider = find(p.provider);
    return provider ? [{ provider, kind: p.kind, tag: p.tag && s(p.tag), note: p.note && s(p.note), services: p.services }] : [];
  });
  let picks = base;
  if (!returning) {
    // كروت العميل العائد ← أعلى تقييم قريب منه، ثم الأقرب بعده (من غير تكرار)
    const used = new Set(base.filter((p) => p.kind !== "returning").map((p) => p.provider.slug));
    const near = providers.filter((p) => !used.has(p.slug)).sort((a, b) => a.distance_km - b.distance_km);
    const top = near.filter((p) => p.distance_km <= 2).sort((a, b) => b.rating - a.rating)[0] ?? near[0];
    const next = near.find((p) => p !== top)!;
    const repl = [
      { provider: top, tag: s(f.location_reasons[0]) },
      { provider: next, tag: s(f.location_reasons[1]).replace("{km}", formatNumber(next.distance_km)) },
    ];
    let k = 0;
    picks = base.map((p) =>
      p.kind === "returning"
        ? { provider: repl[k].provider, kind: "location", tag: repl[k++].tag, note: s(f.location_note), services: repl[k - 1].provider.services.slice(0, 2) }
        : p,
    );
  }
  const svcName = (slug: ServiceSlug) => {
    const sv = services.find((x) => x.slug === slug);
    return sv ? tx(locale, sv, "name") : slug;
  };

  return (
    <section id={id} className="scroll-mt-20 bg-surface-soft py-16 xl:pt-[132px] xl:pb-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex flex-col gap-2.5">
            <p className="flex items-center gap-2 text-overline text-green-active">
              <FigmaIcon name="feature-ai-dark" size={28} />
              {s(f.overline)}
            </p>
            <h2 className="text-[26px]/[40px] font-bold text-deep-charcoal md:text-h2 lg:whitespace-nowrap">{s(returning ? f.title : f.title_new)}</h2>
          </div>
          <div className="flex flex-col items-start gap-2">
            <LocationPill near={s(f.near)} location={s(content.demoLocation)} change={s(f.change)} />
            <p className="text-caption text-state-gray">{s(f.hint)}</p>
          </div>
        </div>
        <Rail
          trackClass="-me-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-4 md:-me-10 md:pe-10 xl:m-0 xl:grid xl:grid-cols-4 xl:gap-6 xl:overflow-visible xl:p-0"
          itemClass="w-[280px] shrink-0 snap-start md:w-[300px] xl:w-auto"
          dots="light"
          dotsClass="xl:hidden"
        >
          {picks.map((p) => {
            const ai = p.kind === "ai";
            return (
              <article
                key={p.provider.slug}
                className={`relative flex h-[358px] flex-col items-start gap-3.5 rounded-2xl p-[22px] ${
                  ai ? "bg-deep-charcoal text-white" : "border border-cool-gray bg-white text-deep-charcoal"
                }`}
              >
                <Link href={routes.provider(p.provider.slug)} aria-label={tx(locale, p.provider, "name")} className="absolute inset-0 rounded-2xl" />
                {ai ? (
                  <p className="flex items-center gap-2 text-label-m text-neon-green">
                    <FigmaIcon name="feature-ai-neon" size={28} />
                    {s(f.ai_label)}
                  </p>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-label-m ${
                      p.kind === "location" ? "border border-nature-green text-green-active" : "bg-neon-green text-deep-charcoal"
                    }`}
                  >
                    {p.tag}
                  </span>
                )}
                <div className="flex w-full items-center gap-3">
                  <LogoTile slug={p.provider.slug} alt="" size={56} radius="rounded-lg" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="truncate text-h5">{tx(locale, p.provider, "name")}</h3>
                    <p className={`text-caption whitespace-nowrap ${ai ? "text-white/65" : "text-state-gray"}`}>{providerMeta(locale, p.provider)}</p>
                  </div>
                </div>
                {p.note && <p className={`text-body-s ${ai ? "text-white/85" : ""}`}>{p.note}</p>}
                {p.services.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {p.services.map((slug) => (
                      <li key={slug} className="flex items-center gap-1.5 rounded-full bg-surface-soft px-2.5 py-1 text-[14px] leading-[22px] font-light">
                        <GuestServiceIcon slug={slug} variant="outline" size={18} />
                        {svcName(slug)}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto flex w-full items-center justify-between">
                  <p className="flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className={`text-caption ${ai ? "text-white/60" : "text-state-gray"}`}>{t.startsFrom}</span>
                    <span className="text-h5">{formatPrice(locale, p.provider.starting_price)}</span>
                  </p>
                  {ai ? (
                    <span className="rounded-full bg-neon-green px-[18px] py-2 text-label-l text-deep-charcoal">{s(f.view)}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-label-m text-green-active">
                      {s(f.view)}
                      <Icon name="chevron-left" size={16} flip className="text-nature-green" />
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </Rail>
      </Container>
    </section>
  );
}
