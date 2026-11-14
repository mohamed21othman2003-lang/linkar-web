"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { keepFocusQuiet } from "@/components/ui/focus";
import { api, isApiError } from "@/lib/api";
import { ASSIGNEES, ASSIGN_DEADLINES, ASSIGN_DEPARTMENTS } from "@/lib/api/shared";
import { phone as fmtPhone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";

// النوافذ المشتركة (القسم 15 · CON5-M00) — بتتفتح من أي شاشة بالرابط (القسم 2.3) عن طريق <SharedOverlays/> في هيكل اللوحة:
//   ?modal=m00-preview&doc=<id>            معاينة مستند (3114-65298)
//   ?modal=m00-call&phone=<05…>[,<05…>]&ref=<REQ/BK>   اتصال (3114-65329)
//   ?modal=m00-assign&ref=<REQ>            إسناد لمسؤول (3114-65356)
//   ?modal=m00-note&ref=<REQ/BK>           ملاحظة داخلية (3114-65387)
// (التصدير CON5-M00 3114-65259 = ExportModal.) النوافذ: r20 · حشو 24 · مسافة 14 · حقول 42 r10 نص 14 Regular · أزرار 46/44 بفاصل 10.
const F42 = "h-[42px]! [&>span]:text-14! [&>span]:font-normal!";

export function SharedOverlays() {
  const url = useUrlState();
  const modal = url.get("modal");
  if (!modal?.startsWith("m00-")) return null;
  const close = () => url.replace({ modal: null, doc: null, phone: null, ref: null });
  const ref = url.get("ref") ?? "";
  switch (modal) {
    case "m00-preview":
      return <DocPreview id={url.get("doc") ?? ""} onClose={close} />;
    case "m00-call":
      return <CallModal phones={(url.get("phone") ?? "").split(",").filter(Boolean)} refId={ref} onClose={close} />;
    case "m00-assign":
      return <AssignModal refId={ref} onClose={close} />;
    case "m00-note":
      return <NoteModal refId={ref} onClose={close} />;
    default:
      return null;
  }
}

/** زرين بعرض متساوي: `first` يمين و`second` شمال */
function Pair({ first, second }: { first: ReactNode; second: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 [&>*]:min-w-0 [&>*]:flex-1">
      {first}
      {second}
    </div>
  );
}

// ───────────── CON5-M00 · معاينة مستند (3114-65298) ─────────────
// خلفية كحلي 70% · شريط علوي 64 كحلي (العنوان 14 Medium أبيض يمين · «تنزيل» ثانوي 46 + إغلاق 36 بإطار #3D5260 شمال)
// والصفحة 640 بيضا r6 حشو 48·56 مسافة 14 في النص تحت الشريط بـ40: الجهة 13 Medium رمادي · العنوان 22 Bold · سطور 14 (المفتاح Light يمين والقيمة Medium شمال) · ملاحظة زرقا.
export function DocPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast();
  const q = useQuery({ queryKey: ["shared", "doc", id], queryFn: () => api.shared.doc(id), enabled: !!id, retry: false });
  const dl = useMutation({
    mutationFn: () => api.shared.downloadDoc(id),
    onSuccess: () => toast("جاري التصدير", "جاري تجهيز الملف وسيصلك رابط التنزيل على بريدك خلال دقيقة"),
  });
  const d = q.data;
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70" />
        <Dialog.Content dir="rtl" onOpenAutoFocus={keepFocusQuiet} className="fixed inset-0 z-50 flex flex-col overflow-y-auto focus:outline-none" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div className="flex min-h-16 shrink-0 items-center gap-2.5 bg-ink px-4 py-2 sm:px-6">
            <Dialog.Title className="min-w-0 flex-1 truncate text-14 leading-[22px] font-medium text-white">
              {d ? (
                <>
                  {d.kind} · <bdi dir="ltr">{d.file}</bdi> · صفحة {d.page} من {d.pages}
                </>
              ) : (
                "معاينة مستند"
              )}
            </Dialog.Title>
            <Dialog.Description className="sr-only">معاينة للعرض فقط</Dialog.Description>
            <Button variant="secondary" className="h-[46px]! px-4 text-14" loading={dl.isPending} disabled={!d} onClick={() => dl.mutate()}>
              تنزيل
              <Icon name="download" size={16} />
            </Button>
            <Dialog.Close aria-label="إغلاق" className="flex size-9 shrink-0 items-center justify-center rounded-10 border border-[#3d5260] text-white hover:bg-white/10">
              <Icon name="x" size={16} />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 items-start justify-center px-4 pt-10 pb-10" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <article className="flex w-full max-w-[640px] flex-col gap-3.5 rounded-[6px] bg-white px-6 py-8 sm:px-14 sm:py-12">
              {q.isError ? (
                <p className="py-10 text-center text-13 text-muted">{isApiError(q.error, 404) ? "المستند غير موجود" : "تعذّر تحميل المستند"}</p>
              ) : !d ? (
                Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-5 w-full" />)
              ) : (
                <>
                  <p className="text-13 leading-5 font-medium text-muted">{d.authority}</p>
                  <h2 className="text-[22px] leading-[34px] font-bold text-ink">{d.title}</h2>
                  {d.fields.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3 text-14 leading-[22px]">
                      <span className="shrink-0 font-light text-muted">{k}</span>
                      <span className="min-w-0 text-end font-medium text-ink">{v}</span>
                    </div>
                  ))}
                  <InfoBox>معاينة للعرض فقط · التحقق من صلاحية المستند يتم في «الطلبات» عند رفعه، أو من ملف المزوّد.</InfoBox>
                </>
              )}
            </article>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** ملاحظة زرقا: النص يمين والأيقونة 16 شمال */
function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 leading-[21px] font-light text-ink">
      <p className="min-w-0 flex-1">{children}</p>
      <Icon name="info" size={16} className="mt-[2.5px] shrink-0" />
    </div>
  );
}

// ───────────── CON5-M00 · اتصال (3114-65329) ─────────────
// 480 · «الرقم» قائمة بأيقونة جوال · خيار «إرسال رسالة واتساب أعمال» (r12 بإطار · سهم شمال) · «نسخ الرقم» يمين و«اتصال» كحلي شمال
export function CallModal({ phones, refId, onClose }: { phones: string[]; refId: string; onClose: () => void }) {
  const toast = useToast();
  const list = phones.length ? phones : [""];
  const [num, setNum] = useState(list[0]);
  const opts = list.map((p) => ({ value: p, label: p ? fmtPhone(p) : "—" }));
  const call = useMutation({
    mutationFn: () => api.shared.logCall(refId, num),
    onSuccess: () => {
      if (num) window.location.href = `tel:${num}`;
      onClose();
      toast("أُرسل", "سُجّل التواصل مع العميل في سجل الحجز");
    },
  });
  const wa = useMutation({
    mutationFn: () => api.shared.sendWhatsapp(refId, num),
    onSuccess: () => {
      onClose();
      toast("أُرسل", "سُجّل التواصل مع العميل في سجل الحجز");
    },
  });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(num);
    } catch {
      /* المتصفح رفض الحافظة — النافذة تتقفل برضه */
    }
    onClose();
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} width={480} title="الاتصال" subtitle="يُسجَّل الاتصال في سجل الطلب أو الحجز">
      <Field label="الرقم">{(id) => <Select id={id} value={num} onChange={setNum} options={opts} icon="phone" className={`${F42} [&>span]:text-start! [&>span]:[direction:ltr]`} />}</Field>
      <button
        type="button"
        onClick={() => wa.mutate()}
        disabled={wa.isPending || !num}
        className="flex items-center gap-2.5 rounded-12 border border-border bg-white px-3 py-2.5 text-start hover:bg-surface-1 disabled:opacity-60"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-13 leading-5 font-medium text-ink">إرسال رسالة واتساب أعمال</span>
          <span className="text-12 leading-[18px] font-light text-muted">قالب رسالة جاهز</span>
        </span>
        <Icon name="chevron-left" size={16} className="shrink-0 text-ink" />
      </button>
      <Pair
        first={
          <Button variant="secondary" className="h-[46px]! text-14" onClick={copy} disabled={!num}>
            نسخ الرقم
            <Icon name="copy" size={16} />
          </Button>
        }
        second={
          <Button className="h-11! text-14" loading={call.isPending} disabled={!num} onClick={() => call.mutate()}>
            اتصال
            <Icon name="phone" size={16} />
          </Button>
        }
      />
    </Modal>
  );
}

// ───────────── CON5-M00 · إسناد لمسؤول (3114-65356) ─────────────
// 520 · القسم · المسؤول · مهلة الرد (أيقونة ساعة) · «إلغاء» + «إسناد» كحلي.
// TODO(Figma): الإطار مخفي فيه حقل «المسؤول» وزر «إسناد» (باقي «إلغاء» بس) — متطبّقين من الدليل (القسم 15 · صفحة 227).
export function AssignModal({ refId, onClose }: { refId: string; onClose: () => void }) {
  const toast = useToast();
  const [dep, setDep] = useState(ASSIGN_DEPARTMENTS[0].value);
  const [who, setWho] = useState(ASSIGNEES[ASSIGN_DEPARTMENTS[0].value][0].value);
  const [deadline, setDeadline] = useState(ASSIGN_DEADLINES[1].value);
  const m = useMutation({
    mutationFn: () => api.shared.assign(refId, { department: dep, assignee: who, deadline }),
    onSuccess: () => {
      onClose();
      toast("أُسند الطلب", "أُسند الطلب وأُبلغ المسؤول · يظهر اسمه في عمود «المسؤول»");
    },
  });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && onClose()} width={520} title="إسناد لمسؤول" subtitle="يظهر الطلب في قائمة المسؤول ويُرسل له تنبيه">
      <Field label="القسم">
        {(id) => (
          <Select
            id={id}
            value={dep}
            onChange={(v) => {
              setDep(v);
              setWho(ASSIGNEES[v]?.[0]?.value ?? "");
            }}
            options={ASSIGN_DEPARTMENTS}
            icon="chevron-down"
            className={F42}
          />
        )}
      </Field>
      <Field label="المسؤول">{(id) => <Select id={id} value={who} onChange={setWho} options={ASSIGNEES[dep] ?? []} icon="chevron-down" className={F42} />}</Field>
      <Field label="مهلة الرد">{(id) => <Select id={id} value={deadline} onChange={setDeadline} options={ASSIGN_DEADLINES} icon="clock" className={F42} />}</Field>
      <Pair
        first={
          <Button variant="secondary" className="h-[46px]! text-14" onClick={onClose} disabled={m.isPending}>
            إلغاء
          </Button>
        }
        second={
          <Button className="h-11! text-14" loading={m.isPending} disabled={!who} onClick={() => m.mutate()}>
            إسناد
          </Button>
        }
      />
    </Modal>
  );
}

// ───────────── CON5-M00 · ملاحظة داخلية (3114-65387) ─────────────
// 520 · «لفريق لينكار فقط» · حقل «الملاحظة» 42 · «إلغاء» يمين و«حفظ» كحلي + ✓ شمال
export function NoteModal({ refId, onClose }: { refId: string; onClose: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string>();
  const m = useMutation({
    mutationFn: () => api.shared.saveNote(refId, note),
    onSuccess: () => {
      onClose();
      toast("حُفظت الملاحظة", "حُفظت الملاحظة الداخلية في سجل الطلب (لا تظهر للمزوّد ولا العميل)");
    },
    onError: (e) => setErr(isApiError(e) && e.fields?.note ? e.fields.note : "تعذّر الحفظ. حاول مرة أخرى."),
  });
  const leave = () => (note.trim() && !m.isSuccess && !window.confirm("لديك بيانات غير محفوظة. هل تريد الخروج؟") ? null : onClose());
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && leave()} width={520} title="ملاحظة داخلية" subtitle="لفريق لينكار فقط">
      <form onSubmit={(e) => (e.preventDefault(), note.trim() ? m.mutate() : setErr("اكتب الملاحظة"))} className="flex flex-col gap-3.5" noValidate>
        <Field required label="الملاحظة" error={err}>
          {(id) => (
            <TextInput
              id={id}
              value={note}
              onChange={(e) => (setNote(e.target.value), setErr(undefined))}
              invalid={!!err}
              placeholder="تواصلتُ مع الفرع وأكد توفر الفني يوم 15 أكتوبر 2026."
              className="h-[42px]! [&_input]:text-14! [&_input]:font-normal! [&_input]:placeholder:font-normal! [&_input]:placeholder:text-[#9aa39f]!"
            />
          )}
        </Field>
        <Pair
          first={
            <Button type="button" variant="secondary" className="h-[46px]! text-14" onClick={leave} disabled={m.isPending}>
              إلغاء
            </Button>
          }
          second={
            <Button type="submit" className="h-11! text-14" loading={m.isPending}>
              حفظ
              <Icon name="check" size={16} />
            </Button>
          }
        />
      </form>
    </Modal>
  );
}
