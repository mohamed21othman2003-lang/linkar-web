"use client";

// W2-500 · خطأ في الخادم (85:47978) — Error boundary لصفحات (site) (الهيدر والفوتر فاضلين من الـlayout).
// لو المتصفح مش متصل بالإنترنت بنعرض W2-offline بدل 500.
// Error boundaries لازم Client Components، فالنصوص من lib/data مباشرة (مفيش طبقة سيرفر هنا) واللغة من <html lang>.
import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import { statusPages } from "@/lib/data/help/status";
import { StatusPage } from "@/components/status/StatusPage";
import { statusView } from "@/components/status/statusView";

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

function useStatusLocale(): Locale {
  return useSyncExternalStore(
    () => () => {},
    () => (document.documentElement.lang === "en" ? "en" : "ar"),
    () => "ar",
  );
}

export default function SiteError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const locale = useStatusLocale();
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <StatusPage {...statusView(locale, statusPages[online ? "server-error" : "offline"])} onRetry={unstable_retry} />;
}
