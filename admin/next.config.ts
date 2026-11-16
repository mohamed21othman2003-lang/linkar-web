import path from "node:path";
import type { NextConfig } from "next";

// على Vercel (Root Directory = admin) المنصة بتحدد الجذر بنفسها — تثبيته هنا بيكسر خطوة النشر
const onVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  // إخراج مستقل لصورة Docker (خدمة admin في docker-compose.yml الرئيسي)
  output: "standalone",
  poweredByHeader: false,
  // على السيرفر اللوحة شغّالة تحت linkar.ido.sa/admin — فاضي = من جذر الدومين (Vercel)
  ...(process.env.NEXT_PUBLIC_BASE_PATH ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH } : {}),
  // اللوحة مشروع مستقل جوه ريبو الموقع — الجذر هو فولدر admin نفسه مش الريبو
  ...(onVercel ? {} : { turbopack: { root: path.join(__dirname) }, outputFileTracingRoot: path.join(__dirname) }),
  // روابط قديمة/متكتبة غلط لصفحات ليها مكان تاني (basePath بيتضاف للمصدر والوجهة لوحده)
  async redirects() {
    return [{ source: "/paid-features", destination: "/system/paid-features", permanent: false }];
  },
};

export default nextConfig;
