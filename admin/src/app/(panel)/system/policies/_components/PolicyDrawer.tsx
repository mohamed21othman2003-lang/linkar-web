"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Policy } from "@/lib/api/policies";
import { useUrlState } from "@/lib/use-url-state";

// CON5-21D · درج السياسة: الإلغاء والاسترداد (3114:64469) · الضمان (64590) · اتفاقية مقدّمي الخدمة (64632)
// · الشروط والأحكام للعملاء (64674) · المسوّقون (64716). حقول 42 (r10 · 14 Regular) — قوائم منسدلة + قيمة ثابتة بأيقونة المستخدمين.
// الذيل: «نشر النسخة N» (أخضر بعلامة ✓) يمين · «سجل النسخ» (بأيقونة ساعة) شمال → CON5-21T «نُشرت … · نسخة N»
// ملاحظة: درج الضمان في Figma زرّه «نشر النسخة 3» والنسخة الحالية 3 — طبّقنا القاعدة (الحالية + 1) زي باقي الأدراج.
export function PolicyDrawer() {
  const url = useUrlState();
  const id = url.get("policy");
  const open = !!id && !url.get("modal");
  const q = useQuery({
    queryKey: ["policies", "one", id],
    queryFn: () => api.policies.get(id!),
    enabled: !!id,
  });
  const p = q.data;
  return (
    <Drawer
      open={open}
      onOpenChange={(o) => !o && url.replace({ policy: null })}
      title={p ? `${p.fullTitle} · نسخة ${p.version}` : ""}
      subtitle={p ? `آخر نشر ${p.publishedAt} · ${p.publishedBy}` : " "}
      footerClassName="justify-between sm:pb-6! [&>*]:flex-none! [&>*]:min-w-0!"
      footer={p ? <Footer key={`${p.id}-${p.version}`} p={p} /> : undefined}
    >
      {q.isLoading ? (
        Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[68px] w-full" />
        ))
      ) : q.isError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-16 font-bold text-ink">تعذّر تحميل السياسة</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : p ? (
        <Fields key={`${p.id}-${p.version}`} p={p} />
      ) : null}
    </Drawer>
  );
}

// القيم المعدّلة محفوظة على مستوى الوحدة لحد النشر (الدرج والذيل مكوّنين منفصلين)
const drafts: Record<string, Record<string, string>> = {};
const setDraft = (id: string, key: string, v: string) => {
  drafts[id] = { ...drafts[id], [key]: v };
};

function Fields({ p }: { p: Policy }) {
  const [, force] = useState(0);
  const values = drafts[p.id] ?? {};
  return (
    <>
      {p.fields.map((f) => (
        <Field key={f.key} label={f.label}>
          {(fid) =>
            f.options ? (
              <Select
                id={fid}
                value={values[f.key] ?? f.value}
                options={Array.from(new Set(f.options)).map((o) => ({
                  value: o,
                  label: o,
                }))}
                onChange={(v) => {
                  setDraft(p.id, f.key, v);
                  force((n) => n + 1);
                }}
                className="h-[42px]! text-14! [&>span]:font-normal!"
              />
            ) : (
              <div
                id={fid}
                className="flex h-[42px] items-center gap-2 rounded-10 border border-border bg-white px-3 text-14 text-ink"
              >
                <span className="min-w-0 flex-1 truncate">{f.value}</span>
                <Icon name="users" size={16} className="shrink-0" />
              </div>
            )
          }
        </Field>
      ))}
    </>
  );
}

function Footer({ p }: { p: Policy }) {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  const mut = useMutation({
    mutationFn: () => api.policies.publish(p.id, drafts[p.id] ?? {}),
    onSuccess: (r) => {
      delete drafts[p.id];
      qc.invalidateQueries({ queryKey: ["policies"] });
      toast(r.toast);
      url.replace({ policy: null });
    },
  });
  return (
    <>
      <Button
        variant="accent"
        className="h-11!"
        loading={mut.isPending}
        onClick={() => mut.mutate()}
      >
        نشر النسخة {p.version + 1}
        <Icon name="check" size={16} />
      </Button>
      <Button
        variant="secondary"
        className="h-[46px]!"
        onClick={() => url.push({ modal: "policy-history" })}
      >
        سجل النسخ
        <Icon name="clock" size={16} />
      </Button>
    </>
  );
}
