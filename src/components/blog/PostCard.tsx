import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";

export type PostCardView = { slug: string; href: string; title: string; excerpt: string; tag: string; minutes: string; photo: string; category: string };

// كارت مقال (W2-100 · W2-100b «مقالات ذات صلة») — 410 عرض، r22، صورة 220، الكارت كله لينك للمقال
export function PostCard({ p }: { p: PostCardView }) {
  return (
    <Link href={p.href} className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-hairline bg-white transition-shadow hover:shadow-elevation-2">
      <div className="relative h-[220px] shrink-0 overflow-hidden">
        <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-200 ease-figma-out group-hover:scale-[1.02]" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-[22px] pt-5 pb-[22px]">
        <span className="self-start rounded-full bg-cash-tint px-2.5 py-1 text-[12px]/[18px] font-medium text-green-active">{p.tag}</span>
        <h3 className="text-[19px]/[30px] font-bold text-deep-charcoal">{p.title}</h3>
        <p className="text-body-s text-state-gray">{p.excerpt}</p>
        <p className="mt-auto flex items-center gap-1.5 text-[13px]/[20px] font-light text-meta-gray">
          <Icon name="clock" size={14} className="shrink-0" />
          {p.minutes}
        </p>
      </div>
    </Link>
  );
}
