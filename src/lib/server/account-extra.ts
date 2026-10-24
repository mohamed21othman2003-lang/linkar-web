// طبقة البيانات لصفحات الحساب (الجزء 2) — بترجع بيانات تجريبية من lib/data/account،
// وفي المرحلة 3 الدوال دي بس هي اللي هتتغيّر عشان تجيب من Django API.
// العميل الجديد (is_new) بيرجع قوائم فاضية → حالات W2-xx-0.
import type { DemoUser, Provider } from "@/lib/data/types";
import { providers } from "@/lib/data/providers";
import { favoriteProviders, savedItems, type SavedItem } from "@/lib/data/account/favorites-data";
import { pointsHistory, pointsSummary, POINTS_PER_SAR } from "@/lib/data/account/points-data";
import { dealerPackages } from "@/lib/data/account/gifts-data";
import { cars } from "@/lib/data/account/cars-data";
import { invoices, otherMethods, savedCards } from "@/lib/data/account/payment-data";
import { complaints } from "@/lib/data/account/complaints-data";
import { pendingReviews, publishedReviews } from "@/lib/data/account/reviews-data";

const providerBySlug = (slug: string) => providers.find((p) => p.slug === slug);

export type FavoriteProviderView = { provider: Provider; branch: { label_ar: string; label_en: string } };

export async function getFavorites(user: DemoUser): Promise<{ providers: FavoriteProviderView[]; saved: (SavedItem & { providerData?: Provider })[] }> {
  if (user.is_new) return { providers: [], saved: [] };
  const list = favoriteProviders.flatMap((f) => {
    const p = providerBySlug(f.slug);
    // نفس بيانات المقدّم بقيم الكارت في الفيجما (الشارة، المسافة، الخدمات، التصنيف)
    return p ? [{ provider: { ...p, name_ar: f.name_ar ?? p.name_ar, name_en: f.name_en ?? p.name_en, tag: f.tag, distance_km: f.distance_km, services: f.services, tier: f.tier }, branch: f.branch }] : [];
  });
  return { providers: list, saved: savedItems.map((s) => ({ ...s, providerData: providerBySlug(s.provider) })) };
}

export async function getPoints(user: DemoUser) {
  const balance = user.points;
  return {
    balance,
    worthSar: Math.floor(balance / POINTS_PER_SAR),
    summary: user.is_new ? null : pointsSummary,
    referralCode: pointsSummary.referral_code,
    history: user.is_new ? [] : pointsHistory,
  };
}

export async function getDealerPackages(user: DemoUser) {
  return user.is_new ? [] : dealerPackages;
}

// سياراتي وطرق الدفع مالهاش حالة فارغة في الفيجما — نفس البيانات للعميلين
export async function getCars() {
  return cars;
}

export async function getPaymentMethods(user: DemoUser) {
  return { cards: savedCards, other: otherMethods, invoices: user.is_new ? [] : invoices };
}

export async function getComplaints(user: DemoUser) {
  return user.is_new ? [] : complaints;
}

export async function getReviews(user: DemoUser) {
  return user.is_new ? { pending: [], published: [] } : { pending: pendingReviews, published: publishedReviews };
}

export async function getProviderLogo(slug: string) {
  const p = providerBySlug(slug);
  return p ? { src: p.logo, name_ar: p.name_ar, name_en: p.name_en } : null;
}
