// الباقات (W2-41 / W2-42) — بتقرا من lib/data/packages وبتدمج بيانات المركز كما تظهر على الكارت
import { packages, packagesPage, relatedPackages, type Package } from "@/lib/data/packages/packages";
import type { Provider } from "@/lib/data/types";
import { getProvider } from "@/lib/server/content";
import { withDisplay } from "@/lib/server/booking";

export type PackageWithProvider = { pkg: Package; provider: Provider };

export async function getPackages(): Promise<PackageWithProvider[]> {
  const out: PackageWithProvider[] = [];
  for (const pkg of packages) {
    const provider = await getProvider(pkg.provider);
    if (provider) out.push({ pkg, provider: withDisplay(provider, pkg.display) });
  }
  return out;
}

export async function getPackage(slug: string): Promise<PackageWithProvider | undefined> {
  return (await getPackages()).find((p) => p.pkg.slug === slug);
}

export async function getPackageSlugs(): Promise<string[]> {
  return packages.map((p) => p.slug);
}

// «باقات أخرى»: من الفيجما لباقة Johnson Ceramic Pro، وغير كده أول 3 باقات تانية
export async function getRelatedPackages(slug: string): Promise<PackageWithProvider[]> {
  const all = await getPackages();
  const ids = relatedPackages[slug] ?? all.filter((p) => p.pkg.slug !== slug).map((p) => p.pkg.slug).slice(0, 3);
  return ids.map((id) => all.find((p) => p.pkg.slug === id)).filter((p): p is PackageWithProvider => !!p);
}

export async function getPackagesPage() {
  return packagesPage;
}
