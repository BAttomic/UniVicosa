import { cn } from "@/lib/utils";

// Renders an event cover image with a graceful gradient fallback when the event
// has no coverImageUrl. Plain <img> (not next/image) so remote hosts work
// without configuring image domains.
export function EventCover({
  src,
  alt,
  className,
  fallbackClassName = "bg-[linear-gradient(135deg,_#1e293b,_#475569_55%,_#cbd5e1)]",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  if (!src) {
    return <div className={cn(fallbackClassName, className)} aria-hidden />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
