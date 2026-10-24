// حساب المبالغ في ملخص الحجز (W2-35): المجموع − خصم النقاط − رصيد المسوّق = المبلغ المستحق (شامل 15%)
// نفس الدالة بتشتغل على السيرفر والعميل (تبديل النقاط في صفحة الدفع).
export type PointsRule = { sar_per_100: number; max_share: number };

export function pointsValue(points: number, subtotal: number, rule: PointsRule): number {
  const value = (points / 100) * rule.sar_per_100;
  return Math.round(Math.min(value, subtotal * rule.max_share) * 100) / 100;
}

export function computeTotals({
  subtotal,
  points = 0,
  marketerCredit = 0,
}: {
  subtotal: number;
  points?: number; // قيمة النقاط بالريال
  marketerCredit?: number;
}) {
  const due = Math.max(0, Math.round((subtotal - points - marketerCredit) * 100) / 100);
  const tax = Math.round((due * 15) / 115);
  return { subtotal, points, marketerCredit, due, tax, installment: Math.round((due / 4) * 100) / 100 };
}
