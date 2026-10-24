import type { Localized } from "@/i18n/config";

// W2-70 · تقييماتي (753:9444) + W2-70-0 حالة فارغة (1071:786)

export const reviewsPage = {
  title_ar: "تقييماتي",
  title_en: "My reviews",
  description_ar: "قيّم حجوزاتك المكتملة واكسب 50 نقطة عن كل تقييم موثّق — خلال 30 يوماً من اكتمال الحجز.",
  description_en: "Review your completed bookings and earn 50 points for every verified review — within 30 days of the booking being completed.",
  pending_title_ar: "بانتظار تقييمك",
  pending_title_en: "Waiting for your review",
  rate_now_ar: "قيّم الآن · \u2066+50\u2069 نقطة",
  rate_now_en: "Rate now · +50 points",
  rate_star_ar: "{n} من 5",
  rate_star_en: "{n} out of 5",
  published_title_ar: "تقييماتك المنشورة",
  published_title_en: "Your published reviews",
  published_subtitle_ar: "يظهر تقييمك باسمك الأول وحرف من اسم العائلة، ويستطيع مقدّم الخدمة الرد عليه مرة واحدة.",
  published_subtitle_en: "Your review shows your first name and last initial, and the provider can reply to it once.",
  points_badge_ar: "\u2066+50\u2069 نقطة",
  points_badge_en: "+50 points",
  rules_ar: "التقييم متاح لمن أكمل الحجز فقط، ويمكن تعديله مرة واحدة خلال 7 أيام من نشره. لا نحذف التقييمات السلبية، ونخفي فقط ما يخالف سياسة النشر.",
  rules_en: "Only customers who completed the booking can review, and a review can be edited once within 7 days of posting. We don’t remove negative reviews — we only hide content that breaks the posting policy.",
  empty_title_ar: "لا توجد تقييمات بعد",
  empty_title_en: "No reviews yet",
  empty_text_ar: "بعد اكتمال أي حجز يمكنك تقييمه خلال 30 يوماً، وتحصل على 50 نقطة لكل تقييم موثّق.",
  empty_text_en: "Once a booking is completed you can review it within 30 days, and you get 50 points for every verified review.",
  empty_cta_ar: "ابحث عن خدمة",
  empty_cta_en: "Find a service",
};

export type PendingReview = Localized<"title"> &
  Localized<"meta"> & {
    booking: string;
    provider: string;
  };

export const pendingReviews: PendingReview[] = [
  {
    booking: "BK-21388",
    provider: "lamaa",
    title_ar: "تلميع ثلاث مراحل · مركز لمعة للتلميع",
    title_en: "3-stage polish · Lamaa Polishing Center",
    meta_ar: "‏BK-21388 · اكتمل الخميس 8 أكتوبر · التقييم متاح حتى السبت 7 نوفمبر",
    meta_en: "BK-21388 · completed Thu 8 Oct · review open until Sat 7 Nov",
  },
];

export type PublishedReview = Localized<"title"> &
  Localized<"meta"> &
  Localized<"text"> & {
    booking: string;
    provider: string;
    stars: number;
    edit_note?: Localized<"text">;
    reply?: Localized<"text">;
  };

export const publishedReviews: PublishedReview[] = [
  {
    booking: "BK-21302",
    provider: "bareeq",
    stars: 5,
    title_ar: "غسيل خارجي وداخلي · مغاسل بريق",
    title_en: "Exterior & interior wash · Bareeq Car Wash",
    meta_ar: "‏BK-21302 · نُشر الثلاثاء 29 سبتمبر 2026",
    meta_en: "BK-21302 · posted Tue 29 Sep 2026",
    text_ar: "غسيل ممتاز وسريع، والتزموا بالموعد تماماً. الداخلية نظيفة جداً.",
    text_en: "Excellent, quick wash, and they kept to the time exactly. The interior is very clean.",
    edit_note: { text_ar: "يمكنك تعديله حتى الثلاثاء 6 أكتوبر — انتهت مدة التعديل", text_en: "Editable until Tue 6 Oct — the editing period has ended" },
  },
  {
    booking: "BK-19520",
    provider: "nukhba",
    stars: 4,
    title_ar: "تظليل كامل للسيارة · مركز النخبة للتظليل",
    title_en: "Full car tint · Al Nukhba Tinting Center",
    meta_ar: "‏BK-19520 · نُشر الاثنين 15 يونيو 2026",
    meta_en: "BK-19520 · posted Mon 15 Jun 2026",
    text_ar: "جودة التظليل ممتازة والعزل واضح من أول يوم، لكن الاستلام تأخر نصف ساعة عن الموعد.",
    text_en: "Excellent tint quality and the heat insulation is noticeable from day one, but pickup was half an hour late.",
    reply: {
      text_ar: "رد مركز النخبة للتظليل · 16 يونيو: شكراً يا محمد، ونعتذر عن التأخير — التزمنا بمواعيد استلام أدق من بعدها.",
      text_en: "Al Nukhba Tinting Center replied · 16 Jun: Thank you, Mohammed, and sorry for the delay — we’ve kept tighter pickup times since then.",
    },
  },
];
