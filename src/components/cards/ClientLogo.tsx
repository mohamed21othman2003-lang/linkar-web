import Image from "next/image";
import { logoSize } from "@/lib/data/providers";

// v2 · Client logo — الشعار بنفس مقاسه في الفيجما داخل صندوق أبيض (بيتقص لو أكبر من الصندوق)
export function ClientLogo({ slug, src, alt, scale = 1 }: { slug: string; src: string; alt: string; scale?: number }) {
  const [w, h] = logoSize[slug] ?? [120, 48];
  return (
    <Image
      src={src}
      alt={alt}
      width={Math.round(w * scale)}
      height={Math.round(h * scale)}
      sizes={`${Math.round(w * scale * 2)}px`}
      className="shrink-0 object-contain"
      style={{ width: w * scale, height: h * scale }}
    />
  );
}

// صندوق الشعار الأبيض أعلى الكروت (h 178 / 133)
export function LogoArea({ slug, src, alt, height = 178 }: { slug: string; src: string; alt: string; height?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-t-[20px] border border-v3-card-stroke bg-white"
      style={{ height }}
    >
      <ClientLogo slug={slug} src={src} alt={alt} />
    </div>
  );
}
