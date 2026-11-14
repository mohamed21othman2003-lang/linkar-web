"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { api } from "@/lib/api";
import { BOOKING_STATUS_OPTIONS, CURRENT_MONTH, MONTH_OPTIONS, PROVIDER_BOOKINGS_PAGE, type ProviderBookingRow } from "@/lib/api/provider-tabs";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { BookingOverlays } from "../../../bookings/_components/BookingOverlays";
import { Money, Pagination, Plain, SquareBtn, Txt, TwoLine } from "../../../bookings/_components/bits";
import { ClearLink, FilterSelect } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الحجوزات (3114-38407 · الزهراء 3114-38697 · الحمراء 3114-38919 · المحمدية 3114-39164)
// البيانات: الحجوزات المنفّذة للمزوّد من مخزن قسم الحجوزات (api.providerTabs.bookings ← api.bookings.list({ provider })).
// الصف و«التفاصيل» → /bookings?booking=BK-… · «اعتماد ✓» → نافذة الاعتماد بتاعة الحجوزات هنا (?modal=approve&b=BK-…).
// فلتر فرع مختار = عمود «الفرع» بيفضى (3114-38697). 8 صفوف في الصفحة + ترقيم (?bpage=).
// الرابط: ?tab=bookings&bbranch=&bstatus=&bperiod=&bservice=&bpage= · «حجز يدوي» (مميز 44) → /bookings/new (CON5-04N1)
// الفلاتر 40 r10 يمين (الفرع · الحالة · الفترة [مختار: #F7FBE9 + ×] · الخدمة) و«مسح الفلاتر» شمال
// الجدول جوه بطاقة حشو 20·20·16: رأس 58 r10 #F4F6F5 · أعمدة 120/80/152/130/80/80/70/170/150.
const ALL = "all";
export default function BookingsTab({ profile }: ProfileTabProps) {
  const canBook = useCan("bookings", "edit");
  const url = useUrlState();
  const router = useRouter();
  const id = profile.provider.id;
  const f = {
    branch: url.get("bbranch") ?? "",
    status: url.get("bstatus") ?? "",
    period: url.get("bperiod") ?? CURRENT_MONTH,
    service: url.get("bservice") ?? "",
  };
  const branches = useQuery({ queryKey: ["providers", "branches", id], queryFn: () => api.profile.branches(id) });
  const services = useQuery({ queryKey: ["providers", "services", id, "names"], queryFn: () => api.services.list(id, { view: "all" }) });
  const page = Math.max(1, Number(url.get("bpage")) || 1);
  // تحت مفتاح «bookings» عشان أي إجراء من نوافذ الحجوزات (اعتماد …) يحدّث الجدول
  const list = useQuery({
    queryKey: ["bookings", "provider", id, f, page],
    queryFn: () => api.providerTabs.bookings(id, { ...f, period: f.period === ALL ? undefined : f.period, page }),
  });
  const filtered = !!(f.branch || f.status || f.service || f.period !== CURRENT_MONTH);
  const clear = () => url.replace({ bbranch: null, bstatus: null, bperiod: null, bservice: null, bpage: null });

  const branchOpts = [{ value: "", label: "الكل" }, ...(branches.data ?? []).filter((b) => b.status === "approved").map((b) => ({ value: b.id, label: b.name }))];
  const serviceOpts = [{ value: "", label: "الكل" }, ...[...new Set((services.data?.items ?? []).map((s) => s.name))].map((n) => ({ value: n, label: n }))];
  const periodOpts = [{ value: ALL, label: "الكل" }, ...MONTH_OPTIONS];

  const openBooking = (r: ProviderBookingRow) => router.push(`/bookings?booking=${r.code}`);
  const columns: Column<ProviderBookingRow>[] = [
    { id: "code", header: "الحجز · العميل", width: 120, cell: (r) => <TwoLine top={r.code} bottom={r.customer} /> },
    // فرع مختار: العمود بيفضل مكانه فاضي (3114-38697)
    { id: "branch", header: f.branch ? " " : "الفرع", width: 80, cell: (r) => (f.branch ? null : <Plain>{r.branch}</Plain>) },
    { id: "service", header: "الخدمة · الحجم", width: 152, cell: (r) => <Plain><Txt s={r.service} /></Plain> },
    { id: "done", header: "نُفّذ", width: 130, cell: (r) => <Plain>{r.doneAt}</Plain> },
    { id: "sale", header: <Head2>سعر البيع</Head2>, width: 80, cell: (r) => <Money v={r.sale} /> },
    { id: "cost", header: <Head2>التكلفة</Head2>, width: 80, cell: (r) => <Money v={r.cost} /> },
    { id: "margin", header: "الهامش", width: 70, cell: (r) => <Money v={r.margin} /> },
    {
      id: "status",
      header: "الحالة",
      width: 170,
      cell: (r) => (r.status === "approved" ? <Pill tone="info">معتمد</Pill> : <Pill className="bg-[#fdf3e1] text-warning">بانتظار الاعتماد</Pill>),
    },
    {
      id: "actions",
      header: " ",
      width: 150,
      // Figma: «التفاصيل» 32 r8 يمين و«اعتماد ✓» (أخضر 34 r12) على شماله — الصف المعتمد فيه «التفاصيل» بس
      cell: (r) => (
        <div className={`flex items-center gap-1.5 ${r.status === "approved" ? "" : "justify-end"}`} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <SquareBtn icon="info" label={`تفاصيل ${r.code}`} onClick={() => openBooking(r)} />
          {r.status === "pending-approval" && canBook ? (
            <button type="button" onClick={() => url.push({ modal: "approve", b: r.code })} className="flex h-[34px] items-center rounded-12 bg-lime px-3 text-14 leading-[22px] font-medium text-ink hover:bg-lime/90">
              اعتماد ✓
            </button>
          ) : null}
        </div>
      ),
    },
  ];
  const pages = Math.ceil((list.data?.total ?? 0) / PROVIDER_BOOKINGS_PAGE);

  return (
    <>
      {/* يختفي لمن لا يملك تعديل الحجوزات (القسم 19.1 · 7) */}
      {canBook ? (
        <div className="flex justify-end">
          <ButtonLink href={`/bookings/new?step=1&provider=${id}`} variant="accent" className="h-11! px-4 text-14">
            حجز يدوي
            <Icon name="plus" size={16} />
          </ButtonLink>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="الفرع" value={f.branch} options={branchOpts} onChange={(v) => url.replace({ bbranch: v || null, bpage: null })} />
          <FilterSelect label="الحالة" value={f.status} options={BOOKING_STATUS_OPTIONS} onChange={(v) => url.replace({ bstatus: v || null, bpage: null })} />
          <FilterSelect label="الفترة" value={f.period} options={periodOpts} onChange={(v) => url.replace({ bperiod: v === CURRENT_MONTH ? null : v, bpage: null })} active={f.period !== ALL} clearTo={ALL} />
          <FilterSelect label="الخدمة" value={f.service} options={serviceOpts} onChange={(v) => url.replace({ bservice: v || null, bpage: null })} />
        </div>
        <ClearLink onClick={clear} />
      </div>
      <div className="flex flex-col gap-3 rounded-16 bg-white px-0 pt-1 pb-0 md:px-5 md:pt-5 md:pb-4">
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(r) => r.code}
          onRowClick={openBooking}
          rowLabel={(r) => `تفاصيل ${r.code}`}
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
        <Pagination page={page} pages={pages} onPage={(n) => url.replace({ bpage: n === 1 ? null : String(n) })} />
      </div>
      <BookingOverlays />
    </>
  );
}

/** رأس بسطرين: «سعر البيع / التكلفة» + «شامل الضريبة» */
function Head2({ children }: { children: ReactNode }) {
  return (
    <span className="block leading-5 whitespace-normal">
      {children}
      <br />
      شامل الضريبة
    </span>
  );
}
