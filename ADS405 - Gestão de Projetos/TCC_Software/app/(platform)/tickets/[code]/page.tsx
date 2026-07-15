import { notFound } from "next/navigation";
import QRCode from "qrcode";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/event-access";
import { findByCode } from "@/modules/tickets/repositories/ticket.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { env } from "@/lib/env";
import { QrRefresh } from "@/components/shared/qr-refresh";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

type TicketPageProps = {
  params: Promise<{ code: string }>;
};

function generateCurrentHmac(ticketCode: string, ownerId: string): string {
  const windowSeconds = 30;
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  return crypto.createHmac("sha256", env.TICKET_HMAC_SECRET).update(`${ticketCode}:${ownerId}:${window}`).digest("hex");
}

export default async function TicketQrPage({ params }: TicketPageProps) {
  const { code } = await params;
  const session = await requireAuth();
  await connectDB();

  const ticket = await findByCode(code);
  if (!ticket || ticket.ownerId !== session.user.id) {
    notFound();
  }

  const event = await findEvent(ticket.eventId);
  const hmac = generateCurrentHmac(ticket.code, ticket.ownerId);
  const qrPayload = JSON.stringify({ code: ticket.code, secret: hmac });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 320,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const windowSeconds = 30;
  const secondsRemaining = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);

  const isValid = ticket.status === "valid";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center px-4 py-10">
      <QrRefresh />

      <div className="mb-6 w-full">
        <Button asChild variant="ghost" className="gap-2 text-slate-600">
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
            Meus ingressos
          </Link>
        </Button>
      </div>

      <Card className={`w-full overflow-hidden ${isValid ? "border-emerald-200" : "border-slate-200"}`}>
        {isValid ? (
          <div className="bg-emerald-600 px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-semibold">Ingresso válido</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-emerald-100 text-sm">
              <Clock className="h-3.5 w-3.5" />
              QR renova em {secondsRemaining}s
            </div>
          </div>
        ) : (
          <div className="bg-slate-600 px-6 py-4 text-white">
            <p className="font-semibold">
              {ticket.status === "used" ? "Ingresso já utilizado" : "Ingresso cancelado"}
            </p>
          </div>
        )}

        <CardContent className="flex flex-col items-center gap-6 p-6">
          {isValid ? (
            <div className="rounded-2xl border-4 border-slate-100 bg-white p-2">
              <img src={qrDataUrl} alt="QR Code do ingresso" width={280} height={280} />
            </div>
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <span className="text-center text-sm">QR Code indisponível</span>
            </div>
          )}

          <div className="w-full space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Evento</p>
              <p className="mt-0.5 font-semibold text-slate-950">{event?.title ?? "—"}</p>
              {event?.startsAt && (
                <p className="mt-0.5 text-slate-600">
                  {formatBR(new Date(event.startsAt), "dd 'de' MMMM 'de' yyyy, HH:mm")}
                </p>
              )}
              {event?.venue && (
                <p className="text-slate-600">{event.venue.name} — {event.venue.city}/{event.venue.state}</p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Código</p>
              <p className="mt-0.5 font-mono text-xs text-slate-700 break-all">{ticket.code}</p>
            </div>

            {ticket.usedAt && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Utilizado em</p>
                <p className="mt-0.5 text-sm text-amber-900">
                  {formatBR(new Date(ticket.usedAt), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-slate-400">
        O QR Code é renovado automaticamente a cada 30 segundos por segurança.
        <br />Não tire print — o código mudará.
      </p>
    </main>
  );
}
