"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/api/notifications";
import { num } from "@/lib/format";

// CON5-M02 · الإشعارات (3114-31717): لوحة تحت الجرس مثبّتة على شمال الصفحة (x 24 · y 76) عرض 420 ·
// r16 بإطار #D9DEDB وظل 0·8·28 · حشو 16·16·12 مسافة 4. الرأس 28: «الإشعارات» 16 Bold يمين · «N جديدة» 12 رمادي في النص · إغلاق 28 r8 #F4F6F5 شمال.
// كل إشعار: حشو 10 مسافة 10 r12 · أيقونة 32 r10 #F4F6F5 على الشمال · العنوان 13 Medium (سطرين بحد أقصى) + سطر 12 رمادي — بيفتح السجل في قسمه.
// «عرض كل الطلبات» زر 46 r12 بإطار بعرض اللوحة → /requests.
const PAGE_CORNER = {
  current: {
    getBoundingClientRect: () => {
      const x = typeof window !== "undefined" && window.innerWidth < 768 ? 16 : 24;
      return new DOMRect(x, 0, 0, 72);
    },
  },
};

export function NotificationsBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: api.notifications.list });
  const read = useMutation({ mutationFn: api.notifications.read, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const unread = q.data?.unread ?? 0;

  return (
    <Popover.Root>
      {/* نقطة الإرساء: شمال الصفحة (24 · 16 تحت 768) تحت الشريط (72) — اللوحة مش متعلّقة بمكان الجرس في Figma */}
      <Popover.Anchor virtualRef={PAGE_CORNER} />
      <Popover.Trigger
        aria-label={unread ? `الإشعارات · ${num(unread)} جديدة` : "الإشعارات"}
        title="الإشعارات"
        className="relative flex size-10 items-center justify-center rounded-10 border border-border text-ink hover:bg-surface-1 data-[state=open]:bg-surface-1"
      >
        <Icon name="bell" size={18} />
        {unread ? <span className="absolute top-[9px] right-2 size-2 rounded-full bg-danger" /> : null}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={4}
          dir="rtl"
          aria-label="الإشعارات"
          className="z-40 flex max-h-[calc(100dvh-96px)] w-[min(420px,calc(100vw-32px))] flex-col gap-1 overflow-y-auto rounded-16 border border-border bg-white px-4 pt-4 pb-3 shadow-[0_8px_28px_rgba(20,41,54,0.16)] outline-none"
        >
          <div className="flex h-7 shrink-0 items-center justify-between gap-2">
            <h2 className="text-16 leading-6 font-bold text-ink">الإشعارات</h2>
            <span className="text-12 leading-[18px] text-muted">{q.data ? `${num(unread)} جديدة` : ""}</span>
            <Popover.Close aria-label="إغلاق" className="flex size-7 items-center justify-center rounded-8 bg-surface-1 text-ink hover:bg-surface-2">
              <Icon name="x" size={14} />
            </Popover.Close>
          </div>
          {q.isError ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-13 text-muted">تعذّر تحميل الإشعارات</p>
              <Button variant="secondary" size="S" onClick={() => q.refetch()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : !q.data ? (
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[60px] w-full rounded-12" />)
          ) : q.data.items.length ? (
            q.data.items.map((n) => (
              <Popover.Close asChild key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (n.unread) read.mutate(n.id);
                    router.push(n.href);
                  }}
                  className="flex w-full items-start gap-2.5 rounded-12 p-2.5 text-start hover:bg-surface-1 focus-visible:bg-surface-1"
                >
                  <NotifText n={n} />
                  {/* الأيقونة على الشمال (آخر الصف) زي Figma */}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-1 text-ink">
                    <Icon name={n.icon} size={16} />
                  </span>
                </button>
              </Popover.Close>
            ))
          ) : (
            <p className="py-8 text-center text-13 text-muted">لا توجد إشعارات جديدة</p>
          )}
          <Popover.Close asChild>
            <button type="button" onClick={() => router.push("/requests")} className="flex h-[46px] w-full shrink-0 items-center justify-center rounded-12 border border-border bg-white text-14 leading-[22px] font-medium text-ink hover:bg-surface-1">
              عرض كل الطلبات
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function NotifText({ n }: { n: Notification }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className={`line-clamp-2 text-13 leading-5 font-medium text-ink ${n.unread ? "" : "opacity-70"}`}>{n.title}</span>
      <span className="text-12 leading-[18px] text-muted">{n.meta}</span>
    </span>
  );
}

// CON5-M03 · إدارة المحتوى (3114-31768): نافذة 520 · «فتح لوحة المحتوى» → CON5-T «تُفتح لوحة إدارة المحتوى في تبويب جديد» (3114-31784).
// في Figma مفيش نقطة دخول مرسومة — متاحة من قائمة المستخدم (لصاحب صلاحية «المحتوى والتسويق» / مدير النظام).
// رابط لوحة الـCMS من NEXT_PUBLIC_CMS_URL (لو مش متعرّف: الرسالة بس).
export function ContentModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast();
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="إدارة المحتوى"
      subtitle="لوحة مستقلة لمحتوى الموقع والتطبيق"
      width={520}
      footer={
        <>
          <Button
            variant="accent"
            size="M"
            className="h-11! flex-1"
            onClick={() => {
              const cms = process.env.NEXT_PUBLIC_CMS_URL;
              if (cms) window.open(cms, "_blank", "noopener");
              onOpenChange(false);
              toast("فتح لوحة المحتوى", "تُفتح لوحة إدارة المحتوى في تبويب جديد");
            }}
          >
            فتح لوحة المحتوى
          </Button>
          <Button variant="secondary" size="M" className="h-[46px]! flex-1" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </>
      }
    >
      <p className="text-14 leading-[23px] font-light text-ink">
        صفحات الموقع والمدونة والأسئلة الشائعة والبنرات ورسائل «تواصل معنا» تُدار من لوحة إدارة المحتوى (CMS). تُفتح في تبويب جديد بنفس حسابك، وتظهر لمن لديه صلاحية «المحتوى والتسويق».
      </p>
    </Modal>
  );
}
