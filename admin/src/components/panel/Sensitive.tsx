"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ApiError, isApiError } from "@/lib/api";

// الصلاحية الحساسة (القسم 2.5): لو رد الخادم 428 تفتح نافذة «رمز التحقق» ونعيد نفس الطلب بالرمز.
// الاستخدام:
//   const sensitive = useSensitive();
//   mutationFn: (v) => sensitive.run((otp) => api.roles.save(id, v, otp), { title, description, confirmLabel })
//   …و {sensitive.modal} جوه الشاشة. لو المستخدم لغى: الوعد بيترفض بـ ApiError(499) — `isCancelled(e)` يتجاهله.
export type OtpCopy = { title: string; description: string; confirmLabel: string };

type Pending = { copy: OtpCopy; attempt: (otp: string) => Promise<unknown>; resolve: (v: unknown) => void; reject: (e: unknown) => void };

export const isCancelled = (e: unknown) => isApiError(e, 499);

export function useSensitive() {
  const [pending, setPending] = useState<Pending | null>(null);

  const run = useCallback(async <T,>(fn: (otp?: string) => Promise<T>, copy: OtpCopy): Promise<T> => {
    try {
      return await fn(undefined);
    } catch (e) {
      if (!isApiError(e, 428)) throw e;
      return new Promise<T>((resolve, reject) => setPending({ copy, attempt: fn, resolve: resolve as (v: unknown) => void, reject }));
    }
  }, []);

  const modal = pending ? (
    <OtpModal
      key={pending.copy.title}
      copy={pending.copy}
      onSubmit={async (otp) => {
        const res = await pending.attempt(otp);
        pending.resolve(res);
        setPending(null);
      }}
      onCancel={() => {
        pending.reject(new ApiError(499, "cancelled"));
        setPending(null);
      }}
    />
  ) : null;

  return { run, modal };
}

// CON5-23M · رمز التحقق (3114-25289): 440 عرض · نص 13 Light رمادي · حقل «رمز التحقق» · «تأكيد وحفظ» + «إلغاء»
function OtpModal({ copy, onSubmit, onCancel }: { copy: OtpCopy; onSubmit: (otp: string) => Promise<void>; onCancel: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) return setError("أدخل الرمز المكوّن من 6 أرقام");
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(digits);
    } catch (err) {
      setError(isApiError(err) ? (err.fields?.otp ?? "تعذّر التحقق، حاول مرة أخرى") : "تعذّر التحقق، حاول مرة أخرى");
      setBusy(false);
    }
  };

  return (
    <Modal open onOpenChange={(o) => !o && !busy && onCancel()} title={copy.title} description={copy.description} width={440}>
      <form onSubmit={submit} className="flex flex-col gap-3.5" noValidate>
        <Field label="رمز التحقق" error={error}>
          {(id) => (
            <TextInput
              id={id}
              ltr
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              invalid={!!error}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d);
              }}
              placeholder="000 000"
              className="num"
            />
          )}
        </Field>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button type="submit" loading={busy}>
            {copy.confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}
