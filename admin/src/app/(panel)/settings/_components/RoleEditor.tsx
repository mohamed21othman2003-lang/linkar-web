"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EmptyState, PageHead } from "@/components/panel/PageHead";
import { isCancelled, useSensitive } from "@/components/panel/Sensitive";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import { ACTIONS, MODULES, SCOPES, SENSITIVE, type Grant, type ModuleName, type PanelUser, type RoleInput, type SensitiveKey } from "@/lib/api/users";
import { useCan } from "@/lib/use-me";

// CON5-23R · محرر الدور (3114-25621 مدير العمليات · 3114-25352 مدير النظام للعرض فقط · وباقي الأدوار 3114-25890 … 27506)
// المسار /settings/roles/[id] — مصفوفة: صف لكل وحدة وأربعة أعمدة (عرض، إضافة وتعديل، قرار واعتماد، إلغاء وحذف)،
// وقسم «صلاحيات حساسة» مفاتيح منفصلة. «حفظ الدور» صلاحية حساسة → الخادم يرد 428 → نافذة «رمز التحقق» (CON5-23M 3114-25289).
const SCOPE_OPTIONS = SCOPES.map((s) => ({ value: s, label: s }));
const LEAVE = "لديك تغييرات غير محفوظة على الدور. هل تريد المغادرة دون حفظ؟";

const blank = (): RoleInput => ({
  name: "",
  scope: "كل المدن",
  grants: Object.fromEntries(MODULES.map((m) => [m, [false, false, false, false]])) as Record<ModuleName, Grant>,
  sensitive: Object.fromEntries(SENSITIVE.map((s) => [s.key, false])) as Record<SensitiveKey, boolean>,
});

function membersLabel(members: PanelUser[], count: number) {
  if (!count && !members.length) return "لا أعضاء حالياً";
  const shown = members.slice(0, 2).map((u) => (u.status === "invited" ? `${u.name} (دعوة معلّقة)` : u.name));
  const rest = Math.max(count, members.length) - shown.length;
  return [...shown, ...(rest > 0 ? [`+${rest}`] : [])].join(" · ");
}

export function RoleEditor({ id }: { id: string }) {
  const isNew = id === "new";
  const q = useQuery({ queryKey: ["roles", "detail", id], queryFn: () => api.roles.get(id), enabled: !isNew });
  const role = q.data?.role;

  if (!isNew && q.isLoading) return <EditorSkeleton />;
  if (!isNew && (q.isError || !role))
    return (
      <div className="rounded-16 border border-border bg-white">
        {isApiError(q.error, 404) ? (
          <EmptyState title="الدور غير موجود" action={<Link href="/settings/roles" className="text-13 font-medium text-success underline-offset-4 hover:underline">الرجوع إلى الأدوار</Link>} />
        ) : (
          <EmptyState title="تعذّر تحميل الدور" action={<Button variant="secondary" size="S" onClick={() => q.refetch()}>إعادة المحاولة</Button>} />
        )}
      </div>
    );

  const initial: RoleInput = role ? { name: role.name, scope: role.scope, grants: role.grants, sensitive: role.sensitive } : blank();
  return <Editor key={role?.updatedAt ?? id} id={isNew ? null : id} initial={initial} system={!!role?.system} description={role?.description} members={membersLabel(q.data?.members ?? [], role?.memberCount ?? 0)} />;
}

function Editor({ id, initial, system, description, members }: { id: string | null; initial: RoleInput; system: boolean; description?: string; members: string }) {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const sensitive = useSensitive();
  const canEdit = useCan("users", "edit");
  const readOnly = system || !canEdit;
  const [draft, setDraft] = useState<RoleInput>(initial);
  const [nameError, setNameError] = useState<string>();
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial]);

  // تأكيد قبل مغادرة نموذج غير محفوظ (القسم 2.7)
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  const leave = (href: string) => (!dirty || window.confirm(LEAVE)) && router.push(href);

  const save = useMutation({
    mutationFn: (v: RoleInput) =>
      sensitive.run((otp) => api.roles.save(id, v, otp), {
        title: "تأكيد حفظ الدور",
        description: `أدخل رمز التحقق من تطبيق المصادقة لحفظ صلاحيات «${v.name}».`,
        confirmLabel: "تأكيد وحفظ",
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      toast("حُفظ الدور", `حُفظت صلاحيات «${r.name}»`);
      if (!id) router.replace(`/settings/roles/${r.id}`);
    },
    onError: (e) => {
      if (isCancelled(e)) return;
      if (isApiError(e) && e.fields?.name) setNameError(e.fields.name);
      else toast("تعذّر الحفظ", "تعذّر حفظ الدور، حاول مرة أخرى");
    },
  });

  const submit = () => {
    if (!draft.name.trim()) return setNameError("اكتب اسم الدور");
    save.mutate(draft);
  };

  const toggle = (m: ModuleName, i: number) =>
    setDraft((d) => {
      const g = [...d.grants[m]] as Grant;
      g[i] = !g[i];
      // أي إجراء بيحتاج «عرض»، وشيل «عرض» بيشيل الباقي
      if (i > 0 && g[i]) g[0] = true;
      if (i === 0 && !g[0]) g.fill(false);
      return { ...d, grants: { ...d.grants, [m]: g } };
    });

  const title = id ? `الدور · ${initial.name}` : "دور جديد";

  return (
    <>
      {/* في Figma المسار متحاذي على الشمال (Breadcrumb 3114:25621) */}
      <nav aria-label="مسار الصفحة" className="flex items-center justify-end gap-1.5 text-13 leading-5 text-muted">
        <Crumb onClick={() => leave("/settings/users")}>المستخدمون والصلاحيات</Crumb>
        <span aria-hidden>‹</span>
        <Crumb onClick={() => leave("/settings/roles")}>الأدوار</Crumb>
        <span aria-hidden>‹</span>
        <span className="font-medium text-ink">{id ? initial.name : "دور جديد"}</span>
      </nav>

      <PageHead
        title={title}
        description={description || (id ? undefined : "حدّد اسم الدور ونطاقه وصلاحياته في كل وحدة.")}
        actions={
          <>
            <Button variant="secondary" className="h-11!" onClick={() => leave("/settings/roles")}>
              رجوع
            </Button>
            {readOnly ? null : (
              <Button className="h-11!" loading={save.isPending} onClick={submit}>
                حفظ الدور
                {save.isPending ? null : <Icon name="check" size={16} />}
              </Button>
            )}
          </>
        }
      />

      <Card title="بيانات الدور">
        <div className="grid grid-cols-3 gap-3">
          <Field label="اسم الدور" error={nameError}>
            {(fid) => (
              <TextInput
                id={fid}
                value={draft.name}
                readOnly={readOnly}
                invalid={!!nameError}
                placeholder="مثال: الجودة والزيارات"
                onChange={(e) => {
                  setNameError(undefined);
                  setDraft({ ...draft, name: e.target.value });
                }}
                className={BIG_INPUT}
              />
            )}
          </Field>
          <Field label="النطاق">
            {(fid) => <Select id={fid} value={draft.scope} onChange={(scope) => setDraft({ ...draft, scope })} options={SCOPE_OPTIONS} disabled={readOnly} className="h-[42px] disabled:bg-white [&>span]:text-14 [&>span]:font-normal [&>svg]:hidden" />}
          </Field>
          <Field label="الأعضاء">{(fid) => <TextInput id={fid} value={members} readOnly tabIndex={-1} className={BIG_INPUT} />}</Field>
        </div>
      </Card>

      <Card title="الصلاحيات حسب الوحدة" subtitle={ACTIONS.join(" · ")}>
        <div role="table" aria-label="الصلاحيات حسب الوحدة" className="overflow-hidden rounded-10 border border-border">
          <div role="row" className="flex items-center bg-surface-1 px-3 py-[7px] text-12 leading-5 font-medium text-muted">
            <span role="columnheader" className="flex-1">
              الوحدة
            </span>
            {ACTIONS.map((a) => (
              <span key={a} role="columnheader" className="w-[130px] text-center">
                {a}
              </span>
            ))}
          </div>
          {MODULES.map((m) => (
            <div key={m} role="row" className="flex items-center border-t border-divider px-3 py-[7px] text-13 leading-5">
              <span role="rowheader" className="flex-1 font-medium text-ink">
                {m}
              </span>
              {draft.grants[m].map((on, i) => (
                <span key={i} role="cell" className="flex w-[130px] justify-center">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={`${m} · ${ACTIONS[i]}`}
                    disabled={readOnly}
                    onClick={() => toggle(m, i)}
                    className={`flex h-5 w-10 items-center justify-center rounded-[6px] enabled:hover:bg-surface-2 disabled:cursor-default ${on ? "font-semibold text-success" : "text-border-strong"}`}
                  >
                    {on ? "✓" : "—"}
                  </button>
                </span>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card title="صلاحيات حساسة" subtitle="تتطلب رمز التحقق بخطوتين عند التنفيذ وتُسجَّل في «سجل التدقيق»">
        <div className="flex flex-col gap-2.5">
          {SENSITIVE.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col" id={`sens-${s.key}`}>
                <span className="text-14 leading-[22px] font-medium text-ink">{s.label}</span>
                <span className="text-12 leading-[18px] font-light text-muted">{s.hint}</span>
              </div>
              <Switch
                checked={draft.sensitive[s.key]}
                disabled={readOnly}
                label={s.label}
                onCheckedChange={(v) => setDraft({ ...draft, sensitive: { ...draft.sensitive, [s.key]: v } })}
                className="disabled:opacity-100"
              />
            </div>
          ))}
        </div>
      </Card>
      {sensitive.modal}
    </>
  );
}

// حقول «بيانات الدور» في Figma: 42 · نص 14 Regular
const BIG_INPUT = "h-[42px] [&_input]:text-14 [&_input]:font-normal";

function Crumb({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="hover:text-ink">
      {children}
    </button>
  );
}

// بطاقة قسم (Figma «Card · …»): r16 · حشو 20·20·18 · مسافة 10 · عنوان 16 Bold + سطر 12 Light رمادي
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-16 border border-border bg-white px-5 pt-5 pb-[18px]">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-16 font-bold text-ink">{title}</h2>
        {subtitle ? <p className="text-12 leading-[18px] font-light text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EditorSkeleton() {
  return (
    <>
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-[62px] w-96" />
      <Skeleton className="h-36 w-full rounded-16" />
      <Skeleton className="h-[600px] w-full rounded-16" />
    </>
  );
}
