import { CalendarClock, Clock3, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  countdownLabel,
  eventTimingLabel,
  getEventTiming,
  type EventTiming,
} from "@/lib/event-time";

const STYLES: Record<EventTiming, string> = {
  live: "bg-rose-500 text-white shadow-sm animate-pulse",
  soon: "bg-emerald-500 text-white shadow-sm",
  scheduled: "bg-slate-100 text-slate-600",
  past: "bg-slate-200 text-slate-500",
};

// Highlights how close an event is in time. For "soon" events it shows a
// countdown ("Em 3 dias") to create urgency on the listing.
export function EventTimingBadge({
  startsAt,
  endsAt,
  className,
}: {
  startsAt: Date | string;
  endsAt?: Date | string | null;
  className?: string;
}) {
  const timing = getEventTiming(startsAt, endsAt);
  const Icon = timing === "live" ? Radio : timing === "soon" ? Clock3 : CalendarClock;
  const label =
    timing === "soon" ? countdownLabel(startsAt) : eventTimingLabel(timing);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLES[timing],
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
