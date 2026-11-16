import Image from "@/components/ui/Img";
import { stores } from "@/lib/data/site";

// Store button (42:381) — شارات أبل وجوجل الرسمية (بالإنجليزي زي الفيجما)
export function StoreBadges({ height = 48, className = "" }: { height?: number; className?: string }) {
  const width = Math.round((height * 161) / 48);
  return (
    <div className={`flex gap-2.5 ${className}`}>
      {/* الشارتين بيتحمّلوا على طول (أول الشاشة في الهيرو) — قبل كده Google ظاهرة وApp Store بتستنى (تقرير الموبايل #57) */}
      <Badge href={stores.apple} label="App Store">
        <Image src="/figma/brand/badge-app-store.svg" alt="Download on the App Store" width={width} height={height} loading="eager" unoptimized />
      </Badge>
      <Badge href={stores.google} label="Google Play">
        <Image src="/figma/brand/badge-google-play.png" alt="Get it on Google Play" width={width} height={height} loading="eager" />
      </Badge>
    </div>
  );
}

// من غير رابط (لسه ماوصلش) بتظهر الشارة بس
function Badge({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  ) : (
    <span>{children}</span>
  );
}
