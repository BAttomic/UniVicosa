"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { findById as findEvent } from "@/modules/events/repositories/event.repository";
import { joinByAccount } from "@/modules/events/repositories/waitlist.repository";

export type WaitlistActionState = {
  ok: boolean;
  message: string;
  position?: number;
  total?: number;
  needsLogin?: boolean;
};

// Fila FIFO por conta: só entra quem está logado; a posição fica vinculada à conta.
// Não coletamos nome/e-mail/telefone — usamos os dados da própria conta.
export async function joinWaitlistAction(
  eventId: string,
  _state: WaitlistActionState,
  _formData: FormData,
): Promise<WaitlistActionState> {
  try {
    await connectDB();

    const event = await findEvent(eventId);
    if (!event) {
      throw new NotFoundError("Event", eventId);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return { ok: false, needsLogin: true, message: "Entre na sua conta para entrar na fila de pré-venda." };
    }

    const name = session.user.name?.trim() || "Participante";
    const email = session.user.email?.trim().toLowerCase();
    if (!email) {
      throw new Error("Sua conta não tem e-mail para notificação.");
    }

    const { position, total } = await joinByAccount({
      eventId,
      userId: session.user.id,
      name,
      email,
    });

    return {
      ok: true,
      position,
      total,
      message: "Você entrou na fila de pré-venda. Acompanhe a sua posição aqui na plataforma; quando as vendas abrirem, você terá prioridade pela ordem de chegada.",
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Não foi possível entrar na fila." };
  }
}
