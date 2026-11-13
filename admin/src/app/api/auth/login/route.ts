import { NextResponse } from "next/server";
import { PENDING_COOKIE } from "@/lib/session";

// تجريبي لحد ما الـAPI يجهز: أي بريد @linkar.sa أو @linkarksa.com وكلمة مرور 8 حروف أو أكتر.
// الخطأ مايقولش أنهي الحقلين غلط (CON5-L1).
export async function POST(req: Request) {
  const { email, password, remember } = (await req.json().catch(() => ({}))) as { email?: string; password?: string; remember?: boolean };
  const ok = typeof email === "string" && /^[^@\s]+@(linkar\.sa|linkarksa\.com)$/i.test(email.trim()) && typeof password === "string" && password.length >= 8;
  if (!ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PENDING_COOKIE, JSON.stringify({ email: email!.trim(), remember: !!remember }), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
