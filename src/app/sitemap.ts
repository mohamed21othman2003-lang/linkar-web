import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";
import { siteUrl } from "@/lib/site-url";
import { getBlogSlugs } from "@/lib/server/blog";
import { getHelpArticles } from "@/lib/server/help";
import { getPackageSlugs } from "@/lib/server/packages";
import { getProviderSlugs } from "@/lib/server/providers";

// sitemap.xml للصفحات العامة بس (المدونة معمولة للـSEO) — الحساب والحجز والدخول برّه، وممنوعة في robots.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, packages, providers, articles] = await Promise.all([getBlogSlugs(), getPackageSlugs(), getProviderSlugs(), getHelpArticles()]);
  const paths = [
    routes.home,
    routes.services,
    routes.providers(),
    routes.offers,
    routes.packages,
    routes.forProviders,
    routes.forDealers,
    routes.corporate,
    routes.affiliates,
    routes.about,
    routes.contact,
    routes.help,
    ...articles.map((a) => routes.helpArticle(a.slug)),
    routes.faq(),
    routes.terms,
    routes.privacy,
    routes.cancellation,
    routes.warranty,
    routes.providerTerms,
    routes.blog,
    ...posts.map(routes.blogPost),
    ...packages.map(routes.package),
    ...providers.map((slug) => routes.provider(slug)),
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl).toString() }));
}
