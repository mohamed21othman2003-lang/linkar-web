import { headers } from "next/headers";

// موبايل (تليفون) من هيدرز الطلب: Client Hint ‏sec-ch-ua-mobile، ولو مش موجود الـUser-Agent.
// التابلت (iPad / Android من غير Mobile) بيتحسب مش موبايل.
export async function isPhone() {
  const h = await headers();
  const hint = h.get("sec-ch-ua-mobile");
  if (hint) return hint === "?1";
  return /iPhone|iPod|Android.+Mobile|Mobile.+Firefox|Windows Phone/i.test(h.get("user-agent") ?? "");
}
