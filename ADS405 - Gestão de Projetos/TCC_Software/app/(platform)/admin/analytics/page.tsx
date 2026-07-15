import Link from "next/link";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import Order from "@/modules/orders/models/order.model";
import Boost from "@/modules/events/models/boost.model";
import Ticket from "@/modules/tickets/models/ticket.model";
import EventModel from "@/modules/events/models/event.model";
import { BOOST_PACKAGES } from "@/lib/boost-packages";
import {
  resolveAnalyticsRange,
  enumerateBuckets,
  bucketKey,
  bucketLabel,
  RANGE_SHORTCUTS,
  type ResolvedRange,
} from "@/lib/analytics-range";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Receipt,
  Rocket,
  TrendingUp,
  Gift,
  Ticket as TicketIcon,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

function currency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

const PACKAGE_COLOR: Record<string, string> = {
  Essencial: "bg-sky-400",
  Avançado: "bg-amber-400",
  Máximo: "bg-emerald-400",
};

type Totals = { gmv: number; fees: number; orders: number; tickets: number };

const O = Order as unknown as { aggregate(p: any[]): Promise<any[]>; find(f: any, proj?: any): any };
const B = Boost as unknown as { aggregate(p: any[]): Promise<any[]>; find(f: any, proj?: any): any };
const T = Ticket as unknown as { countDocuments(f: any): Promise<number> };
const E = EventModel as unknown as { countDocuments(f: any): Promise<number> };

function orderMatch(from?: Date, to?: Date, courtesy = false): Record<string, any> {
  const match: Record<string, any> = { status: "paid" };
  match.paymentIntentId = courtesy ? { $regex: "^comp_" } : { $not: /^comp_/ };
  if (from || to) {
    match.paidAt = {};
    if (from) match.paidAt.$gte = from;
    if (to) match.paidAt.$lte = to;
  }
  return match;
}

function boostMatch(from?: Date, to?: Date): Record<string, any> {
  const match: Record<string, any> = { status: { $in: ["active", "expired"] } };
  if (from || to) {
    match.startsAt = {};
    if (from) match.startsAt.$gte = from;
    if (to) match.startsAt.$lte = to;
  }
  return match;
}

async function orderTotals(from?: Date, to?: Date): Promise<Totals> {
  const [row] = await O.aggregate([
    { $match: orderMatch(from, to) },
    { $group: { _id: null, gmv: { $sum: "$totalAmount" }, fees: { $sum: "$serviceFee" }, orders: { $sum: 1 }, tickets: { $sum: { $sum: "$items.quantity" } } } },
  ]);
  return { gmv: row?.gmv ?? 0, fees: row?.fees ?? 0, orders: row?.orders ?? 0, tickets: row?.tickets ?? 0 };
}

async function boostTotals(from?: Date, to?: Date): Promise<{ total: number; count: number }> {
  const [row] = await B.aggregate([
    { $match: boostMatch(from, to) },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}

async function courtesyTotals(from?: Date, to?: Date): Promise<{ count: number; tickets: number }> {
  const [row] = await O.aggregate([
    { $match: orderMatch(from, to, true) },
    { $group: { _id: null, count: { $sum: 1 }, tickets: { $sum: { $sum: "$items.quantity" } } } },
  ]);
  return { count: row?.count ?? 0, tickets: row?.tickets ?? 0 };
}

// Variação percentual; null quando não há base anterior (evita divisão por zero).
function growth(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; de?: string; ate?: string }>;
}) {
  await requireRole("admin");
  await connectDB();

  const params = await searchParams;
  const now = new Date();

  // Início do histórico (primeiro pedido pago não-cortesia) para o range "Tudo".
  const [firstPaid] = await O.find(orderMatch(), { paidAt: 1 }).sort({ paidAt: 1 }).limit(1).lean();
  const earliest = firstPaid?.paidAt ? new Date(firstPaid.paidAt) : now;

  const range = resolveAnalyticsRange(params, now, earliest);

  const [
    current,
    previous,
    boostsNow,
    boostsPrev,
    courtesies,
    trendOrders,
    trendBoosts,
    boostByPackage,
    feeByEvent,
    soldTickets,
    eventsTotal,
    eventsPublished,
  ] = await Promise.all([
    orderTotals(range.from, range.to),
    range.compare ? orderTotals(range.prevFrom, range.prevTo) : Promise.resolve(null),
    boostTotals(range.from, range.to),
    range.compare ? boostTotals(range.prevFrom, range.prevTo) : Promise.resolve(null),
    courtesyTotals(range.from, range.to),
    O.find(orderMatch(range.trendFrom, range.to), { paidAt: 1, serviceFee: 1 }).lean(),
    B.find(boostMatch(range.trendFrom, range.to), { startsAt: 1, amount: 1 }).lean(),
    B.aggregate([
      { $match: boostMatch(range.from, range.to) },
      { $group: { _id: "$packageLabel", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    O.aggregate([
      { $match: orderMatch(range.from, range.to) },
      { $group: { _id: "$eventId", fees: { $sum: "$serviceFee" }, gmv: { $sum: "$totalAmount" } } },
      { $sort: { fees: -1 } },
      { $limit: 8 },
    ]),
    T.countDocuments({ status: { $in: ["valid", "used"] } }),
    E.countDocuments({}),
    E.countDocuments({ status: "published" }),
  ]);

  const platformRevenue = current.fees + boostsNow.total;
  const prevPlatformRevenue = previous && boostsPrev ? previous.fees + boostsPrev.total : null;
  const organizerPayouts = current.gmv - current.fees;
  const feePct = platformRevenue > 0 ? Math.round((current.fees / platformRevenue) * 100) : 0;
  const promoPct = platformRevenue > 0 ? 100 - feePct : 0;
  const avgTicket = current.orders > 0 ? Math.round(current.gmv / current.orders) : 0;

  // --- Série temporal (faturamento da plataforma por período) -----------------
  const buckets = enumerateBuckets(range.trendFrom, range.to, range.unit);
  const feeByBucket = new Map<string, number>();
  for (const order of trendOrders as any[]) {
    if (!order.paidAt) continue;
    const key = bucketKey(new Date(order.paidAt), range.unit);
    feeByBucket.set(key, (feeByBucket.get(key) ?? 0) + (order.serviceFee ?? 0));
  }
  const boostByBucket = new Map<string, number>();
  for (const boost of trendBoosts as any[]) {
    if (!boost.startsAt) continue;
    const key = bucketKey(new Date(boost.startsAt), range.unit);
    boostByBucket.set(key, (boostByBucket.get(key) ?? 0) + (boost.amount ?? 0));
  }
  const series = buckets.map((key) => {
    const fees = feeByBucket.get(key) ?? 0;
    const boost = boostByBucket.get(key) ?? 0;
    return { key, label: bucketLabel(key, range.unit), total: fees + boost };
  });
  const maxSeries = Math.max(1, ...series.map((point) => point.total));

  const packageMap = new Map(boostByPackage.map((row: any) => [row._id, { total: row.total ?? 0, count: row.count ?? 0 }]));

  const topEvents = await Promise.all(
    (feeByEvent as any[]).map(async (row: any) => {
      const event = await findEvent(String(row._id));
      return {
        id: String(row._id),
        title: event?.title ?? "Evento removido",
        fees: row.fees ?? 0,
        gmv: row.gmv ?? 0,
      };
    }),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/admin/usuarios" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Voltar para administração
        </Link>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-amber-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Analytics da plataforma</p>
            <h1 className="text-3xl font-bold">Faturamento e tendências</h1>
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Receita do TicketFlow no período selecionado: taxa de serviço de 5% (paga pelo comprador) e impulsionamentos
          pagos pelos organizadores. Cortesias não geram receita.
        </p>
      </div>

      {/* Seletor de intervalo */}
      <RangeSelector range={range} params={params} />

      {/* KPIs principais com comparativo */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          label="Faturamento da plataforma"
          value={currency(platformRevenue)}
          delta={prevPlatformRevenue !== null ? growth(platformRevenue, prevPlatformRevenue) : null}
          sub="Taxa de serviço + impulsionamentos"
          color="emerald"
          highlight
          showDelta={range.compare}
        />
        <Kpi
          icon={<Receipt className="h-6 w-6 text-sky-600" />}
          label="Faturamento de taxa (5%)"
          value={currency(current.fees)}
          delta={previous ? growth(current.fees, previous.fees) : null}
          sub={`${current.orders} pedido(s) pago(s)`}
          color="sky"
          showDelta={range.compare}
        />
        <Kpi
          icon={<Rocket className="h-6 w-6 text-amber-600" />}
          label="Impulsionamentos pagos"
          value={currency(boostsNow.total)}
          delta={boostsPrev ? growth(boostsNow.total, boostsPrev.total) : null}
          sub={`${boostsNow.count} impulsionamento(s)`}
          color="amber"
          showDelta={range.compare}
        />
        <Kpi
          icon={<TrendingUp className="h-6 w-6 text-violet-600" />}
          label="Volume transacionado (GMV)"
          value={currency(current.gmv)}
          delta={previous ? growth(current.gmv, previous.gmv) : null}
          sub={`Repasse aos organizadores: ${currency(organizerPayouts)}`}
          color="violet"
          showDelta={range.compare}
        />
      </div>

      {/* Métricas secundárias */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpi icon={<Receipt className="h-5 w-5 text-slate-500" />} label="Pedidos pagos" value={String(current.orders)} delta={previous ? growth(current.orders, previous.orders) : null} showDelta={range.compare} />
        <MiniKpi icon={<TicketIcon className="h-5 w-5 text-slate-500" />} label="Ingressos vendidos" value={String(current.tickets)} delta={previous ? growth(current.tickets, previous.tickets) : null} showDelta={range.compare} />
        <MiniKpi icon={<DollarSign className="h-5 w-5 text-slate-500" />} label="Ticket médio" value={avgTicket > 0 ? currency(avgTicket) : "—"} />
        <MiniKpi icon={<Gift className="h-5 w-5 text-slate-500" />} label="Cortesias (sem receita)" value={`${courtesies.count} pedido(s) • ${courtesies.tickets} ingresso(s)`} />
      </div>

      {/* Tendência: faturamento por período */}
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-950">
            <BarChart3 className="h-5 w-5 text-slate-500" /> Tendência de faturamento
          </h2>
          <span className="text-xs text-slate-500">{range.label} • por {range.unit === "day" ? "dia" : "mês"}</span>
        </div>
        {series.some((point) => point.total > 0) ? (
          <div className="flex h-52 items-stretch gap-1 overflow-x-auto pb-1">
            {series.map((point) => (
              <div key={point.key} className="flex min-w-[1.5rem] flex-1 flex-col items-center gap-1" title={`${point.label}: ${currency(point.total)}`}>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all hover:from-emerald-600"
                    style={{ height: `${Math.max(2, (point.total / maxSeries) * 100)}%` }}
                  />
                </div>
                <span className="whitespace-nowrap text-[10px] text-slate-400">{point.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">Sem faturamento registrado neste período.</p>
        )}
      </section>

      {/* Composição do faturamento */}
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-950">Composição do faturamento</h2>
        {platformRevenue > 0 ? (
          <>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-sky-500" style={{ width: `${feePct}%` }} title={`Taxa: ${feePct}%`} />
              <div className="h-full bg-amber-500" style={{ width: `${promoPct}%` }} title={`Impulsionamentos: ${promoPct}%`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-sky-500" /> Taxa de serviço — {currency(current.fees)} ({feePct}%)
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-amber-500" /> Impulsionamentos — {currency(boostsNow.total)} ({promoPct}%)
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Ainda não há faturamento registrado neste período.</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impulsionamentos por pacote */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
            <Rocket className="h-5 w-5 text-amber-600" /> Impulsionamentos por pacote
          </h2>
          <div className="space-y-3">
            {BOOST_PACKAGES.map((pkg) => {
              const data = (packageMap.get(pkg.label) as { total: number; count: number } | undefined) ?? { total: 0, count: 0 };
              const pct = boostsNow.total > 0 ? Math.round((data.total / boostsNow.total) * 100) : 0;
              return (
                <div key={pkg.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{pkg.label}</span>
                    <span className="text-slate-500">
                      {currency(data.total)} • {data.count} impulsionamento(s)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${PACKAGE_COLOR[pkg.label] ?? "bg-amber-400"} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {boostsNow.count === 0 ? <p className="text-sm text-slate-400">Nenhum impulsionamento neste período.</p> : null}
          </div>
        </section>

        {/* Top eventos por receita de taxa */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-950">
            <Receipt className="h-5 w-5 text-sky-600" /> Top eventos por taxa
          </h2>
          <div className="space-y-2">
            {topEvents.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">GMV {currency(event.gmv)}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-700">{currency(event.fees)}</span>
              </div>
            ))}
            {topEvents.length === 0 ? <p className="text-sm text-slate-400">Nenhuma venda registrada neste período.</p> : null}
          </div>
        </section>
      </div>

      {/* Rodapé de contexto */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat icon={<CalendarDays className="h-5 w-5 text-slate-500" />} label="Eventos" value={`${eventsPublished} publicados / ${eventsTotal} no total`} />
        <MiniStat icon={<TicketIcon className="h-5 w-5 text-slate-500" />} label="Ingressos válidos/usados (total)" value={String(soldTickets)} />
        <MiniStat icon={<DollarSign className="h-5 w-5 text-slate-500" />} label="Ticket médio do período" value={avgTicket > 0 ? currency(avgTicket) : "—"} />
      </div>
    </main>
  );
}

function RangeSelector({ range, params }: { range: ResolvedRange; params: { de?: string; ate?: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Intervalo de análise</p>
        <div className="flex flex-wrap gap-2">
          {RANGE_SHORTCUTS.map((shortcut) => {
            const active = range.key === shortcut.key;
            return (
              <Link
                key={shortcut.key}
                href={`/admin/analytics?range=${shortcut.key}`}
                title={shortcut.hint}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {shortcut.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Intervalo personalizado */}
      <form className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="range" value="custom" />
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="de">De</label>
          <input id="de" name="de" type="date" defaultValue={params.de ?? ""} className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="ate">Até</label>
          <input id="ate" name="ate" type="date" defaultValue={params.ate ?? ""} className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm" />
        </div>
        <button type="submit" className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${range.key === "custom" ? "bg-slate-950 text-white" : "bg-amber-400 text-slate-950 hover:bg-amber-300"}`}>
          Aplicar
        </button>
      </form>
    </div>
  );
}

function Delta({ value, showDelta = true }: { value: number | null; showDelta?: boolean }) {
  if (!showDelta) return null;
  if (value === null) {
    return <span className="text-xs font-medium text-slate-400">sem base anterior</span>;
  }
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${up ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}
      {value.toFixed(0)}%
    </span>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  color,
  delta,
  highlight,
  showDelta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "emerald" | "sky" | "amber" | "violet";
  delta: number | null;
  highlight?: boolean;
  showDelta?: boolean;
}) {
  const bg = {
    emerald: "bg-emerald-50 border-emerald-200",
    sky: "bg-sky-50 border-sky-200",
    amber: "bg-amber-50 border-amber-200",
    violet: "bg-violet-50 border-violet-200",
  }[color];

  return (
    <div className={`rounded-2xl border p-5 ${bg} ${highlight ? "ring-2 ring-emerald-300" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
        <Delta value={delta} showDelta={showDelta} />
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function MiniKpi({
  icon,
  label,
  value,
  delta = null,
  showDelta = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number | null;
  showDelta?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <Delta value={delta} showDelta={showDelta} />
      </div>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {icon}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
