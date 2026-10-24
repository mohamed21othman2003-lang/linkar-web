import Image from "next/image";
import { logoSize } from "@/lib/data/providers";

// Partner logo (44×44 / 40 / 36 / 26 / 22): صندوق أبيض r16 بحدود رمادية والشعار جوّاه بنسبته
export function LogoTile({ slug, src, alt, size = 44, className = "" }: { slug: string; src: string; alt: string; size?: number; className?: string }) {
  const [w, h] = logoSize[slug] ?? [120, 48];
  const inner = size * 0.8;
  const scale = Math.min(inner / w, inner / h);
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-border-default bg-white ${className}`}
      style={{ width: size, height: size, borderRadius: Math.min(16, size / 2) }}
    >
      <Image src={src} alt={alt} width={width} height={height} sizes={`${width * 3}px`} className="object-contain" style={{ width, height }} />
    </span>
  );
}
