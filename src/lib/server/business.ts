// لينكار للأعمال (08): محتوى صفحات التعريف ونماذج الانضمام.
// دلوقتي من lib/data/business، وبعدين من الـAPI بنفس التوقيعات.
import { providerJoin, providersPage } from "@/lib/data/business/providers";
import { dealerJoin, dealersPage, volumeRanges } from "@/lib/data/business/dealers";
import { corporatePage } from "@/lib/data/business/corporate";
import { affiliateJoin, affiliateSent, affiliatesPage } from "@/lib/data/business/affiliates";
import { branchCounts, cities, joinSent } from "@/lib/data/business/join";

export async function getProvidersPage() {
  return providersPage;
}
export async function getProviderJoin() {
  return { ...providerJoin, cities, branchCounts };
}
export async function getDealersPage() {
  return dealersPage;
}
export async function getDealerJoin() {
  return { ...dealerJoin, cities, volumeRanges };
}
export async function getJoinSent() {
  return joinSent;
}
export async function getCorporatePage() {
  return corporatePage;
}
export async function getAffiliatesPage() {
  return affiliatesPage;
}
export async function getAffiliateJoin() {
  return { ...affiliateJoin, cities };
}
export async function getAffiliateSent() {
  return affiliateSent;
}
