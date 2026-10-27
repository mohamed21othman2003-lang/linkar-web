import type { Metadata } from "next";
import "./globals.css";
import { siteFonts } from "./fonts";
import { getLocale, dirOf } from "@/i18n/locale";

// المحتوى الحقيقي (العنوان والوصف) هييجي من طبقة البيانات في المرحلة 1
export const metadata: Metadata = {
  title: "Linkar",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirOf(locale)} data-scroll-behavior="smooth" className={`${siteFonts} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-canvas text-text-primary">{children}</body>
    </html>
  );
}
