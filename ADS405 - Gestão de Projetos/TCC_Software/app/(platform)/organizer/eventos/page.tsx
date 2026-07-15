import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { CalendarDays, MapPin, Pencil, Tags, BarChart3, Users, Gift, QrCode, Rocket, ShieldCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCover } from "@/components/shared/event-cover";
import { FeaturedBadge } from "@/components/shared/featured-badge";
import { EventTimingBadge } from "@/components/shared/event-timing-badge";
import { connectDB } from "@/lib/db";
import { requireAuth, isAdmin } from "@/lib/event-access";
import { getEventTiming } from "@/lib/event-time";
import { deleteEventAction } from "@/server/actions/events.actions";
import { findAll, findByOrganizerId, findById as findEventById } from "@/modules/events/repositories/event.repository";
import { findEventIdsForUser } from "@/modules/events/repositories/event-staff.repository";
import type { IEvent } from "@/modules/events/models/event.model";

export const dynamic = "force-dynamic";

type CardRole = "admin" | "owner" | "operator";

export default async function OrganizerEventsPage() {
  const session = await requireAuth();
  await connectDB();

  const admin = isAdmin(session);

  const ownedEvents: IEvent[] = admin
    ? await findAll()
    : await findByOrganizerId(session.user.id);

  let operatorEvents: IEvent[] = [];
  if (!admin) {
    const ownedIds = new Set(ownedEvents.map((event) => String(event._id)));
    const operatorIds = await findEventIdsForUser(session.user.id);
    const loaded = await Promise.all(
      operatorIds.filter((id) => !ownedIds.has(id)).map((id) => findEventById(id)),
    );
    operatorEvents = loaded.filter((event): event is IEvent => Boolean(event));
  }

  const ownedRole: CardRole = admin ? "admin" : "owner";

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Área de gestão</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{admin ? "Todos os eventos" : "Meus eventos"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {admin
              ? "Como admin você gerencia, distribui cortesias e analisa qualquer evento."
              : "Crie eventos, gerencie a equipe de operadores e distribua cortesias."}
          </p>
        </div>
        <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
          <Link href="/organizer/eventos/novo">Novo evento</Link>
        </Button>
      </div>

      {/* Eventos próprios (organizador) ou todos (admin) */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ownedEvents.map((event) => (
          <EventManageCard key={event._id} event={event} role={ownedRole} />
        ))}
      </div>

      {ownedEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Você ainda não tem eventos próprios. Clique em <strong>Novo evento</strong> para começar.
        </div>
      ) : null}

      {/* Eventos onde o usuário atua como operador (não admin) */}
      {operatorEvents.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-950">Eventos em que sou operador</h2>
              <p className="text-sm text-slate-600">
                Você foi adicionado à equipe destes eventos para validar a entrada (check-in).
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operatorEvents.map((event) => (
              <EventManageCard key={event._id} event={event} role="operator" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function EventManageCard({ event, role }: { event: IEvent; role: CardRole }) {
  const canManage = role === "admin" || role === "owner";
  const timing = getEventTiming(event.startsAt, event.endsAt);
  const highlighted = timing === "live" || timing === "soon";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm ${
        highlighted ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
      }`}
    >
      <div className="relative">
        <EventCover src={event.coverImageUrl} alt={event.title} className="h-32 w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {event.featured ? <FeaturedBadge /> : null}
          {highlighted ? <EventTimingBadge startsAt={event.startsAt} endsAt={event.endsAt} /> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold leading-tight text-slate-950">{event.title}</h2>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={event.status} />
            {role === "operator" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <ShieldCheck className="h-3 w-3" /> Operador
              </span>
            ) : null}
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {event.venue.city} - {event.venue.state}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" /> {formatBR(new Date(event.startsAt), "dd/MM/yyyy HH:mm")}
        </p>

        {canManage ? (
          <>
            <Link
              href={`/organizer/eventos/${event._id}/impulsionar`}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:from-amber-300 hover:to-orange-300"
            >
              <Rocket className="h-3.5 w-3.5" />
              Impulsionar evento
            </Link>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <ActionLink href={`/organizer/eventos/${event._id}/editar`} icon={<Pencil className="h-3.5 w-3.5" />} label="Editar" />
              <ActionLink href={`/organizer/eventos/${event._id}/ingressos`} icon={<Tags className="h-3.5 w-3.5" />} label="Ingressos" />
              <ActionLink href={`/organizer/eventos/${event._id}/vendas`} icon={<BarChart3 className="h-3.5 w-3.5" />} label="Analytics" />
              <ActionLink href={`/organizer/eventos/${event._id}/equipe`} icon={<Users className="h-3.5 w-3.5" />} label="Equipe" />
              <ActionLink href={`/organizer/eventos/${event._id}/cortesias`} icon={<Gift className="h-3.5 w-3.5" />} label="Cortesias" />
              <ActionLink href={`/checkin?event=${event._id}`} icon={<QrCode className="h-3.5 w-3.5" />} label="Check-in" />
            </div>

            <form action={deleteEventAction.bind(null, event._id)} className="mt-3">
              <button type="submit" className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                Excluir evento
              </button>
            </form>
          </>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2">
            <Link
              href={`/checkin?event=${event._id}`}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <QrCode className="h-3.5 w-3.5" />
              Abrir check-in
            </Link>
            <ActionLink href={`/eventos/${event.slug}`} icon={<Eye className="h-3.5 w-3.5" />} label="Ver página do evento" />
          </div>
        )}
      </div>
    </article>
  );
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
    >
      {icon}
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-slate-100 text-slate-600",
    cancelled: "bg-rose-100 text-rose-700",
    finished: "bg-sky-100 text-sky-700",
  };
  const labels: Record<string, string> = {
    published: "Publicado",
    draft: "Rascunho",
    cancelled: "Cancelado",
    finished: "Encerrado",
  };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}
