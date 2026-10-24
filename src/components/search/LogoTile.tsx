import Image from "next/image";
import { logoCrops, logoInsets } from "@/lib/data/search/logo-insets";

// Partner logo · Tile (566:1939): مربع أبيض بحد cool-gray والشعار جوّه بمكانه ومقاسه من الفيجما لكل مقدّم خدمة
export function LogoTile({
  src,
  alt,
  size,
  height,
  radius = 16,
  className = "",
}: {
  src: string;
  alt: string;
  size: number;
  height?: number; // لوحة غير مربعة (AI pick في W2-30: 139×136)
  radius?: number;
  className?: string;
}) {
  const slug = src.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  const [x, y, w, h] = logoInsets[slug] ?? [0.12, 0.12, 0.76, 0.76];
  const H = height ?? size;
  const boxW = size * w;
  const boxH = H * h;
  const crop = logoCrops[slug];
  let img: React.ReactNode;
  if (crop) {
    // contain للشعار المقصوص جوّه صندوقه
    const [iw, ih, cx, cy, cw, ch] = crop;
    const scale = Math.min(boxW / cw, boxH / ch);
    const left = -cx * scale + (boxW - cw * scale) / 2;
    const top = -cy * scale + (boxH - ch * scale) / 2;
    img = (
      <Image
        src={src}
        alt={alt}
        width={Math.round(iw * scale * 2)}
        height={Math.round(ih * scale * 2)}
        sizes={`${Math.round(iw * scale * 2)}px`}
        className="absolute max-w-none"
        style={{ left, top, width: iw * scale, height: ih * scale }}
      />
    );
  } else {
    img = (
      <Image
        src={src}
        alt={alt}
        width={Math.round(boxW * 2)}
        height={Math.round(boxH * 2)}
        sizes={`${Math.round(boxW * 2)}px`}
        className="absolute inset-0 size-full object-contain"
      />
    );
  }
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden border border-cool-gray bg-white ${className}`}
      style={{ width: size, height: H, borderRadius: radius }}
    >
      <span className="absolute overflow-hidden" style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: boxW, height: boxH }}>
        {img}
      </span>
    </span>
  );
}
