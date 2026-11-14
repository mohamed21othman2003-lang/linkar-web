import path from "node:path";
import type { NextConfig } from "next";

// على Vercel (Root Directory = admin) المنصة بتحدد الجذر بنفسها — تثبيته هنا بيكسر خطوة النشر
const onVercel = !!process.env.VERCEL;

const nextConfig: NextConfig = {
  // إخراج مستقل لصورة Docker (خدمة admin في docker-compose.yml الرئيسي)
  output: "standalone",
  poweredByHeader: false,
  // اللوحة مشروع مستقل جوه ريبو الموقع — الجذر هو فولدر admin نفسه مش الريبو
  ...(onVercel ? {} : { turbopack: { root: path.join(__dirname) }, outputFileTracingRoot: path.join(__dirname) }),
};

export default nextConfig;
