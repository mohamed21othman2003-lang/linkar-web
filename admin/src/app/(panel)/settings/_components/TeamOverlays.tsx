"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { DrawerHero, KV, Tile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { SCOPES, type PanelUser, type Role } from "@/lib/api/users";
import { arDate } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";

// الدرج والنوافذ فوق «المستخدمون والصلاحيات» — حالتها في الرابط (القسم 2.3):
// ?user=<id> درج التفاصيل · ?modal=invite|edit|suspend|delete-invite (&user=<id>)
const SCOPE_OPTIONS = SCOPES.map((s) => ({ value: s, label: s }));
// TODO(designer): Figma بيعرض «انتهاء العمل» بس — باقي أسباب الإيقاف لحد ما توصل القائمة
const SUSPEND_REASONS = ["انتهاء العمل", "إجازة طويلة", "تغيير المهام", "مخالفة سياسة الاستخدام"].map((s) => ({ value: s, label: s }));

const confirmDiscard = () => window.confirm("لديك تغييرات غير محفوظة. هل تريد الإغلاق دون حفظ؟");

export function useTeamData() {
  const users = useQuery({ queryKey: ["users", "list"], queryFn: () => api.users.list() });
  const roles = useQuery({ queryKey: ["roles", "list"], queryFn: () => api.roles.list() });
  return { users, roles };
}

export function TeamOverlays() {
  const url = useUrlState();
  const modal = url.get("modal");
  const userId = url.get("user");
  const { users, roles } = useTeamData();
  const user = users.data?.items.find((u) => u.id === userId);
  const close = () => url.replace({ modal: null, user: null });

  return (
    <>
      <UserDrawer open={!!userId && !modal} user={user} loading={users.isLoading} roles={roles.data?.items} onClose={close} />
      {modal === "invite" ? <InviteModal roles={roles.data?.items ?? []} onClose={close} /> : null}
      {modal === "edit" && user ? <EditModal user={user} roles={roles.data?.items ?? []} onClose={close} /> : null}
      {modal === "suspend" && user ? <SuspendModal user={user} onClose={close} /> : null}
      {modal === "delete-invite" && user ? <DeleteInviteModal user={user} onClose={close} /> : null}
    </>
  );
}

// ───────────── الدرج ─────────────
export function lastLoginLabel(u: PanelUser, withCity = false) {
  if (u.lastLogin === "now") return withCity && u.lastCity ? `الآن · ${u.lastCity}` : "الآن";
  if (!u.lastLogin) return withCity ? "لم تسجّل الدخول بعد" : "—";
  const d = arDate(u.lastLogin);
  return withCity && u.lastCity ? `${d} · ${u.lastCity}` : d;
}

export function StatusPill({ u }: { u: PanelUser }) {
  if (u.status === "invited") return <Pill size="S" tone="pending">دعوة معلّقة</Pill>;
  if (u.status === "suspended") return <Pill size="S" tone="danger">موقوف</Pill>;
  return <Pill size="S" tone="success">نشط</Pill>;
}

// CON5-23D · تفاصيل المستخدم (3114-24862 نوف · 3114-24902 لينا · 3114-25031 ريما)
function UserDrawer({ open, user, loading, roles, onClose }: { open: boolean; user?: PanelUser; loading: boolean; roles?: Role[]; onClose: () => void }) {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const resend = useMutation({
    mutationFn: (id: string) => api.users.resendInvite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast("أُعيدت الدعوة", "أُعيد إرسال الدعوة");
    },
  });
  const role = roles?.find((r) => r.id === user?.roleId);
  const roleTitle = user?.roleTitle ?? role?.name ?? "";
  const canEdit = useCan("users", "edit");

  const footer = !user || user.isMe || !canEdit ? undefined : user.status === "invited" ? (
    <>
      <Button loading={resend.isPending} onClick={() => resend.mutate(user.id)}>
        إعادة الإرسال
      </Button>
      <Button variant="secondary" className="text-danger-strong!" onClick={() => url.push({ modal: "delete-invite", user: user.id })}>
        حذف الدعوة
      </Button>
    </>
  ) : (
    <>
      <Button onClick={() => url.push({ modal: "edit", user: user.id })}>تعديل</Button>
      {user.status === "suspended" ? null : (
        <Button variant="secondary" className="text-danger-strong!" onClick={() => url.push({ modal: "suspend", user: user.id })}>
          إيقاف
        </Button>
      )}
    </>
  );

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} title={user?.name ?? (loading ? "…" : "غير موجود")} subtitle={roleTitle || undefined} footer={footer}>
      {user ? (
        <>
          <DrawerHero
            subtitle={
              <bdi dir="ltr">
                {user.email}
                {user.phoneMasked ? ` · ${user.phoneMasked}` : ""}
              </bdi>
            }
            aside={<StatusPill u={user} />}
          />
          <Tile title="الحساب">
            <KV k="الدور">{roleTitle}</KV>
            <KV k="النطاق">{user.scope}</KV>
            <KV k="آخر دخول">{lastLoginLabel(user, true)}</KV>
            <KV k="التحقق بخطوتين">{user.status === "invited" ? "بعد قبول الدعوة" : user.mfa ? "مفعّل" : "غير مفعّل"}</KV>
          </Tile>
          {user.isMe ? <Note>لا يمكنك إيقاف حسابك أو تغيير دورك.</Note> : null}
        </>
      ) : loading ? (
        <div className="flex flex-col gap-3.5">
          <Skeleton className="h-[84px] w-full rounded-[18px]" />
          <Skeleton className="h-[170px] w-full rounded-14" />
        </div>
      ) : (
        <Note tone="neutral">لم يعد هذا المستخدم موجوداً.</Note>
      )}
    </Drawer>
  );
}

// ───────────── النوافذ ─────────────
const phoneRe = /^05\d{8}$/;
const inviteSchema = z.object({
  name: z.string().trim().min(2, "اكتب الاسم"),
  phone: z.string().refine((v) => phoneRe.test(v.replace(/\s/g, "")), "رقم الجوال غير صحيح (05XXXXXXXX)"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => /^[^\s@]+@linkar\.sa$/.test(v), "استخدم البريد المؤسسي على نطاق @linkar.sa"),
  roleId: z.string().min(1, "اختر الدور"),
  scope: z.string().min(1),
});
type InviteForm = z.infer<typeof inviteSchema>;

function roleOptions(roles: Role[]) {
  return roles.map((r) => ({ value: r.id, label: r.name }));
}

// CON5-23M · دعوة مستخدم (3114-25249)
function InviteModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const form = useForm<InviteForm>({ resolver: zodResolver(inviteSchema), defaultValues: { name: "", phone: "", email: "", roleId: "", scope: "كل المدن" } });
  const { errors, isDirty } = form.formState;
  const m = useMutation({
    mutationFn: (v: InviteForm) => api.users.invite(v),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      onClose();
      toast("أُرسلت الدعوة", `أُرسلت الدعوة إلى ${v.email}`);
    },
    onError: (e) => {
      if (isApiError(e) && e.fields?.email) form.setError("email", { message: e.fields.email });
    },
  });
  const tryClose = () => !m.isPending && (!isDirty || confirmDiscard()) && onClose();

  return (
    <Modal open onOpenChange={(o) => !o && tryClose()} title="دعوة مستخدم" width={560}>
      <form onSubmit={form.handleSubmit((v) => m.mutate(v))} noValidate className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الاسم" error={errors.name?.message}>
            {(id) => <TextInput id={id} placeholder="مازن الشهري" invalid={!!errors.name} {...form.register("name")} />}
          </Field>
          <Field label="الجوال" error={errors.phone?.message}>
            {(id) => <TextInput id={id} ltr inputMode="tel" placeholder="056 210 3344" className="num" invalid={!!errors.phone} {...form.register("phone")} />}
          </Field>
        </div>
        <Field label="البريد المؤسسي" error={errors.email?.message} hint="نطاق @linkar.sa فقط">
          {(id) => <TextInput id={id} ltr type="email" placeholder="mazen@linkar.sa" invalid={!!errors.email} {...form.register("email")} />}
        </Field>
        <Field label="الدور" error={errors.roleId?.message}>
          {(id) => (
            <Controller
              control={form.control}
              name="roleId"
              render={({ field }) => <Select id={id} value={field.value || undefined} onChange={field.onChange} options={roleOptions(roles)} placeholder="اختر الدور" invalid={!!errors.roleId} />}
            />
          )}
        </Field>
        <Field label="النطاق">
          {(id) => <Controller control={form.control} name="scope" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={SCOPE_OPTIONS} />} />}
        </Field>
        <Note>تصله رسالة لإنشاء كلمة المرور وتفعيل التحقق بخطوتين خلال 48 ساعة.</Note>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button type="submit" loading={m.isPending}>
            إرسال الدعوة
          </Button>
          <Button variant="secondary" onClick={tryClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const editSchema = z.object({
  name: z.string().trim().min(2, "اكتب الاسم"),
  phone: z.string().refine((v) => v.includes("•") || phoneRe.test(v.replace(/\s/g, "")), "رقم الجوال غير صحيح (05XXXXXXXX)"),
  roleId: z.string().min(1, "اختر الدور"),
  scope: z.string().min(1),
});
type EditForm = z.infer<typeof editSchema>;

// CON5-23M · تعديل · لينا الحربي (3114-25074)
function EditModal({ user, roles, onClose }: { user: PanelUser; roles: Role[]; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const form = useForm<EditForm>({ resolver: zodResolver(editSchema), defaultValues: { name: user.name, phone: user.phoneMasked, roleId: user.roleId, scope: user.scope } });
  const { errors, isDirty } = form.formState;
  const m = useMutation({
    mutationFn: (v: EditForm) => api.users.update(user.id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      onClose();
      toast("حُفظت البيانات", "حُفظت بيانات المستخدم");
    },
  });
  const tryClose = () => !m.isPending && (!isDirty || confirmDiscard()) && onClose();

  return (
    <Modal open onOpenChange={(o) => !o && tryClose()} title={`تعديل ${user.name}`} width={500}>
      <form onSubmit={form.handleSubmit((v) => m.mutate(v))} noValidate className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="الاسم" error={errors.name?.message}>
            {(id) => <TextInput id={id} invalid={!!errors.name} {...form.register("name")} />}
          </Field>
          <Field label="الجوال" error={errors.phone?.message}>
            {(id) => <TextInput id={id} ltr inputMode="tel" className="num" invalid={!!errors.phone} {...form.register("phone")} />}
          </Field>
        </div>
        <Field label="الدور" error={errors.roleId?.message}>
          {(id) => <Controller control={form.control} name="roleId" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={roleOptions(roles)} disabled={user.isMe} />} />}
        </Field>
        <Field label="النطاق">
          {(id) => <Controller control={form.control} name="scope" render={({ field }) => <Select id={id} value={field.value} onChange={field.onChange} options={SCOPE_OPTIONS} />} />}
        </Field>
        <div className="flex gap-2.5 [&>*]:flex-1">
          <Button type="submit" loading={m.isPending}>
            حفظ
          </Button>
          <Button variant="secondary" onClick={tryClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// CON5-23M · إيقاف · لينا الحربي (3114-25106)
function SuspendModal({ user, onClose }: { user: PanelUser; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [reason, setReason] = useState(SUSPEND_REASONS[0].value);
  const m = useMutation({
    mutationFn: () => api.users.suspend(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      onClose();
      toast("أُوقف الحساب", "أُوقف الحساب وأُغلقت جلساته");
    },
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && onClose()}
      title={`إيقاف حساب ${user.name}`}
      width={500}
      footer={
        <>
          <Button variant="danger" loading={m.isPending} onClick={() => m.mutate()}>
            إيقاف الحساب
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </>
      }
    >
      <Field label="السبب">{(id) => <Select id={id} value={reason} onChange={setReason} options={SUSPEND_REASONS} />}</Field>
      <Note tone="warning">تُغلق جلسات المستخدم فوراً ولا يستطيع الدخول. سجل نشاطه يبقى في «سجل التدقيق».</Note>
      {m.isError ? <p className="text-12 text-danger">تعذّر إيقاف الحساب، حاول مرة أخرى.</p> : null}
    </Modal>
  );
}

// CON5-23M · حذف الدعوة · ريما القرشي (3114-25233)
function DeleteInviteModal({ user, onClose }: { user: PanelUser; onClose: () => void }) {
  const toast = useToast();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => api.users.deleteInvite(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      onClose();
      toast("حُذفت الدعوة", "حُذفت الدعوة");
    },
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && onClose()}
      title={`حذف دعوة ${user.name}`}
      width={500}
      footer={
        <>
          <Button variant="danger" loading={m.isPending} onClick={() => m.mutate()}>
            حذف الدعوة
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={m.isPending}>
            إلغاء
          </Button>
        </>
      }
    >
      <Note tone="warning">
        يتعطل رابط الدعوة المرسل إلى <bdi dir="ltr">{user.email}</bdi>.
      </Note>
      {m.isError ? <p className="text-12 text-danger">تعذّر حذف الدعوة، حاول مرة أخرى.</p> : null}
    </Modal>
  );
}
