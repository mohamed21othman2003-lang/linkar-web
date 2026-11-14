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
    toast("أُرسل رابط الاستعادة", "أرسلنا رابط إعادة التعيين إلى بريدك");
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        setError(undefined);
      }}
      title="استعادة كلمة المرور"
      subtitle="نرسل رابط إعادة التعيين إلى بريدك في لينكار"
      width={480}
      footer={
        <>
          <Button variant="accent" size="M" className="h-[46px]" loading={busy} onClick={send}>
            إرسال الرابط
          </Button>
          <Button variant="secondary" size="M" className="h-[46px]" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <Field required label="البريد الإلكتروني" error={error}>
        {(id) => <TextInput id={id} type="email" ltr className="h-[42px]!" placeholder="n.alqahtani@linkarksa.com" value={email} invalid={!!error} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />}
      </Field>
      {/* سطر مستقل تحت الحقل (12/18 Light · مسافة 14) زي 3114:31788 */}
      <p className="text-12 leading-[18px] font-light text-muted">الرابط صالح 30 دقيقة. لو ما وصلك تواصل مع مدير النظام.</p>
    </Modal>
  );
}
