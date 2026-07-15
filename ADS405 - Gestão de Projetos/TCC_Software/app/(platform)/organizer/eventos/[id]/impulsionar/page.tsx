import { notFound } from "next/navigation";
import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { ArrowLeft, Rocket, History, Sparkles } from "lucide-react";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findByEventId as findBoosts } from "@/modules/events/repositories/boost.repository";
import { boostEventAction } from "@/server/actions/boost.actions";
import { BoostForm } from "@/components/shared/boost-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ImpulsionarPage({ params }: PageProps) {
  const { id: eventId } = await params;

  const session = await requireAuth();
  await connectDB();

  const event = await findEvent(eventId);
  if (!event) notFound();
  if (!canManageEvent(event, session)) notFound();

  const boosts = (await findBoosts(eventId)) as Array<{
    _id: string;
    packageLabel: string;
    amount: number;
    durationDays: number;
    startsAt: string;
    expiresAt: string;
  }>;

  const now = Date.now();
  const activeBoost = boosts.find((boost) => new Date(boost.expiresAt).getTime() > now);
  const totalSpent = boosts.reduce((sum, boost) => sum + (boost.amount ?? 0), 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/organizer/eventos" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Voltar para eventos
      </Link>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Impulsionar evento</p>
        <h1 className="text-2xl font-bold text-slate-950">{event.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pague para destacar o seu evento na home e na busca da plataforma — mais alcance, mais vendas.
        </p>
      </div>

      {activeBoost ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-500" />
          <span>
            <strong>Impulsionamento ativo</strong> — pacote {activeBoost.packageLabel}, em destaque até{" "}
            {formatBR(new Date(activeBoost.expiresAt), "dd/MM/yyyy 'às' HH:mm")}.
          </span>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Rocket className="h-4 w-4" /> Escolha um pacote
          </h2>
          <BoostForm action={boostEventAction.bind(null, eventId)} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4" /> Histórico de impulsionamentos
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {brl(totalSpent)} investidos
            </span>
          </h2>

          {boosts.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Este evento ainda não foi impulsionado.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {boosts.map((boost) => {
                const isActive = new Date(boost.expiresAt).getTime() > now;
                return (
                  <li key={boost._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        {boost.packageLabel}
                        {isActive ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Ativo</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Encerrado</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBR(new Date(boost.startsAt), "dd/MM/yyyy")} →{" "}
                        {formatBR(new Date(boost.expiresAt), "dd/MM/yyyy")} ({boost.durationDays} dias)
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900">{brl(boost.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
