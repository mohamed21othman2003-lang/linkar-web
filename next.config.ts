import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إخراج مستقل لصورة Docker خفيفة (زي عبور) — المرحلة 4
  output: "standalone",
  poweredByHeader: false,
  images: {
    // AVIF الأول (أصغر 30–50% من WebP للصور) والمتصفحات القديمة تاخد WebP
    formats: ["image/avif", "image/webp"],
    // مقاسات أقل من الافتراضي (15 → 10) عشان كل <img> يطلع بـsrcset أقصر — الصفحة فيها ~200 صورة
    // والـsrcset كان ~100KB من الـHTML (وبيتكرّر في بيانات React). 2880 = 1440 على شاشة 2x.
    deviceSizes: [640, 828, 1080, 1440, 1920, 2880],
    imageSizes: [64, 128, 256, 384],
    // 55 لصور الخلفية اللي عليها طبقة غامقة (الفرق مش باين وحجمها أقل) — Next 16 بيقبل بس الجودات اللي هنا
    qualities: [55, 75],
  },
  experimental: {
    // انتقالات الصفحات: DISSOLVE 200ms ease-out زي البروتوتايب في الفيجما (React <ViewTransition>)
    viewTransition: true,
  },
};

export default nextConfig;
