// كل روابط الموقع من مكان واحد — ماتكتبش مسار بإيدك في أي كومبوننت.
// الأكواد في التعليقات هي أسماء الفريمات في صفحة linkar-site-final في الفيجما.

export const routes = {
  home: "/", // V2-01 (مسجّل) · V2-02 (زائر)

  // 02 · البحث والاكتشاف والمقارنة
  services: "/services", // W2-25
  search: (q: { services?: string[]; view?: "map" } = {}) => {
    const p = new URLSearchParams();
    if (q.services?.length) p.set("services", q.services.join(","));
    if (q.view) p.set("view", q.view);
    const s = p.toString();
    return s ? `/search?${s}` : "/search";
  }, // W2-30 · W2-30a · W2-30m
  providers: (view?: "map") => (view ? `/providers?view=${view}` : "/providers"), // W2-26 · W2-26m
  provider: (slug: string, tab?: string) => (tab ? `/providers/${slug}?tab=${tab}` : `/providers/${slug}`), // W2-21
  providerService: (provider: string, service: string, tab?: string) =>
    tab ? `/providers/${provider}/${service}?tab=${tab}` : `/providers/${provider}/${service}`, // W2-32

  // 03 · العروض والباقات
  offers: "/offers", // W2-40
  packages: "/packages", // W2-41
  package: (slug: string) => `/packages/${slug}`, // W2-42

  // 04 · الحجز والدفع
  bookingBranch: "/booking/branch", // W2-33
  bookingDetails: "/booking/details", // W2-34
  bookingPayment: "/booking/payment", // W2-35
  bookingConfirmed: "/booking/confirmed", // W2-36
  bookingRate: (bookingId: string) => `/booking/rate?booking=${encodeURIComponent(bookingId)}`, // W2-39

  // 05 · تسجيل الدخول
  login: "/login", // W2-50
  loginVerify: "/login/verify", // W2-50b · W2-50c
  loginComplete: "/login/complete", // W2-50d
  loginEmail: "/login/email", // W2-50e
  forgotPassword: "/forgot-password", // W2-50f
  forgotPasswordSent: "/forgot-password/sent", // W2-50g
  resetPassword: "/reset-password", // W2-50h

  // 06 · حساب العميل
  account: "/account", // W2-60
  bookings: (tab?: string) => (tab ? `/account/bookings?tab=${tab}` : "/account/bookings"), // W2-38
  booking: (id: string) => `/account/bookings/${id}`, // W2-37
  bookingReview: (id: string) => `/account/bookings/${id}?rate=1`, // W2-63 (تقييم الخدمة فوق W2-37c)
  voucher: (id: string) => `/account/bookings/${id}/voucher`, // W2-37v
  favorites: (tab?: string) => (tab ? `/account/favorites?tab=${tab}` : "/account/favorites"), // W2-64
  points: "/account/points", // W2-65
  dealerPackages: "/account/dealer-packages", // W2-66
  cars: "/account/cars", // W2-67
  paymentMethods: "/account/payment-methods", // W2-68
  complaints: (tab?: string) => (tab ? `/account/complaints?tab=${tab}` : "/account/complaints"), // W2-69
  complaintNew: "/account/complaints/new", // W2-69b
  suggestionNew: "/account/complaints/suggestion", // W2-69c
  reviews: "/account/reviews", // W2-70
  settings: "/account/settings", // W2-72
  notifications: (tab?: string) => (tab ? `/account/notifications?tab=${tab}` : "/account/notifications"), // W2-73

  // 07 · روابط الرسائل النصية
  gift: (code: string) => `/gift/${code}`, // W2-80
  giftVerify: (code: string) => `/gift/${code}/verify`, // W2-80b
  giftBook: (code: string) => `/gift/${code}/book`, // W2-80c
  sharedVoucher: (code: string) => `/v/${code}`, // W2-81

  // 08 · لينكار للأعمال
  forProviders: "/business/providers", // W2-90
  providerJoin: "/business/providers/join", // W2-90b
  forDealers: "/business/dealers", // W2-91
  dealerJoin: "/business/dealers/join", // W2-91b
  joinSent: "/business/join/sent", // W2-92
  corporate: "/business/corporate", // W2-93
  affiliates: "/business/affiliates", // W2-94
  affiliateJoin: "/business/affiliates/join", // W2-94b
  affiliateJoinSent: "/business/affiliates/join/sent", // W2-94c

  // 09 · عن لينكار والمساعدة والسياسات
  about: "/about", // W2-95
  aboutVision: "/about#vision",
  howItWorks: "/about#how-it-works",
  contact: "/contact", // W2-96
  help: "/help", // W2-97
  helpArticle: (slug: string) => `/help/${slug}`, // W2-97b
  faq: (tab?: string) => (tab ? `/faq?tab=${tab}` : "/faq"), // W2-98
  terms: "/terms", // W2-99
  privacy: "/privacy", // W2-99b
  cancellation: "/cancellation-policy", // W2-99c
  warranty: "/warranty-and-complaints", // W2-99d
  providerTerms: "/provider-terms", // W2-99e
} as const;
