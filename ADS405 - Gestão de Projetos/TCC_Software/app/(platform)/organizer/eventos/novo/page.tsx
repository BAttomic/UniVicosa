import { EventForm } from "@/components/shared/event-form";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/event-access";
import { createEventAction } from "@/server/actions/events.actions";

export const dynamic = "force-dynamic";

function toLocalDateTime(value: Date) {
  return value.toISOString().slice(0, 16);
}

export default async function NewEventPage() {
  await requireAuth();
  await connectDB();

  const now = new Date();
  const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Novo evento</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Cadastrar evento</h1>
        <p className="mt-2 text-slate-600">Preencha os dados basicos. O slug pode ficar em branco para ser gerado automaticamente.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <EventForm
          action={createEventAction}
          submitLabel="Criar evento"
          defaultValues={{
            title: "",
            slug: "",
            description: "",
            venueName: "",
            venueAddress: "",
            venueCity: "",
            venueState: "MG",
            startsAt: toLocalDateTime(now),
            endsAt: toLocalDateTime(later),
            coverImageUrl: "",
            featured: false,
            status: "draft",
          }}
        />
      </div>
    </main>
  );
}