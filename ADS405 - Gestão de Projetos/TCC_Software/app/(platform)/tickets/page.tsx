import Link from "next/link";
import { formatBR } from "@/lib/date-br";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/event-access";
import { findDetailedByOwnerId } from "@/modules/tickets/repositories/ticket.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CpfReveal } from "@/components/shared/cpf-reveal";
import {
  Ticket,
  QrCode,
  CalendarDays,
  Tag,
  Layers,
  DollarSign,
  ShoppingCart,
  User,
  IdCard,
  MapPin,
  Gift,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  valid: "Válido",
  used: "Utilizado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  valid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  used: "border-slate-200 bg-slate-50 text-slate-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

function currency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

export default async function TicketsPage() {
  const session = await requireAuth();
  await connectDB();

  const tickets = await findDetailedByOwnerId(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6">
        <div className="flex items-center gap-3">
          <Ticket className="h-8 w-8 text-amber-500" />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Minha carteira</p>
            <h1 className="text-3xl font-bold text-slate-950">Meus ingressos</h1>
          </div>
        </div>
        <p className="mt-2 text-slate-600">
          Apresente o QR Code na entrada do evento. Ele se renova a cada 30 segundos por segurança.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tickets.map((ticket) => {
          const purchaseDate = ticket.paidAt ?? ticket.purchaseDate;
          const holderName = ticket.payerName ?? session.user.name ?? "—";
          return (
            <Card
              key={ticket.id}
              className={`flex flex-col border bg-white/90 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${
                ticket.status === "valid" ? "border-emerald-200" : "border-slate-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-lg">{ticket.eventTitle}</CardTitle>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ticket.status] ?? ""}`}>
                    {statusLabels[ticket.status] ?? ticket.status}
                  </span>
                </div>
                {ticket.venue ? (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{ticket.venue}</span>
                  </p>
                ) : null}
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3">
                <dl className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
                  <Row icon={<CalendarDays className="h-4 w-4" />} label="Data do evento">
                    {ticket.eventStartsAt
                      ? formatBR(new Date(ticket.eventStartsAt), "dd/MM/yyyy 'às' HH:mm")
                      : "—"}
                  </Row>
                  <Row icon={<Tag className="h-4 w-4" />} label="Tipo">
                    {ticket.ticketTypeName}
                  </Row>
                  <Row icon={<Layers className="h-4 w-4" />} label="Lote">
                    {ticket.lotName ?? "—"}
                  </Row>
                  <Row icon={ticket.isCourtesy ? <Gift className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />} label="Valor">
                    {ticket.isCourtesy || ticket.unitPrice === 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <Gift className="h-3 w-3" /> Cortesia
                      </span>
                    ) : (
                      currency(ticket.unitPrice)
                    )}
                  </Row>
                  <Row icon={<ShoppingCart className="h-4 w-4" />} label={ticket.isCourtesy ? "Recebido em" : "Compra"}>
                    {purchaseDate ? formatBR(new Date(purchaseDate), "dd/MM/yyyy 'às' HH:mm") : "—"}
                  </Row>
                  <Row icon={<User className="h-4 w-4" />} label="Titular">
                    {holderName}
                  </Row>
                  <Row icon={<IdCard className="h-4 w-4" />} label="CPF">
                    {ticket.payerCpf ? <CpfReveal cpf={ticket.payerCpf} /> : "—"}
                  </Row>
                </dl>

                <p className="break-all font-mono text-[11px] text-slate-400">{ticket.code}</p>

                {ticket.status === "valid" ? (
                  <Button asChild className="mt-auto w-full gap-2">
                    <Link href={`/tickets/${ticket.code}`}>
                      <QrCode className="h-4 w-4" />
                      Abrir QR Code
                    </Link>
                  </Button>
                ) : (
                  <p className="mt-auto text-sm text-slate-500">
                    {ticket.status === "used" && ticket.usedAt
                      ? `Utilizado em ${formatBR(new Date(ticket.usedAt), "dd/MM/yyyy 'às' HH:mm")}`
                      : "Ingresso não disponível"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-700">Nenhum ingresso ainda</p>
          <p className="mt-1 text-sm text-slate-500">Compre ingressos para um evento e eles aparecerão aqui.</p>
          <Button asChild className="mt-6">
            <Link href="/eventos">Ver eventos</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon} {label}
      </dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}
