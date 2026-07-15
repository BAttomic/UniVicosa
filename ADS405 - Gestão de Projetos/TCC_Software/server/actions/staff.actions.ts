"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth, canManageEvent } from "@/lib/event-access";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { addStaff, removeStaff } from "@/modules/events/repositories/event-staff.repository";
import { findByEmail } from "@/modules/identity/repositories/user.repository";
import { recordAuditLog } from "@/lib/audit";

const AddOperatorSchema = z.object({
  email: z.string().email(),
});

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function authorizeManage(eventId: string) {
  const session = await requireAuth();
  const event = await findEvent(eventId);
  if (!event) {
    throw new NotFoundError("Event", eventId);
  }
  if (!canManageEvent(event, session)) {
    throw new UnauthorizedError("Voce nao tem permissao para gerenciar a equipe deste evento.");
  }
  return { session, event };
}

export async function addEventOperatorAction(eventId: string, formData: FormData) {
  let status: string;
  try {
    const { session, event } = await authorizeManage(eventId);

    const parsed = AddOperatorSchema.safeParse({ email: getValue(formData, "email").toLowerCase() });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "E-mail invalido.");
    }

    const user = await findByEmail(parsed.data.email);
    if (!user) {
      throw new NotFoundError("User", parsed.data.email);
    }
    if (String(user._id) === String(event.organizerId)) {
      throw new Error("Este usuario ja e o organizador do evento.");
    }

    await addStaff({ eventId, userId: String(user._id), addedBy: session.user.id });
    await recordAuditLog({
      action: "event.operator_added",
      actorId: session.user.id,
      targetType: "event",
      targetId: eventId,
      metadata: { operatorId: String(user._id), operatorEmail: parsed.data.email },
    });
    status = `${user.name} agora e operador deste evento.`;
  } catch (error) {
    status = error instanceof Error ? error.message : "Nao foi possivel adicionar o operador.";
  }

  redirect(`/organizer/eventos/${eventId}/equipe?status=${encodeURIComponent(status)}`);
}

export async function removeEventOperatorAction(eventId: string, userId: string) {
  let status: string;
  try {
    const { session } = await authorizeManage(eventId);
    await removeStaff(eventId, userId);
    await recordAuditLog({
      action: "event.operator_removed",
      actorId: session.user.id,
      targetType: "event",
      targetId: eventId,
      metadata: { operatorId: userId },
    });
    status = "Operador removido do evento.";
  } catch (error) {
    status = error instanceof Error ? error.message : "Nao foi possivel remover o operador.";
  }

  redirect(`/organizer/eventos/${eventId}/equipe?status=${encodeURIComponent(status)}`);
}
