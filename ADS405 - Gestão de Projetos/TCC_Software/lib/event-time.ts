// Shared "where is this event in time" logic, used to highlight events that are
// happening now or are close on the calendar (a usability ask: surface urgency).

export type EventTiming = "live" | "soon" | "scheduled" | "past";

// An event counts as "soon" when it starts within this many days.
export const SOON_THRESHOLD_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
// Fallback duration when an event has no explicit end (assume a long day).
const DEFAULT_DURATION_MS = 6 * 60 * 60 * 1000;

export function getEventTiming(
  startsAt: Date | string,
  endsAt?: Date | string | null,
  now: Date = new Date(),
): EventTiming {
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + DEFAULT_DURATION_MS;
  const reference = now.getTime();

  if (reference >= start && reference <= end) return "live";
  if (end < reference) return "past";

  const daysUntil = (start - reference) / DAY_MS;
  if (daysUntil <= SOON_THRESHOLD_DAYS) return "soon";
  return "scheduled";
}

// Whole days until the event starts (0 = today/already started).
export function daysUntil(startsAt: Date | string, now: Date = new Date()): number {
  const diff = new Date(startsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}

const TIMING_LABELS: Record<EventTiming, string> = {
  live: "Acontecendo agora",
  soon: "Em breve",
  scheduled: "Programado",
  past: "Encerrado",
};

export function eventTimingLabel(timing: EventTiming): string {
  return TIMING_LABELS[timing];
}

// Countdown-style label for cards: "Hoje", "Amanhã", "Em 3 dias".
export function countdownLabel(startsAt: Date | string, now: Date = new Date()): string {
  const days = daysUntil(startsAt, now);
  if (days <= 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}
