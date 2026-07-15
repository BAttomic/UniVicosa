import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { findById } from "@/modules/identity/repositories/user.repository";
import { findByBuyerId } from "@/modules/orders/repositories/order.repository";
import { findByOwnerId } from "@/modules/tickets/repositories/ticket.repository";

export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await connectDB();
  const userId = session.user.id;

  const [user, orders, tickets] = await Promise.all([
    findById(userId),
    findByBuyerId(userId),
    findByOwnerId(userId),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      phone: user?.phone ?? null,
      role: user?.role,
      createdAt: user?.createdAt,
    },
    orders: orders.map((o: any) => ({
      id: o._id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    })),
    tickets: tickets.map((t: any) => ({
      code: t.code,
      status: t.status,
      eventId: t.eventId,
      createdAt: t.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="meus-dados-ticketflow.json"`,
    },
  });
}
