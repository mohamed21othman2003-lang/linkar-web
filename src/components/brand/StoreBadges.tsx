import Image from "next/image";
import { stores } from "@/lib/data/site";

// Store button (42:381) — شارات أبل وجوجل الرسمية (بالإنجليزي زي الفيجما)
export function StoreBadges({ height = 48, className = "" }: { height?: number; className?: string }) {
  const width = Math.round((height * 161) / 48);
  return (
    <div className={`flex gap-2.5 ${className}`}>
      <a href={stores.apple} target="_blank" rel="noopener noreferrer" aria-label="App Store">
        <Image src="/figma/brand/badge-app-store.svg" alt="Download on the App Store" width={width} height={height} unoptimized />
      </a>
      <a href={stores.google} target="_blank" rel="noopener noreferrer" aria-label="Google Play">
        <Image src="/figma/brand/badge-google-play.png" alt="Get it on Google Play" width={width} height={height} />
      </a>
    </div>
  );
}
