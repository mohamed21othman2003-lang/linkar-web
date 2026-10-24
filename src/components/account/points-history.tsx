"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";

export type HistoryRow = { id: string; date: string; dateLabel: string; operation: string; points: number; pointsLabel: string; balanceLabel: string };
export type PeriodOptionView = { key: string; label: string; months: number | null };

// P-18 · Popup «آخر 6 أشهر»: زر أبيض بسهم، ولوحة خيارات 300 بعلامة ✓ على المختار
export function PeriodFilter({ options, value, onChange, label }: { options: PeriodOptionView[]; value: string; onChange: (k: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => (document.removeEventListener("mousedown", onDown), document.removeEventListener("keydown", onKey));
  }, [open]);
  const current = options.find((o) => o.key === value) ?? options[0];
  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-control-sm items-center gap-1.5 rounded-md border border-cool-gray bg-white px-3 text-label-m text-deep-charcoal hover:border-border-strong"
      >
        {current.label}
        <Icon name="chevron-down" size={16} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute end-0 top-full z-20 mt-1.5 flex w-[300px] max-w-[calc(100vw-32px)] flex-col gap-0.5 rounded-lg border border-cool-gray bg-white p-2 shadow-dialog"
        >
          {options.map((o) => {
            const on = o.key === current.key;
            return (
              <li key={o.key} role="option" aria-selected={on}>
                <button
                  type="button"
                  onClick={() => (onChange(o.key), setOpen(false))}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-[10px] px-3 text-start text-deep-charcoal hover:bg-tile ${on ? "h-12 bg-tile text-label-l" : "h-[50px] text-body-m"}`}
                >
                  {o.label}
                  {on ? <Icon name="check" size={16} className="shrink-0 text-nature-green" /> : <span className="size-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function inPeriod(iso: string, ref: Date, months: number | null) {
  if (months === null) return true;
  const d = new Date(iso);
  if (months === 0) return d.getFullYear() === ref.getFullYear();
  const from = new Date(ref);
  from.setMonth(from.getMonth() - months);
  return d >= from;
}

// «Head · سجل النقاط» + «History»: جدول التاريخ/العملية/النقاط/الرصيد مع فلتر الفترة
export function PointsHistory({
  title,
  rows,
  options,
  initial,
  headers,
  filterLabel,
}: {
  title: string;
  rows: HistoryRow[];
  options: PeriodOptionView[];
  initial: string;
  headers: { date: string; operation: string; points: string; balance: string };
  filterLabel: string;
}) {
  const [period, setPeriod] = useState(initial);
  // مرجع الفترة = أحدث عملية في السجل (عشان النتيجة تبقى ثابتة بين السيرفر والمتصفح)
  const ref = useMemo(() => new Date(rows.reduce((m, r) => (r.date > m ? r.date : m), rows[0]?.date ?? "2026-01-01")), [rows]);
  const months = options.find((o) => o.key === period)?.months ?? null;
  const visible = rows.filter((r) => inPeriod(r.date, ref, months));
  const cols = "grid grid-cols-[150px_minmax(0,470px)_120px_120px] items-center px-5";
  return (
    <section aria-labelledby="points-history" className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="points-history" className="text-h4 text-deep-charcoal">
          {title}
        </h2>
        <PeriodFilter options={options} value={period} onChange={setPeriod} label={filterLabel} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-cool-gray bg-white p-4 md:p-6">
        <table className="block w-full min-w-[640px] text-start">
          <thead className="block">
            <tr className={`${cols} h-[50px] bg-tile`}>
              <th className="text-start text-label-m font-medium text-state-gray">{headers.date}</th>
              <th className="text-start text-label-m font-medium text-state-gray">{headers.operation}</th>
              <th className="text-start text-label-m font-medium text-state-gray">{headers.points}</th>
              <th className="text-start text-label-m font-medium text-state-gray">{headers.balance}</th>
            </tr>
          </thead>
          <tbody className="block">
            {visible.map((r) => (
              <tr key={r.id} className={`${cols} mt-4 border-b border-cool-gray py-3.5`}>
                <td className="text-body-s text-deep-charcoal">{r.dateLabel}</td>
                <td className="text-body-s text-deep-charcoal">{r.operation}</td>
                <td className={`text-start text-label-l ${r.points < 0 ? "text-promotional-red" : "text-green-active"}`}>
                  <span className="inline-block" dir="ltr">
                    {r.pointsLabel}
                  </span>
                </td>
                <td className="text-body-s text-deep-charcoal">{r.balanceLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
