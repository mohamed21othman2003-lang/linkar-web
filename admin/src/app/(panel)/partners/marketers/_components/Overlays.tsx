"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { MarketerSale, MkTone } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { DocRow, Hero, MKV, MNote, MPill, MTile } from "./bits";
import { commissionLabel } from "./MarketersView";
import { MarketerModals } from "./Modals";

// أدراج صفحة المسوّقين (CON5-10D / CON5-10Q) + النوافذ (CON5-10M). كلها في الرابط (القسم 2.3).
export function MarketerOverlays() {
  const url = useUrlState();
  const close = (k: string) => () => url.replace({ [k]: null, modal: null, id: null });
  const m = url.get("marketer");
  const s = url.get("sale");
  const p = url.get("payout");
  const j = url.get("join");
  const q = url.get("mq");
  return (
    <>
      {m ? <MarketerDrawer id={m} onClose={close("marketer")} /> : null}
      {s ? <SaleDrawer id={s} onClose={close("sale")} /> : null}
      {p ? <PayoutDrawer id={p} onClose={close("payout")} /> : null}
      {j ? <JoinDrawer id={j} onClose={close("join")} /> : null}
      {q ? <RequestDrawer id={q} onClose={close("mq")} /> : null}
      <MarketerModals />
    </>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3.5">
      <Skeleton className="h-[84px] rounded-[18px]" />
      <Skeleton className="h-[74px] rounded-12" />
      <Skeleton className="h-[140px] rounded-14" />
    </div>
  );
}
function Failed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <p className="text-16 font-bold text-ink">تعذّر تحميل البيانات</p>
      <Button variant="secondary" size="S" onClick={onRetry}>
        إعادة المحاولة
      </Button>
    </div>
  );
}

// ───────────── CON5-10D · المسوّق (SM118 3114:10121 · SM123 10171 · SM140 10223 · SM131 10273 · SM152 10323 · SM104 10373) ─────────────
export function MarketerDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["marketers", "one", id], queryFn: () => api.marketers.get(id) });
  const m = q.data;
  const active = m?.status === "active";
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={m?.name ?? id}
      subtitle={<bdi>{id}</bdi>}
      footer={
        m ? (
          active ? (
            <>
              <Button variant="danger-outline" onClick={() => url.push({ modal: "stop", id })}>
                إيقاف المسوّق
              </Button>
              {m.profile ? (
                <Link href={`/partners/marketers/${id}`} className="inline-flex h-12 items-center justify-center rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1">
                  ملف المسوّق
                </Link>
              ) : null}
            </>
          ) : (
            <Button variant="accent" className="h-11!" onClick={() => url.push({ modal: "reactivate", id })}>
              إعادة تفعيل المسوّق
            </Button>
          )
        ) : null
      }
      footerClassName={active ? undefined : "sm:pb-6!"}
    >
      {q.isError ? (
        <Failed onRetry={() => q.refetch()} />
      ) : !m ? (
        <Loading />
      ) : (
        <>
          <Hero icon="share" sub={<span className="text-white/70">{m.drawerSub}</span>} pill={<MPill tone={active ? "success" : "danger"}>{active ? "نشط" : "موقوف"}</MPill>} />
          <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${m.stats.length}, minmax(0, 1fr))` }}>
            {[...m.stats].reverse().map((s) => (
              <div key={s.label} className="flex flex-col rounded-12 bg-surface-1 p-3">
                <span className="num text-18 leading-[30px] font-bold text-ink">{s.value}</span>
                <span className="text-12 leading-5 font-medium text-muted">{s.label}</span>
              </div>
            ))}
          </div>
          <MTile title="أدوات الإحالة">
            <MKV k="الرابط">
              <bdi>lnkr.sa/s/{m.id}/…</bdi>
            </MKV>
            <MKV k="كود العميل">{ltrRuns(`${m.code} · رصيد ${num(m.balance.value)} ر.س للعميل`)}</MKV>
            <MKV k="QR">متاح في بوابة المسوّق</MKV>
          </MTile>
          <MTile title="السجل">
            <p className="text-13 leading-[22px] font-light text-ink">{ltrRuns(m.history)}</p>
          </MTile>
          {m.note && !active ? (
            <MNote tone="danger" icon="alert">
              {m.note}
            </MNote>
          ) : null}
        </>
      )}
    </Drawer>
  );
}
// SM104 بعد الإيقاف: footer pb 24 (Figma 3114:10373)

// ───────────── CON5-10D · بيع مسوّق (BK-21458 3114:10425 · BK-21417 10466 · BK-21464 10499 · BK-21451 10532 · BK-21424 10565) ─────────────
const SALE_PILL: Record<MarketerSale["commission"], ["success" | "danger" | "pending" | "neutral", string]> = {
  review: ["pending", "تحتاج مراجعة"],
  approved: ["success", "مكتمل"],
  pending: ["pending", "بانتظار الزيارة"],
  rejected: ["danger", "مكتمل"],
  awaiting: ["neutral", "بانتظار الدفع"],
};
function SaleDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["marketers", "sale", id], queryFn: () => api.marketers.sale(id) });
  const s = q.data;
  const d = s?.drawer;
  const review = s?.commission === "review";
  const [tone, label]: [MkTone, string] = s ? SALE_PILL[s.commission] : ["neutral", ""];
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={s ? <bdi>{review ? `${s.id} · عمولة تحتاج مراجعة` : s.id}</bdi> : id}
      subtitle={d ? ltrRuns(d.subtitle) : undefined}
      footer={
        review ? (
          <>
            <Button onClick={() => url.push({ modal: "commission-approve", id })}>اعتماد العمولة</Button>
            <Button variant="danger-outline" onClick={() => url.push({ modal: "commission-reject", id })}>
              رفض
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <Failed onRetry={() => q.refetch()} />
      ) : !s || !d ? (
        <Loading />
      ) : review ? (
        <>
          <Hero icon="alert" title={ltrRuns(d.heroTitle)} sub={d.heroSub} pill={<MPill tone="pending">تحتاج مراجعة</MPill>} />
          <MTile title="سبب المراجعة">
            <p className="text-13 leading-[22px] font-light text-ink">{ltrRuns(d.reason ?? "")}</p>
          </MTile>
          <MTile title="العمولة">
            <MKV k="النسبة">{d.rate}</MKV>
            <MKV k="المبلغ · شامل الضريبة">{num(s.amount, 2)} ر.س</MKV>
          </MTile>
        </>
      ) : (
        <>
          <Hero icon="share" title={`${num(s.value)} ر.س`} sub={ltrRuns(d.heroSub)} pill={<MPill tone={s.commission === "rejected" ? "danger" : tone}>{label}</MPill>} />
          <MTile title={d.methodText === "رابط المسوّق" ? "البيع" : "الإحالة"}>
            <MKV k="الطريقة">{ltrRuns(d.methodText ?? "")}</MKV>
            <MKV k="القيمة · شامل الضريبة">{ltrRuns(d.valueText ?? `${num(s.value)} ر.س`)}</MKV>
            <MKV k="العمولة">{s.commission === "approved" ? `${num(s.amount, 2)} ر.س · معتمدة` : s.commission === "rejected" ? `مرفوضة · ${s.commissionSub ?? ""}` : commissionLabel(s)}</MKV>
          </MTile>
        </>
      )}
    </Drawer>
  );
}

// ───────────── CON5-10D · دفعة العمولات (PY-2026-11-001 3114:10598 · PY-2026-10-001 10649 · PY-2026-09-001 10700) ─────────────
function PayoutDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const toast = useToast();
  const q = useQuery({ queryKey: ["marketers", "payout", id], queryFn: () => api.marketers.payout(id) });
  const p = q.data;
  const draft = p?.status === "draft";
  const file = useMutation({ mutationFn: () => api.marketers.transferFile(id), onSuccess: () => toast("تصدير ملف التحويل", `جارٍ تنزيل ملف التحويل ${id}`) });
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={<bdi>{id}</bdi>}
      subtitle={p?.period}
      footer={
        draft ? (
          <>
            <Button onClick={() => url.push({ modal: "transfer", id })}>تسجيل التحويل</Button>
            <Button variant="secondary" icon={<Icon name="download" size={18} />} loading={file.isPending} onClick={() => file.mutate()}>
              تصدير ملف التحويل
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <Failed onRetry={() => q.refetch()} />
      ) : !p ? (
        <Loading />
      ) : (
        <>
          <Hero
            b={draft}
            icon="wallet"
            title={<bdi>{num(p.total, 2)} ر.س</bdi>}
            sub={p.heroSub}
            pill={<MPill tone={draft ? "neutral" : "success"}>{draft ? "مسودة" : "مُحوّلة"}</MPill>}
          />
          <MTile b={draft} title="الدفعة">
            <MKV b={draft} k="الفترة">
              {p.period}
            </MKV>
            <MKV b={draft} k="المسوّقون">
              {num(p.marketers)}
            </MKV>
            <MKV b={draft} k={draft ? "الإجمالي حتى الآن" : "الإجمالي"}>
              <bdi>{num(p.total, 2)} ر.س</bdi>
            </MKV>
            <MKV b={draft} k={draft ? "التحويل" : "الحالة"}>
              {draft ? p.transferDate : p.statusSub}
            </MKV>
          </MTile>
          <MTile b={draft} title="أعلى المسوّقين">
            {p.top.map(([k, v]) => (
              <MKV key={k} b={draft} k={ltrRuns(k)}>
                <bdi>{v}</bdi>
              </MKV>
            ))}
          </MTile>
        </>
      )}
    </Drawer>
  );
}

// ───────────── CON5-10D · طلب انضمام (AR-0058 3114:11085 · AR-0057 3114:11179) ─────────────
function JoinDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const q = useQuery({ queryKey: ["marketers", "join", id], queryFn: () => api.marketers.join(id) });
  const j = q.data;
  const open = j?.status === "open";
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={<bdi>{id} · انضمام مسوّق</bdi>}
      subtitle={j ? `قُدّم من صفحة «برنامج المسوّقين» · ${j.date}` : undefined}
      footer={
        open ? (
          <>
            <Button onClick={() => url.push({ modal: "join-approve", id })}>اعتماد</Button>
            <Button variant="secondary" onClick={() => url.push({ modal: "join-complete", id })}>
              طلب استكمال
            </Button>
            <Button variant="danger-outline" onClick={() => url.push({ modal: "join-reject", id })}>
              رفض
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <Failed onRetry={() => q.refetch()} />
      ) : !j ? (
        <Loading />
      ) : (
        <>
          <Hero
            icon="store"
            title={j.name}
            sub={j.heroSub}
            pill={<MPill tone={open ? "pending" : j.status === "approved" ? "success" : j.status === "rejected" ? "danger" : "warning"}>{open ? "بانتظار المراجعة" : j.status === "approved" ? "معتمد" : j.status === "rejected" ? "مرفوض" : "بانتظار الاستكمال"}</MPill>}
          />
          <MTile title="البيانات">
            <MKV k="الجوال">{j.phone}</MKV>
            <MKV k="القناة">{j.channel}</MKV>
            <MKV k="الآيبان">{ltrRuns(j.iban)}</MKV>
          </MTile>
          <MTile title={j.docsOf}>
            {j.docs.map((d) => (
              <DocRow key={d.docId} title={d.title} sub={d.sub} pill={<MPill tone="success">صالح</MPill>} onView={() => url.push({ modal: "m00-preview", doc: d.docId })} />
            ))}
          </MTile>
          {j.onApprove ? (
            <MTile title="عند الاعتماد">
              <MKV k="معرّف الإحالة">{ltrRuns(`${j.newId} · يُنشأ تلقائياً`)}</MKV>
              <MKV k="كود العميل">{ltrRuns(`${j.newId}-300 · رصيد 300 ر.س للعميل`)}</MKV>
              <MKV k="العمولة">حسب كل خدمة · نسبة أو مبلغ ثابت</MKV>
            </MTile>
          ) : null}
          <MTile title="السجل">
            <ol className="flex flex-col gap-2.5">
              <Step done title="قُدّم الطلب" sub={j.submitted} />
              <Step done={!open} title="قرار لينكار" sub={open ? "بانتظار المراجعة" : j.status === "approved" ? "معتمد" : j.status === "rejected" ? "مرفوض" : "بانتظار الاستكمال"} />
            </ol>
          </MTile>
        </>
      )}
    </Drawer>
  );
}
function Step({ done, title, sub }: { done?: boolean; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full ${done ? "bg-ink text-lime" : "border border-border bg-white"}`}>{done ? <Icon name="check" size={12} /> : null}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`text-13 leading-[22px] font-medium ${done ? "text-ink" : "text-muted"}`}>{title}</span>
        <span className="text-12 leading-5 font-medium text-muted">{sub}</span>
      </span>
    </li>
  );
}

// ───────────── CON5-10Q · طلب مسوّق (MQ-2026-0021 تعديل البريد 3114:12112 · MQ-2026-0022 تعديل الحساب البنكي 3114:12171) ─────────────
export function RequestDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["marketers", "mq", id], queryFn: () => api.marketers.request(id) });
  const r = q.data;
  const open = r?.status === "open";
  const approve = useMutation({
    mutationFn: () => api.marketers.approveRequest(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["marketers"] });
      if (res.kind === "bank") toast("اعتُمد الحساب البنكي الجديد", "اعتُمد الحساب البنكي الجديد وأُبلغ المسوّق");
      else toast("اعتُمد تعديل بيانات المسوّق", "اعتُمد التعديل وأُبلغ المسوّق");
      onClose();
    },
  });
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      title={<bdi>{r ? `${id} · ${r.kind === "bank" ? "تعديل الحساب البنكي" : "تعديل البيانات"}` : id}</bdi>}
      subtitle={r ? ltrRuns(`${r.marketer.name} · ${r.marketerId} · اليوم 14 أكتوبر 2026`) : undefined}
      footer={
        open ? (
          <>
            <Button loading={approve.isPending} onClick={() => approve.mutate()}>
              {r?.kind === "bank" ? "اعتماد الحساب" : "اعتماد التعديل"}
            </Button>
            <Button variant="danger-outline" onClick={() => url.push({ modal: "mq-reject", id })}>
              رفض
            </Button>
          </>
        ) : null
      }
    >
      {q.isError ? (
        <Failed onRetry={() => q.refetch()} />
      ) : !r ? (
        <Loading />
      ) : (
        <>
          <Hero
            b
            icon={r.kind === "bank" ? "card" : "edit"}
            title={r.kind === "bank" ? <bdi>{r.heroTitle}</bdi> : r.heroTitle}
            sub={ltrRuns(r.heroSub)}
            pill={<MPill tone={open ? "warning" : r.status === "approved" ? "success" : "danger"}>{open ? "بانتظار القرار" : r.status === "approved" ? "معتمد" : "مرفوض"}</MPill>}
          />
          <MTile b title="الطلب">
            {r.rows.map(([k, v]) => (
              <MKV key={k} b k={k}>
                {ltrRuns(v)}
              </MKV>
            ))}
          </MTile>
          {r.doc ? (
            <MTile b title="المستند">
              <DocRow title={r.doc.title} pill={null} onView={() => url.push({ modal: "m00-preview", doc: r.doc!.docId })} />
            </MTile>
          ) : null}
        </>
      )}
    </Drawer>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <p className="text-12 leading-5 font-light text-muted">{children}</p>;
}
