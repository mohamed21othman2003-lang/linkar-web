// روابط الرسائل النصية (07): باقات الوكالة والقسائم المشتركة.
// دلوقتي من lib/data/gift، وبعدين من الـAPI بنفس التوقيعات.
import { agencyGifts, type AgencyGift } from "@/lib/data/gift/gifts";
import { sharedVouchers, type SharedVoucher } from "@/lib/data/gift/shared-vouchers";

export async function getGift(code: string): Promise<AgencyGift | undefined> {
  return agencyGifts.find((g) => g.code.toLowerCase() === code.toLowerCase());
}

export async function getGiftCodes(): Promise<string[]> {
  return agencyGifts.map((g) => g.code);
}

export async function getSharedVoucher(code: string): Promise<SharedVoucher | undefined> {
  return sharedVouchers.find((v) => v.code.toLowerCase() === code.toLowerCase());
}

export async function getSharedVoucherCodes(): Promise<string[]> {
  return sharedVouchers.map((v) => v.code);
}
