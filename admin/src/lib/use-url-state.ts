"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// حالة النوافذ والأدراج والفلاتر في الرابط (القسم 2.3) عشان زر الرجوع يقفلها.
// open(...) بيضيف خطوة في السجل · close/replace بيبدّل الخطوة الحالية.
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const build = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [params, pathname],
  );

  const push = useCallback((patch: Record<string, string | null | undefined>) => router.push(build(patch), { scroll: false }), [router, build]);
  const replace = useCallback((patch: Record<string, string | null | undefined>) => router.replace(build(patch), { scroll: false }), [router, build]);

  return { params, get: (k: string) => params.get(k), push, replace, href: build };
}
