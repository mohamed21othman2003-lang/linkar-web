import type { ProviderDetail, ProviderService } from "@/lib/data/provider-details";

// مفاتيح التبويبات (?tab=) — ملف عادي عشان السيرفر والعميل يستخدموه

// W2-21: الخدمات · الباقات والعروض · الفروع · التقييمات · نبذة (التبويب الفاضي بيختفي)
export type ProviderTab = "services" | "packages" | "branches" | "reviews" | "about";
export const PROVIDER_TABS: ProviderTab[] = ["services", "packages", "branches", "reviews", "about"];

export function availableTabs(detail: ProviderDetail): ProviderTab[] {
  return PROVIDER_TABS.filter(
    (k) =>
      k === "services" ||
      (k === "packages" && detail.packages.length > 0) ||
      (k === "branches" && detail.branches.length > 0) ||
      (k === "reviews" && !!detail.reviews) ||
      (k === "about" && !!detail.about),
  );
}

// W2-32: نظرة عامة · المواصفات التقنية · الضمان · الصور · التقييمات (العميل المعدّل بدّل «ما تشمله» بـ«المواصفات التقنية»)
export type ServiceTab = "overview" | "specs" | "warranty" | "photos" | "reviews";
export const SERVICE_TABS: ServiceTab[] = ["overview", "specs", "warranty", "photos", "reviews"];

export function availableServiceTabs(service: ProviderService, reviewsCount: number, photos: number): ServiceTab[] {
  const d = service.detail;
  return SERVICE_TABS.filter(
    (k) =>
      k === "overview" ||
      (k === "specs" && !!d?.specs.length) ||
      (k === "warranty" && (!!d?.warranty_text || !!service.warranty_label)) ||
      (k === "photos" && photos > 0) ||
      (k === "reviews" && reviewsCount > 0),
  );
}
