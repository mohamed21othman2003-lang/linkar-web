"use client";

import { createColumnHelper, tableFeatures, useTable, type RowData } from "@tanstack/react-table";
import { useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Spinner";
import { EmptyState } from "./PageHead";

// جدول (القسم 3.5 «Table» · Figma CON5-23 3114:24841): رأس 38 على #F4F6F5 r8 بنص 12 Medium رمادي،
// صفوف بحشو 10 وفاصل سفلي #D9DEDB، وعمود الإجراءات آخر الصف (على الشمال). الأعمدة بعرض المحتوى من Figma
// (`width`) والمسافة بين الأعمدة `gap` (10 افتراضياً). لو الجدول أعرض من المساحة: تمرير أفقي داخلي (القسم 3.4).
// الحالات (القسم 2.7): تحميل (هيكل رمادي) · فارغ · لا نتائج + «مسح الفلاتر» · خطأ + «إعادة المحاولة».
export type Column<T> = {
  id: string;
  header: ReactNode;
  /** عرض المحتوى بالبكسل كما في Figma (من غير المسافة بين الأعمدة) */
  width?: number;
  cell: (row: T) => ReactNode;
  align?: "start" | "center" | "end";
  /** خلية أزرار: الضغط جواها ما يفتحش الصف */
  actions?: boolean;
};

type Meta = { width?: number; align?: "start" | "center" | "end"; actions?: boolean };
const features = tableFeatures({ columnMeta: {} as Meta });

const ALIGN = { start: "text-start", center: "text-center", end: "text-end" };

export function DataTable<T extends RowData>({
  columns,
  data,
  getRowId,
  loading,
  error,
  onRetry,
  filtered,
  onClearFilters,
  empty,
  onRowClick,
  rowLabel,
  gap = 10,
  edge = 10,
  headRadius = 8,
  rowClassName = "border-border",
  skeletonRows = 6,
  rowPadY = 10,
}: {
  columns: Column<T>[];
  data: T[] | undefined;
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** فيه بحث أو فلتر مفعّل → الحالة الفاضية تبقى «لا توجد نتائج» */
  filtered?: boolean;
  onClearFilters?: () => void;
  empty?: { title: string; body?: string; action?: ReactNode };
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  /** المسافة بين الأعمدة وحشو أول/آخر عمود (Figma: 10/10 هنا، 0/12 في CON5-07) */
  gap?: number;
  edge?: number;
  /** زوايا صف العناوين (8 هنا، 10 في CON5-07) */
  headRadius?: 8 | 10;
  /** لون فاصل الصفوف (border-border أو border-divider) */
  rowClassName?: string;
  skeletonRows?: number;
  /** حشو الصف فوق وتحت (10 هنا، 12 في CON5-07) */
  rowPadY?: number;
}) {
  const helper = useMemo(() => createColumnHelper<typeof features, T>(), []);
  const defs = useMemo(
    () => helper.columns(columns.map((c) => helper.display({ id: c.id, header: () => c.header, cell: (ctx) => c.cell(ctx.row.original), meta: { width: c.width, align: c.align, actions: c.actions } }))),
    [columns, helper],
  );
  const rows = useMemo(() => data ?? [], [data]);
  const table = useTable({ features, columns: defs, data: rows, getRowId: (r) => getRowId(r) });

  const pad = (i: number, n: number) => ({
    paddingInlineStart: i === 0 ? edge : gap / 2,
    paddingInlineEnd: i === n - 1 ? edge : gap / 2,
  });
  const minWidth = columns.reduce((s, c) => s + (c.width ?? 120), 0) + gap * (columns.length - 1) + edge * 2;

  const body = () => {
    if (loading)
      return Array.from({ length: skeletonRows }, (_, r) => (
        <tr key={r}>
          {columns.map((c, i) => (
            <td key={c.id} style={pad(i, columns.length)} className={`border-b py-[18px] ${rowClassName}`}>
              <Skeleton className={`h-4 ${c.actions ? "ms-auto w-24" : "w-3/4"}`} />
            </td>
          ))}
        </tr>
      ));
    if (error)
      return (
        <StateRow span={columns.length}>
          <EmptyState title="تعذّر تحميل البيانات" body="حدث خطأ أثناء التحميل. حاول مرة أخرى." action={onRetry ? <Button variant="secondary" size="S" onClick={onRetry}>إعادة المحاولة</Button> : null} />
        </StateRow>
      );
    if (!rows.length)
      return (
        <StateRow span={columns.length}>
          {filtered ? (
            <EmptyState title="لا توجد نتائج" body="جرّب كلمة بحث أخرى أو غيّر الفلاتر." action={onClearFilters ? <Button variant="secondary" size="S" onClick={onClearFilters}>مسح الفلاتر</Button> : null} />
          ) : (
            <EmptyState title={empty?.title ?? "لا توجد بيانات بعد"} body={empty?.body} action={empty?.action} />
          )}
        </StateRow>
      );
    return table.getRowModel().rows.map((row) => (
      <tr
        key={row.id}
        onClick={onRowClick ? () => onRowClick(row.original) : undefined}
        onKeyDown={onRowClick ? (e) => e.key === "Enter" && e.target === e.currentTarget && onRowClick(row.original) : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        aria-label={rowLabel?.(row.original)}
        className={`${onRowClick ? "cursor-pointer hover:bg-surface-1/60 focus-visible:bg-surface-1" : ""}`}
      >
        {row.getAllCells().map((cell, i) => {
          const m = cell.column.columnDef.meta;
          return (
            <td
              key={cell.id}
              style={{ ...pad(i, columns.length), paddingBlock: rowPadY }}
              onClick={m?.actions ? (e) => e.stopPropagation() : undefined}
              onKeyDown={m?.actions ? (e) => e.stopPropagation() : undefined}
              className={`border-b align-middle ${rowClassName} text-13 font-light text-ink ${ALIGN[m?.align ?? "start"]}`}
            >
              {m?.actions ? <div className="flex items-center justify-end gap-1.5">{<table.FlexRender cell={cell} />}</div> : <table.FlexRender cell={cell} />}
            </td>
          );
        })}
      </tr>
    ));
  };

  // أقل من md: كل صف كارت (العمود الأول عنوان، والباقي «العنوان: القيمة»، والإجراءات تحت) بدل جدول بتمرير جانبي
  const stateNode = () => {
    if (error)
      return <EmptyState title="تعذّر تحميل البيانات" body="حدث خطأ أثناء التحميل. حاول مرة أخرى." action={onRetry ? <Button variant="secondary" size="S" onClick={onRetry}>إعادة المحاولة</Button> : null} />;
    if (!rows.length)
      return filtered ? (
        <EmptyState title="لا توجد نتائج" body="جرّب كلمة بحث أخرى أو غيّر الفلاتر." action={onClearFilters ? <Button variant="secondary" size="S" onClick={onClearFilters}>مسح الفلاتر</Button> : null} />
      ) : (
        <EmptyState title={empty?.title ?? "لا توجد بيانات بعد"} body={empty?.body} action={empty?.action} />
      );
    return null;
  };
  const cards = () => {
    if (loading) return Array.from({ length: Math.min(skeletonRows, 4) }, (_, r) => <Skeleton key={r} className="h-28 w-full rounded-12" />);
    const st = stateNode();
    if (st) return st;
    return table.getRowModel().rows.map((row) => {
      const cells = row.getAllCells();
      const [first, ...rest] = cells;
      const actions = rest.filter((c) => c.column.columnDef.meta?.actions);
      const fields = rest.filter((c) => !c.column.columnDef.meta?.actions);
      return (
        <div
          key={row.id}
          onClick={onRowClick ? () => onRowClick(row.original) : undefined}
          onKeyDown={onRowClick ? (e) => e.key === "Enter" && e.target === e.currentTarget && onRowClick(row.original) : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          aria-label={rowLabel?.(row.original)}
          className={`flex flex-col gap-2.5 rounded-12 border border-border bg-white p-3.5 ${onRowClick ? "cursor-pointer focus-visible:bg-surface-1" : ""}`}
        >
          <div className="text-13 text-ink">
            <table.FlexRender cell={first} />
          </div>
          {fields.length ? (
            <dl className="flex flex-col gap-1.5 border-t border-divider pt-2.5">
              {fields.map((c) => {
                const col = columns.find((x) => x.id === c.column.id);
                return (
                  <div key={c.id} className="flex items-start justify-between gap-3 text-13">
                    <dt className="shrink-0 font-light text-muted">{col?.header}</dt>
                    <dd className="min-w-0 text-end font-light text-ink">
                      <table.FlexRender cell={c} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : null}
          {actions.length ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-divider pt-2.5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
              {actions.map((c) => (
                <table.FlexRender key={c.id} cell={c} />
              ))}
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">{cards()}</div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full table-fixed border-separate border-spacing-0" style={{ minWidth }}>
          <colgroup>
            {columns.map((c, i) => (
              <col key={c.id} style={c.width ? { width: c.width + (i === 0 || i === columns.length - 1 ? edge + gap / 2 : gap) } : undefined} />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h, i) => (
                  <th
                    key={h.id}
                    scope="col"
                    style={pad(i, columns.length)}
                    className={`bg-surface-1 py-[9px] text-12 font-medium whitespace-nowrap text-muted ${headRadius === 10 ? "first:rounded-s-10 last:rounded-e-10" : "first:rounded-s-8 last:rounded-e-8"} ${ALIGN[h.column.columnDef.meta?.align ?? "start"]}`}
                  >
                    <table.FlexRender header={h} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>{body()}</tbody>
        </table>
      </div>
    </>
  );
}

function StateRow({ span, children }: { span: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={span}>{children}</td>
    </tr>
  );
}
