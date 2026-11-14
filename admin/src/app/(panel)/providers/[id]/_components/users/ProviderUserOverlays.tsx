"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import type { ProviderProfile } from "@/lib/api/profile";
import { KIND_OPTIONS, type ProviderUserKind, type ProviderUserRow } from "@/lib/api/provider-users";
import { phone } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";

// نوافذ مستخدمي لوحة المزوّد (القسم 14 · CON5-07M) — حالتها في الرابط ?modal=pu-*&u=<id> عشان زر الرجوع يقفلها.
// النوافذ كلها: r20 · حشو 24 · مسافة 14 · العنوان 18 Bold (+ سطر 13 Light) · زر الإغلاق 36 r10 · حقول 44 r10 نص 14 Regular
// الأزرار تحت بعرض متساوي (46 بإطار + 44 ملوّن) بفاصل 10.
export function ProviderUserOverlays({ profile }: { profile: ProviderProfile }) {
  const url = useUrlState();
  const modal = url.get("modal");
  const uid = url.get("u");
  const pid = profile.provider.id;
  const q = useQuery({
    queryKey: ["providers", "users", pid, "one", uid],
    queryFn: () => api.providerUsers.get(pid, uid!),
    enabled: !!uid && !!modal?.startsWith("pu-"),
  });
  const close = () => url.replace({ modal: null, u: null, opt: null });
  if (modal === "pu-add") return <UserFormModal profile={profile} close={close} />;
  if (!modal?.startsWith("pu-") || !uid || !q.data) return null;
  const props = { profile, user: q.data, close };
  switch (modal) {
    case "pu-edit":
      return <UserFormModal {...props} />;
    case "pu-manage":
      return <ManageModal {...props} onPhone={() => url.replace({ modal: "pu-phone", u: uid, opt: null })} />;
    case "pu-delete":
      return <DeleteModal {...props} />;
    case "pu-phone":
      return <PhoneModal {...props} />;
    default:
      return null;
  }
}

type P = { profile: ProviderProfile; user: ProviderUserRow; close: () => void };
const brand = (p: ProviderProfile) => p.provider.short || p.provider.name;

function useDone(close: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return (title: string, body: string) => {
    qc.invalidateQueries({ queryKey: ["providers"] });
    close();
    toast(title, body);
  };
}

/** حقول CON5-07M للمستخدمين: 44 · نص 14 Regular · النص المؤقت #9AA39F */
const INPUT = "[&_input]:text-14! [&_input]:font-normal! [&_input]:placeholder:font-normal! [&_input]:placeholder:text-[#9aa39f]!";
const SELECT = "[&>span]:text-14! [&>span]:font-normal!";

/** «إلغاء» (46 بإطار) والزر الرئيسي (44) بعرض متساوي — `cancelFirst` = الإلغاء يمين (نافذة الحذف) */
function Actions({ onCancel, busy, children, cancelFirst }: { onCancel: () => void; busy?: boolean; children: ReactNode; cancelFirst?: boolean }) {
  const cancel = (
    <Button type="button" variant="secondary" className="h-[46px] text-14" onClick={onCancel} disabled={busy}>
      إلغاء
    </Button>
  );
  return (
    <div className="flex items-center gap-2.5 [&>*]:min-w-0 [&>*]:flex-1">
      {cancelFirst ? cancel : null}
      {children}
      {cancelFirst ? null : cancel}
    </div>
  );
}

/** ملاحظة زرقا: النص يمين والأيقونة 16 شمال (Figma «Note» · #E7F0F8 r12 حشو 12) */
function MNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-12 bg-info-tint p-3 text-13 leading-[21px] font-light text-ink">
      <p className="min-w-0 flex-1">{children}</p>
      <Icon name="info" size={16} className="mt-[2.5px] shrink-0" />
    </div>
  );
}

// ───────────── CON5-07M · إضافة مستخدم · جونسون (3260-251686) / تعديل مستخدم · فهد العتيبي (3298-133194) ─────────────
// القسم 18.1: الاسم والجوال والدور والفرع بس (حقل البريد محذوف) · الفرع إلزامي لمدير/فني الفرع ولا يظهر للمالك في الإضافة.
const schema = z
  .object({
    name: z.string().trim().min(2, "اكتب الاسم الكامل"),
    phone: z
      .string()
      .trim()
      .refine((v) => /^05\d{8}$/.test(v.replace(/\s/g, "")), "اكتب جوالاً صحيحاً يبدأ بـ05 (10 أرقام)"),
    kind: z.enum(["owner", "manager", "technician"]),
    branchId: z.string(),
  })
  .refine((v) => v.kind === "owner" || !!v.branchId, { path: ["branchId"], message: "اختر الفرع" });
type Form = z.infer<typeof schema>;

function UserFormModal({ profile, user, close }: { profile: ProviderProfile; user?: ProviderUserRow; close: () => void }) {
  const pid = profile.provider.id;
  const done = useDone(close);
  const branches = useQuery({
    queryKey: ["providers", "users", pid, "branches"],
    queryFn: () => api.providerUsers.branchOptions(pid),
  });
  const opts = branches.data ?? [];
  const f = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: user
      ? { name: user.name, phone: phone(user.phone), kind: user.kind, branchId: user.branchId ?? "" }
      : { name: "", phone: "", kind: "manager", branchId: opts[0]?.value ?? "" },
  });
  const kind = useWatch({ control: f.control, name: "kind" });
  // الافتراضي في الإضافة: أول فرع معتمد (Figma: «فرع الزهراء»)
  const branchId = useWatch({ control: f.control, name: "branchId" });
  const first = opts[0]?.value;
  useEffect(() => {
    if (!user && !branchId && first) f.setValue("branchId", first);
  }, [user, branchId, first, f]);
  const m = useMutation({
    mutationFn: (v: Form) => {
      const input = { name: v.name, phone: v.phone, kind: v.kind as ProviderUserKind, branchId: v.kind === "owner" ? null : v.branchId };
      return user ? api.providerUsers.update(pid, user.id, input) : api.providerUsers.create(pid, input);
    },
    onSuccess: (_r, v) =>
      user ? done("حُفظت بيانات المستخدم", `حُفظت بيانات ${v.name.trim()}`) : done("أُضيف المستخدم", `أُضيف المستخدم إلى حساب ${profile.provider.name}`),
    onError: (e) => {
      if (isApiError(e) && e.fields) for (const [k, msg] of Object.entries(e.fields)) f.setError(k as keyof Form, { message: msg });
    },
  });
  const e = f.formState.errors;
  const leave = () => (f.formState.isDirty && !m.isSuccess && !window.confirm("لديك بيانات غير محفوظة. هل تريد الخروج؟") ? null : close());
  const showBranch = !!user || kind !== "owner";
  const branchOptions = kind === "owner" ? [{ value: "", label: "كل الفروع" }] : opts;
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && leave()}
      width={520}
      title={user ? `تعديل بيانات ${user.name}` : "إضافة مستخدم"}
      subtitle={user ? undefined : brand(profile)}
    >
      <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="flex flex-col gap-3.5" noValidate>
        <Field required label="الاسم" error={e.name?.message}>
          {(id) => <TextInput id={id} {...f.register("name")} placeholder="الاسم الكامل" invalid={!!e.name} className={INPUT} autoComplete="off" />}
        </Field>
        <Field required label="رقم الجوال" error={e.phone?.message}>
          {(id) => <TextInput id={id} {...f.register("phone")} placeholder="05XXXXXXXX" invalid={!!e.phone} inputMode="tel" ltr className={INPUT} autoComplete="off" />}
        </Field>
        <Field required label="الدور" error={e.kind?.message}>
          {(id) => (
            <Controller
              control={f.control}
              name="kind"
              render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={KIND_OPTIONS} icon="chevron-down" invalid={!!e.kind} className={SELECT} />}
            />
          )}
        </Field>
        {showBranch ? (
          <Field required label="الفرع" error={e.branchId?.message}>
            {(id) => (
              <Controller
                control={f.control}
                name="branchId"
                render={({ field }) => (
                  <Select
                    id={id}
                    value={kind === "owner" ? "" : field.value}
                    onChange={field.onChange}
                    options={branchOptions}
                    icon="chevron-down"
                    placeholder="اختر الفرع"
                    disabled={kind === "owner"}
                    invalid={!!e.branchId}
                    className={SELECT}
                  />
                )}
              />
            )}
          </Field>
        ) : null}
        <Actions onCancel={leave} busy={m.isPending}>
          <Button type="submit" variant="accent" className="h-11! text-14" loading={m.isPending}>
            {user ? "حفظ التعديلات" : "إضافة المستخدم"}
          </Button>
        </Actions>
      </form>
    </Modal>
  );
}

// ───────────── CON5-07M · إدارة المستخدم · فهد العتيبي (3114-54165) ─────────────
// القسم 18.1: خيار «إعادة تعيين كلمة المرور» محذوف (الدخول بالجوال + رمز التحقق) — يبقى تحديث الجوال وإيقاف الحساب.
// يفتح من «إيقاف مؤقت» في قائمة الصف (الإيقاف مختار) · حساب المالك: الإيقاف معطّل والجوال مختار.
type Opt = "phone" | "pause";
function ManageModal({ profile, user, close, onPhone }: P & { onPhone: () => void }) {
  const pid = profile.provider.id;
  const owner = user.kind === "owner";
  const url = useUrlState();
  const [opt, setOpt] = useState<Opt>(owner ? "phone" : url.get("opt") === "phone" ? "phone" : "pause");
  const done = useDone(close);
  const m = useMutation({
    mutationFn: () => api.providerUsers.pause(pid, user.id),
    onSuccess: () => done("أُوقف الحساب", `أُوقف حساب ${user.name}`),
  });
  const OPTS: { key: Opt; label: string; hint: string; disabled?: boolean }[] = [
    { key: "phone", label: "تحديث رقم الجوال", hint: "بطلب من المالك؛ يُرسل رمز تحقق للجديد قبل التغيير" },
    { key: "pause", label: "إيقاف الحساب", hint: "لا يُوقف حساب المالك إلا بإيقاف المنشأة", disabled: owner },
  ];
  const sub = [brand(profile), user.roleLabel, user.branchLabel].join(" · ");
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && close()}
      width={520}
      title={`إدارة حساب ${user.name}`}
      subtitle={
        <>
          {sub} · <bdi dir="ltr">{phone(user.phone)}</bdi>
        </>
      }
    >
      <div role="radiogroup" aria-label="الإجراء" className="flex flex-col gap-3.5">
        {OPTS.map((o) => {
          const on = opt === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={o.disabled}
              onClick={() => setOpt(o.key)}
              className={`flex items-start gap-2.5 rounded-12 px-3.5 py-3 text-start disabled:cursor-not-allowed disabled:opacity-60 ${on ? "border-[1.5px] border-ink bg-lime-tint" : "border border-border bg-white enabled:hover:bg-surface-1"}`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-14 leading-[22px] font-medium text-ink">{o.label}</span>
                <span className="text-12 leading-[18px] font-light text-muted">{o.hint}</span>
              </span>
              <span aria-hidden className={`size-[18px] shrink-0 rounded-full ${on ? "border-[5px] border-ink" : "border-[1.5px] border-border-strong"}`} />
            </button>
          );
        })}
      </div>
      <MNote>كل إجراء يُسجَّل في «سجل التدقيق» ويصل المالك إشعار به.</MNote>
      <Actions onCancel={close} busy={m.isPending}>
        <Button type="button" className="h-11! text-14" loading={m.isPending} onClick={() => (opt === "phone" ? onPhone() : m.mutate())}>
          تنفيذ
        </Button>
      </Actions>
    </Modal>
  );
}

// ───────────── CON5-07M · حذف المستخدم · فهد العتيبي (3298-133170) ─────────────
// 560 · العنوان «حذف حساب …» + «حذف المستخدم» أحمر (#D93131) شمال و«إلغاء» يمين. (شرائح «النطاق» مخفية في الإطار)
function DeleteModal({ profile, user, close }: P) {
  const done = useDone(close);
  const toast = useToast();
  const m = useMutation({
    mutationFn: () => api.providerUsers.remove(profile.provider.id, user.id),
    onSuccess: () => done("حُذف الحساب", `حُذف حساب ${user.name}`),
    onError: (e) => toast("تعذّر الحذف", isApiError(e) ? e.message : "حدث خطأ. حاول مرة أخرى."),
  });
  return (
    <Modal open onOpenChange={(o) => !o && !m.isPending && close()} width={560} title={`حذف حساب ${user.name}`}>
      <Actions onCancel={close} busy={m.isPending} cancelFirst>
        <Button type="button" variant="danger" className="h-11! bg-[#d93131]! text-14 hover:bg-[#d93131]/90!" loading={m.isPending} onClick={() => m.mutate()}>
          حذف المستخدم
        </Button>
      </Actions>
    </Modal>
  );
}

// ───────────── CON5-07M · تحديث جوال المالك · جونسون (3114-54351) ─────────────
// يفتح من طلب REQ-2026-0429 (CON5-03D) أو من «إدارة المستخدم ← تحديث رقم الجوال». 560 · الجوال الجديد + الاسم (رمادي للقراءة) في صف
// ثم الجوال الحالي (رمادي) ومصدر الطلب والملاحظة الزرقا.
function PhoneModal({ profile, user, close }: P) {
  const pid = profile.provider.id;
  const owner = user.kind === "owner";
  const done = useDone(close);
  const reqs = useQuery({ queryKey: ["providers", "users", pid, "phone-requests"], queryFn: () => api.providerUsers.phoneRequests(pid) });
  const [next, setNext] = useState("");
  const [req, setReq] = useState<string>();
  const [err, setErr] = useState<string>();
  const list = reqs.data ?? [];
  const request = list.find((r) => r.id === req) ?? (owner ? list[0] : undefined);
  const m = useMutation({
    mutationFn: () => api.providerUsers.updatePhone(pid, user.id, { phone: next, request: request?.id }),
    onSuccess: (r) =>
      done(
        owner ? "تحديث جوال المالك" : "تحديث جوال الدخول",
        `حُدّث جوال دخول ${user.name} بعد التحقق${r.request ? ` · نُفّذ الطلب ${r.request.short}` : ""}`,
      ),
    onError: (e) => setErr(isApiError(e) && e.fields?.phone ? e.fields.phone : "تعذّر التحديث. حاول مرة أخرى."),
  });
  const submit = () => {
    if (!/^05\d{8}$/.test(next.replace(/\s/g, ""))) return setErr("اكتب جوالاً صحيحاً يبدأ بـ05 (10 أرقام)");
    setErr(undefined);
    m.mutate();
  };
  const leave = () => (next && !window.confirm("لديك بيانات غير محفوظة. هل تريد الخروج؟") ? null : close());
  const ro = "flex h-11 items-center rounded-10 border border-border bg-surface-1 px-3 text-14 text-ink";
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && leave()}
      width={560}
      title={owner ? "تحديث جوال دخول المالك" : `تحديث جوال دخول ${user.name}`}
      subtitle={owner ? `${brand(profile)} · حساب المالك تديره لينكار` : `${brand(profile)} · ${user.roleLabel} · ${user.branchLabel}`}
    >
      <form onSubmit={(ev) => (ev.preventDefault(), submit())} className="flex flex-col gap-3.5" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="الاسم">
            {(id) => (
              <div id={id} className={ro}>
                <span className="truncate">
                  {user.name} · {user.roleLabel}
                </span>
              </div>
            )}
          </Field>
          <Field required label="الجوال الجديد" error={err}>
            {(id) => (
              <TextInput
                id={id}
                value={next}
                onChange={(ev) => (setNext(ev.target.value), setErr(undefined))}
                placeholder="05XXXXXXXX"
                inputMode="tel"
                ltr
                invalid={!!err}
                className={`${INPUT} [&_input]:text-start!`}
                autoComplete="off"
              />
            )}
          </Field>
        </div>
        <Field label="الجوال الحالي">
          {(id) => (
            <div id={id} className={ro}>
              <bdi dir="ltr">{phone(user.phone)}</bdi>
            </div>
          )}
        </Field>
        {list.length ? (
          <Field label="مصدر الطلب">
            {(id) => (
              <Select
                id={id}
                value={request?.id}
                onChange={setReq}
                options={list.map((r) => ({ value: r.id, label: r.label }))}
                icon="chevron-down"
                placeholder="اختر الطلب"
                className={SELECT}
              />
            )}
          </Field>
        ) : null}
        <MNote>
          يُرسل رمز تحقق للرقم الجديد، ولا يتغير جوال الدخول حتى يُدخله المالك.
          {request ? ` يُنفَّذ الطلب ${request.short} ويصل المالك إشعار.` : " ويصل المالك إشعار."}
        </MNote>
        <Actions onCancel={leave} busy={m.isPending}>
          <Button type="submit" variant="accent" className="h-11! text-14" loading={m.isPending}>
            تحديث وإرسال الرمز
          </Button>
        </Actions>
      </form>
    </Modal>
  );
}
