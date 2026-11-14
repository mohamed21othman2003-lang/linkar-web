"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { ASSESSORS, SCHEDULE_TARGETS, SLOTS, VISIT_REASONS, type ScheduleInput, type VisitDetail } from "@/lib/api/field-evaluation";
import { useUrlState } from "@/lib/use-url-state";
import { Area, ChoiceChip, EndNote, FieldShell, SEL42 } from "./bits";

// نوافذ الزيارات (CON5-17M) — ?modal=fe-schedule (+ &branch=<كود الفرع>) | fe-reschedule | fe-cancel (فوق درج ?visit=)
//   جدولة زيارة ميدانية (3114:64092) · جدولة زيارة ميدانية · فرع السلامة · LK-JN-SL-005 (3524:277386)
//   إعادة جدولة الزيارة · الزهراء والحمراء (3114:64161) · إلغاء الزيارة · الزهراء والحمراء (3114:64191)
// 560 · r20 · حشو 24 · مسافة 14 · رأس 52 بسطر فرعي · حقول 42 · الأزرار 46 بعرض متساوي (الرئيسي على الشمال)
export function VisitModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const visitId = url.get("visit");
  const close = () => url.replace({ modal: null, branch: null });
  if (modal === "fe-schedule") return <ScheduleModal branch={url.get("branch")} close={close} />;
  if ((modal === "fe-reschedule" || modal === "fe-cancel") && visitId) return <VisitModal kind={modal} id={visitId} close={close} />;
  return null;
}

function useDone() {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body: string) => {
    qc.invalidateQueries({ queryKey: ["field-visits"] });
    qc.invalidateQueries({ queryKey: ["centers"] });
    toast(title, body);
  };
}

const actions = "flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1";

// ───────────── CON5-17M · جدولة زيارة ميدانية (3114:64092 · 3524:277386) ─────────────
function ScheduleModal({ branch, close }: { branch: string | null; close: () => void }) {
  const url = useUrlState();
  const done = useDone();
  const deep = !!branch && branch !== "LK-JN-AB-004";
  const target = SCHEDULE_TARGETS.find((t) => t.branches.some((b) => b.code === branch)) ?? SCHEDULE_TARGETS[0];
  const [v, setV] = useState<ScheduleInput>({
    provider: target.provider,
    branch: branch && target.branches.some((b) => b.code === branch) ? branch : target.branches[0].code,
    reason: "فرع جديد",
    assessor: ASSESSORS[0].value,
    slot: SLOTS[0].value,
    notify: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const provider = SCHEDULE_TARGETS.find((t) => t.provider === v.provider)!;
  const b = provider.branches.find((x) => x.code === v.branch);
  const set = <K extends keyof ScheduleInput>(k: K, val: ScheduleInput[K]) => setV((s) => ({ ...s, [k]: val }));
  const m = useMutation({
    mutationFn: () => api.fieldVisits.schedule(v),
    onSuccess: (r) => {
      // من رابط فرع بعينه (ملف المزوّد · الفروع) الرسالة بتسمّي الفرع والموعد (CON5-17T 3524:277455)
      done("جُدولت الزيارة", deep ? `جُدولت زيارة ${r.branch} · ${r.slot}` : "جُدولت الزيارة الميدانية وأُبلغ المزوّد · تظهر في «المجدولة»");
      url.replace({ modal: null, branch: null, visit: null, tab: null });
    },
    onError: (e) => isApiError(e) && setErrors(e.fields ?? {}),
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && close()}
      width={560}
      title="جدولة زيارة ميدانية"
      subtitle="الزيارة شرط لتفعيل أي منشأة أو فرع أو خدمة جديدة، ولو أضافها فريق لينكار"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <FieldShell label="المنشأة" id="fe-provider">
          <Select
            id="fe-provider"
            className={SEL42}
            value={v.provider}
            onChange={(p) => setV((s) => ({ ...s, provider: p, branch: SCHEDULE_TARGETS.find((t) => t.provider === p)!.branches[0].code }))}
            options={SCHEDULE_TARGETS.map((t) => ({ value: t.provider, label: t.providerLabel }))}
          />
        </FieldShell>
        <FieldShell label="الفرع" id="fe-branch" error={errors.branch}>
          <Select id="fe-branch" className={SEL42} value={v.branch} invalid={!!errors.branch} onChange={(x) => set("branch", x)} options={provider.branches.map((x) => ({ value: x.code, label: x.label }))} />
        </FieldShell>
      </div>
      <p className="text-12 leading-5 font-medium text-muted">سبب الزيارة</p>
      <div role="radiogroup" aria-label="سبب الزيارة" className="flex flex-wrap gap-1.5">
        {VISIT_REASONS.map((r) => (
          <ChoiceChip key={r} on={v.reason === r} onClick={() => setV((s) => ({ ...s, reason: r, notify: r === "زيارة مفاجئة" ? false : s.notify }))}>
            {r}
          </ChoiceChip>
        ))}
      </div>
      <p className="text-12 leading-5 font-medium text-muted">القوالب (تُختار تلقائياً حسب خدمات الفرع ونوع المنشأة)</p>
      <div className="flex flex-wrap gap-1.5">
        {b?.templates.map((t) => (
          <ChoiceChip key={t} info>
            {t}
          </ChoiceChip>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <FieldShell label="الموعد" id="fe-slot" error={errors.slot}>
          <Select id="fe-slot" className={SEL42} icon="calendar" value={v.slot} onChange={(x) => set("slot", x)} options={SLOTS} />
        </FieldShell>
        <FieldShell label="المقيّم" id="fe-assessor">
          <Select id="fe-assessor" className={SEL42} value={v.assessor} onChange={(x) => set("assessor", x)} options={ASSESSORS} />
        </FieldShell>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-13 leading-5 font-medium text-ink">إبلاغ المزوّد بالموعد</span>
          <span className="text-12 leading-[18px] font-light text-muted">يُطفأ في الزيارة المفاجئة</span>
        </span>
        <Switch checked={v.notify} onCheckedChange={(x) => set("notify", x)} label="إبلاغ المزوّد بالموعد" />
      </label>
      <EndNote>بعد الزيارة تُحسب النتيجة والفئة والقبول أو الرفض وسببه تلقائياً من النموذج، ويعتمدها مدير الجودة.</EndNote>
      <div className={actions}>
        <Button variant="secondary" className="h-[46px]!" onClick={close}>
          إلغاء
        </Button>
        <Button className="h-11!" loading={m.isPending} onClick={() => m.mutate()} icon={<Icon name="calendar" size={16} />}>
          جدولة الزيارة
        </Button>
      </div>
    </Modal>
  );
}


// ───────────── CON5-17M · إعادة جدولة الزيارة (3114:64161) / إلغاء الزيارة (3114:64191) ─────────────
function VisitModal({ kind, id, close }: { kind: "fe-reschedule" | "fe-cancel"; id: string; close: () => void }) {
  const q = useQuery({ queryKey: ["field-visits", "one", id], queryFn: () => api.fieldVisits.get(id) });
  if (!q.data) return null;
  return kind === "fe-reschedule" ? <RescheduleModal v={q.data} close={close} /> : <CancelModal v={q.data} close={close} />;
}

function RescheduleModal({ v, close }: { v: VisitDetail; close: () => void }) {
  const url = useUrlState();
  const done = useDone();
  const [assessor, setAssessor] = useState(v.assessorKey ?? ASSESSORS[0].value);
  // الموعد الجديد الافتراضي = أول موعد بعد الحالي
  const [slot, setSlot] = useState(SLOTS[Math.min(SLOTS.findIndex((s) => s.value === v.slot) + 2, SLOTS.length - 1)].value);
  const [reason, setReason] = useState("طلب المركز تغيير الموعد لانشغال الفنيين");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.fieldVisits.reschedule(v.id, { assessor, slot, reason }),
    onSuccess: (r) => {
      done("أُعيدت جدولة الزيارة", r.toast);
      url.replace({ modal: null });
    },
    onError: (e) => isApiError(e) && setErr(e.fields?.reason),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={560} title="إعادة جدولة الزيارة" subtitle={v.rescheduleSub}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <FieldShell label="الموعد الجديد" id="fe-new-slot">
          <Select id="fe-new-slot" className={SEL42} icon="calendar" value={slot} onChange={setSlot} options={SLOTS} />
        </FieldShell>
        <FieldShell label="المقيّم" id="fe-r-assessor">
          <Select id="fe-r-assessor" className={SEL42} value={assessor} onChange={setAssessor} options={ASSESSORS.map((a) => ({ value: a.value, label: a.short }))} />
        </FieldShell>
      </div>
      <FieldShell label="السبب (يصل للمزوّد)" id="fe-r-reason" error={err}>
        <Area id="fe-r-reason" value={reason} invalid={!!err} onChange={(x) => (setReason(x), setErr(undefined))} />
      </FieldShell>
      <div className={actions}>
        <Button variant="secondary" className="h-[46px]!" onClick={close}>
          إلغاء
        </Button>
        <Button className="h-11!" loading={m.isPending} onClick={() => m.mutate()}>
          حفظ الموعد
        </Button>
      </div>
    </Modal>
  );
}

function CancelModal({ v, close }: { v: VisitDetail; close: () => void }) {
  const url = useUrlState();
  const done = useDone();
  const [reason, setReason] = useState("المنتج المعتمد لم يصل للفرع بعد");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.fieldVisits.cancel(v.id, reason),
    onSuccess: (r) => {
      done("أُلغيت الزيارة", r.toast);
      url.replace({ modal: null, visit: null });
    },
    onError: (e) => isApiError(e) && setErr(e.fields?.reason),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={560} title="إلغاء الزيارة" subtitle="لا تُفعَّل الخدمة دون زيارة؛ يبقى الطلب بانتظار موعد جديد">
      <FieldShell label="سبب الإلغاء (يصل للمزوّد)" id="fe-c-reason" error={err}>
        <Area id="fe-c-reason" value={reason} invalid={!!err} onChange={(x) => (setReason(x), setErr(undefined))} />
      </FieldShell>
      <div className={actions}>
        <Button variant="secondary" className="h-[46px]!" onClick={close}>
          رجوع
        </Button>
        <Button variant="danger" className="h-11!" loading={m.isPending} onClick={() => m.mutate()}>
          إلغاء الزيارة
        </Button>
      </div>
    </Modal>
  );
}
