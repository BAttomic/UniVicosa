import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBR } from "@/lib/date-br";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventCover } from "@/components/shared/event-cover";
import { FeaturedBadge } from "@/components/shared/featured-badge";
import { WaitlistForm } from "@/components/shared/waitlist-form";
import { QueuePositionBar } from "@/components/shared/queue-position-bar";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findBySlug } from "@/modules/events/repositories/event.repository";
import { findByEventId } from "@/modules/events/repositories/ticket-type.repository";
import { findActiveByTicketTypeId, findUpcomingByTicketTypeId } from "@/modules/events/repositories/lot.repository";
import { countByEvent, getAccountPosition } from "@/modules/events/repositories/waitlist.repository";
import { joinWaitlistAction } from "@/server/actions/waitlist.actions";

export const dynamic = "force-dynamic";

type EventDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { slug } = await params;
  await connectDB();

  const event = await findBySlug(slug);
  if (!event) {
    notFound();
  }

  const ticketTypes = await findByEventId(event._id);
  const options: Array<{ id: string; name: string; price: number; available: number; lotName?: string }> = [];
  let earliestUpcoming: Date | null = null;

  for (const ticketType of ticketTypes) {
    const lot = (await findActiveByTicketTypeId(ticketType._id))[0];
    if (lot) {
      options.push({
        id: ticketType._id,
        name: ticketType.name,
        price: lot.price ?? ticketType.price,
        available: Math.max(0, Math.min(ticketType.totalQuantity - ticketType.soldQuantity, lot.quantity - lot.soldQuantity)),
        lotName: lot.name,
      });
      continue;
    }
    // No active lot for this type — is one scheduled to open soon?
    const upcoming = (await findUpcomingByTicketTypeId(ticketType._id))[0];
    if (upcoming?.startsAt) {
      const startsAt = new Date(upcoming.startsAt);
      if (!earliestUpcoming || startsAt < earliestUpcoming) earliestUpcoming = startsAt;
    }
  }

  const salesOpen = options.length > 0;
  const waitlistMode = !salesOpen && Boolean(earliestUpcoming);
  const session = await auth();
  const waitlistCount = waitlistMode ? await countByEvent(event._id) : 0;
  // Fila FIFO por conta: posição persistente da conta logada (ou null).
  const myQueue = session?.user?.id ? await getAccountPosition(event._id, session.user.id) : null;
  const joinAction = joinWaitlistAction.bind(null, String(event._id));

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <Card className="overflow-hidden border-slate-200">
        <div className="relative">
          <EventCover
            src={event.coverImageUrl}
            alt={event.title}
            className="h-52 w-full sm:h-64"
            fallbackClassName="bg-gradient-to-br from-amber-200 via-rose-200 to-sky-200"
          />
          {event.featured ? <FeaturedBadge className="absolute left-4 top-4" /> : null}
        </div>
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl leading-tight">{event.title}</CardTitle>
          <p className="text-slate-600">{event.description}</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            <strong>Local:</strong> {event.venue.name}, {event.venue.address}, {event.venue.city} - {event.venue.state}
          </p>
          <p>
            <strong>Data:</strong> {formatBR(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm")}
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            {salesOpen ? (
              <Button asChild>
                <Link href={`/eventos/${event.slug}/checkout`}>Comprar ingressos</Link>
              </Button>
            ) : null}
            <Button asChild variant="ghost">
              <Link href="/eventos">Voltar para eventos</Link>
            </Button>
          </div>

          {/* Fila de espera — sales not open yet */}
          {waitlistMode ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Vendas ainda não abriram</h2>
                  <p className="text-sm text-slate-600">
                    A venda começa em{" "}
                    <strong>{formatBR(earliestUpcoming as Date, "dd 'de' MMMM', às' HH:mm")}</strong>. Entre na
                    fila com a sua conta e acompanhe a sua posição aqui na plataforma.
                  </p>
                  {waitlistCount > 0 ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
                      <Users className="h-3.5 w-3.5" /> {waitlistCount} pessoa(s) já na fila
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4">
                {myQueue ? (
                  <QueuePositionBar position={myQueue.position} total={myQueue.total} />
                ) : (
                  <WaitlistForm action={joinAction} isLoggedIn={Boolean(session?.user?.id)} />
                )}
              </div>
            </div>
          ) : null}

          {salesOpen && myQueue ? (
            <div className="mt-6">
              <QueuePositionBar position={myQueue.position} total={myQueue.total} opened />
            </div>
          ) : null}

          {salesOpen ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-lg font-semibold text-slate-950">Ingressos e lotes</h2>
              <div className="mt-4 space-y-3">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{option.name}</p>
                      <p className="text-xs text-slate-500">{option.lotName}</p>
                      <p className="text-sm text-slate-600">Disponiveis: {option.available}</p>
                    </div>
                    <p className="font-semibold text-slate-900">R$ {(option.price / 100).toFixed(2).replace(".", ",")}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!salesOpen && !waitlistMode ? (
            <p className="mt-6 text-sm text-slate-600">Ainda nao ha ingressos ativos para compra.</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
