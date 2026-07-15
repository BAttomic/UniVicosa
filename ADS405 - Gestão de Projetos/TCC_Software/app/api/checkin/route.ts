import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { findByCode, markUsed } from "@/modules/tickets/repositories/ticket.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { canCheckinEvent } from "@/lib/event-access";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { env } from "@/lib/env";

function verifyHmac(ticketCode: string, ownerId: string, providedSecret: string): boolean {
  const windowSeconds = 30;
  const nowWindow = Math.floor(Date.now() / (windowSeconds * 1000));

  for (const w of [nowWindow, nowWindow - 1]) {
    const expected = crypto
      .createHmac("sha256", env.TICKET_HMAC_SECRET)
      .update(`${ticketCode}:${ownerId}:${w}`)
      .digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(providedSecret.padEnd(64, "0").slice(0, 64), "hex"))) {
      return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  let body: { code?: string; secret?: string; deviceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Payload inválido." }, { status: 400 });
  }

  const { code, secret, deviceId } = body;
  if (!code || !secret) {
    return NextResponse.json({ ok: false, message: "Código e secret são obrigatórios." }, { status: 400 });
  }

  await connectDB();

  const ticket = await findByCode(code);
  if (!ticket) {
    return NextResponse.json({ ok: false, message: "Ingresso não encontrado." }, { status: 404 });
  }

  const event = await findEvent(ticket.eventId);
  if (!event || !(await canCheckinEvent(event, ticket.eventId, session))) {
    return NextResponse.json({ ok: false, message: "Você não tem permissão para validar este evento." }, { status: 403 });
  }

  if (ticket.status === "used") {
    return NextResponse.json(
      {
        ok: false,
        message: "Ingresso já utilizado.",
        usedAt: ticket.usedAt,
      },
      { status: 409 },
    );
  }

  if (ticket.status === "cancelled") {
    return NextResponse.json({ ok: false, message: "Ingresso cancelado." }, { status: 409 });
  }

  if (!verifyHmac(ticket.code, ticket.ownerId, secret)) {
    return NextResponse.json({ ok: false, message: "QR Code inválido ou expirado. Peça para o comprador abrir o ingresso novamente." }, { status: 422 });
  }

  const operatorId = session.user.id;
  await markUsed(ticket._id, operatorId);

  await CheckinLog.create({
    ticketId: ticket._id,
    operatorId,
    eventId: ticket.eventId,
    occurredAt: new Date(),
    offline: false,
    deviceId: deviceId ?? "web",
  });

  return NextResponse.json({
    ok: true,
    message: "Check-in realizado com sucesso!",
    ticket: {
      code: ticket.code,
      eventId: ticket.eventId,
    },
  });
}
