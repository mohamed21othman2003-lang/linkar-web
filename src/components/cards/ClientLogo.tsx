import Image from "next/image";
import { logoAreaSize, logoSize } from "@/lib/data/providers";

// v2 · Client logo — الشعار بنفس مقاسه في الفيجما داخل صندوق أبيض (بيتقص لو أكبر من الصندوق)
// size: مقاس صريح [عرض، ارتفاع] بدل جدول logoSize (صندوق الكروت الكبير بيستخدم logoAreaSize)
export function ClientLogo({ slug, src, alt, scale = 1, size }: { slug: string; src: string; alt: string; scale?: number; size?: [number, number] }) {
  const [w, h] = size ?? logoSize[slug] ?? [120, 48];
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
// في تصميم العميل المعدّل الصندوق الكبير (178) بيعرض الشعار بمقاس logoAreaSize (أكبر بكتير)؛ الصغير (133) زي ما هو
export function LogoArea({ slug, src, alt, height = 178 }: { slug: string; src: string; alt: string; height?: number }) {
  const big = height >= 178 ? logoAreaSize[slug] : undefined;
  const top = big?.[2];
  return (
    <div
      className={`flex shrink-0 justify-center overflow-hidden rounded-t-[20px] border border-v3-card-stroke bg-white ${top === undefined ? "items-center" : "items-start"}`}
      style={{ height, paddingTop: top }}
    >
      <ClientLogo slug={slug} src={src} alt={alt} size={big ? [big[0], big[1]] : undefined} />
    </div>
  );
}
