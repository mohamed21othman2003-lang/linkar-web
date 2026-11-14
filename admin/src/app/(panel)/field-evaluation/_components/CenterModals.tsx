"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { ASSESSORS, TIERS, type CenterDetail } from "@/lib/api/field-evaluation";
import { useUrlState } from "@/lib/use-url-state";
import { Area, EndNote, FieldShell, KV, RadioCard } from "./bits";

// نوافذ الاعتماد (CON5-17M · 520 · r20 · حشو 24 · مسافة 14 · رأس 36 بعنوان بس · الأزرار 50 والرئيسي على اليمين):
//   منح الشارة · مركز درع للحماية (3114:63260) — ?center=&modal=fe-badge (من CON5-17P)
//   قرار · مغاسل اللؤلؤة (3114:63284) — fe-decision · منح مباشر · كار سبا (3114:63316) — fe-direct
//   تقييم دوري · جونسون Johnson (3114:63336) / XPEL السعودية (3114:63364) — fe-periodic
export function CenterModals() {
  const url = useUrlState();
  const modal = url.get("modal");
  const id = url.get("center");
  const open = !!id && ["fe-badge", "fe-decision", "fe-direct", "fe-periodic"].includes(modal ?? "");
  const q = useQuery({ queryKey: ["centers", "one", id], queryFn: () => api.centers.get(id!), enabled: open, retry: false });
  if (!open || !q.data) return null;
  const close = () => url.replace({ modal: null });
  const c = q.data;
  if (modal === "fe-badge") return <BadgeModal c={c} close={close} />;
  if (modal === "fe-decision") return <DecisionModal c={c} close={close} />;
  if (modal === "fe-direct") return <DirectModal c={c} close={close} />;
  return <PeriodicModal c={c} close={close} />;
}

type P = { c: CenterDetail; close: () => void };

function useDone() {
  const url = useUrlState();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string, back?: boolean) => {
    qc.invalidateQueries({ queryKey: ["centers"] });
    qc.invalidateQueries({ queryKey: ["practical"] });
    toast("تم", t);
    // من صفحة التقييم العملي يرجع لقائمة التصنيف
    if (back) router.push("/field-evaluation/centers");
    else url.replace({ modal: null, center: null });
  };
}

const ROW = "flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1";
function Actions({ primary, onPrimary, loading, close }: { primary: string; onPrimary: () => void; loading: boolean; close: () => void }) {
  return (
    <div className={ROW}>
      <Button loading={loading} onClick={onPrimary}>
        {primary}
      </Button>
      <Button variant="secondary" className="h-[50px]!" onClick={close}>
        إلغاء
      </Button>
    </div>
  );
}

// ───────────── منح الشارة · مركز درع للحماية (3114:63260) ─────────────
function BadgeModal({ c, close }: P) {
  const url = useUrlState();
  const done = useDone();
  const fromPractical = url.get("from") === "practical";
  const m = useMutation({ mutationFn: () => api.centers.grantBadge(c.id), onSuccess: (r) => done(r.toast, fromPractical) });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={520} title="منح شارة «معتمد LINKAR»">
      <div className="flex flex-col gap-3.5">
        <KV k="المركز" tight>
          {c.name}
          {c.tier ? ` · ${TIERS[c.tier].label}` : ""}
        </KV>
        <KV k="النتيجة العملية" tight>
          {c.modal?.practical ?? "—"}
        </KV>
      </div>
      <EndNote start tone="success" icon="check">
        تظهر شارة «معتمد LINKAR» للمركز في الموقع والتطبيق وبوابة الوكالات والمسوّقين، ويُبلَّغ المركز.
      </EndNote>
      <Actions primary="منح الشارة" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── قرار · مغاسل اللؤلؤة (3114:63284) ─────────────
function DecisionModal({ c, close }: P) {
  const done = useDone();
  const [option, setOption] = useState<"extend" | "stop">("extend");
  const [reason, setReason] = useState(c.modal?.reason ?? "");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.centers.decide(c.id, { option, reason }),
    onSuccess: (r) => done(r.toast),
    onError: (e) => isApiError(e) && setErr(e.fields?.reason),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={520} title={`قرار الاعتماد · ${c.name}`}>
      <KV k="النتيجة العملية" tone={c.modal?.practicalBad ? "danger" : undefined} tight>
        {c.modal?.practical ?? "—"}
      </KV>
      <div role="radiogroup" aria-label="القرار" className="flex flex-col gap-3.5">
        <RadioCard title="تمديد التجربة 30 يوماً" sub={c.modal?.extendUntil} checked={option === "extend"} onSelect={() => setOption("extend")} />
        <RadioCard title="إيقاف المركز" sub="يُخفى عن العملاء" checked={option === "stop"} onSelect={() => setOption("stop")} />
      </div>
      <FieldShell label="سبب القرار" id="fe-d-reason" error={err}>
        <Area id="fe-d-reason" h={90} medium value={reason} invalid={!!err} onChange={(v) => (setReason(v), setErr(undefined))} />
      </FieldShell>
      <Actions primary="تسجيل القرار" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── منح مباشر · كار سبا (3114:63316) ─────────────
function DirectModal({ c, close }: P) {
  const done = useDone();
  const [reason, setReason] = useState(c.modal?.reason ?? "");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.centers.grantBadge(c.id, reason),
    onSuccess: (r) => done(r.toast),
    onError: (e) => isApiError(e) && setErr(e.fields?.reason),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={520} title={`منح مباشر · ${c.name}`}>
      <EndNote start tone="trial">
        للمراكز والشركات المعروفة: تقدر تمنحها الاعتماد مباشرة بدون فترة تجربة، بشرط تكتب السبب.
      </EndNote>
      <FieldShell label="سبب القرار" id="fe-x-reason" error={err}>
        <Area id="fe-x-reason" h={90} medium value={reason} invalid={!!err} onChange={(v) => (setReason(v), setErr(undefined))} />
      </FieldShell>
      <Actions primary="منح الشارة" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}

// ───────────── تقييم دوري · جونسون Johnson (3114:63336) / XPEL السعودية (3114:63364) ─────────────
function PeriodicModal({ c, close }: P) {
  const done = useDone();
  const base = c.modal?.periodicDate ?? "30 ديسمبر 2026";
  const dates = [base, "15 نوفمبر 2026", "1 ديسمبر 2026"].filter((v, i, a) => a.indexOf(v) === i).map((v) => ({ value: v, label: v }));
  const [date, setDate] = useState(base);
  const [assessor, setAssessor] = useState(ASSESSORS[0].value);
  const [kind, setKind] = useState("دوري");
  const m = useMutation({
    mutationFn: () => api.centers.schedulePeriodic(c.id, { date, assessor, kind }),
    onSuccess: (r) => done(r.toast),
  });
  return (
    <Modal open onOpenChange={(o) => !o && close()} width={520} title={`جدولة تقييم دوري · ${c.name.replace("‏", "")}`}>
      <FieldShell label="التاريخ" id="fe-p-date">
        <Select id="fe-p-date" value={date} onChange={setDate} options={dates} />
      </FieldShell>
      <FieldShell label="المُقيّم" id="fe-p-assessor">
        <Select id="fe-p-assessor" value={assessor} onChange={setAssessor} options={ASSESSORS.map((a) => ({ value: a.value, label: a.short }))} />
      </FieldShell>
      <FieldShell label="نوع التقييم" id="fe-p-kind">
        <Select id="fe-p-kind" value={kind} onChange={setKind} options={["دوري", "مفاجئ"].map((v) => ({ value: v, label: v }))} />
      </FieldShell>
      <Actions primary="جدولة" onPrimary={() => m.mutate()} loading={m.isPending} close={close} />
    </Modal>
  );
}
