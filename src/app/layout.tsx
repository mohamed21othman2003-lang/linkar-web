import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { getLocale, dirOf } from "@/i18n/locale";

// خط الموقع من الـBrand Guideline: عناوين Bold · فرعي Medium · نصوص Light
// (Regular مستخدم في نصوص صغيرة قليلة في V2-01)
const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
});

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
    <html lang={locale} dir={dirOf(locale)} data-scroll-behavior="smooth" className={`${notoKufi.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-canvas text-text-primary">{children}</body>
    </html>
  );
}
