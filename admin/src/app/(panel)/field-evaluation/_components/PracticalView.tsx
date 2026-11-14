"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import type { PracticalCriterion } from "@/lib/api/field-evaluation";
import { useUrlState } from "@/lib/use-url-state";
import { Area, EndNote, RadioCard, SPill } from "./bits";
import { CenterModals } from "./CenterModals";

// CON5-17P · التقييم العملي · مركز درع للحماية (3114:62593) — /field-evaluation/centers/<id>
// يمين: «معايير التقييم العملي» (11 معياراً · 1–5 من أرقام المنصة · 6–11 يقيّمها فريق لينكار بدرجة 0–5)
// شمال: «قرار فريق لينكار» — منح الشارة (→ نافذة CON5-17M منح الشارة → CON5-T1702) · تمديد 30 يوماً (→ CON5-T1703) · إيقاف المركز
type Option = "badge" | "extend" | "stop";

export function PracticalView({ id }: { id: string }) {
  const url = useUrlState();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["practical", id], queryFn: () => api.practical.get(id), retry: false });
  const [option, setOption] = useState<Option>("badge");
  const [reason, setReason] = useState<string>();
  const [err, setErr] = useState<string>();
  const score = useMutation({
    mutationFn: ({ n, s }: { n: number; s: number }) => api.practical.setScore(id, n, s),
    onSuccess: (p) => qc.setQueryData(["practical", id], p),
  });
  const decide = useMutation({
    mutationFn: () => api.centers.decide(id, { option, reason: reason ?? q.data?.reason ?? "" }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["centers"] });
      toast("تم", r.toast);
      router.push("/field-evaluation/centers");
    },
    onError: (e) => isApiError(e) && setErr(e.fields?.reason ?? e.message),
  });
  const submit = () => {
    const text = reason ?? q.data?.reason ?? "";
    if (!text.trim()) return setErr("اكتب سبب القرار");
    // منح الشارة بيتأكد في نافذة (CON5-17M منح الشارة · 3114:63260)
    if (option === "badge") url.push({ center: id, modal: "fe-badge", from: "practical" });
    else decide.mutate();
  };

  if (q.isError)
    return <EmptyState title="لا يوجد تقييم عملي لهذا المركز" action={<Link href="/field-evaluation/centers" className="text-13 font-medium text-ink underline">التقييم والتصنيف</Link>} />;
  const p = q.data;
  return (
    <>
      <nav aria-label="مسار الصفحة" className="flex items-center gap-1.5 text-13 leading-[22px] font-medium">
        <Link href="/field-evaluation/centers" className="text-muted hover:text-ink">
          التقييم والتصنيف
        </Link>
        <Icon name="chevron-left" size={14} className="text-muted" />
        <span className="text-ink">{p?.name ?? "…"}</span>
      </nav>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-24 font-bold text-ink">التقييم العملي · {p?.name ?? "…"}</h1>
        <p className="text-13 font-light text-muted">{p?.sub ?? " "}</p>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col rounded-16 border border-border bg-white p-4 sm:p-5">
          <h2 className="text-18 font-bold text-ink">معايير التقييم العملي</h2>
          <p className="text-13 font-light text-muted">أول 5 معايير تنحسب من أرقام المنصة، والباقي يقيّمه فريق لينكار.</p>
          {p ? p.criteria.map((c) => <Criterion key={c.n} c={c} onScore={(s) => score.mutate({ n: c.n, s })} />) : Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="mt-3 h-16 w-full rounded-12" />)}
        </section>
        <section className="flex flex-col gap-3.5 rounded-16 border border-border bg-white p-5 lg:w-[360px] lg:shrink-0">
          <h2 className="text-18 font-bold text-ink">قرار فريق لينكار</h2>
          <div className="flex flex-col gap-1 rounded-14 bg-ink p-4">
            <span className="text-12 leading-5 font-medium text-white">النتيجة العملية</span>
            <div className="flex items-center gap-1.5">
              <span className="num text-30 leading-[46px] font-bold text-white">{p?.overall ?? "…"}</span>
              <span className="text-14 font-medium text-white">%</span>
              <span className="ms-auto text-13 font-medium text-lime">{p?.ready}</span>
            </div>
            <span className="text-13 font-light text-lime">{p?.threshold}</span>
          </div>
          <div role="radiogroup" aria-label="القرار" className="flex flex-col gap-3.5">
            <RadioCard title="منح شارة «معتمد LINKAR»" sub="تظهر الشارة للمركز في الموقع والتطبيق" checked={option === "badge"} onSelect={() => setOption("badge")} />
            <RadioCard title="تمديد التجربة 30 يوماً" sub={p?.extendUntil} checked={option === "extend"} onSelect={() => setOption("extend")} />
            <RadioCard title="إيقاف المركز" sub="يُخفى المركز عن العملاء" checked={option === "stop"} onSelect={() => setOption("stop")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fe-p-reason" className="text-12 leading-5 font-medium text-muted">
              سبب القرار / ملاحظات الاعتماد
            </label>
            <Area id="fe-p-reason" h={80} value={reason ?? p?.reason ?? ""} invalid={!!err} onChange={(v) => (setReason(v), setErr(undefined))} />
            {err ? (
              <p role="alert" className="text-12 text-danger">
                {err}
              </p>
            ) : null}
          </div>
          <Button icon={<Icon name="check" size={16} />} loading={decide.isPending} onClick={submit} disabled={!p}>
            تسجيل القرار
          </Button>
          {p ? (
            <EndNote start tone="neutral">
              {p.nextVisit}
            </EndNote>
          ) : null}
        </section>
      </div>
      <CenterModals />
    </>
  );
}

/** صف معيار: رقم 28 (#F4F6F5 r8) يمين · العنوان 13 Medium + القيمة 12 Medium رمادي + الشارات · درجات 0–5 (28 · r7) شمال */
function Criterion({ c, onScore }: { c: PracticalCriterion; onScore: (s: number) => void }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="num flex size-7 shrink-0 items-center justify-center rounded-8 bg-surface-1 text-12 font-medium text-ink">{c.n}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-13 leading-[22px] font-medium text-ink">{c.title}</span>
          {c.value ? <span className="text-12 leading-5 font-medium text-muted">{c.value}</span> : null}
          <span className="flex flex-wrap gap-1.5">
            {c.critical ? <SPill tone="danger">حرج</SPill> : null}
            {c.auto ? <SPill tone="trial">من أرقام المنصة</SPill> : <SPill tone="neutral">يقيّمه فريق لينكار</SPill>}
          </span>
        </div>
      </div>
      <div dir="ltr" role="radiogroup" aria-label={`درجة ${c.title}`} className="flex shrink-0 gap-1 self-end sm:self-auto">
        {[0, 1, 2, 3, 4, 5].map((s) => {
          const on = s === c.score;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={c.auto}
              title={c.auto ? "يُحسب من أرقام المنصة" : undefined}
              onClick={() => onScore(s)}
              className={`num flex size-7 items-center justify-center rounded-[7px] text-12 font-medium disabled:cursor-default ${on ? "bg-ink text-lime" : "border border-border bg-white text-ink enabled:hover:bg-surface-1"}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
