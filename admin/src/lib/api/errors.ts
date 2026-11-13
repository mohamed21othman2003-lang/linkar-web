// أخطاء الخادم (القسم 2.5): 401 → صفحة الدخول · 403 → «ليست لديك صلاحية» · 428 → نافذة «رمز التحقق» ثم إعادة نفس الطلب
export class ApiError extends Error {
  constructor(
    public status: number,
    message = "",
    /** أخطاء الحقول من الخادم: { email: "…" } */
    public fields?: Record<string, string>,
  ) {
    super(message || `HTTP ${status}`);
  }
}

export const isApiError = (e: unknown, status?: number): e is ApiError => e instanceof ApiError && (status == null || e.status === status);

export const delay = <T,>(v: T, ms = 350) => new Promise<T>((r) => setTimeout(() => r(v), ms));

/** نفس رمز الدخول التجريبي — الخادم الحقيقي بيتحقق من تطبيق المصادقة */
export const DEMO_OTP = "482913";
