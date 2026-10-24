"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { routes } from "@/lib/routes";

type ServiceHit = { slug: string; names: string[] };

// بحث W2-404: لو الكلمة تطابق اسم خدمة نفتح نتائجها، وإلا صفحة البحث العامة
export function NotFoundSearch({ placeholder, button, services }: { placeholder: string; button: string; services: ServiceHit[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim().toLowerCase();
    const hit = v ? services.find((s) => s.names.some((n) => n.toLowerCase().includes(v) || v.includes(n.toLowerCase()))) : undefined;
    router.push(hit ? routes.search({ services: [hit.slug] }) : routes.search());
  };
  return (
    <form
      role="search"
      onSubmit={submit}
      className="flex w-full max-w-[560px] items-center gap-2.5 rounded-[14px] border border-border-default bg-white py-2 ps-3 pe-2 focus-within:border-deep-charcoal md:ps-2 md:pe-4"
    >
      <Icon name="search" size={18} className="shrink-0 text-state-gray" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-[42px] min-w-0 flex-1 bg-transparent text-body-m text-deep-charcoal outline-none placeholder:text-state-gray [&::-webkit-search-cancel-button]:hidden"
      />
      <button type="submit" className="shrink-0 rounded-md bg-deep-charcoal px-[18px] py-2.5 text-label-m text-neon-green hover:bg-bg-inverse-subtle">
        {button}
      </button>
    </form>
  );
}
