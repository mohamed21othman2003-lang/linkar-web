import { routes } from "@/lib/routes";
import type { BookingQuery } from "./query";

// «العودة للخدمات»: لصفحة الباقة لو الحجز من باقة، للعروض لو من عرض، وإلا لصفحة مقدّم الخدمة (W2-21)
export function backHref(q: BookingQuery): string {
  if (q.packages?.length && !q.services?.length) return routes.package(q.packages[0]);
  if (q.offer) return routes.offers;
  return q.provider ? routes.provider(q.provider) : routes.services;
}
