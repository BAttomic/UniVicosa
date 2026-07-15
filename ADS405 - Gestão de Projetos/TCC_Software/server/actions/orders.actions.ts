"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/modules/orders/models/order.model";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findById as findUser } from "@/modules/identity/repositories/user.repository";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { recordAuditLog } from "@/lib/audit";

export type ResendState = { ok: boolean; message: string };

// Reenvia o comprovante/ingresso por e-mail para um pedido pago. Disponível ao
// dono do pedido e ao admin.
export async function resendOrderEmailAction(
  orderId: string,
  _state: ResendState,
  _formData: FormData,
): Promise<ResendState> {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, message: "Não autorizado." };

    await connectDB();
    const O = Order as unknown as { findById(id: string): { lean(): Promise<any> } };
    const order = await O.findById(orderId).lean();
    if (!order) return { ok: false, message: "Pedido não encontrado." };

    const isOwner = String(order.buyerId) === session.user.id;
    if (!isOwner && session.user.role !== "admin") {
      return { ok: false, message: "Não autorizado." };
    }
    if (order.status !== "paid") {
      return { ok: false, message: "O comprovante só pode ser reenviado para pedidos pagos." };
    }

    const [event, buyer] = await Promise.all([
      findEvent(String(order.eventId)),
      findUser(String(order.buyerId)),
    ]);

    const to = order.payer?.email ?? buyer?.email;
    if (!to) return { ok: false, message: "Não há e-mail de destino para este pedido." };

    await sendOrderConfirmationEmail({
      to,
      name: order.payer?.name ?? buyer?.name ?? "cliente",
      eventTitle: event?.title ?? "seu evento",
      orderId: String(order._id),
      totalAmount: order.totalAmount,
    });

    await recordAuditLog({
      action: "order.resend_email",
      actorId: session.user.id,
      targetId: String(order._id),
      metadata: { to },
    });

    return { ok: true, message: `Comprovante reenviado para ${to}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Falha ao reenviar o comprovante." };
  }
}
