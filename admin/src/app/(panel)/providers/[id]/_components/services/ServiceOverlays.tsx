"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import { HIDE_REASONS, SERVICE_PAUSE_REASONS, SIZE_LABELS, SPEC_LABELS, warrantyLabel, type Service, type SpecKey } from "@/lib/api/services";
import { MOCK_NOW } from "@/lib/api/users";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { DateField, TextArea } from "../../../_components/form-bits";
import { ServiceFormModal } from "./ServiceForm";

// نوافذ ودرج الخدمات فوق ملف المزوّد — حالتها في الرابط (القسم 2.3):
// ?service=<id> درج التفاصيل · ?modal=service-new | service-edit | service-pause | service-hide | service-delete &s=<id>
export function ServiceOverlays({ profile }: { profile: ProviderProfile }) {
  const url = useUrlState();
  const modal = url.get("modal");
  const sid = url.get("s");
  const drawerId = url.get("service");
  const close = () => url.replace({ modal: null, s: null });
  const svc = useQuery({
    queryKey: ["providers", "service", sid],
    queryFn: () => api.services.get(sid!),
    enabled: !!sid && !!modal?.startsWith("service-"),
  });
  const branches = useQuery({
    queryKey: ["providers", "branches", profile.provider.id],
    queryFn: () => api.profile.branches(profile.provider.id),
  });
  const b = branches.data ?? [];

  let node: ReactNode = null;
  if (modal === "service-new") node = <ServiceFormModal profile={profile} branches={b} onClose={close} />;
  else if (svc.data && b.length) {
    const props = { s: svc.data, profile, branches: b, close };
    if (modal === "service-edit") node = <ServiceFormModal profile={profile} branches={b} service={svc.data} onClose={close} />;
    else if (modal === "service-pause") node = <PauseServiceModal {...props} />;
    else if (modal === "service-hide") node = <HideServiceModal {...props} />;
    else if (modal === "service-delete") node = <DeleteServiceModal {...props} />;
  }
  return (
    <>
      {drawerId ? <ServiceDrawer id={drawerId} profile={profile} branches={b} /> : null}
      {node}
    </>
  );
}

type P = {
  s: Service;
  profile: ProviderProfile;
  branches: ProviderBranch[];
  close: () => void;
};
const short = (profile: ProviderProfile) => profile.provider.short ?? profile.provider.name;

function useDone(close: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body: string) => {
    qc.invalidateQueries({ queryKey: ["providers"] });
    close();
    toast(title, body);
  };
}

// ───────────── CON5-07D · تفاصيل الخدمة (Johnson Ceramic Pro 3260-251028 · PPF 3260-251139 · … 3260-251555) ─────────────
// 600 · بطاقات r14 بإطار · حشو 14 · مسافة 6 · عنوان 14 SemiBold · صفوف 32: المفتاح 13 Light رمادي (147) ثم القيمة 13 Medium
// الأزرار: «تعديل الخدمة» مميز يمين · «إيقاف مؤقت ‖» ثانوي شمال
function ServiceDrawer({ id, profile, branches }: { id: string; profile: ProviderProfile; branches: ProviderBranch[] }) {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const q = useQuery({
    queryKey: ["providers", "service", id],
    queryFn: () => api.services.get(id),
  });
  const s = q.data;
  const close = () => url.replace({ service: null });
  const go = (modal: string) => url.push({ service: null, modal, s: id });
  const branchName = (bid: string) => branches.find((b) => b.id === bid)?.name ?? bid;
  const selected = url.get("branch");
  const priceBranch = s ? (selected && s.branchIds.includes(selected) ? selected : s.branchIds[0]) : "";
  const p1 = s?.products[0];
  const price = p1?.prices[priceBranch];
  const productsLine = s
    ? s.products
        .map((pr) => ({
          label: pr.tier ?? pr.name,
          sale: pr.prices[priceBranch]?.sale[0] ?? 0,
        }))
        .sort((a, b) => a.sale - b.sale)
        .map((x) => `${x.label} ${num(x.sale)}`)
        .join(" · ") + " (سيدان)"
    : "";
  const channels = s ? [s.channels.customers && "العملاء", s.channels.b2b && "الوكالات", s.channels.marketers && "المسوّقون"].filter(Boolean).join(" · ") || "—" : "";
  const company = p1?.specs.company.replace(/^‏/, "") ?? "";

  return (
    <Drawer
      open
      onOpenChange={(o) => !o && close()}
      title={s?.name ?? "…"}
      subtitle={s ? `${short(profile)} · ${s.category} · ${s.code}` : undefined}
      footer={
        s && canEdit ? (
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <Button variant="accent" className="h-11 px-4" onClick={() => go("service-edit")}>
              تعديل الخدمة
              <Icon name="edit" size={16} />
            </Button>
            {s.status === "published" ? (
              <Button variant="secondary" className="h-[46px] px-4" onClick={() => go("service-pause")}>
                إيقاف مؤقت
                <span aria-hidden className="text-14 font-bold">
                  ‖
                </span>
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[320px] rounded-14" />
          <Skeleton className="h-[200px] rounded-14" />
        </>
      ) : !s || !p1 ? (
        <Note tone="neutral">لم تعد هذه الخدمة موجودة.</Note>
      ) : (
        <>
          <DTile title="التعريف">
            <DKV k="الوصف">{p1.description || "—"}</DKV>
            <DKV k="يشمل">{p1.includes.join(" · ") || "—"}</DKV>
            <DKV k="المنتجات">{productsLine}</DKV>
            <DKV k="المنتج">
              <bdi>{p1.specs.approved || p1.name}</bdi>
              {company ? <> · {company}</> : null}
            </DKV>
            <DKV k="المدة · الضمان">
              {s.duration.split(" · ")[0]} · {warrantyLabel(p1.warrantyYears)}
            </DKV>
            <DKV k="الصيانة">{p1.reminder.startsWith("بدون") ? "—" : p1.reminder.split(" · ")[0]}</DKV>
          </DTile>
          {(Object.keys(SPEC_LABELS) as SpecKey[]).some((k) => p1.specs[k]) || p1.extraSpecs.length ? (
            <DTile title="المواصفات الفنية">
              {(Object.keys(SPEC_LABELS) as SpecKey[])
                .filter((k) => p1.specs[k])
                .map((k) => (
                  <DKV key={k} k={SPEC_LABELS[k]}>
                    {k === "company" ? company : p1.specs[k]}
                  </DKV>
                ))}
              {p1.extraSpecs.map((x) => (
                <DKV key={x.label} k={x.label}>
                  {x.value}
                </DKV>
              ))}
            </DTile>
          ) : null}
          <DTile title="الفروع والقنوات">
            <DKV k="الفروع">{s.branchIds.map(branchName).join(" · ")}</DKV>
            <DKV k="القنوات">{channels}</DKV>
          </DTile>
          {price ? (
            <DTile title={`${p1.tier ? `أسعار ${p1.tier}` : "الأسعار"} · شاملة الضريبة`}>
              {SIZE_LABELS.map((l, i) => (
                <DKV key={l} k={l}>
                  سعر التكلفة {num(price.cost[i])} · سعر البيع {num(price.sale[i])} ر.س
                </DKV>
              ))}
            </DTile>
          ) : null}
        </>
      )}
    </Drawer>
  );
}

function DTile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5 rounded-14 border border-border p-3.5">
      <h3 className="text-14 leading-[22px] font-semibold text-ink">{title}</h3>
      <dl className="flex flex-col gap-1.5">{children}</dl>
    </section>
  );
}
function DKV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5 text-13 leading-5">
      <dt className="w-[110px] shrink-0 font-light text-muted sm:w-[147px]">{k}</dt>
      <dd className="min-w-0 flex-1 font-medium text-ink">{children}</dd>
    </div>
  );
}

// ───────────── «النطاق»: كل الفروع / فروع محددة (CON5-07M إيقاف 3260-250488 · حذف 3260-250535) ─────────────
// شرائح 24 · r999 · حشو 3·10 · 12 Medium — المختارة كحلي بنص أبيض والثانية #EEF1EF بنص #4A5550
function Scope({ scope, setScope, ids, setIds, branches }: { scope: "all" | "some"; setScope: (v: "all" | "some") => void; ids: string[]; setIds: (v: string[]) => void; branches: ProviderBranch[] }) {
  const pill = (on: boolean) => `h-6 rounded-full px-2.5 text-12 leading-[18px] font-medium ${on ? "bg-ink text-white" : "bg-surface-2 text-[#4a5550] hover:bg-border"}`;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-12 leading-5 font-medium text-muted">النطاق</legend>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={scope === "some"} className={pill(scope === "some")} onClick={() => setScope("some")}>
          فروع محددة
        </button>
        <button type="button" aria-pressed={scope === "all"} className={pill(scope === "all")} onClick={() => setScope("all")}>
          كل الفروع
        </button>
      </div>
      {scope === "some" ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {branches.map((b) => {
            const on = ids.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={on}
                onClick={() => setIds(on ? ids.filter((x) => x !== b.id) : [...ids, b.id])}
                className={`inline-flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-12 font-medium ${on ? "border-ink bg-lime-tint text-ink" : "border-border bg-white text-ink"}`}
              >
                {on ? <Icon name="check" size={14} /> : null}
                فرع {b.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </fieldset>
  );
}
const serviceBranches = (s: Service, branches: ProviderBranch[]) => branches.filter((b) => s.branchIds.includes(b.id));
const F42 = "h-[42px]! [&>span]:text-14! [&>span]:font-normal!";

// ───────────── CON5-07M · إيقاف مؤقت · Johnson Ceramic Pro (3260-250488) ─────────────
// 560 · حشو 24 · مسافة 14 · النطاق · «حتى» يمين و«السبب» شمال (42) · رسالة للمزوّد (64) · «إلغاء» يمين و«إيقاف الخدمة» أحمر شمال
const today = MOCK_NOW.toISOString().slice(0, 10);
function PauseServiceModal({ s, profile, branches, close }: P) {
  const done = useDone(close);
  const mine = serviceBranches(s, branches);
  const [scope, setScope] = useState<"all" | "some">("all");
  const [ids, setIds] = useState<string[]>([]);
  const [reason, setReason] = useState<string>(SERVICE_PAUSE_REASONS[0]);
  const [until, setUntil] = useState("2026-11-01");
  const [message, setMessage] = useState("أوقفنا الخدمة حتى وصول شحنة Ceramic Pro الجديدة.");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () =>
      api.services.pause(s.id, {
        scope,
        branchIds: ids,
        reason,
        until,
        message,
      }),
    onSuccess: () => done("أُوقفت الخدمة", `أُوقفت ${s.name} مؤقتاً`),
  });
  const submit = () => {
    if (scope === "some" && !ids.length) return setErr("اختر فرعاً واحداً على الأقل");
    if (!until || until <= today) return setErr("اختر تاريخ عودة بعد اليوم");
    m.mutate();
  };
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={560} title="إيقاف الخدمة مؤقتاً" subtitle={<bdi>{`${s.name} · ${short(profile)}`}</bdi>}>
      <Scope scope={scope} setScope={(v) => (setScope(v), setErr(undefined))} ids={ids} setIds={(v) => (setIds(v), setErr(undefined))} branches={mine} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="حتى">{(id) => <DateField id={id} value={until} onChange={(v) => (setUntil(v), setErr(undefined))} min={today} className="h-[42px]" />}</Field>
        <Field label="السبب">
          {(id) => (
            <Select
              id={id}
              value={reason}
              onChange={setReason}
              options={SERVICE_PAUSE_REASONS.map((r) => ({
                value: r,
                label: r,
              }))}
              className={F42}
            />
          )}
        </Field>
      </div>
      <Field label="رسالة للمزوّد" error={err}>
        {(id) => <TextArea id={id} value={message} onChange={setMessage} rows={2} className="h-16! text-14! font-normal!" />}
      </Field>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
        <Button variant="danger" className="h-11" loading={m.isPending} onClick={submit}>
          إيقاف الخدمة
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-07M · إخفاء خدمة · Johnson Ceramic Pro (3114-49824) ─────────────
// 480 · سطر «الخدمة · المزوّد» 13 Medium · السبب (44) + «من القائمة المرجعية «أسباب الإيقاف»» · رسالة للمركز (96) · ملاحظة تنبيه
// «إخفاء الخدمة» أحمر يمين و«إلغاء» شمال
function HideServiceModal({ s, profile, close }: P) {
  const done = useDone(close);
  const [reason, setReason] = useState<string>(HIDE_REASONS[0]);
  const [message, setMessage] = useState("أُخفيت الخدمة لحين تعديل الوصف بما يطابق المنتج المعتمد.");
  const m = useMutation({
    mutationFn: () => api.services.hide(s.id, { reason, message }),
    onSuccess: () => done("أُخفيت الخدمة", "أُخفيت الخدمة عن العملاء وأُبلغ المركز"),
  });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={480} title="إخفاء خدمة عن العملاء">
      <p className="text-13 leading-[22px] font-medium text-ink">
        <bdi>{`${s.name} · ${profile.provider.name}`}</bdi>
      </p>
      <Field label="السبب" hint="من القائمة المرجعية «أسباب الإيقاف»">
        {(id) => <Select id={id} value={reason} onChange={setReason} options={HIDE_REASONS.map((r) => ({ value: r, label: r }))} />}
      </Field>
      <Field label="رسالة للمركز">{(id) => <TextArea id={id} value={message} onChange={setMessage} />}</Field>
      <Note tone="warning">تختفي الخدمة من الموقع والتطبيق فوراً، والحجوزات القائمة عليها تبقى.</Note>
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="danger" className="h-12" loading={m.isPending} onClick={() => m.mutate()}>
          إخفاء الخدمة
        </Button>
        <Button variant="secondary" className="h-[50px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}

// ───────────── CON5-07M · حذف الخدمة · Johnson Ceramic Pro (3260-250535) ─────────────
// 560 · النطاق · «إلغاء» يمين و«حذف الخدمة» (#D93131) شمال
function DeleteServiceModal({ s, profile, branches, close }: P) {
  const done = useDone(close);
  const [scope, setScope] = useState<"all" | "some">("all");
  const [ids, setIds] = useState<string[]>([]);
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.services.remove(s.id, { scope, branchIds: ids }),
    onSuccess: () => done("حُذفت الخدمة", `حُذفت ${s.name} من خدمات ${short(profile)}`),
  });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={560} title="حذف الخدمة" subtitle={<bdi>{`${s.name} · ${short(profile)}`}</bdi>}>
      <Scope scope={scope} setScope={(v) => (setScope(v), setErr(undefined))} ids={ids} setIds={(v) => (setIds(v), setErr(undefined))} branches={serviceBranches(s, branches)} />
      {err ? (
        <p role="alert" className="text-12 text-danger">
          {err}
        </p>
      ) : null}
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" className="h-[46px]" onClick={close} disabled={m.isPending}>
          إلغاء
        </Button>
        <Button
          variant="danger"
          className="h-11 bg-[#d93131]! hover:bg-[#d93131]/90!"
          loading={m.isPending}
          onClick={() => (scope === "some" && !ids.length ? setErr("اختر فرعاً واحداً على الأقل") : m.mutate())}
        >
          حذف الخدمة
        </Button>
      </div>
    </Modal>
  );
}
