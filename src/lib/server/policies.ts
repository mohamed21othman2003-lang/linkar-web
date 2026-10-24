// طبقة بيانات السياسات (W2-99 … W2-99e).
import { policies, policiesCopy, type PolicySlug } from "@/lib/data/policies/policies";

export async function getPolicies() {
  return { policies, copy: policiesCopy };
}

export async function getPolicy(slug: PolicySlug) {
  return policies.find((p) => p.slug === slug)!;
}
