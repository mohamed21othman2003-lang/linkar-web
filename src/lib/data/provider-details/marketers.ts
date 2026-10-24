import type { Marketer } from "./types";

// روابط المسوّقين — W2-32s (1321:352639): «وصلت عبر رابط المسوّق تركي (SM123) · رصيد 300 ر.س …»
// والصف في كارت الحجز: «رصيد المسوّق (SM123-300) عند الدفع  −300 ر.س»
export const marketers: Marketer[] = [
  { code: "SM123", name_ar: "تركي", name_en: "Turki", credit: 300, min_total: 1000, voucher_code: "SM123-300" },
];
