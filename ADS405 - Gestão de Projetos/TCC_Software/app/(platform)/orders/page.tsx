import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { Search, SlidersHorizontal, X, ShoppingBag } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/event-access";
import { findByBuyerFiltered } from "@/modules/orders/repositories/order.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-600",
  expired: "border-slate-200 bg-slate-50 text-slate-600",
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
  boleto: "Boleto",
};

const STATUS_FILTERS = ["pending", "paid", "failed", "cancelled", "expired"] as const;

function parseDate(value: string | undefined, edge: "start" | "end"): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}${edge === "start" ? "T00:00:00" : "T23:59:59.999"}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function currency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

type OrdersPageProps = {
  searchParams: Promise<{ q?: string; status?: string; de?: string; ate?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAuth();
  await connectDB();

  const params = await searchParams;
  const status = STATUS_FILTERS.includes(params.status as (typeof STATUS_FILTERS)[number]) ? params.status : undefined;
  const from = parseDate(params.de, "start");
  const to = parseDate(params.ate, "end");

  const rawOrders = await findByBuyerFiltered(session.user.id, { status, from, to });

  // Resolve event titles (para exibir e para a busca por nome do evento).
  const eventIds = [...new Set(rawOrders.map((order) => String(order.eventId)))];
  const eventTitleById = new Map<string, string>();
  await Promise.all(
    eventIds.map(async (id) => {
      const event = await findEvent(id);
      eventTitleById.set(id, event?.title ?? "Evento");
    }),
  );

  const query = (params.q ?? "").trim();
  const normalizedQuery = normalize(query);
  const orders = rawOrders
    .map((order) => ({ ...order, eventTitle: eventTitleById.get(String(order.eventId)) ?? "Evento" }))
    .filter((order) => {
      if (!normalizedQuery) return true;
      const haystack = normalize(
        [
          `#${String(order._id).slice(-6)}`,
          order.eventTitle,
          paymentLabels[order.paymentMethod] ?? order.paymentMethod ?? "",
          statusLabels[order.status] ?? order.status,
        ].join(" "),
      );
      return haystack.includes(normalizedQuery);
    });

  const totalPaid = orders
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
  const hasFilters = Boolean(query || status || from || to);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Pedidos</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Histórico de compras simuladas</h1>
        <p className="mt-2 text-slate-600">Cada pedido entra como pendente e aprova automaticamente após 20 segundos.</p>
      </div>

      {/* Filtros e busca */}
      <form className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="q">Buscar</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Evento, nº do pedido, forma de pagamento..."
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status ?? ""} className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white">
              <option value="">Todos</option>
              {STATUS_FILTERS.map((value) => (
                <option key={value} value={value}>{statusLabels[value]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="de">De</label>
            <input id="de" name="de" type="date" defaultValue={params.de ?? ""} className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="ate">Até</label>
            <input id="ate" name="ate" type="date" defaultValue={params.ate ?? ""} className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="h-11 w-full rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-medium text-slate-600">{orders.length} pedido(s)</span>
          <span>Total pago no filtro: <strong className="text-slate-900">{currency(totalPaid)}</strong></span>
          {hasFilters ? (
            <Link href="/orders" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-50">
              <X className="h-3 w-3" /> Limpar filtros
            </Link>
          ) : null}
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <Card key={order._id} className="border-slate-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-lg">{order.eventTitle}</CardTitle>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">Pedido #{String(order._id).slice(-6)}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] ?? ""}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <CardDescription>
                {formatBR(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                {order.paymentMethod ? ` • ${paymentLabels[order.paymentMethod] ?? order.paymentMethod}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{currency(order.totalAmount)}</p>
                <p className="text-xs text-slate-500">{order.status === "paid" ? "Aprovação concluída" : "Aguardando aprovação"}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/orders/${order._id}`}>Ver detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 lg:col-span-2 xl:col-span-3">
            <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            {hasFilters ? "Nenhum pedido encontrado para os filtros informados." : "Nenhum pedido ainda. Faça uma compra simulada em um evento."}
            {hasFilters ? (
              <div className="mt-3">
                <Button asChild variant="outline">
                  <Link href="/orders">Limpar filtros</Link>
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
