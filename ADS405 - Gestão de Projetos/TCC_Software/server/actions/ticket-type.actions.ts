"use server";

import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { create as createTicketType, update as updateTicketType, findById as findTicketTypeById } from "@/modules/events/repositories/ticket-type.repository";
import { create as createLot, update as updateLot, findById as findLotById } from "@/modules/events/repositories/lot.repository";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { redirect } from "next/navigation";

const TicketTypeSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0),
  totalQuantity: z.coerce.number().int().min(1),
  maxPerOrder: z.coerce.number().int().min(1).max(20).default(5),
});

const LotSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.coerce.number().int().min(0),
  quantity: z.coerce.number().int().min(1),
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
});

function getValue(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function redirectWithStatus(eventId: string, status: string) {
  redirect(`/organizer/eventos/${eventId}/ingressos?status=${encodeURIComponent(status)}`);
}

async function assertOrganizerOwnsEvent(eventId: string) {
  const session = await requireAuth();
  await connectDB();
  const event = await findEvent(eventId);
  if (!event) throw new NotFoundError("Event", eventId);
  if (!canManageEvent(event, session)) {
    throw new UnauthorizedError("Sem permissão para este evento.");
  }
  return { session, event };
}

export async function createTicketTypeAction(eventId: string, formData: FormData) {
  try {
    await assertOrganizerOwnsEvent(eventId);

    const parsed = TicketTypeSchema.safeParse({
      name: getValue(formData, "name"),
      description: getValue(formData, "description"),
      price: getValue(formData, "price"),
      totalQuantity: getValue(formData, "totalQuantity"),
      maxPerOrder: getValue(formData, "maxPerOrder"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    await createTicketType({
      eventId,
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      price: parsed.data.price,
      totalQuantity: parsed.data.totalQuantity,
      soldQuantity: 0,
      maxPerOrder: parsed.data.maxPerOrder,
    });

    redirectWithStatus(eventId, "Tipo de ingresso criado com sucesso.");
  } catch (error) {
    redirectWithStatus(eventId, error instanceof Error ? error.message : "Erro ao criar tipo de ingresso.");
  }
}

export async function updateTicketTypeAction(eventId: string, ticketTypeId: string, formData: FormData) {
  try {
    await assertOrganizerOwnsEvent(eventId);

    const parsed = TicketTypeSchema.safeParse({
      name: getValue(formData, "name"),
      description: getValue(formData, "description"),
      price: getValue(formData, "price"),
      totalQuantity: getValue(formData, "totalQuantity"),
      maxPerOrder: getValue(formData, "maxPerOrder"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    await updateTicketType(ticketTypeId, {
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      price: parsed.data.price,
      totalQuantity: parsed.data.totalQuantity,
      maxPerOrder: parsed.data.maxPerOrder,
    });

    redirectWithStatus(eventId, "Tipo de ingresso atualizado.");
  } catch (error) {
    redirectWithStatus(eventId, error instanceof Error ? error.message : "Erro ao atualizar.");
  }
}

export async function createLotAction(eventId: string, ticketTypeId: string, formData: FormData) {
  try {
    await assertOrganizerOwnsEvent(eventId);

    const tt = await findTicketTypeById(ticketTypeId);
    if (!tt || tt.eventId !== eventId) throw new NotFoundError("TicketType", ticketTypeId);

    const parsed = LotSchema.safeParse({
      name: getValue(formData, "name"),
      price: getValue(formData, "price"),
      quantity: getValue(formData, "quantity"),
      startsAt: getValue(formData, "startsAt"),
      endsAt: getValue(formData, "endsAt"),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    await createLot({
      ticketTypeId,
      name: parsed.data.name,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      soldQuantity: 0,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
      active: true,
    });

    redirectWithStatus(eventId, "Lote criado com sucesso.");
  } catch (error) {
    redirectWithStatus(eventId, error instanceof Error ? error.message : "Erro ao criar lote.");
  }
}

export async function toggleLotAction(eventId: string, lotId: string, active: boolean) {
  try {
    await assertOrganizerOwnsEvent(eventId);
    const lot = await findLotById(lotId);
    if (!lot) throw new NotFoundError("Lot", lotId);
    await updateLot(lotId, { active });
    redirectWithStatus(eventId, active ? "Lote ativado." : "Lote desativado.");
  } catch (error) {
    redirectWithStatus(eventId, error instanceof Error ? error.message : "Erro ao atualizar lote.");
  }
}
