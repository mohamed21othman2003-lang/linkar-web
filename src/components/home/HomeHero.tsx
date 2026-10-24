import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { HomeContent } from "@/lib/server/home";
import type { ServiceSlug } from "@/lib/data/types";
import { Header } from "@/components/layout/Header";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Icon } from "@/components/icons/Icon";
import { FigmaIcon } from "./bits";
import { HeroSearch } from "./HeroSearch";
import { ScrollLink } from "./motion";

// v2 · Hero · Linkar (1314:898): AR مسجّل / AR زائر / EN — صورة الكوبيه معكوسة في العربي (السيارة شمال)
export function HomeHero({ locale, content, signedIn, nextAnchor }: { locale: Locale; content: HomeContent; signedIn: boolean; nextAnchor: string }) {
  const h = content.hero;
  const d = getHomeDict(locale);
  const ar = locale === "ar";
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  // Shade · content side — الغامق ناحية النص (يمين في العربي، شمال في الإنجليزي)
  const shade = ar
    ? "linear-gradient(90deg, rgba(4,10,7,0) 0%, rgba(4,10,7,0) 32%, rgba(4,10,7,0.5) 58%, rgba(4,10,7,0.78) 100%)"
    : "linear-gradient(90deg, rgba(4,10,7,0.78) 0%, rgba(4,10,7,0.5) 42%, rgba(4,10,7,0) 68%, rgba(4,10,7,0) 100%)";
  const slugs = Object.keys(h.tiles) as ServiceSlug[];

  return (
    <section className="relative bg-hero-bg text-white lg:h-[810px]">
      <Image
        src="/figma/home/hero-coupe-2x.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className={`object-cover object-[30%_50%] lg:object-center ${ar ? "-scale-x-100" : ""}`}
      />
      <div className="absolute inset-0 bg-shade/55 lg:hidden" />
      <div className="absolute inset-0 hidden lg:block" style={{ backgroundImage: shade }} />
      <div className="absolute inset-x-0 top-0 h-[170px] bg-linear-to-b from-shade/62 to-shade/0" />
      <div className="absolute inset-x-0 bottom-0 h-[240px] bg-linear-to-b from-shade/0 to-shade/62" />

      <Header variant="hero" />

      <div className="relative mx-auto h-full max-w-[1440px] px-4 pt-[120px] pb-10 md:px-10 lg:p-0">
        <div className="flex max-w-[800px] flex-col lg:absolute lg:top-[258px] lg:start-[128px] lg:w-[800px]">
          <h1 className="text-[34px]/[52px] font-bold md:text-display-l">
            {s(h.title_lead)}
            <span className="text-neon-green">{s(h.title_highlight)}</span>
          </h1>
          <p className="mt-2 text-body-l text-white/92">{s(h.subtitle)}</p>
          <div className="mt-7">
            <HeroSearch
              tiles={slugs.map((slug) => ({ slug, label: s(h.tiles[slug]) }))}
              defaultSelected={h.default_services}
              locationPlaceholder={s(signedIn ? h.location_user : h.location_guest)}
              carPlaceholder={s(h.car_placeholder)}
              carTypes={content.carTypes.map((c) => ({ slug: c.slug, label: s(c) }))}
              searchLabel={s(h.search)}
              groupLabel={d.servicesGroup}
              carLabel={d.carType}
              locationLabel={d.location}
              compactLabels={!ar}
            />
          </div>
          <ul className="mt-3.5 flex flex-wrap gap-x-8 gap-y-2">
            {h.trust.map((item) => (
              <li key={item.text_ar} className="flex items-center gap-2 text-label-m text-white/92">
                <FigmaIcon name="shield-check-neon" size={18} />
                {s(item)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-start gap-2 lg:absolute lg:end-[47px] lg:top-[668px] lg:mt-0">
          <p className="text-caption text-white">{s(h.app_label)}</p>
          <StoreBadges height={36} className="flex-col-reverse gap-2!" />
        </div>

        <ScrollLink
          to={nextAnchor}
          className="mt-6 flex h-7 items-center gap-1.5 text-body-m text-neon-green hover:underline lg:absolute lg:start-[128px] lg:top-[752px] lg:mt-0"
        >
          {s(h.discover)}
          <Icon name="chevron-down" size={16} />
        </ScrollLink>
      </div>
    </section>
  );
}
