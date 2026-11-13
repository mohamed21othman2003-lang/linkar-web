"use client";

import { useQuery } from "@tanstack/react-query";
import { DrawerHero, KV, Tile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { DrawerBlock, Provider, ValueTone } from "@/lib/api/providers";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";

// CON5-07D · درج مقدّم الخدمة — جونسون Johnson (3114-48736) · XPEL السعودية (3114-48672) · نانو شيلد (3114-48802)
// · لومار LLumar (3114-48866) · مركز لمعة للتلميع (3114-48994) · مركز درع للحماية (3114-49058) · مغاسل اللؤلؤة (3114-49241)
// · مركز الريم (3114-49302) · مغسلة الريان (3114-49345) · مركز الواحة للعناية (3114-49936) · مغسلة الندى (3312-205476)
// محتوى الدرج يختلف حسب حالة المنشأة، فبيرجع من الخادم كبلوكات بالترتيب (رأس كحلي · أرقام · ملاحظة · بطاقات).
const VALUE_TONE: Record<ValueTone, string> = { success: "text-success", danger: "text-danger", warning: "text-pending" };
const PILL_TONE = { success: "", pending: "", danger: "bg-[#f8e9e9]!" } as const;

export function ProviderDrawer() {
  const url = useUrlState();
  const id = url.get("provider");
  const canEdit = useCan("providers", "edit");
  const q = useQuery({ queryKey: ["providers", "one", id], queryFn: () => api.providers.get(id!), enabled: !!id });
  const p = q.data;
  const close = () => url.replace({ provider: null });
  const open = (modal: string) => url.push({ modal, p: id, provider: null });

  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && close()}
      title={p?.name ?? (q.isError ? "مقدّم الخدمة" : "…")}
      subtitle={p?.drawer.subtitle}
      footer={p && p.drawer.footer !== "none" ? <Footer p={p} canEdit={canEdit} open={open} /> : undefined}
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[84px] rounded-[18px]" />
          <Skeleton className="h-[74px] rounded-12" />
          <Skeleton className="h-[140px] rounded-14" />
        </>
      ) : q.isError || !p ? (
        <Note tone="neutral">لم يعد مقدّم الخدمة هذا موجوداً.</Note>
      ) : (
        p.drawer.blocks.map((b, i) => <Block key={i} b={b} p={p} />)
      )}
    </Drawer>
  );
}

function Block({ b, p }: { b: DrawerBlock; p: Provider }) {
  switch (b.kind) {
    case "hero":
      return (
        <DrawerHero
          icon="store"
          subtitle={p.drawer.heroLine}
          aside={
            p.drawer.pill ? (
              <Pill size="S" tone={p.drawer.pill.tone} className={PILL_TONE[p.drawer.pill.tone]}>
                {p.drawer.pill.label}
              </Pill>
            ) : null
          }
        />
      );
    case "stats":
      return (
        <div className="grid auto-cols-fr grid-flow-col gap-2.5">
          {b.items.map(([v, label]) => (
            <div key={label} className="flex flex-col rounded-12 bg-surface-1 p-3">
              <span className="num text-18 font-bold text-ink">{v}</span>
              <span className="text-12 font-medium text-muted">{label}</span>
            </div>
          ))}
        </div>
      );
    case "note":
      return <Note tone={b.tone}>{b.text}</Note>;
    case "tile":
      return (
        <Tile title={b.title}>
          {b.text ? <p className="text-13 font-medium text-ink">{b.text}</p> : null}
          {b.rows?.map(([k, v, tone]) => (
            <KV key={k} k={k}>
              <span className={tone ? VALUE_TONE[tone] : undefined}>{v}</span>
            </KV>
          ))}
        </Tile>
      );
  }
}

function Footer({ p, canEdit, open }: { p: Provider; canEdit: boolean; open: (m: string) => void }) {
  const f = p.drawer.footer;
  if (f === "new")
    return (
      <ButtonLink href={`/providers/${p.id}`} variant="primary">
        {p.drawer.branchLabel ?? "فتح الملف الكامل"}
      </ButtonLink>
    );
  if (f === "suspended") return canEdit ? <Button onClick={() => open("reactivate")}>إعادة تفعيل</Button> : <ButtonLink href={`/providers/${p.id}`}>فتح الملف الكامل</ButtonLink>;
  return (
    <>
      {f === "active-full" ? <ButtonLink href={`/providers/${p.id}`}>فتح الملف الكامل</ButtonLink> : null}
      {canEdit ? (
        <>
          <Button variant="secondary" onClick={() => open("request-doc")}>
            طلب مستند
          </Button>
          <Button variant="secondary" className={f === "pending" ? undefined : "text-danger-strong!"} onClick={() => open("pause")}>
            إيقاف المركز
          </Button>
        </>
      ) : null}
    </>
  );
}
