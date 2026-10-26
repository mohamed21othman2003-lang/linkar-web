// طبقة بيانات الرئيسية (V2-01) — نفس أسلوب lib/server/content.ts:
// دلوقتي بترجع البيانات التجريبية من lib/data/home، وبعدين هتجيبها من الـAPI.
import * as home from "@/lib/data/home/home";
import * as guest from "@/lib/data/home/guest";
import type { LinkKey } from "@/lib/data/home/home";
import { routes } from "@/lib/routes";

export type HomeContent = typeof home;

export async function getHomeContent(): Promise<HomeContent> {
  return home;
}

// الزائر — V2-02 · Home · Icons (37:28371)
export type GuestHomeContent = typeof guest;
export async function getGuestHomeContent(): Promise<GuestHomeContent> {
  return guest;
}

// روابط الأقسام — أي «كل …» أو زر في الرئيسية بيتحوّل لمسار من routes.ts
const linkMap: Record<LinkKey, string> = {
  services: routes.services,
  providers: routes.providers(),
  offers: routes.offers,
  packages: routes.packages,
  search: routes.search(),
  warranty: routes.warranty,
  dealerPackages: routes.dealerPackages,
  // ⚠ مفيش صفحة «كيف تعمل باقات الوكالات» في الفيجما — بتودّي لمركز المساعدة
  dealerHelp: routes.help,
  privacy: routes.privacy,
};

export function homeHref(key: LinkKey): string {
  return linkMap[key];
}

// الباقة ليها صفحة تفاصيل لو ليها slug (Johnson Ceramic Pro)، غير كده صفحة كل الباقات
export function packageHref(slug?: string): string {
  return slug ? routes.package(slug) : routes.packages;
}

// نهاية العرض المميّز — العدّاد في الفيجما بيبدأ من 02 يوم · 14 ساعة · 36 دقيقة
export async function getFeaturedOfferEndsAt(): Promise<string> {
  return new Date(Date.now() + home.offersBand.featured.ends_in_minutes * 60_000).toISOString();
}
