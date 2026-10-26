"use client";

// W2-500 — Error boundary للهوم وأي صفحة برّه (site) (من غير هيدر/فوتر لأن الـlayout بتاعهم هو اللي وقع)
import { useEffect, useSyncExternalStore } from "react";
import { statusPages } from "@/lib/data/help/status";
import { StatusPage } from "@/components/status/StatusPage";
import { statusView } from "@/components/status/statusView";

export default function RootError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const locale = useSyncExternalStore(
    () => () => {},
    () => (document.documentElement.lang === "en" ? "en" : "ar"),
    () => "ar" as const,
  );
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <StatusPage {...statusView(locale, statusPages["server-error"])} onRetry={unstable_retry} className="min-h-dvh justify-center" />;
}
