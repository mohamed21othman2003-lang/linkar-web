"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { EXTEND_OPTIONS, extendLabel, type Voucher } from "@/lib/api/agency-vouchers";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../../providers/_components/form-bits";
import { DKV, DTile, Hero } from "./bits";

// CON5-09V · درج القسيمة ?voucher=BK-… | LK-… — 26 إطار بنفس المكوّن:
//   بانتظار الزيارة BK-21478…21487 (3114:7381 … 7948): إرسال القسيمة (T0920) · تغيير العميل · إلغاء القسيمة
//   تنتهي قريباً LK-WWU8-G7CY … LK-Y4DP-UAEV (3114:8011 … 8438): تذكير العميل (T0923) · تمديد الصلاحية
//   مستخدمة BK-21304 / 21381 / 21380 / 21408 / 21372 / 21373 / 21363 / 21303 (3114:8499 … 8921): بطاقة «الاستخدام» (+ «عرض الحجز» لـBK-21408)
// النوافذ فوق الدرج ?modal=v-change | v-cancel | v-extend:
//   CON5-09M · تغيير العميل · BK-… (3114:8981 … 9269) → T0921 · إلغاء القسيمة · BK-… (9301 … 9535) → T0922
//   تمديد الصلاحية · LK-… (9561 … 9869) → T0924
const PILL: Record<Voucher["state"], { label: string; cls: string }> = {
  pending: { label: "بانتظار الزيارة", cls: "bg-warning-tint text-[#9a6b00]" },
  expiring: { label: "تنتهي قريباً", cls: "bg-warning-tint text-[#9a6b00]" },
  used: { label: "مستخدمة", cls: "bg-success-tint text-success" },
  cancelled: { label: "ملغاة", cls: "bg-[#f8e9e9] text-danger" },
};

export function VoucherDrawer() {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const key = url.get("voucher");
  const q = useQuery({ queryKey: ["agencies", "voucher", key], queryFn: () => api.agencyVouchers.get(key!), enabled: !!key, retry: false });
  const v = q.data;
  const ag = useQuery({ queryKey: ["agencies", "one", v?.agencyId], queryFn: () => api.agencies.get(v!.agencyId), enabled: !!v });
  const act = useMutation({
    mutationFn: (k: "send" | "remind") => (k === "send" ? api.agencyVouchers.send(key!) : api.agencyVouchers.remind(key!)),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      toast("القسيمة", r.toast);
    },
  });
  return (
    <>
      <Drawer
        open={!!key}
        onOpenChange={(o) => !o && url.replace({ voucher: null, modal: null })}
        title={v ? `القسيمة ${v.code}` : "القسيمة"}
        subtitle={v ? <bdi>{v.booking ? `${v.booking} · ${v.po}` : v.po}</bdi> : " "}
        footer={
          !v ? null : v.state === "pending" ? (
            <>
              <Button loading={act.isPending} onClick={() => act.mutate("send")}>
                إرسال القسيمة
              </Button>
              <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "v-change" })}>
                تغيير العميل
              </Button>
              <Button variant="secondary" className="h-[50px]! text-danger-strong!" onClick={() => url.push({ modal: "v-cancel" })}>
                إلغاء القسيمة
              </Button>
            </>
          ) : v.state === "expiring" ? (
            <>
              <Button loading={act.isPending} onClick={() => act.mutate("remind")}>
                تذكير العميل
              </Button>
              <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "v-extend" })}>
                تمديد الصلاحية
              </Button>
            </>
          ) : v.bookingLink && v.booking ? (
            <Button variant="secondary" className="h-[50px]!" onClick={() => router.push(`/bookings?booking=${v.booking}`)}>
              عرض الحجز
            </Button>
          ) : null
        }
      >
        {q.isError ? (
          <p className="py-10 text-center text-13 text-muted">تعذّر تحميل القسيمة.</p>
        ) : !v ? (
          <>
            <Skeleton className="h-[88px] w-full rounded-16" />
            <Skeleton className="h-[164px] w-full rounded-12" />
            <Skeleton className="h-[202px] w-full rounded-12" />
          </>
        ) : (
          <>
            <Hero
              radius={16}
              icon="qr"
              title={v.title}
              sub={v.center}
              subClass="text-[#c9d1cd]"
              pill={<span className={`inline-flex h-[22px] shrink-0 items-center rounded-8 px-2 text-12 font-medium whitespace-nowrap ${PILL[v.state].cls}`}>{PILL[v.state].label}</span>}
            />
            <DTile title="العميل" gap={6} r12>
              <DKV k="الاسم" pad>
                {v.customer}
              </DKV>
              <DKV k="الجوال" pad>
                <bdi>{v.phone}</bdi>
              </DKV>
              <DKV k="السيارة" pad>
                {v.car}
              </DKV>
            </DTile>
            <DTile title="البيع" gap={6} r12>
              <DKV k="الوكالة" pad>
                {ag.data ? `${ag.data.name} · ${ag.data.id}` : "…"}
              </DKV>
              <DKV k="الطلب" pad>
                <button type="button" className="hover:underline" onClick={() => url.push({ voucher: null, po: v.po.startsWith("PO-2026-00") ? null : v.po })}>
                  {v.poLine}
                </button>
              </DKV>
              <DKV k="فرع الوكالة والمندوب" pad>
                {v.rep}
              </DKV>
              <DKV k="سعر الوكالة · شامل الضريبة" pad>
                {v.price}
              </DKV>
            </DTile>
            {v.usage ? (
              <DTile title="الاستخدام" gap={6} r12>
                <DKV k="التاريخ" pad>
                  {v.usage.date}
                </DKV>
                <DKV k="الفرع" pad>
                  {v.usage.branch}
                </DKV>
                <DKV k="العنوان" pad>
                  {v.usage.address}
                </DKV>
                <DKV k="التحقق" pad>
                  مُسحت القسيمة في الفرع
                </DKV>
              </DTile>
            ) : (
              <DTile title="الحالة" gap={6} r12>
                <DKV k="صدرت" pad>
                  {v.issued}
                </DKV>
                <DKV k="الرسالة" pad>
                  {v.message}
                </DKV>
                <DKV k="صالحة حتى" pad>
                  {v.state === "cancelled" ? "أُلغيت · إشعار دائن في كشف الوكالة" : v.validUntil}
                </DKV>
              </DTile>
            )}
          </>
        )}
      </Drawer>
      {v ? <VoucherModals v={v} agency={ag.data?.name ?? ""} /> : null}
    </>
  );
}

const err = (e: unknown, k: string) => (isApiError(e) ? e.fields?.[k] : undefined);

function VoucherModals({ v, agency }: { v: Voucher; agency: string }) {
  const url = useUrlState();
  const modal = url.get("modal");
  if (modal === "v-change" && v.state === "pending") return <ChangeModal v={v} />;
  if (modal === "v-cancel" && v.state === "pending") return <CancelModal v={v} agency={agency} />;
  if (modal === "v-extend" && v.state === "expiring") return <ExtendModal v={v} />;
  return null;
}

function useDone() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string) => {
    qc.invalidateQueries({ queryKey: ["agencies"] });
    url.replace({ modal: null });
    toast("القسيمة", t);
  };
}

function Shell({ title, children, primary, onPrimary, loading, danger }: { title: string; children: ReactNode; primary: string; onPrimary: () => void; loading?: boolean; danger?: boolean }) {
  const url = useUrlState();
  const close = () => url.replace({ modal: null });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={500} title={title}>
      {children}
      <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
        <Button variant={danger ? "danger" : "primary"} loading={loading} onClick={onPrimary}>
          {primary}
        </Button>
        <Button variant="secondary" className="h-[50px]!" onClick={close}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── تغيير عميل القسيمة (3114:8981) ─────────────
function ChangeModal({ v }: { v: Voucher }) {
  const done = useDone();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const m = useMutation({ mutationFn: () => api.agencyVouchers.changeCustomer(v.key, { name, phone, reason }), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title="تغيير عميل القسيمة" primary="تغيير العميل وإرسال القسيمة" onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="القسيمة" pad>
        {v.code} · {v.booking}
      </DKV>
      <DKV k="العميل الحالي" pad>
        {v.customer} · <bdi>{v.phone}</bdi>
      </DKV>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="اسم العميل الجديد" error={err(m.error, "name")}>
          {(id) => <TextInput id={id} value={name} placeholder="اكتب الاسم" invalid={!!err(m.error, "name")} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Field label="جوال العميل الجديد" error={err(m.error, "phone")}>
          {(id) => <TextInput id={id} value={phone} ltr inputMode="tel" placeholder="05X XXX XXXX" invalid={!!err(m.error, "phone")} onChange={(e) => setPhone(e.target.value)} />}
        </Field>
      </div>
      <Field label="السبب" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} placeholder="اكتب السبب" invalid={!!err(m.error, "reason")} className="h-[76px]! placeholder:font-light" />}
      </Field>
    </Shell>
  );
}

// ───────────── إلغاء القسيمة (3114:9301) ─────────────
function CancelModal({ v, agency }: { v: Voucher; agency: string }) {
  const done = useDone();
  const [reason, setReason] = useState("");
  const m = useMutation({ mutationFn: () => api.agencyVouchers.cancel(v.key, reason), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title="إلغاء القسيمة" primary="إلغاء القسيمة" danger onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="القسيمة" pad>
        {v.code} · {v.booking}
      </DKV>
      <DKV k="العميل" pad>
        {v.customer}
      </DKV>
      <DKV k="الإشعار الدائن" pad>
        {v.price} · كشف أكتوبر · {agency}
      </DKV>
      <Field label="السبب" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} placeholder="اكتب السبب" invalid={!!err(m.error, "reason")} className="h-[76px]! placeholder:font-light" />}
      </Field>
    </Shell>
  );
}

// ───────────── تمديد صلاحية القسيمة (3114:9561) ─────────────
function ExtendModal({ v }: { v: Voucher }) {
  const done = useDone();
  const [days, setDays] = useState(EXTEND_OPTIONS[0]);
  const [reason, setReason] = useState("");
  const m = useMutation({ mutationFn: () => api.agencyVouchers.extend(v.key, days, reason), onSuccess: (r) => done(r.toast) });
  return (
    <Shell title="تمديد صلاحية القسيمة" primary="تمديد الصلاحية" onPrimary={() => m.mutate()} loading={m.isPending}>
      <DKV k="القسيمة" pad>
        {v.code} · {v.po}
      </DKV>
      <DKV k="العميل" pad>
        {v.customer}
      </DKV>
      <DKV k="صالحة حتى" pad>
        {v.validUntil.split(" · ")[0]}
      </DKV>
      <div role="radiogroup" aria-label="مدة التمديد" className="flex flex-col gap-2">
        <span className="text-12 leading-5 font-medium text-muted">مدة التمديد</span>
        {EXTEND_OPTIONS.map((d) => {
          const on = d === days;
          return (
            <button key={d} type="button" role="radio" aria-checked={on} onClick={() => setDays(d)} className={`flex items-center gap-2.5 rounded-12 border p-3 text-start ${on ? "border-ink bg-lime-tint" : "border-border hover:bg-surface-1"}`}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-13 leading-[22px] font-semibold text-ink">{`‏${d} يوماً`}</span>
                {on ? <span className="text-12 leading-5 font-light text-muted">{extendLabel(v.validIso, d)}</span> : null}
              </span>
              <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? "border-ink" : "border-border-strong"}`}>{on ? <span className="size-2.5 rounded-full bg-ink" /> : null}</span>
            </button>
          );
        })}
      </div>
      <Field label="السبب" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} placeholder="اكتب السبب" invalid={!!err(m.error, "reason")} className="h-[76px]! placeholder:font-light" />}
      </Field>
    </Shell>
  );
}
