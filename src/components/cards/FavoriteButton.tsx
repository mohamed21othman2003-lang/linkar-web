"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";

// زر المفضلة الليموني (v3/heart-lime) — 35×35، r8. labelOn = النص لما يكون محفوظ («إزالة من المفضلة»)
export function FavoriteButton({ label, labelOn, className = "", initial = false }: { label: string; labelOn?: string; className?: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      type="button"
      aria-label={on && labelOn ? labelOn : label}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`hit flex size-[35px] items-center justify-center rounded-sm bg-v3-heart-lime text-deep-charcoal ${className}`}
    >
      <Icon name={on ? "heart-filled" : "heart"} size={22} />
    </button>
  );
}
