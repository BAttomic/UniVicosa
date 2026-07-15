import { notFound } from "next/navigation";
import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { ArrowLeft, Gift, History, Info, Ticket as TicketIcon } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findByEventId as findTicketTypes } from "@/modules/events/repositories/ticket-type.repository";
import { findById as findUser } from "@/modules/identity/repositories/user.repository";
import Order from "@/modules/orders/models/order.model";
import { distributeTicketsAction } from "@/server/actions/events.actions";
import { DistributeForm } from "@/components/shared/distribute-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourtesyTicketsPage({ params }: PageProps) {
  const { id: eventId } = await params;

  const session = await requireAuth();
  await connectDB();

  const event = await findEvent(eventId);
  if (!event) notFound();
  if (!canManageEvent(event, session)) notFound();

  const ticketTypes = (await findTicketTypes(eventId)) as Array<{ _id: string; name: string; totalQuantity: number; soldQuantity: number }>;
  const options = ticketTypes.map((type) => ({
    id: String(type._id),
    name: type.name,
    available: Math.max(0, Number(type.totalQuantity ?? 0) - Number(type.soldQuantity ?? 0)),
  }));
  const ttNameById = new Map(ticketTypes.map((type) => [String(type._id), type.name]));

  // Cortesias são pedidos "pagos" marcados com um paymentIntentId "comp_".
  const O = Order as unknown as { find(filter: Record<string, unknown>): any };
  const courtesyOrders = (await O.find({ eventId, paymentIntentId: { $regex: "^comp_" } })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()) as any[];

  const history = await Promise.all(
    courtesyOrders.map(async (order) => {
      const recipient = await findUser(String(order.buyerId));
      const item = (order.items ?? [])[0] ?? {};
      return {
        id: String(order._id),
        name: recipient?.name ?? "Usuário removido",
        email: recipient?.email ?? "",
        ticketType: ttNameById.get(String(item.ticketTypeId)) ?? "Ingresso",
        quantity: Number(item.quantity ?? 0),
        createdAt: order.createdAt as Date,
      };
    }),
  );

  const totalGiven = history.reduce((sum, entry) => sum + entry.quantity, 0);
  const uniqueRecipients = new Set(history.map((entry) => entry.email)).size;

  // Distribuição por tipo de ingresso (para um resumo rápido).
  const byType = new Map<string, number>();
  for (const entry of history) {
    byType.set(entry.ticketType, (byType.get(entry.ticketType) ?? 0) + entry.quantity);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <Link href="/organizer/eventos" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para eventos
      </Link>

      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Gift className="h-8 w-8 text-amber-400" />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Cortesias</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Ingressos gratuitos entregues a usuários cadastrados. Sem valor monetário — não entram no faturamento.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Stat label="Cortesias" value={totalGiven} />
          <Stat label="Beneficiários" value={uniqueRecipients} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
        {/* Coluna da esquerda: nova cortesia + aviso */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Gift className="h-4 w-4" /> Nova cortesia
            </h2>
            <DistributeForm action={distributeTicketsAction.bind(null, eventId)} ticketTypes={options} />
          </section>

          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4" /> Como funcionam as cortesias
            </p>
            <ul className="mt-2 space-y-1 text-sky-800">
              <li>• O usuário precisa já ter conta na plataforma (busca pelo e-mail).</li>
              <li>• Os ingressos aparecem na carteira dele com QR Code válido.</li>
              <li>• Cortesias consomem a capacidade do lote, mas não geram receita.</li>
            </ul>
            {byType.size > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {[...byType.entries()].map(([type, qty]) => (
                  <span key={type} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-sky-700">
                    <TicketIcon className="h-3 w-3" /> {type}: {qty}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        {/* Coluna da direita (larga): histórico de cortesias */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4" /> Histórico de cortesias
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {totalGiven} ingresso(s)
            </span>
          </h2>

          {history.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma cortesia distribuída ainda.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Beneficiário</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3 text-center">Qtd.</th>
                    <th className="py-2 pr-3 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-slate-900">{entry.name}</p>
                        <p className="truncate text-xs text-slate-500">{entry.email}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600">{entry.ticketType}</td>
                      <td className="py-2.5 pr-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {entry.quantity}×
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right text-xs text-slate-500">
                        {formatBR(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[5rem] rounded-2xl bg-white/10 px-4 py-2 text-center">
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}
