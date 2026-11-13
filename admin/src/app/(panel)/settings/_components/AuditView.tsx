"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DataTable, type Column } from "@/components/panel/DataTable";
import { ExportModal } from "@/components/panel/ExportModal";
import { FilterBar, SearchInput } from "@/components/panel/FilterBar";
import { BeforeAfter, KV, Tile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { PageHead } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/api/users";
import { arDate, arTime } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";

// CON5-23L · سجل التدقيق (3114-28160) — للقراءة فقط: بحث + فلاتر (المستخدم، الوحدة، الفترة) + تصدير (CON5-M00).
// الضغط على صف يفتح درج القيم قبل التغيير وبعده (CON5-23LD 3114-28289). الحالة كلها في الرابط.
// TODO(designer): خيارات «الفترة» غير موجودة في القسم 17 — مفترضة: آخر 7 أيام / آخر 30 يوماً / آخر 90 يوماً / كل الفترات
const PERIODS = [
  { value: "7", label: "آخر 7 أيام" },
  { value: "30", label: "آخر 30 يوماً" },
  { value: "90", label: "آخر 90 يوماً" },
  { value: "all", label: "كل الفترات" },
];

export const when = (iso: string) => `${arDate(iso)} · ${arTime(iso)}`;

export function AuditView() {
  const url = useUrlState();
  const q = url.get("q") ?? "";
  const user = url.get("by") ?? "all";
  const unit = url.get("unit") ?? "all";
  const period = url.get("period") ?? "30";
  const logId = url.get("log");
  const exporting = url.get("modal") === "export";

  // البحث بيتكتب محلياً ويتبعت للرابط بعد توقّف بسيط
  const [search, setSearch] = useState(q);
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => url.replace({ q: search || null }), 300);
    return () => clearTimeout(t);
  }, [search, q, url]);

  const list = useQuery({ queryKey: ["audit", "list", { q, user, unit, period }], queryFn: () => api.audit.list({ search: q, user, module: unit, period }), placeholderData: keepPreviousData });
  const facets = useQuery({ queryKey: ["audit", "facets"], queryFn: api.audit.facets });
  const entry = list.data?.items.find((e) => e.id === logId);
  const detail = useQuery({ queryKey: ["audit", "detail", logId], queryFn: () => api.audit.get(logId!), enabled: !!logId && !entry });
  const shown = entry ?? detail.data;

  const filtered = !!q || user !== "all" || unit !== "all" || period !== "30";
  const clear = () => {
    setSearch("");
    url.replace({ q: null, by: null, unit: null, period: null });
  };

  const columns = useMemo<Column<AuditEntry>[]>(
    () => [
      { id: "at", header: "الوقت", width: 190, cell: (e) => when(e.at) },
      { id: "user", header: "المستخدم", width: 140, cell: (e) => e.user },
      { id: "module", header: "الوحدة", width: 150, cell: (e) => e.module },
      { id: "action", header: "الإجراء", width: 140, cell: (e) => <span className="font-medium">{e.action}</span> },
      { id: "item", header: "العنصر", width: 270, cell: (e) => <bdi>{e.item}</bdi> },
      { id: "ip", header: "IP", width: 90, cell: (e) => (e.ip ? <span className="num">{e.ip}</span> : "—") },
      {
        id: "actions",
        header: " ",
        width: 34,
        actions: true,
        cell: (e) => (
          <button
            type="button"
            aria-label={`تفاصيل ${e.action}`}
            title="التفاصيل"
            onClick={() => url.push({ log: e.id })}
            className="flex h-8 w-[34px] shrink-0 items-center justify-center rounded-8 border border-border bg-white text-ink hover:bg-surface-1"
          >
            <Icon name="info" size={18} />
          </button>
        ),
      },
    ],
    [url],
  );

  const userOptions = [{ value: "all", label: "الكل" }, ...(facets.data?.users ?? []).map((u) => ({ value: u, label: u }))];
  const moduleOptions = [{ value: "all", label: "الكل" }, ...(facets.data?.modules ?? []).map((m) => ({ value: m, label: m }))];

  return (
    <>
      <PageHead
        title="سجل التدقيق"
        description="كل إجراء نفّذه فريق لينكار أو النظام، مع القيم قبل التغيير وبعده."
        actions={
          <Button variant="secondary" icon={<Icon name="download" size={18} />} onClick={() => url.push({ modal: "export" })}>
            تصدير
          </Button>
        }
      />
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-5">
        <FilterBar onClear={clear} canClear={filtered}>
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالعنصر أو الإجراء" />
          <Select variant="filter" label="المستخدم" value={user} options={userOptions} onChange={(v) => url.replace({ by: v === "all" ? null : v })} />
          <Select variant="filter" label="الوحدة" value={unit} options={moduleOptions} onChange={(v) => url.replace({ unit: v === "all" ? null : v })} />
          <Select variant="filter" label="الفترة" value={period} options={PERIODS} onChange={(v) => url.replace({ period: v === "30" ? null : v })} />
        </FilterBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(e) => e.id}
          loading={list.isLoading}
          error={list.isError}
          onRetry={() => list.refetch()}
          filtered={filtered}
          onClearFilters={clear}
          empty={{ title: "لا توجد إجراءات مسجّلة بعد" }}
          onRowClick={(e) => url.push({ log: e.id })}
          rowLabel={(e) => `تفاصيل ${e.action} · ${e.item}`}
        />
      </section>

      {/* CON5-23LD · LOG-n (3114-28289 …) */}
      <Drawer open={!!logId} onOpenChange={(o) => !o && url.replace({ log: null })} title={shown?.action ?? "…"} subtitle={shown ? when(shown.at) : undefined}>
        {shown ? (
          <>
            <Tile title="الإجراء">
              <KV k="المستخدم">{shown.user}</KV>
              <KV k="الوحدة">{shown.module}</KV>
              <KV k="العنصر">
                <bdi>{shown.item}</bdi>
              </KV>
              <KV k="IP">{shown.ip ? <span className="num">{shown.ip}</span> : "—"}</KV>
            </Tile>
            <Tile title="قبل وبعد">
              <KV k={shown.change.field}>{""}</KV>
              <BeforeAfter before={shown.change.before} after={shown.change.after} />
            </Tile>
            <Note tone="neutral">السجل لا يُعدَّل ولا يُحذف.</Note>
          </>
        ) : detail.isError ? (
          <Note tone="neutral">هذا السجل غير موجود.</Note>
        ) : (
          <div className="flex flex-col gap-3.5">
            <Skeleton className="h-[170px] w-full rounded-14" />
            <Skeleton className="h-[178px] w-full rounded-14" />
          </div>
        )}
      </Drawer>

      <ExportModal open={exporting} onOpenChange={(o) => !o && url.replace({ modal: null })} module="سجل التدقيق" filters={{ q, user, unit, period }} />
    </>
  );
}
