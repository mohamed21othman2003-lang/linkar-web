"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";

// قلب المفضلة الأحمر في صف «خدمات وباقات حفظتها» — الضغط بيشيل/يرجّع الحفظ
export function FavoritesHeart({ label }: { label: string }) {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="flex size-[30px] shrink-0 items-center justify-center rounded-sm text-promotional-red hover:bg-tile max-md:size-10"
    >
      <Icon name={on ? "heart-filled" : "heart"} size={22} />
    </button>
  );
}
