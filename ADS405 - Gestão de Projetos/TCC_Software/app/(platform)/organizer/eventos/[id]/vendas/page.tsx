import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findByEventId as findTicketTypes } from "@/modules/events/repositories/ticket-type.repository";
import Order from "@/modules/orders/models/order.model";
import Ticket from "@/modules/tickets/models/ticket.model";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Ticket as TicketIcon, Users, DollarSign, Info } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function currency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function OrganizerAnalyticsPage({ params }: PageProps) {
  const { id: eventId } = await params;

  const session = await requireAuth();
  await connectDB();

  const event = await findEvent(eventId);
  if (!event) notFound();
  if (!canManageEvent(event, session)) notFound();

  const O = Order as unknown as { aggregate(p: any[]): Promise<any[]>; find(f: any): any };
  const T = Ticket as unknown as { countDocuments(f: any): Promise<number>; aggregate(p: any[]): Promise<any[]> };
  const CL = CheckinLog as unknown as { countDocuments(f: any): Promise<number> };

  const [orderStats, ticketTypes, checkedIn] = await Promise.all([
    O.aggregate([
      { $match: { eventId, status: { $in: ["paid"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, fees: { $sum: "$serviceFee" }, count: { $sum: 1 } } },
    ]),
    findTicketTypes(eventId),
    CL.countDocuments({ eventId }),
  ]);

  const paidStats = orderStats[0] ?? { total: 0, fees: 0, count: 0 };
  // The 5% fee is paid by the buyer, so the organizer receives the full ticket
  // price (total paid minus the platform fee).
  const organizerRevenue = (paidStats.total ?? 0) - (paidStats.fees ?? 0);

  const pendingOrders = await O.aggregate([
    { $match: { eventId, status: "pending" } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);
  const pendingCount = pendingOrders[0]?.count ?? 0;

  const soldTickets = ticketTypes.reduce((sum: number, tt: any) => sum + (tt.soldQuantity ?? 0), 0);
  const totalCapacity = ticketTypes.reduce((sum: number, tt: any) => sum + (tt.totalQuantity ?? 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((soldTickets / totalCapacity) * 100) : 0;

  const ticketsByType = await T.aggregate([
    { $match: { eventId, status: { $in: ["valid", "used"] } } },
    { $group: { _id: "$ticketTypeId", count: { $sum: 1 } } },
  ]);

  const ticketTypeMap = new Map(ticketTypes.map((tt: any) => [tt._id, tt.name]));

  const hasActivity = (paidStats.count ?? 0) > 0 || soldTickets > 0 || checkedIn > 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2 text-slate-600">
          <Link href="/organizer/eventos">
            <ArrowLeft className="h-4 w-4" />
            Voltar para eventos
          </Link>
        </Button>
      </div>

      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-7 w-7 text-amber-400" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Analytics</p>
            <h1 className="text-3xl font-bold">{event.title}</h1>
          </div>
        </div>
        <div className="mt-3 flex gap-4">
          <Link href={`/organizer/eventos/${eventId}/ingressos`} className="text-sm text-amber-300 underline-offset-2 hover:underline">
            Gerenciar ingressos →
          </Link>
        </div>
      </div>

      {!hasActivity ? (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Este evento ainda não registrou vendas nem check-ins. Os indicadores abaixo são preenchidos
            automaticamente assim que o primeiro pedido for pago.
          </p>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          label="Repasse ao organizador"
          value={currency(organizerRevenue)}
          sub={`${paidStats.count} pedidos • taxa da plataforma: ${currency(paidStats.fees ?? 0)}`}
          color="emerald"
        />
        <KpiCard
          icon={<TicketIcon className="h-6 w-6 text-amber-600" />}
          label="Ingressos vendidos"
          value={String(soldTickets)}
          sub={`de ${totalCapacity} disponíveis`}
          color="amber"
        />
        <KpiCard
          icon={<Users className="h-6 w-6 text-sky-600" />}
          label="Check-ins realizados"
          value={String(checkedIn)}
          sub={soldTickets > 0 ? `${Math.round((checkedIn / soldTickets) * 100)}% dos vendidos` : "—"}
          color="sky"
        />
        <KpiCard
          icon={<TrendingUp className="h-6 w-6 text-violet-600" />}
          label="Ocupação"
          value={`${occupancyRate}%`}
          sub={`${pendingCount} pedidos pendentes`}
          color="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ticket type breakdown */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-950">Vendas por tipo de ingresso</h2>
          <div className="space-y-4">
            {ticketTypes.map((tt: any) => {
              const pct = tt.totalQuantity > 0 ? Math.round((tt.soldQuantity / tt.totalQuantity) * 100) : 0;
              return (
                <div key={tt._id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{tt.name}</span>
                    <span className="text-slate-500">{tt.soldQuantity}/{tt.totalQuantity} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Preço base: {currency(tt.price)} • Receita estimada: {currency(tt.soldQuantity * tt.price)}
                  </p>
                </div>
              );
            })}
            {ticketTypes.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum tipo de ingresso cadastrado.</p>
            )}
          </div>
        </section>

        {/* Checkin vs sold */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-950">Check-in por tipo</h2>
          <div className="space-y-3">
            {ticketsByType.map((item: any) => {
              const name = ticketTypeMap.get(item._id) ?? item._id;
              const tt = ticketTypes.find((t: any) => t._id === item._id);
              const sold = tt?.soldQuantity ?? item.count;
              const pct = sold > 0 ? Math.round((item.count / sold) * 100) : 0;
              return (
                <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{item.count} check-ins de {sold} vendidos</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {pct}%
                  </div>
                </div>
              );
            })}
            {ticketsByType.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum check-in realizado ainda.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: "emerald" | "amber" | "sky" | "violet";
}) {
  const bg = {
    emerald: "bg-emerald-50 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
    sky: "bg-sky-50 border-sky-200",
    violet: "bg-violet-50 border-violet-200",
  }[color];

  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
