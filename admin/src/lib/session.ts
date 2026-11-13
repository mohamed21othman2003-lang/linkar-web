// جلسة اللوحة (القسم 2.5). دلوقتي جلسة تجريبية في كوكي — لما الـAPI يجهز الكوكي هيبقى توكن الخادم.
export const SESSION_COOKIE = "linkar_admin_session";
// بعد البريد وكلمة المرور وقبل رمز التحقق
export const PENDING_COOKIE = "linkar_admin_pending";

// «تذكّرني على هذا الجهاز» تطيل مدة الجلسة
export const SESSION_MAX_AGE = { default: 60 * 60 * 12, remember: 60 * 60 * 24 * 30 };

export const HOME_PATH = "/providers"; // في المرحلة الأولى بعد الدخول (CON5-L2 → مقدمو الخدمة)
