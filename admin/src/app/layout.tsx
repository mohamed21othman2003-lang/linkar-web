import type { Metadata } from "next";
import "./globals.css";
import { notoKufi } from "./fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "لوحة تحكم لينكار", template: "%s · لوحة تحكم لينكار" },
  robots: { index: false, follow: false },
};

// اللوحة عربية بس في المرحلة الأولى (القسم 2.6: dir="rtl" على مستوى الصفحة)
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={notoKufi.variable}>
      <body className="min-h-screen bg-surface-1 text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
