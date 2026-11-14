"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { audienceName, customersMutations, type Audience as ApiAudience, type Channel, type CustomerQuery } from "@/lib/api/customers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { couponsMutations, type CouponInput } from "@/lib/api/coupons";
import { Note, selectedLabel } from "./bits";
import { APPLIES_TO, COUPON, GIFT_CENTERS, GIFT_REASONS, GIFT_SERVICES, MSG_TYPES, OFFERS, OPEN_TARGETS, presetKey, PUSH, SEND_TIMES, SMS, smsCount, USAGE, VALIDITY, type MsgType } from "./presets";

// نوافذ الإرسال الجماعي (CON5-05M) من شريط التحديد — الجمهور = العملاء المحددون أو كل عملاء الشريحة/الفلتر:
// رسالة نصية (3114-20831 · 20925 · 21113 · 21207 · 21301 · 21395) → CON5-05T جُدولت الرسالة النصية (3114-20815)
// إشعار التطبيق (3114-20883 · 20977 · 21165 · 21259 · 21353 · 21447) → CON5-05T أُرسل الإشعار (3114-20819)
// كوبون أو هدية: كوبون خصم (3114-21489 · 21572 · 21738 · 21821 · 21904 · 21987) → أُرسل الكوبون (3114-20823)
//   · نقاط هدية (3114-22835 · 22975 · 23255 · 23395 · 23535 · 23675) · خدمة هدية (3114-22902 · 23042 · 23322 · 23462 · 23602 · 23742) → أُرسلت الهدية (3114-22831)
// «إرسال تجريبي لي» → أُرسلت نسخة تجريبية (3114-20827) · الرابط ?modal=sms|push|gift (&type=points|service)
export type Audience = { kind: "selected"; ids: string[]; names: string[] } | { kind: "view"; query: CustomerQuery; total: number };

export function BulkModals({ audience, onDone }: { audience: Audience; onDone: () => void }) {
  const url = useUrlState();
  const modal = url.get("modal");
  const close = () => url.replace({ modal: null, type: null });
  const count = audience.kind === "selected" ? audience.ids.length : audience.total;
  if (!count) return null;
  const props = { audience, count, onClose: close, onDone };
  return (
    <>
      {modal === "sms" ? <SmsModal key="sms" {...props} /> : null}
      {modal === "push" ? <PushModal key="push" {...props} /> : null}
      {modal === "gift" ? <GiftModal key="gift" {...props} type={(url.get("type") as GiftType) || "coupon"} onType={(t) => url.replace({ type: t === "coupon" ? null : t })} /> : null}
    </>
  );
}

type Props = { audience: Audience; count: number; onClose: () => void; onDone: () => void };

const recipients = (a: Audience) =>
  a.kind === "selected" ? `${selectedLabel(a.ids.length)}${a.names.length ? ` · ${a.names.join("، ")}` : ""}` : `${num(a.total)} عميلاً · ${audienceName(a.query)}`;
const apiAudience = (a: Audience): ApiAudience => (a.kind === "selected" ? { kind: "selected", ids: a.ids } : { kind: "view", query: a.query });

function useSend(channel: Channel, toastBody: string, after: () => void) {
  const toast = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { audience: Audience; payload: Record<string, unknown> }) => {
      const r = await customersMutations.send(channel, apiAudience(v.audience), v.payload);
      // الكوبون الجماعي يظهر في «الكوبونات» ويُتابع استخدامه هناك
      if (channel === "coupon") await couponsMutations.create(bulkCoupon(v.payload));
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["coupons"] });
      after();
      toast(toastBody.split(" · ")[0], toastBody);
    },
  });
}
const VALID_TO: Record<string, string> = { "حتى 30 نوفمبر 2026": "2026-11-30", "حتى 31 ديسمبر 2026": "2026-12-31", "حتى 31 يناير 2027": "2027-01-31" };
function bulkCoupon(p: Record<string, unknown>): CouponInput {
  const value = String(p.value ?? "");
  const applies = String(p.applies ?? "");
  const [scope, where = "كل المراكز"] = applies.split(" · ");
  const jn = scope.startsWith("خدمات جونسون") || scope.startsWith("جونسون");
  return {
    kind: "general",
    code: String(p.code ?? ""),
    discountType: value.includes("%") ? "percent" : "fixed",
    value: Number(value.replace(/[^\d]/g, "")) || 0,
    max: Number(String(p.max ?? "").replace(/[^\d]/g, "")) || undefined,
    centers: jn ? "جونسون Johnson" : where === "كل المراكز" ? "كل المراكز" : where,
    branches: applies.includes("فرع الزهراء") ? "فرع الزهراء" : "كل الفروع",
    services: jn || scope.startsWith("الحجز") ? "كل الخدمات" : scope,
    packages: scope === "الباقات فقط" ? "كل الباقات" : "بدون باقات",
    perUser: String(p.usage).startsWith("مرتان") ? 2 : 1,
    total: Number(p.count) || 1,
    from: "2026-10-14",
    to: VALID_TO[String(p.validity)] ?? "2026-11-30",
  };
}

function useTest(channel: Channel) {
  const toast = useToast();
  return useMutation({ mutationFn: () => customersMutations.test(channel), onSuccess: () => toast("أُرسلت نسخة تجريبية", "أُرسلت نسخة تجريبية إلى جوالك") });
}

// ───────────── عناصر النوافذ ─────────────
// حقل: العنوان 12/20 Medium رمادي · مسافة 6 · الصندوق 44 r10 بإطار · حشو 12 · نص 14/22 Regular · الأيقونة 16 على الشمال
function F({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-12 leading-5 font-medium text-muted">{label}</span>
      {children}
    </div>
  );
}
const BOX = "flex h-11 min-w-0 items-center gap-2 rounded-10 border border-border bg-white px-3 text-14 leading-[22px] font-normal text-ink";
function Box({ children, icon }: { children: ReactNode; icon?: UiGlyph }) {
  return (
    <div className={BOX}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {icon ? <Icon name={icon} size={16} className="shrink-0" /> : null}
    </div>
  );
}
function Input({ value, onChange, label, suffix, icon, ltr }: { value: string; onChange: (v: string) => void; label: string; suffix?: string; icon?: UiGlyph; ltr?: boolean }) {
  return (
    <label className={`${BOX} focus-within:border-[1.5px] focus-within:border-ink`}>
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} dir={ltr ? "ltr" : undefined} className={`num min-w-0 bg-transparent outline-none ${suffix ? "w-auto max-w-[60%] [field-sizing:content]" : "flex-1"} ${ltr ? "text-right" : ""}`} />
      {suffix ? <span className="flex-1">{suffix}</span> : null}
      {icon ? <Icon name={icon} size={16} className="shrink-0" /> : null}
    </label>
  );
}
function Pick({ value, onChange, options, label, icon }: { value: string; onChange: (v: string) => void; options: string[]; label: string; icon?: UiGlyph }) {
  return <Select ariaLabel={label} value={value} onChange={onChange} icon={icon} options={options.map((o) => ({ value: o, label: o }))} className="[&>span]:text-14 [&>span]:leading-[22px] [&>span]:font-normal" />;
}
function Recipients({ a }: { a: Audience }) {
  return (
    <F label="المستلمون">
      <Box icon="users">{ltrRuns(recipients(a))}</Box>
    </F>
  );
}
function Toggles({ push, sms, setPush, setSms }: { push: boolean; sms: boolean; setPush: (v: boolean) => void; setSms: (v: boolean) => void }) {
  const T = ({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) => (
    <label className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2.5">
      <span className="text-13 leading-5 font-medium text-ink">{label}</span>
      <Switch checked={on} onCheckedChange={set} label={label} />
    </label>
  );
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {T({ label: "إبلاغ العميل برسالة نصية", on: sms, set: setSms })}
      {T({ label: "إشعار في التطبيق", on: push, set: setPush })}
    </div>
  );
}
function Actions({ primary, secondary, onPrimary, onSecondary, loading, secondaryLoading }: { primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void; loading?: boolean; secondaryLoading?: boolean }) {
  return (
    <>
      <Button variant="accent" onClick={onPrimary} loading={loading} className="h-11">
        {primary}
      </Button>
      <Button variant="secondary" onClick={onSecondary} loading={secondaryLoading} disabled={loading} className="h-[46px]">
        {secondary}
      </Button>
    </>
  );
}

// ───────────── رسالة نصية ─────────────
function SmsModal({ audience, count, onClose, onDone }: Props) {
  const p = SMS[presetKey(audience)];
  const [type, setType] = useState<MsgType>(p.type);
  const [offer, setOffer] = useState(p.offer);
  const [text, setText] = useState(p.text);
  const [sender, setSender] = useState("LINKAR");
  const [time, setTime] = useState(SEND_TIMES[1]);
  const [err, setErr] = useState("");
  const send = useSend("sms", time === "الآن" ? "أُرسلت الرسالة النصية للعملاء المحددين" : "جُدولت الرسالة النصية · تصل للعملاء المحددين في الموعد", () => {
    onClose();
    onDone();
  });
  const test = useTest("sms");
  const submit = () => {
    if (!text.trim()) return setErr("اكتب نص الرسالة");
    send.mutate({ audience, payload: { type, offer, text, sender, time } });
  };
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !send.isPending && onClose()}
      title="رسالة نصية"
      subtitle="تُرسل باسم LINKAR · لا يظهر الإرسال لمقدّم الخدمة"
      width={560}
      footer={<Actions primary={time === "الآن" ? "إرسال الآن" : "جدولة الإرسال"} secondary="إرسال تجريبي لي" onPrimary={submit} onSecondary={() => test.mutate()} loading={send.isPending} secondaryLoading={test.isPending} />}
    >
      <Recipients a={audience} />
      <F label="نوع الرسالة">
        <div role="radiogroup" aria-label="نوع الرسالة" className="flex flex-row-reverse flex-wrap justify-end gap-1.5">
          {MSG_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              className={`h-9 rounded-full px-3.5 text-13 leading-5 font-medium ${type === t ? "bg-ink text-white" : "border border-border bg-white text-ink hover:bg-surface-1"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </F>
      <F label="العرض أو الباقة المرتبطة">
        <Pick label="العرض أو الباقة المرتبطة" value={offer} onChange={setOffer} options={OFFERS} />
      </F>
      <F label="نص الرسالة">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErr("");
          }}
          aria-label="نص الرسالة"
          aria-invalid={!!err || undefined}
          className={`h-[92px] resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink ${err ? "border-danger" : "border-border"}`}
        />
        {err ? <p role="alert" className="text-12 text-danger">{err}</p> : null}
      </F>
      <p className="num text-12 leading-[18px] font-light text-muted">{smsCount(text, text === p.text ? p.count : undefined)}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <F label="وقت الإرسال">
          <Pick label="وقت الإرسال" value={time} onChange={setTime} options={SEND_TIMES} icon="calendar" />
        </F>
        <F label="اسم المرسل">
          <Input label="اسم المرسل" value={sender} onChange={setSender} />
        </F>
      </div>
      <Note>{ltrRuns(p.note(count))}</Note>
    </Modal>
  );
}

// ───────────── إشعار في التطبيق ─────────────
function PushModal({ audience, count, onClose, onDone }: Props) {
  const p = PUSH[presetKey(audience)];
  const [title, setTitle] = useState(p.title);
  const [body, setBody] = useState(p.body);
  const [time, setTime] = useState(SEND_TIMES[0]);
  const [target, setTarget] = useState(p.target);
  const [err, setErr] = useState("");
  const send = useSend("push", "أُرسل الإشعار للعملاء المحددين في التطبيق", () => {
    onClose();
    onDone();
  });
  const test = useTest("push");
  const submit = () => {
    if (!title.trim() || !body.trim()) return setErr(!title.trim() ? "title" : "body");
    send.mutate({ audience, payload: { title, body, time, target } });
  };
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !send.isPending && onClose()}
      title="إشعار في التطبيق"
      subtitle="يظهر في تطبيق لينكار وفي «الإشعارات» على الموقع"
      width={560}
      footer={<Actions primary="إرسال الإشعار" secondary="إرسال تجريبي لي" onPrimary={submit} onSecondary={() => test.mutate()} loading={send.isPending} secondaryLoading={test.isPending} />}
    >
      <Recipients a={audience} />
      <F label="عنوان الإشعار">
        <Input label="عنوان الإشعار" value={title} onChange={(v) => (setTitle(v), setErr(""))} />
        {err === "title" ? <p role="alert" className="text-12 text-danger">اكتب عنوان الإشعار</p> : null}
      </F>
      <F label="نص الإشعار">
        <textarea
          value={body}
          onChange={(e) => (setBody(e.target.value), setErr(""))}
          aria-label="نص الإشعار"
          className={`h-[72px] resize-none rounded-10 border bg-white px-3 pt-2.5 text-14 leading-[22px] text-ink outline-none focus:border-[1.5px] focus:border-ink ${err === "body" ? "border-danger" : "border-border"}`}
        />
        {err === "body" ? <p role="alert" className="text-12 text-danger">اكتب نص الإشعار</p> : null}
      </F>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <F label="عند الضغط يفتح">
          <Pick label="عند الضغط يفتح" value={target} onChange={setTarget} options={OPEN_TARGETS} />
        </F>
        <F label="وقت الإرسال">
          <Pick label="وقت الإرسال" value={time} onChange={setTime} options={SEND_TIMES} />
        </F>
      </div>
      <Note>{ltrRuns(p.note(count))}</Note>
    </Modal>
  );
}

// ───────────── كوبون أو هدية ─────────────
type GiftType = "coupon" | "points" | "service";
const TYPES: { key: GiftType; title: string; sub: string }[] = [
  { key: "coupon", title: "كوبون خصم", sub: "نسبة أو مبلغ" },
  { key: "points", title: "نقاط هدية", sub: "تُضاف للرصيد" },
  { key: "service", title: "خدمة هدية", sub: "تدفع لينكار تكلفتها" },
];

function GiftModal({ audience, count, onClose, onDone, type, onType }: Props & { type: GiftType; onType: (t: GiftType) => void }) {
  const key = presetKey(audience);
  const c = COUPON[key];
  const [value, setValue] = useState(c.value);
  const [max, setMax] = useState(c.max);
  const [applies, setApplies] = useState(c.applies);
  const [validity, setValidity] = useState(VALIDITY[0]);
  const [code, setCode] = useState(c.code);
  const [usage, setUsage] = useState(USAGE[0]);
  const [points, setPoints] = useState("200");
  const [reason, setReason] = useState(GIFT_REASONS[0]);
  const [service, setService] = useState(GIFT_SERVICES[0]);
  const [center, setCenter] = useState(GIFT_CENTERS[0]);
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(true);
  const [err, setErr] = useState("");
  const after = () => {
    onClose();
    onDone();
  };
  const sendCoupon = useSend("coupon", "أُرسل الكوبون للعملاء المحددين · تتابع استخدامه من «الكوبونات»", after);
  const sendPoints = useSend("gift-points", "أُرسلت الهدية للعملاء المحددين · تصلهم برسالة نصية وإشعار", after);
  const sendService = useSend("gift-service", "أُرسلت الهدية للعملاء المحددين · تصلهم برسالة نصية وإشعار", after);
  const pending = sendCoupon.isPending || sendPoints.isPending || sendService.isPending;
  const pts = Number(points.replace(/[^\d]/g, "")) || 0;
  const submit = () => {
    if (type === "coupon") {
      if (!value.trim()) return setErr("value");
      if (!/^[A-Za-z0-9]{3,16}$/.test(code)) return setErr("code");
      sendCoupon.mutate({ audience, payload: { value, max, applies, validity, code: code.toUpperCase(), usage, push, sms, count } });
    } else if (type === "points") {
      if (!pts) return setErr("points");
      sendPoints.mutate({ audience, payload: { points: pts, reason, push, sms } });
    } else sendService.mutate({ audience, payload: { service, center, validity, push, sms } });
  };
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !pending && onClose()}
      title="كوبون أو هدية"
      subtitle="الخصم من هامش لينكار · لا يتغيّر سعر التكلفة لمقدّم الخدمة"
      width={600}
      footer={<Actions primary={type === "coupon" ? "إرسال الكوبون" : "إرسال الهدية"} secondary="إلغاء" onPrimary={submit} onSecondary={onClose} loading={pending} />}
    >
      <Recipients a={audience} />
      <F label="النوع">
        <div role="radiogroup" aria-label="النوع" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TYPES.map((t) => {
            const on = t.key === type;
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => (onType(t.key), setErr(""))}
                className={`flex items-start gap-2.5 rounded-12 px-3.5 py-3 text-start ${on ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white hover:bg-surface-1"}`}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`text-14 leading-[22px] text-ink ${on ? "font-semibold" : "font-medium"}`}>{t.title}</span>
                  <span className="text-12 leading-[18px] font-light text-muted">{t.sub}</span>
                </span>
                <span className={`size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
              </button>
            );
          })}
        </div>
      </F>
      {type === "coupon" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="القيمة">
              <Input label="القيمة" value={value} onChange={(v) => (setValue(v), setErr(""))} />
              {err === "value" ? <p role="alert" className="text-12 text-danger">أدخل قيمة الخصم</p> : null}
            </F>
            <F label="الحد الأقصى للخصم">
              <Input label="الحد الأقصى للخصم" value={max} onChange={setMax} />
            </F>
          </div>
          <F label="يسري على">
            <Pick label="يسري على" value={applies} onChange={setApplies} options={APPLIES_TO} />
          </F>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="الكود">
              <Input label="الكود" value={code} onChange={(v) => (setCode(v.toUpperCase()), setErr(""))} icon="copy" ltr />
              {err === "code" ? <p role="alert" className="text-12 text-danger">الكود من 3 إلى 16 حرفاً إنجليزياً أو رقماً</p> : null}
            </F>
            <F label="الصلاحية">
              <Pick label="الصلاحية" value={validity} onChange={setValidity} options={VALIDITY} icon="calendar" />
            </F>
          </div>
          <F label="الاستخدام">
            <Pick label="الاستخدام" value={usage} onChange={setUsage} options={USAGE} />
          </F>
          <Toggles push={push} sms={sms} setPush={setPush} setSms={setSms} />
          <Note>يظهر الكوبون في «الكوبونات» ويُتابع استخدامه هناك. يمكن إيقافه في أي وقت.</Note>
        </>
      ) : type === "points" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="النقاط لكل عميل">
              <Input label="النقاط لكل عميل" value={points} onChange={(v) => (setPoints(v.replace(/[^\d]/g, "")), setErr(""))} suffix="نقطة" />
              {err === "points" ? <p role="alert" className="text-12 text-danger">أدخل عدد النقاط</p> : null}
            </F>
            <F label="السبب">
              <Pick label="السبب" value={reason} onChange={setReason} options={GIFT_REASONS} />
            </F>
          </div>
          <F label="صلاحية النقاط">
            <Box>حسب سياسة النقاط · 12 شهراً من الإضافة</Box>
          </F>
          <Toggles push={push} sms={sms} setPush={setPush} setSms={setSms} />
          <Note>{`إجمالي النقاط الممنوحة ${num(pts * count)} نقطة · تظهر في «النقاط والإحالة» وفي حساب كل عميل.`}</Note>
        </>
      ) : (
        <>
          <F label="الخدمة">
            <Pick label="الخدمة" value={service} onChange={setService} options={GIFT_SERVICES} />
          </F>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <F label="المركز">
              <Pick label="المركز" value={center} onChange={setCenter} options={GIFT_CENTERS} />
            </F>
            <F label="الصلاحية">
              <Pick label="الصلاحية" value={validity} onChange={setValidity} options={VALIDITY} icon="calendar" />
            </F>
          </div>
          <F label="تكلفة لينكار">
            <Box>سعر التكلفة المتفق عليه مع المركز · يُحمَّل على لينكار</Box>
          </F>
          <Toggles push={push} sms={sms} setPush={setPush} setSms={setSms} />
          <Note>تصل كل عميل قسيمة QR تُمسح في الفرع مثل قسائم الحجز، وتُضاف تكلفتها لمستحقات المركز عند التنفيذ.</Note>
        </>
      )}
    </Modal>
  );
}
