import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { tx } from "@/i18n/config";
import { getHomeDict } from "@/i18n/dict/home";
import type { HomeContent } from "@/lib/server/home";
import type { ServiceSlug } from "@/lib/data/types";
import { Header } from "@/components/layout/Header";
import { StoreBadges } from "@/components/brand/StoreBadges";
import { Icon } from "@/components/icons/Icon";
import { HeroSearch } from "./HeroSearch";
import { ScrollLink } from "./motion";

// Hero · Linkar (v2 · Hero) — V2-01 · Home (202:7312) · تابلت V2-01t (202:11805) · موبايل V2-01m (202:11198)
// صورة الكوبيه معكوسة في العربي (السيارة شمال)، العنوان كله ليموني، مربعات الخدمات + الموقع ونوع السيارة + «ابحث»،
// وتحت: QR + شارات المتاجر (QR مش ظاهر على الموبايل) و«اكتشف المزيد من لينكار»
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
  const i = h.incomplete;
  const e = h.errors;

  return (
    <section className="relative bg-deep-charcoal text-white lg:h-[810px]">
      <Image
        src="/figma/home/hero-coupe-2x.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        quality={55}
        className={`object-cover object-[30%_50%] lg:object-center ${ar ? "-scale-x-100" : ""}`}
      />
      <div className="absolute inset-0 bg-shade/55 lg:hidden" />
      <div className="absolute inset-0 hidden lg:block" style={{ backgroundImage: shade }} />
      <div className="absolute inset-x-0 top-0 h-[170px] bg-linear-to-b from-shade/62 to-shade/0" />
      <div className="absolute inset-x-0 bottom-0 h-[240px] bg-linear-to-b from-shade/0 to-shade/62" />

      <Header variant="hero" />

      {/* تابلت (V2-01t): تحت البحث صف واحد — «اكتشف المزيد» في البداية والمتاجر في الآخر */}
      <div className="relative mx-auto h-full max-w-[1440px] px-4 pt-[100px] pb-10 md:px-10 md:pt-[110px] md:max-lg:grid md:max-lg:grid-cols-[1fr_auto] md:max-lg:items-end lg:p-0">
        <div className="flex max-w-[800px] flex-col md:max-lg:col-span-2 lg:absolute lg:top-[258px] lg:start-[128px] lg:w-[800px]">
          {/* موبايل 32/46 على سطرين (V2-01m) · تابلت 46/64 (V2-01t) */}
          <h1 className="text-[32px]/[46px] font-bold text-neon-title md:text-[46px]/[64px] lg:text-display-l">
            {s(h.title_lead)}
            <br className="md:hidden" />
            {s(h.title_highlight)}
          </h1>
          <p className="mt-2 text-body-l text-white/92 max-md:mt-0 max-md:text-[15px]/[24px] max-md:text-white/85 lg:text-white">
            <span className="max-lg:hidden">{s(h.subtitle)}</span>
            <span className="lg:hidden">{s(h.subtitle_t)}</span>
          </p>
          <div className="mt-5 md:mt-5 lg:mt-7">
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
              trust={h.trust.map(s)}
              errors={{ services: s(e.services), cityCar: s(e.city_car), city: s(e.city), car: s(e.car) }}
              popup={{
                badge: s(i.badge),
                title: s(i.title),
                body: s(i.body),
                service: [s(i.service.label), s(i.service.text)],
                city: [s(i.city.label), s(i.city.text)],
                car: [s(i.car.label), s(i.car.text)],
                ok: s(i.ok),
                close: d.close,
              }}
            />
          </div>
        </div>

        {/* App download · المتاجر (1314:545) — QR 80 + الشارتين فوق بعض */}
        <div className="mt-6 flex flex-col items-start gap-2 md:mt-8 md:max-lg:col-start-2 md:max-lg:row-start-2 md:max-lg:items-end lg:absolute lg:end-20 lg:top-[668px] lg:mt-0">
          <p className="text-caption text-white max-md:hidden max-lg:text-[13px]">{s(h.app_label)}</p>
          <div className="flex items-center gap-2.5">
            {/* 36+8+36 = 80 = ارتفاع الـQR بالظبط */}
            <StoreBadges height={36} className="max-md:hidden flex-col-reverse gap-2!" />
            {/* موبايل: Google Play في البداية و App Store في الآخر (V2-01m) */}
            <StoreBadges height={46} className="flex-row-reverse md:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figma/home/qr-code.svg" alt="" width={80} height={80} loading="lazy" className="size-20 rounded-md bg-white max-md:hidden lg:rounded-[10px]" />
          </div>
        </div>

        <ScrollLink
          to={nextAnchor}
          className="mt-6 flex h-7 items-center gap-1.5 text-body-m text-neon-green hover:underline max-md:hidden md:max-lg:col-start-1 md:max-lg:row-start-2 md:max-lg:justify-self-start lg:absolute lg:start-[128px] lg:top-[752px] lg:mt-0"
        >
          {s(h.discover)}
          <Icon name="chevron-down" size={16} />
        </ScrollLink>
      </div>
    </section>
  );
}
