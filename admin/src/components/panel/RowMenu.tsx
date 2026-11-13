"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { Fragment } from "react";
import { Icon, type UiGlyph } from "@/components/ui/Icon";

// قائمة ⋯ لإجراءات الصف (القسم 3.5 «Row menu» · Figma «CON7 · إجراءات مقدّم الخدمة» Open):
// الزر 32 دائري بإطار ونقط كحلي (مفتوح = كحلي بنقط بيضا) · القائمة 242 · r12 · حشو 6 · مسافة 2 · ظل القوائم
// العنصر 37 · r8 · حشو 8·10 · أيقونة 16 على اليمين + نص 13 Medium · الحذف أحمر بعد خط فاصل #E8ECEA
export type RowMenuItem = { label: string; icon?: UiGlyph; danger?: boolean; disabled?: boolean; onSelect: () => void; dividerBefore?: boolean };

export function RowMenu({ items, label = "إجراءات" }: { items: RowMenuItem[]; label?: string }) {
  return (
    <Menu.Root dir="rtl" modal={false}>
      <Menu.Trigger
        aria-label={label}
        title={label}
        className="group flex size-8 shrink-0 items-center justify-center gap-[3px] rounded-full border border-border bg-white hover:bg-surface-1 data-[state=open]:bg-ink"
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1 rounded-full bg-ink group-data-[state=open]:bg-white" />
        ))}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={6} collisionPadding={16} className="z-[70] flex w-[242px] flex-col gap-0.5 rounded-12 border border-border bg-white p-1.5 shadow-menu">
          {items.map((it) => (
            <Fragment key={it.label}>
              {it.dividerBefore ? <Menu.Separator className="h-px bg-divider" /> : null}
              <Menu.Item
                disabled={it.disabled}
                onSelect={it.onSelect}
                className={`flex h-[37px] cursor-pointer items-center gap-2.5 rounded-8 px-2.5 text-13 font-medium outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-surface-1 ${it.danger ? "text-danger" : "text-ink"}`}
              >
                {it.icon ? <Icon name={it.icon} size={16} className="shrink-0 text-ink" /> : null}
                {it.label}
              </Menu.Item>
            </Fragment>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
