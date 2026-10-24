"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";

// زر المفضلة الليموني (v3/heart-lime) — 35×35، r8
export function FavoriteButton({ label, className = "", initial = false }: { label: string; className?: string; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className={`flex size-[35px] items-center justify-center rounded-sm bg-v3-heart-lime text-deep-charcoal ${className}`}
    >
      <Icon name={on ? "heart-filled" : "heart"} size={22} />
    </button>
  );
}
