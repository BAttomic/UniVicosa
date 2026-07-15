import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findByEventId as findTickets } from "@/modules/tickets/repositories/ticket.repository";
import { findByEventId as findTicketTypes } from "@/modules/events/repositories/ticket-type.repository";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { findById as findUser } from "@/modules/identity/repositories/user.repository";
import { canCheckinEvent } from "@/lib/event-access";

const STATUS_LABEL: Record<string, string> = {
  valid: "Válido",
  used: "Utilizado",
  cancelled: "Cancelado",
};

function csvCell(value: string): string {
  const needsQuotes = /[",\n;]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "evento";
}

// Human-readable buyer list (CSV) for the operator to cross-check entries
// offline. Authorized exactly like the offline manifest (owner/operator only).
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

  if (!(await canCheckinEvent(event, eventId, session))) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 403 });
  }

  const [tickets, ticketTypes] = await Promise.all([
    findTickets(eventId) as Promise<Array<{ code: string; status: string; ownerId: string; ticketTypeId: string }>>,
    findTicketTypes(eventId) as Promise<Array<{ _id: string; name: string }>>,
  ]);

  const typeNameById = new Map(ticketTypes.map((type) => [String(type._id), type.name]));

  // Resolve owners once each.
  const ownerIds = [...new Set(tickets.map((ticket) => String(ticket.ownerId)))];
  const owners = await Promise.all(ownerIds.map((id) => findUser(id)));
  const ownerById = new Map(ownerIds.map((id, index) => [id, owners[index]]));

  const sortedTickets = [...tickets].sort((left, right) => {
    const leftName = ownerById.get(String(left.ownerId))?.name ?? "";
    const rightName = ownerById.get(String(right.ownerId))?.name ?? "";
    return leftName.localeCompare(rightName, "pt-BR");
  });

  const header = ["Nome", "Email", "Tipo", "Codigo", "Status"];
  const rows = sortedTickets.map((ticket) => {
    const owner = ownerById.get(String(ticket.ownerId));
    return [
      owner?.name ?? "Desconhecido",
      owner?.email ?? "",
      typeNameById.get(String(ticket.ticketTypeId)) ?? "—",
      ticket.code,
      STATUS_LABEL[ticket.status] ?? ticket.status,
    ];
  });

  // Prepend BOM so Excel opens UTF-8 accents correctly.
  const csv = "﻿" + [header, ...rows].map((cells) => cells.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="compradores-${slugifyFilename(event.title)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
