import { NextResponse, type NextRequest } from "next/server";
import { HOME_PATH, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/session";

// كل صفحات اللوحة محمية: من غير جلسة → /login (القسم 2.5). ده فحص سريع بس — الخادم هو المرجع.
const PUBLIC = ["/login", "/reset-password"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isPublic && !hasSession) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (isPublic && hasSession && pathname !== "/reset-password") return NextResponse.redirect(new URL(HOME_PATH, req.url));
  if (pathname === "/login/verify" && !req.cookies.has(PENDING_COOKIE)) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|icons|favicon.ico|.*\\.(?:svg|png|jpg|webp|woff2)$).*)"],
};
