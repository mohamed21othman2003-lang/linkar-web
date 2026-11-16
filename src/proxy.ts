import { NextResponse, type NextRequest } from "next/server";

// صفحات الحساب من غير جلسة ← /login?next=<المسار الأصلي> عشان العميل يرجع لنفس الصفحة بعد الدخول
// (مثلاً رابط حجز من SMS). الـlayout مش بيعرف المسار، فالتحويل هنا قبل الرندر.
// نفس اسم وقيم كوكي الجلسة التجريبية في lib/server/session.ts
const SESSION_COOKIE = "linkar_session";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (session === "user" || session === "new") return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  // /account نفسها هي الافتراضي بعد الدخول، فمش محتاجة next
  if (pathname !== "/account") url.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account", "/account/:path*"],
};
