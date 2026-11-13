import { Noto_Kufi_Arabic } from "next/font/google";

// خط اللوحة كلها: Noto Kufi Arabic (القسم 3.2) — النسخة الكاملة من Google (اللوحة فيها نصوص كتير متغيّرة من الخادم،
// فمش بنقص الحروف زي موقع العملاء).
export const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-kufi",
  display: "swap",
});
