"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, PasswordToggle, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { withBase } from "@/lib/base-path";

const schema = z.object({
  email: z.string().trim().min(1, "أدخل البريد المؤسسي").email("أدخل بريداً صحيحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [forgot, setForgot] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
    // «تذكّرني» مطفي افتراضياً — لوحة موظفين
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = handleSubmit(async (v) => {
    setServerError(undefined);
    const res = await fetch(withBase("/api/auth/login"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
    // عند الخطأ: رسالة تحت الحقول من غير ما نقول أنهي واحد غلط
    if (!res.ok) return setServerError("البريد أو كلمة المرور غير صحيحة.");
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(`/login/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  });

  const { errors, isSubmitting } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="mt-[18px] flex flex-col gap-[18px]">
      <Field required strong label="البريد المؤسسي" error={errors.email?.message}>
        {(id) => <TextInput id={id} type="email" size="L" autoComplete="username" ltr placeholder="name@linkar.sa" icon={<Icon name="mail" size={18} />} invalid={!!errors.email || !!serverError} {...register("email")} />}
      </Field>
      <Field required
        strong
        label="كلمة المرور"
        error={errors.password?.message ?? serverError}
        aside={
          <button type="button" onClick={() => setForgot(true)} className="hit-44 text-13 text-success hover:underline">
            نسيت كلمة المرور؟
          </button>
        }
      >
        {(id) => (
          <TextInput
            id={id}
            type={showPass ? "text" : "password"}
            size="L"
            autoComplete="current-password"
            placeholder="أدخل كلمة المرور"
            icon={<Icon name="lock" size={18} />}
            end={<PasswordToggle shown={showPass} onToggle={() => setShowPass((v) => !v)} />}
            invalid={!!errors.password || !!serverError}
            {...register("password")}
          />
        )}
      </Field>
      <Checkbox label="تذكّرني على هذا الجهاز" {...register("remember")} />
      <Button type="submit" size="L" loading={isSubmitting} className="w-full">
        تسجيل الدخول
      </Button>
      {/* key: يتعبّى البريد من جديد مع كل فتح */}
      <ForgotPasswordModal key={String(forgot)} open={forgot} onOpenChange={setForgot} defaultEmail={forgot ? getValues("email").trim() : ""} />
    </form>
  );
}
