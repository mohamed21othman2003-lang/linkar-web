import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { tx } from "@/i18n/config";
import { getCommon } from "@/i18n/dict/common";
import { getHomeDict } from "@/i18n/dict/home";
import { getSession } from "@/lib/server/session";
import { getPartnerLogos, getProviders, getServices } from "@/lib/server/content";
import { getFeaturedOfferEndsAt, getGuestHomeContent, getHomeContent, homeHref } from "@/lib/server/home";
import { HomeHero } from "@/components/home/HomeHero";
import { LocationModal } from "@/components/home/LocationModal";
import { AppBand } from "@/components/home/AppBand";
import { ForYouBand } from "@/components/home/user/ForYouBand";
import { HowItWorksBand } from "@/components/home/user/HowItWorksBand";
import { ServicesBand } from "@/components/home/user/ServicesBand";
import { ProvidersBand } from "@/components/home/user/ProvidersBand";
import { OffersBand } from "@/components/home/user/OffersBand";
import { PackagesBand } from "@/components/home/user/PackagesBand";
import { ReviewsBand } from "@/components/home/bands/ReviewsBand";
import { DealerBand } from "@/components/home/bands/DealerBand";
import { ServicesExplorer } from "@/components/home/guest/ServicesExplorer";
import { FeaturesBand } from "@/components/home/guest/FeaturesBand";
import { ProvidersGuestBand } from "@/components/home/guest/ProvidersGuestBand";
import { OffersGuestBand } from "@/components/home/guest/OffersGuestBand";
import { HowItWorksGuest } from "@/components/home/guest/HowItWorksGuest";
import { AppGuestBand } from "@/components/home/guest/AppGuestBand";

export async function generateMetadata(): Promise<Metadata> {
  const d = getHomeDict(await getLocale());
  return { title: d.metaTitle, description: d.metaDescription };
}

// الرئيسية — قرار المالك: صفحة «Linkar-Main-Website» (0:1) في نسخة العميل:
// العميل المسجّل (user/new) = V2-01 · Home (37:26637) · الزائر = V2-02 · Home · Icons (37:28371).
// «لأنك حجزت…/حان موعد…» للعميل العائد بس؛ العميل الجديد يشوف مكانها ترشيحات حسب موقعه (37:28368)
export default async function Home() {
  const [locale, user, content, guest, providers, services, logos, endsAt] = await Promise.all([
    getLocale(),
    getSession(),
    getHomeContent(),
    getGuestHomeContent(),
    getProviders(),
    getServices(),
    getPartnerLogos(),
    getFeaturedOfferEndsAt(),
  ]);
  const t = getCommon(locale);
  const s = (x: { text_ar: string; text_en: string }) => tx(locale, x, "text");
  const m = content.locationModal;
  const a = content.anchors;

  return (
    <>
      <HomeHero locale={locale} content={content} variant={user ? "user" : "guest"} services={services} providers={providers} appAnchor={a.app} />
      {!user && (
        <>
          <ServicesExplorer id={a.services} locale={locale} content={guest} providers={providers} services={services} />
          <FeaturesBand locale={locale} content={guest} providers={providers} />
          <ProvidersGuestBand locale={locale} content={guest} providers={providers} services={services} logos={logos} />
          <OffersGuestBand locale={locale} content={guest} providers={providers} />
          <HowItWorksGuest locale={locale} content={content} />
          <AppGuestBand id={a.app} locale={locale} content={guest} />
        </>
      )}
      {user && (
        <>
      <ForYouBand id={a.forYou} locale={locale} content={content} providers={providers} services={services} user={user} />
      <ServicesBand locale={locale} content={content} services={services} />
      <HowItWorksBand locale={locale} content={content} providers={providers} />
      <ProvidersBand locale={locale} content={content} providers={providers} services={services} logos={logos} />
      <OffersBand locale={locale} content={content} providers={providers} endsAt={endsAt} />
      <PackagesBand locale={locale} content={content} providers={providers} />
      <AppBand id={a.app} locale={locale} content={content} />
      <ReviewsBand locale={locale} content={content} />
      <DealerBand locale={locale} content={content} />
        </>
      )}
      <LocationModal
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
