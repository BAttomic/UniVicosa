import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findByEventId as findStaff } from "@/modules/events/repositories/event-staff.repository";
import { findById as findUser } from "@/modules/identity/repositories/user.repository";
import { addEventOperatorAction, removeEventOperatorAction } from "@/server/actions/staff.actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function EventStaffPage({ params, searchParams }: PageProps) {
  const { id: eventId } = await params;
  const { status } = await searchParams;

  const session = await requireAuth();
  await connectDB();

  const event = await findEvent(eventId);
  if (!event) notFound();
  if (!canManageEvent(event, session)) notFound();

  const staff = await findStaff(eventId);
  const owner = await findUser(event.organizerId);
  const operators = await Promise.all(
    staff.map(async (entry) => ({ entry, user: await findUser(entry.userId) })),
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <Link href="/organizer/eventos" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para eventos
      </Link>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Equipe do evento</p>
        <h1 className="text-2xl font-bold text-slate-950">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Operadores podem fazer check-in e baixar a lista de compradores deste evento.
        </p>
      </div>

      {status ? (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800">{status}</div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UserPlus className="h-4 w-4" /> Adicionar operador
          </h2>
          <p className="mt-1 text-xs text-slate-500">Informe o e-mail de um usuário já cadastrado.</p>
          <form action={addEventOperatorAction.bind(null, eventId)} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              name="email"
              type="email"
              required
              placeholder="email@exemplo.com"
              className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500"
            />
            <button type="submit" className="h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Adicionar
            </button>
          </form>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
            <p className="font-semibold text-slate-700">O que um operador pode fazer?</p>
            <ul className="mt-2 space-y-1.5">
              <li>• Validar ingressos no check-in da portaria.</li>
              <li>• Baixar a lista de compradores (CSV) do evento.</li>
              <li>• Não acessa edição, vendas ou exclusão do evento.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users className="h-4 w-4" /> Equipe atual
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {operators.length + 1} pessoa(s)
            </span>
          </h2>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{owner?.name ?? "Organizador"}</p>
              <p className="truncate text-xs text-slate-500">{owner?.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">Organizador</span>
          </div>

          <ul className="mt-3 space-y-2">
            {operators.map(({ entry, user }) => (
              <li key={entry._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{user?.name ?? "Usuário removido"}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email ?? entry.userId}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Operador</span>
                  <form action={removeEventOperatorAction.bind(null, eventId, entry.userId)}>
                    <button type="submit" className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                      Remover
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          {operators.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhum operador adicionado ainda.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
