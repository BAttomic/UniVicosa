import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findByEventId } from "@/modules/events/repositories/ticket-type.repository";
import { findByTicketTypeId } from "@/modules/events/repositories/lot.repository";
import {
  createTicketTypeAction,
  updateTicketTypeAction,
  createLotAction,
  toggleLotAction,
} from "@/server/actions/ticket-type.actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

function currency(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function ManageTicketTypesPage({ params, searchParams }: PageProps) {
  const { id: eventId } = await params;
  const { status } = await searchParams;

  const session = await requireAuth();
  await connectDB();

  const event = await findEvent(eventId);
  if (!event) notFound();

  if (!canManageEvent(event, session)) notFound();

  const ticketTypes = await findByEventId(eventId);
  const ticketTypesWithLots = await Promise.all(
    ticketTypes.map(async (tt: any) => ({
      ...tt,
      lots: await findByTicketTypeId(tt._id),
    })),
  );

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
        <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Gestão de ingressos</p>
        <h1 className="mt-2 text-3xl font-bold">{event.title}</h1>
        <div className="mt-3 flex gap-4">
          <Link href={`/organizer/eventos/${eventId}/vendas`} className="text-sm text-amber-300 underline-offset-2 hover:underline">
            Ver analytics de vendas →
          </Link>
        </div>
      </div>

      {status && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {status}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Create ticket type */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-950">Novo tipo de ingresso</h2>
          </div>

          <form action={createTicketTypeAction.bind(null, eventId)} className="space-y-4">
            <Field label="Nome" name="name" placeholder="Ex: Pista, VIP, Meia-entrada" required />
            <Field label="Descrição (opcional)" name="description" placeholder="Detalhes do ingresso" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (centavos)" name="price" type="number" placeholder="Ex: 5000 = R$50" required />
              <Field label="Qtd. total" name="totalQuantity" type="number" placeholder="Ex: 200" required />
            </div>
            <Field label="Máx. por pedido" name="maxPerOrder" type="number" placeholder="5" />
            <Button type="submit" className="w-full">
              Criar tipo de ingresso
            </Button>
          </form>
        </section>

        {/* Ticket types list */}
        <section className="space-y-6">
          {ticketTypesWithLots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Nenhum tipo de ingresso criado ainda.
            </div>
          ) : (
            ticketTypesWithLots.map((tt: any) => (
              <article key={tt._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{tt.name}</h3>
                    {tt.description && <p className="text-sm text-slate-500">{tt.description}</p>}
                    <div className="mt-1 flex gap-4 text-sm text-slate-600">
                      <span>Preço base: {currency(tt.price)}</span>
                      <span>Vendidos: {tt.soldQuantity}/{tt.totalQuantity}</span>
                      <span>Máx/pedido: {tt.maxPerOrder}</span>
                    </div>
                  </div>
                </div>

                {/* Edit ticket type */}
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900">
                    Editar tipo de ingresso
                  </summary>
                  <form action={updateTicketTypeAction.bind(null, eventId, tt._id)} className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nome" name="name" defaultValue={tt.name} required />
                      <Field label="Descrição" name="description" defaultValue={tt.description ?? ""} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Preço (centavos)" name="price" type="number" defaultValue={String(tt.price)} required />
                      <Field label="Qtd. total" name="totalQuantity" type="number" defaultValue={String(tt.totalQuantity)} required />
                      <Field label="Máx/pedido" name="maxPerOrder" type="number" defaultValue={String(tt.maxPerOrder)} />
                    </div>
                    <Button type="submit" size="sm" variant="outline">Salvar alterações</Button>
                  </form>
                </details>

                {/* Lots */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-semibold text-slate-700">Lotes ({tt.lots.length})</h4>
                  </div>

                  <div className="mb-4 space-y-2">
                    {tt.lots.map((lot: any) => (
                      <div key={lot._id} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${lot.active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                        <div>
                          <span className="font-medium text-slate-900">{lot.name}</span>
                          <span className="ml-3 text-slate-600">{currency(lot.price)}</span>
                          <span className="ml-3 text-slate-500">({lot.soldQuantity}/{lot.quantity} vendidos)</span>
                          {lot.active ? (
                            <span className="ml-2 rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">Ativo</span>
                          ) : (
                            <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">Inativo</span>
                          )}
                        </div>
                        <form action={toggleLotAction.bind(null, eventId, lot._id, !lot.active)}>
                          <Button size="sm" variant="outline" type="submit">
                            {lot.active ? "Desativar" : "Ativar"}
                          </Button>
                        </form>
                      </div>
                    ))}
                    {tt.lots.length === 0 && (
                      <p className="text-sm text-slate-400">Nenhum lote criado.</p>
                    )}
                  </div>

                  {/* Create lot */}
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-amber-700 hover:text-amber-900">
                      + Adicionar lote
                    </summary>
                    <form action={createLotAction.bind(null, eventId, tt._id)} className="mt-3 space-y-3 rounded-xl bg-amber-50 border border-amber-100 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Nome do lote" name="name" placeholder="Ex: 1º Lote, Pré-venda" required />
                        <Field label="Preço (centavos)" name="price" type="number" placeholder={String(tt.price)} required />
                      </div>
                      <Field label="Quantidade" name="quantity" type="number" placeholder="Ex: 100" required />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Início (opcional)" name="startsAt" type="datetime-local" />
                        <Field label="Fim (opcional)" name="endsAt" type="datetime-local" />
                      </div>
                      <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                        Criar lote
                      </Button>
                    </form>
                  </details>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500"
      />
    </div>
  );
}
