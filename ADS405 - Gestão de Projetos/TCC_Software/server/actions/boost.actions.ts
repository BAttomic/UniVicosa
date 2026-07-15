"use server";

import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { findById as findEvent, update as updateEvent } from "@/modules/events/repositories/event.repository";
import { create as createBoost } from "@/modules/events/repositories/boost.repository";
import { BOOST_PACKAGES } from "@/lib/boost-packages";

export type BoostActionState = {
  ok: boolean;
  message: string;
};

const BoostSchema = z.object({
  packageId: z.enum(["essencial", "avancado", "maximo"]),
  paymentMethod: z.enum(["pix", "credit_card", "boleto"]).default("pix"),
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Organizador (ou admin) impulsiona o próprio evento. Pagamento simulado, igual
// ao checkout de ingressos: confirma na hora e coloca o evento em destaque.
export async function boostEventAction(
  eventId: string,
  _state: BoostActionState,
  formData: FormData,
): Promise<BoostActionState> {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new UnauthorizedError("Você precisa estar autenticado.");
    }

    await connectDB();

    const event = await findEvent(eventId);
    if (!event) {
      throw new NotFoundError("Event", eventId);
    }
    if (session.user.role !== "admin" && event.organizerId !== session.user.id) {
      throw new UnauthorizedError("Você não tem permissão para impulsionar este evento.");
    }

    const parsed = BoostSchema.safeParse({
      packageId: getString(formData, "packageId"),
      paymentMethod: getString(formData, "paymentMethod"),
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Selecione um pacote válido.");
    }

    const pkg = BOOST_PACKAGES.find((item) => item.id === parsed.data.packageId)!;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

    await createBoost({
      eventId,
      organizerId: event.organizerId,
      packageId: pkg.id,
      packageLabel: pkg.label,
      amount: pkg.amount,
      durationDays: pkg.durationDays,
      status: "active",
      paymentIntentId: `boost_${crypto.randomUUID()}`,
      startsAt: now,
      expiresAt,
    });

    // O destaque na home/listagem é dirigido pelo campo featured do evento.
    await updateEvent(eventId, { featured: true });

    return {
      ok: true,
      message: `Evento impulsionado com o pacote ${pkg.label}! Ele já aparece em destaque.`,
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Não foi possível impulsionar o evento." };
  }
}
