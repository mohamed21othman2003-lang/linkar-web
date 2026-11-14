"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { APPEARS_IN, afterOffer, channelsLine, discountText, offerPeriod, packagePeriod, sourceLine } from "@/lib/api/offers";
import type { ProviderBranch, ProviderProfile } from "@/lib/api/profile";
import { SIZE_LABELS, SPEC_LABELS, warrantyLabel, type Service, type SpecKey } from "@/lib/api/services";
import { num } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { DKV, DTile } from "./bits";

// CON5-07D · تفاصيل العرض · عرض الشتاء · خصم 10% نانو سيراميك (3312-197286) · تفاصيل الباقة · باقة العناية الكاملة (3312-213599)
// درج 600 (القسم 3.5): بطاقات r14 · العرض/الباقة ← الأسعار ← الخدمة ← المواصفات الفنية ← الفروع والقنوات.
// أزرار الدرج («إيقاف مؤقت» · «تعديل الخدمة») مخفية في Figma — الإجراءات من قائمة ⋯ في الجدول.

const short = (profile: ProviderProfile) => profile.provider.short ?? profile.provider.name;
const branchesLine = (ids: string[], approved: ProviderBranch[]) =>
  !ids.length || ids.length >= approved.length ? ["كل الفروع", ...approved.map((b) => b.name)].join(" · ") : ids.map((id) => approved.find((b) => b.id === id)?.name ?? id).join(" · ");
const branchLabel = (ids: string[], approved: ProviderBranch[]) =>
  !ids.length || ids.length >= approved.length ? "كل الفروع" : ids.map((id) => `فرع ${approved.find((b) => b.id === id)?.name ?? id}`).join(" · ");
const productsLine = (s: Service, branch: string) =>
  s.products
    .map((p) => ({ label: p.tier ?? p.name, sale: p.prices[branch]?.sale[0] ?? Object.values(p.prices)[0]?.sale[0] ?? 0 }))
    .sort((a, b) => a.sale - b.sale)
    .map((x) => `${x.label} ${num(x.sale)}`)
    .join(" · ") + " (سيدان)";
const company = (s: Service) => s.products[0]?.specs.company.replace(/^‏/, "") ?? "";
const reminderShort = (r: string) => (r.startsWith("بدون") ? "—" : r.split(" · ")[0]);

/** بطاقة «الخدمة · …» + «المواصفات الفنية» لخدمة واحدة (نفس درج الخدمة CON5-07D) */
function ServiceTiles({ s, branch }: { s: Service; branch: string }) {
  const p1 = s.products[0];
  if (!p1) return null;
  const keys = (Object.keys(SPEC_LABELS) as SpecKey[]).filter((k) => p1.specs[k]);
  return (
    <>
      <DTile
        title={
          <>
            الخدمة · <span className="font-normal">{s.name}</span>
          </>
        }
      >
        <DKV k="الوصف">{p1.description || "—"}</DKV>
        <DKV k="يشمل">{p1.includes.join(" · ") || "—"}</DKV>
        <DKV k="المنتجات">{productsLine(s, branch)}</DKV>
        <DKV k="المنتج">{`‏${p1.specs.approved || p1.name}${company(s) ? ` · ${company(s)}` : ""}`}</DKV>
        <DKV k="المدة · الضمان">
          {s.duration.split(" · ")[0]} · {warrantyLabel(p1.warrantyYears)}
        </DKV>
        <DKV k="الصيانة">{reminderShort(p1.reminder)}</DKV>
      </DTile>
      {keys.length ? (
        <DTile title="المواصفات الفنية">
          {keys.map((k) => (
            <DKV key={k} k={SPEC_LABELS[k]}>
              {k === "company" ? company(s) : p1.specs[k]}
            </DKV>
          ))}
        </DTile>
      ) : null}
    </>
  );
}

function useServices(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: ["providers", "service", id], queryFn: () => api.services.get(id) })),
  });
}

export function OfferDrawer({ id, profile, branches }: { id: string; profile: ProviderProfile; branches: ProviderBranch[] }) {
  const url = useUrlStateClose("offer");
  const approved = branches.filter((b) => b.status === "approved");
  const q = useQuery({ queryKey: ["providers", "offer", id], queryFn: () => api.offers.getOffer(id) });
  const o = q.data;
  const svcs = useServices(o?.serviceIds ?? []);
  const s0 = svcs[0]?.data;
  const branch = o && s0 ? (o.branchIds.find((b) => s0.branchIds.includes(b)) ?? s0.branchIds[0]) : "";
  const price = s0?.products[0]?.prices[branch];
  const loading = q.isLoading || svcs.some((x) => x.isLoading);

  return (
    <Drawer open onOpenChange={(x) => !x && url.close()} title={o?.name ?? "…"} subtitle={o ? `${short(profile)} · عرض · ${branchLabel(o.branchIds, approved)}` : undefined}>
      {loading ? (
        <>
          <Skeleton className="h-[280px] rounded-14" />
          <Skeleton className="h-[166px] rounded-14" />
          <Skeleton className="h-[320px] rounded-14" />
        </>
      ) : !o ? (
        <Note tone="neutral">لم يعد هذا العرض موجوداً.</Note>
      ) : (
        <>
          <DTile title="العرض">
            <DKV k="العرض">
              {discountText(o.discountType, o.value)} على {svcs.map((x) => x.data?.name).filter(Boolean).join(" · ")}
            </DKV>
            <DKV k="الجهة">{sourceLine(o, short(profile))}</DKV>
            <DKV k="الفترة">
              {`‏${offerPeriod(o.from, o.to)}`}
            </DKV>
            <DKV k="الحجوزات على العرض">
              <span className="num">{num(o.bookings)}</span>
            </DKV>
            <DKV k="الحد">{o.usageLimit}</DKV>
            <DKV k="يظهر في">{o.appearsIn}</DKV>
          </DTile>
          {price ? (
            <DTile title="الأسعار في العرض · شاملة الضريبة">
              {SIZE_LABELS.map((l, i) => {
                const a = afterOffer({ sale: price.sale[i], cost: price.cost[i] }, o);
                return (
                  <DKV key={l} k={l.replace(/^‏/, "")} nowrap>
                    سعر البيع {num(price.sale[i])} ← {num(a.sale)} · التكلفة {num(price.cost[i])}
                    {a.cost !== price.cost[i] ? ` ← ${num(a.cost)}` : ""} · هامش لينكار {num(a.margin)}
                  </DKV>
                );
              })}
            </DTile>
          ) : null}
          {svcs.map((x, i) => (x.data ? <ServiceTiles key={o.serviceIds[i]} s={x.data} branch={branch} /> : null))}
          <DTile title="الفروع والقنوات">
            <DKV k="الفروع">{branchesLine(o.branchIds, approved)}</DKV>
            <DKV k="القنوات">{channelsLine(o.channels)}</DKV>
          </DTile>
        </>
      )}
    </Drawer>
  );
}

export function PackageDrawer({ id, profile, branches }: { id: string; profile: ProviderProfile; branches: ProviderBranch[] }) {
  const url = useUrlStateClose("package");
  const approved = branches.filter((b) => b.status === "approved");
  const q = useQuery({ queryKey: ["providers", "package", id], queryFn: () => api.offers.getPackage(id) });
  const x = q.data;
  const svcs = useServices(x?.items.map((i) => i.serviceId) ?? []);
  const list = svcs.map((s) => s.data).filter(Boolean) as Service[];
  const branch = x ? (Object.keys(x.prices)[0] ?? "") : "";
  const price = x?.prices[branch];
  const loading = q.isLoading || svcs.some((s) => s.isLoading);
  const standalone = (i: number) => list.reduce((t, s) => t + (s.products[0]?.prices[branch]?.sale[i] ?? 0), 0);
  const reminder = x?.reminder ?? list.map((s) => s.products[0]?.reminder ?? "").find((r) => r && !r.startsWith("بدون"));
  const specKeys: SpecKey[] = ["finish", "prep"];
  const specs = specKeys.map((k) => [k, x?.specs?.[k] ?? list.map((s) => s.products[0]?.specs[k]).find(Boolean)] as const).filter(([, val]) => val);

  return (
    <Drawer open onOpenChange={(o) => !o && url.close()} title={x?.name ?? "…"} subtitle={x ? `${short(profile)} · باقة · ${branchLabel(x.branchIds, approved)}` : undefined}>
      {loading ? (
        <>
          <Skeleton className="h-[280px] rounded-14" />
          <Skeleton className="h-[166px] rounded-14" />
        </>
      ) : !x ? (
        <Note tone="neutral">لم تعد هذه الباقة موجودة.</Note>
      ) : (
        <>
          <DTile title="الباقة">
            <DKV k="الباقة">{list.map((s) => s.name).join(" + ")}</DKV>
            <DKV k="الجهة">لينكار باتفاق مع {short(profile)}</DKV>
            <DKV k="الفترة">{packagePeriod(x.to)}</DKV>
            <DKV k="الحجوزات على الباقة">
              <span className="num">{num(x.bookings)}</span>
            </DKV>
            <DKV k="الحد">{x.usageLimit}</DKV>
            <DKV k="يظهر في">{x.channels.customers ? APPEARS_IN[0] : "—"}</DKV>
          </DTile>
          {price ? (
            <DTile title="سعر الباقة · شامل الضريبة">
              {SIZE_LABELS.map((l, i) => (
                <DKV key={l} k={l.replace(/^‏/, "")} nowrap>
                  {num(price.sale[i])}
                  {i === 0 && standalone(i) > price.sale[i] ? ` بدلاً من ${num(standalone(i))} منفردة` : ""} · التكلفة {num(price.cost[i])}
                </DKV>
              ))}
            </DTile>
          ) : null}
          <DTile title="الخدمات المشمولة">
            <DKV k="الوصف">{x.description || "—"}</DKV>
            <DKV k="يشمل">{list.flatMap((s) => s.name.split(" + ")).join(" · ")}</DKV>
            <DKV k="الصيانة">{reminder ? reminderShort(reminder) : "—"}</DKV>
          </DTile>
          {specs.length ? (
            <DTile title="المواصفات الفنية">
              {specs.map(([k, val]) => (
                <Fragment key={k}>
                  <DKV k={SPEC_LABELS[k]}>{val}</DKV>
                </Fragment>
              ))}
            </DTile>
          ) : null}
          <DTile title="الفروع والقنوات">
            <DKV k="الفروع">{branchesLine(x.branchIds, approved)}</DKV>
            <DKV k="القنوات">{channelsLine(x.channels)}</DKV>
          </DTile>
        </>
      )}
    </Drawer>
  );
}

// ───────────── تأكيد «إيقاف دائم» للعرض و«حذف» الباقة (مش مرسومين في Figma — نفس نافذة التأكيد CON5-24M) ─────────────
export function ConfirmOfferAction({ kind, id, name, close }: { kind: "offer-stop" | "package-delete"; id: string; name: string; close: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const stop = kind === "offer-stop";
  const m = useMutation({
    mutationFn: () => (stop ? api.offers.stopOffer(id) : api.offers.removePackage(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      close();
      toast(stop ? "أُوقف العرض نهائياً" : "حُذفت الباقة", stop ? `أُوقف ${name} نهائياً واختفى من الموقع والتطبيق` : `حُذفت ${name} من باقات المزوّد`);
    },
    onError: () => toast("تعذّر التنفيذ", "حدث خطأ، حاول مرة أخرى"),
  });
  return (
    <Modal
      open
      onOpenChange={(o) => !o && !m.isPending && close()}
      title={stop ? "إيقاف العرض نهائياً" : "حذف الباقة"}
      description={stop ? `سيختفي «${name}» من الموقع والتطبيق ولا يمكن إعادة تفعيله. الحجوزات القائمة عليه تبقى سارية.` : `ستُحذف «${name}» نهائياً. الحجوزات القائمة عليها تبقى سارية.`}
      footer={
        <>
          <Button variant="danger" loading={m.isPending} onClick={() => m.mutate()}>
            {stop ? "إيقاف دائم" : "حذف الباقة"}
          </Button>
          <Button variant="secondary" onClick={close} disabled={m.isPending}>
            إلغاء
          </Button>
        </>
      }
    />
  );
}

function useUrlStateClose(key: string) {
  const url = useUrlState();
  return { close: () => url.replace({ [key]: null }) };
}
