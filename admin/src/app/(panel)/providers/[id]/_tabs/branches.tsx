"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { Branch } from "@/lib/api/branches";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { TierPill, codeLabel } from "../../../branches/_components/bits";
import { Chips, FilterSelect, WrapHead } from "../_components/tab-bits";
import type { ProfileTabProps } from "./types";

// CON5-07a · ملف المزوّد · جونسون · الفروع (3114-50649 · معتمدة 3312-215819)
// الشريط: شرائح (الكل · معتمدة · بانتظار الزيارة) + «التقييم: الكل» يمين · «إضافة فرع» S ثانوي شمال → اختيار المزوّد (CON5-08M · ?modal=add-branch&provider=)
// الجدول: رأس 58 r10 #F4F6F5 حشو 9·12 · صفوف 65 بفاصل #E8ECEA · أعمدة 200/110/70/80/110/80/110/150/44 · زر التفاصيل 32 r10 → ملف الفرع /branches/<id>
// الرابط: ?tab=branches&bview=approved|pending&brating=high|low
const VIEWS = [
  { value: "", label: "الكل" },
  { value: "approved", label: "معتمدة" },
  { value: "pending", label: "بانتظار الزيارة" },
] as const;
type View = (typeof VIEWS)[number]["value"];
const RATING = [
  { value: "", label: "الكل" },
  { value: "high", label: "4.5 فأكثر" },
  { value: "low", label: "أقل من 4.5" },
];

const live = (b: Branch) => b.status === "approved" || b.status === "new";
/** «14 فنياً» · «9 فنيين» · «فنيان» · «فني واحد» */
const count = (n: number, [one, two, few, many]: [string, string, string, string]) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${n} ${few}` : `${num(n)} ${many}`);
const capacity = (b: Branch) => {
  const t = parseInt(b.technicians, 10);
  const s = parseInt(b.slots, 10);
  if (!live(b) || Number.isNaN(t) || Number.isNaN(s)) return "—";
  return `${count(t, ["فني واحد", "فنيان", "فنيين", "فنياً"])} · ${count(s, ["فتحة واحدة", "فتحتان", "فتحات", "فتحة"])}`;
};

/** خلايا الجدول 13 Regular (الجدول المشترك افتراضه Light) */
const R = (x: ReactNode) => <span className="font-normal">{x}</span>;

export default function BranchesTab({ profile, canEdit }: ProfileTabProps) {
  const url = useUrlState();
  const router = useRouter();
  const id = profile.provider.id;
  const v = url.get("bview") ?? "";
  const view: View = VIEWS.some((x) => x.value === v) ? (v as View) : "";
  const rating = url.get("brating") ?? "";
  const list = useQuery({ queryKey: ["branches", "list", { provider: id }], queryFn: () => api.branches.list({ provider: id }) });
  const ids = (list.data?.items ?? []).map((b) => b.id);
  const stats = useQuery({ queryKey: ["providers", "branch-stats", id, ids], queryFn: () => api.providerTabs.branchStats(ids), enabled: !!list.data });

  const rows = list.data?.items.filter((b) => {
    if (view === "approved" && !live(b)) return false;
    if (view === "pending" && b.status !== "pending-visit" && b.status !== "request") return false;
    if (rating === "high" && !(b.rating != null && b.rating >= 4.5)) return false;
    if (rating === "low" && !(b.rating != null && b.rating < 4.5)) return false;
    return true;
  });
  const filtered = !!(view || rating);
  const st = (b: Branch) => stats.data?.[b.id] ?? null;

  const columns: Column<Branch>[] = [
    {
      id: "name",
      // Figma: العمود 200 وقبله 118 فاضية على اليمين (مجموع الأعمدة أقل من عرض الجدول)
      header: <span className="block md:ms-auto md:w-[200px]">الفرع · الكود</span>,
      width: 318,
      cell: (b) => (
        <span className="flex flex-col gap-0.5 md:ms-auto md:w-[200px]">
          <span className="font-semibold">{b.name}</span>
          <span className="text-12 leading-[18px] font-light text-muted">
            <bdi dir="ltr">{b.code}</bdi>
            {b.reserved ? " (محجوز)" : ""}
          </span>
        </span>
      ),
    },
    { id: "tier", header: "الفئة", width: 110, cell: (b) => (b.tier && live(b) ? <TierPill tier={b.tier} /> : "—") },
    { id: "services", header: "خدمات", width: 70, cell: (b) => R(num(b.services.length)) },
    { id: "complaints", header: "الشكاوى", width: 80, cell: (b) => R(!live(b) ? "—" : b.complaints ? `${num(b.complaints)} مفتوحة` : "0") },
    { id: "margin", header: "هامش أكتوبر", width: 110, cell: (b) => R(st(b) ? `${num(st(b)!.monthMargin)} ر.س` : "—") },
    {
      id: "rating",
      header: "التقييم",
      width: 80,
      cell: (b) =>
        b.rating != null && live(b) ? (
          <span className="font-normal">
            <span className="text-star">★</span> {b.rating.toFixed(1)}
          </span>
        ) : (
          "—"
        ),
    },
    { id: "year", header: <WrapHead>إجمالي الحجوزات 2026</WrapHead>, width: 110, cell: (b) => R(st(b) ? num(st(b)!.yearBookings) : "—") },
    { id: "capacity", header: "الطاقة الاستيعابية", width: 150, cell: (b) => R(capacity(b)) },
    {
      id: "actions",
      header: "",
      width: 44,
      actions: true,
      cell: (b) => (
        <div className="flex w-11 justify-start">
          <Link
            href={`/branches/${b.id}`}
            aria-label={`تفاصيل ${b.name}`}
            title="التفاصيل"
            className="flex size-8 items-center justify-center rounded-10 border border-border bg-white text-ink hover:bg-surface-1"
          >
            <Icon name="info" size={16} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chips items={VIEWS} value={view} onChange={(x) => url.replace({ bview: x || null })} label="حالة الفرع" />
          <FilterSelect label="التقييم" value={rating} options={RATING} onChange={(x) => url.replace({ brating: x || null })} />
        </div>
        {canEdit && profile.provider.status !== "suspended" ? (
          <ButtonLink href={`/branches?modal=add-branch&provider=${id}`} variant="secondary" size="S" icon={<Icon name="plus" size={14} />}>
            إضافة فرع
          </ButtonLink>
        ) : null}
      </div>
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(b) => b.id}
        loading={list.isLoading}
        error={list.isError}
        onRetry={() => list.refetch()}
        filtered={filtered}
        onClearFilters={() => url.replace({ bview: null, brating: null })}
        empty={{
          title: "لا توجد فروع بعد",
          body: "أضف أول فرع للمنشأة وجدول زيارته الميدانية.",
          action: canEdit ? (
            <ButtonLink href={`/branches?modal=add-branch&provider=${id}`} variant="secondary" size="S">
              إضافة فرع
            </ButtonLink>
          ) : undefined,
        }}
        onRowClick={(b) => router.push(`/branches/${b.id}`)}
        rowLabel={(b) => `${b.name} · ${codeLabel(b)}`}
        gap={0}
        edge={12}
        headRadius={10}
        rowPadY={12}
        rowClassName="border-divider"
        skeletonRows={4}
      />
    </>
  );
}
