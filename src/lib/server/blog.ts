// طبقة بيانات المدونة (W2-100 · W2-100b) — بيانات تجريبية دلوقتي؛ بعدين من الـAPI بنفس التوقيعات.
import { blogCategories, blogGridOrder, blogPage, blogPageCount, blogPosts } from "@/lib/data/blog/blog";

export async function getBlogPage() {
  const featured = blogPosts.find((p) => p.featured)!;
  const grid = blogGridOrder.map((s) => blogPosts.find((p) => p.slug === s)!).filter(Boolean);
  return { page: blogPage, categories: blogCategories, featured, posts: grid, pageCount: blogPageCount };
}

export async function getBlogPost(slug: string) {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return undefined;
  const related = post.related.map((s) => blogPosts.find((p) => p.slug === s)).filter((p) => !!p);
  const category = blogCategories.find((c) => c.key === post.category)!;
  return { post, related, category, categories: blogCategories, page: blogPage };
}

export async function getBlogSlugs() {
  return blogPosts.map((p) => p.slug);
}
