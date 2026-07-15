import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import {
  CalendarDays,
  Ticket,
  Search,
  MapPin,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCover } from "@/components/shared/event-cover";
import { FeaturedBadge } from "@/components/shared/featured-badge";
import { EventTimingBadge } from "@/components/shared/event-timing-badge";
import { connectDB } from "@/lib/db";
import { getEventTiming } from "@/lib/event-time";
import { findFeaturedPublished } from "@/modules/events/repositories/event.repository";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  let highlights = {
    upcoming: [] as Awaited<ReturnType<typeof findFeaturedPublished>>["upcoming"],
    largest: [] as Awaited<ReturnType<typeof findFeaturedPublished>>["largest"],
    featured: [] as Awaited<ReturnType<typeof findFeaturedPublished>>["featured"],
  };
  let dbUnavailable = false;

  try {
    await connectDB();
    highlights = await findFeaturedPublished(7, "Viçosa");
  } catch {
    dbUnavailable = true;
  }

  const hasFeatured = highlights.featured.length > 0;
  const hasUpcoming = highlights.upcoming.length > 0;
  const hasLargest = highlights.largest.length > 0;

  return (
    <main className="flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(circle_at_12%_10%,_rgba(251,191,36,0.22)_0,_transparent_28%),radial-gradient(circle_at_88%_15%,_rgba(96,165,250,0.18)_0,_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc_50%,_#eef2ff)]">
      {/* ---------- HERO ---------- */}
      <section className="mx-auto grid w-full max-w-[96rem] gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:pt-16">
        <div className="min-w-0 space-y-6">
          <h1 className="max-w-2xl text-balance text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Os maiores eventos,{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              pertinho de você
            </span>
            , em um só lugar.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            Descubra o que está bombando, garanta seu ingresso com QR Code seguro e acompanhe tudo pelo celular — da
            compra ao check-in na portaria.
          </p>

          {/* busca */}
          <form
            action="/eventos"
            className="grid gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/70 backdrop-blur sm:grid-cols-[1fr_1fr_auto]"
          >
            <div className="min-w-0">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="busca">
                Buscar evento
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="busca"
                  name="busca"
                  placeholder="Shows, festas, teatro..."
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="min-w-0">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500" htmlFor="cidade">
                Cidade
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="cidade"
                  name="cidade"
                  placeholder="Viçosa, BH, Rio..."
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
                />
              </div>
            </div>
            <Button className="h-12 self-end rounded-2xl px-6" type="submit">
              <Search className="h-4 w-4" />
              Encontrar
            </Button>
          </form>
        </div>

        {/* lateral: conta logada OU chamada para organizar */}
        {session ? (
          <aside className="min-w-0">
            <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
              <div className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22)_0,_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(30,41,59,1))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Minha conta</p>
                <h2 className="mt-2 break-words text-2xl font-black tracking-tight">
                  Olá, {session.user?.name?.split(" ")[0]}
                </h2>
                <p className="mt-1 text-sm capitalize text-slate-300">{role}</p>
                <div className="mt-6 flex flex-col gap-3">
                  {role === "admin" ? (
                    <>
                      <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                        <Link href="/admin/analytics">Analytics da plataforma</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                        <Link href="/admin/usuarios">Painel admin</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                        <Link href="/organizer/eventos">Gerenciar eventos</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                        <Link href="/tickets">Meus ingressos</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                        <Link href="/orders">Meus pedidos</Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                        <Link href="/organizer/eventos">Meus eventos</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <CardContent className="space-y-3 bg-white p-6 text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acesso rápido</p>
                <ul className="space-y-2.5 text-sm leading-relaxed">
                  {role === "admin" ? (
                    <>
                      <li className="flex items-start gap-2"><Dot /> Gerencie usuários e níveis de acesso.</li>
                      <li className="flex items-start gap-2"><Dot /> Modere e distribua ingressos de qualquer evento.</li>
                      <li className="flex items-start gap-2"><Dot /> Acompanhe a operação da plataforma.</li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2"><Dot /> Acompanhe seus pedidos em tempo real.</li>
                      <li className="flex items-start gap-2"><Dot /> Use seus ingressos com QR Code dinâmico.</li>
                      <li className="flex items-start gap-2"><Dot /> Explore novos eventos na sua cidade.</li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </aside>
        ) : (
          <aside className="min-w-0">
            <Card className="overflow-hidden border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
              <div className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22)_0,_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(30,41,59,1))] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Para organizadores</p>
                <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">
                  Crie e venda ingressos em minutos.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Criar conta e publicar é <strong className="text-white">gratuito</strong>. A taxa de{" "}
                  <strong className="text-amber-300">5%</strong> é paga pelo comprador — você recebe o valor cheio dos
                  seus ingressos.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                    <Link href="/register">
                      Criar conta grátis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-2xl border-slate-500 bg-transparent text-white hover:bg-white/10">
                    <Link href="/login">Já tenho conta</Link>
                  </Button>
                </div>
              </div>
              <CardContent className="space-y-2.5 bg-white p-6 text-sm leading-relaxed text-slate-700">
                <p className="flex items-start gap-2"><Dot /> Lotes programados e fila de espera.</p>
                <p className="flex items-start gap-2"><Dot /> Ingresso digital com QR dinâmico.</p>
                <p className="flex items-start gap-2"><Dot /> Check-in rápido na portaria.</p>
              </CardContent>
            </Card>
          </aside>
        )}
      </section>

      {/* ---------- DESTAQUES / VITRINES ---------- */}
      <section className="mx-auto w-full max-w-[96rem] space-y-10 px-4 pb-16 sm:px-6">
        {dbUnavailable ? (
          <Card className="border-amber-200/70 bg-amber-50/90 shadow-sm">
            <CardContent className="p-4 text-sm leading-relaxed text-amber-900">
              Os destaques ainda não estão disponíveis porque a base de dados local não respondeu. A página continua
              funcionando e os eventos reaparecem assim que o MongoDB ficar acessível.
            </CardContent>
          </Card>
        ) : null}

        {/* Vitrine de patrocinados — scroll horizontal interno, barra escondida */}
        {hasFeatured ? (
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                <Ticket className="h-6 w-6 text-rose-500" />
                Destaques
              </h2>
              <p className="text-sm text-slate-600">Eventos patrocinados em evidência.</p>
            </div>
            <div className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-1">
              {highlights.featured.map((event) => (
                <Link
                  key={event._id}
                  href={`/eventos/${event.slug}`}
                  className="group relative h-60 w-72 shrink-0 snap-start overflow-hidden rounded-3xl border border-slate-200 shadow-md"
                >
                  <div className="absolute inset-0">
                    <EventCover src={event.coverImageUrl} alt={event.title} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  <FeaturedBadge className="absolute left-3 top-3" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="line-clamp-2 break-words text-lg font-bold leading-tight">{event.title}</p>
                    <p className="mt-1 text-sm text-white/80">
                      {event.venue.city} • {formatBR(new Date(event.startsAt), "dd MMM")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Mais próximos */}
          <section className="min-w-0">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                  <CalendarDays className="h-6 w-6 text-amber-600" />
                  Mais próximos
                </h2>
                <p className="text-sm text-slate-600">Eventos publicados que acontecem primeiro.</p>
              </div>
              <Button asChild variant="ghost" className="shrink-0 text-slate-700">
                <Link href="/eventos">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {hasUpcoming ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.upcoming.slice(0, 4).map((event) => (
                  <Card
                    key={event._id}
                    className="flex min-w-0 flex-col overflow-hidden border-slate-200 bg-white/90 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative">
                      <EventCover src={event.coverImageUrl} alt={event.title} className="h-40 w-full" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {event.featured ? <FeaturedBadge /> : null}
                        {getEventTiming(event.startsAt, event.endsAt) !== "scheduled" ? (
                          <EventTimingBadge startsAt={event.startsAt} endsAt={event.endsAt} />
                        ) : null}
                      </div>
                    </div>
                    <CardHeader className="space-y-1.5">
                      <CardTitle className="line-clamp-2 break-words text-xl leading-tight">{event.title}</CardTitle>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {event.venue.city} • {formatBR(new Date(event.startsAt), "dd MMM, HH:mm")}
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-4">
                      <p className="line-clamp-2 break-words text-sm text-slate-600">{event.description}</p>
                      <Button asChild className="w-full rounded-xl">
                        <Link href={`/eventos/${event.slug}`}>Ver evento</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhum evento publicado por aqui ainda. Volte em breve!" />
            )}
          </section>

          {/* Maiores eventos */}
          <section className="min-w-0">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                <TrendingUp className="h-6 w-6 text-sky-600" />
                Maiores eventos
              </h2>
              <p className="text-sm text-slate-600">Os eventos com maior capacidade de público.</p>
            </div>

            {hasLargest ? (
              <div className="space-y-3">
                {highlights.largest.map((event, index) => (
                  <Card key={event._id} className="min-w-0 border-slate-200 bg-white/90 shadow-sm transition hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 break-words text-base font-semibold text-slate-950">{event.title}</p>
                        <p className="truncate text-sm text-slate-600">
                          {event.venue.city} • {event.totalTickets.toLocaleString("pt-BR")} ingressos
                        </p>
                        <p className="truncate text-sm font-medium text-amber-700">
                          {formatBR(new Date(event.startsAt), "dd MMM • HH:mm")}
                        </p>
                      </div>
                      <Button asChild variant="outline" className="shrink-0 rounded-xl">
                        <Link href={`/eventos/${event.slug}`}>Abrir</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState message="Ainda não há eventos para ranquear." />
            )}
          </section>
        </div>
      </section>

      {/* ---------- RODAPÉ ---------- */}
      <footer className="mt-auto flex flex-col items-center gap-2 border-t border-slate-200/70 py-6 text-center text-sm text-slate-500 sm:flex-row sm:justify-center sm:gap-4">
        <span>TicketFlow 2026 • Plataforma de ingressos online</span>
        <span className="hidden sm:inline">•</span>
        <Link href="/privacidade" className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900">
          Privacidade e LGPD
        </Link>
      </footer>
    </main>
  );
}

function Dot() {
  return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <CalendarDays className="h-8 w-8 text-slate-400" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
