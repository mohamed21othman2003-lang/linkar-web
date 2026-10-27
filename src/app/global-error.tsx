"use client";

// W2-500 — لو الـroot layout نفسه وقع: global-error بيستبدله، فلازم <html>/<body> والخط والستايل هنا.
// مفيش metadata في global-error (Client Component) → <title> من React.
import "./globals.css";
import { siteFonts } from "./fonts";
import { statusPages } from "@/lib/data/help/status";
import { StatusPage } from "@/components/status/StatusPage";
import { statusView } from "@/components/status/statusView";

export default function GlobalError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  const v = statusView("ar", statusPages["server-error"]);
  return (
    <html lang="ar" dir="rtl" className={`${siteFonts} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg-canvas text-text-primary">
        <title>{v.title}</title>
        <StatusPage {...v} onRetry={unstable_retry} className="min-h-dvh justify-center" />
      </body>
    </html>
  );
}
