"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";

// Language switch (42:366): بيعرض اللغة التانية ويفتكر الاختيار (كوكي locale + NEXT_LOCALE زي عبور)
export function LangSwitch({ locale, label, className = "" }: { locale: Locale; label: string; className?: string }) {
  const router = useRouter();
  const toggle = () => {
    const next: Locale = locale === "ar" ? "en" : "ar";
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    router.refresh();
  };
  return (
    <button type="button" onClick={toggle} lang={locale === "ar" ? "en" : "ar"} className={className}>
      {label}
    </button>
  );
}
