"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/panel/PageHead";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Policy } from "@/lib/api/policies";
import { ltrRuns } from "@/lib/format";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { SystemHead } from "../../_components/SystemHead";
import { PolicyDrawer } from "./PolicyDrawer";
import { PolicyModals } from "./PolicyModals";

// CON5-21 · السياسات (3114:64406): بطاقات السياسات في عمودين (r16 · حشو 16·18 · مسافة 8) — «تعديل» يفتح الدرج CON5-21D
// الرابط: /system/policies?policy=<id> · ?modal=policy-history&policy=<id> · ?modal=policy-new
export function PoliciesView() {
  const url = useUrlState();
  const canEdit = useCan("policies", "edit");
  const q = useQuery({
    queryKey: ["policies", "list"],
    queryFn: () => api.policies.list(),
  });

  return (
    <>
      <SystemHead
        title="السياسات"
        description="سياسات لينكار المنشورة للعملاء ومقدّمي الخدمة والمسوّقين."
        actions={
          canEdit ? (
            <Button
              variant="accent"
              className="h-11!"
              onClick={() => url.push({ modal: "policy-new" })}
            >
              سياسة جديدة
              <Icon name="plus" size={16} />
            </Button>
          ) : null
        }
      />
      {q.isLoading ? (
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-16" />
          ))}
        </div>
      ) : q.isError ? (
        <div className="rounded-16 border border-border bg-white">
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        </div>
      ) : !q.data?.length ? (
        <div className="rounded-16 border border-border bg-white">
          <EmptyState title="لا توجد سياسات بعد" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          {/* ترتيب Figma (صفوف ملفوفة): الضمان يمين والإلغاء شمال، ثم الشروط واتفاقية المزوّدين، ثم المسوّقون */}
          {order(q.data).map((p) => (
            <PolicyCard
              key={p.id}
              p={p}
              canEdit={canEdit}
              onEdit={() => url.push({ policy: p.id })}
            />
          ))}
        </div>
      )}
      <PolicyDrawer />
      <PolicyModals />
    </>
  );
}

const ORDER = [
  "warranty",
  "cancellation",
  "customer-terms",
  "provider-agreement",
  "marketers",
];
const order = (l: Policy[]) => [...l].sort((a, b) => rank(a.id) - rank(b.id));
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : 99);

function PolicyCard({
  p,
  canEdit,
  onEdit,
}: {
  p: Policy;
  canEdit: boolean;
  onEdit: () => void;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-16 border border-border bg-white px-[18px] py-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-16 font-bold text-ink">{p.title}</h2>
        {canEdit && p.fields.length ? (
          <Button variant="secondary" className="h-[46px]!" onClick={onEdit}>
            تعديل
            <Icon name="edit" size={16} />
          </Button>
        ) : null}
      </div>
      <p className="text-12 font-light text-muted">
        {p.draft && !p.history.length
          ? "مسودة"
          : `نسخة ${p.version} · ${p.date}`}
        {p.draft && p.history.length ? " · مسودة" : ""} · يظهر في: {p.appearsIn}
      </p>
      {p.bullets.map((b) => (
        <p key={b} className="text-13 text-ink">
          • {ltrRuns(b)}
        </p>
      ))}
    </section>
  );
}
