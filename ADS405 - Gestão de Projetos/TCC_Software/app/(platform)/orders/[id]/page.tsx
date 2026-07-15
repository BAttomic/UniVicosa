import { notFound } from "next/navigation";
import { formatBR } from "@/lib/date-br";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/event-access";
import { findDetailById } from "@/modules/orders/repositories/order.repository";
import { OrderStatusRefresh } from "@/components/shared/order-status-refresh";
import { ResendEmailButton } from "@/components/shared/resend-email-button";
import { resendOrderEmailAction } from "@/server/actions/orders.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  expired: "Expirado",
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await requireAuth();
  await connectDB();

  const order = await findDetailById(id);

  if (!order || String(order.buyerId) !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] px-4 py-10 sm:px-6">
      <OrderStatusRefresh orderId={order._id} status={order.status} />

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">Pedido #{order._id.slice(-6)}</CardTitle>
          <CardDescription>
            {statusLabels[order.status] ?? order.status} • {formatBR(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Resumo</p>
            <div className="mt-2 max-w-xs space-y-1 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>R$ {((order.totalAmount - (order.serviceFee ?? 0)) / 100).toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de serviço (5%)</span>
                <span>R$ {((order.serviceFee ?? 0) / 100).toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
                <span>Total</span>
                <span>R$ {(order.totalAmount / 100).toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-700">Aprovação automática em 20 segundos: {order.status === "paid" ? "Concluída" : "Em andamento"}</p>
          </div>

          {order.payer ? (
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Titular e pagamento</p>
              <div className="mt-2 space-y-0.5 text-sm text-slate-700">
                <p>{order.payer.name} • CPF {order.payer.cpf}</p>
                <p>{order.payer.email}{order.payer.phone ? ` • ${order.payer.phone}` : ""}</p>
                {order.paymentMethod ? (
                  <p className="capitalize">
                    Forma de pagamento: {order.paymentMethod === "credit_card" ? "Cartão de crédito" : order.paymentMethod === "pix" ? "PIX" : "Boleto"}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ingressos</p>
            {order.items.map((item: (typeof order.items)[number]) => (
              <div key={item.ticketTypeId.toString()} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-950">{item.eventName}</p>
                <p className="text-sm text-slate-600">{item.ticketTypeName} • Quantidade: {item.quantity}</p>
                <p className="text-sm text-slate-600">Subtotal: R$ {(item.subtotal / 100).toFixed(2).replace(".", ",")}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tickets gerados</p>
            {order.tickets?.length ? (
              order.tickets.map((ticket: (typeof order.tickets)[number]) => (
                <div key={ticket._id.toString()} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <p>Codigo: {ticket.code}</p>
                  <p>Status: {ticket.status}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Os tickets aparecem assim que o pedido for aprovado.</p>
            )}
          </div>

          {order.status === "paid" ? (
            <ResendEmailButton action={resendOrderEmailAction.bind(null, order._id)} />
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}