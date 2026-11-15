import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getHomeDict } from "@/i18n/dict/home";
import { getSession } from "@/lib/server/session";
import { getProviders, getProvidersBySlugs, getServices } from "@/lib/server/content";
import { getFeaturedOfferEndsAt, getHomeContent, homeHref } from "@/lib/server/home";
import { HomeHero } from "@/components/home/HomeHero";
import { LocationModal } from "@/components/home/LocationModal";
import { LOCATION_STORAGE_KEY } from "@/components/home/location-events";
import { AppBand } from "@/components/home/AppBand";
import { ForYouBand } from "@/components/home/bands/ForYouBand";
import { HowItWorksBand } from "@/components/home/user/HowItWorksBand";
import { ServicesBand } from "@/components/home/bands/ServicesBand";
import { ProvidersBand } from "@/components/home/bands/ProvidersBand";
import { OffersBand } from "@/components/home/bands/OffersBand";
import { PackagesBand } from "@/components/home/bands/PackagesBand";
import { ReviewsBand } from "@/components/home/bands/ReviewsBand";
import { DealerBand } from "@/components/home/bands/DealerBand";

export async function generateMetadata(): Promise<Metadata> {
  const d = getHomeDict(await getLocale());
  return { title: d.metaTitle, description: d.metaDescription };
}

// الرئيسية — V2-01 · Home (202:7311) في نسخة العميل: نفس الصفحة للزائر والعميل المسجّل.
// «لأنك حجزت…/حان موعد…» للعميل العائد بس؛ الزائر والعميل الجديد يشوفوا مكانها ترشيحات حسب موقعه (ملاحظة 202:8219)
export default async function Home() {
  const [locale, user, content, providers, services, endsAt, jar] = await Promise.all([
    getLocale(),
    getSession(),
    getHomeContent(),
    getProviders(),
    getServices(),
    getFeaturedOfferEndsAt(),
    cookies(),
  ]);
  const t = getCommon(locale);
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const m = content.locationModal;
  const a = content.anchors;
  const serviceItems = await Promise.all(services.map(async (service) => ({ service, providers: await getProvidersBySlugs(service.featured_providers) })));

  return (
    <>
      <HomeHero locale={locale} content={content} signedIn={!!user} nextAnchor={a.forYou} />
      {/* «اخترنا لك» بيبان جزء منه في أول شاشة على الديسكتوب — بيتبعت مع الصفحة على طول (من غير Suspense) */}
      <ForYouBand id={a.forYou} locale={locale} content={content} providers={providers} user={user} />
      {/* الأقسام اللي تحت أول شاشة: المتصفح مابيحسبش layout/رسم ليها لحد ما تقرّب من الشاشة (content-visibility) —
          الرئيسية فيها ~1600 عنصر وده كان أكبر شغل على المعالج في الموبايل */}
      <Deferred>
        <HowItWorksBand locale={locale} content={content} providers={providers} />
      </Deferred>
      <Deferred>
        <ServicesBand locale={locale} content={content} items={serviceItems} />
      </Deferred>
      <Deferred>
        <ProvidersBand locale={locale} content={content} providers={providers} services={services} />
      </Deferred>
      <Deferred>
        <OffersBand locale={locale} content={content} providers={providers} endsAt={endsAt} />
      </Deferred>
      <Deferred>
        <PackagesBand locale={locale} content={content} providers={providers} />
      </Deferred>
      <Deferred>
        <AppBand id={a.app} locale={locale} content={content} />
      </Deferred>
      <Deferred>
        <ReviewsBand locale={locale} content={content} />
      </Deferred>
      <Deferred>
        <DealerBand locale={locale} content={content} />
      </Deferred>
      <LocationModal
        initialOpen={!jar.has(LOCATION_STORAGE_KEY)}
        privacyHref={homeHref("privacy")}
        currentLabel={s(content.demoLocation)}
        copy={{
          title: s(m.title),
          body: s(m.body),
          useCurrent: s(m.use_current),
          or: s(m.or),
          placeholder: s(m.search_placeholder),
          hint: s(m.hint),
          notNow: s(m.not_now),
          browserNote: s(m.browser_note),
          privacy: s(m.privacy),
          close: t.close,
        }}
      />
    </>
  );
}

// ارتفاع تقديري لحد ما القسم يترسم أول مرة (auto = بعد كده بيفتكر ارتفاعه الحقيقي).
// Suspense: React بيعمل hydration لكل قسم في مهمة لوحده ويسيب المتصفح يتنفّس بينهم — بدل مهمة واحدة طويلة للصفحة كلها (TBT)
function Deferred({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Placeholder />}>
      <div className="[contain-intrinsic-size:auto_900px] [content-visibility:auto]">{children}</div>
    </Suspense>
  );
}

// React ساعات بيبعت القسم الكبير بعد أول رسمة — المكان المحجوز بيمنع الفوتر يطلع تحت الهيرو ثم يتزق (CLS)
function Placeholder() {
  return <div aria-hidden className="h-[900px]" />;
}
