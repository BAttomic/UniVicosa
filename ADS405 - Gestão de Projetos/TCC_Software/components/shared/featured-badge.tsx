import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Small "sponsored/featured" tag shown on highlighted events (a monetization
// surface: featured events rank first in the home and public listing).
export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-slate-950 shadow-sm",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      Destaque
    </span>
  );
}
