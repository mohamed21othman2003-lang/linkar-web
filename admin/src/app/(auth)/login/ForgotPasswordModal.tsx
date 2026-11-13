"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

// CON5-L0 · استعادة كلمة المرور (3114-31788): نافذة فوق صفحة الدخول.
// بعد «إرسال الرابط» تظهر «أُرسل رابط الاستعادة» دايماً، حتى لو البريد مش مسجّل (لأسباب أمنية).
export function ForgotPasswordModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("أدخل بريداً صحيحاً");
    setBusy(true);
    await api.auth.forgotPassword(email.trim());
    setBusy(false);
    onOpenChange(false);
    setEmail("");
    toast("أُرسل رابط الاستعادة", "تفقّد بريدك، الرابط صالح 30 دقيقة.");
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        setError(undefined);
      }}
      title="استعادة كلمة المرور"
      description="نرسل رابط إعادة التعيين إلى بريدك في لينكار"
      footer={
        <>
          <Button variant="accent" size="L" loading={busy} onClick={send}>
            إرسال الرابط
          </Button>
          <Button variant="secondary" size="L" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <Field label="البريد الإلكتروني" error={error} hint="الرابط صالح 30 دقيقة. لو ما وصلك تواصل مع مدير النظام.">
        {(id) => <TextInput id={id} type="email" ltr placeholder="n.alqahtani@linkarksa.com" value={email} invalid={!!error} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />}
      </Field>
    </Modal>
  );
}
