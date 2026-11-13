"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Card } from "@/components/panel/PageHead";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { InfoNote, Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { arDate, relative } from "@/lib/format";
import { useMe } from "@/lib/use-me";

type Dialog = null | "password" | "mfa" | "logout-all";

export function AccountView() {
  const { data: me } = useMe();
  const sessions = useQuery({ queryKey: ["me", "sessions"], queryFn: api.me.sessions });
  const [dialog, setDialog] = useState<Dialog>(null);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
      {/* بطاقة الملف */}
      <section className="self-start lg:row-span-2 rounded-16 border border-border bg-white p-5">
        {me ? (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-lime text-24 font-bold text-ink">{me.initial}</span>
            <h2 className="mt-3 text-18 font-bold text-ink">{me.name}</h2>
            <p className="mt-3 text-13 font-light text-muted">
              {me.role} · {me.scope}
            </p>
            <dl className="mt-3 flex flex-col gap-3">
              <KV k="البريد" v={<span dir="ltr">{me.email}</span>} />
              <KV k="الجوال" v={<span dir="ltr" className="num">{me.phoneMasked}</span>} />
              <KV k="عضو منذ" v={arDate(me.memberSince)} />
            </dl>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <Skeleton className="size-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        )}
      </section>

      {/* الأمان */}
      <Card title="الأمان">
        <div className="flex flex-col gap-3">
          <Row label="كلمة المرور">
            {me ? <span className="text-13 font-light text-muted">{me.passwordChangedDaysAgo ? `آخر تغيير قبل ${me.passwordChangedDaysAgo} يوماً` : "تغيّرت اليوم"}</span> : null}
            <Button variant="secondary" size="S" onClick={() => setDialog("password")}>
              تغيير
            </Button>
          </Row>
          <Row label="التحقق بخطوتين">
            {me?.mfa.enabled ? <Badge tone="success">مفعّل · {me.mfa.method}</Badge> : null}
            <Button variant="secondary" size="S" onClick={() => setDialog("mfa")}>
              إعادة الضبط
            </Button>
          </Row>
        </div>
      </Card>

      {/* الجلسات النشطة */}
      <Card title="الجلسات النشطة">
        <div className="flex flex-col gap-3">
          {sessions.data
            ? sessions.data.map((s) => (
                <Row key={s.id} label={<span className="text-13 font-light text-muted">{s.device} · {s.city}</span>}>
                  <span className="text-13 font-medium text-ink">{s.current ? "هذا الجهاز" : relative(s.lastSeen)}</span>
                </Row>
              ))
            : [0, 1].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
          <Button variant="danger-outline" size="S" className="ms-auto mt-1" onClick={() => setDialog("logout-all")} disabled={(sessions.data?.length ?? 0) < 2}>
            تسجيل الخروج من كل الأجهزة
          </Button>
        </div>
      </Card>

      <ChangePasswordModal open={dialog === "password"} onClose={() => setDialog(null)} />
      <ConfirmModal
        open={dialog === "mfa"}
        onClose={() => setDialog(null)}
        title="إعادة ضبط التحقق بخطوتين"
        body="سيُطلب منك ربط تطبيق المصادقة من جديد عند الدخول القادم."
        confirm="إعادة الضبط"
        run={api.me.resetMfa}
        toast={["أُعيد ضبط التحقق", "أُعيد ضبط التحقق بخطوتين"]}
      />
      <ConfirmModal
        open={dialog === "logout-all"}
        onClose={() => setDialog(null)}
        title="تسجيل الخروج من كل الأجهزة"
        body={`تُغلق ${twoOrMore(Math.max(0, (sessions.data?.length ?? 1) - 1))}، وتبقى في هذا الجهاز.`}
        confirm="تسجيل الخروج"
        run={api.me.logoutOtherDevices}
        invalidate={["me", "sessions"]}
        toast={["سُجّل الخروج", "سُجّل الخروج من الأجهزة الأخرى"]}
      />
    </div>
  );
}

const twoOrMore = (n: number) => (n === 1 ? "جلسة واحدة" : n === 2 ? "جلستان" : `${n} جلسات`);

function KV({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-13">
      <dt className="font-light text-muted">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-4">
      <span className="text-13 font-medium text-ink">{label}</span>
      <span className="flex items-center gap-2.5">{children}</span>
    </div>
  );
}

// CON5-24M · تغيير كلمة المرور (3114-28715)
function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState<Partial<typeof v>>({});
  const m = useMutation({
    mutationFn: () => api.me.changePassword(v.current, v.next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast("تغيّرت كلمة المرور", "تغيّرت كلمة المرور");
      setV({ current: "", next: "", confirm: "" });
      onClose();
    },
  });
  function save() {
    const e: Partial<typeof v> = {};
    if (!v.current) e.current = "أدخل كلمة المرور الحالية";
    if (v.next.length < 12) e.next = "12 حرفاً على الأقل";
    if (v.confirm !== v.next) e.confirm = "كلمتا المرور غير متطابقتين";
    setErr(e);
    if (!Object.keys(e).length) m.mutate();
  }
  const field = (key: keyof typeof v, label: string, auto: string) => (
    <Field label={label} error={err[key]}>
      {(id) => <TextInput id={id} type="password" autoComplete={auto} value={v[key]} invalid={!!err[key]} onChange={(e) => setV((s) => ({ ...s, [key]: e.target.value }))} />}
    </Field>
  );
  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="تغيير كلمة المرور"
      footer={
        <>
          <Button size="M" loading={m.isPending} onClick={save}>
            حفظ
          </Button>
          <Button variant="secondary" size="M" onClick={onClose}>
            إلغاء
          </Button>
        </>
      }
    >
      {field("current", "كلمة المرور الحالية", "current-password")}
      {field("next", "الجديدة", "new-password")}
      {field("confirm", "تأكيد الجديدة", "new-password")}
      <InfoNote>12 حرفاً على الأقل، وتُغلق الجلسات الأخرى بعد التغيير.</InfoNote>
    </Modal>
  );
}

// CON5-24M · إعادة ضبط التحقق (3114-28743) / تسجيل الخروج من كل الأجهزة (3114-28759) — زر خطر أحمر
function ConfirmModal({
  open,
  onClose,
  title,
  body,
  confirm,
  run,
  invalidate,
  toast: [tTitle, tBody],
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirm: string;
  run: () => Promise<unknown>;
  invalidate?: string[];
  toast: [string, string];
}) {
  const toast = useToast();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: run,
    onSuccess: () => {
      if (invalidate) qc.invalidateQueries({ queryKey: invalidate });
      toast(tTitle, tBody);
      onClose();
    },
  });
  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={title}
      description={body}
      footer={
        <>
          <Button variant="danger" size="M" loading={m.isPending} onClick={() => m.mutate()}>
            {confirm}
          </Button>
          <Button variant="secondary" size="M" onClick={onClose}>
            إلغاء
          </Button>
        </>
      }
    />
  );
}
