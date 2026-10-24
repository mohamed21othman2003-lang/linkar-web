import Link from "next/link";
import { routes } from "@/lib/routes";

// Brand logo (543:43): Primary على الفاتح · Inverse على الغامق — ممنوع إعادة تلوينه أو مطّه
export function Logo({ tone = "primary", width = 160, label }: { tone?: "primary" | "inverse"; width?: number; label: string }) {
  const height = Math.round((width * 62.4) / 464.6);
  return (
    <Link href={routes.home} aria-label={label} className="block shrink-0">
      {/* SVG مش محتاج تحسين صور — img عادي بأبعاده بالظبط (بيمنع تحذير next/image عن نسبة الأبعاد) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/brand/logo-${tone}.svg`} alt={label} width={width} height={height} style={{ width, height: "auto" }} />
    </Link>
  );
}
