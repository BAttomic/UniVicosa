import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { Search, CalendarRange, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCover } from "@/components/shared/event-cover";
import { FeaturedBadge } from "@/components/shared/featured-badge";
import { EventTimingBadge } from "@/components/shared/event-timing-badge";
import { connectDB } from "@/lib/db";
import { getEventTiming } from "@/lib/event-time";
import { findPublishedFiltered } from "@/modules/events/repositories/event.repository";

export const dynamic = "force-dynamic";

type EventosPageProps = {
  searchParams: Promise<{
    busca?: string;
    cidade?: string;
    de?: string;
    ate?: string;
  }>;
};

// input[type=date] yields "YYYY-MM-DD"; anchor it to the local day boundaries.
function parseDate(value: string | undefined, edge: "start" | "end"): Date | undefined {
  if (!value) return undefined;
  const time = edge === "start" ? "T00:00:00" : "T23:59:59.999";
  const parsed = new Date(`${value}${time}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const params = await searchParams;
  await connectDB();

  const startsFrom = parseDate(params.de, "start");
  const startsTo = parseDate(params.ate, "end");

  const events = await findPublishedFiltered({
    search: params.busca,
    city: params.cidade,
    startsFrom,
    startsTo,
    preferredCity: "Viçosa",
  });

  const hasFilters = Boolean(params.busca || params.cidade || params.de || params.ate);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Descubra{" "}
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            eventos
          </span>{" "}
          perto de você
        </h1>
        <p className="mt-2 text-slate-600">Experiências ao vivo — garanta seu ingresso com QR Code seguro.</p>
      </div>

      {/* Busca única (título, cidade, descrição) + intervalo de datas */}
      <form className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_auto]">
          <div className="lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="busca">
              Buscar
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="busca"
                name="busca"
                defaultValue={params.busca ?? ""}
                placeholder="Título, cidade ou descrição..."
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="de">
              A partir de
            </label>
            <input
              id="de"
              name="de"
              type="date"
              defaultValue={params.de ?? ""}
              className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="ate">
              Até
            </label>
            <input
              id="ate"
              name="ate"
              type="date"
              defaultValue={params.ate ?? ""}
              className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="h-11 flex-1 rounded-xl">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Carrega o filtro legado de cidade (vindo da home) e permite limpar */}
        {params.cidade ? <input type="hidden" name="cidade" value={params.cidade} /> : null}
        {hasFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">
              {events.length} evento(s) encontrado(s)
            </span>
            {params.cidade ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                <MapPin className="h-3 w-3" /> Cidade: {params.cidade}
              </span>
            ) : null}
            <Link
              href="/eventos"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" /> Limpar filtros
            </Link>
          </div>
        ) : null}
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map((event) => {
          const timing = getEventTiming(event.startsAt, event.endsAt);
          const highlighted = timing === "live" || timing === "soon";
          return (
            <Card
              key={event._id}
              className={`flex flex-col overflow-hidden bg-white/90 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                highlighted ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
              }`}
            >
              <div className="relative">
                <EventCover src={event.coverImageUrl} alt={event.title} className="h-40 w-full" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {event.featured ? <FeaturedBadge /> : null}
                  {highlighted ? <EventTimingBadge startsAt={event.startsAt} endsAt={event.endsAt} /> : null}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-xl">{event.title}</CardTitle>
                <CardDescription>
                  {event.venue.city} - {event.venue.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="line-clamp-2 text-sm text-slate-600">{event.description}</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatBR(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm")}
                </p>
                <Button asChild className="mt-auto w-full">
                  <Link href={`/eventos/${event.slug}`}>Ver detalhes</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          <CalendarRange className="mx-auto mb-2 h-8 w-8 text-slate-400" />
          Nenhum evento encontrado para os filtros informados.
          {hasFilters ? (
            <div className="mt-3">
              <Button asChild variant="outline">
                <Link href="/eventos">Limpar filtros</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
