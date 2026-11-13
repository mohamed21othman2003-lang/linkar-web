export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ""}`} />;
}

// هيكل رمادي أثناء التحميل (القسم 2.7)
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-8 bg-surface-2 ${className ?? ""}`} />;
}
