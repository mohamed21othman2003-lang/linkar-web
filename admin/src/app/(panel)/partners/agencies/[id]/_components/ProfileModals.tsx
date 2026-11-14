"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon, type UiGlyph } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { keepFocusQuiet } from "@/components/ui/focus";
import { api, isApiError } from "@/lib/api";
import type { AgencyProfile } from "@/lib/api/agency-profile";
import { useUrlState } from "@/lib/use-url-state";
import { TextArea } from "../../../../providers/_components/form-bits";
import { DKV } from "../../_components/bits";

// نوافذ ملف الوكالة: ?modal=ag-actions | ag-edit | ag-contact &ref=<DL>
//   CON5-09A · إجراءات · DL-014 (3114:6301) — 440: تعديل بيانات الوكالة · تغيير المفوّض الرئيسي · إيقاف الوكالة
//   CON5-09M · تعديل البيانات · DL-014 (3114:6325) → T0931 · تغيير المفوّض · DL-014 (3114:6359) → T0930
export function ProfileModals({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const modal = url.get("modal");
  if (url.get("ref") !== p.id) return null;
  if (modal === "ag-actions") return <ActionsSheet p={p} />;
  if (modal === "ag-edit") return <EditModal p={p} />;
  if (modal === "ag-contact") return <ContactModal p={p} />;
  return null;
}

function ActionsSheet({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const close = () => url.replace({ modal: null, ref: null });
  const item = (icon: UiGlyph, label: string, modal: string, danger?: boolean) => (
    <button type="button" onClick={() => url.replace({ modal, ref: p.id })} className="flex h-11 items-center gap-2.5 rounded-10 px-3 text-start hover:bg-surface-1">
      <Icon name={icon} size={18} className={danger ? "text-danger-strong" : "text-ink"} />
      <span className={`min-w-0 flex-1 text-14 font-medium ${danger ? "text-danger-strong" : "text-ink"}`}>{label}</span>
      <Icon name="chevron-left" size={16} className="text-muted" />
    </button>
  );
  return (
    <Dialog.Root open onOpenChange={(o) => !o && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45" />
        <Dialog.Content dir="rtl" onOpenAutoFocus={keepFocusQuiet} className="fixed top-1/2 left-1/2 z-50 flex w-[440px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 rounded-[20px] bg-white p-6 shadow-card focus:outline-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <Dialog.Title className="text-18 font-bold text-ink">{p.id}</Dialog.Title>
              <Dialog.Description className="text-13 leading-5 font-light text-muted">{p.name} · ائتمان شهري</Dialog.Description>
            </div>
            <Dialog.Close aria-label="إغلاق" className="flex size-9 shrink-0 items-center justify-center rounded-10 text-ink hover:bg-surface-1">
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <div className="flex flex-col gap-0.5">
            {item("edit", "تعديل بيانات الوكالة", "ag-edit")}
            {item("user", "تغيير المفوّض الرئيسي", "ag-contact")}
            <hr className="border-border" />
            {item("lock", "إيقاف الوكالة", "ag-suspend", true)}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function useDone() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  return (t: string) => {
    qc.invalidateQueries({ queryKey: ["agencies"] });
    url.replace({ modal: null, ref: null });
    toast("تم", t);
  };
}
const err = (e: unknown, k: string) => (isApiError(e) ? e.fields?.[k] : undefined);

function Foot({ primary, onPrimary, loading }: { primary: string; onPrimary: () => void; loading?: boolean }) {
  const url = useUrlState();
  return (
    <div className="flex flex-wrap gap-2.5 [&>*]:min-w-[120px] [&>*]:flex-1">
      <Button loading={loading} onClick={onPrimary}>
        {primary}
      </Button>
      <Button variant="secondary" className="h-[50px]!" onClick={() => url.replace({ modal: null, ref: null })}>
        إلغاء
      </Button>
    </div>
  );
}

// ───────────── تعديل بيانات الوكالة (3114:6325) ─────────────
function EditModal({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const done = useDone();
  const [f, setF] = useState({ name: p.name, cr: p.cr, vat: p.vat, address: p.address, cities: p.cities });
  const m = useMutation({ mutationFn: () => api.agencyProfile.update(p.id, f), onSuccess: (r) => done(r.toast) });
  const input = (k: keyof typeof f, label: string, ltr?: boolean) => (
    <Field label={label} error={err(m.error, k)}>
      {(id) => <TextInput id={id} value={f[k]} ltr={ltr} invalid={!!err(m.error, k)} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} />}
    </Field>
  );
  return (
    <Modal open onOpenChange={(o) => !o && url.replace({ modal: null, ref: null })} width={500} title="تعديل بيانات الوكالة">
      {input("name", "الاسم التجاري")}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {input("cr", "السجل التجاري", true)}
        {input("vat", "الرقم الضريبي", true)}
      </div>
      {input("address", "العنوان")}
      {input("cities", "المدن")}
      <Foot primary="حفظ البيانات" onPrimary={() => m.mutate()} loading={m.isPending} />
    </Modal>
  );
}

// ───────────── تغيير المفوّض الرئيسي (3114:6359) ─────────────
function ContactModal({ p }: { p: AgencyProfile }) {
  const url = useUrlState();
  const done = useDone();
  const current = p.team.find((x) => x.role.includes("المفوّض الرئيسي"));
  const options = p.team.filter((x) => !x.pending && x !== current && x.role.startsWith("مدير فرع"));
  const [member, setMember] = useState(options[0]?.name ?? "");
  const [reason, setReason] = useState("خطاب رسمي من الوكالة بتاريخ اليوم");
  const m = useMutation({ mutationFn: () => api.agencyProfile.changeContact(p.id, member, reason), onSuccess: (r) => done(r.toast) });
  return (
    <Modal open onOpenChange={(o) => !o && url.replace({ modal: null, ref: null })} width={500} title="تغيير المفوّض الرئيسي">
      <DKV k="المفوّض الحالي" pad>
        {current ? (
          <>
            {current.name} · {current.phone}
          </>
        ) : (
          "—"
        )}
      </DKV>
      <div role="radiogroup" aria-label="المفوّض الجديد" className="flex flex-col gap-2">
        <span className="text-12 leading-5 font-medium text-muted">المفوّض الجديد</span>
        {options.map((o) => {
          const on = o.name === member;
          return (
            <button key={o.name} type="button" role="radio" aria-checked={on} onClick={() => setMember(o.name)} className={"flex items-center gap-2.5 rounded-12 border p-3 text-start " + (on ? "border-ink bg-lime-tint" : "border-border hover:bg-surface-1")}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-13 leading-[22px] font-semibold text-ink">{o.name}</span>
                <span className="text-12 leading-5 font-light text-muted">
                  {o.role} · {o.branch} · {o.phone}
                </span>
              </span>
              <span className={"flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] " + (on ? "border-ink" : "border-border-strong")}>{on ? <span className="size-2.5 rounded-full bg-ink" /> : null}</span>
            </button>
          );
        })}
        {err(m.error, "member") ? <p className="text-12 text-danger">{err(m.error, "member")}</p> : null}
      </div>
      <Field label="السبب" error={err(m.error, "reason")}>
        {(id) => <TextArea id={id} value={reason} onChange={setReason} invalid={!!err(m.error, "reason")} className="h-[76px]!" />}
      </Field>
      <Foot primary="تغيير المفوّض" onPrimary={() => m.mutate()} loading={m.isPending} />
    </Modal>
  );
}
