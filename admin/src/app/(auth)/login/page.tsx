import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

// CON5-L1 · تسجيل الدخول (3114-28801)
export default function LoginPage() {
  return (
    <>
      <h1 className="text-24 font-bold text-ink">تسجيل الدخول</h1>
      <p className="mt-2 text-13 text-muted">لفريق لينكار فقط · ادخل ببريدك المؤسسي وكلمة المرور.</p>
      <LoginForm />
    </>
  );
}
