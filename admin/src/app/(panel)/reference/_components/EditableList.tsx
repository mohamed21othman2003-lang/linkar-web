"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api, isApiError } from "@/lib/api";
import type { ListKey, RefList, RefRow } from "@/lib/api/reference";
import { useUrlState } from "@/lib/use-url-state";
import { HEAD_ROW, MiniSwitch, PanelHead, SmallBtn } from "./bits";
import { ScrollX } from "@/components/ui/ScrollX";

// القوائم القابلة للتعديل: أحجام السيارات (3114:75328) · أسباب الشكاوى (77075) · جوانب تقييم العميل (77216) · أكواد الترقيم (77648)
// · فئات الفروع (76963 · داخل «معايير اعتماد الفروع والخدمات»). صف 48 (حشو 6·8 · مسافة 8): الخلايا (36 · r8 · إطار) ثم «مفعّلة» ثم حذف 32.
// «حفظ التغييرات» → CON5-20T «حُفظت التغييرات» · الحذف → CON5-20M · حذف قيمة (?modal=ref-delete&row=<id>)
export function EditableList({ listKey, head }: { listKey: ListKey; head?: (save: ReactNode) => ReactNode }) {
  const q = useQuery({ queryKey: ["reference", "list", listKey], queryFn: () => api.reference.list(listKey) });
  if (q.isLoading)
    return (
      <>
        <Skeleton className="h-14 w-1/2" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </>
    );
  if (q.isError || !q.data)
    return (
      <EmptyState
        title="تعذّر تحميل البيانات"
        body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
        action={
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  return <ListEditor key={q.dataUpdatedAt} list={q.data} head={head} />;
}

function ListEditor({ list, head }: { list: RefList; head?: (save: ReactNode) => ReactNode }) {
  const qc = useQueryClient();
  const toast = useToast();
  const url = useUrlState();
  const [rows, setRows] = useState<RefRow[]>(list.rows);
  const [draft, setDraft] = useState("");
  const [errRow, setErrRow] = useState<number | null>(null);
  const dirty = JSON.stringify(rows) !== JSON.stringify(list.rows);
  const cols = list.columns.filter((c) => c.width > 0);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const save = useMutation({
    mutationFn: () => api.reference.saveList(list.key, rows),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["reference", "list", list.key] });
      toast(r.toast);
    },
    onError: (e) => {
      if (isApiError(e) && e.fields) setErrRow(Number(Object.keys(e.fields)[0]?.split("-")[1] ?? -1));
    },
  });
  const set = (i: number, patch: Partial<RefRow>) => setRows((l) => l.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setRows((l) => [...l, { id: `new-${Date.now()}`, enabled: true, cells: [v, ...cols.slice(1).map(() => "")] }]);
    setDraft("");
  };

  const saveBtn = (
    <Button variant="accent" className="h-11!" loading={save.isPending} onClick={() => save.mutate()}>
      حفظ التغييرات
      <Icon name="check" size={16} />
    </Button>
  );
  const isTiers = list.key === "branch-tiers";

  return (
    <>
      {head ? head(saveBtn) : <PanelHead title={list.title} sub={list.sub} action={saveBtn} />}
      <ScrollX className="flex flex-col">
        <div className="flex min-w-[560px] flex-col gap-3.5">
          <div className={HEAD_ROW}>
            {cols.map((c) => (
              <span key={c.label} className="min-w-0" style={{ flex: `0 1 ${c.width}px` }}>
                {c.label}
              </span>
            ))}
            <span className={`${isTiers ? "w-11" : "w-9"} shrink-0 text-start`}>مفعّلة</span>
            <span className="w-8 shrink-0" />
          </div>
          {rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2 px-2 py-1.5">
              {cols.map((c, ci) => (
                <input
                  key={c.label}
                  value={r.cells[ci] ?? ""}
                  aria-label={`${c.label} ${i + 1}`}
                  aria-invalid={(errRow === i && ci === 0) || undefined}
                  onChange={(e) => {
                    set(i, { cells: r.cells.map((x, k) => (k === ci ? e.target.value : x)) });
                    if (errRow === i) setErrRow(null);
                  }}
                  className={`h-9 min-w-0 rounded-8 border bg-white px-2.5 text-13 text-ink outline-none focus:border-[1.5px] focus:border-ink ${errRow === i && ci === 0 ? "border-danger" : "border-border"} ${r.enabled ? "" : "text-muted"}`}
                  style={{ flex: `0 1 ${c.width}px` }}
                />
              ))}
              <span className={`flex shrink-0 ${isTiers ? "w-11" : "w-9"}`}>
                <MiniSwitch checked={r.enabled} onChange={(v) => set(i, { enabled: v })} label={`${r.cells[0]} مفعّلة`} />
              </span>
              <SmallBtn icon="trash" danger label={`حذف ${r.cells[0]}`} onClick={() => (r.id.startsWith("new-") ? setRows((l) => l.filter((x) => x.id !== r.id)) : url.push({ modal: "ref-delete", list: list.key, row: r.id }))} />
            </div>
          ))}
        </div>
      </ScrollX>
      {errRow != null ? (
        <p role="alert" className="text-12 text-danger">
          اكتب القيمة في كل صف قبل الحفظ
        </p>
      ) : null}
      <label className="flex h-[42px] items-center gap-2 rounded-10 border border-dashed border-success bg-lime-tint px-3 text-13 font-medium text-success">
        <span className="sr-only">{list.addLabel}</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={list.addLabel}
          className="min-w-0 flex-1 bg-transparent text-13 font-medium text-success outline-none placeholder:text-success"
        />
      </label>
    </>
  );
}
