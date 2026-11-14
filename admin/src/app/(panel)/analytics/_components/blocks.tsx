import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Spinner";
import type { Bar, BarTone, Block, Cell, Column, Stat, TableCol } from "@/lib/api/analytics";

// مكوّنات «CON5 · التحليلات · تبويبات» (2126:411) — رسوم SVG/CSS بسيطة بنفس مقاسات Figma (بدون مكتبة رسوم):
// رقم: #F4F6F5 r12 حشو 14 · الرقم 18 Bold · العنوان 12 Medium رمادي
// بطاقة: إطار r16 حشو 20 مسافة 14 (12 في «الاعتماد والطاقة») · العنوان 18 Bold · الوصف 13 Light رمادي
// أعمدة: ارتفاع 210 · أعمدة 44 r6 أقصاها 150 · القيمة والشهر 12 Medium · الحالي أخضر
// أشرطة: العنوان والقيمة 13 Medium · مسار 8 r4 #EEF1EF والملء كحلي من اليمين
// جدول: رأس #F4F6F5 r8 حشو 9·10 (12 Medium رمادي) · صفوف حشو 10 بفاصل #D9DEDB (13 Light) · صف الإجمالي #EEF1EF

export function StatTile({ s }: { s?: Stat }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-12 bg-surface-1 p-3.5">
      {s ? <span className="num text-18 leading-[30px] font-bold text-ink">{s.value}</span> : <Skeleton className="my-1.5 h-[18px] w-16" />}
      <span className="text-12 leading-5 font-medium text-muted">{s?.label ?? " "}</span>
    </div>
  );
}

export function StatsRow({ stats, loading, count = 4 }: { stats?: Stat[]; loading?: boolean; count?: number }) {
  const list: (Stat | undefined)[] = loading ? Array.from({ length: count }, () => undefined) : (stats ?? []);
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:flex">
      {list.map((s, i) => (
        <StatTile key={i} s={s} />
      ))}
    </div>
  );
}

function CardShell({ title, sub, tight, children }: { title: string; sub?: string; tight?: boolean; children: ReactNode }) {
  return (
    <section className={`flex min-w-0 flex-1 flex-col rounded-16 border border-border bg-white p-4 sm:p-5 ${tight ? "gap-3" : "gap-3.5"}`}>
      <div className="flex flex-col">
        <h3 className="text-18 leading-[30px] font-bold text-ink">{title}</h3>
        {sub ? <p className="text-13 leading-[22px] font-light text-muted">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function BlockCard({ b }: { b: Block }) {
  switch (b.kind) {
    case "columns":
      return (
        <CardShell title={b.title} sub={b.sub}>
          <Columns cols={b.cols} max={b.max} />
        </CardShell>
      );
    case "bars":
      return (
        <CardShell title={b.title} sub={b.sub} tight={b.tight}>
          {b.stats ? <StatsRow stats={b.stats} /> : null}
          {b.bars.length ? b.bars.map((x) => <BarRow key={x.label} bar={x} />) : <p className="py-6 text-center text-13 text-muted">لا توجد بيانات في الفترة</p>}
        </CardShell>
      );
    case "table":
      return (
        <CardShell title={b.title} sub={b.sub}>
          <DataGrid cols={b.cols} groups={b.groups} rows={b.rows} label={b.title} />
          {b.tables?.map((t, i) => <DataGrid key={i} cols={t.cols} rows={t.rows} label={t.cols[0]?.label ?? b.title} />)}
        </CardShell>
      );
    case "stats":
      return (
        <CardShell title={b.title} sub={b.sub}>
          <StatsRow stats={b.stats} />
        </CardShell>
      );
  }
}

const COL_H = 150;

export function Columns({ cols, max }: { cols: Column[]; max?: number }) {
  const top = max ?? Math.max(1, ...cols.map((c) => c.n));
  return (
    <div role="img" aria-label={cols.map((c) => `${c.label} ${c.value}`).join(" · ")} className="flex h-[210px] items-end gap-2 sm:gap-3.5">
      {cols.map((c) => (
        <div key={c.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="num text-12 leading-5 font-medium whitespace-nowrap text-ink">{c.value}</span>
          <span aria-hidden className={`w-full max-w-11 rounded-[6px] ${c.hi ? "bg-lime" : "bg-ink"}`} style={{ height: Math.round((c.n / top) * COL_H) }} />
          <span className="text-12 leading-5 font-medium whitespace-nowrap text-muted">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

const TONE: Record<BarTone, string> = { ink: "bg-ink", lime: "bg-lime", info: "bg-[#2b5f8e]" };

export function BarRow({ bar }: { bar: Bar }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-13 leading-[22px] font-medium text-ink">
        <span className="min-w-0">{bar.label}</span>
        <span className="num shrink-0 text-end">{bar.value}</span>
      </div>
      <div className="flex h-2 justify-start overflow-hidden rounded-[4px] bg-surface-2">
        <span className={`h-full rounded-[4px] ${TONE[bar.tone ?? "ink"]}`} style={{ width: `${Math.round(bar.pct * 1000) / 10}%` }} />
      </div>
    </div>
  );
}

const cellText = (c: Cell) => (typeof c === "string" ? c : c.text);

/** جدول بعرض أعمدة Figma (العمود بلا عرض = المرن) — بتمرير أفقي داخلي على الشاشات الصغيرة */
export function DataGrid<C = Cell>({ cols, groups, rows, label, renderCell, rowPad = "p-2.5", flexMin = 100 }: { cols: TableCol[]; groups?: { label: string; span: number }[]; rows: { cells: C[]; total?: boolean }[]; label: string; renderCell?: (c: C, col: number) => ReactNode; /** حشو الصف (التقارير: 14·10) */ rowPad?: string; flexMin?: number }) {
  const template = cols.map((c) => (c.w ? `${c.w}px` : `minmax(${flexMin}px,1fr)`)).join(" ");
  const minW = cols.reduce((s, c) => s + (c.w ?? flexMin), 0) + (cols.length - 1) * 10 + 20;
  const grid = { gridTemplateColumns: template };
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div role="table" aria-label={label} className="flex flex-col" style={{ minWidth: minW }}>
        <div role="rowgroup" className="flex flex-col gap-0.5 rounded-8 bg-surface-1 px-2.5 py-[9px] text-12 leading-5 font-medium">
          {groups ? (
            <div role="row" className="grid gap-x-2.5 text-ink" style={grid}>
              {groups.map((g, i) => (
                <span key={i} role="columnheader" style={{ gridColumn: `span ${g.span}` }}>
                  {g.label}
                </span>
              ))}
            </div>
          ) : null}
          <div role="row" className="grid items-end gap-x-2.5 text-muted" style={grid}>
            {cols.map((c, i) => (
              <span key={i} role="columnheader">
                {c.label}
              </span>
            ))}
          </div>
        </div>
        {rows.map((r, ri) => (
          <div key={ri} role="row" className={`grid items-center gap-x-2.5 border-b border-border ${rowPad} text-13 leading-[22px] font-light text-ink ${r.total ? "bg-surface-2" : ""}`} style={grid}>
            {r.cells.map((c, ci) => (
              <span key={ci} role="cell" className="num min-w-0">
                {renderCell ? renderCell(c, ci) : <CellView c={c as Cell} />}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CellView({ c }: { c: Cell }) {
  if (typeof c === "string") return <>{c}</>;
  return (
    <span className="flex flex-col">
      <span className={c.medium ? "font-medium" : undefined}>{cellText(c)}</span>
      {c.sub ? <span className="text-12 leading-5 font-medium text-muted">{c.sub}</span> : null}
    </span>
  );
}

export function BlockSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {[0, 1].map((i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-3.5 rounded-16 border border-border bg-white p-5">
          <Skeleton className="h-[26px] w-40" />
          <Skeleton className="h-[210px] w-full" />
        </div>
      ))}
    </div>
  );
}
