import { notFound } from "next/navigation";
import { EventForm } from "@/components/shared/event-form";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById } from "@/modules/events/repositories/event.repository";
import { updateEventAction } from "@/server/actions/events.actions";

export const dynamic = "force-dynamic";

function toLocalDateTime(value: Date) {
  return new Date(value).toISOString().slice(0, 16);
}

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await requireAuth();
  const { id } = await params;
  await connectDB();

  const event = await findById(id);
  if (!event) {
    notFound();
  }

  if (!canManageEvent(event, session)) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Editar evento</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{event.title}</h1>
        <p className="mt-2 text-slate-600">Ajuste os dados de publicacao, datas e local.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <EventForm
          action={updateEventAction.bind(null, event._id)}
          submitLabel="Salvar alteracoes"
          defaultValues={{
            title: event.title,
            slug: event.slug,
            description: event.description,
            venueName: event.venue.name,
            venueAddress: event.venue.address,
            venueCity: event.venue.city,
            venueState: event.venue.state,
            startsAt: toLocalDateTime(event.startsAt),
            endsAt: toLocalDateTime(event.endsAt),
            coverImageUrl: event.coverImageUrl ?? "",
            featured: event.featured ?? false,
            status: event.status,
          }}
        />
      </div>
    </main>
  );
}