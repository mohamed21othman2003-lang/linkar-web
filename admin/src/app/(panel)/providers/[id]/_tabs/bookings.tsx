"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { api } from "@/lib/api";
import { BOOKING_STATUS_OPTIONS, CURRENT_MONTH, MONTH_OPTIONS, type ProviderBookingRow } from "@/lib/api/provider-tabs";
import { arDate, num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { ClearLink, FilterSelect, WrapHead } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الحجوزات (3114-38407 · الزهراء 3114-38697 · الحمراء 3114-38919 · المحمدية 3114-39164)
// القسم 1.5 / 15: «الشكل فقط في المرحلة الأولى: الجدول والفلاتر بلا بيانات» — الجدول بيرسم رأسه وحالة «لا توجد حجوزات».
// الرابط: ?tab=bookings&bbranch=&bstatus=&bperiod=&bservice= · «حجز يدوي» (مميز 44) → CON5-04N1 (قريباً)
// الفلاتر 40 r10 يمين (الفرع · الحالة · الفترة [مختار: #F7FBE9 + ×] · الخدمة) و«مسح الفلاتر» شمال
// الجدول جوه بطاقة حشو 20·20·16: رأس 58 r10 #F4F6F5 · أعمدة 120/80/152/130/80/80/70/170/150.
const ALL = "all";
export default function BookingsTab({ profile }: ProfileTabProps) {
  const url = useUrlState();
  const id = profile.provider.id;
  const f = {
    branch: url.get("bbranch") ?? "",
    status: url.get("bstatus") ?? "",
    period: url.get("bperiod") ?? CURRENT_MONTH,
    service: url.get("bservice") ?? "",
  };
  const branches = useQuery({ queryKey: ["providers", "branches", id], queryFn: () => api.profile.branches(id) });
  const services = useQuery({ queryKey: ["providers", "services", id, "names"], queryFn: () => api.services.list(id, { view: "all" }) });
  const list = useQuery({
    queryKey: ["providers", "bookings", id, f],
    queryFn: () => api.providerTabs.bookings(id, { ...f, period: f.period === ALL ? undefined : f.period }),
  });
  const filtered = !!(f.branch || f.status || f.service || f.period !== CURRENT_MONTH);
  const clear = () => url.replace({ bbranch: null, bstatus: null, bperiod: null, bservice: null });

  const branchOpts = [{ value: "", label: "الكل" }, ...(branches.data ?? []).filter((b) => b.status === "approved").map((b) => ({ value: b.id, label: b.name }))];
  const serviceOpts = [{ value: "", label: "الكل" }, ...[...new Set((services.data?.items ?? []).map((s) => s.name))].map((n) => ({ value: n, label: n }))];
  const periodOpts = [{ value: ALL, label: "الكل" }, ...MONTH_OPTIONS];

  const columns: Column<ProviderBookingRow>[] = [
    {
      id: "code",
      header: "الحجز · العميل",
      width: 120,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">{r.code}</span>
          <span className="text-12 font-light text-muted">{r.customer}</span>
        </span>
      ),
    },
    { id: "branch", header: "الفرع", width: 80, cell: (r) => r.branch },
    { id: "service", header: "الخدمة · الحجم", width: 152, cell: (r) => r.service },
    { id: "done", header: "نُفّذ", width: 130, cell: (r) => arDate(r.doneAt) },
    { id: "sale", header: <WrapHead>سعر البيع · شامل</WrapHead>, width: 80, cell: (r) => num(r.sale) },
    { id: "cost", header: "التكلفة", width: 80, cell: (r) => num(r.cost) },
    { id: "margin", header: "الهامش", width: 70, cell: (r) => num(r.margin) },
    {
      id: "status",
      header: "الحالة",
      width: 170,
      cell: (r) => (r.status === "approved" ? <Pill tone="info">معتمد</Pill> : <Pill className="bg-[#fdf3e1] text-warning">بانتظار الاعتماد</Pill>),
    },
    { id: "actions", header: "", width: 150, actions: true, cell: () => null },
  ];

  return (
    <>
      <div className="flex justify-end">
        <ButtonLink href={`/coming-soon?s=bookings&new=1&provider=${id}`} variant="accent" className="h-11! px-4 text-14">
          حجز يدوي
          <Icon name="plus" size={16} />
        </ButtonLink>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="الفرع" value={f.branch} options={branchOpts} onChange={(v) => url.replace({ bbranch: v || null })} />
          <FilterSelect label="الحالة" value={f.status} options={BOOKING_STATUS_OPTIONS} onChange={(v) => url.replace({ bstatus: v || null })} />
          <FilterSelect label="الفترة" value={f.period} options={periodOpts} onChange={(v) => url.replace({ bperiod: v === CURRENT_MONTH ? null : v })} active={f.period !== ALL} clearTo={ALL} />
          <FilterSelect label="الخدمة" value={f.service} options={serviceOpts} onChange={(v) => url.replace({ bservice: v || null })} />
        </div>
        <ClearLink onClick={clear} />
      </div>
      <div className="flex flex-col gap-3 rounded-16 bg-white px-0 pt-1 pb-0 md:px-5 md:pt-5 md:pb-4">
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(r) => r.code}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={{ title: "لا توجد حجوزات بعد", body: "تظهر هنا حجوزات المزوّد وحالة اعتماد تنفيذها." }}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
          skeletonRows={8}
        />
      </div>
    </>
  );
}
