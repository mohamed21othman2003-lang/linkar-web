"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { InfoNote } from "@/components/ui/Modal";
import { api } from "@/lib/api";

// تعيين كلمة مرور جديدة (/reset-password?token=) — مش مرسومة للوحة لينكار (القسم 18.2)،
// شكلها مستعار من شاشة لوحة المزوّد SPD-01d ومن نافذة تغيير كلمة المرور CON5-24M. لازم تتعرض على المصمم.
function ResetForm() {
  const token = useSearchParams().get("token");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ pw?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) return <InfoNote>الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من صفحة الدخول.</InfoNote>;
  if (done)
    return (
      <div className="mt-[18px] flex flex-col gap-[18px]">
        <InfoNote>تغيّرت كلمة المرور. ادخل بكلمة المرور الجديدة.</InfoNote>
        <Link href="/login" className="inline-flex h-[52px] items-center justify-center rounded-12 bg-ink text-16 font-bold text-white">
          تسجيل الدخول
        </Link>
      </div>
    );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (pw.length < 12) next.pw = "12 حرفاً على الأقل";
    if (confirm !== pw) next.confirm = "كلمتا المرور غير متطابقتين";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    await api.auth.resetPassword(token!, pw);
    setBusy(false);
    setDone(true);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-[18px] flex flex-col gap-[18px]">
      <Field strong label="كلمة المرور الجديدة" error={errors.pw}>
        {(id) => <TextInput id={id} type="password" autoComplete="new-password" placeholder="••••••••••••" value={pw} invalid={!!errors.pw} onChange={(e) => setPw(e.target.value)} />}
      </Field>
      <Field strong label="تأكيد كلمة المرور" error={errors.confirm}>
        {(id) => <TextInput id={id} type="password" autoComplete="new-password" placeholder="••••••••••••" value={confirm} invalid={!!errors.confirm} onChange={(e) => setConfirm(e.target.value)} />}
      </Field>
      <InfoNote>12 حرفاً على الأقل، وتُغلق الجلسات الأخرى بعد التغيير.</InfoNote>
      <Button type="submit" size="L" loading={busy} className="w-full">
        حفظ كلمة المرور
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-24 font-bold text-ink">تعيين كلمة مرور جديدة</h1>
      <p className="mt-1.5 text-14 font-light text-muted">اختر كلمة مرور جديدة لحسابك في لوحة تحكم لينكار.</p>
      <Suspense>
        <ResetForm />
      </Suspense>
    </>
  );
}
