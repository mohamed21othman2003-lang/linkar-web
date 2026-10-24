// القسم 05 · تسجيل الدخول وإنشاء الحساب (W2-50 … W2-50h) + النوافذ P-24 و P-10t.
// العربي من الفيجما بالحرف؛ الإنجليزي ترجمتنا. النصوص المعلّمة «(ليس في الفيجما)» حالات ناقصة في التصميم.
import type { Localized } from "@/i18n/config";
import { externalPortals } from "@/lib/data/site";

// ---------- بيانات تجريبية (لحد ما يتربط الـOTP والـAPI الحقيقي) ----------
// رمز التحقق التجريبي — الفيجما بتعرض 7419 كرمز غلط (W2-50c) ومفيش رمز صحيح ظاهر
export const DEMO_OTP = "1234";
export const OTP_LENGTH = 4;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_RESEND_SECONDS = 45; // «إعادة الإرسال بعد 0:45»
// الرقم ده (رقم «محمد سالم» في الفيجما 55 123 4567) = عميل حالي؛ أي رقم تاني = عميل جديد ← «أكمل حسابك»
export const DEMO_EXISTING_PHONE = "551234567";
// الدخول بالبريد (W2-50e): بريد العميل التجريبي
export const DEMO_EXISTING_EMAIL = "mohammed.salem@example.com";
// أكواد الدعوة الصالحة (W2-50d: «SARA4K» ← خصم 30 ر.س)
export const INVITE_CODES = ["SARA4K"];

export const businessLinks = [
  { key: "provider", label_ar: "دخول لوحة مقدّم الخدمة", label_en: "Service provider dashboard", href: externalPortals.provider },
  { key: "dealer", label_ar: "دخول بوابة الوكالات", label_en: "Dealership portal", href: externalPortals.dealer },
];

type L<K extends string> = Localized<K>;

// اللوحة الغامقة جنب كل شاشات الدخول (Side panel)
export const sidePanel: L<"title" | "note"> & { benefits: (L<"text"> & { icon: "calendar" | "package" | "tag" | "gift" | "car" })[] } = {
  title_ar: "حسابك في لينكار يحفظ لك كل شيء",
  title_en: "Your Linkar account keeps everything in one place",
  benefits: [
    { icon: "calendar", text_ar: "احجز وادفع في دقيقة — ويتأكد الحجز فوراً", text_en: "Book and pay in a minute — confirmed instantly" },
    { icon: "package", text_ar: "قسائمك وحجوزاتك ومتابعتها في مكان واحد", text_en: "Your vouchers and bookings, tracked in one place" },
    { icon: "tag", text_ar: "نقاط مع كل حجز مكتمل تستخدمها عند الدفع", text_en: "Points on every completed booking, used at checkout" },
    { icon: "gift", text_ar: "هدايا الوكالات تصلك وتحجزها بدون دفع", text_en: "Dealership gifts reach you and you book them for free" },
    { icon: "car", text_ar: "سياراتك محفوظة والأسعار حسب حجم كل سيارة", text_en: "Your cars are saved and prices match each car's size" },
  ],
  note_ar: "لا نشارك رقم جوالك مع مقدّم الخدمة إلا لأغراض حجزك.",
  note_en: "We only share your mobile number with the provider for your booking.",
};

// نصوص مشتركة بين بطاقات الدخول
export const shared: L<"tab_phone" | "tab_email" | "or" | "google" | "apple" | "business_title" | "back_to_login" | "email_label" | "email_placeholder" | "password_label" | "password_hint"> = {
  tab_phone_ar: "رقم الجوال",
  tab_phone_en: "Mobile number",
  tab_email_ar: "البريد الإلكتروني",
  tab_email_en: "Email",
  or_ar: "أو",
  or_en: "or",
  google_ar: "المتابعة مع Google",
  google_en: "Continue with Google",
  apple_ar: "المتابعة مع Apple",
  apple_en: "Continue with Apple",
  business_title_ar: "مقدّم خدمة أو وكالة سيارات؟",
  business_title_en: "A service provider or car dealership?",
  back_to_login_ar: "العودة لتسجيل الدخول",
  back_to_login_en: "Back to sign in",
  email_label_ar: "البريد الإلكتروني",
  email_label_en: "Email",
  email_placeholder_ar: "name@example.com",
  email_placeholder_en: "name@example.com",
  password_label_ar: "كلمة المرور",
  password_label_en: "Password",
  password_hint_ar: "8 أحرف على الأقل، وتحتوي على رقم وحرف.",
  password_hint_en: "At least 8 characters, including a number and a letter.",
};

// «بالمتابعة أنت توافق على الشروط والأحكام وسياسة الخصوصية.» — الجملة متقسّمة عشان الرابطين
export const consent: L<"before" | "terms" | "and" | "privacy" | "after"> = {
  before_ar: "بالمتابعة أنت توافق على ",
  before_en: "By continuing you agree to the ",
  terms_ar: "الشروط والأحكام",
  terms_en: "Terms & Conditions",
  and_ar: " و",
  and_en: " and ",
  privacy_ar: "سياسة الخصوصية",
  privacy_en: "Privacy Policy",
  after_ar: ".",
  after_en: ".",
};

// W2-50 · رقم الجوال (755:10604)
export const phoneScreen: L<"meta_title" | "title" | "subtitle" | "label" | "placeholder" | "hint" | "cta"> = {
  meta_title_ar: "تسجيل الدخول",
  meta_title_en: "Sign in",
  title_ar: "أهلاً بك في لينكار",
  title_en: "Welcome to Linkar",
  subtitle_ar: "سجّل دخولك أو أنشئ حسابك برقم جوالك — بدون كلمة مرور.",
  subtitle_en: "Sign in or create your account with your mobile number — no password needed.",
  label_ar: "رقم الجوال",
  label_en: "Mobile number",
  placeholder_ar: "55 123 4567",
  placeholder_en: "55 123 4567",
  hint_ar: "نرسل لك رمز تحقق من 4 أرقام برسالة نصية من LINKAR.",
  hint_en: "We'll text you a 4-digit verification code from LINKAR.",
  cta_ar: "أرسل رمز التحقق",
  cta_en: "Send verification code",
};

// W2-50b · رمز التحقق (755:11031) + W2-50c · رمز غير صحيح (755:11455)
export const verifyScreen: L<
  "meta_title" | "edit_number" | "title" | "sent_to" | "resend_wait" | "cta" | "help" | "resend" | "wrong_2" | "wrong_1" | "wrong_note" | "locked" | "locked_note" | "digit"
> = {
  meta_title_ar: "رمز التحقق",
  meta_title_en: "Verification code",
  edit_number_ar: "تعديل الرقم",
  edit_number_en: "Change number",
  title_ar: "أدخل رمز التحقق",
  title_en: "Enter the verification code",
  sent_to_ar: "أرسلنا رمزاً من 4 أرقام إلى",
  sent_to_en: "We sent a 4-digit code to",
  resend_wait_ar: "يصلك الرمز خلال ثوانٍ · إعادة الإرسال بعد",
  resend_wait_en: "The code arrives in seconds · Resend in",
  cta_ar: "تحقق وادخل",
  cta_en: "Verify and sign in",
  help_ar: "لم يصلك الرمز؟ تأكد من الرقم، أو أعد الإرسال بعد انتهاء العداد.",
  help_en: "Didn't get the code? Check the number, or resend when the timer ends.",
  resend_ar: "أعد إرسال الرمز",
  resend_en: "Resend code",
  wrong_2_ar: "الرمز غير صحيح — بقيت محاولتان",
  wrong_2_en: "Incorrect code — 2 attempts left",
  // (ليس في الفيجما) المحاولة الثانية الغلط
  wrong_1_ar: "الرمز غير صحيح — بقيت محاولة واحدة",
  wrong_1_en: "Incorrect code — 1 attempt left",
  wrong_note_ar: "بعد 3 محاولات خاطئة نوقف التحقق 10 دقائق لحماية حسابك.",
  wrong_note_en: "After 3 wrong attempts we pause verification for 10 minutes to protect your account.",
  // (ليس في الفيجما) بعد المحاولة الثالثة
  locked_ar: "أوقفنا التحقق مؤقتاً",
  locked_en: "Verification paused",
  locked_note_ar: "أدخلت رمزاً غير صحيح 3 مرات. حاول مرة أخرى بعد 10 دقائق.",
  locked_note_en: "You entered a wrong code 3 times. Try again in 10 minutes.",
  digit_ar: "الرقم",
  digit_en: "Digit",
};

// W2-50d · إكمال الحساب · أول دخول (755:11885)
export const completeScreen: L<
  | "meta_title"
  | "verified"
  | "title"
  | "subtitle"
  | "first_name"
  | "last_name"
  | "first_name_placeholder"
  | "last_name_placeholder"
  | "email_hint"
  | "invite_label"
  | "invite_applied"
  | "terms"
  | "sms_offers"
  | "cta"
> = {
  meta_title_ar: "أكمل حسابك",
  meta_title_en: "Complete your account",
  verified_ar: "تم التحقق من رقمك",
  verified_en: "Your number is verified",
  title_ar: "أكمل حسابك",
  title_en: "Complete your account",
  subtitle_ar: "خطوة واحدة — نحتاج اسمك ليظهر لمقدّم الخدمة في حجوزاتك.",
  subtitle_en: "One step — we need your name so providers see it on your bookings.",
  first_name_ar: "الاسم الأول",
  first_name_en: "First name",
  last_name_ar: "اسم العائلة",
  last_name_en: "Last name",
  // القيم الظاهرة في الفيجما («محمد»، «سالم») كأمثلة داخل الحقول
  first_name_placeholder_ar: "محمد",
  first_name_placeholder_en: "Mohammed",
  last_name_placeholder_ar: "سالم",
  last_name_placeholder_en: "Salem",
  email_hint_ar: "لتسجيل الدخول بالبريد، ولاستلام الفواتير على بريدك.",
  email_hint_en: "To sign in with email and receive invoices by email.",
  invite_label_ar: "رمز دعوة (اختياري)",
  invite_label_en: "Invite code (optional)",
  invite_applied_ar: "تم تطبيق الرمز: خصم 30 ر.س على أول حجز بقيمة 200 ر.س أو أكثر.",
  invite_applied_en: "Code applied: SAR 30 off your first booking of SAR 200 or more.",
  terms_ar: "أوافق على الشروط والأحكام وسياسة الخصوصية",
  terms_en: "I agree to the Terms & Conditions and Privacy Policy",
  sms_offers_ar: "أرغب في تلقي عروض مقدّمي الخدمة برسائل نصية",
  sms_offers_en: "I'd like to receive provider offers by SMS",
  cta_ar: "إنشاء الحساب والمتابعة",
  cta_en: "Create account and continue",
};

// W2-50e · البريد الإلكتروني وكلمة المرور (1070:58)
export const emailScreen: L<"meta_title" | "title" | "subtitle" | "forgot" | "cta" | "no_account"> = {
  meta_title_ar: "تسجيل الدخول بالبريد الإلكتروني",
  meta_title_en: "Sign in with email",
  title_ar: "أهلاً بك في لينكار",
  title_en: "Welcome to Linkar",
  subtitle_ar: "سجّل دخولك ببريدك الإلكتروني وكلمة المرور.",
  subtitle_en: "Sign in with your email and password.",
  forgot_ar: "نسيت كلمة المرور؟",
  forgot_en: "Forgot your password?",
  cta_ar: "تسجيل الدخول",
  cta_en: "Sign in",
  no_account_ar: "ليس لديك حساب؟ أنشئ حسابك برقم الجوال",
  no_account_en: "No account? Create one with your mobile number",
};

// W2-50f · استعادة كلمة المرور (1070:185)
export const forgotScreen: L<"meta_title" | "title" | "subtitle" | "cta"> = {
  meta_title_ar: "استعادة كلمة المرور",
  meta_title_en: "Reset your password",
  title_ar: "استعادة كلمة المرور",
  title_en: "Reset your password",
  subtitle_ar: "أدخل بريدك الإلكتروني المسجّل، وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.",
  subtitle_en: "Enter your registered email and we'll send you a link to set a new password.",
  cta_ar: "أرسل رابط الاستعادة",
  cta_en: "Send reset link",
};

// W2-50g · تفقّد بريدك (1070:282) + P-10t (1070:312356)
export const sentScreen: L<"meta_title" | "title" | "subtitle" | "open_link" | "resend" | "resent_toast"> = {
  meta_title_ar: "تفقّد بريدك الإلكتروني",
  meta_title_en: "Check your email",
  title_ar: "تفقّد بريدك الإلكتروني",
  title_en: "Check your email",
  subtitle_ar: "إذا كان البريد مرتبطاً بحساب في لينكار، فسيصلك رابط لتعيين كلمة مرور جديدة خلال دقائق.",
  subtitle_en: "If this email is linked to a Linkar account, you'll get a link to set a new password within minutes.",
  open_link_ar: "فتح رابط الاستعادة",
  open_link_en: "Open reset link",
  resend_ar: "لم يصلك الرابط؟ أعد الإرسال",
  resend_en: "Didn't get the link? Resend",
  resent_toast_ar: "أعدنا إرسال رابط الاستعادة",
  resent_toast_en: "We've resent the reset link",
};

// W2-50h · تعيين كلمة مرور جديدة (1070:381)
export const resetScreen: L<"meta_title" | "title" | "subtitle" | "new_label" | "confirm_label" | "cta"> = {
  meta_title_ar: "تعيين كلمة مرور جديدة",
  meta_title_en: "Set a new password",
  title_ar: "تعيين كلمة مرور جديدة",
  title_en: "Set a new password",
  subtitle_ar: "اختر كلمة مرور قوية لا تستخدمها في مواقع أخرى.",
  subtitle_en: "Choose a strong password you don't use on other sites.",
  new_label_ar: "كلمة المرور الجديدة",
  new_label_en: "New password",
  confirm_label_ar: "تأكيد كلمة المرور",
  confirm_label_en: "Confirm password",
  cta_ar: "حفظ كلمة المرور",
  cta_en: "Save password",
};

// P-24 · أضف سيارتك (بعد إنشاء الحساب) (1136:26887) — من «إنشاء الحساب والمتابعة»
export const addCarModal: L<
  | "created"
  | "title"
  | "body"
  | "make"
  | "model"
  | "year"
  | "color"
  | "plate"
  | "plate_placeholder"
  | "size_note"
  | "size_label"
  | "later"
  | "cta"
  | "close"
> = {
  created_ar: "تم إنشاء حسابك",
  created_en: "Your account is created",
  title_ar: "أضف سيارتك",
  title_en: "Add your car",
  body_ar: "أسعار التظليل والنانو سيراميك والتلميع تختلف حسب حجم السيارة. أضفها الآن لتظهر لك الأسعار الصحيحة، أو لاحقاً من «سياراتي».",
  body_en: "Tint, nano-ceramic and polish prices depend on car size. Add it now to see the right prices, or later from “My cars”.",
  make_ar: "الشركة",
  make_en: "Make",
  model_ar: "الموديل",
  model_en: "Model",
  year_ar: "سنة الصنع",
  year_en: "Year",
  color_ar: "اللون (اختياري)",
  color_en: "Color (optional)",
  plate_ar: "رقم اللوحة (اختياري)",
  plate_en: "Plate number (optional)",
  plate_placeholder_ar: "مثال: ر س ح 1234",
  plate_placeholder_en: "e.g. R S H 1234",
  size_note_ar: "نحدد الحجم تلقائياً من الموديل، والأسعار تظهر حسبه.",
  size_note_en: "We set the size from the model automatically, and prices follow it.",
  size_label_ar: "الحجم:",
  size_label_en: "Size:",
  later_ar: "لاحقاً",
  later_en: "Later",
  cta_ar: "إضافة السيارة والمتابعة",
  cta_en: "Add car and continue",
  close_ar: "إغلاق",
  close_en: "Close",
};

// خيارات P-24 — من الفيجما فقط (W2-67 / W2-67b / P-15): تويوتا (كامري، لاندكروزر) · لكزس (ES) · أبيض · رمادي
export type CarSize = L<"label">;
export const carSizes: Record<"sedan", CarSize> = {
  sedan: { label_ar: "سيدان", label_en: "Sedan" },
};
export const carMakes: (L<"name"> & { slug: string; models: (L<"name"> & { slug: string; size: keyof typeof carSizes | null })[] })[] = [
  {
    slug: "toyota",
    name_ar: "تويوتا",
    name_en: "Toyota",
    models: [
      { slug: "camry", name_ar: "كامري", name_en: "Camry", size: "sedan" },
      // حجم لاندكروزر مش ظاهر في الفيجما
      { slug: "land-cruiser", name_ar: "لاندكروزر", name_en: "Land Cruiser", size: null },
    ],
  },
  { slug: "lexus", name_ar: "لكزس", name_en: "Lexus", models: [{ slug: "es", name_ar: "ES", name_en: "ES", size: "sedan" }] },
];
export const carColors: (L<"name"> & { slug: string })[] = [
  { slug: "white", name_ar: "أبيض", name_en: "White" },
  { slug: "gray", name_ar: "رمادي", name_en: "Gray" },
];
// سنوات الصنع (أرقام) — الفيجما بتعرض 2022 · 2023 · 2026
export const carYears = Array.from({ length: 2027 - 2005 }, (_, i) => 2026 - i);
// القيم الافتراضية زي الفيجما: تويوتا · كامري · 2023 · أبيض
export const carDefaults = { make: "toyota", model: "camry", year: 2023, color: "white" };
