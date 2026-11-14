"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { KpiCard } from "@/components/panel/Kpi";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { SUB_STATUS, type Subscription } from "@/lib/api/paid-features";
import { num, sar } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { SystemHead } from "../../_components/SystemHead";
import { PaidModals } from "./PaidModals";

// CON5-22 · الميزات المدفوعة · ظهورك على لينكار (3114:64759)
// الرابط: /system/paid-features?modal=paid-plan | paid-activate&provider=<id> | paid-manage&provider=<id>
// «تواصل» (نانو شيلد · انتهت · طلب تواصل) يفتح نافذة الاتصال المشتركة CON5-M00 (?modal=m00-call)
const HINT = "text-13 font-light";

export function PaidFeaturesView() {
  const url = useUrlState();
  const canEdit = useCan("paid-features", "edit");
  const q = useQuery({ queryKey: ["paid-features", "list"], queryFn: () => api.paidFeatures.list() });
  const k = q.data?.kpis;

  const columns = useMemo<Column<Subscription>[]>(
    () => [
      {
        id: "provider",
        header: "مقدّم الخدمة",
        width: 282,
        cell: (s) => (
          <div className="flex flex-col gap-0.5">
            <bdi className="text-13 font-semibold text-ink">{s.name}</bdi>
            <span className="text-12 font-light text-muted">{s.code}</span>
          </div>
        ),
      },
      { id: "status", header: "الحالة", width: 180, cell: (s) => <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-12 font-medium whitespace-nowrap ${SUB_STATUS[s.status].tone}`}>{SUB_STATUS[s.status].label}</span> },
      { id: "start", header: "البداية", width: 160, cell: (s) => <span className="text-13 font-normal">{s.start}</span> },
      { id: "end", header: "النهاية · التجديد", width: 190, cell: (s) => <span className="text-13 font-normal">{s.end}</span> },
      { id: "views", header: "الاستخدام · سبتمبر", width: 150, cell: (s) => <span className="text-13 font-normal">{s.views == null ? "—" : `${num(s.views)} مشاهدة`}</span> },
      {
        id: "actions",
        header: " ",
        width: 110,
        actions: true,
        cell: (s) =>
          !canEdit ? null : s.status === "trial" ? (
            <Button variant="accent" className="h-11! px-4" onClick={() => url.push({ modal: "paid-activate", provider: s.providerId })}>
              تفعيل
            </Button>
          ) : s.status === "monthly" || s.status === "yearly" ? (
            <Button variant="secondary" className="h-[46px]! px-4" onClick={() => url.push({ modal: "paid-manage", provider: s.providerId })}>
              إدارة
            </Button>
          ) : s.status === "expired" ? (
            <Button variant="secondary" className="h-[46px]! px-4" onClick={() => url.push({ modal: "m00-call", phone: s.phone ?? "", ref: s.code })}>
              تواصل
            </Button>
          ) : (
            <span className="text-13 font-normal text-ink">—</span>
          ),
      },
    ],
    [canEdit, url],
  );

  return (
    <>
      <SystemHead
        title="الميزات المدفوعة · ظهورك على لينكار"
        description="لكل مقدّم خدمة شهر مجاني ثم اشتراك."
        actions={
          canEdit ? (
            <Button variant="secondary" className="h-[46px]!" onClick={() => url.push({ modal: "paid-plan" })}>
              إعدادات الخطة
              <Icon name="settings" size={16} />
            </Button>
          ) : null
        }
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="في التجربة" icon="clock" loading={!k} value={k ? num(k.trial.value) : "—"} hint={k?.trial.hint ?? " "} hintClassName={`${HINT} text-warning`} />
        <KpiCard label="مفعّلة" icon="star-filled" loading={!k} value={k ? num(k.active.value) : "—"} hint={k?.active.hint ?? " "} hintClassName={`${HINT} text-success`} />
        <KpiCard label="انتهت دون تفعيل" icon="lock" loading={!k} value={k ? num(k.expired.value) : "—"} hint={k?.expired.hint ?? " "} hintClassName={`${HINT} text-danger`} />
        <KpiCard label="إيراد الشهر" icon="wallet" loading={!k} value={k ? sar(k.revenue.value) : "—"} hint={k?.revenue.hint ?? " "} hintClassName={`${HINT} text-muted`} />
      </div>
      <section className="rounded-16 bg-white p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={q.data?.items}
          getRowId={(s) => s.providerId}
          loading={q.isLoading}
          error={q.isError}
          onRetry={() => q.refetch()}
          empty={{ title: "لا يوجد مقدّمو خدمة بعد" }}
          rowLabel={(s) => `${s.name} · ${SUB_STATUS[s.status].label}`}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
          skeletonRows={5}
        />
      </section>
      <PaidModals />
    </>
  );
}
