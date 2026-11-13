"use client";

import type { ReactNode } from "react";
import { PageHead } from "@/components/panel/PageHead";
import { Tabs } from "@/components/panel/Tabs";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCan } from "@/lib/use-me";
import { useUrlState } from "@/lib/use-url-state";
import { TeamOverlays, useTeamData } from "./TeamOverlays";

// رأس صفحة «المستخدمون والصلاحيات» + التبويبات (CON5-23 3114-24841 و CON5-23 · الأدوار 3114-25331)
// الأزرار من اليمين: دور جديد · دعوة مستخدم · سجل التدقيق — والتبويبات: المستخدمون (9) · الأدوار (9)
export function TeamShell({ tab, children }: { tab: "users" | "roles"; children: ReactNode }) {
  const canEdit = useCan("users", "edit");
  const url = useUrlState();
  // الأعداد بترجع مع أي قائمة من الاتنين
  const { users, roles } = useTeamData();
  const counts = (users.data ?? roles.data)?.counts;

  return (
    <>
      <PageHead
        title="المستخدمون والصلاحيات"
        description="فريق لينكار وأدواره."
        actions={
          <>
            {canEdit ? (
              <ButtonLink href="/settings/roles/new" variant="secondary" icon={<Icon name="plus" size={18} />}>
                دور جديد
              </ButtonLink>
            ) : null}
            {canEdit ? (
              <Button icon={<Icon name="plus" size={18} />} onClick={() => url.push({ modal: "invite", user: null })}>
                دعوة مستخدم
              </Button>
            ) : null}
            <ButtonLink href="/settings/audit-log" variant="secondary">
              سجل التدقيق
              <Icon name="file" size={16} />
            </ButtonLink>
          </>
        }
      />
      <section className="flex flex-col gap-4 rounded-16 border border-border bg-white p-5">
        <Tabs
          value={tab}
          label="المستخدمون والأدوار"
          items={[
            { key: "users", label: "المستخدمون", count: counts?.users, href: "/settings/users" },
            { key: "roles", label: "الأدوار", count: counts?.roles, href: "/settings/roles" },
          ]}
        />
        {children}
      </section>
      <TeamOverlays />
    </>
  );
}
