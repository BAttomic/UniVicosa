import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Order from "@/modules/orders/models/order.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Lot from "@/modules/events/models/lot.model";
import { create as createTicket, generateCode, generateSecret } from "@/modules/tickets/repositories/ticket.repository";
import { findById as findUserById } from "@/modules/identity/repositories/user.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { sendOrderConfirmationEmail } from "@/lib/email";

const AUTO_APPROVE_DELAY_MS = 20_000;

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const O = Order as unknown as {
    findById(id: string): any;
    findByIdAndUpdate(id: string, data: any, options: any): any;
  };
  const TT = TicketType as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: any, update: any, options: any): any;
  };
  const LM = Lot as unknown as {
    findById(id: string): any;
    findOneAndUpdate(filter: any, update: any, options: any): any;
  };

  const order = await O.findById(id).lean();
  if (!order) return NextResponse.json({ ok: false, status: "not_found" }, { status: 404 });

  if (String(order.buyerId) !== String(session.user.id) && session.user.role !== "admin") {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 403 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ ok: true, status: order.status });
  }

  const createdAt = new Date(order.createdAt).getTime();
  if (Date.now() - createdAt < AUTO_APPROVE_DELAY_MS) {
    const remaining = Math.ceil((AUTO_APPROVE_DELAY_MS - (Date.now() - createdAt)) / 1000);
    return NextResponse.json({ ok: true, status: "pending", remainingSeconds: remaining });
  }

  const items = order.items as Array<{ ticketTypeId: string; lotId: string; quantity: number; unitPrice: number }>;
  for (const item of items) {
    await Promise.all([
      TT.findOneAndUpdate({ _id: item.ticketTypeId }, { $inc: { soldQuantity: item.quantity } }, { new: true }),
      LM.findOneAndUpdate({ _id: item.lotId }, { $inc: { soldQuantity: item.quantity } }, { new: true }),
    ]);
  }

  // Atomic: only one concurrent call wins the pending→paid transition
  const O2 = Order as unknown as {
    findOneAndUpdate(filter: any, update: any, options: any): any;
  };
  const claimed = await O2.findOneAndUpdate(
    { _id: id, status: "pending" },
    { $set: { status: "paid", paidAt: new Date() } },
    { new: true },
  ).lean();

  if (!claimed) {
    return NextResponse.json({ ok: true, status: "paid" });
  }

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      const code = generateCode();
      await createTicket({
        orderId: order._id,
        eventId: order.eventId,
        ticketTypeId: item.ticketTypeId,
        ownerId: order.buyerId,
        code,
        secret: generateSecret(code, order.buyerId),
        status: "valid",
      });
    }
  }

  void (async () => {
    try {
      const [buyer, event] = await Promise.all([
        findUserById(String(order.buyerId)),
        findEvent(String(order.eventId)),
      ]);
      if (buyer && event) {
        await sendOrderConfirmationEmail({
          to: buyer.email,
          name: buyer.name,
          eventTitle: event.title,
          orderId: String(order._id),
          totalAmount: order.totalAmount,
        });
      }
    } catch {
      // email is best-effort
    }
  })();

  return NextResponse.json({ ok: true, status: "paid" });
}
