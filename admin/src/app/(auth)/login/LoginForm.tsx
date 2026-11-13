"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

const schema = z.object({
  email: z.string().trim().min(1, "أدخل البريد المؤسسي").email("أدخل بريداً صحيحاً"),
  password: z.string().min(1, "أدخل كلمة المرور"),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [forgot, setForgot] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = handleSubmit(async (v) => {
    setServerError(undefined);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
    // عند الخطأ: رسالة تحت الحقول من غير ما نقول أنهي واحد غلط
    if (!res.ok) return setServerError("البريد أو كلمة المرور غير صحيحة.");
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(`/login/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  });

  const { errors, isSubmitting } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="mt-[18px] flex flex-col gap-[18px]">
      <Field strong label="البريد المؤسسي" error={errors.email?.message}>
        {(id) => <TextInput id={id} type="email" size="L" autoComplete="username" ltr placeholder="name@linkar.sa" icon={<Icon name="mail" size={18} />} invalid={!!errors.email || !!serverError} {...register("email")} />}
      </Field>
      <Field
        strong
        label="كلمة المرور"
        error={errors.password?.message ?? serverError}
        aside={
          <button type="button" onClick={() => setForgot(true)} className="text-13 text-success hover:underline">
            نسيت كلمة المرور؟
          </button>
        }
      >
        {(id) => <TextInput id={id} type="password" size="L" autoComplete="current-password" placeholder="••••••••" icon={<Icon name="lock" size={18} />} invalid={!!errors.password || !!serverError} {...register("password")} />}
      </Field>
      <Checkbox label="تذكّرني على هذا الجهاز" {...register("remember")} />
      <Button type="submit" size="L" loading={isSubmitting} className="w-full">
        تسجيل الدخول
      </Button>
      <ForgotPasswordModal open={forgot} onOpenChange={setForgot} />
    </form>
  );
}
