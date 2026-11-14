"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DrawerHero, KV, Tile } from "@/components/panel/KV";
import { Note } from "@/components/panel/Note";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Message } from "@/lib/api/messages";
import { ltrRuns } from "@/lib/format";
import { useUrlState } from "@/lib/use-url-state";
import { Bubble, StatusPill } from "./bits";

// CON5-19D · تفاصيل الرسالة — درج واحد لكل الأنواع:
// تواصل معنا MSG-0418 (3114:1372) · 0417 (1414) · 0416 (1450) · 0415 (1486) · 0413 (1525) · 0412 (1558)
// المقترحات SG-0033 (1597) · 0032 (1628) · 0031 (1659) · 0030 (1692) · برامج الشركات CORP-0012 (1725) · 0011 (1762)
// الجديد: ذيل بالأزرار (تحويل لموظف + رد / رد / ترشيح مراكز) — بعد الرد: من غير ذيل
export function MessageDrawer() {
  const url = useUrlState();
  const id = url.get("message");
  const q = useQuery({ queryKey: ["messages", "one", id], queryFn: () => api.messages.get(id!), enabled: !!id });
  const m = q.data;
  const close = () => url.replace({ message: null });
  const modal = (name: string) => url.push({ modal: name, ref: id });

  return (
    <Drawer
      open={!!id}
      onOpenChange={(o) => !o && close()}
      title={m ? title(m) : (id ?? "")}
      subtitle={m ? sub(m) : " "}
      footerClassName="sm:pb-7"
      footer={m ? footer(m, modal) : undefined}
    >
      {q.isLoading ? (
        <>
          <Skeleton className="h-[90px] w-full rounded-[18px]" />
          <Skeleton className="h-32 w-full rounded-14" />
        </>
      ) : q.isError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-16 font-bold text-ink">تعذّر تحميل الرسالة</p>
          <Button variant="secondary" size="S" onClick={() => q.refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : m ? (
        <Body m={m} />
      ) : null}
    </Drawer>
  );
}

const title = (m: Message) => `${m.id} · ${m.tab === "contact" ? m.type : m.tab === "suggestions" ? "اقتراح" : "برامج الشركات"}`;
const sub = (m: Message) => (m.tab === "contact" ? "من نموذج «تواصل معنا» في الموقع" : m.tab === "suggestions" ? "من حساب العميل" : `من صفحة «برامج الشركات» · ${m.date}`);

function footer(m: Message, modal: (n: string) => void) {
  if (m.tab === "contact" && m.status === "new")
    return (
      <>
        <Button onClick={() => modal("msg-reply")}>رد</Button>
        <Button variant="secondary" onClick={() => modal("msg-transfer")}>
          تحويل لموظف
        </Button>
      </>
    );
  if (m.tab === "suggestions" && m.status !== "answered") return <Button onClick={() => modal("msg-reply")}>رد</Button>;
  if (m.tab === "corp" && m.status === "new") return <Button onClick={() => modal("msg-nominate")}>ترشيح مراكز</Button>;
  return undefined;
}

function Body({ m }: { m: Message }) {
  if (m.tab === "corp")
    return (
      <>
        <DrawerHero icon="car" title={m.company} subtitle={<span className="num">{ltrRuns([m.contact, m.phone, m.email].filter(Boolean).join(" · "))}</span>} aside={<StatusPill status={m.status} />} />
        <Tile title="الاحتياج">
          <KV k="عدد السيارات">{m.carsLabel}</KV>
          <KV k="المدن">{m.cities.join(" · ")}</KV>
          <p className="text-13 font-light text-ink">{m.needQuote}</p>
        </Tile>
        {m.nominated ? (
          <Tile title="المراكز المرشّحة">
            {m.nominated.map((n) => (
              <KV key={n.name} k={<bdi>{n.name}</bdi>}>
                {n.services}
              </KV>
            ))}
          </Tile>
        ) : (
          <Note>لينكار ترشّح مراكز معتمدة قريبة من مواقع الشركة، وتتفق الشركة مع المركز مباشرة على السعر والتنفيذ.</Note>
        )}
      </>
    );
  return (
    <>
      <DrawerHero
        icon={m.tab === "contact" ? "mail" : "star"}
        title={m.name}
        subtitle={m.tab === "contact" ? <span>{ltrRuns(`${m.phone} · ${m.type}`)}</span> : "اقتراح لتحسين لينكار"}
        aside={<StatusPill status={m.status} />}
      />
      {m.tab === "contact" && m.booking ? (
        <Tile title="مرتبطة بحجز">
          <KV k="الحجز">
            <Link href={`/bookings?booking=${m.booking.id}`} className="hover:underline">
              {ltrRuns(m.booking.label)}
            </Link>
          </KV>
        </Tile>
      ) : null}
      <Tile title="المحادثة">
        {m.chat.map((l, i) => (
          <Bubble key={i} line={l} />
        ))}
      </Tile>
      {m.tab === "contact" && m.status === "new" ? <Note>الرد خلال يوم عمل. يصل للمرسل برسالة نصية وبريد.</Note> : null}
    </>
  );
}
