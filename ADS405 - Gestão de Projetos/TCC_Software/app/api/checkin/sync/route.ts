import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findByCode, markUsed } from "@/modules/tickets/repositories/ticket.repository";
import { findByOrganizerId } from "@/modules/events/repositories/event.repository";
import { findEventIdsForUser } from "@/modules/events/repositories/event-staff.repository";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";

type SyncItem = {
  code?: string;
  eventId?: string;
  occurredAt?: string;
  deviceId?: string;
};

type SyncResult = {
  code: string;
  status: "synced" | "already_used" | "not_found" | "cancelled" | "unauthorized";
  occurredAt?: string;
};

// Flushes a batch of check-ins captured offline. The server re-validates each
// ticket and enforces single-use atomically (valid -> used); the rotating HMAC
// is intentionally not re-checked here because its 30s window is long gone by
// sync time. Conflicts (already used elsewhere) are reported back per item.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "admin") {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  let body: { items?: SyncItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Payload inválido." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false, message: "Nenhum check-in para sincronizar." }, { status: 400 });
  }

  await connectDB();
  const operatorId = session.user.id;
  const results: SyncResult[] = [];

  // Events this user may check in: events they own + events they operate.
  const ownedEvents = await findByOrganizerId(operatorId);
  const operatorEventIds = await findEventIdsForUser(operatorId);
  const allowedEventIds = new Set<string>([...ownedEvents.map((event) => String(event._id)), ...operatorEventIds]);

  for (const item of body.items) {
    if (!item.code) continue;

    const ticket = await findByCode(item.code);
    if (!ticket) {
      results.push({ code: item.code, status: "not_found" });
      continue;
    }
    if (!allowedEventIds.has(String(ticket.eventId))) {
      results.push({ code: item.code, status: "unauthorized" });
      continue;
    }
    if (ticket.status === "cancelled") {
      results.push({ code: item.code, status: "cancelled" });
      continue;
    }
    if (ticket.status === "used") {
      results.push({ code: item.code, status: "already_used", occurredAt: ticket.usedAt });
      continue;
    }

    const claimed = await markUsed(ticket._id, operatorId);
    if (!claimed) {
      // Lost the race to a concurrent (online) check-in.
      results.push({ code: item.code, status: "already_used" });
      continue;
    }

    const occurredAt = item.occurredAt ? new Date(item.occurredAt) : new Date();
    await CheckinLog.create({
      ticketId: ticket._id,
      operatorId,
      eventId: ticket.eventId,
      occurredAt,
      offline: true,
      deviceId: item.deviceId ?? "offline-scanner",
    });

    results.push({ code: item.code, status: "synced", occurredAt: occurredAt.toISOString() });
  }

  const synced = results.filter((r) => r.status === "synced").length;
  const conflicts = results.length - synced;

  return NextResponse.json({ ok: true, synced, conflicts, results });
}
