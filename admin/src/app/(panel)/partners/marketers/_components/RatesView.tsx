"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { PageHead } from "@/components/panel/PageHead";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import type { CommissionRate } from "@/lib/api/marketers";
import { ltrRuns, num } from "@/lib/format";
import { MPill } from "./bits";

// CON5-10 · المسوّقون · نسب العمولة (3114:15905) — بيتفتح من زر «نسب العمولة» في رأس صفحة المسوّقين.
// «تعديل» = نسبة المسوّق جزء من اتفاقية مقدّم الخدمة → يفتح «الخدمات والأسعار» في ملف المزوّد (لا توجد نافذة تعديل في Figma).
const BTN = "inline-flex h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-12 border border-border bg-white px-4 text-14 font-medium text-ink hover:bg-surface-1";

export function RatesView() {
  const q = useQuery({ queryKey: ["marketers", "rates"], queryFn: api.marketers.rates });
  const columns = useMemo<Column<CommissionRate>[]>(
    () => [
      { id: "provider", header: "مقدّم الخدمة", width: 160, cell: (r) => <span className="text-13 leading-5 font-normal">{ltrRuns(r.provider)}</span> },
      { id: "service", header: "الخدمة", width: 260, cell: (r) => <span className="text-13 leading-5 font-normal">{ltrRuns(r.service)}</span> },
      { id: "branches", header: "الفروع", width: 150, cell: (r) => <span className="text-13 leading-5 font-normal">{r.branches}</span> },
      { id: "type", header: "نوع العمولة", width: 150, cell: (r) => <span className="text-13 leading-5 font-normal">{r.type}</span> },
      { id: "value", header: "القيمة", width: 90, cell: (r) => <span className="text-13 leading-5 font-normal">{r.value}</span> },
      { id: "visible", header: "الظهور", width: 150, cell: () => <MPill tone="success">متاحة للمسوّقين</MPill> },
      {
        id: "actions",
        header: " ",
        width: 110,
        cell: (r) => (
          <Link href={`/providers/${r.providerId}?tab=services`} className={BTN}>
            تعديل
            <Icon name="edit" size={16} />
          </Link>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <PageHead
        title="نسب عمولة المسوّقين"
        description="عمولة المسوّق لكل خدمة لدى كل مقدّم خدمة حسب الاتفاق معه"
        actions={
          <Link href="/partners/marketers" className={BTN}>
            رجوع إلى المسوّقين
          </Link>
        }
      />
      <section className="flex min-w-0 flex-col gap-3 rounded-16 border border-border bg-white px-4 pt-5 pb-4 sm:px-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-18 leading-7 font-bold text-ink">العمولة حسب الخدمة</h2>
          <p className="text-13 leading-5 font-light text-muted">{q.data ? `${num(q.data.total)} خدمات متاحة للمسوّقين لدى ${num(q.data.providers)} مقدّمي خدمة` : " "}</p>
        </div>
        <DataTable
          columns={columns}
          data={q.data?.items}
          getRowId={(r) => r.id}
          loading={q.isLoading}
          error={q.isError}
          onRetry={() => q.refetch()}
          empty={{ title: "لا توجد خدمات متاحة للمسوّقين" }}
          gap={0}
          edge={12}
          headRadius={10}
          rowPadY={12}
          rowClassName="border-divider"
        />
      </section>
    </>
  );
}
