// العروض (W2-40) — بتقرا من lib/data/offers وبتدمج بيانات المركز كما تظهر على الكارت
import { offers, offersPage, type Offer } from "@/lib/data/offers/offers";
import { listingContext } from "@/lib/data/offers/filters";
import type { Provider } from "@/lib/data/types";
import { getProvider } from "@/lib/server/content";
import { withDisplay } from "@/lib/server/booking";

export type OfferWithProvider = { offer: Offer; provider: Provider };

export async function getOffers(): Promise<OfferWithProvider[]> {
  const out: OfferWithProvider[] = [];
  for (const offer of offers) {
    const provider = await getProvider(offer.provider);
    if (provider) out.push({ offer, provider: withDisplay(provider, offer.display) });
  }
  return out;
}

export async function getOffer(id: string): Promise<OfferWithProvider | undefined> {
  return (await getOffers()).find((o) => o.offer.id === id);
}

export async function getOffersPage() {
  return offersPage;
}

export async function getListingContext() {
  return listingContext;
}
