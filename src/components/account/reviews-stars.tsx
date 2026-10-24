"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/Icon";

// نجوم «بانتظار تقييمك»: رمادية فاضية، وبتتملّى بالبرتقالي مع المرور أو الاختيار
export function ReviewsStars({ label, starLabel }: { label: string; starLabel: string }) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-[3px]" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={starLabel.replace("{n}", String(n))}
          onMouseEnter={() => setHover(n)}
          onClick={() => setValue(n)}
          className="rounded-xs"
        >
          <Icon name={n <= shown ? "star-filled" : "star"} size={22} className={n <= shown ? "text-v3-rating-star" : "text-state-gray"} />
        </button>
      ))}
    </div>
  );
}

// نجوم التقييم المنشور (للقراءة فقط) — 18px
export function ReviewsStarsStatic({ stars, label }: { stars: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= stars ? "star-filled" : "star"} size={18} className={n <= stars ? "text-v3-rating-star" : "text-state-gray"} />
      ))}
    </span>
  );
}
