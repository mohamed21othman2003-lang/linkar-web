"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { ComplaintRow, PendingReply, QualityFilter, QualityView, ReviewRow } from "@/lib/api/provider-tabs";
import { num } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { Chips } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الجودة والتقييم (3114-51034 · ردود بانتظار الاعتماد 3302-138749)
// البيانات: الشكاوى والتقييمات من قسم «التقييمات والشكاوى» (api.quality بمركز = اسم المزوّد) عبر api.providerTabs.quality،
// والتقييم (★ 4.9 · 320) من ملف المزوّد. الصف و«فتح الشكوى» → /reviews?complaint=CM-… · صف تقييم → /reviews?review=RV-…
// بطاقة التقييم: إطار r14 حشو 16 مسافة 12 · «★ 4.9 · 320 تقييماً» 18 Bold · 5 أشرطة (عنوان 13 Medium + عدد شمال · مسار 8 #EEF1EF والشريط أخضر).
// الشرائح: العرض (تقييمات الخدمات · الشكاوى · تقييمات الفروع) ثم الفلتر (بانتظار الرد · مفتوحة · 3 نجوم فأقل · ردود بانتظار اعتماد لينكار).
// «ردود بانتظار اعتماد لينكار» (3302-138749): من غير بطاقة التقييم — بطاقة لكل رد: اعتماد ونشر / تعديل وإرسال للمزوّد / رفض (CON5-07T 3303-139717 …).
// الرابط: ?tab=quality&qview=services|complaints|branches&qf=waiting|open|low|replies
const VIEWS = [
  { value: "services", label: "تقييمات الخدمات" },
  { value: "complaints", label: "الشكاوى" },
  { value: "branches", label: "تقييمات الفروع" },
] as const;
const FILTERS = [
  { value: "waiting", label: "بانتظار الرد" },
  { value: "open", label: "مفتوحة" },
  { value: "low", label: "3 نجوم فأقل" },
  { value: "replies", label: "ردود بانتظار اعتماد لينكار" },
] as const;
const STARS = ["5 نجوم", "4 نجوم", "3 نجوم", "نجمتان", "نجمة"];
const TONE: Record<string, string> = {
  pending: "bg-[#fdf3e1] text-warning",
  danger: "bg-[#f8e9e9] text-danger",
  success: "bg-success-tint text-success",
  trial: "bg-info-tint text-info",
  neutral: "bg-surface-2 text-muted",
};

export default function QualityTab({ profile }: ProfileTabProps) {
  const url = useUrlState();
  const router = useRouter();
  const id = profile.provider.id;
  const view: QualityView = VIEWS.some((v) => v.value === url.get("qview")) ? (url.get("qview") as QualityView) : "complaints";
  const filter: QualityFilter = FILTERS.some((v) => v.value === url.get("qf")) ? (url.get("qf") as QualityFilter) : "open";
  const q = useQuery({ queryKey: ["providers", "quality", id, view, filter], queryFn: () => api.providerTabs.quality(id, { view, filter }) });
  const branches = useQuery({ queryKey: ["branches", "list", { provider: id }], queryFn: () => api.branches.list({ provider: id }), enabled: view === "branches" });
  const d = q.data;
  const replies = filter === "replies";
  const maxStars = Math.max(1, ...(d?.stars ?? [0]));

  const openComplaint = (r: ComplaintRow) => router.push(`/reviews?complaint=${r.id}`);
  const columns: Column<ComplaintRow>[] = [
    { id: "code", header: "الشكوى", width: 90, cell: (r) => <span className="font-medium">{r.id}</span> },
    {
      id: "customer",
      header: "العميل والحجز",
      width: 396,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium">{r.customer}</span>
          <span className="text-12 font-medium text-muted">
            <bdi dir="ltr">{r.booking}</bdi> · {r.branch}
          </span>
        </span>
      ),
    },
    { id: "category", header: "التصنيف", width: 130, cell: (r) => <span className="font-light">{r.category}</span> },
    { id: "opened", header: "فُتحت", width: 140, cell: (r) => <span className="font-light">{r.openedAt}</span> },
    {
      id: "status",
      header: "الحالة",
      width: 160,
      cell: (r) => (
        <span className="flex flex-col items-start gap-0.5">
          <Pill size="S" className={TONE[r.status.tone] ?? TONE.neutral}>
            {r.status.label}
          </Pill>
          {r.status.sub ? <span className="text-12 leading-5 font-medium text-muted">{r.status.sub}</span> : null}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      width: 110,
      actions: true,
      cell: (r) => (
        <button type="button" onClick={() => openComplaint(r)} className="h-8 rounded-8 border border-border bg-white px-3 text-12 leading-5 font-medium text-ink hover:bg-surface-1">
          فتح الشكوى
        </button>
      ),
    },
  ];
  const reviewCols: Column<ReviewRow>[] = [
    { id: "id", header: "التقييم", width: 90, cell: (r) => <span className="font-medium">{r.id}</span> },
    {
      id: "text",
      header: "التقييم والنص",
      width: 396,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-medium">
            <span className="text-star">{"★".repeat(r.stars)}</span>
            <span className="text-border">{"★".repeat(5 - r.stars)}</span>
          </span>
          <span className="text-12 font-medium text-muted">{r.text}</span>
        </span>
      ),
    },
    {
      id: "customer",
      header: "العميل والحجز",
      width: 130,
      cell: (r) => (
        <span className="flex flex-col">
          <span className="font-light">{r.customer}</span>
          <bdi dir="ltr" className="text-end text-12 font-medium text-muted">
            {r.booking}
          </bdi>
        </span>
      ),
    },
    { id: "date", header: "التاريخ", width: 140, cell: (r) => <span className="font-light">{r.date}</span> },
    {
      id: "status",
      header: "الحالة",
      width: 160,
      cell: (r) => (
        <span className="flex flex-col items-start gap-0.5">
          <Pill size="S" className={TONE[r.status.tone] ?? TONE.neutral}>
            {r.status.label}
          </Pill>
          {r.status.sub ? <span className="text-12 leading-5 font-medium text-muted">{r.status.sub}</span> : null}
        </span>
      ),
    },
  ];

  const approvedBranches = (branches.data?.items ?? []).filter((b) => b.status === "approved");
  const count = view === "complaints" ? (d?.complaints.length ?? 0) : view === "services" ? (d?.reviewsList.length ?? 0) : approvedBranches.length;

  return (
    <>
      {replies ? null : (
        <section aria-label="التقييم" className="flex flex-col gap-3 rounded-14 border border-border bg-white p-4">
          {d ? (
            <p className="text-18 leading-[30px] font-bold text-ink">
              <span className="text-star">★</span> {d.reviews ? d.rating.toFixed(1) : "0"} · {num(d.reviews)} تقييماً
            </p>
          ) : (
            <Skeleton className="h-[30px] w-48" />
          )}
          {STARS.map((label, i) => {
            const n = d?.stars[i] ?? 0;
            return (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-13 leading-[22px] font-medium text-ink">
                  <span>{label}</span>
                  <span className="num">{d ? num(n) : "—"}</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-[4px] bg-surface-2">
                  <span className="h-full rounded-[4px] bg-lime" style={{ width: `${(n / maxStars) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </section>
      )}
      <Chips items={VIEWS} value={view} onChange={(v) => url.replace({ qview: v === "complaints" ? null : v })} label="نوع التقييم" />
      <Chips items={FILTERS} value={filter} onChange={(v) => url.replace({ qf: v === "open" ? null : v })} label="فلتر" />
      {replies ? (
        q.isError ? (
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        ) : !d ? (
          <Skeleton className="h-[414px] w-full rounded-12" />
        ) : d.pendingReplies.length ? (
          d.pendingReplies.map((r) => <ReplyCard key={r.id} providerId={id} reply={r} />)
        ) : (
          <EmptyState title="لا توجد ردود بانتظار الاعتماد" body="تظهر هنا ردود المزوّد على التقييمات والشكاوى قبل نشرها للعملاء." />
        )
      ) : (
        <>
          <h2 className="text-16 leading-[26px] font-medium text-ink">
            {VIEWS.find((v) => v.value === view)!.label} · {num(count)}
          </h2>
          {view === "complaints" ? (
            <DataTable
              columns={columns}
              data={d?.complaints}
              getRowId={(r) => r.id}
              loading={q.isLoading}
              error={q.isError}
              onRetry={() => q.refetch()}
              onRowClick={openComplaint}
              rowLabel={(r) => `فتح الشكوى ${r.id}`}
              empty={{ title: "لا توجد شكاوى" }}
              skeletonRows={2}
            />
          ) : view === "services" ? (
            <DataTable
              columns={reviewCols}
              data={d?.reviewsList}
              getRowId={(r) => r.id}
              loading={q.isLoading}
              error={q.isError}
              onRetry={() => q.refetch()}
              onRowClick={(r) => router.push(`/reviews?review=${r.id}`)}
              rowLabel={(r) => `فتح التقييم ${r.id}`}
              empty={{ title: "لا توجد تقييمات" }}
              skeletonRows={3}
            />
          ) : branches.isLoading ? (
            <Skeleton className="h-40 w-full rounded-16" />
          ) : approvedBranches.length ? (
            // تقييمات الفروع: مش مرسومة كجدول في Figma — صف لكل فرع معتمد بتقييمه وشكاواه
            <ul className="flex flex-col divide-y divide-border rounded-14 border border-border bg-white">
              {approvedBranches.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-13 leading-[22px]">
                  <span className="font-medium text-ink">{b.name}</span>
                  <span className="flex items-center gap-4 text-muted">
                    <span className="num font-medium text-ink">
                      <span className="text-star">★</span> {b.rating ? b.rating.toFixed(1) : "—"}
                    </span>
                    <span className="num">{num(b.complaints)} شكاوى</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="لا توجد تقييمات" />
          )}
        </>
      )}
    </>
  );
}

// بطاقة رد بانتظار الاعتماد (3302-138749): r12 بإطار #E2E7E5 حشو 18·20 مسافة 12 · رأس 100 (العنوان 15 SemiBold + «بانتظار اعتمادك» أخضر)
// سطر العميل 12 رمادي · النص 14 · صندوق الرد #F4F6F5 r10 حشو 12·14 · صف الأزرار 100 (اعتماد ونشر 44 أخضر · تعديل وإرسال للمزوّد · رفض 46 بإطار)
function ReplyCard({ providerId, reply }: { providerId: string; reply: PendingReply }) {
  const qc = useQueryClient();
  const toast = useToast();
  const canEdit = useCan("providers", "edit");
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(reply.text);
  const [err, setErr] = useState("");
  const done = (r: { toast: string }) => {
    toast(r.toast);
    qc.invalidateQueries({ queryKey: ["providers", "quality", providerId] });
    qc.invalidateQueries({ queryKey: ["quality"] });
  };
  const approve = useMutation({ mutationFn: () => api.providerTabs.replies.approve(providerId, reply.id), onSuccess: done });
  const reject = useMutation({ mutationFn: () => api.providerTabs.replies.reject(providerId, reply.id), onSuccess: done });
  const suggest = useMutation({
    mutationFn: () => api.providerTabs.replies.suggest(providerId, reply.id, text),
    onSuccess: done,
    onError: () => setErr("اكتب الرد المقترح"),
  });
  const busy = approve.isPending || reject.isPending || suggest.isPending;

  return (
    <article className="flex flex-col gap-3 rounded-12 border border-[#e2e7e5] bg-white px-4 py-[18px] sm:px-5">
      <div className="flex min-h-[100px] flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] leading-7 font-semibold text-ink">{reply.title}</h3>
        <span className="inline-flex h-[29px] items-center rounded-full bg-[#eaf7ec] px-2.5 text-12 font-semibold text-[#3bb34b]">بانتظار اعتمادك</span>
      </div>
      <p className="text-12 leading-[23px] text-muted">{reply.meta}</p>
      <p className="text-14 leading-[27px] text-ink">{reply.quote}</p>
      <div className="flex flex-col gap-1 rounded-10 bg-surface-1 px-3.5 py-3">
        <span className="text-12 leading-[23px] font-semibold text-muted">{reply.from}</span>
        {editing ? (
          <>
            <textarea
              aria-label="الرد المقترح"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErr("");
              }}
              rows={3}
              className={`w-full resize-y rounded-8 border bg-white p-2.5 text-14 leading-6 text-ink outline-none focus:border-ink ${err ? "border-danger" : "border-border"}`}
            />
            {err ? <span className="text-12 text-danger">{err}</span> : null}
          </>
        ) : (
          <p className="text-14 leading-[27px] text-ink">{reply.text}</p>
        )}
      </div>
      {canEdit ? (
        <div className="flex min-h-[100px] flex-wrap items-center gap-2">
          {editing ? (
            <>
              <Button variant="accent" className="h-11! rounded-12! px-4 text-14" loading={suggest.isPending} disabled={busy} onClick={() => suggest.mutate()}>
                إرسال للمزوّد
              </Button>
              <Button variant="secondary" className="h-[46px]! rounded-12! px-4 text-14" disabled={busy} onClick={() => setEditing(false)}>
                إلغاء
              </Button>
            </>
          ) : (
            <>
              <Button variant="accent" className="h-11! gap-1.5 rounded-12! px-4 text-14" loading={approve.isPending} disabled={busy} onClick={() => approve.mutate()}>
                <Icon name="check" size={16} />
                اعتماد ونشر
              </Button>
              <Button variant="secondary" className="h-[46px]! rounded-12! px-4 text-14" disabled={busy} onClick={() => setEditing(true)}>
                تعديل وإرسال للمزوّد
              </Button>
              <Button variant="secondary" className="h-[46px]! rounded-12! px-4 text-14" loading={reject.isPending} disabled={busy} onClick={() => reject.mutate()}>
                رفض
              </Button>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}
