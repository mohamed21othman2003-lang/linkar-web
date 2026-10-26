import { IBM_Plex_Mono } from "next/font/google";

// رمز القسيمة في نسخة العميل (W2-36 · W2-36s · W2-81): IBM Plex Mono SemiBold بتباعد 4%
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: "600", display: "swap" });

export const voucherCodeFont = plexMono.className;
