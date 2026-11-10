import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// robots.txt: الصفحات الخاصة بالعميل (الحساب، الحجز، الدخول، روابط الرسائل) مش للفهرسة
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/booking", "/login", "/forgot-password", "/reset-password", "/gift", "/v/"],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
