import type { Metadata } from "next";
import { RatesView } from "../_components/RatesView";

export const metadata: Metadata = { title: "نسب عمولة المسوّقين" };

// CON5-10 · المسوّقون · نسب العمولة (3114:15905)
export default function MarketerRatesPage() {
  return <RatesView />;
}
