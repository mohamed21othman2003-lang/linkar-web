"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { EmptyState } from "@/components/panel/PageHead";
import { RowMenu, type RowMenuItem } from "@/components/panel/RowMenu";
import { Tabs, type TabItem } from "@/components/panel/Tabs";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/ui/Pill";
import { Skeleton } from "@/components/ui/Spinner";
import { api, isApiError } from "@/lib/api";
import { PROFILE_TABS, type ProfileTab, type ProviderProfile } from "@/lib/api/profile";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { ProviderOverlays } from "../../_components/ProviderOverlays";
import AnalyticsTab from "../_tabs/analytics";
import BankTab from "../_tabs/bank";
import BookingsTab from "../_tabs/bookings";
import BranchesTab from "../_tabs/branches";
import DuesTab from "../_tabs/dues";
import { OffersOverlays } from "../_tabs/offers";
import OverviewTab from "../_tabs/overview";
import QualityTab from "../_tabs/quality";
import ServicesTab from "../_tabs/services";
import type { ProfileTabProps } from "../_tabs/types";
import UsersTab from "../_tabs/users";
import { ServiceOverlays } from "./services/ServiceOverlays";

// CON5-07a · ملف المزوّد · جونسون — رأس الملف والتبويبات (3114-48595 · 3114-50957 · وباقي تبويبات «CON5-07a»)
// المسار: مقدّمو الخدمة ← الاسم (13 Medium) · بطاقة الرأس: 132 · r16 · حشو 20 · الشعار 129×90 يمين + الاسم 24 (الجزء العربي Bold) + «النوع · المدينة» 13 Light + ⋯ شمال
// البطاقة البيضا تحتها: r16 · حشو 20 · مسافة 16 — شريط التبويبات (40 · r10 · حشو 8·11 · مسافة 6) ثم محتوى التبويب.
const LABEL: Record<ProfileTab, string> = {
  overview: "نظرة عامة",
  bookings: "الحجوزات",
  analytics: "التحليلات",
  services: "الخدمات والأسعار",
  branches: "الفروع",
  dues: "المستحقات",
  bank: "الحساب البنكي",
  users: "المستخدمون",
  quality: "الجودة والتقييم",
};
const TAB: Record<ProfileTab, ComponentType<ProfileTabProps>> = {
  overview: OverviewTab,
  bookings: BookingsTab,
  analytics: AnalyticsTab,
  services: ServicesTab,
  branches: BranchesTab,
  dues: DuesTab,
  bank: BankTab,
  users: UsersTab,
  quality: QualityTab,
};

export function ProfileView({ id }: { id: string }) {
  const url = useUrlState();
  const canEdit = useCan("providers", "edit");
  const tab = (PROFILE_TABS as readonly string[]).includes(url.get("tab") ?? "") ? (url.get("tab") as ProfileTab) : "overview";
  const q = useQuery({
    queryKey: ["providers", "profile", id],
    queryFn: () => api.profile.get(id),
    retry: (n, e) => !isApiError(e, 404) && n < 2,
  });
  const svcCount = useQuery({
    queryKey: ["providers", "services", id, "count"],
    queryFn: () => api.services.count(id),
  });
  const profile = q.data;

  if (q.isError)
    return (
      <div className="rounded-16 border border-border bg-white">
        {isApiError(q.error, 404) ? (
          <EmptyState
            title="مقدّم الخدمة غير موجود"
            body="ربما حُذف أو تغيّر رابطه."
            action={
              <ButtonLink href="/providers" variant="secondary" size="S">
                العودة لمقدّمي الخدمة
              </ButtonLink>
            }
          />
        ) : (
          <EmptyState
            title="تعذّر تحميل البيانات"
            body="حدث خطأ أثناء التحميل. حاول مرة أخرى."
            action={
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        )}
      </div>
    );

  const counts: Partial<Record<ProfileTab, number>> = profile ? { ...profile.counts, services: svcCount.data } : {};
  const items: TabItem<ProfileTab>[] = PROFILE_TABS.map((k) => ({
    key: k,
    label: LABEL[k],
    count: counts[k] || undefined,
    href: url.href({
      tab: k === "overview" ? null : k,
      view: null,
      branch: null,
      price: null,
      status: null,
      warranty: null,
      channel: null,
      sort: null,
    }),
  }));
  const Body = TAB[tab];

  return (
    <>
      <nav aria-label="مسار الصفحة" className="flex items-center gap-1.5 text-13 leading-[22px] font-medium">
        <Link href="/providers" className="text-muted hover:text-ink">
          مقدّمو الخدمة
        </Link>
        <span className="text-muted">←</span>
        <span className="text-ink">{profile?.provider.name ?? "…"}</span>
      </nav>
      {profile ? <Head profile={profile} canEdit={canEdit} /> : <Skeleton className="h-[132px] rounded-16" />}
      <section className="flex flex-col gap-4 rounded-16 bg-white p-4 sm:p-5">
        <Tabs variant="pill" items={items} value={tab} label="تبويبات ملف المزوّد" className="gap-1.5! [&>a]:px-[11px] [&>a[aria-selected=false]]:h-10 [&>a[aria-selected=true]]:h-[38px]" />
        {profile ? (
          <Body profile={profile} canEdit={canEdit} />
        ) : (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-80 self-start" />
            <Skeleton className="h-[338px] rounded-16" />
          </div>
        )}
      </section>
      {profile ? (
        <>
          <ProviderOverlays />
          <ServiceOverlays profile={profile} />
          <OffersOverlays profile={profile} />
        </>
      ) : null}
    </>
  );
}

// ───────────── بطاقة الرأس ─────────────
function Head({ profile, canEdit }: { profile: ProviderProfile; canEdit: boolean }) {
  const url = useUrlState();
  const router = useRouter();
  const canDelete = useCan("providers", "delete");
  const p = profile.provider;
  // «جونسون Johnson · LK-JN-001»: الجزء العربي Bold والباقي Regular
  const bold = p.short && p.name.startsWith(p.short) ? p.short : p.name;
  const tail = p.name.slice(bold.length).trim();
  const rest = tail ? `${tail} · ${p.code}` : `· ${p.code}`;
  const open = (modal: string) => url.push({ modal, p: p.id });
  const suspended = p.status === "suspended";

  // قائمة ⋯ (Figma «CON7 · إجراءات» Kind=معتمد, State=Open 3260:196888) — والموقوف: إعادة تفعيل بدل الإيقاف (زي CON5-07A LK-RY-001)
  const items: RowMenuItem[] = [
    ...(suspended
      ? [
          {
            label: "إعادة تفعيل",
            icon: "check" as const,
            onSelect: () => open("reactivate"),
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: "تعديل البيانات",
            icon: "edit" as const,
            onSelect: () => open("edit"),
          },
          ...(suspended
            ? []
            : [
                {
                  label: "إضافة فرع",
                  icon: "plus" as const,
                  onSelect: () => open("add-branch"),
                },
                {
                  label: "إضافة خدمة",
                  icon: "tag" as const,
                  onSelect: () =>
                    router.push(
                      url.href({
                        tab: "services",
                        view: null,
                        modal: "service-new",
                        p: null,
                      }),
                      { scroll: false },
                    ),
                },
                {
                  label: "طلب مستند",
                  icon: "file" as const,
                  onSelect: () => open("request-doc"),
                },
                {
                  label: "إيقاف مؤقت",
                  icon: "clock" as const,
                  onSelect: () => open("pause"),
                },
                {
                  label: "تعطيل",
                  icon: "lock" as const,
                  onSelect: () => open("disable"),
                },
              ]),
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: "حذف المنشأة",
            icon: "trash" as const,
            danger: true,
            onSelect: () => open("delete"),
          },
        ]
      : []),
  ];

  return (
    <header className="flex items-center gap-4 rounded-16 border border-border bg-white p-4 sm:p-5">
      <Logo src={profile.logo} name={p.name} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="flex flex-wrap items-center gap-x-2 text-18 text-ink sm:text-24">
          <span>
            <span className="font-bold">{bold}</span> <bdi className="font-normal">{rest}</bdi>
          </span>
          {suspended ? <Pill tone="danger">موقوف</Pill> : null}
        </h1>
        <p className="text-13 leading-[22px] font-light text-muted">
          {profile.kindLabel} · {p.city}
        </p>
      </div>
      {items.length ? <RowMenu items={items} label={`إجراءات ${p.name}`} /> : null}
    </header>
  );
}

/** إطار الشعار (Figma «SPD · شعار المركز»): 129×90 بإطار 1.4 r16.8 · جواه بطاقة بيضا 118×45 بإطار r11.2 والصورة 95×30 */
function Logo({ src, name }: { src?: string; name: string }) {
  return (
    <div className="hidden h-[90px] w-[129px] shrink-0 items-center justify-center rounded-[16.8px] border-[1.4px] border-border sm:flex">
      <div className="flex h-16 w-[129px] items-start justify-center rounded-14 bg-white pt-2.5">
        <div className="flex h-[45px] w-[118px] items-start justify-center rounded-[11.2px] border-[1.4px] border-border bg-white pt-[5.6px]">
          {src ? <Image src={src} alt={name} width={95} height={30} loading="eager" className="h-[30px] w-[95px] object-contain" /> : <Icon name="store" size={22} className="mt-0.5 text-muted" />}
        </div>
      </div>
    </div>
  );
}
