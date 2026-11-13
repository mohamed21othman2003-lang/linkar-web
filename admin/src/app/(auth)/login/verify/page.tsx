"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { HOME_PATH } from "@/lib/session";

// CON5-L2 · رمز التحقق (3114-28858): حقل واحد بفاصل «482 913». «استخدم رمز الاسترداد» يبدّل الحقل لرمز الاسترداد.
// بعد «تأكيد الدخول» → مقدمو الخدمة في المرحلة الأولى.
function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [recovery, setRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const format = (v: string) => (recovery ? v.toUpperCase().slice(0, 12) : v.replace(/\D/g, "").slice(0, 6).replace(/^(\d{3})(\d)/, "$1 $2"));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setBusy(true);
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, recovery }) });
    setBusy(false);
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) return setError(recovery ? "رمز الاسترداد غير صحيح." : "الرمز غير صحيح أو انتهت صلاحيته.");
    const next = params.get("next");
    router.replace(next && next.startsWith("/") ? next : HOME_PATH);
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="mt-[18px] flex flex-col gap-[18px]">
      <Field strong label={recovery ? "رمز الاسترداد" : "رمز التحقق"} error={error}>
        {(id) => (
          <TextInput
            id={id}
            autoFocus
            size="L"
            inputMode={recovery ? "text" : "numeric"}
            autoComplete="one-time-code"
            ltr
            placeholder={recovery ? "XXXX-XXXX" : "482 913"}
            icon={<Icon name="lock" size={18} />}
            invalid={!!error}
            value={code}
            onChange={(e) => setCode(format(e.target.value))}
          />
        )}
      </Field>
      <button
        type="button"
        onClick={() => {
          setRecovery((r) => !r);
          setCode("");
          setError(undefined);
        }}
        className="self-start text-13 font-medium text-ink hover:underline"
      >
        {recovery ? "استخدم رمز تطبيق المصادقة" : "لم يصلك الرمز؟ استخدم رمز الاسترداد"}
      </button>
      <Button type="submit" size="L" loading={busy} className="w-full">
        تأكيد الدخول
      </Button>
    </form>
  );
}

export default function VerifyPage() {
  return (
    <>
      <h1 className="text-24 font-bold text-ink">رمز التحقق</h1>
      <p className="mt-1.5 text-14 font-light text-muted">أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.</p>
      <Suspense>
        <VerifyForm />
      </Suspense>
    </>
  );
}
