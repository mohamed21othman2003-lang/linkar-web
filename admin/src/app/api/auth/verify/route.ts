import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PENDING_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// تجريبي: أي رمز من 6 أرقام (أو رمز استرداد من 10 حروف/أرقام) — ماعدا 000000 للتجربة على رسالة الخطأ.
export async function POST(req: Request) {
  const jar = await cookies();
  const pending = jar.get(PENDING_COOKIE)?.value;
  if (!pending) return NextResponse.json({ error: "expired" }, { status: 401 });
  const { code, recovery } = (await req.json().catch(() => ({}))) as { code?: string; recovery?: boolean };
  const clean = String(code ?? "").replace(/\s/g, "");
  const ok = recovery ? /^[A-Za-z0-9-]{8,12}$/.test(clean) : /^\d{6}$/.test(clean) && clean !== "000000";
  if (!ok) return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  const { remember } = JSON.parse(pending) as { email: string; remember: boolean };
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(PENDING_COOKIE);
  res.cookies.set(SESSION_COOKIE, "demo", { httpOnly: true, sameSite: "lax", path: "/", maxAge: remember ? SESSION_MAX_AGE.remember : SESSION_MAX_AGE.default });
  return res;
}
