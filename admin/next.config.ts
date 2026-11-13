import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخراج مستقل لصورة Docker (خدمة admin في docker-compose.yml الرئيسي)
  output: "standalone",
  poweredByHeader: false,
  // اللوحة مشروع مستقل جوه ريبو الموقع — الجذر هو فولدر admin نفسه مش الريبو
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
