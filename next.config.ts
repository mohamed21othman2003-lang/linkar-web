import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخراج مستقل لصورة Docker خفيفة (زي عبور) — المرحلة 4
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // انتقالات الصفحات: DISSOLVE 200ms ease-out زي البروتوتايب في الفيجما (React <ViewTransition>)
    viewTransition: true,
  },
};

export default nextConfig;
