import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findByEventId } from "@/modules/tickets/repositories/ticket.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { canCheckinEvent } from "@/lib/event-access";

// Downloads the offline allowlist (codes of VALID tickets) for one event so the
// operator device can validate scans without connectivity.
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ ok: false, message: "eventId é obrigatório." }, { status: 400 });
  }

  await connectDB();

  const event = await findEvent(eventId);
  if (!event) {
    return NextResponse.json({ ok: false, message: "Evento não encontrado." }, { status: 404 });
  }

  // Only the event owner or an assigned operator may download (admins excluded).
  if (!(await canCheckinEvent(event, eventId, session))) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 403 });
  }

  const tickets = await findByEventId(eventId);
  const codes = (tickets as Array<{ code: string; status: string }>)
    .filter((t) => t.status === "valid")
    .map((t) => t.code);

  return NextResponse.json({
    ok: true,
    eventId,
    eventTitle: event.title,
    codes,
    downloadedAt: new Date().toISOString(),
  });
}
