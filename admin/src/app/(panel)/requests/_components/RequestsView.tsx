"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PageHead } from "@/components/panel/PageHead";
import { RowMenu, type RowMenuItem } from "@/components/panel/RowMenu";
import { Tabs } from "@/components/panel/Tabs";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { REQ_TABS, STATUS_CHIPS, type ReqTab, type RequestRow, type StatusFilter } from "@/lib/api/requests";
import { arDate } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { OfferDrawer } from "./OfferDrawer";
import { RequestDrawer } from "./RequestDrawer";
import { RequestModals } from "./RequestModals";
import { RoundBtn, StatusChips, TypePill } from "./bits";

// CON5-03 · الطلبات (3114:29233) وتبويباته: تعديل الأسعار (3114:30767) · إضافة خدمات (3114:30520)
// · تعذّر وإعادة جدولة (3114:31095) · البيانات والحسابات (3114:31234).
// الرابط: /requests?tab=prices|services|reschedule|data&status=open|approved|rejected&request=<REQ>&modal=req-… (القسم 2.3)
const TAB_KEYS = REQ_TABS.map((t) => t.key);
const EMPTY: Record<"all" | ReqTab, string> = {
  all: "لا توجد طلبات",
  prices: "لا توجد طلبات تعديل أسعار",
  services: "لا توجد طلبات إضافة خدمات",
  reschedule: "لا توجد طلبات تعذّر أو إعادة جدولة",
  data: "لا توجد طلبات بيانات أو حسابات",
};

export function RequestsView() {
  const url = useUrlState();
  const toast = useToast();
  const qc = useQueryClient();
  const tab = (TAB_KEYS as string[]).includes(url.get("tab") ?? "") ? (url.get("tab") as "all" | ReqTab) : "all";
  const status = (STATUS_CHIPS.map((c) => c.key) as string[]).includes(url.get("status") ?? "") ? (url.get("status") as StatusFilter) : "open";
  const q = useQuery({ queryKey: ["requests", "list", { tab, status }], queryFn: () => api.requests.list({ tab, status }) });
  const counts = q.data?.counts;

  const review = useMutation({
    mutationFn: (id: string) => api.requests.markReview(id),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["requests"] });
      toast("قيد النظر", r.toast);
    },
  });

  const columns = useMemo<Column<RequestRow>[]>(() => {
    const open = (id: string) => url.push({ request: id });
    const menu = (r: RequestRow): RowMenuItem[] => [
      { label: "عرض التفاصيل", icon: "info", onSelect: () => open(r.id) },
      ...(r.status === "new" ? [{ label: "وضع «قيد النظر»", icon: "clock" as const, onSelect: () => review.mutate(r.id) }] : []),
      { label: "إسناد لمسؤول", icon: "user", onSelect: () => url.push({ modal: "m00-assign", ref: r.id }) },
      { label: "ملاحظة داخلية", icon: "edit", onSelect: () => url.push({ modal: "m00-note", ref: r.id }) },
      ...(r.providerId ? [{ label: "ملف مقدّم الخدمة", icon: "store" as const, dividerBefore: true, onSelect: () => window.location.assign(`/providers/${r.providerId}`) }] : []),
    ];
    return [
      { id: "id", header: "رقم الطلب", width: 130, cell: (r) => <bdi className="text-13 leading-5 font-normal text-ink">{r.id}</bdi> },
      { id: "type", header: "النوع", width: 160, cell: (r) => <TypePill tone={r.tone}>{r.type}</TypePill> },
      {
        id: "provider",
        header: "مقدّم الخدمة · الفرع",
        width: 140,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{r.provider}</span>
            <span className="text-12 leading-[18px] font-light text-muted">{r.scope}</span>
          </div>
        ),
      },
      {
        id: "subject",
        header: "الموضوع",
        width: 432,
        cell: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-13 leading-5 font-semibold text-ink">{r.subject}</span>
            <span className="text-12 leading-[18px] font-light text-muted">{r.sub}</span>
          </div>
        ),
      },
      { id: "sent", header: "أُرسل", width: 120, cell: (r) => <span className="text-13 leading-5 font-normal text-ink">{arDate(r.sentAt)}</span> },
      {
        id: "actions",
        header: "",
        width: 90,
        actions: true,
        cell: (r) => (
          <div className="flex items-center gap-2">
            <RoundBtn label="التفاصيل" icon="info" onClick={() => open(r.id)} />
            <RowMenu items={menu(r)} label={`إجراءات ${r.id}`} />
          </div>
        ),
      },
    ];
  }, [url, review]);

  return (
    <>
      <PageHead title="الطلبات" description="طلبات مقدّمي الخدمة المعتمدين وقراراتها." />
      <section className="flex flex-col gap-3.5 rounded-16 bg-white px-4 pt-5 pb-4 sm:px-5">
        <Tabs
          variant="pill"
          label="نوع الطلب"
          value={tab}
          onChange={(k) => url.replace({ tab: k === "all" ? null : k, status: null })}
          items={REQ_TABS.map((t) => ({ ...t, count: counts?.tabs[t.key] }))}
        />
        <StatusChips value={status} onChange={(k) => url.replace({ status: k === "open" ? null : k })} items={STATUS_CHIPS.map((c) => ({ ...c, count: counts?.status[c.key] ?? 0 }))} />
        <DataTable
          columns={columns}
          data={q.data?.items}
          getRowId={(r) => r.id}
          loading={q.isLoading}
          error={q.isError}
          onRetry={() => q.refetch()}
          empty={{ title: EMPTY[tab] }}
          onRowClick={(r) => url.push({ request: r.id })}
          rowLabel={(r) => `${r.id} · ${r.type}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
          skeletonRows={8}
        />
      </section>
      <RequestDrawer />
      <RequestModals />
      <OfferDrawer />
    </>
  );
}
