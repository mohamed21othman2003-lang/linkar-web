import type { ProviderDetail } from "./types";
import { johnson } from "./johnson";

// تفاصيل مقدّمي الخدمة اللي ليهم صفحة في الفيجما — الباقي بيتولّد مؤقتاً (generated.ts)
export const providerDetails: Record<string, ProviderDetail> = { johnson };

export { marketers } from "./marketers";
export { generateDetail, cardPhotoFor } from "./generated";
export type * from "./types";
