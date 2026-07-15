// Resolves the analytics time window from URL params and provides the matching
// "previous period" (for growth comparisons) plus a time-bucket granularity for
// the trend chart. Pure functions — no DB access — so they stay easy to test.

const DAY_MS = 24 * 60 * 60 * 1000;

export type RangeKey = "7d" | "30d" | "12m" | "total" | "custom";

export const RANGE_SHORTCUTS: { key: Exclude<RangeKey, "custom">; label: string; hint: string }[] = [
  { key: "7d", label: "Semana", hint: "Últimos 7 dias" },
  { key: "30d", label: "Mês", hint: "Últimos 30 dias" },
  { key: "12m", label: "Ano", hint: "Últimos 12 meses" },
  { key: "total", label: "Tudo", hint: "Histórico completo" },
];

export type ResolvedRange = {
  key: RangeKey;
  label: string;
  from?: Date; // undefined => sem limite inferior (histórico completo)
  to: Date;
  compare: boolean; // existe período anterior comparável?
  prevFrom?: Date;
  prevTo?: Date;
  unit: "day" | "month"; // granularidade da série temporal
  trendFrom: Date; // início concreto da série (mesmo quando "from" é aberto)
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDateParam(value: string | undefined, edge: "start" | "end"): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T${edge === "start" ? "00:00:00" : "23:59:59.999"}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function granularity(from: Date, to: Date): "day" | "month" {
  const spanDays = (to.getTime() - from.getTime()) / DAY_MS;
  return spanDays <= 62 ? "day" : "month";
}

export function resolveAnalyticsRange(
  params: { range?: string; de?: string; ate?: string },
  now: Date,
  earliest: Date,
): ResolvedRange {
  const requested = (params.range ?? "30d") as RangeKey;

  if (requested === "custom") {
    const from = parseDateParam(params.de, "start") ?? new Date(now.getTime() - 30 * DAY_MS);
    const to = parseDateParam(params.ate, "end") ?? endOfDay(now);
    const length = Math.max(DAY_MS, to.getTime() - from.getTime());
    return {
      key: "custom",
      label: "Período personalizado",
      from,
      to,
      compare: true,
      prevFrom: new Date(from.getTime() - length),
      prevTo: from,
      unit: granularity(from, to),
      trendFrom: from,
    };
  }

  if (requested === "total") {
    const trendFrom = earliest.getTime() < now.getTime() ? startOfDay(earliest) : new Date(now.getTime() - 30 * DAY_MS);
    return {
      key: "total",
      label: "Histórico completo",
      from: undefined,
      to: now,
      compare: false,
      unit: "month",
      trendFrom,
    };
  }

  const days = requested === "7d" ? 7 : requested === "12m" ? 365 : 30;
  const labels: Record<string, string> = { "7d": "Últimos 7 dias", "30d": "Últimos 30 dias", "12m": "Últimos 12 meses" };
  const key: RangeKey = requested === "7d" || requested === "12m" ? requested : "30d";
  const from = new Date(now.getTime() - days * DAY_MS);
  return {
    key,
    label: labels[key] ?? "Últimos 30 dias",
    from,
    to: now,
    compare: true,
    prevFrom: new Date(from.getTime() - days * DAY_MS),
    prevTo: from,
    unit: requested === "12m" ? "month" : "day",
    trendFrom: from,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// Key for grouping a date into a day/month bucket (local time).
export function bucketKey(date: Date, unit: "day" | "month"): string {
  const d = new Date(date);
  return unit === "day"
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// Ordered list of every bucket key between `from` and `to` (inclusive), so empty
// periods still render on the trend chart.
export function enumerateBuckets(from: Date, to: Date, unit: "day" | "month"): string[] {
  const keys: string[] = [];
  const cursor = unit === "day" ? startOfDay(from) : new Date(from.getFullYear(), from.getMonth(), 1);
  let guard = 0;
  while (cursor.getTime() <= to.getTime() && guard < 800) {
    keys.push(bucketKey(cursor, unit));
    if (unit === "day") cursor.setDate(cursor.getDate() + 1);
    else cursor.setMonth(cursor.getMonth() + 1);
    guard += 1;
  }
  return keys;
}

// Short human label for a bucket key: "25/06" (day) or "06/26" (month).
export function bucketLabel(key: string, unit: "day" | "month"): string {
  const parts = key.split("-");
  if (unit === "day") return `${parts[2]}/${parts[1]}`;
  return `${parts[1]}/${parts[0]?.slice(2)}`;
}
