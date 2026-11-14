"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { useUrlState } from "@/lib/use-url-state";
import { APill, DKV, DTile, Hero } from "./bits";

// CON5-09D · DR-0034 · معارض الوسام (3114:3920) · DR-0033 · شركة المسار (3114:4015) — طلب انضمام وكالة ?join=DR-…
//   الأزرار: اعتماد (?modal=dr-approve) · طلب استكمال (dr-complete) · رفض (dr-reject)
// CON5-09Q · DQ-2026-0012 رفع حد الائتمان (3114:6393) · 0013 تعديل العنوان (6494) · 0014 تغيير عميل القسيمة (9913) · 0015 إلغاء قسيمة (9972)
//   ?dq=DQ-… — الأزرار: اعتماد (0012 → نافذة dq-approve · الباقي مباشرة بتوست T0928/T0921/T0922) · رفض (dq-reject)
export function JoinDrawer() {
  const url = useUrlState();
  const id = url.get("join");
  const q = useQuery({ queryKey: ["agencies", "join", id], queryFn: () => api.agencyRequests.join(id!), enabled: !!id, retry: false });
  const j = q.data;
  const open = j?.decision === "open";
  const attached = j?.docs.filter((d) => d.file).length ?? 0;
  return (
    <Drawer
      open={!!id}
      onOpenChange={(v) => !v && url.replace({ join: null })}
      title={<bdi>{j ? `‏${j.id} · انضمام وكالة` : id}</bdi>}
      subtitle={j ? `قُدّم من صفحة «لينكار للوكالات» · ${j.date}` : " "}
      footer={
        j && open ? (
          <>
            <Button icon={<Icon name="check" size={18} />} onClick={() => url.push({ modal: "dr-approve" })}>
              اعتماد
            </Button>
            <Button variant="secondary" className="h-[50px]!" onClick={() => url.push({ modal: "dr-complete" })}>
              طلب استكمال
            </Button>
            <Button variant="secondary" className="h-[50px]! text-danger-strong!" onClick={() => url.push({ modal: "dr-reject" })}>
              رفض
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الطلب.</p>
      ) : !j ? (
        <>
          <Skeleton className="h-[90px] w-full rounded-[18px]" />
          <Skeleton className="h-[170px] w-full rounded-14" />
          <Skeleton className="h-[190px] w-full rounded-14" />
        </>
      ) : (
        <>
          <Hero
            icon="store"
            title={j.name}
            sub={j.heroLine}
            pill={<APill tone={j.decision === "approved" ? "success" : j.decision === "rejected" ? "danger" : j.decision === "waiting" ? "info" : "pending"}>{{ open: "بانتظار المراجعة", approved: "معتمد", rejected: "مرفوض", waiting: "بانتظار الاستكمال" }[j.decision]}</APill>}
          />
          <DTile title="بيانات الشركة">
            <DKV k="السجل التجاري">{j.cr}</DKV>
            <DKV k="الرقم الضريبي">{j.vat}</DKV>
            <DKV k="المفوّضون">{j.contacts}</DKV>
            <DKV k="طريقة الدفع المفضلة">{j.pay}</DKV>
          </DTile>
          <DTile title={`المتطلبات · ${attached} من ${j.docs.length} مرفقة`}>
            {j.docs.map((d) => (
              <div key={d.title} className="flex items-center gap-2.5 rounded-10 bg-surface-1 px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-white text-ink">
                  <Icon name="file" size={16} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-13 leading-[22px] font-medium text-ink">{d.title}</span>
                  <bdi className="text-12 leading-5 font-medium text-muted">{d.file ?? "لم تُرفق"}</bdi>
                </span>
                {d.file ? <APill tone="success">صالح</APill> : <span className="inline-flex h-[22px] items-center rounded-8 bg-[#fce8e5] px-2 text-12 font-medium text-danger">ناقص</span>}
                {d.file ? (
                  <button type="button" onClick={() => url.push({ modal: "m00-preview", doc: d.file!.replace(/\.pdf$/, "") })} className="flex h-5 shrink-0 items-center gap-1 text-12 font-medium text-ink hover:underline">
                    عرض
                    <Icon name="download" size={14} />
                  </button>
                ) : null}
              </div>
            ))}
          </DTile>
          <DTile title="السجل">
            <ol className="flex flex-col gap-2.5">
              <Step done title="قُدّم الطلب" sub={j.date} />
              <Step title="قرار لينكار" sub={open ? `بانتظار المراجعة${j.waitSince ? ` · ${j.waitSince}` : ""}` : { approved: "اعتُمد", rejected: "رُفض", waiting: "أُرسل طلب استكمال", open: "" }[j.decision]} done={!open} />
            </ol>
          </DTile>
        </>
      )}
    </Drawer>
  );
}

function Step({ title, sub, done }: { title: string; sub: string; done?: boolean }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-full ${done ? "bg-ink text-lime" : "border border-border bg-white"}`}>{done ? <Icon name="check" size={12} /> : null}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`text-13 leading-[22px] font-medium ${done ? "text-ink" : "text-muted"}`}>{title}</span>
        <span className="text-12 leading-5 font-medium text-muted">{sub}</span>
      </span>
    </li>
  );
}

export function DqDrawer() {
  const url = useUrlState();
  const qc = useQueryClient();
  const toast = useToast();
  const id = url.get("dq");
  const q = useQuery({ queryKey: ["agencies", "dq", id], queryFn: () => api.agencyRequests.dq(id!), enabled: !!id, retry: false });
  const r = q.data;
  const open = r?.decision === "open";
  const approve = useMutation({
    mutationFn: () => api.agencyRequests.approveDq(id!),
    onSuccess: (x) => {
      qc.invalidateQueries({ queryKey: ["agencies"] });
      url.replace({ dq: null });
      toast("اعتُمد الطلب", x.toast);
    },
  });
  return (
    <Drawer
      open={!!id}
      onOpenChange={(v) => !v && url.replace({ dq: null })}
      title={r ? `‏${r.id} · ${r.type}` : <bdi>{id}</bdi>}
      subtitle={r ? `${r.agency} · اليوم 14 أكتوبر 2026` : " "}
      footer={
        r && open ? (
          <>
            <Button loading={approve.isPending} onClick={() => (r.newLimit ? url.push({ modal: "dq-approve" }) : approve.mutate())}>
              {r.approveLabel}
            </Button>
            <Button variant="secondary" className="h-[50px]! text-danger-strong!" onClick={() => url.push({ modal: "dq-reject" })}>
              رفض
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <p className="py-10 text-center text-13 text-muted">تعذّر تحميل الطلب.</p>
      ) : !r ? (
        <>
          <Skeleton className="h-[88px] w-full rounded-16" />
          <Skeleton className="h-[200px] w-full rounded-12" />
        </>
      ) : (
        <>
          <Hero
            radius={16}
            icon={r.icon}
            title={r.heroTitle}
            sub={r.heroSub}
            subClass="text-[#c9d1cd]"
            pill={
              open ? (
                <span className="inline-flex h-[22px] items-center rounded-8 bg-warning-tint px-2 text-12 font-medium whitespace-nowrap text-[#9a6b00]">بانتظار القرار</span>
              ) : (
                <APill tone={r.decision === "approved" ? "success" : "danger"}>{r.decision === "approved" ? "معتمد" : "مرفوض"}</APill>
              )
            }
          />
          <DTile title="الطلب" gap={6} r12>
            {r.rows.map((x) => (
              <DKV key={x.k} k={x.k} pad>
                {x.v}
              </DKV>
            ))}
          </DTile>
          {r.history ? (
            <DTile title="سجل الوكالة" gap={6} r12>
              {r.history.map((x) => (
                <DKV key={x.k} k={x.k} pad>
                  {x.v}
                </DKV>
              ))}
            </DTile>
          ) : null}
        </>
      )}
    </Drawer>
  );
}
